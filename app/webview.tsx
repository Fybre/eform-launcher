import { ThemedView } from "@/components/themed-view";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import NetInfo from "@react-native-community/netinfo";
import { storageUtils } from "@/utils/storage";

export default function WebViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    url: string;
    name: string;
    successPattern: string;
    formId: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(params.url);

  useEffect(() => {
    const checkNetworkConnection = async () => {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        Alert.alert(
          "No Internet Connection",
          "You are offline. Please check your internet connection and try again.",
          [
            {
              text: "Go Back",
              onPress: () => router.back(),
            },
            {
              text: "Try Anyway",
              style: "cancel",
            },
          ]
        );
      }
    };

    checkNetworkConnection();
  }, []);

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    setCurrentUrl(navState.url);

    // Check if the URL matches the success redirect pattern
    if (params.successPattern && navState.url.includes(params.successPattern)) {
      // Log the submission to history
      try {
        await storageUtils.addSubmission(params.formId, params.name, navState.url);
      } catch (error) {
        console.error("Failed to log submission:", error);
      }

      // Form was submitted successfully
      Alert.alert("Success", "Form submitted successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: params.name,
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
      <ThemedView style={styles.container}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        )}

        <WebView
          source={{ uri: params.url }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          sharedCookiesEnabled={true} // Enable cookie sharing for session persistence
          thirdPartyCookiesEnabled={true}
          domStorageEnabled={true} // Enable local storage
          javaScriptEnabled={true}
          setSupportMultipleWindows={false}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 999,
  },
});
