import React from 'react';
import { Activity } from '../features/tracking/types/tracking.types';
import { useTrackingStore } from '../features/tracking/state/trackingStore';
import { useAppInitialization } from './hooks/useAppInitialization';
import { useActivities } from '../features/activities/hooks/useActivities';
import { useProfile } from '../features/profile/hooks/useProfile';
import { useRunCountdown } from '../features/countdown/hooks/useRunCountdown';
import { RunCountdownOverlay } from '../features/countdown/components/RunCountdownOverlay';
import { AppNavigation } from './navigation/AppNavigation';
import { AppTab } from './navigation/tabs.types';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { MapScreen } from '../features/tracking/screens/MapScreen';
import { RecordScreen } from '../features/tracking/screens/RecordScreen';
import { ActivityFeedScreen } from '../features/activities/screens/ActivityFeedScreen';
import { ActivityDetailScreen } from '../features/activities/screens/ActivityDetailScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';

export function AppContent() {
  useAppInitialization();
  const [activeTab, setActiveTab] = React.useState<AppTab>('Home');
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const status = useTrackingStore((state) => state.status);
  const distanceMeters = useTrackingStore((state) => state.distanceMeters);
  const elapsedSeconds = useTrackingStore((state) => state.elapsedSeconds);
  const { activities, loading } = useActivities(status === 'finished' ? 'finished' : 'initial');
  const { profile, updateProfile } = useProfile();
  const countdown = useRunCountdown();

  if (selectedActivity) {
    return <ActivityDetailScreen activity={selectedActivity} profile={profile} onBack={() => setSelectedActivity(null)} />;
  }

  let screen: React.ReactNode;
  switch (activeTab) {
    case 'Map':
      screen = <MapScreen />;
      break;
    case 'Record':
      screen = <RecordScreen onStart={countdown.begin} />;
      break;
    case 'Feed':
      screen = <ActivityFeedScreen activities={activities} onSelect={setSelectedActivity} />;
      break;
    case 'Profile':
      screen = <ProfileScreen profile={profile} onProfile={updateProfile} activities={activities} />;
      break;
    default:
      screen = (
        <HomeScreen
          profile={profile}
          activities={activities}
          loading={loading}
          distanceMeters={distanceMeters}
          elapsedSeconds={elapsedSeconds}
          onSelectActivity={setSelectedActivity}
          onSeeAll={() => setActiveTab('Feed')}
          onStartRun={() => setActiveTab('Record')}
        />
      );
  }

  return (
    <AppNavigation activeTab={activeTab} onTabChange={setActiveTab}>
      {screen}
      {countdown.target != null && <RunCountdownOverlay target={countdown.target} onComplete={countdown.complete} />}
    </AppNavigation>
  );
}
