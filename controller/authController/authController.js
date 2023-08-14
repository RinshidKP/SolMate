
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const userModel = require("../../models/userModel");

const secretHash = async (password) => {
  try {
    const hashpassword = await bcrypt.hash(password,10);
    return hashpassword;
  } catch (error) {
    console.log(error);
  }
};


const loadSignup = (req, res) => {
  try {
    res.render("auth/signup", { message: null });
  } catch (error) {
    console.error(error);
    res.render('error/404')
  }
};

const loadlogin = (req, res) => {
  try {
    const oldRoute = req.query.oldRoute;
    res.render("auth/login", { message: null,oldRoute });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const createUser = async (req, res) => {
  try {
    console.log(req.body);
    const name = req.body.fname;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const userData = await userModel.findOne({ email: email });

    if (userData) {
      res.render("auth/signup", { message: "Email Already Exists" });
    } else {
      const existingUser = await userModel.findOne({ username: username });
      if (existingUser) {
        res.render("auth/signup", { message: "Username Already Exists" });
      } else {
        const sPass = await secretHash(password);
        
        const newUser = new userModel({
          name: name,
          username: username,
          email: email,
          password: sPass,
        });
        
        const otpHash = await sendOtp(newUser);
        const option = {
          maxAge: 300000,
          httpOnly: true,
        };
        const savedUser = await newUser.save();
        res.cookie('otpHash', otpHash, { maxAge: 120000, httpOnly: true }); 
        const User=savedUser._id;
        res.cookie('newUser', User, { maxAge: 120000, httpOnly: true }); 
        res.redirect("/otp");
      }
    }
  } catch (error) {
    console.error(error);
    res.render('error/404')
  }
};

const otpVerify = async (req, res) => {
  try {
    const otpHash = req.cookies.otpHash;
    const validateOtp = await bcrypt.compare(req.body.otp,otpHash)
    console.log(validateOtp);
    
    if(validateOtp){
       await userModel.findByIdAndUpdate(req.cookies.newUser,{isVerified:true})
      res.redirect("/login");
    }else{
      res.send("validation failed")
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const otpGenerate = async () => {
  try {
    const digits = "0123456789";
          let OTP =  '';
          for(let i=0;i<4;i++){
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        const secret = await secretHash(OTP);
        return {secret, OTP}
  } catch (error) {
    console.error(error);
  }
  };

const sendOtp = async (user) => {
try {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    requireTLS:true
  });

  const otpCode = await otpGenerate();
  // console.log(otpCode.secret);

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "OTP Verification",
    text: "Please Dont Share This Code With Others",
    html: `<!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - SolMate</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha2/css/bootstrap.min.css">
      <style>
        body {
          background-color: #f8f9fa;
          font-family: Arial, sans-serif;
        }
    
        .container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }
    
        .bg-light {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          padding: 20px;
        }
    
        h1 {
          font-size: 24px;
          color: #333333;
          margin-top: 0;
          margin-bottom: 30px;
        }
    
        p {
          font-size: 16px;
          color: #555555;
          line-height: 1.5;
          margin-bottom: 20px;
        }
    
        .text-center {
          text-align: center;
        }
    
        .mt-4 {
          margin-top: 20px;
        }
    
        .mb-4 {
          margin-bottom: 20px;
        }
    
        .rounded {
          border-radius: 6px;
        }
    
        .company-info {
          font-size: 14px;
          color: #999999;
          margin-top: 40px;
        }
      </style>
    </head>
    
    <body>
      <div class="container">
        <div class="bg-light rounded">
          <h1 class="text-center">SolMate</h1>
          <p>Dear ${user.name},</p>
          <p>Thank you for signing up with SolMate! To complete your registration, please enter the following One-Time Password (OTP) on our website:</p>
          <h2 class="text-center mt-4">Your OTP: <b>${otpCode.OTP}</b></h2>
          <p>If you did not sign up for an account with SolMate, please disregard this email.</p>
          <p>Thank you for choosing SolMate. We look forward to providing you with the latest footwear styles and trends!</p>
        </div>
        <div class="text-center company-info">
          <p>Company Inc, 3 Abbey Road, San Francisco CA 94102</p>
        </div>
      </div>
    </body>
    
    </html>
    `
  });

  return otpCode.secret;
} catch (error) {
    console.log(error);
}
};

const loginVerify = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const userData = await userModel.findOne({ username: username });

    if (userData) {
      const passMath = await bcrypt.compare(password, userData.password);
      if (passMath) {
        if (userData.isAdmin) {
          req.session.admin_id = userData._id;
          res.redirect("/admin/dashboard");
        } else {
          if(!userData.isVerified){
            let otpHash = await sendOtp(userData)
            res.cookie('otpHash', otpHash, { maxAge: 120000, httpOnly: true }); 
            const newUser=userData._id;
            res.cookie('newUser', newUser, { maxAge: 120000, httpOnly: true }); 
            res.render('auth/otpAuth',{localAction:"/otp"})
          }else{
            if (userData.isAccess) {   
              req.session.user_id=userData._id
              req.session.user_name=userData.name
              // console.log(req.session);
              console.log("am old route "+req.body.oldRoute);
              const newRoute = req.body.oldRoute
              if(newRoute){
                res.redirect(`/product/shop?id=${newRoute}`)
              } else {
                res.redirect("/");
              }  
            }else{
              res.render('auth/login',{message:"Access Denied"})
            }
          }
        }
      }else{
        res.render('auth/login',{message:"Incorrect Passsword"})
      }
    }else{
      res.render('auth/login',{message:"Incorrect Passsword"})
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const logout=(req,res)=>{
  try {
      
      req.session.user_id = null;
      res.redirect('/login');

  } catch (error) {
      console.log(error);
      res.render('error/404')
  }
}

const loadOtp = (req,res)=>{
  try {
    res.render('auth/otpAuth',{localAction:"/otp"})
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
}

const loadForgot = async (req,res)=>{
  try {
    res.render('auth/forgotPassword',{message:null})
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
}

const loadChangePassword = async (req,res)=>{
  try {
    res.render('auth/updatePassword',{localAction:"/forgot/submited",message:null})
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
}

const otpPasswordChange = async (req, res) => {
  try {
    const otpHash = req.cookies.otpHash;
    // otpSecret=otpSecret
    const otp = req.body.otp
    // otp = otp.toString()
    // console.log( otpSecret);
    // console.log(typeof otp);
    
    const validateOtp = await bcrypt.compare(otp,otpHash)
    console.log(validateOtp);
    
    if(validateOtp){
      res.redirect("/forgot/submit");
    }else{
      res.send("validation failed")
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const forgotPassword = async (req,res)=>{
  try {
    const email = req.body.email;
    const userData = await userModel.findOne({email:email})

    if(userData){
      let otpHash = await sendOtp(userData)
      res.cookie('otpHash', otpHash, { maxAge: 120000, httpOnly: true }); 
        res.cookie('userId',userData._id,{httpOnly:true})
        res.render('auth/otpAuth',{localAction:"/forgot/submit"});
    }else{
        res.render('auth/forgotPassword',{message:"Incorrect Email Address"})
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
}


const changePassword = async (req,res)=>{
  try {
    const password = req.body.password
    console.log(password);
    const userId = req.cookies['userId']
    const sPass = await secretHash(password)
    await userModel.findByIdAndUpdate(userId,{$set:{
      password:sPass
    }})
    res.redirect('/login')

  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
}

module.exports = {
  loadSignup,
  loadlogin,
  createUser,
  secretHash,
  otpVerify,
  loginVerify,
  loadOtp,
  logout,
  loadForgot,
  forgotPassword,
  otpPasswordChange,
  changePassword,
  loadChangePassword
};
