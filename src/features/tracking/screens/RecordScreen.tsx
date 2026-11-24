import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TrackingMap } from '../components/TrackingMap';
import { TrackingStats } from '../components/TrackingStats';
import { TrackingControls } from '../components/TrackingControls';
import { GPSStatusIndicator } from '../components/GPSStatusIndicator';
import { useTrackingStore } from '../state/trackingStore';
import { palette, radii, spacing } from '../../../ui/theme';

export function RecordScreen({ onStart }: { onStart: () => void }) {
  const status = useTrackingStore((state) => state.status);
  const points = useTrackingStore((state) => state.points);
  const distanceMeters = useTrackingStore((state) => state.distanceMeters);
  const elapsedSeconds = useTrackingStore((state) => state.elapsedSeconds);
  const accuracy = useTrackingStore((state) => state.accuracy);
  const currentLocation = useTrackingStore((state) => state.currentLocation);
  const lastError = useTrackingStore((state) => state.lastError);
  const pause = useTrackingStore((state) => state.pause);
  const resume = useTrackingStore((state) => state.resume);
  const finish = useTrackingStore((state) => state.finish);
  const reset = useTrackingStore((state) => state.reset);
  const title = status === 'finished' ? 'Run complete' : status === 'idle' ? 'Ready to run?' : status === 'paused' ? 'Run paused' : 'You’re moving';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.map}><TrackingMap points={points} currentLocation={currentLocation} finished={status === 'finished'} /></View>
      <GPSStatusIndicator accuracy={accuracy} error={lastError} />
      <TrackingStats distanceMeters={distanceMeters} elapsedSeconds={elapsedSeconds} />
      <TrackingControls status={status} onStart={onStart} onPause={pause} onResume={resume} onFinish={finish} onNew={reset} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: 18, paddingBottom: 118, flexGrow: 1 },
  title: { color: palette.textInverse, fontSize: 27, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7, marginBottom: 16 },
  map: { height: 300, borderRadius: radii.lg, overflow: 'hidden', marginBottom: 14 },
});
