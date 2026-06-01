export interface Conversation {
  id: string;
  source: string;
  title: string;
  rawContent: Message[];
  summary?: string;
  createdAt: string;
  importedAt: string;
  status: 'pending' | 'processed' | 'archived';
  metadata?: Record<string, unknown>;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface Note {
  id: string;
  conversationId?: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  status: 'pending' | 'draft' | 'confirmed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  source?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateConversationInput {
  source: string;
  title?: string;
  rawContent: Message[];
  metadata?: Record<string, unknown>;
}

export interface CreateNoteInput {
  conversationId?: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  category?: string;
  status?: Note['status'];
  tags?: string[];
}
