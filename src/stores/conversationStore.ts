import { create } from 'zustand';
import { api } from '../lib/api';
import type { Conversation, ListParams } from '../../shared/types';

interface ConversationState {
  conversations: Conversation[];
  total: number;
  page: number;
  loading: boolean;
  filter: { source?: string };
  fetch: (params?: ListParams) => Promise<void>;
  setFilter: (filter: { source?: string }) => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  total: 0,
  page: 1,
  loading: false,
  filter: {},

  fetch: async (params) => {
    set({ loading: true });
    try {
      const result = await api.conversations.list({
        ...get().filter,
        ...params,
      });
      set({
        conversations: result.items,
        total: result.total,
        page: result.page,
      });
    } finally {
      set({ loading: false });
    }
  },

  setFilter: (filter) => {
    set({ filter });
    get().fetch({ page: 1, ...filter });
  },
}));
