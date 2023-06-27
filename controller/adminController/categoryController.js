const category = require("../../models/categoryModel");


const addCategory = async (req, res) => {
  try {
    const name = req.body.name.toLowerCase();
    const sub = req.body.sub.toLowerCase();

    const categoryData = await category.findOne({ name: name });

    if (categoryData) {
      // console.log(categoryData);
      // console.log('hi');
      if(!sub){
        res.render("admin/category", { message: "Category Already Exits" });
      }else{
        await category.findOneAndUpdate(
          { name:  name },
          { $addToSet: { sub: sub } },
          { upsert: true, new: true }
        );
        res.redirect("/admin/category");
      }
    } else {
      if(!sub){
        sub=[]
      }
      const newCategory = new category({
        name: name,
        sub: [sub],
      });
      await newCategory.save();
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error);
  }
};



const loadAddCategory = (req,res)=>{
  try {
    res.render('admin/addCategory',{message:null})
  } catch (error) {
    console.log(error);
  }
}

const loadEditCategory = async (req,res)=>{
  try {
    const id = req.query.id
    const categoryData = await category.findOne({_id:id})
    res.render('admin/editCategory',{category:categoryData})
  } catch (error) {
    console.log(error);
  }
}

const editCategory =async (req,res)=>{
  try {
    const id =req.query.id
    const name = req.body.name;
    const sub = req.body.sub;
    await category.findByIdAndUpdate(id,{$set:{name:name,sub:sub}})
    res.redirect('/admin/category')
  } catch (error) {
    console.log(error);
  }
}

const loadCategory = async (req,res)=>{
    try {
      const totalCategoriesCount = await category.aggregate([
      { $unwind: "$sub" }
    ]);

      const categories = await category.find();
        res.render('admin/category',{categories,message:null})
    } catch (error) {
        
    }
}

module.exports = {
  addCategory,
  loadCategory,
  loadAddCategory,
  loadEditCategory,
  editCategory,
};
