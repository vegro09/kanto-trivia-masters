import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kanto.triviamasters",
  appName: "اسألني",
  webDir: ".output/public",
  plugins: {
    AdMob: {
      appId: "ca-app-pub-2896816909885703~3461262032",
    },
  },
};

export default config;
