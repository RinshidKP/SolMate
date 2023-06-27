const express = require('express');
const cookieParser = require('cookie-parser')
require('dotenv').config();
const mongoose = require('mongoose')


//Routes
const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/admin');


const fileUploader = require('express-fileupload');
const session = require('express-session');
const cloudinary = require('cloudinary').v2;

const app = express();

//Registering View Engine
app.set('view engine','ejs');



mongoose
.connect(process.env.DATABASE_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
    .then(()=>{
        console.log("Connected To MongoDB");
    })
    .catch((error)=>{
        console.error('Error connecting to mongoDB',error);
    })

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})


// setting Middlewares
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())
app.use(fileUploader({
    useTempFiles:true ,
    limits:{fileSize:50* 2024 *1024}
}))
app.use(session({
    secret:process.env.SECRET_KEY,
    resave:false,
    saveUninitialized:true
}))
app.use(express.static('public'));


// Setting Routes
app.use('/',userRouter);
app.use('/admin',adminRouter);



app.listen(process.env.PORT,()=>console.log("server started with port number "+process.env.PORT));