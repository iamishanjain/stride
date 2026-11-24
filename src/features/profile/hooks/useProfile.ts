import React from 'react';
import { GoogleProfile } from '../types/profile.types';
import { getGoogleProfile, saveGoogleProfile } from '../repositories/ProfileRepository';

export function useProfile() {
  const [profile, setProfile] = React.useState<GoogleProfile | null>(null);

  React.useEffect(() => {
    void getGoogleProfile().then(setProfile).catch(() => undefined);
  }, []);

  const updateProfile = React.useCallback((nextProfile: GoogleProfile) => {
    setProfile(nextProfile);
    void saveGoogleProfile(nextProfile).catch(() => undefined);
  }, []);

  return { profile, updateProfile };
}
