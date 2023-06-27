const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const userModel = require("../../models/userModel");

const hashPassword = async (password) => {
  try {
    const hashpassword = await bcrypt.hash(password, 10);
    return hashpassword;
  } catch (error) {
    console.log(error);
  }
};

const mailStructure = async (savedUser) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  var message = {
    from: process.env.EMAIL_USER,
    to: savedUser.email,
    subject: "Verify Your Mail",
    text: "Hello Dear",
    html: `<p>To verify your <b>SolMate</b> account <a href="http://localhost:${process.env.PORT}/signup/success/?id=${savedUser._id}">click here<a></p>`,
  };

  const info = await transporter.sendMail(message);
  console.log("message send : ", info.messageId);
};

const loadSignup = (req, res) => {
  try {
    res.render("auth/signup", { message: null });
  } catch (error) {
    console.error(error);
  }
};
const loadlogin = (req, res) => {
  try {
    res.render("auth/login", { message: null });
  } catch (error) {
    console.log(error);
  }
};
const verifyEmail = (req, res) => {
  try {
    res.render("auth/verifyEmail", { message: null });
  } catch (error) {
    console.log(error);
  }
};

const emailVerification = async (req, res) => {
  try {
    userId = req.query.id;
    await userModel.findByIdAndUpdate(req.query.id, {
      $set: { isVerified: true },
    });
    res.redirect("/login");
  } catch (error) {
    console.log(error);
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
        const sPass = await hashPassword(password);

        const newUser = new userModel({
          name: name,
          username: username,
          email: email,
          password: sPass,
        });
        const savedUser = await newUser.save();
        await mailStructure(savedUser);
        res.render("auth/verifyEmail");
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const otpVerify = async (req, res) => {
  try {
    const secret = req.cookies["otpHash"];
    const enteredOtp = req.body.otp;
    const validateOtp = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: enteredOtp,
      digits: 6,
    });
    
    if(validateOtp){
      res.render("auth/otpAuth");
    }
  } catch (error) {
    console.log(error);
  }
};

const otpGenerate = () => {
  const secret = speakeasy.generateSecret({ length: 20 });
      console.log(secret);
  const code = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
    digits: 6,
    step: 300,
  });
  console.log(code);
  return { code, secret };
};

const sendOtp = async (user) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const otpCode = otpGenerate();

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "OTP Verification",
    text: "Please Dont Share This Code With Others",
    html: `<p>Your OTP is <b>${otpCode.code}</b></p>`,
  });

  return otpCode.secret;
};

const loginVerify = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const userData = await userModel.findOne({ username: username });
    const email = userData.email;

    if (userData) {
      const passMath = await bcrypt.compare(password, userData.password);
      if (passMath) {
        if (userData.isAdmin) {
          req.session.admin_id = userData._id;
          res.redirect("/admin/dashboard");
        } else {
          if (userData.isVerified && userData.isAccess) {
            const option = {
              maxAge: 3000 * 60,
              httpOnly: true,
            };
            const secret = await sendOtp(userData);
            res.cookie("otpHash", secret.base32, option);
            res.render("auth/otpAuth");
          }else{
            res.render('auth/login',{message:"Access Denied"})
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
  }
};
module.exports = {
  loadSignup,
  loadlogin,
  verifyEmail,
  createUser,
  hashPassword,
  emailVerification,
  otpVerify,
  loginVerify,
};
