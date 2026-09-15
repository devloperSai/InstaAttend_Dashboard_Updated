import {apiClient} from '../apiClient.js';
import {apiUrl} from '../apiUrl.js';

export const departmentRepository = {
    /**
     * Fetch all department records.
     * @returns {Promise<Object>} Axios Response containing the departments list.
     */
    getDepartments: () => {
        return apiClient.get(apiUrl.department.getDepartments);
    },

    /**
     * Create a new department.
     * @param {Object} department - Department payload data.
     * @returns {Promise<Object>} Axios Response containing the created department.
     */
    createDepartment: (department) => {
        return apiClient.post(apiUrl.department.createDepartment, department);
    },

    /**
     * Update an existing department by ID.
     * @param {string|number} id - Department ID.
     * @param {Object} department - Updated department fields.
     * @returns {Promise<Object>} Axios Response containing the updated department.
     */
    updateDepartment: (id, department) => {
        return apiClient.put(apiUrl.department.updateDepartment(id), department);
    },

    /**
     * Delete a department by ID.
     * @param {string|number} id - Department ID.
     * @returns {Promise<Object>} Axios Response containing the deleted status.
     */
    deleteDepartment: (id) => {
        return apiClient.delete(apiUrl.department.deleteDepartment(id));
    },
};

