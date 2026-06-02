import { registry } from './registry';
import { ClaudeCodeCollector } from './parsers/claude-code';
import { CodexCollector } from './parsers/codex';
import { CursorCollector } from './parsers/cursor';
import { KiroCollector, TreaCollector } from './parsers/kiro-trea';
import { detectInstalledTools } from './detector';

export function setupCollectors() {
  const tools = detectInstalledTools();

  const claudeCode = tools.find((t) => t.source === 'claude-code');
  if (claudeCode?.detected) {
    registry.register(new ClaudeCodeCollector({ paths: claudeCode.paths }));
  }

  const codex = tools.find((t) => t.source === 'codex');
  if (codex?.detected) {
    registry.register(new CodexCollector({ paths: codex.paths }));
  }

  const cursor = tools.find((t) => t.source === 'cursor');
  if (cursor?.detected) {
    registry.register(new CursorCollector({ paths: cursor.paths }));
  }

  const kiro = tools.find((t) => t.source === 'kiro');
  if (kiro?.detected) {
    registry.register(new KiroCollector({ paths: kiro.paths }));
  }

  const trea = tools.find((t) => t.source === 'trea');
  if (trea?.detected) {
    registry.register(new TreaCollector({ paths: trea.paths }));
  }
}
