




const handleAsync = (asyncFunction)=>{
    return async (req,res,next)=>{
        try{
            const result = await asyncFunction(req,res,next)
            res.status(200).json({
                statu:'success',
                result
            })
        }catch(err){
            res.status(404).json({
                statu:'fail',
                message:err.message
            })
        }
        
    }
} 


module.exports = handleAsync