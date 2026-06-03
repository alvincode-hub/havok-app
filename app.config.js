const iosBundleIdentifier =
  process.env.APP_IOS_BUNDLE_IDENTIFIER || "com.havokapp.mobile";
const androidPackage = process.env.APP_ANDROID_PACKAGE || "com.havokapp.mobile";

module.exports = {
  expo: {
    name: "HavokApp",
    slug: "HavokApp",
    version: "1.0.0",

    runtimeVersion: {
      policy: "appVersion",
    },

    updates: {
      url: "https://u.expo.dev/305b711c-242b-4c93-a25b-053dc3559ac0",
    },

    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "havokapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      bundleIdentifier: iosBundleIdentifier,
      supportsTablet: true,
    },

    android: {
      package: androidPackage,
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-secure-store",
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    extra: {
      eas: {
        projectId: "305b711c-242b-4c93-a25b-053dc3559ac0",
      },
    },
  },
};
