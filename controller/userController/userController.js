const User = require("../../models/userModel");
const category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const auth = require("../authController/authController");
// const address = require('../../models/addressModel');
const addressModel = require("../../models/addressModel");





const loadhome = async (req, res) => {
  try {
    
      const categories = await category.find();
      const products = await Product.find({ isActive: true })
      .sort({ created: -1 })
      .limit(4);
      const session = req.session.user_id;
      let countCart= 0;
      if(req.session.user_id){
        countCart=res.locals.count
      }
      
      res.render("user/home", {
        categories: categories,
        products: products,
        session: session,
        name: req.session.user_name,
        countCart
      });
      
    
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const loadProduct = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = 4;
    const skip = (currentPage - 1) * itemsPerPage;
    const limit = itemsPerPage;
    const startIndex = skip + 0;
    let countCart= 0;
    const session = req.session.user_id;   


    if(req.session.user_id){
      countCart=res.locals.count
    }
    const categories = await category.find();
    let search ="";
    search = req.query.search;
   
    let minamount = 0;
    let maxamount =  100;

    if(req.query.toValue||req.query.fromValue){
       minamount = req.query.fromValue;
       maxamount =  req.query.toValue;
    }
    let query = {
      $or: [
        { name: { $regex: new RegExp(search, 'gi') } },
        { color: { $regex: new RegExp(search, 'gi') } }
      ],
      $and:[
        {price: {$gt:minamount}},
        {price: {$lt: maxamount}},
      ]
    }


    if(req.query.category){
      query.category = { $in: req.query.category };
    }
    let products = await Product.find(query).skip(skip)
      .limit(limit);

      const totalProduct = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProduct / itemsPerPage);
    
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      res.json({ 
        products: products,
        pagination: {
        currentPage,
        totalPages,
        startIndex,
        endIndex: skip + totalProduct.length,
        }
      });
    }else{
      res.render("user/shop", {
        session,
        products: products,
        categories,
        name: req.session.user_name,
        currentPage,
        totalPages,
        startIndex,
        countCart,
        endIndex: skip + totalProduct.length,
      });
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const viewProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const categories = await category.find();
    const productData = await Product.findOne({ _id: id });
    const session = req.session.user_id;
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    res.render("user/productDetails", {
      session,
      name: req.session.user_name,
      products: productData,
      categories,
      countCart
    });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};


const loadProfile = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });

    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    
    res.render("user/profile", {
      session,
      name: req.session.user_name,
      user: userData,
      countCart
    });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const confirmMail = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await userModel.findOne({ email: email });
    if (userData) {
      res.render("/otp");
    } else {
      res.render("auth/forgotPassword", { message: "Incorrect Email Address" });
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const loadEditprofile = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    res.render("user/editProfile", {
      session,
      name: req.session.user_name,
      user: userData,
      message: null,
      countCart
    });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};
const updateEditprofile = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ username: req.body.username });
    if (userData) {
      let countCart= 0;
      if(req.session.user_id){
        countCart=res.locals.count
      }
      res.render("user/editProfile", {
        session,
        name: req.session.user_name,
        user: userData,
        message: "Username Already Exists",
        countCart
      });
    } else {
      await User.findByIdAndUpdate(session, {
        name: req.body.fname,
        username: req.body.username,
      });
      res.redirect("/user/profile");
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const loadUserPassword = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    res.render("auth/updatePassword", {
      localAction: "/profile/editPassword",
      session,
      name: req.session.user_name,
      user: userData,
      message: null,
      countCart
    });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};
const updateUserPassword = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ username: req.body.username });
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    const sPass = await auth.secretHash(password);
    if (password === cpassword) {
      await User.findByIdAndUpdate(session, {
        $set: {
          password: sPass,
        },
      });
      res.redirect("/user/profile");
    } else {
      res.send("Password Doesnt Match");
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const loadUserAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });
    const contact = await addressModel.findOne({
      user: session,
      type: "contact",
    });
    const main = await addressModel.findOne({ user: session, type: "main" });
    const secondary = await addressModel.find({
      user: session,
      type: "secondary",
    });
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    res.render("user/profileAddress", {
      session,
      name: req.session.user_name,
      user: userData,
      contact,
      main,
      secondary,
      countCart
    });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const loadAddAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    const type = req.query.type;
    const userData = await User.findOne({ _id: req.session.user_id });
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    res.render("user/addAddress", {
      id: session,
      session,
      name: req.session.user_name,
      user: userData,
      type,
      countCart
    });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};
const saveAddress = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    const { buildingName, street, city, state, country, type } = req.body;

    let pincode = parseInt(req.body.pincode);
    let phonenumber = parseInt(req.body.number);

    const newAddress = new addressModel({
      buildingName,
      street,
      city,
      state,
      pincode,
      country,
      phonenumber,
      user: userData._id,
      type,
    });

    await newAddress.save();
    res.redirect("/user/profileAddress");
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    const { type, id } = req.query;
    const address = await addressModel.findOne({ _id: id });
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    const userData = await User.findOne({ _id: req.session.user_id });
    res.render("user/editAddress", {
      session,
      name: req.session.user_name,
      user: userData,
      type,
      address,
      countCart
    });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const saveEditAddress = async (req, res) => {
  try {
    const addressId = req.query.addressId;
    const { buildingName, street, city, state, country } = req.body;
    let pincode = parseInt(req.body.pincode);
    let phonenumber = parseInt(req.body.number);
    await addressModel.findOneAndUpdate(
      { _id: addressId },
      {
        buildingName: buildingName,
        street: street,
        city: city,
        pincode: pincode,
        state: state,
        phonenumber: phonenumber,
        country: country,
      }
    );
    res.redirect("/user/profileAddress");
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const deleteAddress = async (req, res) => {
  try {
    const id = req.query.id;
    await addressModel.deleteOne({ _id: id });
    res.json({ response: true });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const loadAbout = (req,res)=>{
  try {
    const session = req.session.user_id;
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    res.render('user/about',{
      session,
      countCart,
      name:req.session.user_name,
    })
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
}

module.exports = {
  loadhome,
  loadProduct,
  viewProduct,
  loadProfile,
  confirmMail,
  loadEditprofile,
  updateEditprofile,
  loadUserPassword,
  updateUserPassword,
  loadUserAddress,
  loadAddAddress,
  saveAddress,
  loadEditAddress,
  saveEditAddress,
  deleteAddress,
  loadAbout
};
