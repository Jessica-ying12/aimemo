import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AIRequestOptions, AIResponse } from './types';

export class ClaudeProvider implements AIProvider {
  readonly name = 'Claude';
  readonly model: string;
  private client: Anthropic;

  constructor(apiKey: string, model = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async chat(options: AIRequestOptions): Promise<AIResponse> {
    const systemMsg = options.messages.find((m) => m.role === 'system');
    const userMsgs = options.messages.filter((m) => m.role !== 'system');

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature,
      system: systemMsg?.content,
      messages: userMsgs.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';

    return {
      content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      model: this.model,
    };
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.client.messages.create({
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
