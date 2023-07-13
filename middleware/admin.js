const isLogin = (req, res, next)=>{
    try {
        if(req.session.admin_id){
            next();
        }else{
            res.redirect('/login');
        }

    } catch (error) {
        console.log(error.message);
    }
}



module.exports ={
    isLogin,

}