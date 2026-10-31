// US number for each letter size, shown on the size buttons as "6(S)". The
// letter is what gets saved on orders. Keep in step with the other Dali
// codebases' lib/sizes.ts.
export const US_SIZES: Record<string, string> = {
  XS: "4",
  S: "6",
  M: "8",
  L: "10",
  XL: "12/14",
  XXL: "16",
};

// "S" → "6(S)". Sizes without a US number (e.g. shoe sizes) stay as they are.
export function sizeLabel(size: string): string {
  const us = US_SIZES[size.trim().toUpperCase()];
  return us ? `${us}(${size})` : size;
}

// Body measurements in centimetres, [from, to].
export interface SizeChartRow {
  size: string;
  height: [number, number];
  bust: [number, number];
  waist: [number, number];
  hip: [number, number];
}

export const SIZE_CHART: SizeChartRow[] = [
  { size: "XS", height: [160, 165], bust: [82, 86], waist: [62, 66], hip: [87, 91] },
  { size: "S", height: [165, 170], bust: [86, 90], waist: [66, 70], hip: [91, 95] },
  { size: "M", height: [165, 170], bust: [90, 94], waist: [70, 74], hip: [95, 99] },
  { size: "L", height: [170, 175], bust: [94, 100], waist: [74, 80], hip: [99, 105] },
  { size: "XL", height: [170, 175], bust: [100, 106], waist: [80, 86], hip: [105, 111] },
  { size: "XXL", height: [170, 175], bust: [106, 112], waist: [86, 92], hip: [111, 117] },
];

export type SizeUnit = "cm" | "in";

export function formatRange([from, to]: [number, number], unit: SizeUnit): string {
  if (unit === "cm") return `${from}-${to}`;
  const inch = (cm: number) => String(Math.round((cm / 2.54) * 10) / 10);
  return `${inch(from)}-${inch(to)}`;
}

export const MEASURING_TIPS: { label: string; tip: string }[] = [
  { label: "Height", tip: "Stand straight against a wall without shoes and measure from the top of your head to the floor." },
  { label: "Bust", tip: "Measure around the fullest part of your bust, keeping the tape level under your arms." },
  { label: "Waist", tip: "Measure around the narrowest part of your waist, usually just above the belly button." },
  { label: "Hips", tip: "Stand with your feet together and measure around the fullest part of your hips." },
];
