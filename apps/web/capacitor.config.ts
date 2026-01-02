import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.itaskorg.app',
  appName: 'iTaskOrg',
  webDir: 'public',
  server: {
    url: "http://192.168.31.41:3000", // https://i-task-org-task-organizer.vercel.app/
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0F0F14",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
