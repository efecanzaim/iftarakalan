import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface QiblaCompassProps {
  qiblaAngle: number;
  compassHeading: number;
  isCalibrated: boolean;
}

const { width } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width - 80, 300);

export function QiblaCompass({ qiblaAngle, compassHeading, isCalibrated }: QiblaCompassProps) {
  // Pusula animasyonu
  const compassStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withSpring(`${-compassHeading}deg`, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  }, [compassHeading]);

  // Kıble oku animasyonu
  const qiblaArrowStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withSpring(`${qiblaAngle}deg`, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  }, [qiblaAngle]);

  // Pusula yönleri
  const directions = [
    { label: 'K', angle: 0 },
    { label: 'D', angle: 90 },
    { label: 'G', angle: 180 },
    { label: 'B', angle: 270 },
  ];

  return (
    <View className="items-center justify-center">
      {/* Dış çerçeve */}
      <View
        className="rounded-full bg-white dark:bg-gray-800 items-center justify-center"
        style={{
          width: COMPASS_SIZE + 20,
          height: COMPASS_SIZE + 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {/* Pusula arka planı */}
        <Animated.View
          style={[
            compassStyle,
            {
              width: COMPASS_SIZE,
              height: COMPASS_SIZE,
              borderRadius: COMPASS_SIZE / 2,
              backgroundColor: '#f8f9fa',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          {/* Derece çizgileri */}
          {Array.from({ length: 72 }).map((_, index) => {
            const isMajor = index % 9 === 0;
            return (
              <View
                key={index}
                style={{
                  position: 'absolute',
                  width: isMajor ? 2 : 1,
                  height: isMajor ? 15 : 8,
                  backgroundColor: isMajor ? '#1a5f4a' : '#ccc',
                  top: 10,
                  transform: [{ rotate: `${index * 5}deg` }],
                  transformOrigin: `center ${COMPASS_SIZE / 2 - 10}px`,
                }}
              />
            );
          })}

          {/* Yön harfleri */}
          {directions.map((dir) => (
            <View
              key={dir.label}
              style={{
                position: 'absolute',
                transform: [{ rotate: `${dir.angle}deg` }],
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: dir.label === 'K' ? '#c9a227' : '#1a5f4a',
                  transform: [
                    { translateY: -COMPASS_SIZE / 2 + 35 },
                    { rotate: `${-dir.angle}deg` },
                  ],
                }}
              >
                {dir.label}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Kıble oku */}
        <Animated.View
          style={[
            qiblaArrowStyle,
            {
              position: 'absolute',
              width: COMPASS_SIZE,
              height: COMPASS_SIZE,
              alignItems: 'center',
            },
          ]}
        >
          {/* Kıble yön oku */}
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 15,
              borderRightWidth: 15,
              borderBottomWidth: 40,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: '#c9a227',
              marginTop: 25,
            }}
          />
          {/* Kabe ikonu */}
          <Text style={{ fontSize: 24, marginTop: 5 }}>🕋</Text>
        </Animated.View>

        {/* Merkez nokta */}
        <View
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#1a5f4a',
            borderWidth: 3,
            borderColor: '#fff',
          }}
        />
      </View>

      {/* Kalibrasyon durumu */}
      {!isCalibrated && (
        <View className="mt-4 px-4 py-2 bg-yellow-100 rounded-lg">
          <Text className="text-yellow-700 text-center text-sm">
            Pusulanızı kalibre etmek için telefonunuzu 8 şeklinde hareket ettirin
          </Text>
        </View>
      )}
    </View>
  );
}
