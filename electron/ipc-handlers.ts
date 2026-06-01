import { registerHandler } from './utils/ipc-wrapper';
import {
  validate,
  listParamsSchema,
  createConversationSchema,
  createNoteSchema,
  updateNoteSchema,
} from './utils/validators';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { conversationsDB } from './services/database/conversations';
import { notesDB } from './services/database/notes';
import { tagsDB } from './services/database/tags';

export function registerIpcHandlers() {
  // 对话
  registerHandler(IPC_CHANNELS.CONVERSATION_LIST, (params) => {
    const validated = validate(listParamsSchema, params);
    return conversationsDB.list(validated);
  });

  registerHandler(IPC_CHANNELS.CONVERSATION_GET, (id: string) => {
    if (!id || typeof id !== 'string') throw new Error('Invalid ID');
    return conversationsDB.get(id);
  });

  registerHandler(IPC_CHANNELS.CONVERSATION_CREATE, (data) => {
    const validated = validate(createConversationSchema, data);
    return conversationsDB.create(validated);
  });

  registerHandler(IPC_CHANNELS.CONVERSATION_DELETE, (id: string) => {
    if (!id || typeof id !== 'string') throw new Error('Invalid ID');
    return conversationsDB.delete(id);
  });

  registerHandler(IPC_CHANNELS.CONVERSATION_SEARCH, (query: string) => {
    if (!query || typeof query !== 'string') throw new Error('Invalid query');
    if (query.length > 500) throw new Error('Query too long');
    return conversationsDB.search(query);
  });

  // 笔记
  registerHandler(IPC_CHANNELS.NOTE_LIST, (params) => {
    const validated = validate(listParamsSchema, params);
    return notesDB.list(validated);
  });

  registerHandler(IPC_CHANNELS.NOTE_GET, (id: string) => {
    if (!id || typeof id !== 'string') throw new Error('Invalid ID');
    return notesDB.get(id);
  });

  registerHandler(IPC_CHANNELS.NOTE_CREATE, (data) => {
    const validated = validate(createNoteSchema, data);
    return notesDB.create(validated);
  });

  registerHandler(IPC_CHANNELS.NOTE_UPDATE, (id: string, data) => {
    if (!id || typeof id !== 'string') throw new Error('Invalid ID');
    const validated = validate(updateNoteSchema, data);
    return notesDB.update(id, validated);
  });

  registerHandler(IPC_CHANNELS.NOTE_DELETE, (id: string) => {
    if (!id || typeof id !== 'string') throw new Error('Invalid ID');
    return notesDB.delete(id);
  });

  registerHandler(IPC_CHANNELS.NOTE_SEARCH, (query: string) => {
    if (!query || typeof query !== 'string') throw new Error('Invalid query');
    return notesDB.search(query);
  });

  // 标签
  registerHandler(IPC_CHANNELS.TAG_LIST, () => tagsDB.list());

  registerHandler(IPC_CHANNELS.TAG_CREATE, (name: string, color?: string) => {
    if (!name || typeof name !== 'string') throw new Error('Invalid name');
    if (name.length > 50) throw new Error('Tag name too long');
    return tagsDB.create(name, color);
  });

  registerHandler(IPC_CHANNELS.TAG_DELETE, (id: string) => {
    if (!id || typeof id !== 'string') throw new Error('Invalid ID');
    return tagsDB.delete(id);
  });
}
