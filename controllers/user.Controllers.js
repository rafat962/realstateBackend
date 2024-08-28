const User = require('../models/userModel')
const handleAsync = require('../utils/handleAsync')
const stripe = require('stripe')('sk_test_51OV7tnFAQf6P1ve6N1UvQu2LXyHV854FFj5uy1DaV00fBCBA6f0bpfwFc7YR2ePtpfdDxEtfz1pMZEF3WLPhdpHX00B1jV5kiV');





// ---------------------------------- CRUD ----------------------------------
// ----------------- GETALL -----------------
exports.getall = handleAsync(async (req,res,next)=>{
    const users = await User.find()
    return {
        nums:users.length,
        users
    } 
})

// ----------------- GETONE -----------------
exports.getone = handleAsync(async(req,res,next)=>{
    const users = await User.findById(req.params.id)
    return{
        users
    }    
})

// ----------------- CREATE -----------------
exports.create = handleAsync(async(req,res,next)=>{
    const users = await User.create(req.body)
    return {
        users
    }
})

// ----------------- Update -----------------
exports.update =  handleAsync(async(req,res,next)=>{
    const users = await User.findByIdAndUpdate(req.params.id,req.body)
    return{
        users
    }
})

// ----------------- delete -----------------
exports.delete =  handleAsync(async(req,res,next)=>{
    const users = await User.findByIdAndDelete(req.params.id)
    return{
        users
    }
})



// ----------------- getMe -----------------
const jwt = require('jsonwebtoken');
const { promisify } = require('util')
exports.getme = async(req,res,next)=>{
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decoded =  await promisify(jwt.verify)(token, 'rafat')
        let ver = jwt.verify(token,'rafat')
        const user = await User.findById(decoded.id)
        res.status(200).json({
            statu:'success',
            user
        })
    }catch(err){
        res.status(400).json({
            statu:'fail',
            message:err.message
        })
    }
}



