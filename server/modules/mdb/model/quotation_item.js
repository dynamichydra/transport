// "quotation_item" : ["id", "quotation_id", "product_id", "no_days", "quantity", "unit_price", "total"],
const mongoose = require("mongoose")
const quotationItemSchema = new mongoose.Schema({

    quotation_id: {
        type:mongoose.Schema.ObjectId
    },
    product_id: {
        type: mongoose.Schema.ObjectId
    },
    no_days: String,
    quantity: String,
    unit_price: String,
    total: String,

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
});

const quotation_item = mongoose.model("quotation_item", quotationItemSchema);
module.exports = quotation_item;