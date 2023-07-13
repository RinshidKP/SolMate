
const Address = require("../../models/addressModel");
const User = require("../../models/userModel");
const Cart = require('../../models/cartModel');
const Order = require('../../models/orderSchema');
const { findOneAndDelete } = require("../../models/categoryModel");
// const Category = require('../../models/categoryModel')
// const Product = require('../../models/productModel')

const loadCheckOutAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: session });
    const address = await Address.find({ user: session });

      const method = req.query.method;

    const contactAddress = await Address.findOne({
      user: session,
      type: "contact",
    });
    const mainAddress = await Address.findOne({ user: session, type: "main" });
    const secondaryAddress = await Address.find({
      user: session,
      type: "secondary",
    });

    res.render("user/checkOutAddress", {
      session,
      name:req.session.name,
      user: userData,
      contact: contactAddress,
      main: mainAddress,
      secondary: secondaryAddress,
      address,
      method,
    });
  } catch (error) {
    console.log(error);
  }
};

const addAddress = async (req,res)=>{
    try {
        // const session = req.session.user_id;
        const userData = await User.findOne({_id:req.session.user_id})
        const { 
            building,
            street, 
            city,
            state,
            country,
            type,
        } = req.body;

    let pincode = parseInt(req.body.pincode);
    let phonenumber = parseInt(req.body.phone);

    const newAddress = new Address({
        buildingName:building,
        street,
        city,
        state,
        pincode,
        country,
        phonenumber,
        user: userData._id,
        type,
    })

    await newAddress.save();
    // console.log(newAddress);
        res.redirect("/checkout/address")
    } catch (error) {
        console.log(error);
    }
}

const checkoutProceed = async (req,res)=>{
  try {
    const session = req.session.user_id;
    const addressId = req.query.addressId;
    const method = req.query.method;
    const address = await Address.findOne({_id:addressId})
    const cart = await  Cart.findOne({userId:session})
    const product = await  Cart.findOne({userId:session}).populate("products.productId");
    const productList =[]
    product.products.forEach((item)=>{
      productList.push(item.productId)
  })

    console.log(method);

    res.render('user/chechOutPayment',
    {
      session,
      name:req.session.name,
      address,
      addressId,
      cart,
      productList,
      method
    })
  } catch (error) {
    console.log(error);
  }
}

const checkout = async (req, res)=>{
  const userId = req.session.user_id;

  const cart = await Cart.findOne({userId:userId})
  const cartItems= cart.products;
  console.log(req.body);
  const {
      payment,
      addressId,
  } = req.body;
  const sizes = cart.products.size;
  const method =req.body.method;
  let totalPrice = req.body.totalPrice;
  if (method === 'fast') {
    totalPrice = parseInt(totalPrice) + 40;
  }

  const newOrder = new Order({
    user:userId,
    address:addressId,
    items:cartItems,
    total:totalPrice,
    size:sizes,
    delivery:method,
    payment_method:payment,
    payment_status: "pending",
    order_status: "pending"
  })
  await newOrder.save()

  await Cart.findOneAndDelete({userId:userId})

  res.redirect('/user');

}

module.exports = {
  loadCheckOutAddress,
  addAddress,
  checkoutProceed,
  checkout
};
