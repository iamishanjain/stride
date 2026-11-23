import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Activity } from '../types/tracking.types';
import { GoogleProfile } from '../../profile/types/profile.types';
import { TrackingMap } from './TrackingMap';
import { formatDuration } from './ActivityCard';
import { calculateSplits, formatPace, getElevationStats } from '../services/ActivityAnalytics';
import { SplitsSection } from './SplitsSection';
import { PaceSection } from './PaceSection';
import { palette, radii } from '../../../ui/theme';
import { Card, PressableScale, SectionTitle } from '../../../ui/UiComponents';

type Props = { activity: Activity; profile: GoogleProfile | null; onBack: () => void };

export function ActivityDetail({ activity, profile, onBack }: Props) {
  const pace = activity.elapsedSeconds / (activity.distanceMeters / 1000);
  const elevation = getElevationStats(activity.points);
  const splits = calculateSplits(activity);
  const date = new Date(activity.startedAt);
  const [kudos, setKudos] = useState(false);
  const [axis, setAxis] = useState<'distance' | 'time'>('distance');
  const hrPoints = useMemo(() => activity.points.filter((point) => point.heartRate != null), [activity.points]);
  const powerPoints = useMemo(() => activity.points.filter((point) => point.powerWatts != null), [activity.points]);
  const cadencePoints = useMemo(() => activity.points.filter((point) => point.cadence != null), [activity.points]);
  const hrValues = hrPoints.map((point) => point.heartRate as number);
  const avgHr = hrValues.length ? hrValues.reduce((sum, value) => sum + value, 0) / hrValues.length : null;
  const maxHr = hrValues.length ? Math.max(...hrValues) : null;
  const avgPower = powerPoints.length ? powerPoints.reduce((sum, point) => sum + (point.powerWatts ?? 0), 0) / powerPoints.length : null;
  const avgCadence = cadencePoints.length ? cadencePoints.reduce((sum, point) => sum + (point.cadence ?? 0), 0) / cadencePoints.length : null;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} stickyHeaderIndices={[0]}>
      <View style={styles.header}>
        <PressableScale onPress={onBack} style={styles.back}><Text style={styles.backText}>‹</Text></PressableScale>
        <Text style={styles.headerTitle}>Run</Text>
        <PressableScale onPress={() => Alert.alert('Activity actions', 'Edit, delete, export, and re-process actions require account synchronization.')} style={styles.back}><Text style={styles.more}>•••</Text></PressableScale>
      </View>
      <View style={styles.userRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{profile?.name?.charAt(0).toUpperCase() ?? 'R'}</Text></View>
        <View>
          <Text style={styles.userName}>{profile?.name ?? 'Runner'}</Text>
          <Text style={styles.meta}>{date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} at {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text>
        </View>
      </View>
      <Text style={styles.title}>Morning Run</Text>
      <Card dark style={styles.kudos}><Text style={styles.kudosText}>Ready for a stronger next run</Text></Card>
      <View style={styles.statsGrid}>
        <View style={styles.primaryStat}><Text style={styles.label}>Distance</Text><Text style={styles.value}>{(activity.distanceMeters / 1000).toFixed(2)} km</Text></View>
        <View style={styles.primaryStat}><Text style={styles.label}>Avg Pace</Text><Text style={styles.value}>{formatPace(pace)} /km</Text></View>
        <View style={styles.primaryStat}><Text style={styles.label}>Moving Time</Text><Text style={styles.value}>{formatDuration(activity.elapsedSeconds)}</Text></View>
        <View style={styles.primaryStat}><Text style={styles.label}>Elevation Gain</Text><Text style={styles.value}>{Math.round(elevation.gain)} m</Text></View>
      </View>
      <View style={styles.maxElevation}><Text style={styles.label}>Max Elevation</Text><Text style={styles.value}>{Math.round(elevation.max)} m</Text></View>
      <Card style={styles.summaryCard}>
        <SectionTitle title="Additional metrics" aside="Live data" />
        <View style={styles.metricGrid}>
          <Metric label="Calories" value="No data" />
          <Metric label="Avg heart rate" value={avgHr ? `${Math.round(avgHr)} bpm` : 'No data'} />
          <Metric label="Max heart rate" value={maxHr ? `${maxHr} bpm` : 'No data'} />
          <Metric label="Avg power" value={avgPower ? `${Math.round(avgPower)} W` : 'No data'} />
          <Metric label="Avg cadence" value={avgCadence ? `${Math.round(avgCadence)} spm` : 'No data'} />
          <Metric label="Grade" value="No grade stream" />
          <Metric label="Weather" value="No data" />
          <Metric label="Gear" value="Not assigned" />
        </View>
      </Card>
      <View id="map" style={styles.mapSection}>
        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Route</Text><Text style={styles.axisToggle}>{axis === 'distance' ? 'Distance' : 'Time'} view</Text></View>
        <View style={styles.mapWrap}>
          <TrackingMap points={activity.points} currentLocation={activity.points.at(-1) ?? null} finished />
        </View>
        <View style={styles.mapTools}>
          <Pressable onPress={() => setAxis('distance')} style={[styles.tool, axis === 'distance' && styles.toolActive]}><Text style={axis === 'distance' ? styles.toolTextActive : styles.toolText}>Distance</Text></Pressable>
          <Pressable onPress={() => setAxis('time')} style={[styles.tool, axis === 'time' && styles.toolActive]}><Text style={axis === 'time' ? styles.toolTextActive : styles.toolText}>Time</Text></Pressable>
        </View>
      </View>
      <SplitsSection splits={splits} />
      <PaceSection activity={activity} />
      <View style={styles.detailSection}><Text style={styles.sectionTitle}>Zones</Text><EmptyText text="No heart-rate or power zones recorded." /></View>
      <View style={styles.detailSection}><Text style={styles.sectionTitle}>Segments</Text><EmptyText text="No matched segments for this activity." /></View>
      <View style={styles.detailSection}><Text style={styles.sectionTitle}>Media and notes</Text><EmptyText text="No photos or description have been added." /></View>
      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Social</Text>
        <Pressable onPress={() => setKudos((value) => !value)} style={[styles.kudosButton, kudos && styles.kudosButtonActive]}>
          <Text style={kudos ? styles.kudosButtonTextActive : styles.kudosButtonText}>{kudos ? 'Kudos given' : 'Give kudos'}</Text>
        </Pressable>
        <EmptyText text="No comments yet." />
      </View>
      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Raw data</Text>
        {activity.points.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <Text style={styles.rawHeader}>Time  Latitude  Longitude  Altitude  Accuracy</Text>
              {activity.points.slice(0, 200).map((point) => (
                <Text key={point.timestamp} style={styles.rawRow}>{new Date(point.timestamp).toISOString()}  {point.latitude.toFixed(6)}  {point.longitude.toFixed(6)}  {point.altitude?.toFixed(1) ?? '—'}  {point.accuracy?.toFixed(1) ?? '—'}</Text>
              ))}
            </View>
          </ScrollView>
        ) : <EmptyText text="No GPS samples recorded." />}
        <Pressable onPress={() => Alert.alert('Export', 'GPX, TCX, FIT, CSV, and JSON exports will be available after account synchronization.')} style={styles.exportButton}><Text style={styles.exportText}>Export activity</Text></Pressable>
      </View>
      <View style={styles.detailSection}><Text style={styles.sectionTitle}>Data source</Text><Text style={styles.bodyText}>Recorded with Stride · Everyone</Text></View>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metricCard}><Text style={styles.label}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

function EmptyText({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.ink },
  content: { paddingBottom: 40 },
  header: { height: 68, backgroundColor: palette.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: palette.lineDark },
  more: { color: palette.textInverse, fontSize: 16, fontWeight: '800' },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { color: palette.textInverse, fontSize: 38, lineHeight: 42 },
  headerTitle: { color: palette.textInverse, fontSize: 21, fontWeight: '900' },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 22, paddingHorizontal: 20 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: palette.lime, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: palette.ink, fontSize: 22, fontWeight: '900' },
  userName: { color: palette.textInverse, fontSize: 17, fontWeight: '900' },
  meta: { color: '#667085', fontSize: 12, marginTop: 4 },
  title: { color: palette.textInverse, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 24, paddingHorizontal: 20 },
  kudos: { marginHorizontal: 20, marginTop: 18, borderRadius: radii.md, padding: 16 },
  kudosText: { color: palette.lime, fontWeight: '900', fontSize: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, paddingHorizontal: 12 },
  primaryStat: { width: '50%', alignItems: 'center', paddingVertical: 16 },
  maxElevation: { alignItems: 'center', paddingBottom: 20 },
  label: { color: palette.textInverseMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { color: palette.textInverse, fontSize: 27, fontWeight: '900', marginTop: 4 },
  mapWrap: { height: 340, marginHorizontal: 20, borderRadius: 18, overflow: 'hidden' },
  summaryCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 18, padding: 18, marginBottom: 14 },
  sectionTitle: { color: '#111827', fontSize: 24, fontWeight: '800' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  metricCard: { width: '50%', paddingVertical: 12, paddingRight: 8 },
  metricValue: { color: '#111827', fontSize: 18, fontWeight: '800', marginTop: 4 },
  mapSection: { marginTop: 4 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 10 },
  axisToggle: { color: '#667085', fontSize: 13 },
  mapTools: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 10, marginBottom: 4 },
  tool: { height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#D0D5DD', paddingHorizontal: 16, justifyContent: 'center' },
  toolActive: { backgroundColor: '#111827', borderColor: '#111827' },
  toolText: { color: '#667085', fontWeight: '700' },
  toolTextActive: { color: '#FFFFFF', fontWeight: '700' },
  detailSection: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 18, padding: 18, marginTop: 14 },
  emptyText: { color: '#667085', lineHeight: 20, marginTop: 10 },
  kudosButton: { height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#D0D5DD', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  kudosButtonActive: { backgroundColor: '#FFF1EA', borderColor: '#FC5201' },
  kudosButtonText: { color: '#667085', fontWeight: '800' },
  kudosButtonTextActive: { color: '#FC5201', fontWeight: '800' },
  rawHeader: { color: '#667085', fontWeight: '800', marginTop: 12, marginBottom: 6 },
  rawRow: { color: '#111827', fontFamily: 'monospace', fontSize: 11, lineHeight: 20 },
  exportButton: { height: 44, borderRadius: 22, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  exportText: { color: '#FFFFFF', fontWeight: '800' },
  bodyText: { color: '#667085', marginTop: 8 },
});
