import { aiService } from '../ai';
import { conversationsDB } from '../database/conversations';
import { notesDB } from '../database/notes';
import { tagsDB } from '../database/tags';
import { getDatabase } from '../database';
import { logger } from '../logger';
import { PROMPTS } from './prompts';
import type { Conversation } from '../../../shared/types';

function formatConversation(conv: Conversation): string {
  return conv.rawContent
    .slice(0, 20)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 500)}`)
    .join('\n\n');
}

export async function processConversation(conversationId: string) {
  if (!aiService.isAvailable()) {
    logger.warn('processor', 'AI service not available, skipping processing');
    return;
  }

  const conv = conversationsDB.get(conversationId);
  if (!conv) return;

  const formatted = formatConversation(conv);

  try {
    // 1. 生成标题和摘要
    const titleResult = await aiService.chat({
      messages: [
        { role: 'user', content: PROMPTS.titleAndSummary.replace('{conversation}', formatted) },
      ],
      purpose: 'title-summary',
    });

    let title = conv.title;
    let summary = '';
    try {
      const parsed = JSON.parse(titleResult.content);
      title = parsed.title || title;
      summary = parsed.summary || '';
    } catch {
      title = titleResult.content.slice(0, 50);
    }

    // 更新对话标题和摘要
    const db = getDatabase();
    db.prepare('UPDATE conversations SET title = ?, summary = ?, status = ? WHERE id = ?').run(
      title,
      summary,
      'processed',
      conversationId,
    );

    // 2. 生成分类
    const categoryResult = await aiService.chat({
      messages: [
        { role: 'user', content: PROMPTS.categorize.replace('{conversation}', formatted) },
      ],
      purpose: 'categorize',
    });
    const category = categoryResult.content.trim();

    // 3. 生成标签
    const existingTags = tagsDB.list().map((t) => t.name);
    const tagsResult = await aiService.chat({
      messages: [
        {
          role: 'user',
          content: PROMPTS.generateTags
            .replace('{conversation}', formatted)
            .replace('{existingTags}', existingTags.join(', ') || '暂无'),
        },
      ],
      purpose: 'tags',
    });

    let tagNames: string[] = [];
    try {
      tagNames = JSON.parse(tagsResult.content);
    } catch {
      tagNames = [];
    }

    const tagIds = tagNames.map((name) => tagsDB.findOrCreate(name).id);

    // 4. 生成笔记
    const noteResult = await aiService.chat({
      messages: [
        { role: 'user', content: PROMPTS.generateNote.replace('{conversation}', formatted) },
      ],
      purpose: 'note',
    });

    notesDB.create({
      conversationId,
      title: title || '未命名笔记',
      content: noteResult.content,
      category,
      tags: tagIds,
    });

    logger.info('processor', `Processed conversation: ${title}`);
  } catch (error: any) {
    logger.error('processor', `Failed to process ${conversationId}:`, error.message);
  }
}
