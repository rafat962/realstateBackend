const User = require('../models//userModel')
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const { promisify } = require('util')
const Email = require('../utils/email')
const stripe = require('stripe')('sk_test_51OV7tnFAQf6P1ve6N1UvQu2LXyHV854FFj5uy1DaV00fBCBA6f0bpfwFc7YR2ePtpfdDxEtfz1pMZEF3WLPhdpHX00B1jV5kiV');
const otpGenerator  = require('otp-generator')
const sign = async (user)=>{
    const token = await jwt.sign({id:user.id},'rafat',{expiresIn:'2d'})
    return token
}




//------------------- Protect -------------------

exports.protect = async (req,res,next)=>{
    try{
        let token; 
        if(req.headers.authorization){
            token = req.headers.authorization.split(' ')[1]
        } else if (req.headers.cookie){
            token = req.headers.cookie.slice(4)
        }
        if(!token){
            return next(new Error('there is not token'))
        }
        // ------ Check if token valied
        const verify = jwt.verify(token,'rafat')
        if(!verify){
            return next(new Error('INVALID token'))
        }
        // ------ Check if user valied
        const decoded =  await promisify(jwt.verify)(token, 'rafat')
        const user = await User.findById(decoded.id)
        if(!user){
            return next(new Error('INVALID user'))
        }
        req.user = user 
        next()
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:err.message
        })
    }
}

//------------------- Login -------------------
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = await User.findOne({ email }).select('password active');
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Login failed. There is no user with this email.',
            });
        }
        // Check if user is active
        console.log(user.active)
        if(user.active === false){
            return res.status(401).json({
                status: 'error',
                message: 'Login failed. Acive Your Email.',
            });
        }

        // Check if password is correct
        const passwordCheck = await user.correctPasswordCompare(password, user.password);
        if (!passwordCheck) {
            return res.status(401).json({
                status: 'error',
                message: 'Login failed. Invalid password.',
            });
        }
        // Return token
        res.locals.user = user;
        const token = await sign(user);
        res.cookie('jwt', token);
        res.status(200).json({
            status: 'success',
            message: 'Login successful. Welcome back!',
            token,
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: `Login failed. ${err.message}`,
        });
    }
};

//------------------- signup -------------------

exports.signUp = async (req, res, next) => {
    try {
        // generate OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        let data = {
            username:req.body.username,
            email:req.body.email,
            password:req.body.password,
            confirmPassword:req.body.confirmPassword,
            role:req.body.role,
            number:req.body.phoneNumber,
            otp:otp
        }
        if (!req.body.password) {
            throw 'Please provide a password.';
        }
        if (!req.body.confirmPassword) {
            throw 'Please provide a confirmation password.';
        }
        if (req.body.password !== req.body.confirmPassword) {
            throw 'Password and Confirm Password must match.';
        }
        const user = await User.create(data);
        if (user) {
            const token = await sign(user);
            req.user = user
            req.token = token   
            const url2 = `http://localhost:4200/auth/activate`;
            await new Email(user,url2).sendOTP()
            res.status(200).json({
                status: 'success',
                message: 'Email activation has been sent',
                token
            });
        }
    } catch (err) {
        if (err.message) {
            if(err.message.split(' ')[0] === 'E11000'){
                res.status(400).json({
                    status: 'error',
                    message: 'Signup failed. Please choose another email.',
                });
            }
        } else {
            res.status(400).json({
                status: 'error',
                message: `Signup failed. ${err}`,
            });
        }
    }
};

// ------ payment ------

exports.payment = async (req,res,next)=>{
    try{
        console.log(req.user)
        let session;
        if(req.body.packages === 'silver'){
            console.log(2)
            session = await stripe.checkout.sessions.create({
                line_items: [{ 
                    price:'price_1OrEVMFAQf6P1ve6OEALrdys',
                    quantity: 1
                }],
                mode: 'subscription',
                success_url: `http://localhost:4200/?user=${req.user.id}&packages=silver`,
                cancel_url: `http://localhost:4200`,
            });
        }else if (req.body.packages === 'pro'){
            session = await stripe.checkout.sessions.create({
                line_items: [{ 
                    price:'price_1OrDvyFAQf6P1ve6zadOAu6a',
                    quantity: 1,
                }],
                mode: 'subscription',
                success_url: `http://localhost:4200/?user=${req.user.id}&packages=pro`,
                cancel_url: `http://localhost:4200`,
            });
        }else if (req.body.packages === 'free'){
            next()
            return;
        }
        // res.redirect(303, session.url);
        res.status(200).json({
            statu:'success',
            message:session.url
        })
    }catch(err){
        res.status(404).json({
            status:'faillll',
            message:err.message
        })
    }
}

//------------------- create checkout -------------------

exports.checkout = async(req,res,next)=>{
    try{
        const userId = req.quary.user
        const packages = req.quary.packages
        const user = await User.findById(userId)
        user.packages = packages
        await user.save()
        res.status(200).json({
            statu:'success',
            user
        })
    }catch(err){
        res.status(404).json({
            statu:"fail",
            message:err.message
        })
    }
}



//------------------- Active Acount -------------------

exports.active = async(req,res,next)=>{
    try{
        const otp = req.body.otp
        const user = req.user
        if(user.otp !== otp){
            throw 'INVALID OTP'
        }else{
            user.active = true
            await user.save()
            res.status(200).json({
                statu:'success',
                message:'Welcom To Our Community'
            })
        }
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:err
        })
    }
}



//------------------- resetPassword -------------------

exports.resetPassword = async (req, res, next) => {
    try {
        const email  = req.body.email;
        console.log(email)
        console.log(1)
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found.');
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();
        const resetURL = `http://localhost:4200/auth/forgetpassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: 'Reset token generated and sent to the user.',
            data: user.resetPasswordToken,
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: `Reset password failed. ${err.message}`,
        });
    }
};

exports.resetPassword2 = async(req,res,next) =>{
    try{
        const token = req.params.token
        if(!token) return next(new Error('you should enter your token'))
        const user = await User.findOne({resetPasswordToken : token}).select('password')
        if(!user) return next(new Error('invalied password'))
        if(user.resetPasswordToken>=Date.now()) return next(new Error('expired'))
        user.password = req.body.password,
        user.confirmPassword = req.body.confirmPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()
        res.status(200).json({
            state:'success',
            user
        })
    
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:err.message
        })
    }
}

//------------------- UpdatePassword -------------------

exports.updatePassword = async (req,res,next)=>{
    try{
        const user2 = req.user
        const user = await User.findById(user2.id).select('password')
        // ------ Check if Password Correct
        const passwordCheck = await  user.correctPasswordCompare(req.body.pastPassword,user.password)
        if(!passwordCheck){
            throw 'Invalid Password'
        }
        user.password = req.body.password
        user.confirmPassword = req.body.confirmPassword
        if (!req.body.password) {
            throw 'Please provide a password.';
        }
        if (!req.body.confirmPassword) {
            throw 'Please provide a confirmation password.';
        }
        if (req.body.password !== req.body.confirmPassword) {
            throw 'Password and Confirm Password must match.';
        }
        await user.save()
        const token = await sign(user)
        res.status(200).json({
            state:'success',
            token
        })
    }catch(err){
        res.status(404).json({
            status:'fail password',
            message:err
        })
    }
}


//------------------- isLoggedin -------------------

exports.islogedIn = async (req,res,next) =>{
    try{
        const token = req.headers.cookie.slice(4)
        if(token){
             // ------ Check if token valied
        const verify = jwt.verify(token,'rafat')
        if(!verify){
            return next(new Error('INVALID token'))
        }
        // ------ Check if user valied
        const decoded =  await promisify(jwt.verify)(token, 'rafat')
        const user = await User.findById(decoded.id)
        res.locals.user = user
        req.user = user
        next()
        }
    }catch(err){
        next()
    }
}


// ----------------- getMe -----------------

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
