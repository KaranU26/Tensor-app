/**
 * Plate Calculator Hook
 * Handles plate math logic for gym weight calculations
 */

import { useState, useCallback, useMemo } from 'react';

export interface PlateConfig {
  weight: number;
  count: number;
  color: string;
}

// Standard plates in lbs
export const PLATES_LBS: PlateConfig[] = [
  { weight: 45, count: 0, color: '#E53935' },   // Red
  { weight: 35, count: 0, color: '#FDD835' },   // Yellow
  { weight: 25, count: 0, color: '#43A047' },   // Green
  { weight: 10, count: 0, color: '#1E88E5' },   // Blue
  { weight: 5, count: 0, color: '#8E24AA' },    // Purple
  { weight: 2.5, count: 0, color: '#757575' },  // Gray
];

// Standard plates in kg
export const PLATES_KG: PlateConfig[] = [
  { weight: 25, count: 0, color: '#E53935' },   // Red
  { weight: 20, count: 0, color: '#1E88E5' },   // Blue
  { weight: 15, count: 0, color: '#FDD835' },   // Yellow
  { weight: 10, count: 0, color: '#43A047' },   // Green
  { weight: 5, count: 0, color: '#8E24AA' },    // Purple
  { weight: 2.5, count: 0, color: '#E53935' },  // Red (small)
  { weight: 1.25, count: 0, color: '#757575' }, // Gray
];

export type Unit = 'lbs' | 'kg';

interface UsePlateCalculatorOptions {
  unit?: Unit;
  barWeight?: number;
}

interface UsePlateCalculatorReturn {
  plates: PlateConfig[];
  barWeight: number;
  totalWeight: number;
  plateWeightPerSide: number;
  unit: Unit;
  addPlate: (weight: number) => void;
  removePlate: (weight: number) => void;
  setPlateCount: (weight: number, count: number) => void;
  setBarWeight: (weight: number) => void;
  setUnit: (unit: Unit) => void;
  clear: () => void;
  setTotalWeight: (total: number) => void;
  getPlateBreakdown: () => string;
}

export function usePlateCalculator(
  options: UsePlateCalculatorOptions = {}
): UsePlateCalculatorReturn {
  const [unit, setUnit] = useState<Unit>(options.unit || 'lbs');
  const [barWeight, setBarWeight] = useState(
    options.barWeight || (options.unit === 'kg' ? 20 : 45)
  );
  
  const initialPlates = unit === 'lbs' ? PLATES_LBS : PLATES_KG;
  const [plates, setPlates] = useState<PlateConfig[]>(
    initialPlates.map(p => ({ ...p }))
  );

  // Calculate total weight
  const { totalWeight, plateWeightPerSide } = useMemo(() => {
    const perSide = plates.reduce((sum, p) => sum + p.weight * p.count, 0);
    return {
      plateWeightPerSide: perSide,
      totalWeight: barWeight + perSide * 2, // Both sides
    };
  }, [plates, barWeight]);

  const addPlate = useCallback((weight: number) => {
    setPlates((prev) =>
      prev.map((p) =>
        p.weight === weight ? { ...p, count: p.count + 1 } : p
      )
    );
  }, []);

  const removePlate = useCallback((weight: number) => {
    setPlates((prev) =>
      prev.map((p) =>
        p.weight === weight ? { ...p, count: Math.max(0, p.count - 1) } : p
      )
    );
  }, []);

  const setPlateCount = useCallback((weight: number, count: number) => {
    setPlates((prev) =>
      prev.map((p) =>
        p.weight === weight ? { ...p, count: Math.max(0, count) } : p
      )
    );
  }, []);

  const clear = useCallback(() => {
    setPlates((prev) => prev.map((p) => ({ ...p, count: 0 })));
  }, []);

  const handleSetUnit = useCallback((newUnit: Unit) => {
    setUnit(newUnit);
    setBarWeight(newUnit === 'kg' ? 20 : 45);
    setPlates(
      (newUnit === 'lbs' ? PLATES_LBS : PLATES_KG).map((p) => ({ ...p }))
    );
  }, []);

  // Set total and calculate plates needed
  const setTotalWeight = useCallback((total: number) => {
    const perSide = (total - barWeight) / 2;
    if (perSide < 0) {
      clear();
      return;
    }

    // Greedy algorithm to calculate plates
    const availablePlates = unit === 'lbs' ? PLATES_LBS : PLATES_KG;
    const newPlates = availablePlates.map((p) => ({ ...p, count: 0 }));
    
    let remaining = perSide;
    for (const plate of newPlates) {
      while (remaining >= plate.weight) {
        plate.count++;
        remaining -= plate.weight;
      }
    }
    
    setPlates(newPlates);
  }, [barWeight, unit, clear]);

  // Get human-readable breakdown
  const getPlateBreakdown = useCallback(() => {
    const used = plates.filter((p) => p.count > 0);
    if (used.length === 0) return 'Empty bar';
    
    return used
      .map((p) => `${p.count}×${p.weight}${unit}`)
      .join(' + ');
  }, [plates, unit]);

  return {
    plates,
    barWeight,
    totalWeight,
    plateWeightPerSide,
    unit,
    addPlate,
    removePlate,
    setPlateCount,
    setBarWeight,
    setUnit: handleSetUnit,
    clear,
    setTotalWeight,
    getPlateBreakdown,
  };
}

export default usePlateCalculator;
