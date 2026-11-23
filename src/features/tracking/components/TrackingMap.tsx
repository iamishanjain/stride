import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { Coordinate, GPSPoint } from '../types/tracking.types';

type Props = {
  points: GPSPoint[];
  currentLocation: Coordinate | null;
  finished: boolean;
};

const FALLBACK_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 80,
  longitudeDelta: 80,
};

export function TrackingMap({ points, currentLocation, finished }: Props) {
  const map = useRef<MapView>(null);
  const coordinates = points.map(({ latitude, longitude }) => ({ latitude, longitude }));

  useEffect(() => {
    if (!currentLocation || finished) return;
    map.current?.animateToRegion({ ...currentLocation, latitudeDelta: 0.006, longitudeDelta: 0.006 }, 500);
  }, [currentLocation, finished]);

  return (
    <View style={styles.container}>
      <MapView ref={map} style={styles.map} initialRegion={FALLBACK_REGION} showsUserLocation={Boolean(currentLocation)}>
        {coordinates.length > 1 && <Polyline coordinates={coordinates} strokeColor="#58D68D" strokeWidth={5} />}
        {currentLocation && (
          <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.locationMarker}>
              <View style={styles.locationPulse} />
              <View style={styles.locationDot} />
            </View>
          </Marker>
        )}
        {coordinates[0] && <Marker coordinate={coordinates[0]} pinColor="#58D68D" title="Start" />}
        {finished && coordinates.length > 1 && <Marker coordinate={coordinates[coordinates.length - 1]} pinColor="#F97068" title="Finish" />}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', borderRadius: 24 },
  map: { flex: 1 },
  locationMarker: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  locationPulse: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#58D68D' },
  locationDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#58D68D', borderWidth: 3, borderColor: '#FFFFFF' },
});
