import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const limit = '16KB';

app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true,
}));

app.use(express.json({limit: limit}));
app.use(express.urlencoded({ extended: true  , limit: limit}));
app.use(express.static('public'));
app.use(cookieParser());
   

const app = express();
PORT = process.env.PORT || 8000;


export {app ,PORT} ; 