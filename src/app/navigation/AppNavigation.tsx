import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BottomNavigation } from './BottomNavigation';
import { AppTab } from './tabs.types';
import { palette } from '../../ui/theme';

type Props = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: React.ReactNode;
};

export function AppNavigation({ activeTab, onTabChange, children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.content}>{children}</View>
      <BottomNavigation activeTab={activeTab} onChange={onTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.ink },
  content: { flex: 1 },
});
