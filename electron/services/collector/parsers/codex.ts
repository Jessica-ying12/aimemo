import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import { BaseCollector, type ParsedConversation, type CollectorConfig } from '../base';
import { logger } from '../../logger';

export class CodexCollector extends BaseCollector {
  readonly name = 'Codex';
  readonly source = 'codex';

  constructor(config?: Partial<CollectorConfig>) {
    super({
      name: 'Codex',
      source: 'codex',
      enabled: true,
      paths: [join(homedir(), '.codex')],
      filePatterns: ['.json', '.jsonl'],
      ...config,
    });
  }

  getDefaultPaths(): string[] {
    return [join(homedir(), '.codex')];
  }

  async discoverFiles(): Promise<string[]> {
    const files: string[] = [];
    const basePath = this.config.paths[0];
    if (!existsSync(basePath)) return files;

    this.walkDir(basePath, files, 0);
    return files;
  }

  private walkDir(dir: string, files: string[], depth: number) {
    if (depth > 5) return;
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
      // permission error, skip
    }
  }

  async parseFile(filePath: string): Promise<ParsedConversation | null> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());
      const messages: ParsedConversation['messages'] = [];

      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          if (item.role === 'user' || item.role === 'assistant') {
            messages.push({
              role: item.role,
              content:
                typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
              timestamp: item.timestamp,
            });
          }
        } catch {
          // skip
        }
      }

      if (messages.length === 0) return null;

      const stats = statSync(filePath);
      return {
        source: 'codex',
        externalId: basename(filePath).replace(/\.\w+$/, ''),
        messages,
        metadata: { filePath },
        createdAt: stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString(),
      };
    } catch (error: any) {
      logger.debug('codex', `Skipping ${filePath}: ${error.message}`);
      return null;
    }
  }
}
