import { Group } from './group.model';

export class User {

  public defaultPasswordChanged = false;
  public activeGroup: Group = null;

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

    public groups?: Array<Group>,
    public lastActiveGroupId?: string,
    public fullname?: string,
    public email?: string,
    public created?: any,
    public last_login?: any,
    public domainLogin?: Boolean,
    public token?: string, // only client
    public tasksApiToken?: string,
    public tasksApiTokenSet?: string
  ) {

    if (!this.groups) {
      this.groups = [];
    }

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
