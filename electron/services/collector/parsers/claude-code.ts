import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import { BaseCollector, type ParsedConversation, type CollectorConfig } from '../base';
import { logger } from '../../logger';

export class ClaudeCodeCollector extends BaseCollector {
  readonly name = 'Claude Code';
  readonly source = 'claude-code';

  constructor(config?: Partial<CollectorConfig>) {
    super({
      name: 'Claude Code',
      source: 'claude-code',
      enabled: true,
      paths: [join(homedir(), '.claude', 'projects')],
      filePatterns: ['.jsonl'],
      ...config,
    });
  }

  getDefaultPaths(): string[] {
    return [join(homedir(), '.claude', 'projects')];
  }

  async discoverFiles(): Promise<string[]> {
    const files: string[] = [];
    const basePath = this.config.paths[0];

    if (!existsSync(basePath)) return files;

    try {
      const projects = readdirSync(basePath);
      for (const project of projects) {
        const projectDir = join(basePath, project);
        const stat = statSync(projectDir);
        if (!stat.isDirectory()) continue;

        // JSONL 文件可能直接在项目目录中，也可能在 conversations/ 子目录中
        const jsonlInRoot = readdirSync(projectDir).filter((f) => f.endsWith('.jsonl'));
        for (const file of jsonlInRoot) {
          files.push(join(projectDir, file));
        }

        const convDir = join(projectDir, 'conversations');
        if (existsSync(convDir)) {
          const convFiles = readdirSync(convDir).filter((f) => f.endsWith('.jsonl'));
          for (const file of convFiles) {
            files.push(join(convDir, file));
          }
        }
      }
    } catch (error: any) {
      logger.error('claude-code', 'Failed to discover files:', error.message);
    }

    return files;
  }

  async parseFile(filePath: string): Promise<ParsedConversation | null> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());

      if (lines.length === 0) return null;

      const messages: ParsedConversation['messages'] = [];
      let firstTimestamp: string | undefined;

      for (const line of lines) {
        try {
          const item = JSON.parse(line);

          if (item.type !== 'human' && item.type !== 'assistant') continue;

          const role = item.type === 'human' ? ('user' as const) : ('assistant' as const);
          let msgContent: string;

          if (typeof item.content === 'string') {
            msgContent = item.content;
          } else if (Array.isArray(item.content)) {
            msgContent = item.content
              .filter((c: any) => c.type === 'text')
              .map((c: any) => c.text)
              .join('\n');
          } else {
            continue;
          }

          if (!msgContent.trim()) continue;

          if (!firstTimestamp && item.timestamp) {
            firstTimestamp = item.timestamp;
          }

          messages.push({
            role,
            content: msgContent,
            timestamp: item.timestamp,
          });
        } catch {
          // skip malformed lines
        }
      }

      if (messages.length === 0) return null;

      const pathParts = filePath.split('/');
      const projectHash = pathParts[pathParts.indexOf('projects') + 1] || '';
      const stats = statSync(filePath);

      return {
        source: 'claude-code',
        externalId: basename(filePath, '.jsonl'),
        messages,
        metadata: {
          filePath,
          project: projectHash,
          workspace: projectHash,
        },
        createdAt: firstTimestamp || stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString(),
      };
    } catch (error: any) {
      logger.error('claude-code', `Failed to parse ${filePath}:`, error.message);
      return null;
    }
  }
}
