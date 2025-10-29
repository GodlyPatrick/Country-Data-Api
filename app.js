import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './models/index.js';
import countryRouter from './routes/countryRoute.js';
dotenv.config();

const app = express();
const PORT= process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// root endpoint
app.get ('/', (req, res) => {
   res.status(200) .json(
    {message:'welcome to HNG stage 2 project',
      database_status: 'database connected successfully'
    });

});

// mount country router
app.use('/', countryRouter);

// Database connection and server start
const dbConnect = async () => {
  try {
    await db.sequelize.sync({alter: true});
    console.log('Database connected successfully');

    app.listen(PORT, () => {
  console.log(`app is up and running on localhost:${PORT}`)
    });
} catch (error) {
    console.error('MySQL connection failed:', error.message);
}};

dbConnect();
