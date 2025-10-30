import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface LoadingAnimationProps {
  size?: number;
  color?: string;
  dotCount?: number;
}

export default function LoadingAnimation({ 
  size = 8, 
  color, 
  dotCount = 3 
}: LoadingAnimationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const dotColor = color || colors.secondary;
  
  const animatedValues = useRef(
    Array.from({ length: dotCount }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const createAnimation = (index: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValues[index], {
            toValue: 1,
            duration: 600,
            delay: index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValues[index], {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = animatedValues.map((_, index) => createAnimation(index));
    
    // Start all animations
    Animated.parallel(animations).start();
  }, [animatedValues]);

  return (
    <View style={styles.container}>
      {animatedValues.map((animatedValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              backgroundColor: dotColor,
              transform: [
                {
                  scale: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.2],
                  }),
                },
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -size / 2],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    borderRadius: 50,
  },
});
