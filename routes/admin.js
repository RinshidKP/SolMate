const express =require('express');
const admin = require('../middleware/admin');
const router = express.Router();
const category = require('../controller/adminController/categoryController');
const user = require('../controller/userController/userController');
const product = require('../controller/adminController/productController');





//admin

router.get('/logout',(req,res)=>{
    try {
        
        req.session.admin_id = null;
        res.redirect('/login');

    } catch (error) {
        console.log(error);
    }
})
//dashboard Routes
router.get('/dashboard',admin.isLogin,(req,res)=>{
    res.render('admin/dashBoard')
})

//Product Routes
router.get('/product',admin.isLogin,product.loadProduct)
router.get('/product/add',admin.isLogin,product.loadAddProduct)
router.post('/product/add',product.addProduct)

router.get('/product/edit',admin.isLogin,product.loadEditProduct);
router.post('/product/edit',product.updateProduct)

//Customer Routes
router.get('/customer',admin.isLogin,user.loadCustomer)
router.get ('/customer/edit',admin.isLogin,user.loadEditUser)
router.post('/customer/edit',user.updateUser)

// Category Routes
router.get('/category',admin.isLogin,category.loadCategory);
router.get('/category/add',admin.isLogin,category.loadAddCategory);
router.get('/category/edit',admin.isLogin,category.loadEditCategory);

router.post('/category/add',category.addCategory);
router.post('/category/edit',category.editCategory);

router.get('/',admin.isLogin,user.loadCustomer)
router.get ('/edit',admin.isLogin,user.loadEditUser)
router.post('/edit',user.updateUser)


module.exports = router