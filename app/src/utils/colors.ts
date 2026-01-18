// Color palette for facilities
// Using a combination of D3's Tableau10 and additional distinct colors
// to support up to 13+ facilities with good visual differentiation

const COLORS = [
  '#4e79a7', // Steel blue
  '#f28e2c', // Orange
  '#e15759', // Red
  '#76b7b2', // Teal
  '#59a14f', // Green
  '#edc949', // Yellow
  '#af7aa1', // Purple
  '#ff9da7', // Pink
  '#9c755f', // Brown
  '#bab0ab', // Gray
  '#6b6ecf', // Indigo
  '#17becf', // Cyan
  '#8c6d31', // Olive
];

export function getFacilityColor(facilityIndex: number): string {
  return COLORS[facilityIndex % COLORS.length];
}

export function createColorMap(facilities: string[]): Map<string, string> {
  const colorMap = new Map<string, string>();
  facilities.forEach((facility, index) => {
    colorMap.set(facility, getFacilityColor(index));
  });
  return colorMap;
}
