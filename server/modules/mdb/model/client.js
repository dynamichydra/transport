const mongoose = require("mongoose");
const ClientSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provied Client name"]
    },
    email:String,
    ph:String,
    company:String,
    bank_name:String,
    acc_no:String,
    address:String,
    branch:String,
    ifsc:String,
    status:{
        type:String,
        enum:["1","2"],
        default:"1"
    },
    holder_name:String
}, {
    timestamps: true, versionKey: false,
    id: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
})

const client = mongoose.model("client",ClientSchema);
module.exports = client