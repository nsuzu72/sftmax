'use client';

import { useState, useRef } from 'react';
import { initModels, estimateDemographicFromCanvas } from '@/app/lib/faceAnalyzer';
import { evaluateFacialMetrics, SoftmaxRecommendation } from '@/app/lib/softmaxRules';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [ethnicity, setEthnicity] = useState<string>('');
  const [results, setResults] = useState<SoftmaxRecommendation[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResults([]);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    const canvas = canvasRef.current!;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Initialize local MediaPipe vision model
    const { faceLandmarker } = await initModels();

    // 1. Detect 3D Face Mesh
    const landmarkResult = faceLandmarker.detect(img);

    if (landmarkResult.faceLandmarks.length > 0) {
      const landmarks = landmarkResult.faceLandmarks[0];

      // 2. Estimate demographic/luminance profile from canvas directly
      const detectedEthnicity = estimateDemographicFromCanvas(ctx, landmarks, canvas.width, canvas.height);
      setEthnicity(detectedEthnicity);

      // Draw Landmark Overlay
      ctx.fillStyle = '#00FF00';
      landmarks.forEach((pt: any) => {
        ctx.beginPath();
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 2, 0, 2 * Math.PI);
        ctx.fill();
      });

      // 3. Evaluate Metrics & Map Softmaxxes
      const recommendations = evaluateFacialMetrics(landmarks, detectedEthnicity);
      setResults(recommendations);
    } else {
      alert('No facial landmarks detected. Try a clear front-facing photo.');
    }

    setLoading(false);
  };

  return (
    <main className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4">Facial Feature Analysis & Softmax Planner</h1>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        className="mb-6 block border p-2 rounded"
      />

      {loading && <p className="text-blue-600 font-semibold">Processing image locally in browser...</p>}

      <div className="relative mb-6">
        <canvas ref={canvasRef} className="max-w-full border rounded shadow" />
      </div>

      {ethnicity && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="text-xl font-bold">Complexion / Profile: <span className="text-indigo-600">{ethnicity}</span></h2>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recommended Softmax Protocols</h2>
          {results.map((res, idx) => (
            <div key={idx} className="border p-4 rounded bg-white shadow-sm">
              <h3 className="text-lg font-bold text-red-600">{res.feature}</h3>
              <p className="text-sm text-gray-500">Target Area: {res.targetArea}</p>
              <p className="text-sm font-semibold my-1">Analysis: {res.measuredMetric}</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-800">
                {res.recommendedRoutines.map((routine, rIdx) => (
                  <li key={rIdx}>{routine}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
