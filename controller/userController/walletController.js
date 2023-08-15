const Cart = require("../../models/cartModel");
const User = require("../../models/userModel");
const Wallet = require("../../models/walletModel");
// const Category = require('../../models/categoryModel')

const loadWallet = async (req, res)=>{
    try {

        const userId = req.session.user_id;

        const user = await User.findById(userId);
        console.log(user);
        const wallet = await Wallet.findOne({user: userId});
        const cart = await Cart.findOne({userId: userId});

        // const category = await Category.find();
        let countCart= 0;
        if(req.session.user_id){
          countCart=res.locals.count
        }

        res.render("user/wallet",{session: userId,name: req.session.user_name, user, wallet,countCart, cart});
        
    } catch (error) {
        console.log(error);
        res.render('error/404')
    }
}


module.exports = {
    loadWallet,
}