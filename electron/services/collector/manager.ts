import { registry } from './registry';
import { FileWatcher } from './watcher';
import { conversationsDB } from '../database/conversations';
import { syncStateDB } from '../database/sync-state';
import { getDatabase } from '../database';
import { logger } from '../logger';
import type { ParsedConversation } from './base';
import { statSync } from 'fs';

export type CollectorStatus = 'running' | 'paused' | 'stopped';

export interface CollectorSourceStatus {
  source: string;
  name: string;
  enabled: boolean;
  watching: boolean;
  todayCount: number;
}

class CollectorManager {
  private watcher: FileWatcher;
  private status: CollectorStatus = 'stopped';

  constructor() {
    this.watcher = new FileWatcher();
  }

  async start() {
    const collectors = registry.getEnabled();

    for (const collector of collectors) {
      try {
        const paths = collector.getDefaultPaths();

        collector.on('new-conversation', (conv: ParsedConversation) => {
          this.handleNewConversation(conv);
        });

        collector.on('updated-conversation', (conv: ParsedConversation) => {
          this.handleUpdatedConversation(conv);
        });

        this.watcher.startWatching(collector, paths);
      } catch (error: any) {
        logger.error('collector-manager', `Failed to start ${collector.source}:`, error.message);
      }
    }

    this.status = 'running';
    logger.info('collector-manager', `Started with ${collectors.length} collectors`);

    // 首次启动自动全量扫描
    this.fullScan();
  }

  pause() {
    this.watcher.stopAll();
    this.status = 'paused';
    logger.info('collector-manager', 'Paused');
  }

  resume() {
    this.start();
  }

  stop() {
    this.watcher.stopAll();
    for (const collector of registry.getAll()) {
      collector.removeAllListeners();
    }
    this.status = 'stopped';
    logger.info('collector-manager', 'Stopped');
  }

  getStatus(): CollectorStatus {
    return this.status;
  }

  getSourceStatuses(): CollectorSourceStatus[] {
    return registry.getAll().map((collector) => ({
      source: collector.source,
      name: collector.name,
      enabled: collector.enabled,
      watching: this.watcher.isWatching(collector.source),
      todayCount: this.getTodayCount(collector.source),
    }));
  }

  async fullScan() {
    logger.info('collector-manager', 'Starting full scan...');
    const collectors = registry.getEnabled();
    let totalNew = 0;

    for (const collector of collectors) {
      const files = await collector.discoverFiles();
      logger.info('collector-manager', `${collector.source}: found ${files.length} files`);

      for (const file of files) {
        try {
          const stats = statSync(file);
          const lastModified = stats.mtime.toISOString();

          if (!syncStateDB.hasChanged(file, lastModified)) continue;

          const conv = await collector.parseFile(file);
          if (conv) {
            this.handleNewConversation(conv);
            totalNew++;
          }
        } catch (error: any) {
          logger.warn('collector-manager', `Skipping ${file}: ${error.message}`);
        }
      }
    }

    logger.info('collector-manager', `Full scan complete: ${totalNew} new conversations`);
    return { total: totalNew };
  }

  private handleNewConversation(conv: ParsedConversation) {
    try {
      const existing = syncStateDB.get(conv.metadata.filePath);
      if (existing?.conversation_id) {
        this.handleUpdatedConversation(conv);
        return;
      }

      const created = conversationsDB.create({
        source: conv.source,
        title: conv.title,
        rawContent: conv.messages,
        metadata: conv.metadata,
      });

      syncStateDB.upsert(conv.metadata.filePath, conv.source, conv.updatedAt, created.id);

      logger.info(
        'collector-manager',
        `New conversation from ${conv.source}: ${created.title || created.id}`,
      );
    } catch (error: any) {
      logger.error('collector-manager', 'Failed to save conversation:', error.message);
    }
  }

  private handleUpdatedConversation(conv: ParsedConversation) {
    try {
      const syncState = syncStateDB.get(conv.metadata.filePath);
      if (!syncState?.conversation_id) {
        this.handleNewConversation(conv);
        return;
      }

      syncStateDB.upsert(
        conv.metadata.filePath,
        conv.source,
        conv.updatedAt,
        syncState.conversation_id,
      );
    } catch (error: any) {
      logger.error('collector-manager', 'Failed to update conversation:', error.message);
    }
  }

  private getTodayCount(source: string): number {
    try {
      const db = getDatabase();
      const today = new Date().toISOString().split('T')[0];
      const row = db
        .prepare(
          `SELECT COUNT(*) as count FROM conversations WHERE source = ? AND imported_at >= ?`,
        )
        .get(source, today) as { count: number };
      return row.count;
    } catch {
      return 0;
    }
  }
}

export const collectorManager = new CollectorManager();
