import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.haninsan.presiyometre',
  appName: 'Presiyometre Rapor',
  webDir: 'src',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2c3e50'
    }
  }
};

export default config;
