declare module '@tensorflow-models/coco-ssd' {
  interface DetectedObject {
    bbox: [number, number, number, number];
    class: string;
    score: number;
  }

  interface ObjectDetection {
    detect(img: HTMLImageElement | HTMLVideoElement | ImageData): Promise<DetectedObject[]>;
  }

  function load(config?: object): Promise<ObjectDetection>;
}

declare module '@tensorflow/tfjs' {
  function getBackend(): string | undefined;
  function disposeVariables(): void;
  function ready(): Promise<void>;
} 