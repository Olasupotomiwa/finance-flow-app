import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabse";
import { useAuth } from "./Authcontext";
import Toast from "react-native-toast-message";

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  business_email: string | null;
  business_phone: string | null;
  street_address: string | null;
  state: string | null;
  lga: string | null;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  avatar_url: string | null;
  business_logo_url: string | null;
  phone: string | null;
}

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  profileCompletion: number;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  updateProfile: async () => false,
  profileCompletion: 0,
});

const PROFILE_FIELDS: (keyof UserProfile)[] = [
  "first_name",
  "last_name",
  "business_name",
  "business_email",
  "business_phone",
  "street_address",
  "state",
  "lga",
  "bank_name",
  "account_name",
  "account_number",
];

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  // Calculate profile completion percentage
  const profileCompletion = profile
    ? Math.round(
        (PROFILE_FIELDS.filter((field) => {
          const value = profile[field];
          return value && String(value).trim() !== "";
        }).length /
          PROFILE_FIELDS.length) *
          100,
      )
    : 0;

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      // If no profile exists, create one
      if (!data) {
        const { data: newProfile, error: insertError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            business_email: user.email,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
        return;
      }

      setProfile(data);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch profile",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Update profile and reflect changes everywhere
  const updateProfile = async (
    updates: Partial<UserProfile>,
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      // 🔥 Update local state immediately - reflects everywhere
      setProfile(data);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully!",
        position: "top",
      });

      return true;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.message || "Failed to update profile",
        position: "top",
      });
      return false;
    }
  };

  // Refresh profile manually
  const refreshProfile = async () => {
    setLoading(true);
    await fetchProfile();
  };

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        refreshProfile,
        updateProfile,
        profileCompletion,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
