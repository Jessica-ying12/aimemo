import { watch, type FSWatcher } from 'chokidar';
import { existsSync } from 'fs';
import { BaseCollector } from './base';
import { logger } from '../logger';

export class FileWatcher {
  private watchers: Map<string, FSWatcher> = new Map();

  startWatching(collector: BaseCollector, paths: string[]) {
    const validPaths = paths.filter((p) => existsSync(p));

    if (validPaths.length === 0) {
      logger.warn('watcher', `No valid paths for ${collector.source}, skipping`);
      return;
    }

    const watcher = watch(validPaths, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
      depth: 5,
      ignored: ['**/node_modules/**', '**/.git/**'],
    });

    watcher.on('add', (filePath) => this.handleFileEvent(collector, filePath, 'add'));
    watcher.on('change', (filePath) => this.handleFileEvent(collector, filePath, 'change'));
    watcher.on('error', (error) => {
      logger.error('watcher', `Error watching ${collector.source}:`, error.message);
      collector.emit('error', error);
    });

    this.watchers.set(collector.source, watcher);
    logger.info('watcher', `Started watching ${collector.source}: ${validPaths.join(', ')}`);
  }

  private async handleFileEvent(
    collector: BaseCollector,
    filePath: string,
    event: 'add' | 'change',
  ) {
    if (!collector.isRelevantFile(filePath)) return;

    logger.debug('watcher', `File ${event}: ${filePath} (${collector.source})`);

    try {
      const conversation = await collector.parseFile(filePath);
      if (conversation) {
        if (event === 'add') {
          collector.emit('new-conversation', conversation);
        } else {
          collector.emit('updated-conversation', conversation);
        }
      }
    } catch (error: any) {
      logger.error('watcher', `Failed to parse ${filePath}:`, error.message);
    }
  }

  stopWatching(source: string) {
    const watcher = this.watchers.get(source);
    if (watcher) {
      watcher.close();
      this.watchers.delete(source);
      logger.info('watcher', `Stopped watching ${source}`);
    }
  }

  stopAll() {
    for (const [source] of this.watchers) {
      this.stopWatching(source);
    }
  }

  isWatching(source: string): boolean {
    return this.watchers.has(source);
  }
}
