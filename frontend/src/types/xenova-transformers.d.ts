declare module '@xenova/transformers' {
  export const env: {
    allowLocalModels: boolean;
    useBrowserCache: boolean;
    remoteHost: string;
    [key: string]: any;
  };

  export function pipeline(
    task: string,
    model: string,
    options?: any
  ): Promise<any>;
} 