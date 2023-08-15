const category = require("../../models/categoryModel");
const product = require("../../models/productModel");
const {multipleimages,deleteImage,imageUpload} = require("../../utilities/uploadImage");

const addCategory = async (req, res) => {

  try {
    const name = req.body.name.toLowerCase();
    const images = req.file

    const categoryData = await category.findOne({ name: name });
    if (categoryData) {
        // res.render("admin/category", { message: "Category Already Exits" });
        res.json({data:"duplicate"})
    } else {
      const url = await multipleimages(images);
      const newCategory = new category({
        name: name,
        image:url
      });
      const data =await newCategory.save();
      if(data){
        res.json({data:true})
      }else{
        res.json({data:false})
      }
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
  
};

const loadAddCategory = (req, res) => {
  try {
    res.render("admin/addCategory", { message: null });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const loadEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await category.findOne({ _id: id });
    res.render("admin/editCategory", { category: categoryData });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const editCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const name = req.body.name;
    const images = req.file
    const url = await imageUpload(images);
    const data = await category.findByIdAndUpdate(id, { $set: {
      name: name,
      image:url
    } });
    // res.redirect("/admin/category");
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

const loadCategory = async (req, res) => {
  try {
    const categories = await category.find();
    const productValue = [];
    for (let i = 0; i < categories.length; i++) {
      productValue[i] = await product.findOne({ category: categories[i]._id});
    }
    res.render("admin/category", { categories:categories , productValue });
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await category.findOneAndDelete({ _id: id });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
};

module.exports = {
  addCategory,
  loadCategory,
  loadAddCategory,
  loadEditCategory,
  editCategory,
  deleteCategory,
};
