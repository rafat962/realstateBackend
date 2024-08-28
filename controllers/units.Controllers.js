const Unit = require('../models/units')
const handleAsync = require('../utils/handleAsync')
const apifeature = require('../utils/apifeature')






// ---------------------------------- CRUD ----------------------------------
// ----------------- GETALL -----------------
exports.getall = handleAsync(async (req,res,next)=>{
    const product =  new apifeature(Unit,req.query).filter().field().sort().paginate()
    const units = await product.tour
    return {
        nums:units.length,
        units
    } 
})

// ----------------- GETONE -----------------
exports.getone = handleAsync(async(req,res,next)=>{
    const units = await Unit.findById(req.params.id)
    return{
        units
    }    
})

// ----------------- CREATE -----------------
exports.create = handleAsync(async(req,res,next)=>{
    const units = await Unit.create(req.body)
    if(req.files){
        if(req.files.main_img[0]){
            units.main_img = req.files.main_img[0].filename
        }
        if (req.files.sub_img) {
            // Assuming sub_img is an array field in your schema
            units.sub_img =req.files.sub_img.map(file=>file.filename)
            
        }
    }
    return {
        units
    }
})

// ----------------- Update -----------------
exports.update =  handleAsync(async(req,res,next)=>{
    const units = await Unit.findByIdAndUpdate(req.params.id,req.body)
    if(req.files){
        if(req.files.main_img){
            if(req.files.main_img[0]){
                units.main_img = req.files?.main_img[0].filename
            }
        }
        if (req.files.sub_img) {
            // Assuming sub_img is an array field in your schema
            units.sub_img =req.files.sub_img.map(file=>file.filename)
        }
    }
    return{
        units
    }
})

// ----------------- delete -----------------
exports.delete =  handleAsync(async(req,res,next)=>{
    const units = await Unit.findByIdAndDelete(req.params.id)
    return{
        units
    }
})


// ----------------- map -----------------


exports.getTourWithin = async (req,res,next)=>{
    const { distance, latlng , unit } = req.params;
    const [lat , lng] = latlng.split(',')
    if(!lat || !lng){
        next(new Error('please provide in format lat,lng'))
    }

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    const units = await Unit.find({ "location.coordinates": { $geoWithin: {$centerSphere : [[lng,lat],radius]} } })

    res.status(200).json({
        status:'success',
        rsult:units.length,
        data:{
            data:units
        }
    })
}


exports.getDistance = async(req,res,next)=>{
    const { distance, latlng , unit } = req.params;
    const [lat , lng] = latlng.split(',')
    if(!lat || !lng){
        next(new Error('please provide in format lat,lng'))
    }

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const distances = await Unit.aggregate([
        {
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:[+lng,+lat]
                },
                distanceField:'distance'
            }
        }
    ])

    res.status(200).json({
        statu:'success',
        distances
    })

}


