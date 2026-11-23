import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, Region, MapType } from 'react-native-maps';
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
  const [mapType, setMapType] = useState<MapType>('standard');
  const coordinates = points.map(({ latitude, longitude }) => ({ latitude, longitude }));

  useEffect(() => {
    if (!currentLocation || finished) return;
    map.current?.animateToRegion({ ...currentLocation, latitudeDelta: 0.006, longitudeDelta: 0.006 }, 500);
  }, [currentLocation, finished]);

  useEffect(() => {
    if (!finished || coordinates.length < 2) return;
    const timer = setTimeout(() => {
      map.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 44, right: 44, bottom: 44, left: 44 },
        animated: true,
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [coordinates, finished]);

  return (
    <View style={styles.container}>
      <MapView
        ref={map}
        style={styles.map}
        initialRegion={FALLBACK_REGION}
        mapType={mapType}
        showsUserLocation={Boolean(currentLocation)}
      >
        {coordinates.length > 1 && <Polyline coordinates={coordinates} strokeColor="#FC5201" strokeWidth={5} />}
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
      <View style={styles.mapTypeControl} accessibilityRole="radiogroup" accessibilityLabel="Map type">
        {([
          ['standard', 'Map'],
          ['satellite', 'Satellite'],
          ['terrain', 'Terrain'],
        ] as const).map(([type, label]) => (
          <Pressable
            key={type}
            accessibilityRole="radio"
            accessibilityState={{ selected: mapType === type }}
            onPress={() => setMapType(type)}
            style={[styles.mapTypeButton, mapType === type && styles.mapTypeButtonActive]}
          >
            <Text style={[styles.mapTypeText, mapType === type && styles.mapTypeTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', borderRadius: 24 },
  map: { flex: 1 },
  locationMarker: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  locationPulse: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#FC5201' },
  locationDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FC5201', borderWidth: 3, borderColor: '#FFFFFF' },
  mapTypeControl: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', borderRadius: 18, backgroundColor: '#FFFFFF', padding: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  mapTypeButton: { height: 32, paddingHorizontal: 10, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  mapTypeButtonActive: { backgroundColor: '#111827' },
  mapTypeText: { color: '#667085', fontSize: 12, fontWeight: '700' },
  mapTypeTextActive: { color: '#FFFFFF' },
});
