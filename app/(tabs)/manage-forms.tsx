import { useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, Pressable, Alert, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { storageUtils } from '@/utils/storage';
import { EForm, ButtonColor } from '@/types/eform';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { ButtonColors } from '@/constants/theme';

export default function ManageFormsScreen() {
  const { effectiveColorScheme } = useTheme();
  const colors = useThemeColors();
  const [forms, setForms] = useState<EForm[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({
    name: '',
    url: '',
    successRedirectPattern: '',
    description: '',
    color: 'blue' as ButtonColor,
  });

  const sortedForms = useMemo(() => {
    return [...forms].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [forms]);

  const colorOptions: ButtonColor[] = ['blue', 'green', 'purple', 'orange', 'red', 'pink', 'teal'];

  const loadForms = async () => {
    const loadedForms = await storageUtils.getEForms();
    setForms(loadedForms);
  };

  useFocusEffect(
    useCallback(() => {
      loadForms();
    }, [])
  );

  const handleAddForm = async () => {
    if (!newForm.name.trim() || !newForm.url.trim() || !newForm.successRedirectPattern.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const maxOrder = Math.max(...forms.map(f => f.order ?? 0), -1);
    const form: EForm = {
      id: Date.now().toString(),
      name: newForm.name.trim(),
      url: newForm.url.trim(),
      successRedirectPattern: newForm.successRedirectPattern.trim(),
      description: newForm.description.trim() || undefined,
      color: newForm.color,
      order: maxOrder + 1,
    };

    try {
      await storageUtils.addEForm(form);
      setNewForm({ name: '', url: '', successRedirectPattern: '', description: '', color: 'blue' });
      setIsAdding(false);
      loadForms();
      Alert.alert('Success', 'Form added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add form');
    }
  };

  const handleEditForm = (form: EForm) => {
    setEditingId(form.id);
    setNewForm({
      name: form.name,
      url: form.url,
      successRedirectPattern: form.successRedirectPattern,
      description: form.description || '',
      color: form.color || 'blue',
    });
    setIsAdding(false);
  };

  const handleSaveEdit = async () => {
    if (!newForm.name.trim() || !newForm.url.trim() || !newForm.successRedirectPattern.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!editingId) return;

    try {
      await storageUtils.updateEForm(editingId, {
        name: newForm.name.trim(),
        url: newForm.url.trim(),
        successRedirectPattern: newForm.successRedirectPattern.trim(),
        description: newForm.description.trim() || undefined,
        color: newForm.color,
      });
      setNewForm({ name: '', url: '', successRedirectPattern: '', description: '', color: 'blue' });
      setEditingId(null);
      loadForms();
      Alert.alert('Success', 'Form updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update form');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewForm({ name: '', url: '', successRedirectPattern: '', description: '', color: 'blue' });
  };

  const handleMoveUp = async (form: EForm) => {
    const currentIndex = sortedForms.findIndex(f => f.id === form.id);
    if (currentIndex <= 0) return;

    const previousForm = sortedForms[currentIndex - 1];

    try {
      // Swap the order values
      await storageUtils.updateEForm(form.id, { order: currentIndex - 1 });
      await storageUtils.updateEForm(previousForm.id, { order: currentIndex });
      await loadForms();
    } catch (error) {
      Alert.alert('Error', 'Failed to reorder forms');
    }
  };

  const handleMoveDown = async (form: EForm) => {
    const currentIndex = sortedForms.findIndex(f => f.id === form.id);
    if (currentIndex >= sortedForms.length - 1) return;

    const nextForm = sortedForms[currentIndex + 1];

    try {
      // Swap the order values
      await storageUtils.updateEForm(form.id, { order: currentIndex + 1 });
      await storageUtils.updateEForm(nextForm.id, { order: currentIndex });
      await loadForms();
    } catch (error) {
      Alert.alert('Error', 'Failed to reorder forms');
    }
  };

  const handleDeleteForm = (id: string) => {
    Alert.alert(
      'Delete Form',
      'Are you sure you want to delete this form?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storageUtils.deleteEForm(id);
            loadForms();
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={[styles.header, {
        backgroundColor: colors.backgroundSecondary,
        borderBottomColor: colors.border
      }]}>
        <ThemedText type="title" style={{ color: colors.text }}>Manage Forms</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Add, edit, and organize your eForms
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {sortedForms.map((form, index) => {
          const isEditing = editingId === form.id;

          if (isEditing) {
            return (
              <ThemedView key={form.id} style={[styles.editFormContainer, {
                backgroundColor: colors.card,
                borderColor: colors.primary,
              }]}>
                <ThemedText type="subtitle" style={[styles.editFormTitle, { color: colors.text }]}>
                  Edit Form
                </ThemedText>

                <TextInput
                  style={[styles.input, {
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  }]}
                  placeholder="Form Name (required)"
                  placeholderTextColor={colors.textSecondary}
                  value={newForm.name}
                  onChangeText={(text) => setNewForm({ ...newForm, name: text })}
                />

                <TextInput
                  style={[styles.input, {
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  }]}
                  placeholder="Form URL (required)"
                  placeholderTextColor={colors.textSecondary}
                  value={newForm.url}
                  onChangeText={(text) => setNewForm({ ...newForm, url: text })}
                  autoCapitalize="none"
                  keyboardType="url"
                />

                <TextInput
                  style={[styles.input, {
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  }]}
                  placeholder="Success Redirect Pattern (required, e.g., /success)"
                  placeholderTextColor={colors.textSecondary}
                  value={newForm.successRedirectPattern}
                  onChangeText={(text) => setNewForm({ ...newForm, successRedirectPattern: text })}
                  autoCapitalize="none"
                />

                <TextInput
                  style={[styles.input, {
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  }]}
                  placeholder="Description (optional)"
                  placeholderTextColor={colors.textSecondary}
                  value={newForm.description}
                  onChangeText={(text) => setNewForm({ ...newForm, description: text })}
                  multiline
                />

                <ThemedText style={[styles.colorLabel, { color: colors.text }]}>Button Color:</ThemedText>
                <View style={styles.colorOptions}>
                  {colorOptions.map((colorOption) => (
                    <Pressable
                      key={colorOption}
                      style={[
                        styles.colorButton,
                        { backgroundColor: ButtonColors[effectiveColorScheme][colorOption] },
                        newForm.color === colorOption && styles.colorButtonSelected,
                      ]}
                      onPress={() => setNewForm({ ...newForm, color: colorOption })}
                    >
                      {newForm.color === colorOption && (
                        <ThemedText style={styles.colorButtonCheck}>✓</ThemedText>
                      )}
                    </Pressable>
                  ))}
                </View>

                <View style={styles.buttonRow}>
                  <Pressable
                    style={[styles.button, { backgroundColor: colors.textSecondary }]}
                    onPress={handleCancelEdit}
                  >
                    <ThemedText style={[styles.buttonText, { color: colors.primaryText }]}>Cancel</ThemedText>
                  </Pressable>

                  <Pressable
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleSaveEdit}
                  >
                    <ThemedText style={[styles.buttonText, { color: colors.primaryText }]}>Save</ThemedText>
                  </Pressable>
                </View>
              </ThemedView>
            );
          }

          return (
            <ThemedView key={form.id} style={[styles.formItem, {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            }]}>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: ButtonColors[effectiveColorScheme][form.color || 'blue'] }
                ]}
              />

              {/* Title Row */}
              <View style={styles.formTitleRow}>
                <ThemedText type="subtitle" style={[styles.formTitle, { color: colors.text }]}>
                  {form.name}
                </ThemedText>
              </View>

              {/* URL Row */}
              <View style={styles.formUrlRow}>
                <ThemedText style={[styles.formUrl, { color: colors.textSecondary }]} numberOfLines={1}>
                  {form.url}
                </ThemedText>
              </View>

              {/* Pattern Row (if there's a description, show it instead or also show pattern) */}
              {form.description ? (
                <View style={styles.formDescriptionRow}>
                  <ThemedText style={[styles.formDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {form.description}
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.formPatternRow}>
                  <ThemedText style={[styles.formPattern, { color: colors.textSecondary }]}>
                    Success: {form.successRedirectPattern}
                  </ThemedText>
                </View>
              )}

              {/* Action Buttons Row */}
              <View style={styles.actionButtonsRow}>
                <View style={styles.reorderButtons}>
                  <Pressable
                    style={[
                      styles.reorderButton,
                      { backgroundColor: colors.textSecondary },
                      index === 0 && styles.reorderButtonDisabled
                    ]}
                    onPress={() => handleMoveUp(form)}
                    disabled={index === 0}
                  >
                    <ThemedText style={styles.reorderButtonText}>↑</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.reorderButton,
                      { backgroundColor: colors.textSecondary },
                      index === sortedForms.length - 1 && styles.reorderButtonDisabled
                    ]}
                    onPress={() => handleMoveDown(form)}
                    disabled={index === sortedForms.length - 1}
                  >
                    <ThemedText style={styles.reorderButtonText}>↓</ThemedText>
                  </Pressable>
                </View>
                <Pressable
                  style={[styles.editButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleEditForm(form)}
                >
                  <ThemedText style={[styles.editButtonText, { color: colors.primaryText }]}>Edit</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.deleteButton, { backgroundColor: colors.danger }]}
                  onPress={() => handleDeleteForm(form.id)}
                >
                  <ThemedText style={[styles.deleteButtonText, { color: colors.primaryText }]}>Delete</ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          );
        })}

        {!isAdding && !editingId && (
          <Pressable
            style={[styles.addButton, { borderColor: colors.primary }]}
            onPress={() => setIsAdding(true)}
          >
            <ThemedText style={[styles.addButtonText, { color: colors.primary }]}>+ Add New Form</ThemedText>
          </Pressable>
        )}

        {isAdding && (
          <ThemedView style={[styles.addFormContainer, {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          }]}>
            <ThemedText type="subtitle" style={[styles.addFormTitle, { color: colors.text }]}>
              Add New Form
            </ThemedText>

            <TextInput
              style={[styles.input, {
                borderColor: colors.border,
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
              }]}
              placeholder="Form Name (required)"
              placeholderTextColor={colors.textSecondary}
              value={newForm.name}
              onChangeText={(text) => setNewForm({ ...newForm, name: text })}
            />

            <TextInput
              style={[styles.input, {
                borderColor: colors.border,
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
              }]}
              placeholder="Form URL (required)"
              placeholderTextColor={colors.textSecondary}
              value={newForm.url}
              onChangeText={(text) => setNewForm({ ...newForm, url: text })}
              autoCapitalize="none"
              keyboardType="url"
            />

            <TextInput
              style={[styles.input, {
                borderColor: colors.border,
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
              }]}
              placeholder="Success Redirect Pattern (required, e.g., /success)"
              placeholderTextColor={colors.textSecondary}
              value={newForm.successRedirectPattern}
              onChangeText={(text) => setNewForm({ ...newForm, successRedirectPattern: text })}
              autoCapitalize="none"
            />

            <TextInput
              style={[styles.input, {
                borderColor: colors.border,
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
              }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textSecondary}
              value={newForm.description}
              onChangeText={(text) => setNewForm({ ...newForm, description: text })}
              multiline
            />

            <ThemedText style={[styles.colorLabel, { color: colors.text }]}>Button Color:</ThemedText>
            <View style={styles.colorOptions}>
              {colorOptions.map((colorOption) => (
                <Pressable
                  key={colorOption}
                  style={[
                    styles.colorButton,
                    { backgroundColor: ButtonColors[effectiveColorScheme][colorOption] },
                    newForm.color === colorOption && styles.colorButtonSelected,
                  ]}
                  onPress={() => setNewForm({ ...newForm, color: colorOption })}
                >
                  {newForm.color === colorOption && (
                    <ThemedText style={styles.colorButtonCheck}>✓</ThemedText>
                  )}
                </Pressable>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, { backgroundColor: colors.textSecondary }]}
                onPress={handleCancelEdit}
              >
                <ThemedText style={[styles.buttonText, { color: colors.primaryText }]}>Cancel</ThemedText>
              </Pressable>

              <Pressable
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleAddForm}
              >
                <ThemedText style={[styles.buttonText, { color: colors.primaryText }]}>Save</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        )}
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
  formItem: {
    padding: 16,
    paddingLeft: 20,
    paddingTop: 18,
    paddingBottom: 18,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    position: 'relative',
  },
  colorIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  formTitleRow: {
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  formUrlRow: {
    marginBottom: 6,
  },
  formUrl: {
    fontSize: 13,
    opacity: 0.65,
    lineHeight: 18,
  },
  formDescriptionRow: {
    marginBottom: 12,
  },
  formDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  formPatternRow: {
    marginBottom: 12,
  },
  formPattern: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  reorderButtons: {
    flexDirection: 'column',
    gap: 6,
    marginRight: 4,
  },
  reorderButton: {
    width: 36,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  reorderButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
  editFormContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  editFormTitle: {
    marginBottom: 16,
  },
  addButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontWeight: '600',
  },
  addFormContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  addFormTitle: {
    marginBottom: 16,
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
  colorLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 4,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorButtonCheck: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
