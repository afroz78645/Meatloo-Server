import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory:{
      type:String,
      required:false,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: false,
      default: 0,
    },
    gross: {
      type: Number,
      required: false,
      default: 0,
    },
    netWeight: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Boolean,
      required: false,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      required: true,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
      required: true,
    },
    quality: {
      type: String,
      default: true,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
