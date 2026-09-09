import { apiClient } from '../apiClient.js';
import { apiUrl } from '../apiUrl.js';

export const authRepository = {
  /**
   * Logs in a user with email and password.
   * @param {Object} credentials - { email: string, password: string }
   * @returns {Promise} - Resolves with { token, user }
   */
  login: (credentials) => {
    return apiClient.post(apiUrl.auth.login, credentials);
  },

  /**
   * Registers a new user with name, email, password, and role.
   * @param {Object} userData - { name: string, email: string, password: string, role: string }
   * @returns {Promise} - Resolves with { token, user }
   */
  register: (userData) => {
    return apiClient.post(apiUrl.auth.register, userData);
  },

  /**
   * Sends a password reset link to the user's email.
   * @param {Object} data - { email: string }
   * @returns {Promise} - Resolves with { message }
   */
  forgotPassword: (data) => {
    return apiClient.post(apiUrl.auth.forgotPassword, data);
  },

  /**
   * Resets the user's password using a token.
   * @param {Object} data - { token: string, password: string }
   * @returns {Promise} - Resolves with { message }
   */
  resetPassword: (data) => {
    return apiClient.post(apiUrl.auth.resetPassword, data);
  }
};
