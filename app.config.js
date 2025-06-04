export default {
  name: "TaskFlow",
  slug: "taskflow",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    }
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    eas: {
      projectId: "your-project-id"
    }
  },
  plugins: [
    "expo-router"
  ],
  experiments: {
    typedRoutes: true
  },
  // Add environment variables
  extra: {
    EXPO_PUBLIC_GEMENI: process.env.EXPO_PUBLIC_GEMENI || "AIzaSyDvYxEd5bXSPaxQQTXIjfmyF9jxyysIbEg"
  }
};