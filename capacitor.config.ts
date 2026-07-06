import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playon.app',
  appName: 'PlayOn',
  webDir: 'dist',
  server: {
    url: 'https://play-on.lovable.app',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0A0F0D',
  },
  android: {
    backgroundColor: '#0A0F0D',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0A0F0D',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0F0D',
    },
  },
};

export default config;
