import { EventEmitter } from 'events';

export interface CollectorConfig {
  name: string;
  source: string;
  enabled: boolean;
  paths: string[];
  filePatterns: string[];
}

export interface ParsedConversation {
  source: string;
  externalId?: string;
  title?: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
  }>;
  metadata: {
    filePath: string;
    workspace?: string;
    project?: string;
    toolVersion?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export abstract class BaseCollector extends EventEmitter {
  abstract readonly name: string;
  abstract readonly source: string;
  protected config: CollectorConfig;

  constructor(config: CollectorConfig) {
    super();
    this.config = config;
  }

  get enabled(): boolean {
    return this.config.enabled;
  }

  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
  }

  abstract discoverFiles(): Promise<string[]>;
  abstract parseFile(filePath: string): Promise<ParsedConversation | null>;
  abstract getDefaultPaths(): string[];

  isRelevantFile(filePath: string): boolean {
    return this.config.filePatterns.some(
      (pattern) => filePath.includes(pattern) || filePath.endsWith(pattern),
    );
  }
}
