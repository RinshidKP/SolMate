const express = require('express');
const { Module } = require('module');
const router = express.Router();
const auth = require('../controller/authController/authController');
const user = require('../controller/userController/userController');
const adminMiddleware = require('../middleware/admin');
const userMiddleware = require('../middleware/user');
const cartController = require('../controller/userController/cartController');
const checkout = require('../controller/userController/checkoutController');
const order = require('../controller/userController/orderController');
const wallet = require('../controller/userController/walletController');
//home
router.get('/user',user.loadhome);
router.get('/product',user.loadProduct);
router.get('/product/shop',user.viewProduct);
router.get('/about',user.loadAbout);
//user setups
router.get('/signup',userMiddleware.isLogout,auth.loadSignup);
router.post('/signup',userMiddleware.isLogout,auth.createUser);
router.get('/login',userMiddleware.isLogout,auth.loadlogin);
router.get('/logout',auth.logout);
//forgot password
router.get('/signin/forgot',auth.loadForgot);
router.post('/signin/forgot',auth.forgotPassword);
router.post('/forgot/submit',auth.otpPasswordChange);
router.get('/forgot/submit',auth.loadChangePassword);
router.post('/forgot/submited',auth.changePassword);
router.get('/otp',auth.loadOtp);
router.post('/otp',auth.otpVerify);

//Profile
router.get('/user/profile',userMiddleware.isLogin,user.loadProfile)
router.post('/login',auth.loginVerify)
router.get('/profile/edit',userMiddleware.isLogin,user.loadEditprofile)
router.post('/profile/edit',user.updateEditprofile)
router.get('/profile/editPassword',userMiddleware.isLogin,user.loadUserPassword)
router.post('/profile/editPassword',user.updateUserPassword) 
router.get('/user/order',order.loadOrder);
router.post('/user/order/cancel',order.cancelOrder)
router.get('/user/order/view',order.viewDetails)
router.post('/order/return',order.orderReturn)
router.get('/profile/wallet',wallet.loadWallet)
// Address
router.get('/user/profileAddress',userMiddleware.isLogin,user.loadUserAddress)
router.get('/user/profileAddress/add',userMiddleware.isLogin,user.loadAddAddress)
router.post('/user/profileAddress/add',user.saveAddress)    
router.get('/user/profileAddress/edit',userMiddleware.isLogin,user.loadEditAddress)
router.post('/user/profileAddress/edit',user.saveEditAddress)
router.delete('/address/delete',user.deleteAddress)
//  Cart
router.get('/cart/add',userMiddleware.isLogin,cartController.addToCart);
router.get('/cart',userMiddleware.isLogin,cartController.loadcart);
router.post('/cart/quantity',userMiddleware.isLogin,cartController.quantityChange);
router.delete('/removeItem',cartController.removeFromCart);

//checkout
router.get('/checkout/address',userMiddleware.isLogin,checkout.loadCheckOutAddress)
router.post('/checkout/addAddress',checkout.addAddress)
router.get('/checkout',checkout.checkoutProceed)
router.post('/checkout',checkout.checkout)
router.post('/admin/coupon/apply',checkout.applyCoupon)
router.get('/order/success',checkout.orderSuccess)
router.post('/create-order',checkout.payOnline)




router.get('/index',(req,res)=>{
    res.render('user/productDetails')
})

module.exports=router