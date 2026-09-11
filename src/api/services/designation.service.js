import { designationRepository } from "../repositories/designation.repository.js";
import { toast } from "sonner";

// Pulls the most useful message a backend error can give us. Different
// backends/frameworks shape error bodies differently (Express + Sequelize
// commonly send { message }, some send { error }, validation middlewares
// sometimes send { errors: [...] }) — this tries the common shapes in
// order so the UI can show *why* a request failed instead of a generic
// "something went wrong".
const extractApiErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (Array.isArray(data.errors) && data.errors.length) {
    return data.errors.map((e) => e.message || e).join(", ");
  }
  return fallback;
};

export const designationService = {
  /**
   * Fetch all designations from database.
   * @returns {Promise<Array>} List of designation objects.
   * @throws {Error} If retrieval fails.
   */
  getDesignations: async () => {
    try {
      const designations = await designationRepository.getDesignations();
      return designations.data.data;
    } catch (err) {
      toast.error("Error, Failed to fetch designations.");
      console.log(err);
      throw err;
    }
  },

  /**
   * Create a new designation record.
   * @param {Object} designation - Designation details.
   * @returns {Promise<Object>} Created designation object.
   * @throws {Error} If creation fails.
   */
  createDesignation: async (designation) => {
    try {
      const response =
        await designationRepository.createDesignation(designation);
      toast.success("Designation Created Successfully.");
      return response.data.data;
    } catch (err) {
      toast.error("Error, Failed to create designation.");
      console.log(err);
      throw err;
    }
  },

  /**
   * Update an existing designation record.
   * @param {string|number} designation_id - Designation ID.
   * @param {Object} designation - Updated designation fields.
   * @returns {Promise<Object>} Updated designation object.
   * @throws {Error} If update fails.
   */
  updateDesignation: async (designation_id, designation) => {
    try {
      const response = await designationRepository.updateDesignation(
        designation_id,
        designation,
      );
      toast.success("Designation Updated Successfully.");
      return response.data.data;
    } catch (err) {
      toast.error("Error, Failed to update designation.");
      console.log(err);
      throw err;
    }
  },

  /**
   * Delete a designation record.
   *
   * IMPORTANT: this now surfaces the *actual* backend error message
   * (via extractApiErrorMessage) instead of a generic string, and
   * attaches it to the thrown error as `err.friendlyMessage` so the
   * calling component (Settings.jsx) can show it directly in the
   * confirmation dialog. The two most common real-world causes for a
   * delete silently "not working" are:
   *   1) The backend has no DELETE handler wired up for this route
   *      (commonly shows as a 404 "Not Found" or 405 "Method Not
   *      Allowed" here).
   *   2) A foreign-key / reference constraint — an employee record
   *      still has this designation assigned, so the DB rejects the
   *      delete (commonly a 409 or 500 here, often with a message
   *      mentioning a constraint/foreign key).
   * Surfacing the real message makes it obvious which of these (or
   * something else) is actually happening.
   * @param {string|number} designation_id - Designation ID.
   * @returns {Promise<Object>} Deleted status details.
   * @throws {Error} If deletion fails — thrown error carries
   *   `friendlyMessage` and `status` for the caller to display.
   */
  deleteDesignation: async (designation_id) => {
    try {
      const response =
        await designationRepository.deleteDesignation(designation_id);
      toast.success("Designation Deleted Successfully.");
      return response.data?.data;
    } catch (err) {
      const status = err?.response?.status;
      const friendlyMessage = extractApiErrorMessage(
        err,
        status
          ? `Failed to delete designation (server responded ${status}).`
          : "Failed to delete designation. Please check your connection.",
      );
      toast.error(friendlyMessage);
      console.error("Delete designation failed:", {
        designation_id,
        status,
        responseData: err?.response?.data,
        error: err,
      });
      err.friendlyMessage = friendlyMessage;
      err.status = status;
      throw err;
    }
  },
};
