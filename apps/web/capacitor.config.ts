import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.itaskorg.app',
  appName: 'iTaskOrg',
  webDir: 'public',
  server: {
    url: "https://itaskorg.vercel.app/",
    cleartext: true,
  },
  plugins: {
    SocialLogin: {
      google: {
        webClientId: '514738590363-50iarlr0qon24at6df0or5m9abeopbrn.apps.googleusercontent.com',
      },
    },
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
