import { registry } from './registry';
import { ClaudeCodeCollector } from './parsers/claude-code';
import { detectInstalledTools } from './detector';

export function setupCollectors() {
  const tools = detectInstalledTools();

  const claudeCode = tools.find((t) => t.source === 'claude-code');
  if (claudeCode?.detected) {
    registry.register(
      new ClaudeCodeCollector({
        paths: claudeCode.paths,
      }),
    );
  }
}
