import { apiClient } from "../apiClient.js";
import { apiUrl } from "../apiUrl.js";
import { authService } from "../services/auth.service.js";

/**
 * Every enrollment-request endpoint requires an `X-Organization-Id` header
 * per the API documentation. Neither /auth/login nor /auth/me currently
 * surface a dedicated `organization_id` field on the returned user object,
 * so this reads whichever plausible field the backend does expose. Once
 * the backend confirms/adds an explicit `organization_id` field, this is
 * the only place that needs updating.
 * @returns {string} Organization id to send, or "" if none is available.
 */
const getOrganizationId = () => {
  const user = authService.getCurrentUser();
  return (
    user?.organization_id ||
    user?.organization?.id ||
    user?.company_id ||
    user?.department?.organization_id ||
    ""
  );
};

const withOrgHeader = () => ({
  headers: { "X-Organization-Id": getOrganizationId() },
});

export const enrollmentRepository = {
  /**
   * Fetch all pending enrollment requests.
   * @returns {Promise<Object>} Axios Response containing the pending requests list.
   */
  getAll: () => {
    return apiClient.get(apiUrl.enrollment.getAll, withOrgHeader());
  },

  /**
   * Fetch one enrollment request's details, including the full list of
   * departments and designations available in the organization (used to
   * populate the approval form's dropdowns).
   * @param {string} id - Enrollment request id.
   * @returns {Promise<Object>} Axios Response containing the request details.
   */
  getOne: (id) => {
    return apiClient.get(apiUrl.enrollment.getOne(id), withOrgHeader());
  },

  /**
   * Approve an enrollment request, optionally updating the employee's
   * profile fields and assigning department/designation.
   * @param {string} id - Enrollment request id.
   * @param {Object} data - { username, email, phone_number, department_id, designation_id }
   * @returns {Promise<Object>} Axios Response containing the approved request.
   */
  approve: (id, data) => {
    return apiClient.patch(
      apiUrl.enrollment.approve(id),
      data,
      withOrgHeader(),
    );
  },

  /**
   * Reject an enrollment request.
   * NOTE: not present in the documented API — see apiUrl.js for details.
   * @param {string} id - Enrollment request id.
   * @returns {Promise<Object>} Axios Response confirming rejection.
   */
  reject: (id) => {
    return apiClient.patch(
      apiUrl.enrollment.reject(id),
      undefined,
      withOrgHeader(),
    );
  },
};
