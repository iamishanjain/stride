import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GoogleProfile } from '../../profile/types/profile.types';
import { palette } from '../../../ui/theme';

export function HomeHeader({ profile }: { profile: GoogleProfile | null }) {
  return (
    <View style={styles.header}>
      <View style={styles.identity}>
        {profile?.photo ? (
          <Image source={{ uri: profile.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}><Text style={styles.avatarText}>{profile?.name?.charAt(0).toUpperCase() ?? 'S'}</Text></View>
        )}
        <Text style={styles.name}>{profile?.name ?? 'Tirta Mandira'}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={styles.notification}>
        <Text style={styles.notificationText}>●</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 62, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#D9D2C8', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: palette.ink, fontSize: 20, fontWeight: '900' },
  name: { color: palette.textInverse, fontSize: 18, fontWeight: '800' },
  notification: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notificationText: { color: palette.textInverse, fontSize: 21 },
});
