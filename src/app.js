import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const limit = '16KB';
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true,
}));

app.use(express.json({limit: limit}));
app.use(express.urlencoded({ extended: true  , limit: limit}));
app.use(express.static('public'));
app.use(cookieParser());

//routes import

import userRouter from "./routes/user.routes.js";

//route declaration

app.use("/api/v1/users", userRouter);


export {app ,PORT};