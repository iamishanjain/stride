import React, { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleProfile } from '../types/profile.types';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  profile: GoogleProfile | null;
  onProfile: (profile: GoogleProfile) => void;
};

export function GoogleSignIn({ profile, onProfile }: Props) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? 'dummy-android-client-id.apps.googleusercontent.com',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? 'dummy-ios-client-id.apps.googleusercontent.com',
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? 'dummy-web-client-id.apps.googleusercontent.com',
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const accessToken = response.authentication?.accessToken;
    if (!accessToken) return;
    void fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((result) => result.json())
      .then((user: { sub?: string; name?: string; email?: string; picture?: string }) => {
        if (!user.sub) return;
        onProfile({
          id: user.sub,
          name: user.name ?? 'Runner',
          email: user.email ?? '',
          photo: user.picture ?? null,
        });
      })
      .catch(() => undefined);
  }, [response, onProfile]);

  if (profile) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {profile.photo ? (
          <Image source={{ uri: profile.photo }} style={{ width: 42, height: 42, borderRadius: 21 }} />
        ) : (
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#58D68D', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#07110B', fontWeight: '800' }}>{profile.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View>
          <Text style={{ color: '#F3F7F4', fontWeight: '700' }}>{profile.name}</Text>
          <Text style={{ color: '#8D9A92', fontSize: 12 }}>{profile.email}</Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      disabled={!request}
      onPress={() => void promptAsync()}
      style={{ height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#34433A', paddingHorizontal: 16, justifyContent: 'center' }}
    >
      <Text style={{ color: '#F3F7F4', fontWeight: '700' }}>Sign in with Google</Text>
    </Pressable>
  );
}
