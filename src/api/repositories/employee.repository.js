import { apiClient } from "../apiClient.js";
import { apiUrl } from "../apiUrl.js";

export const employeeRepository = {
  /**
   * Fetches list of all employees.
   * @returns {Promise}
   */
  getAll: () => {
    return apiClient.get(apiUrl.employees.getAll);
  },

  /**
   * Registers a new user with name, email, password, and role.
   * @param {Object} userData - { name: string, email: string, password: string, role: string }
   * @returns {Promise} - Resolves with { user }
   */
  addOne: (userData) => {
    return apiClient.post(apiUrl.auth.register, userData);
  },

  /**
   * Update an user with name, email, password, and role.
   * @param {Object} userData - { name: string, email: string, password: string, role: string }
   * @returns {Promise} - Resolves with { user }
   */
  updateOne: (userData) => {
    const { id, username, email, phone_number } = userData;

    return apiClient.put(apiUrl.employees.update(id), {
      username,
      email,
      phone_number,
    });
  },

  /**
   * Add bulk employees
   * @returns {Promise} - Resolves with { user }
   * @param employees
   */
  addBulk: (employees) => {
    return apiClient.post(apiUrl.employees.bulkCreate, employees);
  },

  deleteOne: (id) => {
    return apiClient.delete(apiUrl.employees.delete(id));
  },
};
