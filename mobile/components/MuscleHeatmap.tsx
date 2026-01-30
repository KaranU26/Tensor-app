import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface MuscleHeatmapProps {
  muscleVolume: Record<string, number>; // e.g., { chest: 12, biceps: 6, quads: 8 }
  showLabels?: boolean;
  maxVolume?: number;
}

// Muscle path definitions for front and back body
// Simplified anatomical paths for React Native SVG
const FRONT_MUSCLES = {
  chest: 'M 22,25 C 22,28 28,32 35,32 C 42,32 48,28 48,25 L 48,35 C 48,38 42,42 35,42 C 28,42 22,38 22,35 Z',
  shoulders: 'M 15,22 C 12,24 12,30 15,32 L 22,30 L 22,24 Z M 55,22 C 58,24 58,30 55,32 L 48,30 L 48,24 Z',
  biceps: 'M 12,34 C 10,36 10,45 12,50 L 18,48 L 18,36 Z M 58,34 C 60,36 60,45 58,50 L 52,48 L 52,36 Z',
  forearms: 'M 10,52 C 8,56 8,65 12,70 L 18,68 L 18,54 Z M 60,52 C 62,56 62,65 58,70 L 52,68 L 52,54 Z',
  abs: 'M 28,42 L 42,42 L 42,65 L 28,65 Z',
  core: 'M 28,42 L 42,42 L 42,65 L 28,65 Z', // alias for abs
  obliques: 'M 22,45 L 28,45 L 28,62 L 22,62 Z M 42,45 L 48,45 L 48,62 L 42,62 Z',
  quads: 'M 24,68 L 32,68 L 34,95 L 22,95 Z M 38,68 L 46,68 L 48,95 L 36,95 Z',
  calves: 'M 24,100 L 30,100 L 30,118 L 24,118 Z M 40,100 L 46,100 L 46,118 L 40,118 Z',
};

const BACK_MUSCLES = {
  traps: 'M 28,18 L 42,18 L 45,25 L 25,25 Z',
  upper_back: 'M 25,26 L 45,26 L 45,35 L 25,35 Z',
  back: 'M 25,26 L 45,26 L 45,35 L 25,35 Z', // alias
  lats: 'M 22,36 L 28,36 L 28,55 L 22,55 Z M 42,36 L 48,36 L 48,55 L 42,55 Z',
  lower_back: 'M 28,45 L 42,45 L 42,60 L 28,60 Z',
  rear_delts: 'M 15,22 C 12,24 14,28 16,30 L 22,28 L 22,24 Z M 55,22 C 58,24 56,28 54,30 L 48,28 L 48,24 Z',
  triceps: 'M 12,34 C 10,36 10,45 12,50 L 18,48 L 18,36 Z M 58,34 C 60,36 60,45 58,50 L 52,48 L 52,36 Z',
  glutes: 'M 24,62 L 46,62 L 48,75 L 22,75 Z',
  hamstrings: 'M 24,78 L 32,78 L 34,100 L 22,100 Z M 38,78 L 46,78 L 48,100 L 36,100 Z',
};

// Map muscle names to display names
const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Chest',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  core: 'Core',
  obliques: 'Obliques',
  quads: 'Quads',
  calves: 'Calves',
  traps: 'Traps',
  upper_back: 'Upper Back',
  back: 'Back',
  lats: 'Lats',
  lower_back: 'Lower Back',
  rear_delts: 'Rear Delts',
  glutes: 'Glutes',
  hamstrings: 'Hamstrings',
};

/**
 * Get color based on volume intensity (green -> yellow -> red)
 */
function getHeatColor(volume: number, maxVolume: number): string {
  if (volume === 0) return '#e0e0e0'; // Gray for unused
  
  const ratio = Math.min(volume / maxVolume, 1);
  
  if (ratio < 0.33) {
    // Light green (low volume)
    return `rgba(76, 175, 80, ${0.3 + ratio * 1.5})`;
  } else if (ratio < 0.66) {
    // Yellow-orange (medium volume)
    return `rgba(255, 193, 7, ${0.5 + ratio * 0.5})`;
  } else {
    // Red (high volume)
    return `rgba(244, 67, 54, ${0.6 + ratio * 0.4})`;
  }
}

export default function MuscleHeatmap({ 
  muscleVolume, 
  showLabels = true,
  maxVolume = 20 
}: MuscleHeatmapProps) {
  
  // Render muscle paths for one body view
  const renderMuscles = (muscles: Record<string, string>, offsetX: number = 0) => {
    return Object.entries(muscles).map(([muscle, path]) => {
      const volume = muscleVolume[muscle] || 0;
      const color = getHeatColor(volume, maxVolume);
      
      return (
        <Path
          key={`${muscle}-${offsetX}`}
          d={path}
          fill={color}
          stroke="#333"
          strokeWidth={0.5}
          transform={`translate(${offsetX}, 0)`}
        />
      );
    });
  };

  // Get worked muscles for legend
  const workedMuscles = Object.entries(muscleVolume)
    .filter(([_, vol]) => vol > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6); // Top 6 muscles

  return (
    <View style={styles.container}>
      <View style={styles.bodyContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 150 130">
          {/* Front body */}
          <G>
            {renderMuscles(FRONT_MUSCLES, 0)}
          </G>
          
          {/* Back body */}
          <G>
            {renderMuscles(BACK_MUSCLES, 75)}
          </G>
        </Svg>
        
        {/* Labels */}
        <View style={styles.viewLabels}>
          <Text style={styles.viewLabel}>Front</Text>
          <Text style={styles.viewLabel}>Back</Text>
        </View>
      </View>

      {showLabels && workedMuscles.length > 0 && (
        <View style={styles.legend}>
          {workedMuscles.map(([muscle, volume]) => (
            <View key={muscle} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor,
                  { backgroundColor: getHeatColor(volume, maxVolume) }
                ]} 
              />
              <Text style={styles.legendText}>
                {MUSCLE_LABELS[muscle] || muscle}: {volume} sets
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.intensityScale}>
        <Text style={styles.scaleLabel}>Low</Text>
        <View style={styles.scaleBar}>
          <View style={[styles.scaleSegment, { backgroundColor: 'rgba(76, 175, 80, 0.6)' }]} />
          <View style={[styles.scaleSegment, { backgroundColor: 'rgba(255, 193, 7, 0.8)' }]} />
          <View style={[styles.scaleSegment, { backgroundColor: 'rgba(244, 67, 54, 0.9)' }]} />
        </View>
        <Text style={styles.scaleLabel}>High</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  bodyContainer: {
    height: 200,
    marginBottom: 16,
  },
  viewLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  viewLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
  intensityScale: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleLabel: {
    fontSize: 10,
    color: '#888',
    marginHorizontal: 8,
  },
  scaleBar: {
    flexDirection: 'row',
    width: 100,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scaleSegment: {
    flex: 1,
  },
});
