export const SIDEBAR_MENU = {
    // 1: ADMIN DEVELOPER
    1: [
        { type: 'link', title: 'Dashboard', path: '/dashboard' },
        { type: 'link', title: 'School', path: '/school', permission: 'School' },
        { type: 'link', title: 'Academic Year', path: '/academic-year', permission: 'Academic Year' },
        { type: 'link', title: 'New Admission', path: '/new-admission' },

        {
            type: 'dropdown', title: 'Management', key: 'management',
            items: [
                { title: 'Families', path: '/families' },
                { title: 'Parents / Guardians', path: '/parents', permission: 'Parents' },
                { title: 'Students', path: '/students', permission: 'Students' },

            ]
        },
        {
            type: 'dropdown', title: 'Academics', key: 'academics',
            items: [
                { title: 'Teachers', path: '/teachers', permission: 'Teachers' },
                { title: 'Classes & Sections', path: '/classes' },
                //{ title: 'Attendance', path: '/attendance', permission: 'Attendance' },
                { title: 'Examinations', path: '/examinations' },
            ]
        },
        {
            type: 'dropdown', title: 'Fees & Finance', key: 'finance',
            items: [
                { title: 'Fee Structures', path: '/fee-structure', permission: 'Fee Structure' },
                { title: 'Student Fees', path: '/student-fees' },
                { title: 'Payments', path: '/receipts', permission: 'Payment' },
                { title: 'Discounts & Penalties', path: '/student-discount' },
                { title: 'Transport', path: '/transport' },
            ]
        },
        {
            type: 'dropdown', title: 'Communication', key: 'communication',
            items: [
                { title: 'Notifications', path: '/notifications' },
                { title: 'Messages', path: '/messages' },
            ]
        },
        {
            type: 'dropdown', title: 'Reports', key: 'reports',
            items: [
                { title: 'Reports', path: '/reports' },
            ]
        },
        {
            type: 'dropdown', title: 'Settings', key: 'settings',
            items: [

                { title: 'Fee Policies', path: '/fee-policies' },
                { title: 'Discount Rules', path: '/discounts' },
                { title: 'Penalty Rules', path: '/penalty-rules' },
                { title: 'Users & Roles', path: '/users' },
                { title: 'Audit Logs', path: '/audit-logs' },
            ]
        },
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

        { type: 'link', title: 'Dashboard', path: '/dashboard' },
        { type: 'link', title: 'New Admission', path: '/new-admission' },

        {
            type: 'dropdown', title: 'Management', key: 'management',
            items: [
                { title: 'Families', path: '/families' },
                { title: 'Parents / Guardians', path: '/parents', permission: 'Parents' },
                { title: 'Students', path: '/students', permission: 'Students' },

            ]
        },
        {
            type: 'dropdown', title: 'Academics', key: 'academics',
            items: [
                { title: 'Teachers', path: '/teachers', permission: 'Teachers' },
                { title: 'Classes & Sections', path: '/classes' },
                //{ title: 'Attendance', path: '/attendance', permission: 'Attendance' },
                { title: 'Examinations', path: '/examinations' },
            ]
        },
        {
            type: 'dropdown', title: 'Fees & Finance', key: 'finance',
            items: [
                { title: 'Fee Structures', path: '/fee-structure', permission: 'Fee Structure' },
                { title: 'Student Fees', path: '/student-fees' },
                { title: 'Payments', path: '/receipts', permission: 'Payment' },
                { title: 'Discounts & Penalties', path: '/student-discount' },
                { title: 'Transport', path: '/transport' },
            ]
        },
        {
            type: 'dropdown', title: 'Communication', key: 'communication',
            items: [
                { title: 'Notifications', path: '/notifications' },
                { title: 'Messages', path: '/messages' },
            ]
        },
        {
            type: 'dropdown', title: 'Reports', key: 'reports',
            items: [
                { title: 'Reports', path: '/reports' },
            ]
        },
        {
            type: 'dropdown', title: 'Settings', key: 'settings',
            items: [
                { title: 'Fee Policies', path: '/fee-policies' },
                { title: 'Discount Rules', path: '/discounts' },
                { title: 'Penalty Rules', path: '/penalty-rules' },
                { title: 'Users & Roles', path: '/school/users' },
                { title: 'Audit Logs', path: '/audit-logs' },
            ]
        },
        {
            type: 'dropdown',
            title: 'Profile',
            key: 'profile_school',
            items: [
                { title: 'My Profile', path: '/edit-school-profile' },
            ]
        }
    ],


    // 3: TEACHER
    3: [
        {
            type: 'dropdown',
            title: 'Core',
            key: 'core_teacher',
            items: [
                { title: 'Dashboard', path: '/dashboard' },
            ]
        },
        {
            type: 'dropdown',
            title: 'Academics',
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
            title: 'Communication',
            key: 'comm_teacher',
            items: [
                { title: 'Messages', path: '/messages' },
                { title: 'Notifications', path: '/notifications' },
            ]
        },
        {
            type: 'dropdown',
            title: 'Profile',
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
            title: 'Core',
            key: 'core_parent',
            items: [
                { title: 'Dashboard', path: '/dashboard' },
                { title: 'My Children', path: '/parent/children' },
            ]
        },
        {
            type: 'dropdown',
            title: 'Fees & Finance',
            key: 'finance_parent',
            items: [
                { title: 'Fees', path: '/student-fees' },
                { title: 'Payments', path: '/payment' },
                { title: 'Receipts', path: '/receipts' },
            ]
        },
        {
            type: 'dropdown',
            title: 'Admissions',
            key: 'admissions_parent',
            items: [
                { title: 'Admission Requests', path: '/parent/admission-requests' },
            ]
        },
        {
            type: 'dropdown',
            title: 'Communication',
            key: 'comm_parent',
            items: [
                { title: 'Notifications', path: '/notifications' },
                { title: 'Messages', path: '/messages' },
            ]
        },
        {
            type: 'dropdown',
            title: 'profile',
            key: 'profile_parent',
            items: [
                { title: 'My Profile', path: '/profile' },
                { title: 'Family Details', path: '/parent/family-details' },
            ]
        }
    ]

};