import { apiClient } from '../apiClient.js';
import { apiUrl } from '../apiUrl.js';

export const attendanceRepository = {
    /**
     * Fetch all attendance records from the server.
     * @returns {Promise<Object>} Axios Response containing the attendance list data.
     */
    getAll: async () =>{
        return apiClient.get(apiUrl.attendance.getAll);
    }
}