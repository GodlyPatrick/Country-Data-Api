// models/index.js - OPTIMAL CONNECTION LOGIC

import dotenv from 'dotenv';
import { Sequelize, DataTypes } from 'sequelize';

dotenv.config();
//import Model definitions
import { countryModel } from './Country.js';
import { statusModel } from './Status.js';

// --- CONNECTION LOGIC: Handle DATABASE_URL (Railway) or separate ENV variables (Local) ---
let sequelize;

// Option 1: Check for the single DATABASE_URL (Standard for Railway/Production)
if (process.env.MYSQL_URL) {
    console.log("Using DATABASE_URL from environment.");
    sequelize = new Sequelize(process.env.MYSQL_URL, {
        dialect: 'mysql', // Tells Sequelize to use MySQL
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

} else {
    // Option 2: Fallback to separate variables (Standard for local .env files)
    const {
        DB_NAME,
        DB_USER,
        DB_PASSWORD,
        DB_HOST
    } = process.env;

    console.log("Using separate DB variables from .env file.");
    sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
}
// ---------------------------------------------------------------------------------------

const db = {};
db.sequelize = sequelize; //store the connection object

//load the
db.Country = countryModel(sequelize, DataTypes);
db.Status = statusModel(sequelize, DataTypes);

export default db;