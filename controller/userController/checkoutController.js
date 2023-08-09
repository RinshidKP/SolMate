const Address = require("../../models/addressModel");
const User = require("../../models/userModel");
const Cart = require('../../models/cartModel');
const Order = require('../../models/orderModel');
const Product = require('../../models/productModel')
const Coupon = require('../../models/couponModel')
const Wallet = require('../../models/walletModel')
const Razorpay = require('razorpay');
const session = require("express-session");

const loadCheckOutAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: session });
    const address = await Address.find({ user: session });

    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }

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
      name: req.session.name,
      user: userData,
      contact: contactAddress,
      main: mainAddress,
      secondary: secondaryAddress,
      address,
      countCart
    });
  } catch (error) {
    console.log(error);
  }
};

const addAddress = async (req, res) => {
  try {
    // const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id })
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
      buildingName: building,
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
    res.redirect("/checkout/address")
  } catch (error) {
    console.log(error);
  }
}

const checkoutProceed = async (req, res) => {
  try {
    const session = req.session.user_id;
    const addressId = req.query.addressId;
    const address = await Address.findOne({ _id: addressId })
    const cart = await Cart.findOne({ userId: session })
    const product = await Cart.findOne({ userId: session }).populate("products.productId");
    const productList = []
    const userwallet = await User.findById(session);
    let wallet = 0;
    if (userwallet.wallet) {
      wallet = await Wallet.findById(userwallet.wallet);
    }
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count+1
    }
    product.products.forEach((item) => {
      productList.push(item.productId)
    })
    res.render('user/checkOutPayment',
      {
        session,
        name: req.session.name,
        address,
        addressId,
        cart,
        wallet,
        productList,
        countCart
      })
  } catch (error) {
    console.log(error);
  }
}

const checkout = async (req, res) => {
  try {
    const userId = req.session.user_id;
    // console.log("Sorry Am Here Again");
    const cart = await Cart.findOne({ userId: userId }).populate("products.productId");
    const cartItems = cart.products;
    const {
      payment,
      addressId,
      couponId
    } = req.body;
    
    const sizes = cart.products.size;
    let value = 0
    const method = req.body.shippingOption;
    let totalPrice = req.body.totalPrice;
    if (method === 'fast') {
      totalPrice = parseInt(totalPrice) + 40;
    }
    let order;
    if(payment=="wallet"){
      let wallet = await Wallet.findOne({ user: userId });
      let balance = wallet.balance;
      console.log("Initial balance:", balance);
      if(balance<totalPrice){
        res.json({wallet:"noprice"})
        return;
      }
      console.log(couponId);
          if(wallet){
              let newBalance = balance - totalPrice;
              let history = {
                type: "subtract",
                amount: totalPrice,
                newBalance: newBalance,
              };
              wallet.balance = newBalance;
              wallet.history.push(history);
              const yes = await wallet.save();
              // console.log(history);
              // console.log(yes+'yesss');
              console.log(couponId);
              if (couponId) {
                  const coupon = await Coupon.findById(couponId);
                  const discount = parseInt(coupon.discount)
                  const total = totalPrice - discount;
                  const newOrder = new Order({
                    user: userId,
                    address: addressId,
                    items: cartItems,
                    quantity: value,
                    total: total,
                    size: sizes,
                    delivery: method,
                    payment_method: payment,
                    payment_status: "completed",
                    order_status: "pending"
                  })
                  order = await newOrder.save()
              } else {
                const newOrder = new Order({
                  user: userId,
                  address: addressId,
                  items: cartItems,
                  quantity: value,
                  total: totalPrice,
                  size: sizes,
                  delivery: method,
                  payment_method: payment,
                  payment_status: "completed",
                  order_status: "pending"
                })
                order = await newOrder.save()
              }
            }else{
              res.json({wallet:"false"})
              return;
            }
    }else{
    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (coupon) {
        const discount = parseInt(coupon.discount)
        const total = totalPrice - discount;
        const newOrder = new Order({
          user: userId,
          address: addressId,
          items: cartItems,
          quantity: value,
          total: total,
          size: sizes,
          delivery: method,
          payment_method: payment,
          payment_status: "pending",
          order_status: "pending"
        })
        order = await newOrder.save()
      }
    } else {
      const newOrder = new Order({
        user: userId,
        address: addressId,
        items: cartItems,
        quantity: value,
        total: totalPrice,
        size: sizes,
        delivery: method,
        payment_method: payment,
        payment_status: "pending",
        order_status: "pending"
      })
      order = await newOrder.save()
    }
  }
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      const sizes = item.sizes

      for (let size of sizes.keys()) {

        if (size in product.sizes) {
          const currentSizeQuantity = product.sizes[size];
          const qty = sizes.get(size)
          const updatedSizeQuantity = currentSizeQuantity - qty;

          if (updatedSizeQuantity >= 0) {
            product.sizes[size] = updatedSizeQuantity;
            await product.save();
            await Product.findByIdAndUpdate(item.productId, {
              $inc: {
                stock: -qty
              }
            })
          }
        }
      }
    }
    const orderId = order._id;
    await Cart.findOneAndDelete({ userId: userId })
    res.json({ response: true, orderId:orderId._id });
  } catch (error) {
    console.log(error);
  }

}

const razorpay = new Razorpay({ 
  key_id: process.env.KEY_ID, 
  key_secret: process.env.KEY_SECRET
 })

const payOnline = async (req, res) => {
  try {
    
    const userId = req.body.session;

    const user = await User.findOne({userId: userId})
   
    const method = req.body.shippingOption;
    let totalPrice = req.body.totalPrice;
   
    totalPrice *= 100;
    const options = {
      amount: totalPrice,
      currency: "INR",
      receipt: "rinshid26@gmail.com",
      payment_capture:1
    }

    razorpay.orders.create(options,
      (error,order)=>{
        if(!error){
          res.status(200).send({
            success: true,
            msg: 'Order Created',
            order_id: order.id,
            amount: totalPrice,
            key_id: "rzp_test_5QHbkyMVqrLFY8",
            name: user.username,
            email: user.email,
          })
          
        }else{
          res.status(400).send({success: false, msg: "something went wrong!"});
          console.log(error)
        }
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({error: "something went wrong"});
  }
}

const applyCoupon = async (req, res) => {
  try {
    const { couponName, addressId, totalPrice } = req.body;
    const coupon = await Coupon.findOne({ name: couponName });

    if (coupon) {

      if (totalPrice >= coupon.minAmount) {
  
        // const address = await addressModel.findOne({_id: addressId})
        // const cart = await Cart.findOne({userId: address.user});
        // let productList = [];
        // const product = await Cart
        // .findOne({userId: address.user})
        // .populate("items.productId");

        // product.items.forEach((item)=>{
        // productList.push(item.productId)
        // })
        res.json({ response: true, coupon: coupon })

      } else {
        res.json({ response: 'min' })
      }
    } else {
      res.json({ response: false })
    }
  } catch (error) {
    console.log(error);
  }
}

const orderSuccess = async (req, res) => {
  try {

    const order = await Order.findById(req.query.orderId).populate([
      { path: "user" },
      { path: "address" },
      { path: "items.productId" },
    ]);
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    const sizes = order.items.sizes
    const user = order.user;
    const address = order.address;
    const products = order.items;
    // console.log(typeof products);
    res.render('user/success', { order, session: req.session.user_id, name: req.session.name,countCart,user,address,products })
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  loadCheckOutAddress,
  addAddress,
  checkoutProceed,
  checkout,
  applyCoupon,
  orderSuccess,
  payOnline,
};