export const apiUrl = {
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8081/api",

  //Dashboard endpoints
  dashboard: {
    getStats: `/dashboard/stats`,
  },

  // Auth endpoints
  auth: {
    login: `/auth/login`,
    register: `/auth/register`,
    forgotPassword: `/auth/forgot-password`,
    resetPassword: `/auth/reset-password`,
  },

  // Employee endpoints
  employees: {
    getAll: `/users`,
    getById: (id) => `/users/${id}`,
    create: `/users`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    bulkCreate: `/users/bulk-upload`,
  },

  // Attendance endpoints
  attendance: {
    getAll: `/attendance`,
    getByEmployeeId: (id) => `/attendance/employee/${id}`,
    checkIn: `/attendance/check-in`,
    checkOut: `/attendance/check-out`,
    getReports: `/attendance/reports`,
    /**
     * Per-date attendance calendar.
     * `id` is REQUIRED — it's the requesting user's id. The backend checks
     * whether that id belongs to an admin: if so, it returns the
     * company-wide, per-date attendance overview for all employees;
     * otherwise it returns just that employee's own calendar.
     * filter: "this_month" (default) | "last_15_days" | "last_30_days" | "custom"
     * startDate/endDate (yyyy-MM-dd) are required when filter is "custom".
     *
     * `id` is always appended to the query string, even if empty/undefined
     * (e.g. `?filter=last_30_days&id=`), to match the confirmed API contract.
     */
    getCalendar: (filter, id, startDate, endDate) => {
      const params = new URLSearchParams();
      if (filter) params.append("filter", filter);
      params.append("id", id ?? "");
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const query = params.toString();
      return `/attendance/calendar${query ? `?${query}` : ""}`;
    },
  },

  // Leave management endpoints
  leave: {
    getAll: `/leave`,
    apply: `/leave`,
    getById: (id) => `/leave/${id}`,
    create: `/leave`,
    update: (id) => `/leave/${id}`,
    approve: (id) => `/leave/${id}/approve`,
    reject: (id) => `/leave/${id}/reject`,
    getByEmployeeId: (id) => `/leave/employee/${id}`,
    delete: (id) => `/leave/${id}`,
  },

  // Expense endpoints
  expense: {
    getAll: `/expense`,
    getMine: `/expense/my`,
    getStats: `/expense/stats`,
    getOne: (id) => `/expense/${id}`,
    create: `/expense`,
    update: (id) => `/expense/${id}`,
    delete: (id) => `/expense/${id}`,
  },

  //Settings endpoints
  settings: {
    get: `/setting`,
    create: `/setting`,
    update: (id) => `/setting/${id}`,
  },

  //Department endpoints
  department: {
    getDepartments: `/department`,
    createDepartment: `/department`,
    updateDepartment: (id) => `/department/${id}`,
    deleteDepartment: (id) => `/department/${id}`,
  },

  //Designation endpoints
  designation: {
    getDesignations: `/designation`,
    createDesignation: `/designation`,
    updateDesignation: (id) => `/designation/${id}`,
    deleteDesignation: (id) => `/designation/${id}`,
  },
};
