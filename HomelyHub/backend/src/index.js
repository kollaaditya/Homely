import a3a from 'express';
import a3b from 'cors';
import dotenv from 'dotenv';
import a3c from 'cookie-parser';
import a3d from './utils/db.js';
import { router } from './routes/userRoutes.js';
import { propertyRouter } from './routes/propertyRouter.js';
import { bookingRouter } from './routes/bookingRouter.js';
dotenv['config']();
const app = a3a();
<<<<<<< HEAD
// Add middleware to handle preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://homely1.netlify.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(a3b({
  origin: ['https://homely1.netlify.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
})); app['use'](a3a['json']({ 'limit': '100mb' })), app['use'](a3a['urlencoded']({
=======
app.use(a3b({
  origin: process.env.ORIGIN_ACCESS_URL,
  credentials: true
}));app['use'](a3a['json']({ 'limit': '100mb' })), app['use'](a3a['urlencoded']({
>>>>>>> d457bca2008b960ea38ec51b1ea62d61ad0a6270
    'limit': '100mb',
    'extended': !![]
})), app['use'](a3c());
const port = process['env']['PORT'] || 0x1f91;
a3d(), app['use']('/api/v1/rent/user', router), app['use']('/api/v1/rent/listing', propertyRouter), app['use']('/api/v1/rent/user/booking', bookingRouter), app['listen'](port, () => {
    console['log']('App\x20running\x20on\x20port:\x20' + port);
});
