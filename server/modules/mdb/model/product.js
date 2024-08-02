const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    name:String,
    type:String,
    code:String,
    base_cost:String,
    description:String,
    status:{
        type:String,
        default:"1"
    }
}, {
    timestamps: true, 
    versionKey: false,
    id: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
})
const product = mongoose.model("product",productSchema);
module.exports = product;