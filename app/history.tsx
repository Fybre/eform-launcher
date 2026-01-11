import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, Pressable, Alert, View } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { storageUtils } from '@/utils/storage';
import { FormSubmission } from '@/types/eform';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function HistoryScreen() {
  const colors = useThemeColors();
  const [history, setHistory] = useState<FormSubmission[]>([]);

  const loadHistory = async () => {
    const submissions = await storageUtils.getHistory();
    setHistory(submissions);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all submission history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storageUtils.clearHistory();
            loadHistory();
            Alert.alert('Success', 'History cleared');
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Submission History',
          headerShown: true,
        }}
      />
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.header, {
          backgroundColor: colors.backgroundSecondary,
          borderBottomColor: colors.border
        }]}>
          <ThemedText type="title" style={{ color: colors.text }}>Submission History</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            View all form submissions
          </ThemedText>
          {history.length > 0 && (
            <Pressable
              style={[styles.clearButton, { backgroundColor: colors.danger }]}
              onPress={handleClearHistory}
            >
              <ThemedText style={[styles.clearButtonText, { color: colors.primaryText }]}>
                Clear History
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {history.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                No submission history yet
              </ThemedText>
            </ThemedView>
          ) : (
            history.map((submission) => (
              <ThemedView
                key={submission.id}
                style={[styles.historyItem, {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                }]}
              >
                <ThemedText type="subtitle" style={[styles.formName, { color: colors.text }]}>
                  {submission.formName}
                </ThemedText>
                <ThemedText style={[styles.timestamp, { color: colors.textSecondary }]}>
                  {formatDate(submission.timestamp)}
                </ThemedText>
                <ThemedText
                  style={[styles.url, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {submission.url}
                </ThemedText>
              </ThemedView>
            ))
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  historyItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  formName: {
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 14,
    marginBottom: 4,
  },
  url: {
    fontSize: 12,
    opacity: 0.7,
  },
});
