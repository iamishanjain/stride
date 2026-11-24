import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Countdown } from 'panelui-native';
import { palette } from '../../../ui/theme';

type Props = { target: number; onComplete: () => void };

export function RunCountdownOverlay({ target, onComplete }: Props) {
  return (
    <View style={styles.overlay}>
      <Text style={styles.eyebrow}>Get ready</Text>
      <Countdown to={target} variant="segmented" size="lg" units={['seconds']} labels={{ seconds: 'Ready' }} onComplete={onComplete} />
      <Text style={styles.hint}>Your run starts on zero</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(16,19,15,0.96)', alignItems: 'center', justifyContent: 'center', zIndex: 40 },
  eyebrow: { color: palette.lime, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 18, textTransform: 'uppercase' },
  hint: { color: palette.textInverseMuted, fontSize: 13, marginTop: 18 },
});
