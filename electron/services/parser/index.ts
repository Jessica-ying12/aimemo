import type { Message } from '../../../shared/types';

export interface ParseResult {
  title?: string;
  messages: Message[];
  source: string;
}

export function parseRawText(text: string): ParseResult {
  const lines = text.split('\n');
  const messages: Message[] = [];
  let currentRole: 'user' | 'assistant' = 'user';
  let currentContent = '';

  for (const line of lines) {
    const userMatch = line.match(/^(User|用户|Human|我)[：:]\s*/i);
    const assistantMatch = line.match(/^(Assistant|AI|助手|Claude|GPT)[：:]\s*/i);

    if (userMatch) {
      if (currentContent.trim()) {
        messages.push({ role: currentRole, content: currentContent.trim() });
      }
      currentRole = 'user';
      currentContent = line.slice(userMatch[0].length) + '\n';
    } else if (assistantMatch) {
      if (currentContent.trim()) {
        messages.push({ role: currentRole, content: currentContent.trim() });
      }
      currentRole = 'assistant';
      currentContent = line.slice(assistantMatch[0].length) + '\n';
    } else {
      currentContent += line + '\n';
    }
  }

  if (currentContent.trim()) {
    messages.push({ role: currentRole, content: currentContent.trim() });
  }

  if (messages.length === 0) {
    messages.push({ role: 'user', content: text.trim() });
  }

  return { messages, source: 'manual' };
}

export function parseJSON(content: string): ParseResult {
  const data = JSON.parse(content);

  if (typeof data === 'string' || Array.isArray(data)) {
    const items = Array.isArray(data)
      ? data
      : content
          .split('\n')
          .filter(Boolean)
          .map((l) => JSON.parse(l));
    const messages: Message[] = items
      .filter((item: any) => item.type === 'human' || item.type === 'assistant')
      .map((item: any) => ({
        role: item.type === 'human' ? ('user' as const) : ('assistant' as const),
        content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
      }));
    return { messages, source: 'claude-code' };
  }

  if (data.messages && Array.isArray(data.messages)) {
    return {
      title: data.title,
      messages: data.messages.map((m: any) => ({
        role: m.role || 'user',
        content: m.content || '',
      })),
      source: data.source || 'manual',
    };
  }

  throw new Error('无法识别的 JSON 格式');
}

export function parseMarkdown(content: string): ParseResult {
  return parseRawText(content);
}

export function parseJSONL(content: string): ParseResult {
  const lines = content.split('\n').filter((l) => l.trim());
  const messages: Message[] = [];

  for (const line of lines) {
    try {
      const item = JSON.parse(line);
      if (item.type === 'human' || item.type === 'assistant' || item.role) {
        messages.push({
          role:
            item.type === 'human' || item.role === 'user'
              ? ('user' as const)
              : ('assistant' as const),
          content:
            typeof item.content === 'string'
              ? item.content
              : Array.isArray(item.content)
                ? item.content.map((c: any) => c.text || '').join('\n')
                : JSON.stringify(item.content),
        });
      }
    } catch {
      // skip malformed lines
    }
  }

  return { messages, source: 'claude-code' };
}
