const Cart = require("../../models/cartModel");
const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");

const loadcart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.user_id })
      .populate("products.productId")
      .populate("products.sizes");
    const category = await Category.find();
    let countCart= 0;
    if(req.session.user_id){
      countCart=res.locals.count
    }
    const productsArray = [];

     if(cart){
      cart.products.forEach((product) => {
        productsArray.push(product);
      });
     }


    res.render("user/cart.ejs", {
      cart,
      session: req.session.user_id,
      name: req.session.user_name,
      category,
      countCart,
      stock:productsArray,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const addToCart = async (req, res) => {
  try {
    const { productId, selectedSize, quantity } = req.query;
    const userId = req.session.user_id;
    const product = await Product.findById(productId);
    const price = product.price;
    let totalQuantity, totalPrice;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }
    if (cart) {
      totalQuantity = parseInt(cart.totalQuantity);
      totalPrice = parseInt(cart.totalPrice);
      const existingProduct = await Cart.findOne({
        userId: userId,
        "products.productId": productId,
      });
      if (existingProduct) {
        const productItem = existingProduct.products.find(
          (item) => item.productId.toString() === productId.toString()
        );
        if (productItem.sizes.has(selectedSize)) {
          const currentQuantity = productItem.sizes.get(selectedSize);
          const newSize = parseInt(currentQuantity) + parseInt(quantity);
          totalQuantity = totalQuantity + parseInt(quantity);
          totalPrice = totalPrice + price * parseInt(quantity);
          await Cart.findByIdAndUpdate(
            cart._id,
            {
              $set: {
                [`products.$[productItem].sizes.${selectedSize}`]: newSize,
              },
            },
            {
              new: true,
              arrayFilters: [{ "productItem.productId": productId }],
            }
          );
        } else {
          totalQuantity = totalQuantity + parseInt(quantity);
          totalPrice = totalPrice + price * parseInt(quantity);
          await Cart.findByIdAndUpdate(
            cart._id,
            {
              $set: {
                [`products.$[productItem].sizes.${selectedSize}`]: quantity,
              },
            },
            {
              new: true,
              arrayFilters: [{ "productItem.productId": productId }],
            }
          );
        }
      } else {
        totalQuantity = totalQuantity + parseInt(quantity);
        totalPrice = totalPrice + price * parseInt(quantity);
        const newProduct = {
          productId: productId,
          sizes: new Map([[selectedSize, quantity]]),
          totalQuantity,type: Number,
          default: 0,
          totalPrice,
        };
        cart.products.push(newProduct);
      }
    }
    (cart.totalQuantity = totalQuantity), (cart.totalPrice = totalPrice);
    await cart.save();
    res.redirect("/cart");
  } catch (error) {
    console.error(error);
  }
};

const quantityChange = async (req, res) => {
  try {
    const cartId = req.body.cartId;
    const productId = req.body.productId;
    const selectedSize = req.body.size;
    const quantity = parseInt(req.body.count);
    let cart = await Cart.findOne({ _id: cartId });

    let totalQuantity = parseInt(cart.totalQuantity);
    let totalPrice = parseInt(cart.totalPrice);
    const productItem = cart.products.find(
      (item) => item.productId.toString() === productId.toString()
    );
    const product = await Product.findById(productId);
    const price = product.price;
    if (!productItem) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }

    const currentQuantity = productItem.sizes.get(selectedSize);
    const newSize = parseInt(currentQuantity) + quantity;
    cart.totalQuantity = totalQuantity + quantity;
    totalPrice = price * quantity;
    cart.totalPrice += totalPrice;
    productItem.sizes.set(selectedSize, newSize);
    const filteredSizesMap = new Map();

    for (const [key, value] of productItem.sizes.entries()) {
      if (value !== 0) {
        filteredSizesMap.set(key, value);
      }
    }

    productItem.sizes = filteredSizesMap;

    await cart.save();

    res.status(200).json({ message: "Quantity changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { cartId, productId, size, price } = req.query;
    let cart = await Cart.findOne({ _id: cartId });
    const productItem = cart.products.find(
      (item) => item.productId.toString() === productId.toString()
    );

    if (!productItem) {
      return res.json({
        response: false,
        message: "Product not found in cart",
      });
    }

    const sizes = productItem.sizes;
    if (!sizes.has(size)) {
      return res.json({
        response: false,
        message: "Size not found for the product",
      });
    }

    const quantityToRemove = sizes.get(size);
    sizes.delete(size);

    let totalQuantity = cart.totalQuantity - quantityToRemove;

    let totalPrice = cart.totalPrice;
    const sizePrice = parseFloat(price) || Number(price) || 0;
    const subtotal = sizePrice * quantityToRemove;
    totalPrice = totalPrice - subtotal;

    if (sizes.size === 0) {
      cart.products = cart.products.filter(
        (item) => item.productId.toString() !== productId.toString()
      );
    }

    cart.totalQuantity = totalQuantity;
    cart.totalPrice = totalPrice;

    await cart.save();
    res.json({
      response: true,
      totalQuantity: cart.totalQuantity,
      totalPrice: cart.totalPrice,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadcart,
  addToCart,
  quantityChange,
  removeFromCart,
};
