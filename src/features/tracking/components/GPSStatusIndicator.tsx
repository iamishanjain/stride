import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function GPSStatusIndicator({ accuracy, error }: { accuracy: number | null; error: string | null }) {
  const label = error ?? (accuracy == null ? 'GPS waiting for a signal' : `GPS accuracy ${Math.round(accuracy)}m`);
  return <View style={styles.row}><View style={[styles.dot, { backgroundColor: error ? '#F97068' : accuracy == null ? '#F2C14E' : '#58D68D' }]} /><Text style={styles.text}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { color: '#A8B3AC', fontSize: 13 },
});
