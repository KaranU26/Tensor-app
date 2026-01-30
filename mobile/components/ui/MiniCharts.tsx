import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Circle, Path } from 'react-native-svg';
import { colors } from '@/config/theme';

interface MiniBarChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function MiniBarChart({ 
  data, 
  width = 80, 
  height = 30,
  color = colors.primary,
}: MiniBarChartProps) {
  const max = Math.max(...data, 1);
  const barWidth = (width - (data.length - 1) * 2) / data.length;
  
  return (
    <Svg width={width} height={height}>
      {data.map((value, index) => {
        const barHeight = (value / max) * height * 0.9;
        return (
          <Rect
            key={index}
            x={index * (barWidth + 2)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx={2}
            fill={color}
            opacity={0.8 + (value / max) * 0.2}
          />
        );
      })}
    </Svg>
  );
}

interface MiniLineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function MiniLineChart({ 
  data, 
  width = 80, 
  height = 30,
  color = colors.primary,
}: MiniLineChartProps) {
  if (data.length < 2) return null;
  
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height * 0.8 - 2;
    return `${x},${y}`;
  }).join(' ');
  
  const lastPoint = data[data.length - 1];
  const lastX = width;
  const lastY = height - ((lastPoint - min) / range) * height * 0.8 - 2;
  
  return (
    <Svg width={width} height={height}>
      <Path
        d={`M ${points}`}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={lastX}
        cy={lastY}
        r={3}
        fill={colors.background}
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

interface SleepBarProps {
  sleepHours: number;
  maxHours?: number;
  width?: number;
  height?: number;
}

export function SleepBar({ 
  sleepHours, 
  maxHours = 10,
  width = 80, 
  height = 16,
}: SleepBarProps) {
  const segmentCount = 8;
  const segmentWidth = (width - (segmentCount - 1) * 2) / segmentCount;
  const filledSegments = Math.round((sleepHours / maxHours) * segmentCount);
  
  return (
    <Svg width={width} height={height}>
      {Array.from({ length: segmentCount }).map((_, index) => {
        const isFilled = index < filledSegments;
        const isDeepSleep = index >= 2 && index <= 5;
        
        return (
          <Rect
            key={index}
            x={index * (segmentWidth + 2)}
            y={0}
            width={segmentWidth}
            height={height}
            rx={2}
            fill={isFilled 
              ? (isDeepSleep ? colors.chartBlue : colors.primary)
              : colors.border
            }
          />
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({});

export default { MiniBarChart, MiniLineChart, SleepBar };
