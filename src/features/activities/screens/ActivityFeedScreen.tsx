import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Activity } from '../../tracking/types/tracking.types';
import { palette, spacing } from '../../../ui/theme';

export function ActivityFeedScreen({ activities, onSelect }: { activities: Activity[]; onSelect: (activity: Activity) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Recent Activity</Text>
      {activities.map((activity) => (
        <Pressable key={activity.id} accessibilityRole="button" onPress={() => onSelect(activity)} style={styles.card}>
          <View style={styles.icon}><Text style={styles.iconText}>●</Text></View>
          <View style={styles.main}>
            <Text style={styles.meta}>{new Date(activity.startedAt).toLocaleDateString()}</Text>
            <Text style={styles.distance}>{(activity.distanceMeters / 1000).toFixed(1)} km</Text>
          </View>
          <View style={styles.arrow}><Text style={styles.arrowText}>→</Text></View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: 18, paddingBottom: 118, flexGrow: 1 },
  title: { color: palette.textInverse, fontSize: 27, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7, marginBottom: 16 },
  card: { minHeight: 112, borderRadius: 20, backgroundColor: '#2A1D1A', borderWidth: 1, borderColor: '#8A4A35', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 16, marginBottom: 10 },
  icon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#171A17', borderWidth: 1, borderColor: '#343A35', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconText: { color: palette.coral, fontSize: 27 },
  main: { flex: 1 },
  meta: { color: '#B5ACA6', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  distance: { color: palette.textInverse, fontSize: 27, lineHeight: 32, fontWeight: '900' },
  arrow: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#D4D9D4', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: palette.textInverse, fontSize: 26, lineHeight: 2 },
});
