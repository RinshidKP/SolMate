const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        address: {
            type: Object,
            required: true,
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },
                   sizes: {
                    type: Map,
                    of: Number,
                  },
                totalPrice: {
                    type: Number,
                },
            },
        ],
        quantity: {
            type: Number,
            required:true,
        },
        total: {
            type: Number,
            required:true,
        },
        delivery: {
            type: String,
        },
        shipping_method: {
            type: String,
        },
        order_status: {
            type: String,
        },
        payment_status: {
            type: String,
        },
        payment_method: {
            type: String,
        },
        order_date: {
            type: Date,
            default: Date.now(),
        },
        delivery_date:{
            type:Date,
        },
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "coupon",
        },
        razorpay_order_id:{
            type:String,
        }
    },
);
const orderModel = mongoose.model("order", orderSchema);

module.exports = orderModel;