import { IPC_CHANNELS } from '../../shared/ipc-channels';
import type {
  Conversation,
  Note,
  Tag,
  ListParams,
  PaginatedResult,
  CreateConversationInput,
  CreateNoteInput,
  UpdateNoteInput,
} from '../../shared/types';

const { invoke: rawInvoke } = window.electronAPI;

async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  const response = await rawInvoke<{ success: boolean; data?: T; error?: string }>(
    channel,
    ...args,
  );
  if (!response.success) {
    throw new Error(response.error || 'Unknown error');
  }
  return response.data as T;
}

export const api = {
  conversations: {
    list: (params?: ListParams) =>
      invoke<PaginatedResult<Conversation>>(IPC_CHANNELS.CONVERSATION_LIST, params),
    get: (id: string) => invoke<Conversation | null>(IPC_CHANNELS.CONVERSATION_GET, id),
    create: (data: CreateConversationInput) =>
      invoke<Conversation>(IPC_CHANNELS.CONVERSATION_CREATE, data),
    delete: (id: string) => invoke<void>(IPC_CHANNELS.CONVERSATION_DELETE, id),
    search: (query: string) => invoke<Conversation[]>(IPC_CHANNELS.CONVERSATION_SEARCH, query),
  },
  notes: {
    list: (params?: ListParams) => invoke<PaginatedResult<Note>>(IPC_CHANNELS.NOTE_LIST, params),
    get: (id: string) => invoke<Note | null>(IPC_CHANNELS.NOTE_GET, id),
    create: (data: CreateNoteInput) => invoke<Note>(IPC_CHANNELS.NOTE_CREATE, data),
    update: (id: string, data: UpdateNoteInput) =>
      invoke<Note | null>(IPC_CHANNELS.NOTE_UPDATE, id, data),
    delete: (id: string) => invoke<void>(IPC_CHANNELS.NOTE_DELETE, id),
    search: (query: string) => invoke<Note[]>(IPC_CHANNELS.NOTE_SEARCH, query),
  },
  tags: {
    list: () => invoke<Tag[]>(IPC_CHANNELS.TAG_LIST),
    create: (name: string, color?: string) => invoke<Tag>(IPC_CHANNELS.TAG_CREATE, name, color),
    delete: (id: string) => invoke<void>(IPC_CHANNELS.TAG_DELETE, id),
  },
  import: {
    paste: (text: string) => invoke<Conversation>('import:paste', text),
    file: () => invoke<Conversation[] | null>('import:file'),
  },
};
