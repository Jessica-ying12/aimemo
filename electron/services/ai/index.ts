import type { AIProvider, AIRequestOptions, AIResponse, ProviderType } from './types';
import { ClaudeProvider } from './claude';
import { OpenAIProvider } from './openai';
import { getConfig } from '../config';
import { logger } from '../logger';

class AIService {
  private providers: Map<ProviderType, AIProvider> = new Map();
  private currentProvider: ProviderType = 'claude';

  initialize() {
    const config = getConfig().get('ai');
    if (!config.apiKey) {
      logger.warn('ai', 'No API key configured, AI features disabled');
      return;
    }

    if (config.provider === 'claude') {
      this.providers.set('claude', new ClaudeProvider(config.apiKey, config.model));
    } else if (config.provider === 'openai') {
      this.providers.set('openai', new OpenAIProvider(config.apiKey, config.model));
    }

    this.currentProvider = config.provider;
    logger.info('ai', `AI service initialized with ${config.provider}`);
  }

  isAvailable(): boolean {
    return this.providers.has(this.currentProvider);
  }

  async chat(options: AIRequestOptions): Promise<AIResponse> {
    const provider = this.providers.get(this.currentProvider);
    if (!provider) {
      throw new Error('AI service not available. Configure API key in settings.');
    }

    const start = Date.now();
    try {
      const response = await provider.chat(options);
      logger.info(
        'ai',
        `chat completed in ${Date.now() - start}ms (${options.purpose || 'unknown'})`,
      );
      return response;
    } catch (error: any) {
      logger.error('ai', `chat failed:`, error.message);
      throw error;
    }
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    const provider = this.providers.get(this.currentProvider);
    if (!provider) {
      return { ok: false, error: 'No provider configured' };
    }
    return provider.testConnection();
  }
}

export const aiService = new AIService();
