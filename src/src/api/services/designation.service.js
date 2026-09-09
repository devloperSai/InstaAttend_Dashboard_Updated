import {designationRepository} from "../repositories/designation.repository.js";
import {toast} from "sonner";

export const designationService = {
    /**
     * Fetch all designations from database.
     * @returns {Promise<Array>} List of designation objects.
     * @throws {Error} If retrieval fails.
     */
    getDesignations: async () => {
        try{
            const designations = await designationRepository.getDesignations();
            return designations.data.data;
        }catch (err){
            toast.error('Error, Failed to fetch designations.');
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
            const response = await designationRepository.createDesignation(designation);
            toast.success('Designation Created Successfully.');
            return response.data.data;
        }catch (err) {
            toast.error('Error, Failed to create designation.');
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
            const response = await designationRepository.updateDesignation(designation_id, designation);
            toast.success('Designation Updated Successfully.');
            return response.data.data;
        }catch (err) {
            toast.error('Error, Failed to update designation.');
            console.log(err);
            throw err;
        }
    },

    /**
     * Delete a designation record.
     * @param {string|number} designation_id - Designation ID.
     * @returns {Promise<Object>} Deleted status details.
     * @throws {Error} If deletion fails.
     */
    deleteDesignation: async (designation_id) => {
        try {
            const response = await designationRepository.deleteDesignation(designation_id);
            toast.success('Designation Deleted Successfully.');
            return response.data.data;
        }catch (err) {
            toast.error('Error, Failed to delete designation.');
            console.log(err);
            throw err;
        }
    },
}