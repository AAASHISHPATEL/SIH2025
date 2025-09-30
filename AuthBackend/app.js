import morgan from 'morgan';
import express from 'express';
import cors from 'cors';
import connectDB from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';

connectDB(); // Connect to MongoDB

const app = express();


app.use(
  cors({
    origin: "https://floatchat-omega.vercel.app", // ✅ must be your frontend origin
    // origin: "http://localhost:5173",
    credentials: true, // ✅ allow cookies
  })
); 

app.use(morgan('dev')); // Logging middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Middleware to parse cookies

app.use('/users', userRoutes); // User routes



app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;