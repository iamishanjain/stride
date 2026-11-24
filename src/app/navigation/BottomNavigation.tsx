import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '../../ui/theme';
import { AppTab } from './tabs.types';

type Props = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

const tabs = [
  ['Home', '⌂'],
  ['Map', '◇'],
  ['Record', '●'],
  ['Feed', '▤'],
  ['Profile', '○'],
] as const;

export function BottomNavigation({ activeTab, onChange }: Props) {
  return (
    <View style={styles.bottomNav}>
      {tabs.map(([tab, icon]) => {
        const active = activeTab === tab;
        if (tab === 'Record') {
          return (
            <Pressable key={tab} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => onChange(tab)} style={styles.recordTab}>
              <View style={styles.recordButtonOuter}><View style={styles.recordButton}><View style={styles.recordButtonRing} /></View></View>
            </Pressable>
          );
        }
        return (
          <Pressable key={tab} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => onChange(tab)} style={styles.navTab}>
            <Text style={[styles.navIcon, active && styles.navIconActive]}>{icon}</Text>
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 96, backgroundColor: '#171A18', borderTopWidth: 1, borderTopColor: '#252A26', flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 8, paddingBottom: 10 },
  navTab: { flex: 1, height: 66, alignItems: 'center', justifyContent: 'center', gap: 3 },
  navIcon: { color: palette.textInverseMuted, fontSize: 22, lineHeight: 24 },
  navIconActive: { color: palette.coral },
  navLabel: { color: palette.textInverseMuted, fontSize: 11, fontWeight: '700' },
  navLabelActive: { color: palette.coral },
  recordTab: { flex: 1, height: 96, alignItems: 'center', marginTop: -28 },
  recordButtonOuter: { width: 92, height: 92, borderRadius: 46, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center' },
  recordButton: { width: 82, height: 82, borderRadius: 41, backgroundColor: '#FF5A24', alignItems: 'center', justifyContent: 'center' },
  recordButtonRing: { width: 42, height: 42, borderRadius: 21, borderWidth: 4, borderColor: '#F8FAF7' },
});
