import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity } from '../types/tracking.types';
import { formatDuration } from './ActivityCard';
import { formatPace } from '../services/ActivityAnalytics';
import { palette, radii } from '../../../ui/theme';

export function PaceSection({ activity }: { activity: Activity }) {
  const average = activity.elapsedSeconds / (activity.distanceMeters / 1000);
  const movingTime = activity.elapsedSeconds;
  const bars = activity.points.length > 1
    ? activity.points.slice(1).map((point, index) => {
        const previous = activity.points[index];
        const elapsed = Math.max(1, (point.timestamp - previous.timestamp) / 1000);
        const pace = elapsed / (1 / 1000);
        const normalized = 1 - Math.min(0.8, Math.max(0, (pace - 180) / 300));
        return Math.min(1, Math.max(0.15, normalized));
      }).slice(-40)
    : Array.from({ length: 28 }, () => 0.5);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Pace</Text>
      <View style={styles.chart}>
        {bars.map((height, index) => (
          <View key={index} style={[styles.bar, { height: `${height * 100}%` }]} />
        ))}
      </View>
      <View style={styles.metric}><Text style={styles.label}>Avg Pace</Text><Text style={styles.value}>{formatPace(average)} /km</Text></View>
      <View style={styles.metric}><Text style={styles.label}>Moving Time</Text><Text style={styles.value}>{formatDuration(movingTime)}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: 18, marginTop: 14, borderWidth: 1, borderColor: palette.line },
  title: { color: '#111827', fontSize: 25, fontWeight: '800', marginBottom: 14 },
  chart: { height: 180, flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#D0D5DD', backgroundColor: '#F8FAFC', overflow: 'hidden' },
  bar: { flex: 1, backgroundColor: palette.blue, marginHorizontal: 1 },
  metric: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E4E7EC' },
  label: { color: '#667085', fontSize: 16 },
  value: { color: '#111827', fontSize: 22, fontWeight: '800' },
});
