'use client';

import { useState, useRef } from 'react';
import { initModels } from '@/app/lib/faceAnalyzer';
import { evaluateFacialMetrics, AnalysisResult } from '@/app/lib/softmaxRules';

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
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setAnalysis(null);
    setError('');

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    const canvas = canvasRef.current!;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    try {
      const { faceLandmarker } = await initModels();
      const landmarkResult = faceLandmarker.detect(img);

      if (landmarkResult.faceLandmarks.length > 0) {
        const landmarks = landmarkResult.faceLandmarks[0];

        // Draw Landmark Overlay - Neon Cyan
        ctx.fillStyle = '#22d3ee';
        landmarks.forEach((pt: any) => {
          ctx.beginPath();
          ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 2, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Pass user-selected ethnicities + canvas context for Debloat Analysis
        const selectedEthnicities = [primaryEthnicity, secondaryEthnicity].filter(Boolean);
        const result = evaluateFacialMetrics(landmarks, selectedEthnicities, ctx, canvas.width, canvas.height);
        setAnalysis(result);
      } else {
        setError('NO FACIAL LANDMARKS DETECTED. TRY A CLEAR FRONT-FACING PHOTO.');
      }
    } catch (err) {
      setError('SYSTEM ERROR: ANALYSIS MODULE FAILED TO EXECUTE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-zinc-300 font-mono p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_60%,transparent_100%)] opacity-40 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        
        {/* Header Section */}
        <header className="border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3 text-cyan-400 text-xs tracking-widest mb-2">
            <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></span>
            SYSTEM ONLINE // BIOMETRIC ANALYSIS ENABLED
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight">
            FACIAL GEOMETRY MATRIX <span className="text-zinc-600 font-normal text-2xl">v2.0</span>
          </h1>
          <p className="text-zinc-500 mt-2 text-sm max-w-2xl">
            For optimal precision, capture images 3–6 feet away using optical zoom in clear, front-facing lighting conditions[cite: 1].
          </p>
        </header>

        {/* Configuration Panel */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm p-4 rounded-sm">
          <div>
            <label className="block text-xs font-semibold mb-2 text-zinc-400 uppercase tracking-wider">Primary Genotype (Optional)</label>
            <select 
              value={primaryEthnicity} 
              onChange={(e) => setPrimaryEthnicity(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-2.5 rounded-sm text-sm text-zinc-200 focus:border-cyan-500 focus:outline-none transition-colors"
            >
              <option value="">Select Primary...</option>
              {ETHNICITIES.map((eth) => (
                <option key={eth} value={eth}>{eth}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 text-zinc-400 uppercase tracking-wider">Secondary Genotype (Optional)</label>
            <select 
              value={secondaryEthnicity} 
              onChange={(e) => setSecondaryEthnicity(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-2.5 rounded-sm text-sm text-zinc-200 focus:border-cyan-500 focus:outline-none transition-colors"
            >
              <option value="">Select Secondary...</option>
              {ETHNICITIES.map((eth) => (
                <option key={eth} value={eth}>{eth}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Custom File Upload */}
        <section>
          <label htmlFor="file-upload" className="cursor-pointer block w-full border-2 border-dashed border-zinc-700 hover:border-cyan-500 bg-zinc-900/30 hover:bg-cyan-950/10 p-8 text-center transition-colors group">
            <div className="text-cyan-500 text-sm tracking-widest uppercase group-hover:text-cyan-400">
              [ + ] Initialize Image Input
            </div>
            <div className="text-zinc-600 text-xs mt-2">Click to browse files // JPG, PNG</div>
            <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </section>

        {/* Error State */}
        {error && (
          <div className="border border-red-900 bg-red-950/50 text-red-400 p-4 rounded-sm flex items-center gap-3 text-sm">
            <span className="text-lg">⚠</span>
            <span className="font-bold tracking-wide">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="border border-cyan-900 bg-cyan-950/50 text-cyan-400 p-4 rounded-sm flex items-center gap-3 text-sm animate-pulse">
            <span className="h-3 w-3 bg-cyan-500 rounded-full"></span>
            PROCESSING GEOMETRY // EXTRACTING LANDMARKS...
          </div>
        )}

        {/* Viewport / Canvas */}
        <section className="relative border border-zinc-800 bg-black p-4 rounded-sm min-h-[400px] flex items-center justify-center">
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-500/50"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-500/50"></div>
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-500/50"></div>
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-500/50"></div>
          
          <canvas ref={canvasRef} className="max-w-full h-auto object-contain" />
          
          {!loading && !analysis && !error && (
            <div className="absolute text-zinc-700 text-xs tracking-widest pointer-events-none">
              AWAITING DATA INPUT
            </div>
          )}
        </section>

        {/* Debloat Meter Module */}
        {analysis && (
          <section className="border border-zinc-800 bg-zinc-950/60 p-6 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                <span className="text-cyan-400">⚡</span> Debloat Meter Index
              </h2>
              <span className={`text-xs font-bold tracking-wider px-2.5 py-1 rounded-sm border ${
                analysis.debloatScore > 50 
                  ? 'bg-red-950/50 text-red-400 border-red-800' 
                  : 'bg-cyan-950/50 text-cyan-400 border-cyan-800'
              }`}>
                {analysis.debloatStatus}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>FLUID RETENTION SCORE:</span>
                <span className="font-bold text-zinc-200">{analysis.debloatScore}%</span>
              </div>
              <div className="w-full bg-zinc-900 border border-zinc-800 h-4 rounded-sm overflow-hidden p-0.5">
                <div 
                  className={`h-full transition-all duration-500 ${
                    analysis.debloatScore > 65 ? 'bg-red-500' : analysis.debloatScore > 40 ? 'bg-amber-500' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${analysis.debloatScore}%` }}
                ></div>
              </div>
            </div>

            {/* Debloat Protocol Suggestions */}
            {analysis.debloatScore > 30 && (
              <div className="mt-4 pt-3 border-t border-zinc-900">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Recommended Debloating Actions:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-300">
                  {analysis.debloatRoutines.map((routine, idx) => (
                    <li key={idx} className="bg-black/40 p-2.5 border-l-2 border-cyan-500 flex items-start gap-2">
                      <span className="text-cyan-400">›</span>
                      <span>{routine}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Diagnostic Results Section */}
        {analysis && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-100 border-l-4 border-cyan-500 pl-3 uppercase tracking-widest">
              Biometric Diagnostic Output
            </h2>
            
            {analysis.recommendations.length === 0 ? (
              <div className="border border-cyan-900/50 bg-cyan-950/20 p-6 rounded-sm text-center">
                <p className="text-cyan-400 font-bold tracking-widest uppercase text-sm">
                  ✓ IDEAL FACIAL GEOMETRY DETECTED
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  All measured ratios fall within optimal proportions. No physical adjustments recommended.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.recommendations.map((res, idx) => (
                  <div key={idx} className="border border-zinc-800 bg-zinc-950/50 p-5 rounded-sm hover:border-zinc-700 transition-colors">
                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-zinc-800">
                      <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wide">
                        {res.feature}
                      </h3>
                      <span className="text-xs text-zinc-600 font-mono pt-1">
                        ID: {String(idx + 1).padStart(3, '0')}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs mb-4">
                      <p className="text-zinc-500">
                        <span className="text-zinc-600">TARGET AREA:</span> {res.targetArea}
                      </p>
                      <p className="text-zinc-400">
                        <span className="text-zinc-600">METRIC:</span> {res.measuredMetric}
                      </p>
                    </div>

                    <div className="mt-2">
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Recommended Protocols:</p>
                      <ul className="space-y-2 text-sm text-zinc-300">
                        {res.recommendedRoutines.map((routine, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2 bg-black/40 p-2 border-l-2 border-zinc-700">
                            <span className="text-cyan-500 mt-0.5">›</span>
                            <span>{routine}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
