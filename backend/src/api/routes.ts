import * as PrinterCtrl from './controllers/printer';

export const routes = [

    // Local Auth
    {
        path: '/api/printer/status',
        httpMethod: 'GET',
        middleware: [PrinterCtrl.status],
        accessLevel: 'privileged',
        accessPrivileges: ['printerUser']
    }
];