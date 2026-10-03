import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { pipeline } from '@xenova/transformers';

let faceLandmarker: FaceLandmarker | null = null;
let classifierPipeline: any = null;

export async function initModels() {
  if (!faceLandmarker) {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numFaces: 1,
    });
  }

  if (!classifierPipeline) {
    // Load lightweight ONNX demographic model directly in WebGL
    classifierPipeline = await pipeline('image-classification', 'Xenova/fairface-ethnicity', {
      device: 'webgl',
    });
  }

  return { faceLandmarker, classifierPipeline };
}
