import a3a from 'express';
import a3b from 'cors';
import dotenv from 'dotenv';
import a3c from 'cookie-parser';
import a3d from './utils/db.js';
import { router } from './routes/userRoutes.js';
import { propertyRouter } from './routes/propertyRouter.js';
import { bookingRouter } from './routes/bookingRouter.js';

dotenv.config();

const app = a3a();

// CORS configuration for Netlify + cookies
app.use(a3b({
  origin: function (origin, callback) {
    const allowed = [
      "https://homely1.netlify.app",
    ];

    // Allow all Netlify preview subdomains
    if (!origin || origin.endsWith(".netlify.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


app.use(a3a.json({ limit: '100mb' }));
app.use(a3a.urlencoded({
  limit: '100mb',
  extended: true
}));
app.use(a3c());

const port = process.env.PORT || 8081;

// Connect to DB
a3d();

// Routes
app.use('/api/v1/rent/user', router);
app.use('/api/v1/rent/listing', propertyRouter);
app.use('/api/v1/rent/user/booking', bookingRouter);

// Start server
app.listen(port, () => {
  console.log('App running on port: ' + port);
});
