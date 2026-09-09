import {departmentRepository} from "../repositories/department.repository.js";
import {toast} from "sonner";

export const departmentService = {
    /**
     * Fetch all department records from database.
     * @returns {Promise<Array>} List of department objects.
     * @throws {Error} If fetch fails.
     */
    getDepartments: async () => {
        try{
            const departments = await departmentRepository.getDepartments();
            return departments.data.data;
        }catch (err){
            toast.error('Error, Failed to fetch departments.');
            console.log(err);
            throw err;
        }
    },

    /**
     * Create a new department record.
     * @param {Object} department - Department creation data.
     * @returns {Promise<Object>} Created department object.
     * @throws {Error} If creation fails.
     */
    createDepartment: async (department) => {
        try {
            const response = await departmentRepository.createDepartment(department);
            toast.success('Department Created Successfully.');
            return response.data.data;
        }catch (err) {
            toast.error('Error, Failed to create department.');
            console.log(err);
            throw err;
        }
    },

    /**
     * Update an existing department record.
     * @param {string|number} department_id - Department ID.
     * @param {Object} department - Updated department fields.
     * @returns {Promise<Object>} Updated department object.
     * @throws {Error} If update fails.
     */
    updateDepartment: async (department_id, department) => {
        try {
            const response = await departmentRepository.updateDepartment(department_id, department);
            toast.success('Department Updated Successfully.');
            return response.data.data;
        }catch (err) {
            toast.error('Error, Failed to update department.');
            console.log(err);
            throw err;
        }
    },

    /**
     * Delete an existing department record.
     * @param {string|number} department_id - Department ID.
     * @returns {Promise<Object>} Deleted status object.
     * @throws {Error} If deletion fails.
     */
    deleteDepartment: async (department_id) => {
        try {
            const response = await departmentRepository.deleteDepartment(department_id);
            toast.success('Department Deleted Successfully.');
            return response.data.data;
        }catch (err) {
            toast.error('Error, Failed to delete department.');
            console.log(err);
            throw err;
        }
    },
}