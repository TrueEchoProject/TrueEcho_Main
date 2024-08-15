export default {
    expo: {
      name: "TrueEcho",
      slug: "trueecho",
      scheme: "trueecho",
      version: "1.0.0",
      orientation: "portrait",
      platforms: ["ios", "android"],
      icon: "./assets/icon.png",
      userInterfaceStyle: "light",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "cover",
        backgroundColor: "#ffffff",
      },
      assetBundlePatterns: ["**/*"],
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.hanseo.TrueEcho",
        googleServicesFile: "./GoogleService-Info.plist",
        config: {
          googleMapsApiKey: "Google_map_api_key_is_here", // 여기에 API 키를 하드코딩합니다.
        },
      },
      android: {
        package: "com.hanseo.TrueEcho",
        googleServicesFile: "./google-services.json",
        softwareKeyboardLayoutMode: "pan",
        adaptiveIcon: {
          foregroundImage: "./assets/icon.png",
          backgroundColor: "#ffffff",
        },
        permissions: ["NOTIFICATIONS"],
        config: {
          googleMaps: {
            apiKey: "Google_map_api_key_is_here", // 여기에 API 키를 하드코딩합니다.
          },
        },
      },
      web: {
        favicon: "./assets/icon.png",
      },
      owner: "trueecho",
      extra: {
        eas: {
          projectId: "71a30e64-a2a8-4e53-888b-f53592590986",
        },
      },
      plugins: ["expo-secure-store"],
    },
  };
  