const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const Wallet = require('../../models/walletModel')

const fs = require("fs");
const path = require('path')
const puppeteer = require("puppeteer");
const ejs = require("ejs");

const loadOrder = async (req,res)=>{
    try {
    const session = req.session.user_id;
    const order = await Order.find({user:session}).sort({order_date:-1}).exec()
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    const name = req.session.name
    res.render('user/profileOrder',{session, name: req.session.user_name,order,countCart})
    } catch (error) {
        console.log(error);
        res.render('error/404')
    }
}

const cancelOrder = async (req, res) => {
    try {
      const id = req.body.id
      const order = await Order.findById(id)
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

        for(const item of order.items){
            
          const product = await Product.findById(item.productId);
          const sizes = item.sizes
          for (let size of sizes.keys()) {

            if (size in product.sizes) {
              const currentSizeQuantity = product.sizes[size];
              const qty = sizes.get(size)
              const updatedSizeQuantity = currentSizeQuantity + qty;
    
              if (updatedSizeQuantity >= 0) {
                product.sizes[size] = updatedSizeQuantity;
                await product.save();
                await Product.findByIdAndUpdate(item.productId, {
                  $inc: {
                    stock: +qty
                  }
                })
              }
            }
          }
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
      res.render('error/404')
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
      res.render('user/orderDetails',{session, name: req.session.user_name,countCart,order,products,address})

    } catch (error) {
      console.log(error);
      res.render('error/404')
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
            wallet = new Wallet({
                user: order.user,
                balance: order.total,
                history: [{
                    type: "add",
                    amount: order.total,
                    newBalance: order.total
                }]
            })

            await wallet.save();

            order.order_status = "returned";
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
            
          const product = await Product.findById(item.productId);
          const sizes = item.sizes
          for (let size of sizes.keys()) {

            if (size in product.sizes) {
              const currentSizeQuantity = product.sizes[size];
              const qty = sizes.get(size)
              const updatedSizeQuantity = currentSizeQuantity + qty;
    
              if (updatedSizeQuantity >= 0) {
                product.sizes[size] = updatedSizeQuantity;
                await product.save();
                await Product.findByIdAndUpdate(item.productId, {
                  $inc: {
                    stock: +qty
                  }
                })
              }
            }
          }
        }


        if(wallet){
            res.send({success: true});
        }else{
            res.send({success: false});
        }
        
        
    } catch (error) {
        console.log(error);
        res.render('error/404')
    }
}

const orderDownload = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await Order.findById(orderId).populate([
      { path: "user" },
      { path: "items.productId" },
    ]);

    // Import necessary modules
    const path = require("path");
    const ejs = require("ejs");
    const puppeteer = require("puppeteer");

    // Load the EJS template
    const filePath = path.join(__dirname, "..", "..", "views/user/bill.ejs");
    const invoiceHtml = await ejs.renderFile(filePath, { order });

    // Function to generate PDF using Puppeteer
    const generatePDF = async () => {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(invoiceHtml);
      const pdfBuffer = await page.pdf();
      await browser.close();
      return pdfBuffer;
    };

    // Generate the PDF using Promise
    const pdfBuffer = await generatePDF();

    // Set response headers to force download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${orderId}.pdf"`);

    // Send the PDF to the client
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.render("error/500"); // Respond with an appropriate error page
  }
};


module.exports={
    loadOrder,
    cancelOrder,
    viewDetails,
    orderReturn,
    orderDownload
}