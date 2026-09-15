import { authRepository } from "../repositories/auth.repository.js";
import { toast } from "../../components/ui/sonner.jsx";

export const authService = {
  /**
   * Logs in a user with email and password.
   * Includes imei_number: "admin_login" to bypass the device-registration
   * checkup on the test API — without this the backend expects a real
   * device IMEI tied to the account and will reject the login.
   * @param {string} email - User email.
   * @param {string} password - User password.
   * @returns {Promise} - Resolves with user data and token.
   */
  login: async (email, password) => {
    try {
      const response = await authRepository.login({
        email,
        password,
        imei_number: "admin_login",
      });
      const data = response.data?.data ?? response.data;
      const token = data?.token ?? data?.accessToken ?? data?.access_token;
      const user = data?.user ?? data?.userData;

      if (!token || !user) {
        throw new Error("The login response did not include a token and user.");
      }

      if (user.designation && !user.designation.admin_access) {
        return { unauthorized: true };
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful!");
      return { success: true, data: response.data };
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      throw error;
    }
  },

  /**
   * Registers a new user.
   * @param {string} name - User's name.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @param {string} role - User's role.
   * @returns {Promise} - Resolves with user data.
   */
  register: async (name, email, password, role) => {
    try {
      const response = await authRepository.register({
        name,
        email,
        password,
        role,
      });
      toast.success("Registration successful!");
      return response.data;
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      throw error;
    }
  },

  /**
   * Sends a password reset link to the user's email.
   * @param {string} email - User's email.
   * @returns {Promise} - Resolves with a success message.
   */
  forgotPassword: async (email) => {
    try {
      const response = await authRepository.forgotPassword({ email });
      toast.success("Password reset email sent. Please check your inbox.");
      return response.data;
    } catch (error) {
      toast.error("Failed to send password reset email. Please try again.");
      throw error;
    }
  },

  /**
   * Resets the user's password using a token.
   * @param {string} token - Password reset token.
   * @param {string} password - New password.
   * @returns {Promise} - Resolves with a success message.
   */
  resetPassword: async (token, password) => {
    try {
      const response = await authRepository.resetPassword({ token, password });
      toast.success(
        "Password reset successful. Please login with your new password.",
      );
      return response.data;
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
      throw error;
    }
  },

  /**
   * Logs the user out by removing token and user data from localStorage.
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Returns the current logged-in user from localStorage.
   * @returns {Object|null} - The user object or null if no user is logged in.
   */
  getCurrentUser: () => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (e) {
        console.error("Error parsing user data:", e);
        return null;
      }
    }
    return null;
  },

  /**
   * Checks if the user is authenticated (has a token).
   * @returns {boolean} - Returns true if the user is authenticated, false otherwise.
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};
