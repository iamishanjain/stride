import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GoogleSignIn } from '../components/GoogleSignIn';
import { GoogleProfile } from '../types/profile.types';
import { Activity } from '../../tracking/types/tracking.types';
import { palette, radii, spacing } from '../../../ui/theme';

type Props = { profile: GoogleProfile | null; onProfile: (profile: GoogleProfile) => void; activities: Activity[] };

export function ProfileScreen({ profile, onProfile, activities }: Props) {
  const totalDistance = activities.reduce((total, activity) => total + activity.distanceMeters, 0) / 1000;
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.panel}><GoogleSignIn profile={profile} onProfile={onProfile} /></View>
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.value}>{activities.length}</Text><Text style={styles.label}>Runs</Text></View>
        <View style={styles.stat}><Text style={styles.value}>{totalDistance >= 100 ? '100+' : totalDistance.toFixed(1)}</Text><Text style={styles.label}>Kilometres</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: 18, paddingBottom: 118, flexGrow: 1 },
  title: { color: palette.textInverse, fontSize: 27, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7, marginBottom: 16 },
  panel: { borderRadius: radii.lg, backgroundColor: palette.surfaceDark, borderWidth: 1, borderColor: palette.lineDark, padding: 18, marginBottom: 12 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, height: 100, borderRadius: radii.lg, backgroundColor: '#162019', borderWidth: 1, borderColor: '#212B24', alignItems: 'center', justifyContent: 'center' },
  value: { color: palette.textInverse, fontSize: 28, fontWeight: '900' },
  label: { color: palette.textInverseMuted, fontSize: 12, marginTop: 6 },
});
