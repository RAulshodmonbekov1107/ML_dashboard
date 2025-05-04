declare module '../../services/textGenerationService' {
  interface TextGenerationOptions {
    maxLength?: number;
    temperature?: number;
    modelType?: string;
    onProgress?: (data: {progress: number, message: string}) => void;
  }

  interface ModelInfo {
    name?: string;
    type?: string;
    provider?: string;
    parameters?: {
      temperature?: number;
      max_length?: number;
      model?: string;
      style?: string;
    }
  }

  interface TextGenerationResult {
    generated_text: string;
    model_info: ModelInfo;
  }

  class TextGenerationService {
    generateText(
      prompt: string,
      options?: TextGenerationOptions
    ): Promise<TextGenerationResult>;
    
    preloadDefaultModel(): void;
  }

  const textGenerationService: TextGenerationService;
  export default textGenerationService;
} 