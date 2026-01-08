import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, Image } from 'react-native';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
  onAnimationEnd: () => void;
}

export function AnimatedSplash({ onAnimationEnd }: AnimatedSplashProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const starsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animasyon sekansı
    Animated.sequence([
      // Yıldızlar fade in
      Animated.timing(starsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Logo fade in ve scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Bekle
      Animated.delay(1000),
    ]).start(() => {
      onAnimationEnd();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Yıldızlar */}
      <Animated.View style={[styles.starsContainer, { opacity: starsOpacity }]}>
        {[...Array(25)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.3,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.moonEmoji}>🌙</Text>
        <Text style={styles.mosqueEmoji}>🕌</Text>
        <Text style={styles.title}>İftara Kalan</Text>
        <View style={styles.decorLine} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  mosqueEmoji: {
    fontSize: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#eeb105',
    letterSpacing: 2,
  },
  decorLine: {
    width: 100,
    height: 3,
    backgroundColor: '#eeb105',
    borderRadius: 2,
    marginTop: 15,
  },
});
