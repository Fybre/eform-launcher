import { useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { storageUtils } from '@/utils/storage';
import { EForm } from '@/types/eform';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTheme } from '@/contexts/ThemeContext';
import { getButtonColor } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { effectiveColorScheme } = useTheme();
  const [forms, setForms] = useState<EForm[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [appTitle, setAppTitle] = useState('eForm Launcher');

  const sortedForms = useMemo(() => {
    return [...forms].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [forms]);

  const loadForms = async () => {
    const loadedForms = await storageUtils.getEForms();
    setForms(loadedForms);
  };

  const loadAppTitle = async () => {
    const title = await storageUtils.getAppTitle();
    setAppTitle(title);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadForms();
    await loadAppTitle();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadForms();
      loadAppTitle();
    }, [])
  );

  const handleFormPress = (form: EForm) => {
    router.push({
      pathname: '/webview',
      params: {
        url: form.url,
        name: form.name,
        successPattern: form.successRedirectPattern,
      },
    });
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={[styles.header, {
        backgroundColor: colors.backgroundSecondary,
        borderBottomColor: colors.border
      }]}>
        <ThemedText type="title" style={{ color: colors.text }}>{appTitle}</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {forms.length === 0
            ? 'No forms configured. Go to Settings to add forms.'
            : 'Select a form to fill out'}
        </ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedForms.map((form) => (
          <Pressable
            key={form.id}
            style={({ pressed }) => [
              styles.formButton,
              {
                backgroundColor: getButtonColor(form.color, effectiveColorScheme),
                shadowColor: colors.text,
              },
              pressed && styles.formButtonPressed,
            ]}
            onPress={() => handleFormPress(form)}
          >
            <ThemedText type="subtitle" style={[styles.formButtonTitle, { color: colors.primaryText }]}>
              {form.name}
            </ThemedText>
            {form.description && (
              <ThemedText style={[styles.formButtonDescription, { color: colors.primaryText }]}>
                {form.description}
              </ThemedText>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  formButton: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 80,
    justifyContent: 'center',
  },
  formButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  formButtonTitle: {
    marginBottom: 6,
    fontSize: 18,
    fontWeight: '600',
  },
  formButtonDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});
