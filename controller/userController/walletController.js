const Cart = require("../../models/cartModel");
const User = require("../../models/userModel");
const Wallet = require("../../models/walletModel");

const loadWallet = async (req, res)=>{
    try {

        const userId = req.session.user_id;

        const user = await User.findById(userId);
        const wallet = await Wallet.findOne({user: userId});
        const cart = await Cart.findOne({userId: userId});
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