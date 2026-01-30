/**
 * Victory Native Charts - Progress visualization components
 * Using CartesianChart for Expo/React Native compatibility
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';
import { colors, typography, spacing } from '@/config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2 - spacing.md * 2;
const CHART_HEIGHT = 160;

interface DataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
}

// ============================================
// Progress Line Chart (SVG-based)
// ============================================

interface ProgressLineChartProps {
  data: DataPoint[];
  title?: string;
  yLabel?: string;
  color?: string;
}

export function ProgressLineChart({
  data,
  title,
  yLabel = 'Weight (lbs)',
  color = colors.primary,
}: ProgressLineChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const values = data.map((d) => d.y);
  const minY = Math.min(...values) * 0.9;
  const maxY = Math.max(...values) * 1.1;
  const rangeY = maxY - minY || 1;

  const getX = (index: number) => (index / (data.length - 1)) * CHART_WIDTH;
  const getY = (value: number) => CHART_HEIGHT - ((value - minY) / rangeY) * CHART_HEIGHT;

  // Build path
  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.y)}`)
    .join(' ');

  // Area fill path (close to bottom)
  const areaD = `${pathD} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;

  return (
    <View style={styles.chartContainer}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      <View style={styles.chartWithAxis}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{Math.round(maxY)}</Text>
          <Text style={styles.axisLabel}>{Math.round((maxY + minY) / 2)}</Text>
          <Text style={styles.axisLabel}>{Math.round(minY)}</Text>
        </View>
        
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 20}>
          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, i) => (
            <Line
              key={i}
              x1={0}
              y1={CHART_HEIGHT * ratio}
              x2={CHART_WIDTH}
              y2={CHART_HEIGHT * ratio}
              stroke={colors.borderLight}
              strokeDasharray="4,4"
            />
          ))}
          
          {/* Area fill */}
          <Path d={areaD} fill={color} opacity={0.1} />
          
          {/* Line */}
          <Path d={pathD} stroke={color} strokeWidth={2} fill="none" />
          
          {/* Data points */}
          {data.map((d, i) => (
            <Circle
              key={i}
              cx={getX(i)}
              cy={getY(d.y)}
              r={4}
              fill={colors.background}
              stroke={color}
              strokeWidth={2}
            />
          ))}
        </Svg>
      </View>
    </View>
  );
}

// ============================================
// Volume Bar Chart
// ============================================

interface VolumeBarChartProps {
  data: DataPoint[];
  title?: string;
}

export function VolumeBarChart({ data, title }: VolumeBarChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.y), 1);
  const barWidth = (CHART_WIDTH - (data.length - 1) * 8) / data.length;

  return (
    <View style={styles.chartContainer}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 30}>
        {data.map((d, i) => {
          const barHeight = (d.y / maxValue) * CHART_HEIGHT;
          const x = i * (barWidth + 8);
          const isMax = d.y === maxValue;
          
          return (
            <G key={i}>
              <Rect
                x={x}
                y={CHART_HEIGHT - barHeight}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={isMax ? colors.primary : colors.chartBlue}
                opacity={0.8 + (d.y / maxValue) * 0.2}
              />
              {/* Label */}
              <Text
                style={[styles.barLabel, { position: 'absolute' }]}
              >
                {String(d.x)}
              </Text>
            </G>
          );
        })}
      </Svg>
      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {data.map((d, i) => (
          <Text key={i} style={styles.xLabel}>
            {String(d.x).substring(0, 3)}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ============================================
// Muscle Distribution Chart
// ============================================

interface MuscleDistributionData {
  muscle: string;
  sets: number;
  color: string;
}

interface MuscleDistributionChartProps {
  data: MuscleDistributionData[];
  title?: string;
}

export function MuscleDistributionChart({
  data,
  title,
}: MuscleDistributionChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const maxSets = Math.max(...data.map((d) => d.sets), 1);

  return (
    <View style={styles.chartContainer}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      {data.slice(0, 6).map((item, i) => (
        <View key={i} style={styles.distributionRow}>
          <Text style={styles.distributionLabel}>{item.muscle}</Text>
          <View style={styles.distributionBarBg}>
            <View
              style={[
                styles.distributionBarFill,
                {
                  width: `${(item.sets / maxSets) * 100}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
          </View>
          <Text style={styles.distributionValue}>{item.sets}</Text>
        </View>
      ))}
    </View>
  );
}

// ============================================
// Comparison Chart
// ============================================

interface ComparisonChartProps {
  currentData: DataPoint[];
  previousData: DataPoint[];
  title?: string;
  labels?: [string, string];
}

export function ComparisonChart({
  currentData,
  previousData,
  title,
  labels = ['This Week', 'Last Week'],
}: ComparisonChartProps) {
  const allValues = [...currentData.map((d) => d.y), ...previousData.map((d) => d.y)];
  const maxValue = Math.max(...allValues, 1);
  const barWidth = (CHART_WIDTH - (currentData.length * 2 - 1) * 8) / (currentData.length * 2);

  return (
    <View style={styles.chartContainer}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {currentData.map((d, i) => {
          const prevValue = previousData[i]?.y || 0;
          const currHeight = (d.y / maxValue) * CHART_HEIGHT;
          const prevHeight = (prevValue / maxValue) * CHART_HEIGHT;
          const groupX = i * (barWidth * 2 + 16);
          
          return (
            <G key={i}>
              {/* Previous */}
              <Rect
                x={groupX}
                y={CHART_HEIGHT - prevHeight}
                width={barWidth}
                height={prevHeight}
                rx={2}
                fill={colors.border}
              />
              {/* Current */}
              <Rect
                x={groupX + barWidth + 4}
                y={CHART_HEIGHT - currHeight}
                width={barWidth}
                height={currHeight}
                rx={2}
                fill={colors.primary}
              />
            </G>
          );
        })}
      </Svg>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>{labels[0]}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
          <Text style={styles.legendText}>{labels[1]}</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================
// Sparkline
// ============================================

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 30,
  color = colors.primary,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const getX = (i: number) => (i / (data.length - 1)) * width;
  const getY = (v: number) => height - ((v - min) / range) * (height - 4) - 2;

  const pathD = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');

  return (
    <Svg width={width} height={height}>
      <Path d={pathD} stroke={color} strokeWidth={2} fill="none" />
      <Circle
        cx={width}
        cy={getY(data[data.length - 1])}
        r={3}
        fill={colors.background}
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chartTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chartWithAxis: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  axisLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    textAlign: 'right',
    paddingRight: spacing.xs,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xs,
  },
  xLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  barLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  distributionLabel: {
    width: 80,
    ...typography.caption1,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  distributionBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: colors.surface,
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  distributionValue: {
    width: 30,
    ...typography.caption1,
    color: colors.text,
    textAlign: 'right',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
});

export default {
  ProgressLineChart,
  VolumeBarChart,
  MuscleDistributionChart,
  ComparisonChart,
  Sparkline,
};
