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

  private sanitize(text: string): string {
    return text
      .replace(/sk-[a-zA-Z0-9]{20,}/g, 'sk-***REDACTED***')
      .replace(/sk-ant-[a-zA-Z0-9-]{20,}/g, 'sk-ant-***REDACTED***')
      .replace(/(bearer\s+)[a-zA-Z0-9._-]{20,}/gi, '$1***REDACTED***')
      .replace(
        /((?:token|password|secret|key|apikey|api_key)\s*[=:]\s*)[^\s,;'"]+/gi,
        '$1***REDACTED***',
      );
  }

  private log(level: LogLevel, scope: string, message: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString();
    const sanitizedMessage = this.sanitize(message);
    const sanitizedArgs = args.map((a) => (typeof a === 'string' ? this.sanitize(a) : a));
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${scope}]`;
    const fullMessage = sanitizedArgs.length
      ? `${prefix} ${sanitizedMessage} ${sanitizedArgs.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}`
      : `${prefix} ${sanitizedMessage}`;

    if (level === 'error') {
      console.error(fullMessage);
    } else if (level === 'warn') {
      console.warn(fullMessage);
    }
  }
}

export const logger = new Logger();
