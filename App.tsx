import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TrackingMap } from './src/features/tracking/components/TrackingMap';
import { TrackingStats } from './src/features/tracking/components/TrackingStats';
import { TrackingControls } from './src/features/tracking/components/TrackingControls';
import { GPSStatusIndicator } from './src/features/tracking/components/GPSStatusIndicator';
import { useTracking } from './src/features/tracking/hooks/useTracking';
import { storeToActivity, useTrackingStore } from './src/features/tracking/state/trackingStore';
import { saveActivity, saveActivityMetadata } from './src/database/repositories/ActivityRepository';
import './src/features/tracking/services/BackgroundLocationTask';

export default function App() {
  const status = useTrackingStore((state) => state.status);
  const points = useTrackingStore((state) => state.points);
  const distanceMeters = useTrackingStore((state) => state.distanceMeters);
  const elapsedSeconds = useTrackingStore((state) => state.elapsedSeconds);
  const accuracy = useTrackingStore((state) => state.accuracy);
  const lastError = useTrackingStore((state) => state.lastError);
  const start = useTrackingStore((state) => state.start);
  const pause = useTrackingStore((state) => state.pause);
  const resume = useTrackingStore((state) => state.resume);
  const finish = useTrackingStore((state) => state.finish);
  const complete = useTrackingStore((state) => state.complete);
  const reset = useTrackingStore((state) => state.reset);
  const setElapsedSeconds = useTrackingStore((state) => state.setElapsedSeconds);
  useTracking();

  useEffect(() => {
    const state = useTrackingStore.getState();
    if (status === 'recording' && state.activityId && state.startedAt) {
      void saveActivityMetadata({
        id: state.activityId,
        startedAt: state.startedAt,
        distanceMeters,
        elapsedSeconds,
        status,
      }).catch((error: unknown) => useTrackingStore.getState().setError(error instanceof Error ? error.message : 'Unable to initialize local run storage.'));
    }
  }, [status, distanceMeters, elapsedSeconds]);

  useEffect(() => {
    if (status !== 'recording' && status !== 'paused') return;
    const timer = setInterval(() => {
      const state = useTrackingStore.getState();
      if (state.startedAt == null) return;
      const pausedSeconds = state.pausedDurationSeconds + (state.pausedAt ? (Date.now() - state.pausedAt) / 1000 : 0);
      setElapsedSeconds((Date.now() - state.startedAt) / 1000 - pausedSeconds);
    }, 1000);
    return () => clearInterval(timer);
  }, [status, setElapsedSeconds]);

  useEffect(() => {
    if (status !== 'finishing') return;
    const activity = storeToActivity(useTrackingStore.getState());
    if (!activity) return;
    void saveActivity({ ...activity, status: 'finished' })
      .then(() => complete())
      .catch((error: unknown) => useTrackingStore.getState().setError(error instanceof Error ? error.message : 'Unable to save this run.'));
  }, [status, complete]);

  const currentLocation = points.at(-1) ?? null;
  const title = status === 'finished' ? 'Run complete' : status === 'idle' ? 'Ready to run?' : status === 'paused' ? 'Run paused' : 'You’re moving';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}><View><Text style={styles.eyebrow}>STRIDE</Text><Text style={styles.title}>{title}</Text></View><Text style={styles.status}>{status.toUpperCase()}</Text></View>
        <View style={styles.mapWrap}><TrackingMap points={points} currentLocation={currentLocation} finished={status === 'finished'} /></View>
        <GPSStatusIndicator accuracy={accuracy} error={lastError} />
        <TrackingStats distanceMeters={distanceMeters} elapsedSeconds={elapsedSeconds} />
        <TrackingControls status={status} onStart={start} onPause={pause} onResume={resume} onFinish={finish} onNew={reset} />
        <Text style={styles.caption}>Foreground GPS tracking is active. Background tracking requires a development build and additional platform testing.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B100D' },
  content: { padding: 20, paddingBottom: 36, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 },
  eyebrow: { color: '#58D68D', fontWeight: '800', letterSpacing: 2, fontSize: 12 },
  title: { color: '#F3F7F4', fontSize: 28, fontWeight: '700', marginTop: 4 },
  status: { color: '#728077', fontSize: 11, letterSpacing: 1 },
  mapWrap: { height: 360 },
  caption: { color: '#65736A', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 20 },
});
