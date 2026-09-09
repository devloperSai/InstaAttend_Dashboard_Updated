import { settingRepository } from '../repositories/setting.repository.js';
import { toast } from '../../components/ui/sonner.jsx';

export const settingService = {
    /**
     * Retrieve all settings configuration parameters.
     * @returns {Promise<Array>} List of setting configuration objects.
     * @throws {Error} If retrieval fails.
     */
    getAll: async () => {
        try {
            const response = await settingRepository.getAll();
            return response.data.data;
        } catch (error) {
            toast.error('Error, Failed to fetch settings.');
            throw error;
        }
    },

    /**
     * Create a new setting configuration profile.
     * @param {Object} data - Configuration setting data.
     * @returns {Promise<Object>} Created setting configuration object.
     * @throws {Error} If creation fails.
     */
    createSetting: async (data) => {
        try {
            const response = await settingRepository.addSetting(data);
            toast.success('Setting Added Successfully.');
            return response.data.data;
        } catch (error) {
            toast.error('Error, Failed to Add Setting.');
            console.error(error);
            throw error;
        }
    },

    /**
     * Update an existing settings profile by ID.
     * @param {string|number} id - Configuration settings ID.
     * @param {Object} data - Configuration values and attributes.
     * @returns {Promise<Object>} Updated setting configuration object.
     * @throws {Error} If update fails.
     */
    updateSettings: async (id, data) => {
        try{
            const response = await settingRepository.updateSetting(id, data);
            toast.success('Settings Updated Successfully.');
            return response.data.data;
        }catch (e) {
            console.error(e);
            toast.error('Error, Failed to Update Settings.');
            throw e;
        }
    }
}