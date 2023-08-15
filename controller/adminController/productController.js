const category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const {multipleimages,deleteImage,imageUpload} = require("../../utilities/uploadImage");

const loadAddProduct = async (req, res) => {
  try {
    const categories = await category.find();

    res.render("admin/addProduct", { message: null, category: categories });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const addProduct = async (req, res) => {
  try {
    const name = req.body.name;
    let price = req.body.price;
    const blurb = req.body.blurb;
    const color = req.body.color;
    const description = req.body.description;
    const category = req.body.category;
    let size6 = req.body.size6 || 0;
    let size7 = req.body.size7 || 0;
    let size8 = req.body.size8 || 0;
    let size9 = req.body.size9 || 0;
    let size10 = req.body.size10 || 0;
    let size11 = req.body.size11 || 0;
    let size12 = req.body.size12 || 0;
    let size13 = req.body.size13 || 0;
    let size14 = req.body.size14 || 0;
    let size15 = req.body.size15 || 0;

    price = parseInt(price);
    size6 = parseInt(size6);
    size7 = parseInt(size7);
    size8 = parseInt(size8);
    size9 = parseInt(size9);
    size10 = parseInt(size10);
    size11 = parseInt(size11);
    size12 = parseInt(size12);
    size13 = parseInt(size13);
    size14 = parseInt(size14);
    size15 = parseInt(size15);


    let stocks=size6+size7+size8+size9+size10+size11+size12+size13+size14+size15
    stocks= parseInt(stocks)
    const images = req.files;
    const urlList = await multipleimages(images);
    const newProducts = new Product({
      name: name,
      category: category,
      price: price,
      blurb: blurb,
      description: description,
      color: color,
      sizes: {
        6: size6 || 0,
        7: size7 || 0,
        8: size8 || 0,
        9: size9 || 0,
        10: size10 || 0,
        11: size11 || 0,
        12: size12 || 0,
        13: size13 || 0,
        14: size14 || 0,
        15: size15 || 0,
      },
      stock:stocks,
      image: urlList,
    });
    const data =  await newProducts.save();
    if(data){
      res.json({data:true})
    }else{
      res.json({data:false})
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const loadProduct = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1; 
    const itemsPerPage = 5; 
    const skip = (currentPage - 1) * itemsPerPage;
    const limit = itemsPerPage;
    let search = "";
    if (req.query.search) {
        search = req.query.search;
    }
    const productData = await Product.find()
      .skip(skip)
      .limit(limit);

    const totalProduct = await Product.countDocuments(); 

    const totalPages = Math.ceil(totalProduct / itemsPerPage);

    const startIndex = skip + 0;
    const stock = await Product.find()
    const categories = await category.find();
    res.render("admin/product", { 
      stock: stock,
      categories ,
      currentPage,
      totalPages,
      startIndex,
      endIndex: skip + productData.length,});
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const loadEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const stock = await Product.findOne({ _id: id }).populate("category");
    const categories = await category.find();
    res.render("admin/editProduct.ejs", { stock: stock, category: categories });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const name = req.body.name;
    const category = req.body.category;
    let price = parseInt(req.body.price);
    const color = req.body.color;
    const blurb = req.body.blurb;
    const description = req.body.description;
    
    let size6 = req.body.size6 || 0;
    let size7 = req.body.size7 || 0;
    let size8 = req.body.size8 || 0;
    let size9 = req.body.size9 || 0;
    let size10 = req.body.size10 || 0;
    let size11 = req.body.size11 || 0;
    let size12 = req.body.size12 || 0;
    let size13 = req.body.size13 || 0;
    let size14 = req.body.size14 || 0;
    let size15 = req.body.size15 || 0;

    price = parseInt(price);
    size6 = parseInt(size6);
    size7 = parseInt(size7);
    size8 = parseInt(size8);
    size9 = parseInt(size9);
    size10 = parseInt(size10);
    size11 = parseInt(size11);
    size12 = parseInt(size12);
    size13 = parseInt(size13);
    size14 = parseInt(size14);
    size15 = parseInt(size15);

    let stocks=size6+size7+size8+size9+size10+size11+size12+size13+size14+size15
    
    
    
    if (req.files){
      let images =req.files;
      const urlList = await multipleimages(images);
      await Product.findByIdAndUpdate(id, {
        $set: { image: urlList }
      });
    }
    const data = await Product.findByIdAndUpdate(id, {
      $set: {
        name: name,
        category: category,
        price: price,
        stock: stocks,
        sizes: {
          6: size6 || 0,
          7: size7 || 0,
          8: size8 || 0,
          9: size9 || 0,
          10: size10 || 0,
          11: size11 || 0,
          12: size12 || 0,
          13: size13 || 0,
          14: size14 || 0,
          15: size15 || 0,
        },
        color: color,
        blurb: blurb,
        description: description,
      },
    });
    // res.redirect("/admin/product");
    if(data){
      res.json({data:true})
    }else{
      res.json({data:false})
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { id, active } = req.query;

    if (active == "true") {
      await Product.findByIdAndUpdate(id, { $set: { isActive: false } });
      res.redirect("/admin/product");
    } else if (active == "false") {
      await Product.findByIdAndUpdate(id, { $set: { isActive: true } });
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const deleteProductImage = async (req,res)=>{
  try {
    const {id,publicId}=req.query;
    await Product.updateOne(
    { _id:id,"image.public_id": publicId},
      { $pull:{"image": { public_id : publicId}} },
      )
      await deleteImage(publicId)
      res.redirect('/admin/product')
  } catch (error) {
    console.log(error)
    res.render('error/404')
  }
}

module.exports = {
  addProduct,
  loadProduct,
  loadAddProduct,
  loadEditProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
};
