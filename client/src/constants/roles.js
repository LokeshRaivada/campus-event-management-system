/**
 * Role constants and route mappings for the Event Management System.
 */

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    STUDENT: 'student',
};

/** Default dashboard route for each role after login */
export const ROLE_ROUTES = {
    [ROLES.SUPER_ADMIN]: '/superadmin',
    [ROLES.ADMIN]: '/admin',
    [ROLES.STUDENT]: '/student/dashboard',
};

/** Human-readable labels */
export const ROLE_LABELS = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.ADMIN]: 'Admin',
    [ROLES.STUDENT]: 'Student',
};
