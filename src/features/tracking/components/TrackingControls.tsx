import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TrackingStatus } from '../types/tracking.types';

type Props = { status: TrackingStatus; onStart: () => void; onPause: () => void; onResume: () => void; onFinish: () => void; onNew: () => void };

export function TrackingControls({ status, onStart, onPause, onResume, onFinish, onNew }: Props) {
  if (status === 'idle') return <Pressable style={styles.start} onPress={onStart}><Text style={styles.startText}>START RUN</Text></Pressable>;
  if (status === 'finished') return <Pressable style={styles.start} onPress={onNew}><Text style={styles.startText}>NEW RUN</Text></Pressable>;
  if (status === 'finishing') return <Text style={styles.message}>Saving your run...</Text>;
  return (
    <View style={styles.controls}>
      <Pressable style={styles.secondary} onPress={status === 'paused' ? onResume : onPause}><Text style={styles.secondaryText}>{status === 'paused' ? 'RESUME' : 'PAUSE'}</Text></Pressable>
      <Pressable style={styles.finish} onPress={onFinish}><Text style={styles.finishText}>FINISH</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', gap: 12 },
  start: { height: 58, borderRadius: 30, backgroundColor: '#58D68D', justifyContent: 'center', alignItems: 'center' },
  startText: { color: '#07110B', fontWeight: '800', letterSpacing: 1 },
  secondary: { flex: 1, height: 56, borderRadius: 28, borderWidth: 1, borderColor: '#34433A', justifyContent: 'center', alignItems: 'center' },
  secondaryText: { color: '#F3F7F4', fontWeight: '700' },
  finish: { flex: 1, height: 56, borderRadius: 28, backgroundColor: '#F97068', justifyContent: 'center', alignItems: 'center' },
  finishText: { color: '#220B09', fontWeight: '800' },
  message: { color: '#A8B3AC', textAlign: 'center', padding: 20 },
});
