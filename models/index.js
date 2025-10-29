import { Sequelize, DataTypes } from 'sequelize';

// Import Model definitions
import { countryModel } from './Country.js';
import { statusModel } from './Status.js';

// --- CONNECTION LOGIC ---
let sequelize;

// Production Logic (for Railway deployment)
if (process.env.MYSQL_URL) {
    // Railway injects MYSQL_URL. Use it for the secure, private connection.
    console.log("Using MYSQL_URL from Railway service.");
    
    sequelize = new Sequelize(process.env.MYSQL_URL, {
        dialect: 'mysql', 
        logging: false, // Turn off verbose SQL logs
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

} else {
    // Local Development Fallback
    // If running locally, load variables from .env file (if dotenv is used elsewhere)
    // IMPORTANT: Railway will always have MYSQL_URL. If this block runs, something is wrong.

    // Destructure variables for local connection
    const {
        DB_NAME,
        DB_USER,
        DB_PASSWORD,
        DB_HOST
    } = process.env;

    // Check if the required local variables are even present
    if (!DB_NAME || !DB_USER || !DB_HOST) {
        console.error("CRITICAL ERROR: Running outside of Railway and missing required local environment variables (DB_NAME, DB_USER, DB_HOST).");
        // We throw an error to prevent the app from starting with bad connection details
        throw new Error("Missing database configuration. Please check your .env file or Railway variables.");
    }
    
    console.log("Using separate local DB variables (DB_HOST, DB_NAME, etc.).");
    
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
db.sequelize = sequelize; // Store the connection object

// Load the models
db.Country = countryModel(sequelize, DataTypes);
db.Status = statusModel(sequelize, DataTypes);

export default db;