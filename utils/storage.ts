import AsyncStorage from '@react-native-async-storage/async-storage';
import { EForm, EFormConfig, ThemeMode, AppSettings } from '@/types/eform';

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
};
