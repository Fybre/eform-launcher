import { ThemedView } from "@/components/themed-view";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

export default function WebViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    url: string;
    name: string;
    successPattern: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(params.url);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCurrentUrl(navState.url);

    // Check if the URL matches the success redirect pattern
    if (params.successPattern && navState.url.includes(params.successPattern)) {
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
