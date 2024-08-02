const moment = require('moment');
require('../../corefunction');
const { default: mongoose } = require('mongoose');

let db = null;


exports.init = {
    connectDB: async function () {
        return new Promise(async function (result) {
            mongoose.connect(`mongodb+srv://subratapramanik533:WC7xh15PzWqMV9d2@vlogapp.9hxlkpm.mongodb.net/pixpower?retryWrites=true&w=majority&appName=vlogApp`)
               .then((connection)=>{
                db=connection;
                result(db)
               }).catch((err)=>{
                console.log(err);
                throw new Error (err)
               })
            });
    },

    getData: async function (type, data) {
        let __ = this;
        return new Promise(async function (result) {
            let isId = false;
            console.log("DATA",data);
            let cnd = {}; let join=[];
            if (data.where) {
                for (const k in data.where) {
                    if (!isId && data.where[k].key == 'id') isId = true;

                    switch (data.where[k].operator) {
                        case "isnot":
                            if (data.where[k] == null || data.where[k] == 'null' || data.where[k] == 'undefined') {
                                cnd[data.where[k].key] = { $ne: data.where[k].value } 
                            } else {
                                cnd[data.where[k].key] = { $ne: data.where[k].value }
                            }
                            break;
                        case "higher":
                            if (cnd[data.where[k].key]) {
                                cnd[data.where[k].key] = { ...cnd[data.where[k].key], $gt: data.where[k].value }
                            } else {
                                cnd[data.where[k].key] = { $gt: data.where[k].value }
                            }
                            break;
                        case "lower":
                            if (cnd[data.where[k].key]) {
                                cnd[data.where[k].key] = { ...cnd[data.where[k].key], $lt: data.where[k].value }
                            } else {
                                cnd[data.where[k].key] = { $lt: data.where[k].value }
                            }
                            break;
                        case "lower-equal":
                            if (cnd[data.where[k].key]){
                                cnd[data.where[k].key] = {...cnd[data.where[k].key],$lte: data.where[k].value }
                            }else{
                                cnd[data.where[k].key] = { $lte: data.where[k].value } 
                            }
                            break;
                        case "higher-equal":
                            if (cnd[data.where[k].key]) {
                                cnd[data.where[k].key] = {...cnd[data.where[k].key],$gte:data.where[k].value }
                            } else {
                                cnd[data.where[k].key] = { $gte: data.where[k].value }
                            }
                            break;
                        case "isnull":
                            cnd[data.where[k].key]=null
                            break;
                        case "in":
                            cnd[data.where[k].key] = { $in: data.where[k].value }
                            break;
                        case "like":
                            cnd[data.where[k].key] = { $regex: data.where[k].value }
                            break;
                        default:
                            if (data.where[k].key==='id'){
                                cnd[`_${data.where[k].key}`] =new mongoose.Types.ObjectId(data.where[k].value);
                            }else{

                                cnd[data.where[k].key] = data.where[k].value;
                            }
                            break;
                    }
                }
            }
            if (data.reference) {
                let result="";
                for (let item of data.reference) {
                    // result = item.obj?.toLowerCase()
                    join.push ({"$lookup":{
                        from: `${item.obj?.toLowerCase()}s` ,
                        localField: item.b,
                        foreignField:`_${item.a}`,
                        as:"result"
                    }
                })
                }
                console.log(cnd);
                join.push({
                    $match:cnd
                })

                // if (data.select){
                //     let project={};
                //     let arr = data.select.split(",");
                //     arr.shift();
                //     arr.forEach((data)=>{
                //         console.log(data.split(" "));
                //         if(project[data.split(" ")[2]]){
                //             return;
                //         }else{
                //             project[data.split(" ")[2]] = `$${data.split(" ")[1]}`
                //         }
                //     })
                //     project.document ="$$ROOT"
                //     join.push({
                //         $project:project
                //     })
                //     arr.forEach((data) => {
                //         join.push({
                //             $unwind: `$${data.split(" ")[2]}`,
                //         })
                //     })
                // }
            }
            if (data.limit) {
                if (data.limit.start) {
                    join.push({
                        $skip: Number(data.limit.start)
                    })
                }
                if (data.limit.end) {
                    join.push({
                        $limit: Number(data.limit.end)
                    })
                }
            }
            if (data.order) {
                join.push({
                    $sort: { [data.order.by]: 1 }
                })

            }
            if (data.order1) {
                join.push({
                    $sort: { [data.order1.by]: 1 }
                })
            }

            try {
                console.log("query",join);
                let rows="";
                if (data.reference){
                    rows = await require(`./model/${type}`).aggregate(join)
                }else{
                    rows = await require(`./model/${type}`).find(cnd);
                }
                let curDate = moment().utcOffset("+05:30").format('YYYY-MM-DD HH:mm:ss');
                if (isId) {
                if (rows.length == 0) {
                    result({ SUCCESS: false, MESSAGE: "Object or owner can not be found." });
                   }else {
                      result({ SUCCESS: true, MESSAGE: rows[0], current_time: curDate });
                    }
                    }else {
                        result({ SUCCESS: true, MESSAGE: rows, current_time: curDate });
                    }
                    result({SUCCESS:true,MESSAGE:rows});
            } catch (error) {
                result({ SUCCESS: false, MESSAGE: error.message });
            }
        });
    },
    setData: async function (type, data) {
        let __ = this;
        return new Promise(async function (result) {
            let key = [], val ={}, sql = null, id=null;
            if (data.id) {
                for (const k in data) {
                    if (k == "id") {
                       id=data[k]
                    } else {
                        if (data[k] == null || data[k] == 'null' || data[k] == 'undefined') {
                            val[k] = null;
                        } else {
                            val[k] = data[k];
                        }
                    }
                }

                try {
                  const rows =  await require(`./model/${type}`).findByIdAndUpdate(id, val, {
                        new: true,
                        runValidators: true
                    })
                 result({ SUCCESS: true, MESSAGE: rows._id })
                } catch (err) {
                    console.log(err.message);
                    result({ SUCCESS: false, MESSAGE: err.message });
                }
            } else {
                for (const k in data) {
                    if (data[k] == null || data[k] == 'null' || data[k] == 'undefined') {
                        val[k] = null;
                    } else {
                        val[k] = data[k];
                    }
                }
                try {
                    console.log("value",val,type);
                    const rows = await require(`./model/${type}`).create(val);
                    result({ SUCCESS: true, MESSAGE: rows._id })
                    
                } catch (err) {
                    console.log(err.message);
                    result({ SUCCESS: false, MESSAGE: err.message });
                }
            }
        });
    },

    setDelete: async function (type, data) {
        return new Promise(async function (result) {
            let cnd = {};
            for (const k in data) {
                cnd[k]=data[k]
            }
            try {
                const res = await require(`./model/${type}`).remove(cnd);
                result({ SUCCESS: true, MESSAGE: 'ok' });
            } catch (err) {
                result({ SUCCESS: false, MESSAGE: err.message });
            }
        });
    },

    patchRequest: async function (type, data) {
        let __ = this;
        return new Promise(async function (result) {
            let resMsg = [];
            for (let i in data) {
                let tmp = {};
                switch (data[i].BACKEND_ACTION) {
                    case 'delete':
                        tmp[data[i].ID_RESPONSE] = await __.setDelete(type, { id: data[i].id });
                        resMsg.push(tmp);
                        break;
                    case 'get':
                        tmp[data[i].ID_RESPONSE] = await __.getData(type, {
                            where: [{
                                key: 'id',
                                operator: 'is',
                                value: data[i].id
                            }]
                        });
                        resMsg.push(tmp);
                        break;
                    case 'update':
                        tmp[data[i].ID_RESPONSE] = await __.setData(type, data[i]);
                        resMsg.push(tmp);
                        break;
                }
            }
            result({ SUCCESS: true, MESSAGE: resMsg });
        });
    },

    putRequest: async function (type, data) {
        let __ = this;
        return new Promise(async function (result) {
            let resMsg = [];
            for (let i in data.data) {
                let cndArr = [];
                for (let j in data.dm_keyfield) {
                    cndArr.push({ key: data.dm_keyfield[j], value: data.data[i][data.dm_keyfield[j]], operator: 'isequel' });
                }

                let oldData = await __.getData(type, { where: cndArr });
                if (oldData.SUCCESS && oldData.MESSAGE.length > 0) {
                    data.data[i]['id'] = oldData.MESSAGE[0].id;
                }

                resMsg.push(await __.setData(type, data.data[i]));
            }
            result({ SUCCESS: true, MESSAGE: resMsg });
        });
    },

    current_timestamp: function () {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    }
};