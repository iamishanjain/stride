import './global.css';
import React, { useEffect } from 'react';
import { PanelUIProvider } from 'panelui-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TrackingMap } from './src/features/tracking/components/TrackingMap';
import { TrackingStats } from './src/features/tracking/components/TrackingStats';
import { TrackingControls } from './src/features/tracking/components/TrackingControls';
import { GPSStatusIndicator } from './src/features/tracking/components/GPSStatusIndicator';
import { useTracking } from './src/features/tracking/hooks/useTracking';
import { storeToActivity, useTrackingStore } from './src/features/tracking/state/trackingStore';
import { getRecentActivities, saveActivity, saveActivityMetadata } from './src/database/repositories/ActivityRepository';
import { Activity } from './src/features/tracking/types/tracking.types';
import { ActivityCard } from './src/features/tracking/components/ActivityCard';
import { ActivityDetail } from './src/features/tracking/components/ActivityDetail';
import { GoogleSignIn } from './src/features/profile/components/GoogleSignIn';
import { GoogleProfile } from './src/features/profile/types/profile.types';
import { getGoogleProfile, saveGoogleProfile } from './src/features/profile/repositories/ProfileRepository';
import './src/features/tracking/services/BackgroundLocationTask';
import { palette, radii, spacing } from './src/ui/theme';
import { SectionTitle } from './src/ui/UiComponents';
import { Countdown, Skeleton, WeekStrip } from 'panelui-native';

export default function App() {
  return (
    <PanelUIProvider>
      <AppContent />
    </PanelUIProvider>
  );
}

function AppContent() {
  const status = useTrackingStore((state) => state.status);
  const points = useTrackingStore((state) => state.points);
  const distanceMeters = useTrackingStore((state) => state.distanceMeters);
  const elapsedSeconds = useTrackingStore((state) => state.elapsedSeconds);
  const accuracy = useTrackingStore((state) => state.accuracy);
  const currentLocation = useTrackingStore((state) => state.currentLocation);
  const lastError = useTrackingStore((state) => state.lastError);
  const start = useTrackingStore((state) => state.start);
  const pause = useTrackingStore((state) => state.pause);
  const resume = useTrackingStore((state) => state.resume);
  const finish = useTrackingStore((state) => state.finish);
  const complete = useTrackingStore((state) => state.complete);
  const reset = useTrackingStore((state) => state.reset);
  const setElapsedSeconds = useTrackingStore((state) => state.setElapsedSeconds);
  const [recentRuns, setRecentRuns] = React.useState<Activity[]>([]);
  const [profile, setProfile] = React.useState<GoogleProfile | null>(null);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());
  const [countdownTarget, setCountdownTarget] = React.useState<number | null>(null);
  const [loadingRuns, setLoadingRuns] = React.useState(true);
  useTracking();

  useEffect(() => {
    void getGoogleProfile().then(setProfile).catch(() => undefined);
  }, []);

  const handleProfile = React.useCallback((nextProfile: GoogleProfile) => {
    setProfile(nextProfile);
    void saveGoogleProfile(nextProfile).catch(() => undefined);
  }, []);

  useEffect(() => {
    void getRecentActivities()
      .then(setRecentRuns)
      .catch((error: unknown) => useTrackingStore.getState().setError(error instanceof Error ? error.message : 'Unable to load previous runs.'))
      .finally(() => setLoadingRuns(false));
  }, []);

  useEffect(() => {
    if (status !== 'finished') return;
    void getRecentActivities()
      .then(setRecentRuns)
      .catch((error: unknown) => useTrackingStore.getState().setError(error instanceof Error ? error.message : 'Unable to load previous runs.'));
  }, [status]);

  useEffect(() => {
    const state = useTrackingStore.getState();
    if (status === 'recording' && state.activityId && state.startedAt) {
      void saveActivityMetadata({
        id: state.activityId,
        startedAt: state.startedAt,
        distanceMeters,
        elapsedSeconds,
        status,
      }).catch((error: unknown) => useTrackingStore.getState().setError(error instanceof Error ? error.message : 'Unable to initialize local run storage.'));
    }
  }, [status, distanceMeters, elapsedSeconds]);

  useEffect(() => {
    if (status !== 'recording' && status !== 'paused') return;
    const timer = setInterval(() => {
      const state = useTrackingStore.getState();
      if (state.startedAt == null) return;
      const pausedSeconds = state.pausedDurationSeconds + (state.pausedAt ? (Date.now() - state.pausedAt) / 1000 : 0);
      setElapsedSeconds((Date.now() - state.startedAt) / 1000 - pausedSeconds);
    }, 1000);
    return () => clearInterval(timer);
  }, [status, setElapsedSeconds]);

  useEffect(() => {
    if (status !== 'finishing') return;
    const activity = storeToActivity(useTrackingStore.getState());
    if (!activity) return;
    void saveActivity({ ...activity, status: 'finished' })
      .then(() => complete())
      .catch((error: unknown) => useTrackingStore.getState().setError(error instanceof Error ? error.message : 'Unable to save this run.'));
  }, [status, complete]);

  const title = status === 'finished' ? 'Run complete' : status === 'idle' ? 'Ready to run?' : status === 'paused' ? 'Run paused' : 'You’re moving';

  const beginCountdown = React.useCallback(() => {
    setCountdownTarget(Date.now() + 3000);
  }, []);

  const completeCountdown = React.useCallback(() => {
    setCountdownTarget(null);
    start();
  }, [start]);

  if (selectedActivity) {
    return (
      <SafeAreaView style={styles.safeLight}>
        <StatusBar style="dark" />
        <ActivityDetail activity={selectedActivity} profile={profile} onBack={() => setSelectedActivity(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>STRIDE / LIVE</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.statusPill}><View style={[styles.statusDot, status === 'recording' && styles.statusDotLive]} /><Text style={styles.status}>{status}</Text></View>
        </View>
        <View style={styles.profileRow}><GoogleSignIn profile={profile} onProfile={handleProfile} /></View>
        <View style={styles.weekStripWrap}>
          <WeekStrip
            size="sm"
            value={selectedDate}
            onValueChange={setSelectedDate}
            weekStartsOn="auto"
            today={new Date()}
            marks={(date) => recentRuns.some((run) => {
              const runDate = new Date(run.startedAt);
              return runDate.getFullYear() === date.getFullYear()
                && runDate.getMonth() === date.getMonth()
                && runDate.getDate() === date.getDate();
            }) ? { dots: ['primary'], corner: 'success' } : undefined}
          />
        </View>
        <View style={styles.mapWrap}><TrackingMap points={points} currentLocation={currentLocation} finished={status === 'finished'} /></View>
        <GPSStatusIndicator accuracy={accuracy} error={lastError} />
        <TrackingStats distanceMeters={distanceMeters} elapsedSeconds={elapsedSeconds} />
        <TrackingControls status={status} onStart={beginCountdown} onPause={pause} onResume={resume} onFinish={finish} onNew={reset} />
        {loadingRuns ? (
          <View style={styles.history}>
            <SectionTitle dark title="Recent activity" aside="Loading" />
            <View style={styles.loadingCard}>
              <Skeleton className="h-10 w-10 rounded-full" label="Loading recent runs" />
              <View style={styles.loadingLines}>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </View>
            </View>
          </View>
        ) : recentRuns.length > 0 ? (
          <View style={styles.history}>
            <SectionTitle dark title="Recent activity" aside={`${recentRuns.length} run${recentRuns.length === 1 ? '' : 's'}`} />
            {recentRuns.map((run) => (
              <ActivityCard
                key={run.id}
                activity={run}
                profile={profile}
                onPress={() => setSelectedActivity(run)}
              />
            ))}
          </View>
        ) : null}
        <Text style={styles.caption}>Foreground GPS tracking is active. Background tracking requires a development build and additional platform testing.</Text>
      </ScrollView>
      {countdownTarget != null && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownEyebrow}>Get ready</Text>
          <Countdown
            to={countdownTarget}
            variant="segmented"
            size="lg"
            units={['seconds']}
            labels={{ seconds: 'Ready' }}
            onComplete={completeCountdown}
          />
          <Text style={styles.countdownHint}>Your run starts on zero</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.ink },
  safeLight: { flex: 1, backgroundColor: palette.canvas },
  content: { padding: spacing.lg, paddingBottom: 36, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 },
  eyebrow: { color: palette.lime, fontWeight: '900', letterSpacing: 1.8, fontSize: 11 },
  title: { color: palette.textInverse, fontSize: 30, fontWeight: '900', letterSpacing: -1, marginTop: 5 },
  statusPill: { height: 34, borderRadius: radii.pill, borderWidth: 1, borderColor: palette.lineDark, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 7 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.textInverseMuted },
  statusDotLive: { backgroundColor: palette.lime },
  status: { color: palette.textInverseMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '800' },
  mapWrap: { height: 348, borderRadius: radii.lg, overflow: 'hidden' },
  profileRow: { marginBottom: 14, alignItems: 'flex-start' },
  weekStripWrap: { marginBottom: 14 },
  loadingCard: { height: 82, borderRadius: radii.lg, backgroundColor: palette.surfaceDark, borderWidth: 1, borderColor: palette.lineDark, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  loadingLines: { flex: 1, gap: 8 },
  countdownOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(16,19,15,0.96)', alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  countdownEyebrow: { color: palette.lime, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 18, textTransform: 'uppercase' },
  countdownHint: { color: palette.textInverseMuted, fontSize: 13, marginTop: 18 },
  history: { marginTop: 4 },
  historyTitle: { color: '#F3F7F4', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  runCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#121916', borderRadius: 16, padding: 14, marginBottom: 8 },
  runDate: { color: '#F3F7F4', fontSize: 15, fontWeight: '700' },
  runTime: { color: '#8D9A92', fontSize: 12, marginTop: 3 },
  runMetrics: { alignItems: 'flex-end' },
  runMetric: { color: '#58D68D', fontSize: 16, fontWeight: '800' },
  caption: { color: '#65736A', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 20 },
});
