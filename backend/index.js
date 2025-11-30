import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import mongoose from 'mongoose';

const app = express();

app.use(express.json()); //middleware for parse JSON bodies...

app.use(cors()); //middleware for accept request from anywhere...

dotenv.config(); //use to connect data from  .env file...

//connect to mongodb database...
const connectionString = process.env.MONGO_URI;

mongoose.connect(connectionString).then(
    () => {
        console.log("Database connected successfully");
    }
).catch(
    () => {
        console.log("Database connection failed");
    }
);

//start express server...
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});

