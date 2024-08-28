const Unit = require('../controllers/units.Controllers')
const express = require('express')
const multer = require('multer')



const Routers = express.Router()


//-----------------  Images -----------------


const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
    const destinationPath = 'public/img_units'
    cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `product-${file.originalname}-${Date.now()}.${ext}`);
    },
});
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
    cb(null, true);
    } else {
    cb(new Error('You can\'t upload this extension'), false);
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter:multerFilter
});

// --------------------- CRUDS ---------------------

Routers.route('/').get(Unit.getall).post(upload.fields([
    { name: 'main_img', maxCount: 1 },
    { name: 'sub_img', maxCount: 15 }
]),Unit.create)
Routers.route('/:id').get(Unit.getone).patch(upload.fields([
    { name: 'main_img', maxCount: 1 },
    { name: 'sub_img', maxCount: 4 }
]),Unit.update).delete(Unit.delete)

// --------------------- MAP ---------------------

Routers.route('/flat-within/:distance/center/:latlng/unit/:unit').get(Unit.getTourWithin)


Routers.route('/distances/:latlng/unit/:unit').get(Unit.getDistance)

module.exports = Routers








