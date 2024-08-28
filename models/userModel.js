const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        // required:true
    },
    email:{
        type:String,
        // required:true,
        unique:true,
        validate:{
            validator:validator.isEmail,
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password:{
        type:String,
        require:[true,'You Must enter your Password'],
        min:[3,'Must be at least 6']
    },
    confirmPassword:{
        type:String,
        require:[true,'You Must enter your Password'],
        validate:{
            validator: function(v){
                return v === this.password
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    role:{
        type:String,
        enum:['user','owner'],
        default:'user'
    },
    packages:{
        type:String,
        enum:['free','silver','pro'],
        default:'free',
        required:function(){
            return this.role === 'owner'
        }
    },
    subscriptionEnd:String,
    lovelist:{
        type:mongoose.Schema.ObjectId,
        ref:'Unit'
    },
    number:{
        type:String,
        // required:[true,'you should enter your phone number']
    },
    active:{
        type:Boolean,
        default:false
    },
    resetPasswordToken :String,
    resetPasswordExpires:Date,
    otp:String
})


// -------------- encrupt password
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,12)
    this.confirmPassword = undefined
    next()
})

// -------------- compare password
userSchema.methods.correctPasswordCompare = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};



const User = mongoose.model('User',userSchema)


module.exports = User
