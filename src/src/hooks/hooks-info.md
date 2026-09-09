# Hooks Folder

The `hooks` folder contains all the **custom hooks** used in the application. Custom hooks are functions that allow you to **reuse stateful logic** and side effects across different components in a clean and modular way.

## 📁 Folder Structure

Each file inside the `hooks` folder generally contains a **custom hook** that handles a specific functionality. For example:

- `useAuth.js`: A custom hook for handling user authentication.
- `useFetch.js`: A custom hook for fetching data from APIs.
- `useLocalStorage.js`: A custom hook for interacting with `localStorage`.

### Example Structure:

hooks/
├── useAuth.js
├── useFetch.js
├── useLocalStorage.js
└── useTheme.js


## 🎯 Purpose

The `hooks` folder is used to:
- **Encapsulate reusable logic** related to state, effects, or context.
- Simplify **component code** by abstracting complex logic into separate, reusable functions.
- Promote the use of **functional components** by leveraging React's built-in hooks, such as `useState`, `useEffect`, `useContext`, etc.

## ⚙️ Responsibilities

Each hook:
- Manages **state** or **side effects** and provides **values** or **functions** to components that need them.
- Can be **reused** across different components, reducing duplicate code.
- Should follow **React conventions** and be easy to understand and maintain.