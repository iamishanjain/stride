import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Split, formatPace } from '../services/ActivityAnalytics';
import { palette, radii } from '../../../ui/theme';

export function SplitsSection({ splits }: { splits: Split[] }) {
  if (!splits.length) return null;
  const maxPace = Math.max(...splits.map((split) => split.paceSecondsPerKm));
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Splits</Text>
      <View style={styles.header}><Text style={styles.headerText}>KM</Text><Text style={styles.headerText}>Pace</Text><Text style={styles.headerText}>Elev</Text></View>
      {splits.map((split) => (
        <View key={split.index} style={styles.row}>
          <Text style={styles.km}>{split.label}</Text>
          <View style={styles.barArea}>
            <Text style={styles.pace}>{formatPace(split.paceSecondsPerKm)}</Text>
            <View style={[styles.bar, { width: `${Math.max(18, (split.paceSecondsPerKm / maxPace) * 100)}%` }]} />
          </View>
          <Text style={styles.elev}>{Math.round(split.elevationGainMeters)} m</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: 18, marginTop: 14, borderWidth: 1, borderColor: palette.line },
  title: { color: '#111827', fontSize: 25, fontWeight: '800' },
  header: { flexDirection: 'row', marginTop: 18, borderBottomWidth: 1, borderBottomColor: '#E4E7EC', paddingBottom: 10 },
  headerText: { width: '16%', color: '#667085', fontWeight: '700' },
  row: { height: 48, flexDirection: 'row', alignItems: 'center' },
  km: { width: '16%', color: '#667085', fontWeight: '700' },
  barArea: { flex: 1, height: 36, justifyContent: 'center' },
  pace: { color: '#667085', position: 'absolute', left: 8, zIndex: 1, fontSize: 12 },
  bar: { height: 32, backgroundColor: palette.blue, borderRadius: 5 },
  elev: { width: 54, textAlign: 'right', color: '#667085' },
});
