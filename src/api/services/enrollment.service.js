import { enrollmentRepository } from "../repositories/enrollment.repository.js";
import { toast } from "../../components/ui/sonner.jsx";

export const enrollmentService = {
  /**
   * Retrieve all pending employee enrollment requests.
   * @returns {Promise<Array>} List of enrollment request objects.
   * @throws {Error} If retrieval fails.
   */
  getAll: async () => {
    try {
      const response = await enrollmentRepository.getAll();
      const data = response.data.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      toast.error("Error, Failed to fetch enrollment requests.");
      throw error;
    }
  },

  /**
   * Retrieve full details of a single enrollment request, including the
   * organization's departments and designations for the approval form.
   * @param {string} id - Enrollment request id.
   * @returns {Promise<Object>} { id, status, createdAt, employee, departments, designations }
   * @throws {Error} If retrieval fails.
   */
  getOne: async (id) => {
    try {
      const response = await enrollmentRepository.getOne(id);
      return response.data.data;
    } catch (error) {
      toast.error("Error, Failed to fetch request details.");
      throw error;
    }
  },

  /**
   * Approve an enrollment request.
   * @param {string} id - Enrollment request id.
   * @param {Object} data - { username, email, phone_number, department_id, designation_id }
   * @returns {Promise<Object>} The approved request/employee data.
   * @throws {Error} If approval fails.
   */
  approve: async (id, data) => {
    try {
      const response = await enrollmentRepository.approve(id, data);
      toast.success("Enrollment request approved successfully.");
      return response.data.data;
    } catch (error) {
      toast.error("Error, Failed to approve enrollment request.");
      throw error;
    }
  },

  /**
   * Reject an enrollment request.
   * @param {string} id - Enrollment request id.
   * @returns {Promise<Object>} Response payload.
   * @throws {Error} If rejection fails.
   */
  reject: async (id) => {
    try {
      const response = await enrollmentRepository.reject(id);
      toast.success("Enrollment request rejected.");
      return response.data?.data;
    } catch (error) {
      toast.error("Error, Failed to reject enrollment request.");
      throw error;
    }
  },
};
