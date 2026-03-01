import { View, Text, Animated, Dimensions } from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// Responsive font size helper
const rf = (size: number) => Math.min(size, size * (width / 390));

interface SplashScreenProps {
  onFinish: () => void;
}

let globalSplashHasRun = false;

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const hasFinished = useRef(false);
  const animationStarted = useRef(false);

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

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    if (globalSplashHasRun) {
      onFinish();
      return;
    }
    if (animationStarted.current) return;

    animationStarted.current = true;
    globalSplashHasRun = true;

    Animated.sequence([
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

      Animated.delay(400),

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

      Animated.timing(signatureProgress, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

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

      Animated.delay(600),

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

  // Inner receipt width (accounting for margins)
  const receiptWidth = width * 0.95;
  const innerWidth = receiptWidth - 64; // 32px padding each side

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0F172A",
        opacity: fadeOut,
      }}
    >
      <Animated.View
        style={{
          transform: [{ scale: receiptScale }],
          opacity: receiptOpacity,
          width: receiptWidth,
          height: height * 0.88,
          backgroundColor: "white",
          borderRadius: 24,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 16,
        }}
      >
        {/* Top Perforation */}
        <View
          style={{
            height: 20,
            backgroundColor: "white",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderBottomWidth: 2,
            borderBottomColor: "#E5E7EB",
            borderStyle: "dashed",
          }}
        >
          {[...Array(18)].map((_, i) => (
            <View
              key={i}
              style={{ width: 7, height: 20, backgroundColor: "#F3F4F6" }}
            />
          ))}
        </View>

        {/* Header */}
        <View
          style={{
            alignItems: "center",
            paddingTop: 20,
            paddingBottom: 16,
            paddingHorizontal: 24,
          }}
        >
          {/* Logo icon */}
          <View
            style={{
              width: 72,
              height: 72,
              backgroundColor: "#1D4ED8",
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              shadowColor: "#1D4ED8",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="receipt-outline" size={36} color="white" />
          </View>

          {/* ✅ FIX: App name uses width-aware font size and numberOfLines */}
          <Text
            style={{
              fontSize: rf(28),
              fontFamily: "appFontBold",
              color: "#111827",
              marginBottom: 4,
              textAlign: "center",
              width: innerWidth,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            Finance Flow
          </Text>

          <Text
            style={{
              fontSize: rf(13),
              fontFamily: "appFont",
              color: "#6B7280",
              textAlign: "center",
              width: innerWidth,
            }}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            Professional Invoice & Receipt Management
          </Text>
        </View>

        {/* Divider */}
        <View
          style={{
            marginHorizontal: 28,
            borderTopWidth: 2,
            borderTopColor: "#D1D5DB",
            borderStyle: "dashed",
            marginVertical: 10,
          }}
        />

        {/* Features */}
        <View style={{ paddingHorizontal: 28 }}>
          <Text
            style={{
              fontSize: rf(16),
              fontFamily: "appFontBold",
              color: "#111827",
              marginBottom: 10,
            }}
          >
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
        <View
          style={{
            marginHorizontal: 28,
            borderTopWidth: 2,
            borderTopColor: "#D1D5DB",
            borderStyle: "dashed",
            marginVertical: 10,
          }}
        />

        {/* Footer */}
        <View style={{ alignItems: "center", paddingBottom: 20 }}>
          <Text
            style={{ fontSize: 12, fontFamily: "appFont", color: "#9CA3AF" }}
          >
            Initializing your workspace...
          </Text>
        </View>

        {/* Bottom Perforation */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            height: 20,
            width: "100%",
            backgroundColor: "white",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderTopWidth: 2,
            borderTopColor: "#E5E7EB",
            borderStyle: "dashed",
          }}
        >
          {[...Array(18)].map((_, i) => (
            <View
              key={i}
              style={{ width: 7, height: 20, backgroundColor: "#F3F4F6" }}
            />
          ))}
        </View>

        {/* Ink Spread */}
        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.38,
            left: receiptWidth * 0.1,
            width: receiptWidth * 0.6,
            height: receiptWidth * 0.6,
            borderRadius: receiptWidth * 0.3,
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            transform: [{ scale: inkScale }],
            opacity: inkOpacity,
          }}
        />

        {/* ✅ FIXED STAMP - fully contained, responsive sizing */}
        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.41,
            // Centered by using left+right relative to receipt inner width
            left: receiptWidth * 0.08,
            right: receiptWidth * 0.08,
            transform: [{ scale: stampScale }, { rotate: stampRotation }],
            opacity: stampOpacity,
            alignItems: "center",
          }}
        >
          <View
            style={{
              borderWidth: 5,
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignItems: "center",
              justifyContent: "center",
              borderColor: "#DC2626",
              backgroundColor: "rgba(220, 38, 38, 0.05)",
              shadowColor: "#DC2626",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
              // ✅ Width relative to receipt so it always fits
              width: receiptWidth * 0.7,
            }}
          >
            {/* ✅ adjustsFontSizeToFit ensures APPROVED never clips */}
            <Text
              style={{
                fontFamily: "appFontBold",
                fontSize: rf(34),
                marginBottom: 4,
                color: "#DC2626",
                letterSpacing: 3,
                textShadowColor: "rgba(220, 38, 38, 0.3)",
                textShadowOffset: { width: 2, height: 2 },
                textShadowRadius: 4,
                textAlign: "center",
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              APPROVED
            </Text>

            {/* ✅ VERIFIED row - constrained width so it never overflows */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 2,
              }}
            >
              <Ionicons name="checkmark-circle" size={rf(20)} color="#DC2626" />
              <Text
                style={{
                  fontFamily: "appFontBold",
                  fontSize: rf(16),
                  marginLeft: 5,
                  color: "#DC2626",
                  letterSpacing: 2,
                  textAlign: "center",
                  flexShrink: 1,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
              >
                VERIFIED
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Date and Signature */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: height * 0.1,
            left: 0,
            right: 0,
            paddingHorizontal: 28,
            transform: [{ translateY: dateSlide }],
            opacity: dateOpacity,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "appFont",
                  color: "#6B7280",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Date
              </Text>
              <Text
                style={{
                  fontSize: rf(16),
                  fontFamily: "appFontBold",
                  color: "#111827",
                  marginBottom: 4,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formattedDate}
              </Text>
              <View style={{ height: 1, backgroundColor: "#111827" }} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "appFont",
                  color: "#6B7280",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                Authorized Signature
              </Text>
              <AnimatedSignature
                progress={signatureProgress}
                opacity={signatureOpacity}
              />
              <View
                style={{ height: 1, backgroundColor: "#111827", marginTop: 4 }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Sparkles */}
        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.37,
            right: receiptWidth * 0.08,
            transform: [{ scale: sparkle1 }],
            opacity: sparkle1,
          }}
        >
          <Ionicons name="star" size={22} color="#FCD34D" />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.49,
            left: receiptWidth * 0.35,
            transform: [{ scale: sparkle2 }],
            opacity: sparkle2,
          }}
        >
          <Ionicons name="star" size={18} color="#FCD34D" />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.35,
            left: receiptWidth * 0.28,
            transform: [{ scale: sparkle3 }],
            opacity: sparkle3,
          }}
        >
          <Ionicons name="star" size={14} color="#FCD34D" />
        </Animated.View>
      </Animated.View>

      {/* Loading dots */}
      <View
        style={{
          position: "absolute",
          bottom: 48,
          flexDirection: "row",
          gap: 10,
        }}
      >
        {[0, 1, 2].map((i) => (
          <LoadingDot key={i} delay={i * 200} />
        ))}
      </View>
    </Animated.View>
  );
}

// Animated Signature
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
    <Animated.View style={{ opacity, height: 36 }}>
      <Svg height="36" width="130" viewBox="0 0 140 40">
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

// Feature Item
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
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          backgroundColor: "#DBEAFE",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Ionicons name={icon} size={20} color="#2563EB" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: rf(13),
            fontFamily: "appFontBold",
            color: "#111827",
            marginBottom: 1,
          }}
        >
          {title}
        </Text>
        <Text
          style={{ fontSize: rf(11), fontFamily: "appFont", color: "#6B7280" }}
        >
          {description}
        </Text>
      </View>
      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
    </View>
  );
}

// Loading Dot
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
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: "#3B82F6",
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}
