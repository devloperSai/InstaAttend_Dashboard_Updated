import { apiClient } from "../apiClient.js";
import { apiUrl } from "../apiUrl.js";

export const expenseRepository = {
  /**
   * Fetch all expense records, optionally filtered by status.
   * @param {string} [status] - Optional status filter e.g. 'Pending', 'Approved', 'Rejected'.
   * @returns {Promise<Object>} Axios Response containing the expense list.
   */
  getAll: (status) => {
    const config = status ? { params: { expense_status: status } } : undefined;
    return apiClient.get(apiUrl.expense.getAll, config);
  },

  /**
   * Fetch expenses submitted by the authenticated employee.
   * @returns {Promise<Object>} Axios Response containing the employee's expense list.
   */
  getMine: () => {
    return apiClient.get(apiUrl.expense.getMine);
  },

  /**
   * Fetch expense statistics for the authenticated employee.
   * @returns {Promise<Object>} Axios Response containing total/approved/pending/rejected totals.
   */
  getStats: () => {
    return apiClient.get(apiUrl.expense.getStats);
  },

  /**
   * Fetch one expense record by ID.
   * @param {string} id - Expense record UUID.
   * @returns {Promise<Object>} Axios Response containing the expense.
   */
  getOne: (id) => {
    return apiClient.get(apiUrl.expense.getOne(id));
  },

  /**
   * Submit a new expense. Sent as multipart/form-data (FormData) to support
   * an optional receipt file. Do NOT set a manual Content-Type header here —
   * the apiClient interceptor lets the browser generate the correct
   * multipart boundary automatically. Setting it manually breaks uploads.
   * @param {FormData} formData - expense_date, expense_type, expense_amount, expense_status, image (optional).
   * @returns {Promise<Object>} Axios Response containing the created expense.
   */
  create: (formData) => {
    return apiClient.post(apiUrl.expense.create, formData);
  },

  /**
   * Update one or more fields of an expense (e.g. approve/reject).
   * @param {string} id - Expense record UUID.
   * @param {Object} data - Fields to update, e.g. { expense_status: 'Approved' }.
   * @returns {Promise<Object>} Axios Response containing update status.
   */
  update: (id, data) => {
    return apiClient.put(apiUrl.expense.update(id), data);
  },

  /**
   * Delete an expense record.
   * @param {string} id - Expense record UUID.
   * @returns {Promise<Object>} Axios Response containing delete status.
   */
  delete: (id) => {
    return apiClient.delete(apiUrl.expense.delete(id));
  },
};
