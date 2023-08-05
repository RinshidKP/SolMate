const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const Wallet = require('../../models/walletModel')
const loadOrder = async (req,res)=>{
    try {
    const session = req.session.user_id;
    const order = await Order.find({user:session}).sort({order_date:-1}).exec()
    // console.log(order);
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    const name = req.session.name
    res.render('user/profileOrder',{session,name,order,countCart})
    } catch (error) {
        console.log(error);
    }
}

const cancelOrder = async (req, res) => {
    try {
      const id = req.body.id
      console.log(id)
      const order = await Order.findById(id)
      // console.log("original order:", order)
      if(order.payment_method=="online"||order.payment_method=="wallet"){
        const wallet = await Wallet.findOne({user: order.user});
        if(wallet){
          let balance = wallet.balance;
        const newBalance = balance + order.total;
        const history = {
            type: "add",
            amount: order.total,
            newBalance: newBalance,
        }

        wallet.balance = newBalance;
        wallet.history.push(history);
        wallet.save();
        }
        }

        const newOrder = await Order.findByIdAndUpdate(id, { $set: { order_status: "cancelled" } },{new:true})
        if (newOrder) {
          res.json({ status: true })
        } else {
          res.json({ status: false })
        }
  
      } catch (err) {
      res.send(err)
    }
  }

  const viewDetails = async (req,res)=>{
    try {
      const session = req.session.user_id;
      const orderId = req.query.id
      const order = await Order.findById(orderId).populate([
        { path: "user" },
        { path: "address" },
        { path: "items.productId" },
      ]);;
      let countCart= 0;
      if(req.session.user_id){
        countCart=res.locals.count
      }
      const products = order.items;
      const address = order.address;
      res.render('user/orderDetails',{session,name: req.session.name,countCart,order,products,address})

    } catch (error) {
      console.log(error);
    }
  }

  const orderReturn = async (req, res)=>{
    try {

        const {
            orderId
        } = req.body;

        const order = await Order.findById(orderId).populate("items");
        let wallet = await Wallet.findOne({user: order.user});
        
        if(!wallet){
            wallet = new walletModel({
                user: order.user,
                balance: order.total,
                history: [{
                    type: "add",
                    amount: order.total,
                    newBalance: order.total
                }]
            })

            await wallet.save();

            order.order_status = "cancelled";
            await order.save();

        }else{
            let balance = wallet.balance;
            let newBalance = balance + order.total;
            let history = {
                type: "add",
                amount: order.total,
                newBalance: newBalance
            }

            wallet.balance = newBalance;
            wallet.history.push(history);
            await wallet.save();

            order.order_status = "cancelled";
            await order.save();
        }

        for(const item of order.items){
            
            await productModel.updateOne({_id: item.product },
                {
                    $inc: {quantity: item.quantity}
                })
    
        }


        if(wallet){
            res.send({success: true});
        }else{
            res.send({success: false});
        }
        
        
    } catch (error) {
        console.log(error);
    }
}

module.exports={
    loadOrder,
    cancelOrder,
    viewDetails,
    orderReturn
}