# eForm Launcher

A React Native mobile application for managing and launching multiple electronic forms with session persistence and submission tracking.

## Features

- **Form Management**: Add, edit, delete, and reorder electronic forms
- **Form Categories**: Organize forms by category (HR, Finance, etc.) with filtering on the home screen
- **Custom Colors**: Assign different colors to form buttons for easy identification
- **WebView Integration**: Fill out forms within the app with session persistence
- **Submission Detection**: Automatically detect successful form submissions via URL patterns
- **Submission History**: Track all form submissions with timestamps and audit log
- **Offline Detection**: Get notified when attempting to load forms without internet connection
- **Backup & Restore**: Export/import all settings, forms, and history via clipboard
- **Theme Support**: Light, dark, and system-based themes
- **Customizable Branding**: Configure the app title to match your organization
- **Remote Loading**: Import form definitions from a JSON endpoint

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eform-launcher
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
npm run ios       # Run on iOS simulator
npm run android   # Run on Android emulator
npm run web       # Run in web browser
```

## Usage

### Manual Form Management

1. Navigate to the **Manage** tab
2. Click **+ Add New Form** to create a new form
3. Fill in the required fields:
   - **Form Name**: Display name for the form
   - **Form URL**: The web address of the form
   - **Success Redirect Pattern**: URL pattern to detect successful submission (e.g., `/success`, `thank-you`)
   - **Description** (optional): Brief description of the form
   - **Category** (optional): Category name for grouping forms (e.g., "HR", "Finance", "IT")
   - **Button Color**: Choose a color for the form button

4. Use the up/down arrows to reorder forms
5. Forms appear on the Home tab in the order specified
6. If you assign categories, they will appear as filter buttons on the Home tab

### Loading Forms from URL

You can bulk-import form definitions from a remote JSON endpoint:

1. Navigate to the **Settings** tab
2. Find the **Load eForm Definitions** section
3. Enter the URL of your JSON endpoint
4. Click **Load Forms**
5. If you have existing forms, choose to either:
   - **Replace All**: Remove existing forms and replace with new ones
   - **Merge**: Add new forms to existing ones

### JSON Format for Remote Loading

Your JSON endpoint should return data in the following format:

```json
{
  "forms": [
    {
      "name": "Customer Feedback Form",
      "url": "https://example.com/forms/feedback",
      "successRedirectPattern": "/thank-you",
      "description": "Gather customer feedback and suggestions",
      "category": "Customer Service",
      "color": "blue"
    },
    {
      "name": "Employee Time Entry",
      "url": "https://example.com/forms/timesheet",
      "successRedirectPattern": "/submitted",
      "description": "Daily time and attendance tracking",
      "category": "HR",
      "color": "green"
    },
    {
      "name": "Incident Report",
      "url": "https://example.com/forms/incident",
      "successRedirectPattern": "success",
      "category": "Safety",
      "color": "red"
    }
  ]
}
```

#### Field Descriptions

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | Yes | string | Display name for the form |
| `url` | Yes | string | Full URL to the web form |
| `successRedirectPattern` | Yes | string | URL pattern to detect successful submission (can be partial match) |
| `description` | No | string | Optional description shown under the form name |
| `category` | No | string | Optional category for grouping forms (e.g., "HR", "Finance", "IT") |
| `color` | No | string | Button color: `blue`, `green`, `purple`, `orange`, `red`, `pink`, or `teal` (defaults to `blue`) |

#### Notes

- The `successRedirectPattern` is matched against the URL after form submission
- It can be a partial match (e.g., "success" will match "https://example.com/success" or "https://example.com/form/success")
- Forms imported via URL will be assigned IDs and order numbers automatically
- When merging, new forms are added after existing forms

### Filling Out Forms

1. From the **Home** tab, optionally filter by category using the buttons at the top
2. Tap any form button to open it
3. The app checks your internet connection before loading
4. The form opens in an integrated WebView
5. Fill out the form as you normally would
6. Submit the form
7. When the success pattern is detected:
   - The submission is logged to the history
   - You'll see a confirmation
   - You'll be returned to the home screen
8. Session cookies persist between uses, so you won't need to log in repeatedly

### Viewing Submission History

1. Navigate to the **Settings** tab
2. Click **View History** in the Submission History section
3. View all past form submissions with timestamps
4. Optionally clear the history using the **Clear History** button

### Backup & Restore

Export your configuration (forms, settings, and history):
1. Navigate to the **Settings** tab
2. Find the **Backup & Restore** section
3. Click **Export Configuration** to copy all data to clipboard
4. Save the JSON text to a file or share it

Import a previously exported configuration:
1. Copy the JSON configuration text to your clipboard
2. Navigate to the **Settings** tab
3. Click **Import Configuration**
4. Choose to **Replace All** (overwrite existing data) or **Merge** (add to existing data)

## Configuration

### App Settings

Access settings from the **Settings** tab:

- **Theme**: Choose Light, Dark, or System theme
- **Backup & Restore**: Export/import configuration via clipboard
- **Submission History**: View and manage form submission audit log
- **Load eForm Definitions**: Import forms from a JSON URL
- **App Title**: Customize the title shown on the home screen

## Project Structure

```
eform-launcher/
├── app/                      # Application screens
│   ├── (tabs)/              # Tab-based screens
│   │   ├── index.tsx        # Home screen (form launcher with category filtering)
│   │   ├── manage-forms.tsx # Form management screen
│   │   └── explore.tsx      # Settings screen
│   ├── history.tsx          # Submission history screen
│   ├── webview.tsx          # WebView screen for forms (with offline detection)
│   └── _layout.tsx          # Root layout with theme provider
├── components/              # Reusable components
│   ├── themed-text.tsx     # Themed text component
│   ├── themed-view.tsx     # Themed view component
│   └── ui/                 # UI components
├── contexts/               # React contexts
│   └── ThemeContext.tsx   # Theme management context
├── hooks/                  # Custom React hooks
│   └── use-theme-colors.ts # Theme colors hook
├── types/                  # TypeScript type definitions
│   └── eform.ts           # EForm, FormSubmission, and configuration types
├── utils/                  # Utility functions
│   └── storage.ts         # AsyncStorage utilities (forms, history, export/import)
└── constants/             # App constants
    └── theme.ts           # Theme color definitions
```

## Technologies

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools (SDK 54)
- **TypeScript**: Type-safe JavaScript
- **AsyncStorage**: Local data persistence
- **react-native-webview**: Embedded web browser with session support
- **@react-native-community/netinfo**: Network connectivity detection
- **expo-clipboard**: Clipboard access for export/import functionality

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on the GitHub repository.
