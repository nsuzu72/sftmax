import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let faceLandmarker: FaceLandmarker | null = null;

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

  return { faceLandmarker };
}

export function estimateDemographicFromCanvas(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  canvasWidth: number,
  canvasHeight: number
): string {
  const leftCheek = landmarks[234];
  const x = Math.floor(leftCheek.x * canvasWidth);
  const y = Math.floor(leftCheek.y * canvasHeight);

  try {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const luminance = 0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2];

    if (luminance > 180) return 'Light Complexion / High Luminance';
    if (luminance > 120) return 'Medium Complexion / Intermediate Luminance';
    return 'Dark Complexion / Deep Luminance';
  } catch (e) {
    return 'Standard Profile';
  }
}
