const Cart = require('../models/cartModel')

const countCart = async (req,res,next)=>{
    if(req.session&&req.session.user_id){
        Cart.findOne({ userId: req.session.user_id }).then((data) => {
            if (data) {
                if (data.products.length > 0) {
                    let lengths = data.products.length;
                    res.locals.count = lengths;
                    next();
                } else {
                    res.locals.count = 0;
                    next();
                }
            } else {
                res.locals.count = 0;
                next();
            }
    })
    }  else {
        next();
    }
};

module.exports = {countCart}