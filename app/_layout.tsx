import { Stack } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { ActivityIndicator } from "react-native";


export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    appFont: require("../assets/font/BarlowSemiCondensed-Regular.ttf"),
    appFontBold: require("../assets/font/BarlowSemiCondensed-Bold.ttf"),
  });
  if (!fontsLoaded) {
    return <ActivityIndicator/>
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}


