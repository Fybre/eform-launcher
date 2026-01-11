import AsyncStorage from '@react-native-async-storage/async-storage';
import { EForm, EFormConfig, ThemeMode, AppSettings, FormSubmission } from '@/types/eform';

const STORAGE_KEY = '@eform_config';

export const storageUtils = {
  async getConfig(): Promise<EFormConfig> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue) {
        return JSON.parse(jsonValue);
      }
      return { forms: [], settings: { theme: 'system' } };
    } catch (error) {
      console.error('Error loading config:', error);
      return { forms: [], settings: { theme: 'system' } };
    }
  },

  async saveConfig(config: EFormConfig): Promise<void> {
    try {
      const jsonValue = JSON.stringify(config);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  },

  async getEForms(): Promise<EForm[]> {
    const config = await this.getConfig();
    return config.forms;
  },

  async saveEForms(forms: EForm[]): Promise<void> {
    const config = await this.getConfig();
    config.forms = forms;
    await this.saveConfig(config);
  },

  async getTheme(): Promise<ThemeMode> {
    const config = await this.getConfig();
    return config.settings?.theme || 'system';
  },

  async saveTheme(theme: ThemeMode): Promise<void> {
    const config = await this.getConfig();
    const currentSettings = config.settings || { theme: 'system' };
    config.settings = { ...currentSettings, theme };
    await this.saveConfig(config);
  },

  async getAppTitle(): Promise<string> {
    const config = await this.getConfig();
    return config.settings?.appTitle || 'eForm Launcher';
  },

  async saveAppTitle(appTitle: string): Promise<void> {
    const config = await this.getConfig();
    config.settings = { ...config.settings, theme: config.settings?.theme || 'system', appTitle };
    await this.saveConfig(config);
  },

  async addEForm(form: EForm): Promise<void> {
    const forms = await this.getEForms();
    forms.push(form);
    await this.saveEForms(forms);
  },

  async updateEForm(id: string, updatedForm: Partial<EForm>): Promise<void> {
    const forms = await this.getEForms();
    const index = forms.findIndex(f => f.id === id);
    if (index !== -1) {
      forms[index] = { ...forms[index], ...updatedForm };
      await this.saveEForms(forms);
    }
  },

  async deleteEForm(id: string): Promise<void> {
    const forms = await this.getEForms();
    const filtered = forms.filter(f => f.id !== id);
    await this.saveEForms(filtered);
  },

  // History management
  async getHistory(): Promise<FormSubmission[]> {
    const config = await this.getConfig();
    return config.history || [];
  },

  async addSubmission(formId: string, formName: string, url: string): Promise<void> {
    const config = await this.getConfig();
    const submission: FormSubmission = {
      id: Date.now().toString(),
      formId,
      formName,
      timestamp: Date.now(),
      url,
    };

    const history = config.history || [];
    // Keep only last 100 submissions to prevent storage bloat
    const updatedHistory = [submission, ...history].slice(0, 100);

    config.history = updatedHistory;
    await this.saveConfig(config);
  },

  async clearHistory(): Promise<void> {
    const config = await this.getConfig();
    config.history = [];
    await this.saveConfig(config);
  },

  // Export/Import
  async exportConfig(): Promise<string> {
    const config = await this.getConfig();
    return JSON.stringify(config, null, 2);
  },

  async importConfig(jsonString: string, mergeMode: 'replace' | 'merge'): Promise<void> {
    const importedConfig: EFormConfig = JSON.parse(jsonString);

    if (mergeMode === 'replace') {
      await this.saveConfig(importedConfig);
    } else {
      // Merge mode
      const currentConfig = await this.getConfig();

      // Merge forms
      const existingFormIds = new Set(currentConfig.forms.map(f => f.id));
      const newForms = importedConfig.forms.filter(f => !existingFormIds.has(f.id));
      const maxOrder = Math.max(...currentConfig.forms.map(f => f.order ?? 0), -1);

      const mergedForms = [
        ...currentConfig.forms,
        ...newForms.map((form, index) => ({
          ...form,
          order: (form.order ?? 0) + maxOrder + 1,
        })),
      ];

      // Merge history
      const mergedHistory = [
        ...(currentConfig.history || []),
        ...(importedConfig.history || []),
      ].slice(0, 100); // Keep only last 100

      // Keep current settings unless importing has different settings
      const mergedConfig: EFormConfig = {
        forms: mergedForms,
        settings: importedConfig.settings || currentConfig.settings,
        history: mergedHistory,
      };

      await this.saveConfig(mergedConfig);
    }
  },

  // Get unique categories
  async getCategories(): Promise<string[]> {
    const forms = await this.getEForms();
    const categories = new Set<string>();
    forms.forEach(form => {
      if (form.category) {
        categories.add(form.category);
      }
    });
    return Array.from(categories).sort();
  },
};
