import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Activity } from '../../tracking/types/tracking.types';
import { GoogleProfile } from '../../profile/types/profile.types';
import { spacing } from '../../../ui/theme';
import { HomeHeader } from '../components/HomeHeader';
import { WeeklyActivityCalendar } from '../components/WeeklyActivityCalendar';
import { ProgressOverview } from '../components/ProgressOverview';
import { RecentActivitiesSection } from '../components/RecentActivitiesSection';

type Props = {
  profile: GoogleProfile | null;
  activities: Activity[];
  loading: boolean;
  distanceMeters: number;
  elapsedSeconds: number;
  onSelectActivity: (activity: Activity) => void;
  onSeeAll: () => void;
  onStartRun: () => void;
};

export function HomeScreen(props: Props) {
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <HomeHeader profile={props.profile} />
      <WeeklyActivityCalendar selectedDate={selectedDate} onSelect={setSelectedDate} activities={props.activities} />
      <ProgressOverview distanceMeters={props.distanceMeters} elapsedSeconds={props.elapsedSeconds} activities={props.activities} />
      <RecentActivitiesSection activities={props.activities} loading={props.loading} onSelect={props.onSelectActivity} onSeeAll={props.onSeeAll} onStartRun={props.onStartRun} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { paddingHorizontal: spacing.lg, paddingTop: 14, paddingBottom: 118, flexGrow: 1 } });
