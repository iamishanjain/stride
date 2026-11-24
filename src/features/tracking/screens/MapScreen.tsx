import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TrackingMap } from '../components/TrackingMap';
import { GPSStatusIndicator } from '../components/GPSStatusIndicator';
import { useTrackingStore } from '../state/trackingStore';
import { palette, radii, spacing } from '../../../ui/theme';

export function MapScreen() {
  const points = useTrackingStore((state) => state.points);
  const currentLocation = useTrackingStore((state) => state.currentLocation);
  const status = useTrackingStore((state) => state.status);
  const accuracy = useTrackingStore((state) => state.accuracy);
  const lastError = useTrackingStore((state) => state.lastError);
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Live Map</Text>
      <View style={styles.map}><TrackingMap points={points} currentLocation={currentLocation} finished={status === 'finished'} /></View>
      <GPSStatusIndicator accuracy={accuracy} error={lastError} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: 18, paddingBottom: 118, flexGrow: 1 },
  title: { color: palette.textInverse, fontSize: 27, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7, marginBottom: 16 },
  map: { height: 300, borderRadius: radii.lg, overflow: 'hidden', marginBottom: 14 },
});
