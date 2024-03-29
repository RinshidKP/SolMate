const Order = require('../../models/orderModel')
const loadOrder = async(req,res)=>{
    try {
        const orders = await Order.find().sort({order_date:-1});
        const users = await Order.find().populate("user");
        res.render('admin/order',{orders,users})
    } catch (error) {
        console.log(error);
        res.render('error/404')
    }
}

const statusChange = async (req, res)=>{
    try {
      const {
        id,
        status
    } = req.body;

    if(status !== "None"){
        await Order.findByIdAndUpdate(id,{order_status: status});
    }

    const order = await Order.findOne({_id: id});

    res.json({data: order})
    } catch (error) {
      console.log(error);
      res.render('error/404')
    }
}

const viewOrder = async (req, res) => {
    try {
      const order = await Order.findById(req.query.orderId).populate([
        { path: "user" },
        { path: "address" },
        { path: "items.productId" },
      ]);

      const user = order.user;
      const products = order.items;
      const address = order.address;
      res.render("admin/editOrders", {
        order,
        user,
        address,
        products
      });
    } catch (err) {
      res.send(err);
      res.render('error/404')
    }
  };

module.exports={
    loadOrder,
    viewOrder,
    statusChange
}