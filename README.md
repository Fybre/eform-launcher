# eForm Launcher

A React Native mobile application for managing and launching multiple electronic forms with session persistence and submission tracking.

## Features

- **Form Management**: Add, edit, delete, and reorder electronic forms
- **Custom Colors**: Assign different colors to form buttons for easy identification
- **WebView Integration**: Fill out forms within the app with session persistence
- **Submission Detection**: Automatically detect successful form submissions via URL patterns
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
   - **Button Color**: Choose a color for the form button

4. Use the up/down arrows to reorder forms
5. Forms appear on the Home tab in the order specified

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
      "color": "blue"
    },
    {
      "name": "Employee Time Entry",
      "url": "https://example.com/forms/timesheet",
      "successRedirectPattern": "/submitted",
      "description": "Daily time and attendance tracking",
      "color": "green"
    },
    {
      "name": "Incident Report",
      "url": "https://example.com/forms/incident",
      "successRedirectPattern": "success",
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
| `color` | No | string | Button color: `blue`, `green`, `purple`, `orange`, `red`, `pink`, or `teal` (defaults to `blue`) |

#### Notes

- The `successRedirectPattern` is matched against the URL after form submission
- It can be a partial match (e.g., "success" will match "https://example.com/success" or "https://example.com/form/success")
- Forms imported via URL will be assigned IDs and order numbers automatically
- When merging, new forms are added after existing forms

### Filling Out Forms

1. From the **Home** tab, tap any form button
2. The form opens in an integrated WebView
3. Fill out the form as you normally would
4. Submit the form
5. When the success pattern is detected, you'll see a confirmation and be returned to the home screen
6. Session cookies persist between uses, so you won't need to log in repeatedly

## Configuration

### App Settings

Access settings from the **Settings** tab:

- **Theme**: Choose Light, Dark, or System theme
- **Load eForm Definitions**: Import forms from a JSON URL
- **App Title**: Customize the title shown on the home screen

## Project Structure

```
eform-launcher/
├── app/                      # Application screens
│   ├── (tabs)/              # Tab-based screens
│   │   ├── index.tsx        # Home screen (form launcher)
│   │   ├── manage-forms.tsx # Form management screen
│   │   └── explore.tsx      # Settings screen
│   ├── webview.tsx          # WebView screen for forms
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
│   └── eform.ts           # EForm and configuration types
├── utils/                  # Utility functions
│   └── storage.ts         # AsyncStorage utilities
└── constants/             # App constants
    └── theme.ts           # Theme color definitions
```

## Technologies

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **AsyncStorage**: Local data persistence
- **react-native-webview**: Embedded web browser with session support

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on the GitHub repository.
