import { Model } from 'objection';

import { knex } from '../knex';

Model.knex(knex);

export class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get idColumn() { // VERY IMPORTANT if you use withGraphJoined. otherwise objection will look for an id column
    return 'username';
  }

}
