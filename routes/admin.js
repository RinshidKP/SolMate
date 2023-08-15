const express =require('express');
const admin = require('../middleware/admin');
const router = express.Router();
const category = require('../controller/adminController/categoryController');
const product = require('../controller/adminController/productController');
const order = require('../controller/adminController/orderController');
const user = require('../controller/adminController/userController');
const coupon = require('../controller/adminController/couponController');
const dashBoard = require('../controller/adminController/dashboardController');
const multer = require('../utilities/multer');

//admin
router.get('/logout',user.logout);
//dashboard Routes
router.get('/dashboard',admin.isLogin,dashBoard.loadDashboard);
router.get('/dashboard/report',admin.isLogin,dashBoard.loadSalesReport);
router.post('/dashboard/report/daily',dashBoard.dailySalesReport);
router.post('/dashboard/report/month',dashBoard.monthlySaleReport);
router.post('/dashboard/report/date',dashBoard.byDateSaleReport);
//Coupons
router.get('/coupons',admin.isLogin,coupon.loadCoupon);
router.get('/coupons/add',admin.isLogin,coupon.loadAddCoupon);
router.get('/coupon/edit',admin.isLogin,coupon.loadEditCoupon);
router.post('/coupons/add',coupon.addCoupon);
//Product Routes
router.get('/product',admin.isLogin,product.loadProduct);
router.get('/product/add',admin.isLogin,product.loadAddProduct);
router.get('/product/edit',admin.isLogin,product.loadEditProduct);
router.get('/product/delete',admin.isLogin,product.deleteProduct);
router.get('/product/delete/image',admin.isLogin,product.deleteProductImage);
router.post('/product/add',multer.uploadImages,product.addProduct);
router.post('/product/edit',multer.uploadImages,product.updateProduct);
//Order Routes
router.get('/order',admin.isLogin,order.loadOrder);
router.get('/orderDetails',admin.isLogin,order.viewOrder);
router.post('/order/status',order.statusChange);
//Customer Routes
router.get('/customer',admin.isLogin,user.loadCustomer);
router.get ('/customer/edit',admin.isLogin,user.loadEditUser);
router.post('/customer/edit',user.updateUser);
// Category Routes
router.get('/category',admin.isLogin,category.loadCategory);
router.get('/category/add',admin.isLogin,category.loadAddCategory);
router.get('/category/edit',admin.isLogin,category.loadEditCategory);
router.get('/category/delete',admin.isLogin,category.deleteCategory);
router.post('/category/add',multer.uploadImage,category.addCategory);
router.post('/category/edit',multer.uploadImage,category.editCategory);


module.exports = router