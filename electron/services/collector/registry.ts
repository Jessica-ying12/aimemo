import { BaseCollector } from './base';

class CollectorRegistry {
  private collectors: Map<string, BaseCollector> = new Map();

  register(collector: BaseCollector) {
    this.collectors.set(collector.source, collector);
  }

  unregister(source: string) {
    this.collectors.delete(source);
  }

  get(source: string): BaseCollector | undefined {
    return this.collectors.get(source);
  }

  getAll(): BaseCollector[] {
    return Array.from(this.collectors.values());
  }

  getEnabled(): BaseCollector[] {
    return this.getAll().filter((c) => c.enabled);
  }

  getSources(): string[] {
    return Array.from(this.collectors.keys());
  }
}

export const registry = new CollectorRegistry();
