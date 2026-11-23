import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Activity } from '../types/tracking.types';
import { GoogleProfile } from '../../profile/types/profile.types';
import { formatPace } from '../services/ActivityAnalytics';
import { palette, radii } from '../../../ui/theme';
import { PressableScale } from '../../../ui/UiComponents';

type Props = {
  activity: Activity;
  profile: GoogleProfile | null;
  onPress: () => void;
};

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function ActivityCard({ activity, profile, onPress }: Props) {
  const pace = activity.elapsedSeconds / (activity.distanceMeters / 1000);
  const date = new Date(activity.startedAt);
  return (
    <PressableScale onPress={onPress} style={styles.card}>
      <View style={styles.profileRow}>
        {profile?.photo ? (
          <Image source={{ uri: profile.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}><Text style={styles.avatarText}>{profile?.name?.charAt(0).toUpperCase() ?? 'R'}</Text></View>
        )}
        <View style={styles.profileText}>
          <Text style={styles.name}>{profile?.name ?? 'Runner'}</Text>
          <Text style={styles.meta}>{date.toLocaleDateString(undefined, { weekday: 'long' })} at {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text>
        </View>
      </View>
      <Text style={styles.title}>Morning Run</Text>
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statLabel}>Distance</Text><Text style={styles.statValue}>{(activity.distanceMeters / 1000).toFixed(2)} km</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>Pace</Text><Text style={styles.statValue}>{formatPace(pace)} /km</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>Time</Text><Text style={styles.statValue}>{formatDuration(activity.elapsedSeconds)}</Text></View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: palette.line },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#58D68D', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#07110B', fontSize: 20, fontWeight: '800' },
  profileText: { marginLeft: 12, flex: 1 },
  name: { color: '#111827', fontSize: 17, fontWeight: '800' },
  meta: { color: '#667085', fontSize: 12, marginTop: 3 },
  title: { color: '#111827', fontSize: 25, fontWeight: '800', marginTop: 18, marginBottom: 14 },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, borderRightWidth: 1, borderRightColor: '#E4E7EC', paddingHorizontal: 8 },
  statLabel: { color: '#667085', fontSize: 12 },
  statValue: { color: '#111827', fontSize: 20, fontWeight: '800', marginTop: 4 },
});
