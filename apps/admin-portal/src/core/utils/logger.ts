/**
 * Smart Park Portal Centralized Logging System
 * Implements multi-level logging, performance tracing, and error reporting.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogContext {
  namespace?: string;
  [key: string]: any;
}

const IS_DEV = import.meta.env.MODE !== 'production';

class Logger {
  private formatMessage(level: LogLevel, namespace: string | undefined, message: string): string {
    const timestamp = new Date().toISOString();
    const nsTag = namespace ? `[${namespace}]` : '';
    return `${timestamp} [${level}]${nsTag} ${message}`;
  }

  private getStyles(level: LogLevel): string {
    switch (level) {
      case 'DEBUG':
        return 'color: #7f8c8d; font-weight: bold;';
      case 'INFO':
        return 'color: #2ecc71; font-weight: bold;';
      case 'WARN':
        return 'color: #f39c12; font-weight: bold;';
      case 'ERROR':
        return 'color: #e74c3c; font-weight: bold;';
      default:
        return 'color: inherit;';
    }
  }

  private write(level: LogLevel, message: string, context?: LogContext) {
    if (!IS_DEV && level === 'DEBUG') {
      return;
    }

    const namespace = context?.namespace;
    const formatted = this.formatMessage(level, namespace, message);
    const style = this.getStyles(level);

    if (IS_DEV) {
      if (context) {
        const { namespace: _, ...extra } = context;
        console.groupCollapsed(`%c${formatted}`, style);
        console.log('Context:', extra);
        if (level === 'ERROR' && extra.error instanceof Error) {
          console.error(extra.error);
        }
        console.groupEnd();
      } else {
        console.log(`%c${formatted}`, style);
      }
    } else {
      // In production, send severe errors to monitoring service or format minimally
      if (level === 'ERROR' || level === 'WARN') {
        console.warn(formatted, context || '');
      }
    }
  }

  public debug(message: string, context?: LogContext) {
    this.write('DEBUG', message, context);
  }

  public info(message: string, context?: LogContext) {
    this.write('INFO', message, context);
  }

  public warn(message: string, context?: LogContext) {
    this.write('WARN', message, context);
  }

  public error(message: string, context?: LogContext) {
    this.write('ERROR', message, context);
  }

  /**
   * Measures performance of a task and logs the elapsed duration
   */
  public time(label: string) {
    if (!IS_DEV) return;
    console.time(`[PERF] ${label}`);
  }

  public timeEnd(label: string, context?: LogContext) {
    if (!IS_DEV) return;
    console.timeEnd(`[PERF] ${label}`);
    if (context) {
      this.debug(`Perf trace completed for: ${label}`, context);
    }
  }
}

export const logger = new Logger();
export default logger;
