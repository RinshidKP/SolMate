const User = require("../../models/userModel");
const category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const auth = require("../authController/authController");
// const address = require('../../models/addressModel');
const addressModel = require("../../models/addressModel");



const logout =(req,res)=>{
  try {
      
      req.session.admin_id = null;
      res.redirect('/login');

  } catch (error) {
      console.log(error);
  }
}
const loadCustomer = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1; // Get the current page from the query parameter
    const itemsPerPage = 10; // Adjust the number of items per page as needed

    // Calculate the skip and limit values based on the current page and items per page
    const skip = (currentPage - 1) * itemsPerPage;
    const limit = itemsPerPage;
    let search = "";
    // Retrieve the paginated user data from the database
    const userData = await User.find({ isAdmin: false,$or: [
      { name: { $regex: new RegExp(search, 'i') } },
      { email: { $regex: new RegExp(search, 'i') } }
    ] })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({ isAdmin: false }); // Get the total number of users

    const totalPages = Math.ceil(totalUsers / itemsPerPage); // Calculate the total number of pages

    const startIndex = skip + 0; // Calculate the start index for displaying sl.no

    res.render("admin/customers", {
      user: userData,
      currentPage,
      totalPages,
      startIndex,
      endIndex: skip + userData.length, // Calculate the end index for displaying sl.no
    });
  } catch (error) {
    console.log(error);
    // Handle error appropriately (e.g., display an error page or redirect to an error route)
  }
};

const loadEditUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findOne({ _id: id });
    res.render("admin/editCustomer", { message: null, user: userData });
  } catch (error) {
    console.log(error);
  }
};

const loadhome = async (req, res) => {
  try {
    
      const categories = await category.find();
      const products = await Product.find({ isActive: true });
      const session = req.session.user_id;
      res.render("user/home", {
        categories: categories,
        products: products,
        session: session,
        name: req.session.user_name,
      });
      console.log(session);
    
  } catch (error) {
    console.log(error);
  }
};

const loadProduct = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = 5;
    const skip = (currentPage - 1) * itemsPerPage;
    const limit = itemsPerPage;
    const productData = await Product.find().skip(skip).limit(limit);

    const totalProduct = await Product.countDocuments();

    const totalPages = Math.ceil(totalProduct / itemsPerPage);

    const startIndex = skip + 0;
    const stock = await Product.find();
    const categories = await category.find();

    const products = await Product.find();
    const session = req.session.user_id;
    res.render("user/shop", {
      session,
      products,
      name: req.session.user_name,
      currentPage,
      totalPages,
      startIndex,
      endIndex: skip + productData.length,
    });
  } catch (error) {
    console.log(error);
  }
};

const viewProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const categories = await category.find();
    const productData = await Product.findOne({ _id: id });
    const session = req.session.user_id;
    // console.log(productData);
    res.render("user/productDetails", {
      session,
      name: req.session.user_name,
      products: productData,
      categories,
    });
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (req, res) => {
  try {
    let access = req.body.isAccess;
    const id = req.query.id;
    await User.findByIdAndUpdate(id, { $set: { isAccess: access } });
    res.redirect("/admin/customer");
  } catch (error) {
    console.log(error);
  }
};

const loadProfile = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });
    console.log(userData);
    res.render("user/profile", {
      session,
      name: req.session.user_name,
      user: userData,
    });
  } catch (error) {
    console.log(error);
  }
};

const confirmMail = async (req, res) => {
  const email = req.body.email;
  const userData = await userModel.findOne({ email: email });
  if (userData) {
    res.render("/otp");
  } else {
    res.render("auth/forgotPassword", { message: "Incorrect Email Address" });
  }
};

const loadEditprofile = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });
    // console.log(userData);
    res.render("user/editProfile", {
      session,
      name: req.session.user_name,
      user: userData,
      message: null,
    });
  } catch (error) {
    console.log(error);
  }
};
const updateEditprofile = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ username: req.body.username });
    if (userData) {
      res.render("user/editProfile", {
        session,
        name: req.session.user_name,
        user: userData,
        message: "Username Already Exists",
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
  }
};

const loadUserPassword = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });
    // console.log(userData);
    res.render("auth/updatePassword", {
      localAction: "/profile/editPassword",
      session,
      name: req.session.user_name,
      user: userData,
      message: null,
    });
  } catch (error) {}
};
const updateUserPassword = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ username: req.body.username });
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    console.log(password);
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
    res.render("user/profileAddress", {
      session,
      name: req.session.user_name,
      user: userData,
      contact,
      main,
      secondary,
    });
  } catch (error) {
    console.log(error);
  }
};

const loadAddAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    const type = req.query.type;
    const userData = await User.findOne({ _id: req.session.user_id });
    res.render("user/addAddress", {
      id: session,
      session,
      name: req.session.user_name,
      user: userData,
      type,
    });
  } catch (error) {
    console.log(error);
  }
};
const saveAddress = async (req, res) => {
  try {
    // const session = req.session.user_id;
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
    // console.log(newAddress);
    res.redirect("/user/profileAddress");
  } catch (error) {
    console.log(error);
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    const { type, id } = req.query;
    const address = await addressModel.findOne({ _id: id });
    // console.log(address);
    // const type = req.query.type
    const userData = await User.findOne({ _id: req.session.user_id });
    res.render("user/editAddress", {
      session,
      name: req.session.user_name,
      user: userData,
      type,
      address,
    });
  } catch (error) {
    console.log(error);
  }
};

const saveEditAddress = async (req, res) => {
  try {
    const addressId = req.query.addressId;
    // console.log('uju',addressId);
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
    console.log(addressModel);
    res.redirect("/user/profileAddress");
  } catch (error) {
    console.log(error);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const id = req.query.id;
    await addressModel.deleteOne({ _id: id });
    res.json({ response: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadCustomer,
  loadEditUser,
  updateUser,
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
  logout,
};
