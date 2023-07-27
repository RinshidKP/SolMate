const User = require('../../models/userModel')

const logout =(req,res)=>{
    try {
        
        req.session.admin_id = null;
        res.redirect('/login');
  
    } catch (error) {
        console.log(error);
    }
  }
const loadCustomer = async (req, res) => {
    try {
      const currentPage = parseInt(req.query.page) || 1; // Get the current page from the query parameter
      const itemsPerPage = 10; // Adjust the number of items per page as needed
  
      // Calculate the skip and limit values based on the current page and items per page
      const skip = (currentPage - 1) * itemsPerPage;
      const limit = itemsPerPage;
      let search = "";
      search=req.query.search;
      // Retrieve the paginated user data from the database
      const userData = await User.find({ isAdmin: false,$or: [
        { name: { $regex: new RegExp(search, 'gi') } },
        { email: { $regex: new RegExp(search, 'gi') } }
      ] })
        .skip(skip)
        .limit(limit);
  
      const totalUsers = await User.countDocuments({ isAdmin: false }); // Get the total number of users
  
      const totalPages = Math.ceil(totalUsers / itemsPerPage); // Calculate the total number of pages
  
      const startIndex = skip + 0; // Calculate the start index for displaying sl.no
  
      res.render("admin/customers", {
        user: userData,
        currentPage,
        totalPages,
        startIndex,
        endIndex: skip + userData.length, // Calculate the end index for displaying sl.no
      });
    } catch (error) {
      console.log(error);
      // Handle error appropriately (e.g., display an error page or redirect to an error route)
    }
  };

  const loadEditUser = async (req, res) => {
    try {
      const id = req.query.id;
      const userData = await User.findOne({ _id: id });
      res.render("admin/editCustomer", { message: null, user: userData });
    } catch (error) {
      console.log(error);
    }
  };

  const updateUser = async (req, res) => {
    try {
      let access = req.body.isAccess;
      const id = req.query.id;
      await User.findByIdAndUpdate(id, { $set: { isAccess: access } });
      res.redirect("/admin/customer");
    } catch (error) {
      console.log(error);
    }
  };

  module.exports = {
    loadCustomer,
    loadEditUser,
    updateUser,
    logout,
  }