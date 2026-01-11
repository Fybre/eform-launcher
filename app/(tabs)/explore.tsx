import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, Pressable, Alert, TextInput, View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { storageUtils } from '@/utils/storage';
import { ThemeMode, EForm } from '@/types/eform';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function SettingsScreen() {
  const { themeMode, setThemeMode } = useTheme();
  const colors = useThemeColors();
  const [appTitle, setAppTitle] = useState('eForm Launcher');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [loadUrl, setLoadUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadAppTitle = async () => {
    const title = await storageUtils.getAppTitle();
    setAppTitle(title);
  };

  useFocusEffect(
    useCallback(() => {
      loadAppTitle();
    }, [])
  );

  const handleThemeChange = async (mode: ThemeMode) => {
    await setThemeMode(mode);
  };

  const handleSaveAppTitle = async () => {
    if (!appTitle.trim()) {
      Alert.alert('Error', 'App title cannot be empty');
      return;
    }
    try {
      await storageUtils.saveAppTitle(appTitle.trim());
      setIsEditingTitle(false);
      Alert.alert('Success', 'App title updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update app title');
    }
  };

  const handleCancelTitleEdit = () => {
    loadAppTitle();
    setIsEditingTitle(false);
  };

  const handleLoadFromUrl = async () => {
    if (!loadUrl.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(loadUrl.trim());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate the data structure
      if (!Array.isArray(data.forms)) {
        throw new Error('Invalid format: Expected an object with a "forms" array');
      }

      // Validate each form has required fields
      for (const form of data.forms) {
        if (!form.name || !form.url || !form.successRedirectPattern) {
          throw new Error('Invalid form: Each form must have name, url, and successRedirectPattern');
        }
      }

      const newForms = data.forms as EForm[];
      const existingForms = await storageUtils.getEForms();

      if (existingForms.length > 0) {
        // Ask user if they want to clear existing or merge
        Alert.alert(
          'Load Forms',
          `Found ${newForms.length} form(s) to import. You currently have ${existingForms.length} form(s).`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsLoading(false),
            },
            {
              text: 'Replace All',
              style: 'destructive',
              onPress: async () => {
                await importForms(newForms, true);
              },
            },
            {
              text: 'Merge',
              onPress: async () => {
                await importForms(newForms, false);
              },
            },
          ]
        );
      } else {
        await importForms(newForms, true);
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to load forms: ${errorMessage}`);
    }
  };

  const importForms = async (newForms: EForm[], clearExisting: boolean) => {
    try {
      let formsToSave: EForm[] = [];

      if (clearExisting) {
        // Assign order to new forms
        formsToSave = newForms.map((form, index) => ({
          ...form,
          id: Date.now().toString() + index,
          order: index,
        }));
      } else {
        // Merge with existing forms
        const existingForms = await storageUtils.getEForms();
        const maxOrder = Math.max(...existingForms.map(f => f.order ?? 0), -1);

        formsToSave = [
          ...existingForms,
          ...newForms.map((form, index) => ({
            ...form,
            id: Date.now().toString() + index,
            order: maxOrder + index + 1,
          })),
        ];
      }

      await storageUtils.saveEForms(formsToSave);
      setIsLoading(false);
      setLoadUrl('');
      Alert.alert('Success', `Successfully imported ${newForms.length} form(s)`);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to save forms');
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={[styles.header, {
        backgroundColor: colors.backgroundSecondary,
        borderBottomColor: colors.border
      }]}>
        <ThemedText type="title" style={{ color: colors.text }}>Settings</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Customize your app preferences
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Theme Section */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Theme</ThemedText>
          <View style={styles.themeOptions}>
            <Pressable
              style={[
                styles.themeButton,
                { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                themeMode === 'light' && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <ThemedText style={[
                styles.themeButtonText,
                { color: colors.text },
                themeMode === 'light' && { color: colors.primaryText },
              ]}>
                Light
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.themeButton,
                { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                themeMode === 'dark' && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <ThemedText style={[
                styles.themeButtonText,
                { color: colors.text },
                themeMode === 'dark' && { color: colors.primaryText },
              ]}>
                Dark
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.themeButton,
                { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                themeMode === 'system' && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => handleThemeChange('system')}
            >
              <ThemedText style={[
                styles.themeButtonText,
                { color: colors.text },
                themeMode === 'system' && { color: colors.primaryText },
              ]}>
                System
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        {/* Load Forms from URL Section */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Load eForm Definitions</ThemedText>
          <ThemedText style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Import form configurations from a JSON endpoint
          </ThemedText>
          <TextInput
            style={[styles.input, {
              borderColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
              color: colors.text
            }]}
            placeholder="https://example.com/forms.json"
            placeholderTextColor={colors.textSecondary}
            value={loadUrl}
            onChangeText={setLoadUrl}
            autoCapitalize="none"
            keyboardType="url"
            editable={!isLoading}
          />
          <Pressable
            style={[
              styles.loadButton,
              { backgroundColor: colors.primary },
              isLoading && { opacity: 0.6 }
            ]}
            onPress={handleLoadFromUrl}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <ThemedText style={[styles.loadButtonText, { color: colors.primaryText }]}>
                Load Forms
              </ThemedText>
            )}
          </Pressable>
        </ThemedView>

        {/* App Title Section */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>App Title</ThemedText>
          {!isEditingTitle ? (
            <View style={styles.titleDisplay}>
              <ThemedText style={[styles.currentTitle, { color: colors.text }]}>{appTitle}</ThemedText>
              <Pressable
                style={[styles.editTitleButton, { backgroundColor: colors.primary }]}
                onPress={() => setIsEditingTitle(true)}
              >
                <ThemedText style={[styles.editTitleButtonText, { color: colors.primaryText }]}>Edit</ThemedText>
              </Pressable>
            </View>
          ) : (
            <View>
              <TextInput
                style={[styles.input, {
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text
                }]}
                placeholder="App Title"
                placeholderTextColor={colors.textSecondary}
                value={appTitle}
                onChangeText={setAppTitle}
                autoFocus
              />
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.button, { backgroundColor: colors.textSecondary }]}
                  onPress={handleCancelTitleEdit}
                >
                  <ThemedText style={[styles.buttonText, { color: colors.primaryText }]}>Cancel</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleSaveAppTitle}
                >
                  <ThemedText style={[styles.buttonText, { color: colors.primaryText }]}>Save</ThemedText>
                </Pressable>
              </View>
            </View>
          )}
        </ThemedView>
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
  },
  section: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  titleDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  currentTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  editTitleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  editTitleButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  themeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  loadButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  loadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
