import React, { useState } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { palette, radii, spacing } from './theme';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  dark?: boolean;
};

export function Card({ children, style, dark }: CardProps) {
  return (
    <View style={[styles.card, dark ? styles.cardDark : styles.cardLight, style]}>
      {children}
    </View>
  );
}

type PressableScaleProps = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scale?: number;
};

export function PressableScale({ children, style, scale = 0.97, onPressIn, onPressOut, ...props }: PressableScaleProps) {
  const [motion] = useState(() => new Animated.Value(1));

  const animateTo = (value: number) => {
    Animated.spring(motion, {
      toValue: value,
      useNativeDriver: true,
      speed: 18,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      {...props}
      onPressIn={(event) => {
        animateTo(scale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}
      style={undefined}
    >
      <Animated.View style={[style, { transform: [{ scale: motion }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>{label}</Text>
    </PressableScale>
  );
}

type MetricProps = {
  value: string;
  label: string;
  accent?: boolean;
  valueStyle?: StyleProp<TextStyle>;
};

export function Metric({ value, label, accent, valueStyle }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, accent && styles.metricValueAccent, valueStyle]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ title, aside, dark }: { title: string; aside?: string; dark?: boolean }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, dark && styles.sectionTitleDark]}>{title}</Text>
      {aside ? <Text style={[styles.sectionAside, dark && styles.sectionAsideDark]}>{aside}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, padding: spacing.md },
  cardDark: { backgroundColor: palette.surfaceDark, borderColor: palette.lineDark, borderWidth: 1 },
  cardLight: { backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1 },
  chip: { height: 36, borderRadius: radii.pill, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: palette.ink },
  chipInactive: { backgroundColor: palette.canvas, borderWidth: 1, borderColor: palette.line },
  chipText: { fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: palette.textInverse },
  chipTextInactive: { color: palette.textMuted },
  metric: { minWidth: 0 },
  metricValue: { color: palette.textInverse, fontSize: 25, lineHeight: 30, fontWeight: '900', letterSpacing: -0.6 },
  metricValueAccent: { color: palette.lime },
  metricLabel: { color: palette.textInverseMuted, fontSize: 11, lineHeight: 15, marginTop: 4, letterSpacing: 0.8, textTransform: 'uppercase' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: palette.text, fontSize: 20, lineHeight: 24, fontWeight: '900', letterSpacing: -0.4 },
  sectionTitleDark: { color: palette.textInverse },
  sectionAside: { color: palette.textMuted, fontSize: 12, fontWeight: '700' },
  sectionAsideDark: { color: palette.textInverseMuted },
});
