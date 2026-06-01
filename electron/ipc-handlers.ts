import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { conversationsDB } from './services/database/conversations';
import { notesDB } from './services/database/notes';
import { tagsDB } from './services/database/tags';

export function registerIpcHandlers() {
  // 对话
  ipcMain.handle(IPC_CHANNELS.CONVERSATION_LIST, (_event, params) => {
    return conversationsDB.list(params);
  });

  ipcMain.handle(IPC_CHANNELS.CONVERSATION_GET, (_event, id: string) => {
    return conversationsDB.get(id);
  });

  ipcMain.handle(IPC_CHANNELS.CONVERSATION_CREATE, (_event, data) => {
    return conversationsDB.create(data);
  });

  ipcMain.handle(IPC_CHANNELS.CONVERSATION_DELETE, (_event, id: string) => {
    return conversationsDB.delete(id);
  });

  ipcMain.handle(IPC_CHANNELS.CONVERSATION_SEARCH, (_event, query: string) => {
    return conversationsDB.search(query);
  });

  // 笔记
  ipcMain.handle(IPC_CHANNELS.NOTE_LIST, (_event, params) => {
    return notesDB.list(params);
  });

  ipcMain.handle(IPC_CHANNELS.NOTE_GET, (_event, id: string) => {
    return notesDB.get(id);
  });

  ipcMain.handle(IPC_CHANNELS.NOTE_CREATE, (_event, data) => {
    return notesDB.create(data);
  });

  ipcMain.handle(IPC_CHANNELS.NOTE_UPDATE, (_event, id: string, data) => {
    return notesDB.update(id, data);
  });

  ipcMain.handle(IPC_CHANNELS.NOTE_DELETE, (_event, id: string) => {
    return notesDB.delete(id);
  });

  ipcMain.handle(IPC_CHANNELS.NOTE_SEARCH, (_event, query: string) => {
    return notesDB.search(query);
  });

  // 标签
  ipcMain.handle(IPC_CHANNELS.TAG_LIST, () => {
    return tagsDB.list();
  });

  ipcMain.handle(IPC_CHANNELS.TAG_CREATE, (_event, name: string, color?: string) => {
    return tagsDB.create(name, color);
  });

  ipcMain.handle(IPC_CHANNELS.TAG_DELETE, (_event, id: string) => {
    return tagsDB.delete(id);
  });
}
