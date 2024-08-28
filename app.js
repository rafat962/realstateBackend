const express = require('express')
const mongoose = require('mongoose')
const socketIO = require('socket.io');
const dotenv = require('dotenv')
dotenv.config('./config.env')
const cors = require('cors')
const path = require('path')
const compression = require('compression')
const unitRouters = require('./routers/unitsRouters')
const userRouters = require('./routers/userRoutes')
// -------------- CONFIGRATIONS --------------
const app = express()
app.use(express.json())
app.use(cors())
app.use(compression())
app.use('/public',express.static(path.join(__dirname,'public')))
app.set('view engine','pug')
app.set('views',path.join(__dirname,'views'))
// -------------- SOCENT --------------





// -------------- ROUTERS --------------

app.use('/api/v1/user',userRouters)

app.use('/api/v1/unit',unitRouters)
app.use('*',(req,res,next)=>{
    res.status(400).json({ 
        status:'faill',
        message:'INVALID URL'
    })
})







module.exports = app