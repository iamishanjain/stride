import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Activity } from '../types/tracking.types';
import { GoogleProfile } from '../../profile/types/profile.types';
import { TrackingMap } from './TrackingMap';
import { formatDuration } from './ActivityCard';
import { calculateSplits, formatPace, getElevationStats } from '../services/ActivityAnalytics';
import { SplitsSection } from './SplitsSection';
import { PaceSection } from './PaceSection';

type Props = { activity: Activity; profile: GoogleProfile | null; onBack: () => void };

export function ActivityDetail({ activity, profile, onBack }: Props) {
  const pace = activity.elapsedSeconds / (activity.distanceMeters / 1000);
  const elevation = getElevationStats(activity.points);
  const splits = calculateSplits(activity);
  const date = new Date(activity.startedAt);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>Run</Text>
        <View style={styles.back} />
      </View>
      <View style={styles.userRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{profile?.name?.charAt(0).toUpperCase() ?? 'R'}</Text></View>
        <View>
          <Text style={styles.userName}>{profile?.name ?? 'Runner'}</Text>
          <Text style={styles.meta}>{date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} at {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text>
        </View>
      </View>
      <Text style={styles.title}>Morning Run</Text>
      <View style={styles.kudos}><Text style={styles.kudosText}>1  Kudos on your first activity!</Text></View>
      <View style={styles.statsGrid}>
        <View style={styles.primaryStat}><Text style={styles.label}>Distance</Text><Text style={styles.value}>{(activity.distanceMeters / 1000).toFixed(2)} km</Text></View>
        <View style={styles.primaryStat}><Text style={styles.label}>Avg Pace</Text><Text style={styles.value}>{formatPace(pace)} /km</Text></View>
        <View style={styles.primaryStat}><Text style={styles.label}>Moving Time</Text><Text style={styles.value}>{formatDuration(activity.elapsedSeconds)}</Text></View>
        <View style={styles.primaryStat}><Text style={styles.label}>Elevation Gain</Text><Text style={styles.value}>{Math.round(elevation.gain)} m</Text></View>
      </View>
      <View style={styles.maxElevation}><Text style={styles.label}>Max Elevation</Text><Text style={styles.value}>{Math.round(elevation.max)} m</Text></View>
      <View style={styles.mapWrap}>
        <TrackingMap points={activity.points} currentLocation={activity.points.at(-1) ?? null} finished />
      </View>
      <SplitsSection splits={splits} />
      <PaceSection activity={activity} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F5F2' },
  content: { paddingBottom: 40 },
  header: { height: 68, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#E4E7EC' },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#111827', fontSize: 38, lineHeight: 42 },
  headerTitle: { color: '#111827', fontSize: 21, fontWeight: '800' },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 22, paddingHorizontal: 20 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#58D68D', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#07110B', fontSize: 22, fontWeight: '800' },
  userName: { color: '#111827', fontSize: 17, fontWeight: '800' },
  meta: { color: '#667085', fontSize: 12, marginTop: 4 },
  title: { color: '#111827', fontSize: 34, fontWeight: '900', marginTop: 24, paddingHorizontal: 20 },
  kudos: { marginHorizontal: 20, marginTop: 18, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 },
  kudosText: { color: '#111827', fontWeight: '800', fontSize: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, paddingHorizontal: 12 },
  primaryStat: { width: '50%', alignItems: 'center', paddingVertical: 16 },
  maxElevation: { alignItems: 'center', paddingBottom: 20 },
  label: { color: '#667085', fontSize: 14 },
  value: { color: '#111827', fontSize: 27, fontWeight: '900', marginTop: 4 },
  mapWrap: { height: 340, marginHorizontal: 20, borderRadius: 18, overflow: 'hidden' },
});
