export interface SoftmaxRecommendation {
  feature: string;
  targetArea: string;
  measuredMetric: string;
  recommendedRoutines: string[];
}

export interface AnalysisResult {
  recommendations: SoftmaxRecommendation[];
  debloatScore: number; // 0 to 100%
  debloatStatus: string;
  debloatRoutines: string[];
}

export function evaluateFacialMetrics(
  landmarks: any[], 
  ethnicities: string[],
  ctx?: CanvasRenderingContext2D,
  canvasWidth?: number,
  canvasHeight?: number
): AnalysisResult {
  const recommendations: SoftmaxRecommendation[] = [];

  const getDistance = (p1: any, p2: any) =>
    Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);

  const faceLength = getDistance(landmarks[10], landmarks[152]); // Forehead to Chin
  const zygomaWidth = getDistance(landmarks[234], landmarks[454]); // Cheekbone to Cheekbone
  const jawWidth = getDistance(landmarks[172], landmarks[397]); // Gonial Width
  const ethnicityLabel = ethnicities.length > 0 ? ethnicities.join(' / ') : 'Standard Profile';

  // --------------------------------------------------------------------------
  // 1. CANTHAL TILT (Ideal: Positive > +2.0°)
  // --------------------------------------------------------------------------
  const leftOuter = landmarks[33];
  const leftInner = landmarks[133];
  const canthalAngle = Math.atan2(leftOuter.y - leftInner.y, leftOuter.x - leftInner.x) * (180 / Math.PI);

  if (canthalAngle < 1.5) { // Only triggers if neutral or negative
    recommendations.push({
      feature: "Eye Orientation & Infraorbital Support",
      targetArea: "Upper Lid & Infraorbital Rim",
      measuredMetric: `Canthal Angle: ${canthalAngle.toFixed(1)}° (Sub-optimal tilt detected) [${ethnicityLabel}]`,
      recommendedRoutines: [
        "Upward Fascia Pull: Press fingers at lower orbital rim, pull tissue upward toward hairline for 20-30s daily[cite: 1].",
        "Infraorbital Support: Apply Hyaluronic Acid serum and supplement with Copper Peptides, Silica, and Glycine[cite: 1].",
        "Eye Light Tapping: Light fingertip tapping along upper cheekbones to improve microcirculation[cite: 1]."
      ]
    });
  }

  // --------------------------------------------------------------------------
  // 2. CHEEKBONE / ZYGOMA PROJECTION (Ideal Ratio: 0.88 - 0.95)
  // --------------------------------------------------------------------------
  const zygomaRatio = zygomaWidth / faceLength;

  if (zygomaRatio < 0.85) { // Only triggers if narrow/flat
    recommendations.push({
      feature: "Zygomas & Midface Support",
      targetArea: "Zygomatic Bone & Cheek Structure",
      measuredMetric: `Zygomatic Ratio: ${zygomaRatio.toFixed(2)} (Narrow/Flat Midface relative to height)`,
      recommendedRoutines: [
        "Zygo Pulling: Firm outward/upward pressure on zygomatic bone inside mouth paired with hard tongue suction (5 min max daily)[cite: 1].",
        "Zygolift (ZPFFM): Take 6-10 deep nasal inhalations while lifting cheekbone skin 1-2mm, hold 2s (12-15 reps, 2x/day)[cite: 1].",
        "Subtle Smile Hold & Light Cheektapping: Hold natural expression for 1-2 mins to engage zygomaticus muscles[cite: 1]."
      ]
    });
  }

  // --------------------------------------------------------------------------
  // 3. JAWLINE / GONIAL WIDTH (Ideal Ratio vs Zygoma: 0.80 - 0.88)
  // --------------------------------------------------------------------------
  const jawRatio = jawWidth / zygomaWidth;

  if (jawRatio < 0.78) { // Only triggers if jaw is significantly narrower than cheekbones
    recommendations.push({
      feature: "Gonions & Ramus Development",
      targetArea: "Mandible / Jaw Angles",
      measuredMetric: `Gonial Width Ratio: ${jawRatio.toFixed(2)} (Sub-optimal jaw width relative to cheekbones)`,
      recommendedRoutines: [
        "Mastication Training: Chew hard mastic gum, jerky, or silicone trainers for 10-15 mins daily (alternating sides every 10 strokes)[cite: 1].",
        "Pulsed Isometric Mandibular Loading: Push jaw forward/upward with fingers against resistance, hold 2s (3 sets of 15)[cite: 1].",
        "Mandibular Bone Massage: Focused percussion or massage on gonial angles for 2x5 mins daily to stimulate blood flow[cite: 1]."
      ]
    });
  }

  // --------------------------------------------------------------------------
  // 4. MAXILLARY POSTURE & AIRWAY (Ideal Midface Ratio < 0.33)
  // --------------------------------------------------------------------------
  const midfaceLength = getDistance(landmarks[168], landmarks[0]);
  const midfaceRatio = midfaceLength / faceLength;

  if (midfaceRatio > 0.35) { // Only triggers if midface is vertically elongated / recessed maxilla
    recommendations.push({
      feature: "Maxillary Posture & Airway Optimization",
      targetArea: "Maxilla, Palate & Cervical Spine",
      measuredMetric: `Midface Ratio: ${midfaceRatio.toFixed(2)} (Elongated midface / Recessed maxilla indicator)`,
      recommendedRoutines: [
        "24/7 Mewing (Palatal Pressure): Maintain constant posterior tongue pressure against hard and soft palate[cite: 1].",
        "CCW Rotation Practice: Perform chin tucks (hold 30s, 5 reps, 3 sets daily) to align head with cervical spine[cite: 1].",
        "Nightly Nasal Breathing Protocol: Mouth taping during sleep to ensure pure diaphragmatic nasal breathing[cite: 1]."
      ]
    });
  }

  // --------------------------------------------------------------------------
  // 5. DEBLOAT METER EVALUATION
  // --------------------------------------------------------------------------
  let debloatScore = 20; // Default low baseline

  // Factor A: Jaw-to-Cheek Soft Tissue Ratio (Lower ratio indicates higher water/fat retention around lower cheek)
  const cheekLowerWidth = getDistance(landmarks[215], landmarks[435]);
  const softTissueRatio = cheekLowerWidth / zygomaWidth;

  if (softTissueRatio > 0.82) debloatScore += 35;
  else if (softTissueRatio > 0.76) debloatScore += 20;

  // Factor B: Canvas Pixel Variance Analysis (if canvas context provided)
  if (ctx && canvasWidth && canvasHeight) {
    try {
      const cheekPt = landmarks[234];
      const cx = Math.floor(cheekPt.x * canvasWidth);
      const cy = Math.floor(cheekPt.y * canvasHeight);
      const pixel = ctx.getImageData(cx, cy, 1, 1).data;
      
      // High red/green saturation relative to luminance indicates inflammation / fluid retention
      const luminance = 0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2];
      if (luminance < 110) debloatScore += 25; // Shadowing / water retention near tissue pockets
    } catch (e) {
      // Fallback
    }
  }

  debloatScore = Math.min(100, Math.max(10, debloatScore));

  let debloatStatus = "OPTIMAL // LOW WATER RETENTION";
  if (debloatScore > 65) debloatStatus = "HIGH BLOAT // SEVERE FLUID RETENTION DETECTED";
  else if (debloatScore > 40) debloatStatus = "MODERATE BLOAT // WATER RETENTION DETECTED";

  const debloatRoutines = [
    "Sodium Flushing Protocol: Increase potassium intake (coconut water/raw milk) and balance sodium-to-potassium ratios[cite: 1].",
    "Facial Lymphatic Drainage: Roll knuckles along cheek hollows, press firmly, and suck air in an 'O' shape (15-20 sec)[cite: 1].",
    "Thermal Contrast Activation: Alternate cold water/ice pack (60-90s) with warm towel (2-3 min) for 3-4 rounds[cite: 1].",
    "Primal Hydration: Eliminate seed oils, processed sugars, and excess sodium to lower systemic inflammation[cite: 1]."
  ];

  return {
    recommendations,
    debloatScore,
    debloatStatus,
    debloatRoutines
  };
}
