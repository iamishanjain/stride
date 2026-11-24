import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WeekStrip } from 'panelui-native';
import { Activity } from '../../tracking/types/tracking.types';

type Props = { selectedDate: Date; onSelect: (date: Date) => void; activities: Activity[] };

export function WeeklyActivityCalendar({ selectedDate, onSelect, activities }: Props) {
  return (
    <View style={styles.wrap}>
      <WeekStrip
        size="sm"
        value={selectedDate}
        onValueChange={onSelect}
        weekStartsOn="auto"
        today={new Date()}
        marks={(date) => activities.some((activity) => {
          const runDate = new Date(activity.startedAt);
          return runDate.getFullYear() === date.getFullYear()
            && runDate.getMonth() === date.getMonth()
            && runDate.getDate() === date.getDate();
        }) ? { dots: ['primary'], corner: 'success' } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { marginBottom: 14 } });
