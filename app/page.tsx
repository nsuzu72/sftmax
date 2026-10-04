'use client';

import { useState, useRef } from 'react';
import { initModels } from '@/app/lib/faceAnalyzer';
import { evaluateFacialMetrics, SoftmaxRecommendation } from '@/app/lib/softmaxRules';

const ETHNICITIES = [
  'Northern European',
  'Southern European',
  'East Asian',
  'Southeast Asian',
  'South Asian',
  'Middle Eastern / North African',
  'Sub-Saharan African',
  'Latino / Hispanic',
  'Indigenous American',
  'Pacific Islander'
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [primaryEthnicity, setPrimaryEthnicity] = useState<string>('');
  const [secondaryEthnicity, setSecondaryEthnicity] = useState<string>('');
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

    const { faceLandmarker } = await initModels();
    const landmarkResult = faceLandmarker.detect(img);

    if (landmarkResult.faceLandmarks.length > 0) {
      const landmarks = landmarkResult.faceLandmarks[0];

      // Draw Landmark Overlay
      ctx.fillStyle = '#00FF00';
      landmarks.forEach((pt: any) => {
        ctx.beginPath();
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 2, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Pass user-selected ethnicities
      const selectedEthnicities = [primaryEthnicity, secondaryEthnicity].filter(Boolean);
      const recommendations = evaluateFacialMetrics(landmarks, selectedEthnicities);
      setResults(recommendations);
    } else {
      alert('No facial landmarks detected. Try a clear front-facing photo.');
    }

    setLoading(false);
  };

  return (
    <main className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-2">Facial Feature Analysis & Softmax Planner</h1>
      <p className="text-gray-600 mb-6 text-sm">
        For best results, take photos 3–6 feet away (use optical zoom) in clear front lighting[cite: 1].
      </p>

      {/* Ethnicity Dropdown Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded border">
        <div>
          <label className="block text-sm font-semibold mb-1">Primary Ethnicity (Optional):</label>
          <select 
            value={primaryEthnicity} 
            onChange={(e) => setPrimaryEthnicity(e.target.value)}
            className="w-full border p-2 rounded bg-white"
          >
            <option value="">Select Primary...</option>
            {ETHNICITIES.map((eth) => (
              <option key={eth} value={eth}>{eth}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Secondary Ethnicity (Optional):</label>
          <select 
            value={secondaryEthnicity} 
            onChange={(e) => setSecondaryEthnicity(e.target.value)}
            className="w-full border p-2 rounded bg-white"
          >
            <option value="">Select Secondary...</option>
            {ETHNICITIES.map((eth) => (
              <option key={eth} value={eth}>{eth}</option>
            ))}
          </select>
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        className="mb-6 block border p-2 rounded w-full"
      />

      {loading && <p className="text-blue-600 font-semibold mb-4">Analyzing facial geometry...</p>}

      <div className="relative mb-6">
        <canvas ref={canvasRef} className="max-w-full border rounded shadow" />
      </div>

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
