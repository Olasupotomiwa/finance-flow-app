import { View, Text, Animated, Dimensions, Image } from "react-native";
import { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-gray-900">
      {/* Fullscreen Image */}
      <Image
        source={require("../assets/images/splash2.jpg")}
        style={{
          width: width,
          height: height,
          resizeMode: "cover",
        }}
      />

      {/* Overlayed App Name */}
      <Animated.Text
        style={{
          position: "absolute",
          bottom: 160, 
          width: "100%",
          textAlign: "center",
          color: "white",
          fontFamily: "appFontBold",
          fontSize: 60,
          opacity: fadeAnim,
        }}
      >
        Finance Flow
      </Animated.Text>

      {/* Loading Dots */}
      <Animated.View
        style={{ position: "absolute", bottom: 40, opacity: fadeAnim }}
        className="flex-row justify-center space-x-2 w-full"
      >
        {[0, 1, 2].map((index) => (
          <LoadingDot key={index} delay={index * 200} />
        ))}
      </Animated.View>
    </View>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View
      style={{ transform: [{ translateY }] }}
      className="w-3 h-3 bg-blue-500 rounded-full"
    />
  );
}
