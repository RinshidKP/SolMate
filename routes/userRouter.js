const express = require('express');
const { Module } = require('module');
const router = express.Router();

const userMiddleware = require('../middleware/user');

const auth = require('../controller/authController/authController');
const user = require('../controller/userController/userController');
const cartController = require('../controller/userController/cartController');
const checkout = require('../controller/userController/checkoutController');
const order = require('../controller/userController/orderController');
const wallet = require('../controller/userController/walletController');

//home
router.get('/',user.loadhome);
router.get('/product',user.loadProduct);
router.get('/product/shop',user.viewProduct);
router.get('/about',user.loadAbout);
//user setups
router.get('/signup',userMiddleware.isLogout,auth.loadSignup);
router.get('/login',userMiddleware.isLogout,auth.loadlogin);
router.get('/logout',auth.logout);
router.post('/signup',userMiddleware.isLogout,auth.createUser);
//forgot password
router.get('/signin/forgot',auth.loadForgot);
router.get('/forgot/submit',auth.loadChangePassword);
router.get('/otp',auth.loadOtp);
router.post('/signin/forgot',auth.forgotPassword);
router.post('/forgot/submit',auth.otpPasswordChange);
router.post('/forgot/submited',auth.changePassword);
router.post('/otp',auth.otpVerify);

//Profile
router.get('/user/profile',userMiddleware.isLogin,user.loadProfile)
router.get('/profile/edit',userMiddleware.isLogin,user.loadEditprofile)
router.get('/profile/editPassword',userMiddleware.isLogin,user.loadUserPassword)
router.get('/user/order',order.loadOrder);
router.get('/user/order/view',order.viewDetails)
router.get('/profile/wallet',wallet.loadWallet)
router.post('/login',auth.loginVerify)
router.post('/profile/edit',user.updateEditprofile)
router.post('/profile/editPassword',user.updateUserPassword) 
router.post('/user/order/cancel',order.cancelOrder)
router.post('/order/return',order.orderReturn)
router.post('/order/download',order.orderDownload)
// Address
router.get('/user/profileAddress',userMiddleware.isLogin,user.loadUserAddress)
router.get('/user/profileAddress/add',userMiddleware.isLogin,user.loadAddAddress)
router.get('/user/profileAddress/edit',userMiddleware.isLogin,user.loadEditAddress)
router.post('/user/profileAddress/add',user.saveAddress)    
router.post('/user/profileAddress/edit',user.saveEditAddress)
router.delete('/address/delete',user.deleteAddress)
//  Cart
router.get('/cart/add',userMiddleware.isLogin,cartController.addToCart);
router.get('/cart',userMiddleware.isLogin,cartController.loadcart);
router.post('/cart/quantity',userMiddleware.isLogin,cartController.quantityChange);
router.delete('/removeItem',cartController.removeFromCart);

//checkout
router.get('/checkout/address',userMiddleware.isLogin,checkout.loadCheckOutAddress)
router.get('/checkout',userMiddleware.isLogin,checkout.checkoutProceed)
router.get('/order/success',userMiddleware.isLogin,checkout.orderSuccess)
router.post('/checkout/addAddress',checkout.addAddress)
router.post('/checkout',checkout.checkout)
router.post('/admin/coupon/apply',checkout.applyCoupon)
router.post('/create-order',checkout.payOnline)

module.exports=router