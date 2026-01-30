import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_WIDTH = (SCREEN_WIDTH - spacing.lg * 2) / 7;

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  startDate?: Date;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarStrip({ 
  selectedDate, 
  onDateSelect,
  startDate = new Date(),
}: CalendarStripProps) {
  // Get week dates starting from Sunday
  const getWeekDates = () => {
    const sunday = new Date(startDate);
    sunday.setDate(startDate.getDate() - startDate.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      return date;
    });
  };
  
  const weekDates = getWeekDates();
  const today = new Date();
  
  const isSelected = (date: Date) => 
    date.toDateString() === selectedDate.toDateString();
  
  const isToday = (date: Date) => 
    date.toDateString() === today.toDateString();

  return (
    <View style={styles.container}>
      {weekDates.map((date, index) => {
        const selected = isSelected(date);
        const todayDate = isToday(date);
        
        return (
          <Pressable
            key={index}
            onPress={() => onDateSelect(date)}
            style={styles.dayContainer}
          >
            <Text style={[
              styles.dayName,
              selected && styles.dayNameSelected,
            ]}>
              {DAYS[index]}
            </Text>
            <View style={[
              styles.dateCircle,
              selected && styles.dateCircleSelected,
              todayDate && !selected && styles.dateCircleToday,
            ]}>
              <Text style={[
                styles.dateNumber,
                selected && styles.dateNumberSelected,
              ]}>
                {date.getDate()}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dayContainer: {
    alignItems: 'center',
    width: DAY_WIDTH,
  },
  dayName: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dayNameSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleSelected: {
    backgroundColor: colors.primary,
  },
  dateCircleToday: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dateNumber: {
    ...typography.headline,
    color: colors.text,
  },
  dateNumberSelected: {
    color: colors.textInverse,
  },
});

export default CalendarStrip;
