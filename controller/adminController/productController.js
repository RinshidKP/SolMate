const category = require("../../models/categoryModel");
const product = require("../../models/productModel");
const multipleimages = require("../../utilities/uploadImage");


const loadAddProduct = async (req,res) => {
    try {
        const categories= await category.find()
        res.render('admin/addProduct',{message:null,category:categories})
    } catch (error) {
        console.log(error);
    }
}

const addProduct = async (req,res) => {
    try {
        const name = req.body.name;
        const category = req.body.category;
        let stock = req.body.stock;
        let price = req.body.price;
        const blurb = req.body.blurb;
        const color = req.body.color;
        const size = req.body.size;
        const description = req.body.description;

        price = parseFloat(price)
        stock = parseInt(stock)

        // const images = req.files['image[]'];
        const images = req.files.image

        // console.log(images);

        const urlList = await multipleimages(images);
        // console.log(urlList);

        const newProducts = new product({
            name:name,
            category:category,
            price:price,
            blurb:blurb,
            description:description,
            color:color,
            sizes:size,
            stock:stock,
            image:urlList
        })
        await newProducts.save();
        res.redirect('/admin/product')
        
    } catch (error) {
        console.log(error);
    }
}



const loadProduct = async (req,res) => {
    try {
        const stock = await product.find()
        
        res.render('admin/product',{stock:stock})
    } catch (error) {
        console.log(error);
    }
}

const loadEditProduct = async (req,res)=> {
    try {
        const id = req.query.id;
        const stock = await product.findOne({_id:id})
        const categories = await category.find()
        res.render('admin/editProduct',{stock:stock,category:categories});
    } catch (error) {
        console.log(error);
    }
}

const updateProduct = async (req,res)=>{
    try {
        const id = req.query.id;
        const name = req.body.name;
        const category = req.body.category;
        const price = req.body.price;
        const stock = req.body.stock;
        const sizes = req.body.size;
        const color = req.body.color;
        const blurb = req.body.blurb;
        const description = req.body.description;
        await product.findByIdAndUpdate(id,{$set:{
            name:name,
            category:category,
            price:price,
            stock:stock,
            sizes:sizes,
            color:color,
            blurb:blurb,
            description:description
        }})
        res.redirect('/admin/product');
    } catch (error) {
        console.log(error);
    }
}
const deleteProduct = async (req, res)=>{
    try {
        const id = req.query.id;

        // console.log(id);
        
        await product.deleteOne({_id: id});
        res.redirect('/admin/product');
        
    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    addProduct,
    loadProduct,
    loadAddProduct,
    loadEditProduct,
    updateProduct,
    deleteProduct,
}