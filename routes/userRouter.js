const express = require('express');
const { Module } = require('module');
// const isLogin = require('../../middleware/admin')
const router = express.Router();
const auth = require('../controller/authController/authController')
const user = require('../controller/userController/userController')
const admin = require('../middleware/admin')


router.get('/user/home',user.loadhome)
router.get('/signup',admin.isLogout,auth.loadSignup);
router.get('/login',admin.isLogout,auth.loadlogin);
router.get('/verifyEmail',admin.isLogout,auth.verifyEmail);
router.get('/signup/success',admin.isLogout,auth.emailVerification);
router.get('/otp',admin.isLogout,auth.otpVerify)
router.get('/product',user.loadProduct)
router.get('/product/shop',user.viewProduct)
router.post('/signup',auth.createUser)
router.post('/login',auth.loginVerify)
router.post('/otp',auth.otpVerify)



router.get('/index',(req,res)=>{
    res.render('user/index')
})

module.exports=router