const category = require("../../models/categoryModel");
const product = require("../../models/productModel");
const imagesUrl = require("../../utilities/uploadImage");

const addCategory = async (req, res) => {

  try {
    const name = req.body.name.toLowerCase();
    const images = req.files.image

    const categoryData = await category.findOne({ name: name });
    if (categoryData) {
        res.render("admin/category", { message: "Category Already Exits" });
    } else {
      const url = await imagesUrl(images);
      const newCategory = new category({
        name: name,
        image:url
      });
      await newCategory.save();
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error);
  }
  
};

const loadAddCategory = (req, res) => {
  try {
    res.render("admin/addCategory", { message: null });
  } catch (error) {
    console.log(error);
  }
};

const loadEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await category.findOne({ _id: id });
    res.render("admin/editCategory", { category: categoryData });
  } catch (error) {
    console.log(error);
  }
};

const editCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const name = req.body.name;
    await category.findByIdAndUpdate(id, { $set: { name: name } });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
  }
};

const loadCategory = async (req, res) => {
  try {
    const categories = await category.find();
    const productValue = [];
    for (let i = 0; i < categories.length; i++) {
      productValue[i] = await product.findOne({ category: categories[i]._id});
    }
    console.log(productValue);
    res.render("admin/category", { categories:categories , productValue });
  } catch (error) {
    console.log(error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await category.findOneAndDelete({ _id: id });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
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
