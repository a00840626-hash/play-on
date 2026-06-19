import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fce04891e5d746e6ab697fdfeab2099f',
  appName: 'PlayOn',
  webDir: 'dist',
  server: {
    url: 'https://id-preview--fce04891-e5d7-46e6-ab69-7fdfeab2099f.lovable.app',
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
