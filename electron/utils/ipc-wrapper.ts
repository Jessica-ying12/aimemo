import { ipcMain } from 'electron';
import { logger } from '../services/logger';

interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function registerHandler(channel: string, handler: (...args: any[]) => any) {
  ipcMain.handle(channel, async (_event, ...args) => {
    try {
      const result = await handler(...args);
      return { success: true, data: result } as IpcResponse;
    } catch (error: any) {
      logger.error('ipc', `Handler error [${channel}]:`, error.message);
      return { success: false, error: error.message } as IpcResponse;
    }
  });
}
