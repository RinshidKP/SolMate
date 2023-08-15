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
        const orders = await Order.find()
        .populate({ path: 'user' })
        .sort({ order_date: -1 })
        .limit(5);
      
        const userCount= await User.countDocuments()
        const orderCount = await Order.countDocuments()
      
        res.render('admin/dashBoard', { daily , category:cat, user, orders, userCount, orderCount});
    } catch (error) {
        console.log(error);
        res.render('error/404')
    }
}


//yearly
const loadSalesReport = async (req, res)=>{
  try {

      const yearly = await Order.aggregate([
          {
              $match: { order_status: {$eq: "delivered"}}
          },
          {
              $group: {
                  _id: {
                      year: {$year: "$order_date"},
                  },
                  items: {$sum: { $size: "$items" }},
                  count: {$sum: 1},
                  total: {$sum: "$total"}
              }
          }
          
      ]);

      res.render('admin/dashboardSales',{yearly});
      
  } catch (error) {
      console.log(error);
      res.render('error/404')
  }
}

//monthly
const monthlySaleReport = async (req, res)=>{
  try {

      const sales = await Order.aggregate([
          {
              $match: { order_status: {$eq: "delivered"}}
          },
          {
              $group: {
                  _id: {
                      month: {$month: "$order_date"},
                  },
                  items: {$sum: { $size: "$items" }},
                  count: {$sum: 1},
                  total: {$sum: "$total"}
              }
          },
          {$sort: {"_id.month": 1}},
          
      ]);

      const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
      ];

      const monthlySales = sales.map((sale)=>{
          let oneSale = {...sale};
          oneSale._id.month = months[oneSale._id.month - 1]
          return oneSale;
      })
      res.json({ monthlySales, error: false })

  } catch (error) {
      console.log(error);
      res.render('error/404')
  }
}

const dailySalesReport = async (req, res)=>{
  try {

      const dailySales = await Order.aggregate([
          {
              $match: { order_status: {$eq: "delivered"}}
          },
          {
              $group: {
                  _id: {
                      Year: {$year: "$order_date"},
                      Month: {$month: "$order_date"},
                      Day: {$dayOfMonth: "$order_date"}
                  },
                  items: {$sum: { $size: "$items" }},
                  count: {$sum: 1},
                  total: {$sum: "$total"}
              }
          },
          {
              $sort: {"_id.Year": -1,"_id.Month": 1,"_id.Day": 1}
          },
          
      ]);
      res.json({dailySales, error: false})
      
  } catch (error) {
      console.log(error);
      res.render('error/404')
  }
}

const byDateSaleReport = async (req, res)=>{
  try {

      const { dateRange } = req.body;

      const date = dateRange.split("-");
      const startDate = date[0].trim();
      const endDate = date[1].trim();

      
      const [startDay, startMonth, startYear] = startDate.split('/');
      const [endDay, endMonth, endYear] = endDate.split('/');
      
      const formattedStartDate = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}T00:00:00.000Z`;
      const formattedEndDate = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}T00:00:00.000Z`;
      

      const byDateSales = await Order.aggregate([
          {
              $match: {
                  order_status: "delivered",
                  order_date: {
                      $gte: new Date(formattedStartDate), 
                      $lte: new Date(formattedEndDate)
                  }
              }
          },
          {
              $group: {
                  _id: {
                      Year: {$year: "$order_date"},
                      Month: {$month: "$order_date"},
                      Day: {$dayOfMonth: "$order_date"}
                  },
                  items: {$sum: { $size: "$items" }},
                  count: {$sum: 1},
                  total: {$sum: "$total"}
              }
          },
          {
              $sort: {"_id.Year": -1,"_id.Month": 1,"_id.Day": 1}
          },
      ])

      res.json({byDateSales, error: false});
      
  } catch (error) {
      console.log(error);
      res.render('error/404')
  }
}
module.exports={
    loadDashboard,
    loadSalesReport,
    monthlySaleReport,
    dailySalesReport,
    byDateSaleReport
}