import mongoose from "mongoose";

const shopSchema = mongoose.Schema(
    {
        isOpen: {
            type: Boolean,
            required: true,
            default: true,
        }
    }
)

const Shop = mongoose.model("shop", shopSchema);

export default Shop;