import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity } from '../types/tracking.types';
import { formatDuration } from './ActivityCard';
import { formatPace } from '../services/ActivityAnalytics';

export function PaceSection({ activity }: { activity: Activity }) {
  const average = activity.elapsedSeconds / (activity.distanceMeters / 1000);
  const movingTime = activity.elapsedSeconds;
  const bars = Array.from({ length: 28 }, (_, index) => {
    const variation = 0.72 + (Math.sin(index * 1.7) + 1) * 0.18 + (index % 7 === 0 ? 0.2 : 0);
    return Math.min(1, Math.max(0.2, variation));
  });

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
  section: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, marginTop: 14 },
  title: { color: '#111827', fontSize: 25, fontWeight: '800', marginBottom: 14 },
  chart: { height: 180, flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#D0D5DD', backgroundColor: '#F8FAFC', overflow: 'hidden' },
  bar: { flex: 1, backgroundColor: '#54C8E8', marginHorizontal: 1 },
  metric: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E4E7EC' },
  label: { color: '#667085', fontSize: 16 },
  value: { color: '#111827', fontSize: 22, fontWeight: '800' },
});
