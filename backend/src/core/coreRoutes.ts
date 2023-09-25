/*jslint node: true */

import * as AuthCtrl from './controllers/auth';
import * as UserCtrl from './controllers/user';

import * as  fileexplorer from './controllers/fileexplorer';

export const routes = [

    // Local Auth
    {
        path: '/api/auth/login',
        httpMethod: 'POST',
        middleware: [AuthCtrl.login],
        accessLevel: 'anon',
        accessPrivileges: null // anon gets through anyway
    },
    // used to check if token not expired on page load
    {
        path: '/api/auth/ping',
        httpMethod: 'GET',
        middleware: [AuthCtrl.ping],
        accessLevel: 'privileged', // use privilieged to force through secureRouting
        accessPrivileges: null // allow everybody
    },

    // User resource
    {
        path: '/api/auth/users',
        httpMethod: 'GET',
        middleware: [UserCtrl.list],
        accessLevel: 'privileged',
        accessPrivileges: ['otoAdmin']
    },
    {
        path: '/api/auth/users',
        httpMethod: 'POST',
        middleware: [UserCtrl.create],
        accessLevel: 'privileged',
        accessPrivileges: ['otoAdmin'] // not necessary since admin
    },
    {
        path: '/api/auth/users/:username',
        httpMethod: 'PUT',
        middleware: [UserCtrl.update],
        accessLevel: 'privileged', // users can set, change and remove passwords
        accessPrivileges: ['otoUser']
    },
    {
        path: '/api/auth/users/:username',
        httpMethod: 'DELETE',
        middleware: [UserCtrl.remove],
        accessLevel: 'privileged',
        accessPrivileges: ['otoAdmin']
    },
    {
        path: '/api/auth/users/deletebyuser/:username',
        httpMethod: 'POST',
        middleware: [UserCtrl.removeWithPassword],
        accessLevel: 'privileged',
        accessPrivileges: ['otoUser']
    },
    {
        path: '/api/auth/users/addpassword/:username',
        httpMethod: 'PUT',
        middleware: [UserCtrl.addPasswordByUser],
        accessLevel: 'privileged',
        accessPrivileges: ['otoUser']
    },
    {
        path: '/api/auth/users/changepassword/:username',
        httpMethod: 'PUT',
        middleware: [UserCtrl.changePasswordByUser],
        accessLevel: 'privileged',
        accessPrivileges: ['otoUser']
    },
    {
        path: '/api/auth/users/removepasswordbyadmin/:username',
        httpMethod: 'PUT',
        middleware: [UserCtrl.removePasswordByAdmin],
        accessLevel: 'privileged',
        accessPrivileges: ['otoAdmin']
    },
    {
        path: '/api/auth/users/changeactiverole/:username',
        httpMethod: 'POST',
        middleware: [UserCtrl.changeActiveRole],
        accessLevel: 'privileged',
        accessPrivileges: ['otoUser']
    },
    {
        path: '/api/auth/users/removetasksapitoken/:username',
        httpMethod: 'PUT',
        middleware: [UserCtrl.removeTasksApiToken],
        accessLevel: 'privileged',
        accessPrivileges: ['otoAdmin']
    },

    {
        path: '/api/fileexplorer/listdir',
        httpMethod: 'GET',
        middleware: [fileexplorer.listdir],
        accessLevel: 'privileged',
        accessPrivileges: ['bioinfUser']
    },
];
