const mongoose = require("mongoose");
const employeeSchama = mongoose.Schema({
    name:String,
    email:String,
    ph:String,
    ph_alt:String,
    pwd:String, 
    access_token:String,
    status:String,
    login_time:String,
    type:String,

},{timestamps:true,
    versionKey: false,
    id: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
})

const employee = mongoose.model("employee",employeeSchama);
module.exports = employee