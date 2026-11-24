import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ActivityDetail } from '../../tracking/components/ActivityDetail';
import { Activity } from '../../tracking/types/tracking.types';
import { GoogleProfile } from '../../profile/types/profile.types';
import { useActivityDetail } from '../hooks/useActivityDetail';

type Props = { activity: Activity; profile: GoogleProfile | null; onBack: () => void };

export function ActivityDetailScreen({ activity, profile, onBack }: Props) {
  const { routeActivity, loading } = useActivityDetail(activity);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#10130F' }}>
      <StatusBar style="dark" />
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#A9B2A8' }}>Loading route...</Text>
        </View>
      ) : (
        <ActivityDetail activity={routeActivity} profile={profile} onBack={onBack} />
      )}
    </SafeAreaView>
  );
}
