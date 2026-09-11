import { apiClient } from '../apiClient.js';
import { apiUrl } from '../apiUrl.js';

export const settingRepository = {
    /**
     * Fetch all configuration settings.
     * @returns {Promise<Object>} Axios Response containing configuration settings list.
     */
    getAll: async () =>{
        return apiClient.get(apiUrl.settings.get);
    },

    /**
     * Create a new setting configuration.
     * @param {Object} data - Configuration values and setting type.
     * @returns {Promise<Object>} Axios Response containing the created setting.
     */
    addSetting: async (data) =>{
        return apiClient.post(apiUrl.settings.create, data);
    },

    /**
     * Update an existing configuration setting.
     * @param {string|number} id - Configuration setting ID.
     * @param {Object} data - Updated setting values and parameters.
     * @returns {Promise<Object>} Axios Response containing the updated setting.
     */
    updateSetting: async (id, data) =>{
        return apiClient.put(apiUrl.settings.update(id), data);
    }
}