const Order = require('../../models/orderSchema');
const Product = require('../../models/productModel');
const loadOrder = async (req,res)=>{
    try {
    const session = req.session.user_id;
    const order = await Order.find({user:session})
    console.log(order);
    const name = req.session.name
    res.render('user/profileOrder',{session,name,order})
    } catch (error) {
        console.log(error);
    }
}

const cancelOrder = async (req, res) => {
    try {
      const id = req.body.id
      console.log(id)
      const order = await Order.findById(id)
      console.log("original order:", order)
        const newOrder = await Order.findByIdAndUpdate(id, { $set: { order_status: "cancelled" } },{new:true})
        // for (item of newOrder.items) {
        //   await Product.findByIdAndUpdate(item.productId, {
        //     $inc: {
        //       [`size.${item.size}`]: item.quantity,
        //       quantity: item.quantity
        //     }
        //   },{new:true})
        // }
          console.log(newOrder)
        if (newOrder) {
          res.json({ status: true })
        } else {
          res.json({ status: false })
        }
  
      } catch (err) {
      res.send(err)
    }
  }

module.exports={
    loadOrder,
    cancelOrder
}