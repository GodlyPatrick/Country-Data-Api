import Router from 'express';
const countryRouter = Router();
import { refreshCountries, 
  getAllCountries, 
  getCountryByName, 
  deleteCountry, 
  getStatus, 
  getSummaryImage 
} from '../controllers/countryController.js';

countryRouter
.post('/countries/refresh', refreshCountries)
.get('/countries', getAllCountries)
.get('/status', getStatus)
.get('/countries/image', getSummaryImage)
.get('/countries/:name', getCountryByName)
.delete('/countries/:name', deleteCountry);

export default countryRouter;
