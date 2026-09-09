# Services Folder

The `services` folder handles the **business logic** of the application. It interacts with the `repositories` (which manage the API calls) and provides functions that the frontend can use to perform specific tasks like logging in, registering, or resetting passwords.

## 📁 Folder Structure

Each file in this folder corresponds to a **specific feature** of the application and contains the **business logic** related to that feature. For example:

- `auth.service.js`: Handles user authentication, including login, registration, password reset, and logout.
- Other service files may exist for different features, such as user management or attendance tracking.

## 🎯 Purpose

The `services` folder is used to:
- **Manage business logic** related to user actions.
- Communicate with the `repositories` to handle API calls (like login, register, etc.).
- Provide reusable functions for the UI components to perform actions without dealing with the complexity of API calls directly.

## ⚙️ Responsibilities

Each service file:
- Calls functions from the `repositories` folder to make requests to the backend.
- Handles **business logic** such as user session management (e.g., storing tokens in `localStorage`).
- Displays **success or error messages** using external libraries like `toast`.

## ✅ Example Use Cases

- **Authentication** (`auth.service.js`): Handles user login, registration, password reset, and managing the user's session.
- **User Management**: Similar service files may exist for managing user data.
- **Attendance**: Service files to manage attendance-related functionality.

## 📝 Notes

- The `services` folder keeps the **business logic** separate from the UI components, ensuring better **maintainability** and **scalability**.
- The services are meant to **simplify interaction** with the backend and allow for **easy reuse** across the frontend.
