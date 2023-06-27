const User = require('../../models/userModel');
const category = require('../../models/categoryModel')
const product = require('../../models/productModel')

const loadCustomer = async (req,res)=>{
    try {
        const userData = await User.find()
        res.render('admin/customers',{user:userData})
    } catch (error) {
        console.log(error);
    }
}
const loadEditUser = async (req,res)=>{
    try {
        const id= req.query.id
        const userData = await User.findOne({_id:id})
        res.render('admin/editCustomer',{message:null,user:userData})
    } catch (error) {
        console.log(error);
    }
}

const loadhome = async (req,res)=>{
    try {

        if(req.session.admin_id){
            res.redirect('/admin/dashboard')
        }else{
            const categories = await category.find()
            const products = await product.find()
            res.render('user/home',{categories:categories,products:products})
        }
        
    } catch (error) {
        console.log(error);
    }
}

const loadProduct = async (req,res)=>{

    try {

        const productData = await product.find()
        res.render('user/shop',{products:productData})
        
    } catch (error) {
        console.log(error);
    }
}

const viewProduct = async (req,res)=>{
    try {
        const id =req.query.id
        const productData = await product.findOne({_id:id});
        res.render('user/productList',{products:productData});
    } catch (error) {
        console.log(error);
    }
}

const updateUser = async (req,res)=>{
    try {
        const username = req.body.username;
        const name = req.body.namme;
        const email = req.body.email;
        const isAccess = req.body.isAccess;
        const id = req.query.id
        // console.log(req.query);
        await User.findByIdAndUpdate(id,{$set:{username:username,name:name,email,email,isAccess:isAccess}})
        res.redirect('/admin/customer')
    } catch (error) {
        console.log(error);
    }
}

module.exports ={
    loadCustomer,
    loadEditUser,
    updateUser,
    loadhome,
    loadProduct,
    viewProduct
}
