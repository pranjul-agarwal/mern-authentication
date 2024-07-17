import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();
import { UserRouter } from './routes/user.js';
const app = express();
app.use(cors({
    origin: ["http://localhost:5173"]
}));

app.use(cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(cookieParser());

app.use(express.json());
app.use('/auth', UserRouter);
const port = process.env.PORT;

mongoose.connect('mongodb://127.0.0.1:27017/authentication')
console.log('database connected');

app.listen(port, () => {
    console.log(`server is listening on ${port}`);
})