import { expenseRepository } from "../repositories/expense.repository.js";
import { toast } from "../../components/ui/sonner.jsx";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || fallback;

// Handles both shapes safely:
//   1) response.data.data is already an array
//   2) response.data.data is a paginated wrapper: { totalItems, totalPages, currentPage, data: [...] }
const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

export const expenseService = {
  /**
   * Retrieve all expense records, optionally filtered by status.
   * @param {string} [status] - 'Pending' | 'Approved' | 'Rejected'.
   * @returns {Promise<Array>} List of expense objects.
   * @throws {Error} If retrieval fails.
   */
  getAll: async (status) => {
    try {
      const response = await expenseRepository.getAll(status);
      return extractList(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Error, Failed to fetch expenses."));
      throw error;
    }
  },

  /**
   * Retrieve expenses submitted by the authenticated employee.
   * @returns {Promise<Array>} List of the employee's expense objects.
   * @throws {Error} If retrieval fails.
   */
  getMine: async () => {
    try {
      const response = await expenseRepository.getMine();
      return extractList(response.data.data);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Error, Failed to fetch your expenses."),
      );
      throw error;
    }
  },

  /**
   * Retrieve expense totals for the authenticated employee.
   * @returns {Promise<Object>} { total, approved, pending, rejected }.
   * @throws {Error} If retrieval fails.
   */
  getStats: async () => {
    try {
      const response = await expenseRepository.getStats();
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Error, Failed to fetch expense stats."),
      );
      throw error;
    }
  },

  /**
   * Submit a new expense claim.
   * @param {FormData} formData - Multipart expense payload.
   * @returns {Promise<Object>} Created expense object.
   * @throws {Error} If submission fails.
   */
  createExpense: async (formData) => {
    try {
      const response = await expenseRepository.create(formData);
      toast.success("Expense submitted successfully.");
      return response.data.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Error, Failed to submit expense."));
      throw error;
    }
  },

  /**
   * Update expense fields, typically status (approve/reject) or amount.
   * @param {string} id - Expense record UUID.
   * @param {Object} data - Fields to update.
   * @returns {Promise<Object>} Update result.
   * @throws {Error} If update fails.
   */
  updateExpense: async (id, data) => {
    try {
      const response = await expenseRepository.update(id, data);
      return response.data.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Error, Failed to update expense."));
      throw error;
    }
  },

  /**
   * Delete an expense record.
   * @param {string} id - Expense record UUID.
   * @returns {Promise<void>}
   * @throws {Error} If deletion fails.
   */
  deleteExpense: async (id) => {
    try {
      await expenseRepository.delete(id);
      toast.success("Expense deleted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Error, Failed to delete expense."));
      throw error;
    }
  },
};
