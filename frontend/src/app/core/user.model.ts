export class User {

  public defaultPasswordChanged = false;
  
  constructor(
    public id?: string,
    public username?: string,
    public password?: string,
    public role?: any,

    public roles?: Array<string>,
    public activeRole?: any,
    
    public privileges?: Array<string>,
    public limsPrivileges?: Array<string>,
    public activePrivileges?: Array<string>,

    public fullname?: string,
    public email?: string,
    public created?: any,
    public last_login?: any,
    public token?: string, // only client
  ) {

    if (!this.privileges) {
      this.privileges = [];
    }
  }

  forForm() {
    return {
      id: this.id || null,
      username: this.username || null,
      fullname: this.fullname || null,
      password: this.password || null,
      email: this.email || null
    };
  }
}
