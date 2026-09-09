# Repositories Folder

The `repositories` folder contains all the **API communication logic** of the project. It is where we define functions to interact with the backend services, like sending data (POST), requesting data (GET), and handling other API calls.

## 📁 Folder Structure

Each file inside this folder corresponds to a **specific feature** of the application and holds functions that make API requests for that feature. For example:

- `auth.repository.js`: Deals with login, registration, and password reset.
- `user.repository.js`: Handles actions like fetching user profiles or updating user data.
- `attendance.repository.js`: Manages attendance-related operations like check-in and check-out.

## 🎯 Purpose

The `repositories` folder is used to:
- **Separate API logic** from the user interface (UI), making the codebase **cleaner** and more **maintainable**.
- Provide a **single place** to update API calls so that changes are easy to implement across the entire project.
- Enable **reusability** of API functions across different components or services in the app.

## ⚙️ Responsibilities

Each repository file:
- Defines the structure of the data we send or receive from the backend.
- Uses tools like `apiClient` (which is typically an Axios instance) to **make API requests**.
- References backend **endpoints** from a central `apiUrl` file to ensure consistency.
- Returns the response so that the frontend can handle and display the data.

## ✅ Example Use Cases

- **Authentication** (`auth.repository.js`): Login, sign-up, and password reset functions.
- **User Management** (`user.repository.js`): Fetch and update user data.
- **Attendance Tracking** (`attendance.repository.js`): Handle check-in/check-out operations.

## 📝 Notes

- If the API endpoint or data format changes, you only need to update the code in one place.
- This folder ensures that your API logic is **organized** and easy to find, maintain, and update.
