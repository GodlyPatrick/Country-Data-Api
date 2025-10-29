import dotenv from 'dotenv';
import { Sequelize, DataTypes } from 'sequelize';

dotenv.config();
//import Model definitions
import { countryModel } from './Country.js';
import { statusModel } from './Status.js';

//destructure env variables
const {
DB_NAME,
DB_USER,
DB_PASSWORD,
DB_HOST
} = process.env;

// create the connection instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql', // tells sequelize to use MySQL language
  logging: false,
  pool:{
    max: 5, //maximum no. of simultaenous connections
    min: 0,
    acquire: 30000,
    idle: 10000
  }

});

const db = {};
db.sequelize = sequelize; //store the connection object

//load the

db.Country = countryModel(sequelize, DataTypes);
db.Status = statusModel(sequelize, DataTypes);
export default db;

