const express =require('express');
const admin = require('../middleware/admin');
const router = express.Router();
const category = require('../controller/adminController/categoryController');
const product = require('../controller/adminController/productController');
const order = require('../controller/adminController/orderController')
const user = require('../controller/adminController/userController');
const coupon = require('../controller/adminController/couponController');
const dashBoard = require('../controller/adminController/dashboardController')
const multer = require('../utilities/multer')
//admin

router.get('/logout',user.logout)
//dashboard Routes
router.get('/dashboard',admin.isLogin,dashBoard.loadDashboard)
router.get('/dashboard/report',admin.isLogin,dashBoard.loadSalesReport)
//Coupons
router.get('/coupons',coupon.loadCoupon);
router.get('/coupons/add',coupon.loadAddCoupon);
router.post('/coupons/add',coupon.addCoupon);
router.get('/coupon/edit',coupon.loadEditCoupon)
//Product Routes
router.get('/product',admin.isLogin,product.loadProduct)
router.get('/product/add',admin.isLogin,product.loadAddProduct)
router.post('/product/add',multer.uploadImages,product.addProduct)

router.get('/product/edit',admin.isLogin,product.loadEditProduct);
router.post('/product/edit',product.updateProduct);
router.get('/product/delete',product.deleteProduct);
router.get('/product/delete/image',product.deleteProductImage)
//Order Routes
router.get('/order',order.loadOrder)
router.get('/orderDetails',order.viewOrder)
router.post('/order/status',order.statusChange)
//Customer Routes
router.get('/customer',admin.isLogin,user.loadCustomer)
router.get ('/customer/edit',admin.isLogin,user.loadEditUser)
router.post('/customer/edit',user.updateUser)
// Category Routes
router.get('/category',admin.isLogin,category.loadCategory);
router.get('/category/add',admin.isLogin,category.loadAddCategory);
router.get('/category/edit',admin.isLogin,category.loadEditCategory);
router.post('/category/add',multer.uploadImage,category.addCategory);
router.post('/category/edit',category.editCategory);
router.get('/category/delete',category.deleteCategory);

// router.get('/',admin.isLogin,user.loadCustomer)
// router.get ('/edit',admin.isLogin,user.loadEditUser)
// router.post('/edit',user.updateUser)


module.exports = router