import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { logger } from '../logger';

export interface DetectedTool {
  name: string;
  source: string;
  detected: boolean;
  paths: string[];
  description: string;
}

export function detectInstalledTools(): DetectedTool[] {
  const home = homedir();
  const appSupport = join(home, 'Library', 'Application Support');

  const tools: DetectedTool[] = [
    {
      name: 'Claude Code',
      source: 'claude-code',
      detected: existsSync(join(home, '.claude')),
      paths: [join(home, '.claude', 'projects')],
      description: 'Anthropic CLI 开发工具',
    },
    {
      name: 'Codex',
      source: 'codex',
      detected: existsSync(join(home, '.codex')),
      paths: [join(home, '.codex')],
      description: 'OpenAI CLI 开发工具',
    },
    {
      name: 'Cursor',
      source: 'cursor',
      detected: existsSync(join(appSupport, 'Cursor')),
      paths: [join(appSupport, 'Cursor')],
      description: 'AI IDE',
    },
    {
      name: 'Kiro',
      source: 'kiro',
      detected: existsSync(join(home, '.kiro')) || existsSync(join(appSupport, 'Kiro')),
      paths: [join(home, '.kiro'), join(appSupport, 'Kiro')].filter((p) => existsSync(p)),
      description: 'AWS AI IDE',
    },
    {
      name: 'Trea',
      source: 'trea',
      detected: existsSync(join(appSupport, 'Trea')),
      paths: [join(appSupport, 'Trea')],
      description: '字节跳动 AI IDE',
    },
  ];

  logger.info(
    'detector',
    `Detected tools: ${
      tools
        .filter((t) => t.detected)
        .map((t) => t.name)
        .join(', ') || 'none'
    }`,
  );

  return tools;
}
