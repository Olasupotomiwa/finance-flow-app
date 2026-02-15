import { View, Text, Animated, Dimensions } from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onFinish: () => void;
}

let globalSplashHasRun = false;

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const hasFinished = useRef(false);
  const animationStarted = useRef(false);

  // Animation values
  const receiptScale = useRef(new Animated.Value(0.3)).current;
  const receiptOpacity = useRef(new Animated.Value(0)).current;
  const stampScale = useRef(new Animated.Value(0)).current;
  const stampRotate = useRef(new Animated.Value(0)).current;
  const stampOpacity = useRef(new Animated.Value(0)).current;
  const inkSpread = useRef(new Animated.Value(0)).current;
  const dateSlide = useRef(new Animated.Value(30)).current;
  const dateOpacity = useRef(new Animated.Value(0)).current;
  const signatureProgress = useRef(new Animated.Value(0)).current;
  const signatureOpacity = useRef(new Animated.Value(0)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  // Get today's date in receipt format
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    // 🔥 ULTIMATE GUARD - Check global flag first
    if (globalSplashHasRun) {
      onFinish();
      return;
    }

    // 🔥 Check if already started
    if (animationStarted.current) {
      return;
    }

    // Mark as started
    animationStarted.current = true;
    globalSplashHasRun = true;

    // Animation sequence
    Animated.sequence([
      // 1. Receipt zooms in and fades in
      Animated.parallel([
        Animated.spring(receiptScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(receiptOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // 2. Pause
      Animated.delay(400),

      // 3. Stamp slams down with rotation and ink spread
      Animated.parallel([
        Animated.spring(stampScale, {
          toValue: 1,
          tension: 80,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(stampRotate, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(stampOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(inkSpread, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // 4. Date and signature appear
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(dateSlide, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(dateOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(signatureOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      // 5. Signature draws
      Animated.timing(signatureProgress, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

      // 6. Sparkles appear sequentially
      Animated.stagger(150, [
        Animated.spring(sparkle1, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(sparkle2, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(sparkle3, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),

      // 7. Hold
      Animated.delay(600),

      // 8. Fade out everything
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!hasFinished.current) {
        hasFinished.current = true;
        onFinish();
      }
    });

    // Cleanup function
    return () => {
     
      globalSplashHasRun = false;
    };
  }, []); 

  const stampRotation = stampRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-12deg", "-5deg"],
  });

  const inkScale = inkSpread.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.3],
  });

  const inkOpacity = inkSpread.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 0],
  });

  return (
    <Animated.View
      className="flex-1 items-center justify-center"
      style={{
        backgroundColor: "#0F172A",
        opacity: fadeOut,
      }}
    >
      {/* Rest of your JSX stays the same */}
      <Animated.View
        style={{
          transform: [{ scale: receiptScale }],
          opacity: receiptOpacity,
          width: width * 0.95,
          height: height * 0.88,
        }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Receipt Top Edge (Perforation) */}
        <View className="h-6 bg-white flex-row justify-around items-center border-b-2 border-dashed border-gray-200">
          {[...Array(20)].map((_, i) => (
            <View key={i} className="w-2 h-6 bg-gray-100" />
          ))}
        </View>

        {/* Receipt Header */}
        <View className="items-center pt-8 pb-6 px-8">
          <View className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl items-center justify-center mb-4 shadow-lg">
            <Ionicons name="receipt-outline" size={48} color="white" />
          </View>
          <Text className="text-4xl font-appFontBold text-gray-900 mb-2">
            Finance Flow
          </Text>
          <Text className="text-base font-appFont text-gray-500">
            Professional Invoice & Receipt Management
          </Text>
        </View>

        {/* Divider */}
        <View className="mx-8 border-t-2 border-dashed border-gray-300 my-6" />

        {/* Features Section */}
        <View className="px-10 space-y-5">
          <Text className="text-xl font-appFontBold text-gray-900 mb-4">
            What You Can Do:
          </Text>

          <FeatureItem
            icon="document-text"
            title="Create Invoices"
            description="Professional invoices in seconds"
          />
          <FeatureItem
            icon="receipt"
            title="Generate Receipts"
            description="Quick and easy receipt creation"
          />
          <FeatureItem
            icon="download"
            title="Export as PDF"
            description="Share documents instantly"
          />
          <FeatureItem
            icon="people"
            title="Manage Clients"
            description="Keep track of your customers"
          />
          <FeatureItem
            icon="analytics"
            title="Track Payments"
            description="Monitor your cash flow"
          />
        </View>

        {/* Divider */}
        <View className="mx-8 border-t-2 border-dashed border-gray-300 my-6" />

        {/* Footer */}
        <View className="items-center pb-8">
          <Text className="text-sm font-appFont text-gray-400">
            Initializing your workspace...
          </Text>
        </View>

        {/* Receipt Bottom Edge (Perforation) */}
        <View className="absolute bottom-0 h-6 w-full bg-white flex-row justify-around items-center border-t-2 border-dashed border-gray-200">
          {[...Array(20)].map((_, i) => (
            <View key={i} className="w-2 h-6 bg-gray-100" />
          ))}
        </View>

        {/* Ink Spread Effect */}
        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.42,
            right: width * 0.1,
            width: 280,
            height: 280,
            borderRadius: 140,
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            transform: [{ scale: inkScale }],
            opacity: inkOpacity,
          }}
        />

        {/* Stamp */}
        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.45,
            right: width * 0.15,
            transform: [{ scale: stampScale }, { rotate: stampRotation }],
            opacity: stampOpacity,
          }}
        >
          {/* Stamp Border with gradient effect */}
          <View
            className="border-8 rounded-2xl p-6 items-center justify-center"
            style={{
              borderColor: "#DC2626",
              backgroundColor: "rgba(220, 38, 38, 0.05)",
              shadowColor: "#DC2626",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <Text
              className="font-appFontBold text-5xl mb-2"
              style={{
                color: "#DC2626",
                letterSpacing: 3,
                textShadowColor: "rgba(220, 38, 38, 0.3)",
                textShadowOffset: { width: 2, height: 2 },
                textShadowRadius: 4,
              }}
            >
              APPROVED
            </Text>

            {/* Checkmark */}
            <View className="flex-row items-center mt-2">
              <Ionicons name="checkmark-circle" size={28} color="#DC2626" />
              <Text
                className="font-appFontBold text-lg ml-2"
                style={{ color: "#DC2626" }}
              >
                VERIFIED
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Date and Signature Section */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: height * 0.12,
            left: 0,
            right: 0,
            paddingHorizontal: 40,
            transform: [{ translateY: dateSlide }],
            opacity: dateOpacity,
          }}
        >
          <View className="flex-row justify-between items-end">
            {/* Date Field */}
            <View className="flex-1 mr-6">
              <Text className="text-xs font-appFont text-gray-500 mb-2 uppercase tracking-wide">
                Date
              </Text>
              <Text className="text-xl font-appFontBold text-gray-900 mb-1">
                {formattedDate}
              </Text>
              <View className="h-0.5 bg-gray-900" />
            </View>

            {/* Signature Field */}
            <View className="flex-1">
              <Text className="text-xs font-appFont text-gray-500 mb-2 uppercase tracking-wide">
                Authorized Signature
              </Text>
              <AnimatedSignature
                progress={signatureProgress}
                opacity={signatureOpacity}
              />
              <View className="h-0.5 bg-gray-900 mt-1" />
            </View>
          </View>
        </Animated.View>

        {/* Sparkle Effects */}
        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.4,
            right: width * 0.08,
            transform: [{ scale: sparkle1 }],
            opacity: sparkle1,
          }}
        >
          <Ionicons name="star" size={24} color="#FCD34D" />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.52,
            right: width * 0.42,
            transform: [{ scale: sparkle2 }],
            opacity: sparkle2,
          }}
        >
          <Ionicons name="star" size={20} color="#FCD34D" />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.38,
            right: width * 0.3,
            transform: [{ scale: sparkle3 }],
            opacity: sparkle3,
          }}
        >
          <Ionicons name="star" size={16} color="#FCD34D" />
        </Animated.View>
      </Animated.View>

      {/* Loading Indicator */}
      <View className="absolute bottom-16 flex-row space-x-3">
        {[0, 1, 2].map((index) => (
          <LoadingDot key={index} delay={index * 200} />
        ))}
      </View>
    </Animated.View>
  );
}

// Animated Signature Component
function AnimatedSignature({
  progress,
  opacity,
}: {
  progress: Animated.Value;
  opacity: Animated.Value;
}) {
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <Animated.View style={{ opacity, height: 40 }}>
      <Svg height="40" width="140" viewBox="0 0 140 40">
        <AnimatedPath
          d="M 10 30 Q 20 10, 35 25 T 60 20 Q 70 15, 80 25 Q 90 35, 100 20 Q 110 10, 125 28"
          stroke="#1F2937"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="300"
          strokeDashoffset={strokeDashoffset}
        />
        <AnimatedPath
          d="M 15 35 Q 50 32, 90 35 Q 110 37, 120 33"
          stroke="#1F2937"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
    </Animated.View>
  );
}

// Feature item component
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-start">
      <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mr-4">
        <Ionicons name={icon} size={24} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-appFontBold text-gray-900 mb-1">
          {title}
        </Text>
        <Text className="text-sm font-appFont text-gray-500">
          {description}
        </Text>
      </View>
      <Ionicons name="checkmark-circle" size={22} color="#10B981" />
    </View>
  );
}

// Loading dots
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
  }, [delay, animatedValue]);

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        opacity,
      }}
      className="w-3 h-3 bg-blue-500 rounded-full"
    />
  );
}
