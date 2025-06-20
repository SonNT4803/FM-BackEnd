import { Canvas, Image as NodeImage, ImageData } from 'canvas';

declare global {
  interface Window {
    Canvas: typeof Canvas;
    Image: typeof NodeImage;
    ImageData: typeof ImageData;
  }
}

declare module 'face-api.js' {
  interface Environment {
    Canvas: typeof Canvas;
    Image: typeof NodeImage;
    ImageData: typeof ImageData;
  }
}

// Extend the Node Image type to be compatible with HTMLImageElement
declare module 'canvas' {
  interface Image {
    src: string | Buffer;
    width: number;
    height: number;
    complete: boolean;
    naturalWidth: number;
    naturalHeight: number;
    onload: (() => void) | null;
    onerror: (() => void) | null;
  }
}
