const Coupon = require("../../models/couponModel");

const loadCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.render("admin/coupon", { coupons });
  } catch (error) {
    console.log(error);
  }
};

const loadAddCoupon = (req, res) => {
  try {
    res.render("admin/addCoupon");
  } catch (error) {
    console.log(error);
  }
};

const addCoupon = async (req, res) => {
  try {
    const { discount, expiryDate, minAmount } = req.body;
    let name = req.body.name.toUpperCase();

    const couponExist = await Coupon.findOne({ name: name });

    if (couponExist) {
      res.json({ response: false });
    } else {
      const newCoupon = new Coupon({
        name,
        expiryDate,
        discount,
        minAmount,
      });
      await newCoupon.save();
      res.redirect("/admin/coupons");
    }
  } catch (error) {
    console.log(error);
  }
};

const loadEditCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const coupon = await Coupon.findById(id);
    const expDate = coupon.expiryDate;
    res.render("admin/editCoupon", { coupon,expDate });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadCoupon,
  loadAddCoupon,
  addCoupon,
  loadEditCoupon,
};
