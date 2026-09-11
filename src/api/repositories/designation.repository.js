import { apiClient } from '../apiClient.js';
import { apiUrl } from '../apiUrl.js';


export const designationRepository = {
    /**
     * Fetch all designation records.
     * @returns {Promise<Object>} Axios Response containing the designations list.
     */
    getDesignations: () => {
        return apiClient.get(apiUrl.designation.getDesignations);
    },

    /**
     * Create a new designation.
     * @param {Object} designation - Designation payload data.
     * @returns {Promise<Object>} Axios Response containing the created designation.
     */
    createDesignation: (designation) => {
        return apiClient.post(apiUrl.designation.createDesignation, designation);
    },

    /**
     * Update an existing designation by ID.
     * @param {string|number} id - Designation ID.
     * @param {Object} designation - Updated designation fields.
     * @returns {Promise<Object>} Axios Response containing the updated designation.
     */
    updateDesignation: (id, designation) => {
        return apiClient.put(apiUrl.designation.updateDesignation(id), designation);
    },

    /**
     * Delete a designation by ID.
     * @param {string|number} id - Designation ID.
     * @returns {Promise<Object>} Axios Response containing the deleted status.
     */
    deleteDesignation: (id) => {
        return apiClient.delete(apiUrl.designation.deleteDesignation(id));
    },
}
