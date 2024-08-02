// "quotation" : ["id", "client_id", "i_date", "code", "program_date_from", "program_date_to", "program_location", "program_name", "created_date", "status", "value", "discount", "notes", "description", "to_name", "to_designation", "to_phone", "to_address"],
const mongoose = require("mongoose")
const quotationSchema = new mongoose.Schema({

    client_id:{
        type:mongoose.Schema.ObjectId,
    },
    i_date:Date,
    code:String,
    program_date_from:Date,
    program_date_to:Date,
    program_location:String,
    program_name:String,
    created_date:Date,
    status:{
        type:String,
        default:"0"
    },
    value:String,
    discount:String,
    notes:String,
    description:String,
    to_name:String,
    to_designation:String,
    to_phone:String,
    to_address:String,

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

const quotation = mongoose.model("quotation",quotationSchema);
module.exports = quotation;

// [
//     {
//         '$lookup': {
//             from: 'clients',
//             localField: 'client_id',
//             foreignField: '_id',
//             as: 'result'
//         }
//     },
//     {
//         $match: {
//             client_id: ObjectId('667d5a6e6ce3706e39e7c7b2')
//         }
//     }
// ]

// [
//     {
//         '$lookup': {
//             from: 'clients',
//             localField: 'client_id',
//             foreignField: '_id',
//             as: 'result'
//         }
//     },
//     {
//         $match: {
//             client_id: ObjectId('667d5a6e6ce3706e39e7c7b2')
//         }
//     },
//     {
//         $project:
//         {
//             clientName: "$result.name",
//             clientCompany: "$result.company"
//         }
//     },
//     {
//         $unwind: "$clientName",
//     },
//     {
//         $unwind: "$clientCompany"
//     }
// ]