import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import { BaseCollector, type ParsedConversation, type CollectorConfig } from '../base';
import { logger } from '../../logger';

export class KiroCollector extends BaseCollector {
  readonly name = 'Kiro';
  readonly source = 'kiro';

  constructor(config?: Partial<CollectorConfig>) {
    super({
      name: 'Kiro',
      source: 'kiro',
      enabled: true,
      paths: [join(homedir(), '.kiro')],
      filePatterns: ['.json', '.jsonl'],
      ...config,
    });
  }

  getDefaultPaths(): string[] {
    const home = homedir();
    return [join(home, '.kiro'), join(home, 'Library', 'Application Support', 'Kiro')].filter((p) =>
      existsSync(p),
    );
  }

  async discoverFiles(): Promise<string[]> {
    const files: string[] = [];
    for (const basePath of this.config.paths) {
      if (!existsSync(basePath)) continue;
      this.walkDir(basePath, files, 0);
    }
    return files;
  }

  private walkDir(dir: string, files: string[], depth: number) {
    if (depth > 5) return;
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          this.walkDir(fullPath, files, depth + 1);
        } else if (entry.isFile() && this.isRelevantFile(entry.name)) {
          files.push(fullPath);
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
      const messages = this.tryExtractMessages(data);
      if (messages.length === 0) return null;

      const stats = statSync(filePath);
      return {
        source: 'kiro',
        externalId: basename(filePath, '.json'),
        messages,
        metadata: { filePath },
        createdAt: stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString(),
      };
    } catch (error: any) {
      logger.debug('kiro', `Skipping ${filePath}: ${error.message}`);
      return null;
    }
  }

  private tryExtractMessages(data: any): ParsedConversation['messages'] {
    if (Array.isArray(data)) {
      return data
        .filter((item) => item.role && item.content)
        .map((item) => ({
          role: (item.role === 'user' || item.role === 'human' ? 'user' : 'assistant') as
            | 'user'
            | 'assistant',
          content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
        }));
    }
    if (data.messages) return this.tryExtractMessages(data.messages);
    if (data.conversation) return this.tryExtractMessages(data.conversation);
    return [];
  }
}

export class TreaCollector extends BaseCollector {
  readonly name = 'Trea';
  readonly source = 'trea';

  constructor(config?: Partial<CollectorConfig>) {
    super({
      name: 'Trea',
      source: 'trea',
      enabled: true,
      paths: [join(homedir(), 'Library', 'Application Support', 'Trea')],
      filePatterns: ['.json', '.jsonl'],
      ...config,
    });
  }

  getDefaultPaths(): string[] {
    return [join(homedir(), 'Library', 'Application Support', 'Trea')];
  }

  async discoverFiles(): Promise<string[]> {
    const files: string[] = [];
    const basePath = this.config.paths[0];
    if (!existsSync(basePath)) return files;

    this.walkDir(basePath, files, 0);
    return files;
  }

  private walkDir(dir: string, files: string[], depth: number) {
    if (depth > 4) return;
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          this.walkDir(fullPath, files, depth + 1);
        } else if (entry.isFile() && this.isRelevantFile(entry.name)) {
          files.push(fullPath);
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
      const messages = this.tryExtractMessages(data);
      if (messages.length === 0) return null;

      const stats = statSync(filePath);
      return {
        source: 'trea',
        externalId: basename(filePath, '.json'),
        messages,
        metadata: { filePath },
        createdAt: stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString(),
      };
    } catch (error: any) {
      logger.debug('trea', `Skipping ${filePath}: ${error.message}`);
      return null;
    }
  }

  private tryExtractMessages(data: any): ParsedConversation['messages'] {
    if (Array.isArray(data)) {
      return data
        .filter((item) => item.role && item.content)
        .map((item) => ({
          role: (item.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
        }));
    }
    if (data.messages) return this.tryExtractMessages(data.messages);
    return [];
  }
}
