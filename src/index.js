import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
const app = express()

dotenv.config({path: "./.env"});

connectDB();

app.listen(process.env.PORT,()=>{`app is listening on port ${process.env.PORT}`})