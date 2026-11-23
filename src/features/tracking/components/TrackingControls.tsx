import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrackingStatus } from '../types/tracking.types';
import { palette, radii } from '../../../ui/theme';
import { PressableScale } from '../../../ui/UiComponents';
import { Loader, Shimmer } from 'panelui-native';

type Props = { status: TrackingStatus; onStart: () => void; onPause: () => void; onResume: () => void; onFinish: () => void; onNew: () => void };

export function TrackingControls({ status, onStart, onPause, onResume, onFinish, onNew }: Props) {
  if (status === 'idle') return <PressableScale style={styles.start} onPress={onStart}><Text style={styles.startText}>Start run</Text></PressableScale>;
  if (status === 'finished') return <PressableScale style={styles.start} onPress={onNew}><Text style={styles.startText}>Start a new run</Text></PressableScale>;
  if (status === 'finishing') return (
    <View style={styles.saving}>
      <Loader variant="bar-cascade" size="sm" color="--color-primary" label="Saving your run" />
      <Shimmer duration={1400} textClassName="text-sm font-semibold">Saving your run...</Shimmer>
    </View>
  );
  return (
    <View style={styles.controls}>
      <PressableScale style={styles.secondary} onPress={status === 'paused' ? onResume : onPause}><Text style={styles.secondaryText}>{status === 'paused' ? 'Resume' : 'Pause'}</Text></PressableScale>
      <PressableScale style={styles.finish} onPress={onFinish}><Text style={styles.finishText}>Finish</Text></PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', gap: 12 },
  start: { height: 60, borderRadius: radii.pill, backgroundColor: palette.lime, justifyContent: 'center', alignItems: 'center' },
  startText: { color: palette.ink, fontWeight: '900', letterSpacing: 0.2, fontSize: 16 },
  secondary: { flex: 1, height: 56, borderRadius: radii.pill, borderWidth: 1, borderColor: palette.lineDark, backgroundColor: palette.surfaceDark, justifyContent: 'center', alignItems: 'center' },
  secondaryText: { color: palette.textInverse, fontWeight: '900' },
  finish: { flex: 1, height: 56, borderRadius: radii.pill, backgroundColor: palette.coral, justifyContent: 'center', alignItems: 'center' },
  finishText: { color: '#37130D', fontWeight: '900' },
  message: { color: '#A8B3AC', textAlign: 'center', padding: 20 },
  saving: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
});
