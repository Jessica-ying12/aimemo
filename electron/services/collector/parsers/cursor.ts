import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import { BaseCollector, type ParsedConversation, type CollectorConfig } from '../base';
import { logger } from '../../logger';

export class CursorCollector extends BaseCollector {
  readonly name = 'Cursor';
  readonly source = 'cursor';

  constructor(config?: Partial<CollectorConfig>) {
    const appSupport = join(homedir(), 'Library', 'Application Support', 'Cursor');
    super({
      name: 'Cursor',
      source: 'cursor',
      enabled: true,
      paths: [appSupport],
      filePatterns: ['.json'],
      ...config,
    });
  }

  getDefaultPaths(): string[] {
    return [join(homedir(), 'Library', 'Application Support', 'Cursor')];
  }

  async discoverFiles(): Promise<string[]> {
    const files: string[] = [];
    const basePath = this.config.paths[0];
    if (!existsSync(basePath)) return files;

    // TODO: 探索 Cursor 实际存储结构后完善
    this.findFiles(basePath, files, 0);
    return files;
  }

  private findFiles(dir: string, files: string[], depth: number) {
    if (depth > 4) return;
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          this.findFiles(fullPath, files, depth + 1);
        } else if (
          entry.isFile() &&
          (entry.name.includes('chat') || entry.name.includes('composer'))
        ) {
          if (entry.name.endsWith('.json')) {
            files.push(fullPath);
          }
        }
      }
    } catch {
      // permission error
    }
  }

  async parseFile(filePath: string): Promise<ParsedConversation | null> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      const messages = this.extractMessages(data);

      if (messages.length === 0) return null;

      const stats = statSync(filePath);
      return {
        source: 'cursor',
        externalId: basename(filePath, '.json'),
        messages,
        metadata: { filePath },
        createdAt: stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString(),
      };
    } catch (error: any) {
      logger.debug('cursor', `Skipping ${filePath}: ${error.message}`);
      return null;
    }
  }

  private extractMessages(data: any): ParsedConversation['messages'] {
    const messages: ParsedConversation['messages'] = [];

    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.role && item.content) {
          messages.push({
            role: item.role === 'user' ? 'user' : 'assistant',
            content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
          });
        }
      }
    } else if (data.messages) {
      return this.extractMessages(data.messages);
    }

    return messages;
  }
}
