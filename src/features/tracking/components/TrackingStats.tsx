import React from 'react';
import { StyleSheet, View } from 'react-native';
import { averagePaceMinutesPerKilometer, averageSpeedKmh, formatDuration, formatPace } from '../services/PaceCalculator';
import { palette, radii } from '../../../ui/theme';
import { Card, Metric } from '../../../ui/UiComponents';

type Props = { distanceMeters: number; elapsedSeconds: number };

export function TrackingStats({ distanceMeters, elapsedSeconds }: Props) {
  const pace = averagePaceMinutesPerKilometer(distanceMeters, elapsedSeconds);
  return (
    <Card dark style={styles.grid}>
      <View style={styles.primaryRow}>
        <Metric value={(distanceMeters / 1000).toFixed(2)} label="Kilometres" accent />
        <Metric value={formatDuration(elapsedSeconds)} label="Elapsed time" />
      </View>
      <View style={styles.divider} />
      <View style={styles.secondaryRow}>
        <Metric value={formatPace(pace)} label="Avg pace / km" />
        <Metric value={averageSpeedKmh(distanceMeters, elapsedSeconds).toFixed(1)} label="Kilometres / hour" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { marginVertical: 14, borderRadius: radii.lg },
  primaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 14 },
  divider: { height: 1, backgroundColor: palette.lineDark },
  secondaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14 },
});
