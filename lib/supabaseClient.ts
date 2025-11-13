import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://bbxhdxdgharlyyioeblm.supabase.co'; // <-- IMPORTANT: Replace with your Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieGhkeGRnaGFybHl5aW9lYmxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzQyODYsImV4cCI6MjA3NTU1MDI4Nn0.3zHLQ3Bu5HdYCDVBWtg2CwCrcUN_uuVFNkuS8OqT1CM'; // <-- IMPORTANT: Replace with your Supabase anon key

/*
  IMPORTANT: The Supabase URL and anon key below are placeholders.
  The application will not function correctly (e.g., login, data fetching will fail)
  until you replace them with your own Supabase project's credentials.

  You can find your credentials in your Supabase project's dashboard under:
  Settings > API > Project API keys

  The check below is commented out to allow the application to start,
  but you will encounter network errors until the credentials are set correctly.
*/
/* if (supabaseUrl === 'https://bbxhdxdgharlyyioeblm.supabase.co' || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieGhkeGRnaGFybHl5aW9lYmxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzQyODYsImV4cCI6MjA3NTU1MDI4Nn0.3zHLQ3Bu5HdYCDVBWtg2CwCrcUN_uuVFNkuS8OqT1CM') {
  throw new Error("Supabase credentials are not set. Please update lib/supabaseClient.ts with your project's URL and anon key.");
} */

// Explicitly configure the Supabase client for a robust and fast user experience.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use localStorage for session persistence.
    // - localStorage: Persists the session even after the browser is closed. This provides a "remember me"
    //   experience, allowing users to return to the app without logging in again, which is ideal for
    //   most applications and contributes to a "super fast workflow".
    // - sessionStorage: Clears the session when the browser tab is closed. This is more secure for
    //   public computers but requires re-authentication on every new visit.
    //
    // For this app, localStorage is chosen for better user convenience and faster load times on return visits.
    storage: localStorage,

    // Automatically refreshes the session token in the background.
    // This is crucial for maintaining a logged-in state without interrupting the user.
    // When the short-lived access token expires, the client uses the stored refresh token
    // to get a new one, ensuring a seamless experience. This is key to a "better refresh token" system.
    autoRefreshToken: true,

    // Persist the user's session in the chosen storage.
    // If set to false, the user would be logged out on page refresh.
    persistSession: true,

    // Automatically detects and uses the session from the URL, which is necessary
    // for OAuth providers and magic link authentication flows to work correctly.
    detectSessionInUrl: true,
  },
});