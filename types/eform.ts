export type ButtonColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'teal';

export interface EForm {
  id: string;
  name: string;
  url: string;
  successRedirectPattern: string; // URL pattern to detect successful submission (e.g., "/success" or "thank-you")
  description?: string;
  color?: ButtonColor;
  order?: number;
  category?: string; // Optional category for grouping forms
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  appTitle?: string;
}

export interface EFormConfig {
  forms: EForm[];
  settings?: AppSettings;
  history?: FormSubmission[];
}

export interface FormSubmission {
  id: string;
  formId: string;
  formName: string;
  timestamp: number;
  url: string;
}
