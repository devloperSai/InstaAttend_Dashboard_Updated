import { toast }from "../../components/ui/sonner.jsx";
import { attendanceRepository } from "../repositories/attendance.repository.js";

export const attendanceService = {
    /**
     * Retrieve all employee attendance records.
     * @returns {Promise<Array>} List of attendance record objects.
     * @throws {Error} If retrieval fails.
     */
    getAll: async () => {
        try {
            const response = await attendanceRepository.getAll();
            return response.data.data;
        } catch (error) {
            toast.error('Error, Failed to fetch attendance.');
            throw error;
        }
      },
};