import { apiClient } from '../apiClient.js';
import { apiUrl } from '../apiUrl.js';

export const leaveRepository = {
    /**
     * Fetch all leave requests.
     * @returns {Promise<Object>} Axios Response containing all leave requests data.
     */
    getAll: async () =>{
        return apiClient.get(apiUrl.leave.getAll);
    },

    /**
     * Approve a pending leave request by ID.
     * @param {string|number} id - Leave request ID.
     * @returns {Promise<Object>} Axios Response containing approval status.
     */
    approveLeave: async (id) =>{
        return apiClient.patch(apiUrl.leave.approve(id));
    },

    /**
     * Reject a pending leave request by ID.
     * @param {string|number} id - Leave request ID.
     * @returns {Promise<Object>} Axios Response containing rejection status.
     */
    rejectLeave: async (id) =>{
        return apiClient.patch(apiUrl.leave.reject(id));
    },

    /**
     * Submit a new leave request application.
     * @param {Object} data - Leave details including type, from, to dates, user_id, etc.
     * @returns {Promise<Object>} Axios Response containing the created leave application.
     */
    applyLeave: async (data) =>{
        return apiClient.post(apiUrl.leave.apply, data);
    },

    /**
     * Update an existing leave request by ID.
     * @param {string|number} id - Leave request ID.
     * @param {Object} data - Leave updates containing status, from, to, and leave_type.
     * @returns {Promise<Object>} Axios Response containing update status.
     */
    updateLeave: async (id, data) => {
        return apiClient.put(apiUrl.leave.update(id), data);
    },

    /**
     * Delete an existing leave request by ID.
     * @param {string|number} id - Leave request ID.
     * @returns {Promise<Object>} Axios Response containing delete status.
     */
    deleteLeave: async (id) => {
        return apiClient.delete(apiUrl.leave.delete(id));
    }
}