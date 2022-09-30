/**
 * Identical to same model class on server
 * I currently differentiate between 3 roles: user, manager, admin
 * When a user changes their role, the activeRoles key is filled with all 
 * associated privilges that the user has for that role
 * activePrivilges will also always contain all "previous level" rroles. i.e. when user is manager 
 * he also has all user roles in activeRoles
 */

export class Privileges {

  static privileges: any[] = [
    {"role": "user", "module": "oto", "key": "otoUser"},
    {"role": "user", "module": "cams", "key": "camsUser"},
    {"role": "user", "module": "printer", "key": "printerUser"},

    {"role": "admin", "module": "dev", "key": "devAdmin"},
    {"role": "admin", "module": "oto", "key": "otoAdmin"},
  ];
}
