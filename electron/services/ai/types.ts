export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestOptions {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  purpose?: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  model: string;
}

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  chat(options: AIRequestOptions): Promise<AIResponse>;
  testConnection(): Promise<{ ok: boolean; error?: string }>;
}

export type ProviderType = 'claude' | 'openai';
