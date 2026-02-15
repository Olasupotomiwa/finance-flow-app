// utils/firstTimeUser.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const FIRST_TIME_USER_KEY = "@first_time_user";

export const checkIsFirstTime = async (): Promise<boolean> => {
  try {
    const hasVisited = await AsyncStorage.getItem(FIRST_TIME_USER_KEY);
    return hasVisited === null; // First time if key doesn't exist
  } catch (error) {
    console.error('Error checking first time:', error);
    return false;
  }
};

export const markUserAsReturning = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(FIRST_TIME_USER_KEY, "true");
  } catch (error) {
    console.error('Error marking user as returning:', error);
  }
};