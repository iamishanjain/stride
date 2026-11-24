import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity } from '../../tracking/types/tracking.types';
import { palette, radii } from '../../../ui/theme';

export function formatDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

type Props = { distanceMeters: number; elapsedSeconds: number; activities: Activity[] };

export function ProgressOverview({ distanceMeters, elapsedSeconds, activities }: Props) {
  const totalDistance = activities.reduce((total, activity) => total + activity.distanceMeters, 0) / 1000;
  return (
    <>
      <Text style={styles.title}>Your Progress</Text>
      <View style={styles.grid}>
        <View style={styles.distanceCard}>
          <View style={styles.metricHeading}><Text style={styles.metricIcon}>↔</Text><Text style={styles.metricLabel}>Distance</Text></View>
          <Text style={styles.distanceValue}>{(distanceMeters / 1000).toFixed(1)}km</Text>
        </View>
        <View style={styles.right}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>♙  Top Performance</Text>
            <Text style={styles.cardValue}>{totalDistance.toFixed(1)}km</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>♧  Your Weekly Pace</Text>
            <Text style={styles.cardValue}>{elapsedSeconds ? formatDuration(elapsedSeconds) : '8:30'} /km</Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: { color: palette.textInverse, fontSize: 27, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7, marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 12, height: 210, marginBottom: 24 },
  distanceCard: { flex: 1.05, borderRadius: radii.lg, backgroundColor: '#162019', borderWidth: 1, borderColor: '#212B24', padding: 18, justifyContent: 'space-between' },
  metricHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metricIcon: { color: palette.textInverseMuted, fontSize: 22 },
  metricLabel: { color: palette.textInverseMuted, fontSize: 14, fontWeight: '700' },
  distanceValue: { color: palette.textInverse, fontSize: 42, lineHeight: 48, fontWeight: '900', letterSpacing: -1.5 },
  right: { flex: 0.95, gap: 12 },
  card: { flex: 1, borderRadius: radii.lg, backgroundColor: '#162019', borderWidth: 1, borderColor: '#212B24', padding: 16, justifyContent: 'space-between' },
  cardLabel: { color: palette.textInverseMuted, fontSize: 12, lineHeight: 16, fontWeight: '700' },
  cardValue: { color: palette.textInverse, fontSize: 23, lineHeight: 28, fontWeight: '900' },
});
