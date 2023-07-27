const Order = require('../../models/orderModel');
const User = require('../../models/userModel');
const Category = require('../../models/categoryModel');
const loadDashboard = async (req,res)=>{
    try {
        let filterValue = 30
        if(req.query.filter1){
          filterValue=parseInt(req.query.filter1)
        }
      
        const endDate = new Date(); 
        endDate.setDate(endDate.getDate() + 1); // Add 1 day to include today
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - filterValue);
      
        const daily = await Order.aggregate([
          {
            $match: {
                order_date: {
                $gte: startDate,
                $lt: endDate
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$order_date"
                }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
      
        const category = await Order.aggregate([
          {
            $lookup: {
              from: "products",
              localField: "items.productId",
              foreignField: "_id",
              as: "productData"
            }
          },
          {
            $unwind: "$productData"
          },
          {
            $group: {
              _id: "$productData.category",
              count: { $sum: 1 }
            }
          },
        ]);
        const cat = []
        for(id of category){
            let val= JSON.parse(JSON.stringify(
                await Category.findById(id._id,{name:1})
            ))
            val.count=id.count;
            cat.push(val)
        }
        // const cat = await
      
        const user = await User.aggregate([
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$created"
                }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ])
      console.log(cat);
        const orders = await Order.find()
        .populate({ path: 'user' })
        .sort({ order_date: -1 })
        .limit(5);
      
        const userCount= await User.countDocuments()
        const orderCount = await Order.countDocuments()
      
        res.render('admin/dashBoard', { daily , category:cat, user, orders, userCount, orderCount});
    } catch (error) {
        console.log(error);
    }
}

const loadSalesReport = async (req,res)=>{
    try {
        let yearly = await Order.aggregate([
            {
                $match: { order_status: { $eq: "delivered" } },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$delivery_date" },
                    },
                    items: { $sum: { $size: "$items" } },
                    total: { $sum: "$total" },
                    count: { $sum: 1 },
                },
            },
        ]);
            // console.log(yearly);
        res.render('admin/dashboardSales',{yearly})
    } catch (error) {
        console.log(error);
    }
}
module.exports={
    loadDashboard,
    loadSalesReport
}