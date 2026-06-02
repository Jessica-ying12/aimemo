import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { logger } from './logger';

export interface AppConfig {
  collector: {
    enabled: boolean;
    sources: Record<
      string,
      {
        enabled: boolean;
        paths: string[];
      }
    >;
    notification: boolean;
    scanIntervalMinutes: number;
  };
  ai: {
    provider: 'claude' | 'openai';
    apiKey: string;
    model: string;
    autoProcess: boolean;
  };
  general: {
    theme: 'light' | 'dark' | 'system';
    language: 'zh-CN' | 'en';
  };
}

const DEFAULT_CONFIG: AppConfig = {
  collector: {
    enabled: true,
    sources: {},
    notification: true,
    scanIntervalMinutes: 5,
  },
  ai: {
    provider: 'claude',
    apiKey: '',
    model: 'claude-sonnet-4-20250514',
    autoProcess: true,
  },
  general: {
    theme: 'system',
    language: 'zh-CN',
  },
};

class ConfigService {
  private configPath: string;
  private config: AppConfig;

  constructor(configPath: string) {
    this.configPath = configPath;
    this.config = this.load();
  }

  private load(): AppConfig {
    try {
      if (existsSync(this.configPath)) {
        const content = readFileSync(this.configPath, 'utf-8');
        const saved = JSON.parse(content);
        return this.deepMerge(DEFAULT_CONFIG, saved);
      }
    } catch (error: any) {
      logger.error('config', 'Failed to load config:', error.message);
    }
    return { ...DEFAULT_CONFIG };
  }

  private save() {
    try {
      const dir = dirname(this.configPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error: any) {
      logger.error('config', 'Failed to save config:', error.message);
    }
  }

  get<K extends keyof AppConfig>(section: K): AppConfig[K] {
    return this.config[section];
  }

  set<K extends keyof AppConfig>(section: K, value: Partial<AppConfig[K]>) {
    this.config[section] = { ...this.config[section], ...value };
    this.save();
  }

  getAll(): AppConfig {
    return { ...this.config };
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
}

let configService: ConfigService | null = null;

export function initConfig(configPath: string): ConfigService {
  configService = new ConfigService(configPath);
  return configService;
}

export function getConfig(): ConfigService {
  if (!configService) throw new Error('Config not initialized');
  return configService;
}
