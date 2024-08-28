const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const app = require('./app')





mongoose.connect(process.env.DB).then(() => console.log('DB connection successfully'));


app.listen(process.env.PORT,'127.0.0.1',()=>{
    console.log(`app is lestning on Host ${process.env.PORT}`)
})
