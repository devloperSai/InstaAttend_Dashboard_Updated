# Libs Folder

The `libs` folder contains **utility functions**, **helper methods**, and **contexts** that are shared across the application. This folder is meant to store code that provides **common functionalities** which are not directly tied to specific components or pages.

## 📁 Folder Structure

Inside the `libs` folder, you might have various subfolders or files such as:

- `utils/`: A collection of helper functions that simplify common tasks.
- `contexts/`: Contains React context providers and hooks for global state management.
- `helpers/`: Additional helper functions or classes for specific business logic.
- `config/`: Configuration files for different environments, API URLs, or other settings.

### Example Structure:

libs/
├── utils/
│ ├── formatDate.js
│ └── validateEmail.js
├── contexts/
│ └── AuthContext.js
└─ helpers/
  └── authHelper.js


  
## 🎯 Purpose

The `libs` folder is used to:
- Store **shared logic** that can be used across various components and pages.
- Promote **reusability** of code by placing commonly used functions, constants, and contexts in one place.
- Ensure that the core logic of the app, such as authentication or API calls, is organized and easy to maintain.

## ⚙️ Responsibilities

### 1. **Utils**:
Utility functions are simple, reusable functions that perform common operations. These could include formatting dates, validating email addresses, generating unique IDs, etc.

### 2. **Helpers**:
Helper files contain functions or classes that implement more specific logic, typically related to business operations or complex calculations.

### 3. **Contexts**:
React contexts store global state and provide an easy way to share data across multiple components without having to pass props down manually. For example, the `AuthContext` might store whether a user is authenticated.

### Example of a Utility Function in `utils/formatDate.js`:

```javascript
// formatDate.js
export const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};
