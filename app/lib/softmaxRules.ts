export interface SoftmaxRecommendation {
  feature: string;
  targetArea: string;
  measuredMetric: string;
  recommendedRoutines: string[];
}

export function evaluateFacialMetrics(
  landmarks: any[], 
  ethnicities: string[]
): SoftmaxRecommendation[] {
  const recommendations: SoftmaxRecommendation[] = [];

  const getDistance = (p1: any, p2: any) =>
    Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);

  const faceLength = getDistance(landmarks[10], landmarks[152]); // Forehead to Chin
  const zygomaWidth = getDistance(landmarks[234], landmarks[454]); // Cheekbone to Cheekbone
  const ethnicityLabel = ethnicities.length > 0 ? ethnicities.join(' / ') : 'General Profile';

  // --------------------------------------------------------------------------
  // 1. CANTHAL TILT & EYE REGION
  // --------------------------------------------------------------------------
  const leftOuter = landmarks[33];
  const leftInner = landmarks[133];
  const canthalAngle = Math.atan2(leftOuter.y - leftInner.y, leftOuter.x - leftInner.x) * (180 / Math.PI);

  if (canthalAngle > 1.0) {
    recommendations.push({
      feature: "Eye Orientation & Infraorbital Rim",
      targetArea: "Upper Lid & Orbital Rim",
      measuredMetric: `Canthal Angle: ${canthalAngle.toFixed(1)}° (Neutral/Negative tilt detected) [Background: ${ethnicityLabel}]`,
      recommendedRoutines: [
        "Upward Fascia Pull: Press fingers firmly at lower orbital rim, pull tissue upward toward hairline for 20-30s daily.",
        "Infraorbital Support: Apply Hyaluronic Acid serum and supplement with Copper Peptides, Silica, and Glycine.",
        "Eye Light Tapping: Light fingertip tapping along upper cheekbones to improve microcirculation."
      ]
    });
  }

  // --------------------------------------------------------------------------
  // 2. BROW RIDGE & SUPRAORBITAL DEVELOPMENT
  // --------------------------------------------------------------------------
  // Glabella (10) to Brow Landmarks (70, 300)
  const browProximity = getDistance(landmarks[70], landmarks[300]) / zygomaWidth;

  if (browProximity > 0.42) {
    recommendations.push({
      feature: "Brow Ridge & Supraorbital Prominence",
      targetArea: "Glabella & Forehead Base",
      measuredMetric: `Supraorbital Span: ${browProximity.toFixed(2)} (High forehead flat / weak brow protrusion detected)`,
      recommendedRoutines: [
        "Glabellar Isometric Holds: Press thumbs into brow bone while flexing the corrugator muscles, holding 10s (5 reps daily).",
        "Bone Density Protocol: Resistance training combined with Vitamin D3/K2 and calcium optimization.",
        "Forehead Fascia Release: Upward and lateral palm press across forehead to reduce tension lines."
      ]
    });
  }

  // --------------------------------------------------------------------------
  // 3. CHEEKBONE / ZYGOMA PROJECTION
  // --------------------------------------------------------------------------
  const zygomaRatio = zygomaWidth / faceLength;

  if (zygomaRatio < 0.85) {
    recommendations.push({
      feature: "Zygomas & Midface Support",
      targetArea: "Zygomatic Bone & Cheek Structure",
      measuredMetric: `Zygomatic Ratio: ${zygomaRatio.toFixed(2)} (Narrow/Flat Midface relative to height)`,
      recommendedRoutines: [
        "Zygo Pulling: Firm outward/upward pressure (2.5kg equivalent) on zygomatic bone inside mouth paired with hard tongue suction (5 min max daily).",
        "Zygolift (ZPFFM): Take 6-10 deep nasal inhalations while lifting cheekbone skin 1-2mm, hold 2s (12-15 reps, 2x/day).",
        "Subtle Smile Hold & Light Cheektapping: Hold natural expression for 1-2 mins to engage zygomaticus muscles."
      ]
    });
  }

  // --------------------------------------------------------------------------
  // 4. JAWLINE, GONIONS & RAMUS DEVELOPMENT
  // --------------------------------------------------------------------------
  const jawWidth = getDistance(landmarks[172], landmarks[397]);
  const jawRatio = jawWidth / zygomaWidth;

  if (jawRatio < 0.78) {
    recommendations.push({
      feature: "Gonions & Ramus Development",
      targetArea: "Mandible / Jaw Angles",
      measuredMetric: `Gonial Width Ratio: ${jawRatio.toFixed(2)} (Narrow lower third)`,
      recommendedRoutines: [
        "Mastication Training: Chew hard mastic gum, jerky, or silicone trainers for 10-15 mins daily (alternating sides every 10 strokes).",
        "Pulsed Isometric Mandibular Loading: Push jaw forward/upward with fingers against resistance, hold 2s (3 sets of 15).",
        "Mandibular Bone Massage: Focused percussion or massage on gonial angles for 2x5 mins daily to stimulate blood flow."
      ]
    });
  }

  // --------------------------------------------------------------------------
  // 5. CHIN PROJECTION & MENTALIS DEVELOPMENT
  // --------------------------------------------------------------------------
  // Lower Lip (17) to Menton/Chin (152)
  const chinLength = getDistance(landmarks[17], landmarks[152]);
  const chinRatio = chinLength / faceLength;

  if (chinRatio < 0.18) {
    recommendations.push({
      feature: "Menton Projection & Chin Structure",
      targetArea: "Symphysis & Mentalis Muscle",
      measuredMetric: `Chin Height Ratio: ${chinRatio.toFixed(2)} (Recessed/Short lower chin tip)`,
      recommendedRoutines: [
        "Mentalis Isometric Flexing: Press lower lip upward against upper teeth without wrinkling chin skin, hold 5s (10 reps, 2 sets).",
        "Chin Isometric Resistance: Place fist under chin, gently press mouth open against fist resistance (3 sets of 10s holds).",
        "Genioglossus Pulls: Engage back of tongue hard against soft palate to pull hyoid bone upward."
      ]
    });
  }

  // --------------------------------------------------------------------------
  // 6. MAXILLARY POSTURE & AIRWAY ROUTINES (Conditional)
  // --------------------------------------------------------------------------
  const midfaceLength = getDistance(landmarks[168], landmarks[0]);
  const midfaceRatio = midfaceLength / faceLength;

  if (midfaceRatio > 0.34) {
    recommendations.push({
      feature: "Maxillary Posture & Airway Optimization",
      targetArea: "Maxilla, Palate & Cervical Spine",
      measuredMetric: `Midface Ratio: ${midfaceRatio.toFixed(2)} (Long midface / Recessed maxilla indicator)`,
      recommendedRoutines: [
        "24/7 Mewing (Palatal Pressure): Maintain constant posterior tongue pressure against hard and soft palate.",
        "CCW Rotation Practice: Perform chin tucks (hold 30s, 5 reps, 3 sets daily) to align head with cervical spine.",
        "Nightly Nasal Breathing Protocol: Mouth taping during sleep to ensure pure diaphragmatic nasal breathing and growth hormone release."
      ]
    });
  }

  // --------------------------------------------------------------------------
  // 7. POSTURE, NECK & HYOID ELEVATION (Universal / Overall Alignment)
  // --------------------------------------------------------------------------
  recommendations.push({
    feature: "Cervical Alignment & Hyoid Elevation",
    targetArea: "Sternocleidomastoid & Neck Base",
    measuredMetric: `Structural Alignment Profile [Background: ${ethnicityLabel}]`,
    recommendedRoutines: [
      "Wall Angels: Stand flat against wall, pull shoulder blades together, move arms up/down 15 reps (2 sets).",
      "Neck Flexion & Extension: Isometric palm presses against forehead and back of head for 10s holds.",
      "Hyoid Lifts: Swallow while pressing tongue hard on palate, hold swallow at apex for 3s (10 reps)."
    ]
  });

  return recommendations;
}
