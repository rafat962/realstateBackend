const User = require('../controllers/user.Controllers')
const express = require('express')
const auth = require('../controllers/authControllers')



const Routers = express.Router()


//----------------- Auth Routs -----------------
Routers.route('/login').post(auth.login)
Routers.route('/signup').post(auth.signUp,auth.payment)
Routers.route('/resetPassword').post(auth.resetPassword)
Routers.route('/resetPassword2/:token').patch(auth.resetPassword2)
Routers.route('/UpdatePassword').patch(auth.protect,auth.updatePassword)
Routers.route('/getme').get(auth.protect,User.getme)
Routers.route('/active').post(auth.protect,auth.active)
Routers.route('/payment').post(auth.protect,auth.payment)






// --------------------- CRUDS ---------------------

Routers.route('/').get(User.getall).post(User.create)
Routers.route('/:id').get(User.getone).patch(User.update).delete(User.delete)



module.exports = Routers








