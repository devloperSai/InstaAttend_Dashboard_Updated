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
# Components Folder

The `components` folder contains all the **UI components** used in the application. These are the building blocks of the user interface and are reusable across different pages or sections of the app.

## 📁 Folder Structure

Each file or sub-folder inside `components` generally corresponds to a **UI feature** or element. For example:

- `Button.jsx`: A reusable button component.
- `Header.jsx`: A header component for the app layout.
- `Sidebar.jsx`: A sidebar component.
- `UserCard.jsx`: A component for displaying user information.

### Example Structure:
components/
├── Button.jsx
├── Header.jsx
├── Sidebar.jsx


## 🎯 Purpose

The `components` folder is used to:
- Organize all **UI-related code** in one place.
- Make **components reusable** across different parts of the app.
- Ensure **clean and maintainable code** by breaking the UI into small, manageable parts.

## ⚙️ Responsibilities

Each component file:
- Contains the **UI logic** for that specific feature (for example, how a button should look and behave).
- Can accept **props** to customize the component and make it flexible.
- Should be **self-contained**, meaning that all styling and logic specific to the component should be within the component itself (or in a dedicated file).
