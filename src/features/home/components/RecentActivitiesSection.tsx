import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Skeleton } from 'panelui-native';
import { Activity } from '../../tracking/types/tracking.types';
import { palette, radii } from '../../../ui/theme';
import { SectionTitle } from '../../../ui/UiComponents';

type Props = {
  activities: Activity[];
  loading: boolean;
  onSelect: (activity: Activity) => void;
  onSeeAll: () => void;
  onStartRun: () => void;
};

export function RecentActivitiesSection({ activities, loading, onSelect, onSeeAll, onStartRun }: Props) {
  return (
    <View>
      <SectionTitle dark title="Recent Activity" aside="See All" />
      <Pressable accessibilityRole="button" onPress={onSeeAll} style={styles.seeAll}><View /></Pressable>
      {loading ? (
        <View style={styles.loadingCard}>
          <Skeleton className="h-10 w-10 rounded-full" label="Loading recent runs" />
          <View style={styles.loadingLines}><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></View>
        </View>
      ) : activities.length ? activities.slice(0, 4).map((activity) => (
        <Pressable key={activity.id} accessibilityRole="button" onPress={() => onSelect(activity)} style={styles.card}>
          <View style={styles.icon}><Text style={styles.iconText}>●</Text></View>
          <View style={styles.content}>
            <Text style={styles.meta}>Morning Run  ·  {new Date(activity.startedAt).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
            <Text style={styles.distance}>{(activity.distanceMeters / 1000).toFixed(1)} km</Text>
          </View>
          <View style={styles.arrow}><Text style={styles.arrowText}>→</Text></View>
        </Pressable>
      )) : (
        <Pressable accessibilityRole="button" onPress={onStartRun} style={styles.empty}><Text style={styles.emptyText}>Start your first run</Text></Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  seeAll: { height: 1, opacity: 0 },
  loadingCard: { height: 82, borderRadius: radii.lg, backgroundColor: palette.surfaceDark, borderWidth: 1, borderColor: palette.lineDark, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  loadingLines: { flex: 1, gap: 8 },
  card: { minHeight: 112, borderRadius: 20, backgroundColor: '#2A1D1A', borderWidth: 1, borderColor: '#8A4A35', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 16, marginBottom: 10 },
  icon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#171A17', borderWidth: 1, borderColor: '#343A35', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconText: { color: palette.coral, fontSize: 27, transform: [{ rotate: '-20deg' }] },
  content: { flex: 1 },
  meta: { color: '#B5ACA6', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  distance: { color: palette.textInverse, fontSize: 27, lineHeight: 32, fontWeight: '900' },
  arrow: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#D4D9D4', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: palette.textInverse, fontSize: 26, lineHeight: 28 },
  empty: { height: 82, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.lineDark, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: palette.textInverse, fontSize: 15, fontWeight: '800' },
});
