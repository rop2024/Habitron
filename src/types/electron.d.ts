export interface ElectronAPI {
  database: {
    getAllTasks: () => Promise<any[]>;
    createTask: (task: any) => Promise<any>;
    updateTask: (id: number, updates: any) => Promise<any>;
    deleteTask: (id: number) => Promise<void>;
    getSetting: (key: string) => Promise<string | null>;
    setSetting: (key: string, value: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}