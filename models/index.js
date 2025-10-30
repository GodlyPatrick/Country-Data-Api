import { Sequelize, DataTypes } from 'sequelize';

// Import Model definitions
import { countryModel } from './Country.js';
import { statusModel } from './Status.js';

// --- CONNECTION LOGIC: Uses standard DB_* variables for ALL environments ---
let sequelize;

// Destructure variables for connection
const {
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT // Added DB_PORT variable for consistency
} = process.env;

// Check if the required variables are present
if (!DB_NAME || !DB_USER || !DB_HOST || !DB_PASSWORD) {
    console.error("CRITICAL ERROR: Missing required database connection variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).");
    // This will cause a quick, visible crash if variables are not set on Railway or locally.
    throw new Error("Missing database configuration. Set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME.");
}

console.log("Using external database variables (Aiven/Local) for connection.");

sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT || 3306, // Use DB_PORT if defined, default to 3306
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
// ---------------------------------------------------------------------------------------

const db = {};
db.sequelize = sequelize; // Store the connection object

// Load the models
db.Country = countryModel(sequelize, DataTypes);
db.Status = statusModel(sequelize, DataTypes);

export default db;