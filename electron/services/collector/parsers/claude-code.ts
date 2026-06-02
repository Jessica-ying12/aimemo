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
      this.walkDir(basePath, files, 0);
    } catch (error: any) {
      logger.error('claude-code', 'Failed to discover files:', error.message);
    }

    return files;
  }

  private walkDir(dir: string, files: string[], depth: number) {
    if (depth > 4) return;
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          this.walkDir(fullPath, files, depth + 1);
        } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
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

      if (lines.length === 0) return null;

      const messages: ParsedConversation['messages'] = [];
      let firstTimestamp: string | undefined;
      let title: string | undefined;

      for (const line of lines) {
        try {
          const item = JSON.parse(line);

          // 提取 AI 生成的标题
          if (item.type === 'ai-title' && item.aiTitle) {
            title = item.aiTitle;
            continue;
          }

          // 只处理 user 和 assistant 消息
          if (item.type !== 'user' && item.type !== 'assistant') continue;

          const role = item.type === 'user' ? ('user' as const) : ('assistant' as const);
          let msgContent: string;

          // 用户消息：message.content 是字符串
          // AI 消息：message.content 是数组 [{type:"text",text:"..."}]
          const messageObj = item.message || item;
          const content = messageObj.content;

          if (typeof content === 'string') {
            msgContent = content;
          } else if (Array.isArray(content)) {
            // 只取 text 类型（用户可见的回复），跳过 thinking（内部思考）和 tool_use
            const textParts = content.filter((c: any) => c.type === 'text').map((c: any) => c.text);
            if (textParts.length > 0) {
              msgContent = textParts.join('\n');
            } else {
              // 没有 text 内容的 assistant 消息跳过（纯 thinking 或纯 tool_use）
              continue;
            }
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
        title,
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
