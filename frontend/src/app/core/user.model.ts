export class User {

  public default_password_changed = false;

  constructor(
    public id?: string,
    public username?: string,
    public password?: string,

    public roles?: Array<string>,
    public active_role?: any,
    
    public privileges?: Array<string>,
    public lims_privileges?: Array<string>,
    public active_privileges?: Array<string>,

    public fullname?: string,
    public email?: string,
    public created?: any,
    public last_login?: any,
    public domain_login?: Boolean,
    public token?: string, // only client
    public tasksapitoken?: string,
    public tasksapitokenSet?: string
  ) {

    if (!this.privileges) {
      this.privileges = [];
    }
  }

}
