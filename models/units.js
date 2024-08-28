const mongoose = require('mongoose')


const unitsSchema = new mongoose.Schema({
    main_img:{
        type:String
    },
    sub_img:[String],
    date:{
        type:String
    },
    price:Number,
    bedrooms:Number,
    pathrooms:Number,
    area:Number,
    developer:String,
    devolper_logo:String,
    outdoor_description:String,
    type:String,
    Purpose:String,
    city:String,
    location:{
        type:{
            type:String,
            enum:['Point'],
            default:'Point'
        },
        coordinates:{
            type:[Number]
        },
        address:String
    },
    numSearch:{
        type:Number,
        default:0
    },
    lovers:[{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
},{
    toJSON:{virtuals:true}
},{
    toObject:{virtuals:true}
})

unitsSchema.index({"location.coordinates" : '2dsphere'})
// ------------------------ Date
unitsSchema.pre('save', function (next) {
    const currentDate = new Date;
    this.updatedAt = currentDate;
    if (!this.createdAt) {
        this.createdAt = currentDate;
    }
    next();
});
unitsSchema.pre('findOneAndUpdate',function(next){
    this.set({ updated: Date.now });
    next()
})
// ----
// ------------------------ love
unitsSchema.virtual('lovenums').get(function(){
    return this.lovers.length
})
unitsSchema.pre('save',function(next){
    this.lovenums = this.lovers.length
    next()
})
// ----












const Unit = mongoose.model('Unit',unitsSchema)


module.exports = Unit

