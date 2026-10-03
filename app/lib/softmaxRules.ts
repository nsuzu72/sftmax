export interface SoftmaxRecommendation {
  feature: string;
  targetArea: string;
  measuredMetric: string;
  recommendedRoutines: string[];
}

export function evaluateFacialMetrics(landmarks: any[], ethnicity: string): SoftmaxRecommendation[] {
  const recommendations: SoftmaxRecommendation[] = [];

  // Helper: 3D Euclidean Distance
  const getDistance = (p1: any, p2: any) =>
    Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);

  // 1. CANTHAL TILT / EYE ANGLE
  // Landmark 33: Outer left eye, Landmark 133: Inner left eye
  const leftOuter = landmarks[33];
  const leftInner = landmarks[133];
  const canthalAngle = Math.atan2(leftOuter.y - leftInner.y, leftOuter.x - leftInner.x) * (180 / Math.PI);

  if (canthalAngle > 2.0) { // Neutral/Negative slope
    recommendations.push({
      feature: "Eye Orientation / Orbital Rim",
      targetArea: "Upper lid & Infraorbital Area",
      measuredMetric: `Canthal angle: ${canthalAngle.toFixed(1)}° (Negative/Neutral)`,
      recommendedRoutines: [
        "Upward Fascia Pull: Press fingers at orbital rim, pull tissue upward toward hairline for 20-30s[cite: 1].",
        "Topicals/Nutrients: Apply Hyaluronic Acid serum and consume Copper peptide / Silica + Glycine[cite: 1].",
        "Eye Exercises & Light Tapping[cite: 1]."
      ]
    });
  }

  // 2. CHEEKBONE / ZYGOMA PROJECTION
  // Landmarks 234 & 454 (Zygomatic Arches) vs Landmark 1 (Nose Tip)
  const zygomaWidth = getDistance(landmarks[234], landmarks[454]);
  const faceLength = getDistance(landmarks[10], landmarks[152]); // Top of forehead to chin
  const zygomaRatio = zygomaWidth / faceLength;

  if (zygomaRatio < 0.85) {
    recommendations.push({
      feature: "Zygomas & Midface Support",
      targetArea: "Zygomatic Bone & Infraorbital",
      measuredMetric: `Zygomatic ratio: ${zygomaRatio.toFixed(2)} (Narrow/Flat Midface)`,
      recommendedRoutines: [
        "Zygo Pulling: Firm outward/upward pressure (2.5kg) on zygomatic bone inside mouth with hard tongue suction (5 min max daily)[cite: 1].",
        "Zygolift (ZPFFM): 6-10 nasal inhalations, lift cheekbone skin 1-2mm, hold 2s (12-15 reps, 2x/day)[cite: 1].",
        "Subtle Smile Hold & Light Cheektapping (1-2 mins daily)[cite: 1]."
      ]
    });
  }

  // 3. JAWLINE & GONIAL ANGLE
  // Landmarks 172 & 397 (Jaw angle/Gonion points)
  const jawWidth = getDistance(landmarks[172], landmarks[397]);
  if (jawWidth / zygomaWidth < 0.75) {
    recommendations.push({
      feature: "Gonions & Ramus Development",
      targetArea: "Lower Jaw / Mandible",
      measuredMetric: "Gonial width proportion is below optimal balance",
      recommendedRoutines: [
        "Chewing Hard Textures: Chew raw meat gristle, jerky, or silicone trainers (10-15 mins daily, switch sides every 10 strokes)[cite: 1].",
        "Pulsed Isometric Mandibular Loading: Push jaw forward/upward with fingers, hold 2s (3 sets of 15)[cite: 1].",
        "Bone Stimulation: Massage gun @ 4500 RPM on gonions for 2x5 mins daily[cite: 1]."
      ]
    });
  }

  // 4. MAXILLA & PALATE SEATING (Universal Core Routine)
  recommendations.push({
    feature: "Maxillary Posture & Airway",
    targetArea: "Maxilla",
    measuredMetric: `Demographic Profile: ${ethnicity}`,
    recommendedRoutines: [
      "24/7 Mewing: Constant tongue pressure against the palate to promote forward and upward growth[cite: 1].",
      "CCW Rotation Practice: Chin tucks (hold 30s, 5 reps, 3 sets daily)[cite: 1].",
      "Nightly Nasal Breathing: Mouth taping during sleep to optimize GH surges[cite: 1]."
    ]
  });

  return recommendations;
}
