import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { averagePaceMinutesPerKilometer, averageSpeedKmh, formatDuration, formatPace } from '../services/PaceCalculator';

type Props = { distanceMeters: number; elapsedSeconds: number };

export function TrackingStats({ distanceMeters, elapsedSeconds }: Props) {
  const pace = averagePaceMinutesPerKilometer(distanceMeters, elapsedSeconds);
  return (
    <View style={styles.grid}>
      <View style={styles.primaryStat}><Text style={styles.primaryValue}>{(distanceMeters / 1000).toFixed(2)}</Text><Text style={styles.unit}>KM</Text></View>
      <View style={styles.primaryStat}><Text style={styles.primaryValue}>{formatDuration(elapsedSeconds)}</Text><Text style={styles.unit}>TIME</Text></View>
      <View style={styles.stat}><Text style={styles.value}>{formatPace(pace)}</Text><Text style={styles.unit}>MIN / KM</Text></View>
      <View style={styles.stat}><Text style={styles.value}>{averageSpeedKmh(distanceMeters, elapsedSeconds).toFixed(1)}</Text><Text style={styles.unit}>KM / H</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginVertical: 18 },
  primaryStat: { width: '47%', backgroundColor: '#18221E', padding: 16, borderRadius: 16 },
  stat: { width: '47%', backgroundColor: '#121916', padding: 14, borderRadius: 16 },
  primaryValue: { color: '#F3F7F4', fontSize: 28, fontWeight: '700' },
  value: { color: '#F3F7F4', fontSize: 21, fontWeight: '700' },
  unit: { color: '#8D9A92', fontSize: 11, letterSpacing: 1.2, marginTop: 6 },
});
