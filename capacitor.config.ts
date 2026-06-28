import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elfin.app',
  appName: '亲友管理',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
