import { supabase } from "../lib/supabse";

export const updateBusinessProfile = async (
  firstName: string, 
  lastName: string, 
  businessName: string
) => {
  // Get the current user session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  const { data, error } = await supabase
    .from('users')
    .update({
      first_name: firstName,
      last_name: lastName,
      business_name: businessName,
    })
    .eq('id', user.id); // Security: only update the row matching the logged-in ID

  return { data, error };
};