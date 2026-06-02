import OpenAI from 'openai';
import type { AIProvider, AIRequestOptions, AIResponse } from './types';

export class OpenAIProvider implements AIProvider {
  readonly name = 'OpenAI';
  readonly model: string;
  private client: OpenAI;

  constructor(apiKey: string, model = 'gpt-4o-mini', baseURL?: string) {
    this.client = new OpenAI({ apiKey, baseURL });
    this.model = model;
  }

  async chat(options: AIRequestOptions): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.choices[0]?.message?.content || '';

    return {
      content,
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
      model: this.model,
    };
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }],
      });
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  }
}
