type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  debug(scope: string, message: string, ...args: unknown[]) {
    this.log('debug', scope, message, ...args);
  }

  info(scope: string, message: string, ...args: unknown[]) {
    this.log('info', scope, message, ...args);
  }

  warn(scope: string, message: string, ...args: unknown[]) {
    this.log('warn', scope, message, ...args);
  }

  error(scope: string, message: string, ...args: unknown[]) {
    this.log('error', scope, message, ...args);
  }

  private log(level: LogLevel, scope: string, message: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${scope}]`;
    const fullMessage = args.length
      ? `${prefix} ${message} ${args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}`
      : `${prefix} ${message}`;

    if (level === 'error') {
      console.error(fullMessage);
    } else if (level === 'warn') {
      console.warn(fullMessage);
    }
  }
}

export const logger = new Logger();
