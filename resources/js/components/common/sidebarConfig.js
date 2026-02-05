export const SIDEBAR_MENU = {
    // 1: ADMIN DEVELOPER
    1: [
        { type: 'link', title: 'Dashboard', path: '/dashboard' },
        { type: 'link', title: 'School', path: '/school', permission: 'School' },
        { type: 'link', title: 'Academic Year', path: '/academic-year', permission: 'Academic Year' },
        { type: 'link', title: 'Teachers', path: '/teachers', permission: 'Teachers' },
        { type: 'link', title: 'Staff', path: '/staff', permission: 'Staff' },
        { type: 'link', title: 'Parents', path: '/parents', permission: 'Parents' },
        { type: 'link', title: 'Students', path: '/students', permission: 'Students' },
        { type: 'link', title: 'Fee Structure', path: '/fee-structure', permission: 'Fee Structure' },
        {
            type: 'dropdown',
            title: 'Academics',
            key: 'academics_dev',
            items: [
                { title: 'Classes', path: '/classes', permission: 'Classes' },
                { title: 'Sections', path: '/sections', permission: 'Sections' },
            ]
        },
        { type: 'link', title: 'Attendance', path: '/attendance', permission: 'Attendance' },
        { type: 'link', title: 'Payment', path: '/payment', permission: 'Payment' },
        {
            type: 'dropdown',
            title: 'Access Control',
            key: 'acl',
            items: [
                { title: 'Users', path: '/admin/users', permission: 'Users' },
                { title: 'Roles', path: '/admin/roles', permission: 'Roles' },
                { title: 'Permissions', path: '/admin/permissions', permission: 'Permissions' },
            ]
        },
    ],


    // 2: SCHOOL ADMIN (Role 2 - Full Management Access)
    2: [

        /*
        { type: 'dropdown', title: 'CORE', key: 'core',
        items: [
            { title: 'Dashboard', path: '/dashboard' },
            { title: 'New Admission ', path: '/new-admission' },
        ] 
            },
        */

        { type: 'link', title: 'DASHBOARD', path: '/dashboard' },
        { type: 'link', title: 'NEW ADMISSION', path: '/new-admission' },

        {
            type: 'dropdown', title: 'MANAGEMENT', key: 'management',
            items: [
                { title: 'Families', path: '/families' },
                { title: 'Parents & Guardians', path: '/parents', permission: 'Parents' },
                { title: 'Students', path: '/students', permission: 'Students' },

            ]
        },
        {
            type: 'dropdown', title: 'ACADEMICS', key: 'academics',
            items: [
                { title: 'Teachers', path: '/teachers', permission: 'Teachers' },
                { title: 'Classes & Sections', path: '/classes' },
                { title: 'Attendance', path: '/attendance', permission: 'Attendance' },
                { title: 'Examinations', path: '/examinations' },
            ]
        },
        {
            type: 'dropdown', title: 'FEES & FINANCE', key: 'finance',
            items: [
                { title: 'Fee Structures', path: '/fee-structure', permission: 'Fee Structure' },
                { title: 'Student Fees', path: '/student-fees' },
                { title: 'Payments', path: '/payment', permission: 'Payment' },
                { title: 'Discounts & Penalties', path: '/discounts' },
                { title: 'Transport', path: '/transport' },
            ]
        },
        {
            type: 'dropdown', title: 'COMMUNICATION', key: 'communication',
            items: [
                { title: 'Notifications', path: '/notifications' },
                { title: 'Messages', path: '/messages' },
            ]
        },
        {
            type: 'dropdown', title: 'REPORTS', key: 'reports',
            items: [
                { title: 'Reports', path: '/reports' },
            ]
        },
        {
            type: 'dropdown', title: 'SETTINGS', key: 'settings',
            items: [
                { title: 'Academic Years', path: '/academic-year' },
                { title: 'Fee Policies', path: '/admin/fee-policies' },
                { title: 'Discount Rules', path: '/admin/discount-rules' },
                { title: 'Penalty Rules', path: '/admin/penalty-rules' },
                { title: 'Users & Roles', path: '/admin/users' },
                { title: 'Audit Logs', path: '/admin/audit-logs' },
            ]
        }
    ],


    // 3: TEACHER
    3: [
        {
            type: 'dropdown',
            title: 'CORE',
            key: 'core_teacher',
            items: [
                { title: 'Dashboard', path: '/dashboard' },
            ]
        },
        {
            type: 'dropdown',
            title: 'ACADEMICS',
            key: 'academics_teacher',
            items: [
                { title: 'My Classes', path: '/teacher/classes' },
                { title: 'Students', path: '/students' },
                { title: 'Attendance', path: '/attendance' },
                { title: 'Examinations / Marks', path: '/examinations' },
            ]
        },
        {
            type: 'dropdown',
            title: 'COMMUNICATION',
            key: 'comm_teacher',
            items: [
                { title: 'Messages', path: '/messages' },
                { title: 'Notifications', path: '/notifications' },
            ]
        },
        {
            type: 'dropdown',
            title: 'PROFILE',
            key: 'profile_teacher',
            items: [
                { title: 'My Profile', path: '/profile' },
            ]
        }
    ],


    // 4: PARENT ROLE
    4: [
        {
            type: 'dropdown',
            title: 'CORE',
            key: 'core_parent',
            items: [
                { title: 'Dashboard', path: '/dashboard' },
                { title: 'My Children', path: '/parent/children' },
            ]
        },
        {
            type: 'dropdown',
            title: 'FEES & FINANCE',
            key: 'finance_parent',
            items: [
                { title: 'Fees', path: '/parent/fees' },
                { title: 'Payments', path: '/parent/payments' },
                { title: 'Receipts', path: '/parent/receipts' },
            ]
        },
        {
            type: 'dropdown',
            title: 'ADMISSIONS',
            key: 'admissions_parent',
            items: [
                { title: 'Admission Requests', path: '/parent/admission-requests' },
            ]
        },
        {
            type: 'dropdown',
            title: 'COMMUNICATION',
            key: 'comm_parent',
            items: [
                { title: 'Notifications', path: '/notifications' },
                { title: 'Messages', path: '/messages' },
            ]
        },
        {
            type: 'dropdown',
            title: 'PROFILE',
            key: 'profile_parent',
            items: [
                { title: 'My Profile', path: '/profile' },
                { title: 'Family Details', path: '/parent/family-details' },
            ]
        }
    ]

};