import { leaveRepository } from '../repositories/leave.repository.js';
import { toast } from '../../components/ui/sonner.jsx';


export const leaveService = {
    /**
     * Retrieve all leave applications.
     * @returns {Promise<Array>} List of leave request objects.
     * @throws {Error} If retrieval fails.
     */
    getAll: async () => {
        try {
            const response = await leaveRepository.getAll();
            return response.data.data;
        } catch (error) {
            toast.error('Error, Failed to fetch leaves.');
            throw error;
        }
    },

    /**
     * Approve a pending leave application.
     * @param {string|number} id - Leave application ID.
     * @returns {Promise<void>}
     * @throws {Error} If approval fails.
     */
    approveLeave: async (id) => {
        try {
            await leaveRepository.approveLeave(id);
            toast.success('Leave Approved Successfully.');
        } catch (error) {
            toast.error('Error, Failed to Approve Leave.');
            throw error;
        }
    },

    /**
     * Reject a pending leave application.
     * @param {string|number} id - Leave application ID.
     * @returns {Promise<void>}
     * @throws {Error} If rejection fails.
     */
    rejectLeave: async (id) => {
        try {
            await leaveRepository.rejectLeave(id);
            toast.success('Leave Rejected Successfully.');
        }catch (error) {
            toast.error('Error, Failed to Reject Leave.');
            throw error;
        }
    },

    /**
     * Submit a new leave request application.
     * @param {Object} leave - Leave request details.
     * @returns {Promise<Object>} Created leave data.
     * @throws {Error} If submission fails.
     */
    requestLeave: async (leave) => {
        try{
            const response = await leaveRepository.applyLeave(leave);
            toast.success('Leave Requested Successfully.');
            console.log("Response from service: ",response);
            const data = response.data.data;
            return data;
        } catch(err){
            toast.error('Error, Failed to Request Leave.');
            throw err;
        }
    },

    /**
     * Update an existing leave request application.
     * @param {string|number} id - Leave request ID.
     * @param {Object} data - Update payload containing status, from, to, and leave_type.
     * @returns {Promise<Object>} Updated leave data.
     * @throws {Error} If update fails.
     */
    updateLeave: async (id, data) => {
        try {
            const response = await leaveRepository.updateLeave(id, data);
            toast.success('Leave Updated Successfully.');
            return response.data.data;
        } catch (error) {
            toast.error('Error, Failed to Update Leave.');
            throw error;
        }
    },

    /**
     * Delete/Cancel an existing leave request.
     * @param {string|number} id - Leave request ID.
     * @returns {Promise<void>}
     * @throws {Error} If deletion fails.
     */
    deleteLeave: async (id) => {
        try {
            await leaveRepository.deleteLeave(id);
            toast.success('Leave Deleted Successfully.');
        } catch (error) {
            toast.error('Error, Failed to Delete Leave.');
            throw error;
        }
    }
}