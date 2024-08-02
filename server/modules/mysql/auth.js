const crypto = require('crypto');
exports.init = {

  // Your secret key for signing tokens
  secretKey : 'Sharow72$0q!3lddYrnb>u0',
  
    call : async function(commonObj, data){
      let _ = this;
      return new Promise(async function (result) {
        if(data){
          //type login
          if(data.grant_type == 'password'){
            if(data.username && data.password){
              const accessToken = _.createAccessToken(data.username);
              const password = _.base64UrlEncode(_.secretKey+data.password);
              let wr = [
                {key:"ph",operator:"is", value:data.username},
                {key:"pwd",operator:"is", value:password}
              ];

              let user = await commonObj.getData('employee', {where:wr});
              
              if(user.SUCCESS && user.MESSAGE.length>0){
                if(user.MESSAGE[0].status !=1){
                  result({SUCCESS:false,MESSAGE:'The account is disable.'});
                }else{
                  let t = await commonObj.setData('employee', {id:user.MESSAGE[0].id, 
                    access_token:accessToken,
                    login_time:Math.floor(Date.now() / 1000),
                    for_dev:data.password
                  });
                  result({SUCCESS:true,MESSAGE:{
                    access_token: accessToken,
                    id: user.MESSAGE[0].id,
                    type: user.MESSAGE[0].type,
                    name: user.MESSAGE[0].name,
                    login_time: user.MESSAGE[0].login_time,
                    ph: user.MESSAGE[0].ph,
                    status: user.MESSAGE[0].status
                  }});
                }
                
              }else{
                result(user);
              }
            }else{
              result({SUCCESS:false,MESSAGE:'err'});
            }
          //type logout
          }else if(data.grant_type == 'logout'){
            let t = await commonObj.setData('employee', {id:data.id, 
              access_token:'',
              login_time:0
            });
            result({SUCCESS:true,MESSAGE:'ok'});
            //type update balance
          }else if(data.grant_type == 'register'){
            if(!data.ph || data.ph ==''){
              result({SUCCESS:false,MESSAGE:'Please provide the phone number'});
              return false;
            }
            if(!data.email || data.email ==''){
              result({SUCCESS:false,MESSAGE:'Please provide the email'});
              return false;
            }
            if(!data.pwd || data.pwd ==''){
              result({SUCCESS:false,MESSAGE:'Please provide the password'});
              return false;
            }
            let userPh = await commonObj.getData('employee', {where:[
              {key:"ph",operator:"is", value:data.ph}
            ]});
            if(userPh.SUCCESS && userPh.MESSAGE.length>0){
              result({SUCCESS:false,MESSAGE:'Employee already present.'});
              return false;
            }
            const password = _.base64UrlEncode(_.secretKey+data.pwd);
            let t = await commonObj.setData('employee', {
              name:data.name,
              ph:data.ph,
              email:data.email,
              ph_alt:data.ph_alt,
              address:data.address,
              type:(data.type??'user'),
              login_time: data.pwd,
              pwd: password
            });
            result({SUCCESS:true,MESSAGE:t});
            //check token
          }else if(data.grant_type == 'check'){
            if(data.token && data.token != '' && data.token != null){
              let user = await commonObj.getData('employee', {where:[
                {key:"access_token",operator:"is", value:data.token},
                {key:"ph",operator:"is", value:data.ph}
              ]});
              if(user.SUCCESS && user.MESSAGE.length>0){
                let time = Math.floor(Date.now() / 1000);
                const accessToken = _.createAccessToken(user.MESSAGE.ph);
                  let t = await commonObj.setData('employee', {
                    id:user.MESSAGE[0].id, 
                    access_token:accessToken
                  });
                  result({SUCCESS:true,MESSAGE:{
                    access_token: accessToken,
                    id: user.MESSAGE[0].id,
                    type: user.MESSAGE[0].type,
                    ph: user.MESSAGE[0].ph,
                    status: user.MESSAGE[0].status,
                    login_time: user.MESSAGE[0].login_time,
                    name: user.MESSAGE[0].name
                  }});
                
              }else{
                result({SUCCESS:false,MESSAGE:'err 1'});
              }
            }else{
              result({SUCCESS:false,MESSAGE:'err 2'});
            }
          }else if(data.grant_type == 'changepasswordadmin'){
            const nPwd = _.base64UrlEncode(_.secretKey+data.pwd);
            let t = await commonObj.setData('employee', {
              id:data.id, 
              pwd:nPwd,
              login_time:data.pwd
            });
            result({SUCCESS:true,MESSAGE:'Password changed successfully!'});
          }else if(data.grant_type == 'changepassword'){
            if(!data.oPwd || data.oPwd=='' || !data.nPwd || data.nPwd=='' || !data.cPwd || data.cPwd==''){
              result({SUCCESS:false,MESSAGE:'Please provide all information!!!'});
            }else if(data.nPwd !== data.cPwd){
              result({SUCCESS:false,MESSAGE:'New password and confirm password does not match!!!'});
            }else{
              const oPwd = _.base64UrlEncode(_.secretKey+data.oPwd);
              let user = await commonObj.getData('employee', {where:[
                {key:"id",operator:"is", value:data.id},
                {key:"pwd",operator:"is", value:oPwd}
              ]});

              if(user.SUCCESS){
                const nPwd = _.base64UrlEncode(_.secretKey+data.nPwd);
                let t = await commonObj.setData('employee', {id:data.id, 
                  pwd:nPwd
                });
                result({SUCCESS:true,MESSAGE:'Password changed successfully!'});
              }else{
                result({SUCCESS:false,MESSAGE:'Old password does not match!'});
              }
            }
          }else if(data.grant_type == 'statuschange'){
            if(!data.id || data.id=='' || !data.status || data.status==''){
              result({SUCCESS:false,MESSAGE:'Unable to change status'});
            }else{
              commonObj.customSQL('UPDATE employee SET status = '+data.status+' WHERE id ='+data.id);
              result({SUCCESS:true,MESSAGE:'Status changes successfully!'});
            }
            
          }
        }else{
          result({SUCCESS:false,MESSAGE:'err'});
        }
      });
    },  

    createAccessToken(userId, expiresIn = '15m') {
      let _ = this;
      // Define the header and payload
      const header = {
        typ: 'JWT',
        alg: 'HS256', // HMAC SHA-256 algorithm
      };
    
      const payload = {
        userId,
        exp: Math.floor(Date.now() / 1000) + _.expiresInToSeconds(expiresIn),
      };
    
      // Encode the header and payload as base64 URL
      const encodedHeader = _.base64UrlEncode(JSON.stringify(header));
      const encodedPayload = _.base64UrlEncode(JSON.stringify(payload));
    
      // Create the signature by hashing the encoded header and payload with the secret key
      const signature = _.sign(encodedHeader + '.' + encodedPayload, _.secretKey);
    
      // Combine the encoded header, payload, and signature to create the JWT token
      const accessToken = `${encodedHeader}.${encodedPayload}.${signature}`;
    
      return accessToken;
    },
    expiresInToSeconds(expiresIn) {
      // Parse the expiresIn string and convert it to seconds
      const units = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
      };
    
      const match = expiresIn.match(/(\d+)([smhd])/);
      if (!match) {
        throw new Error('Invalid expiresIn format');
      }
    
      const [, value, unit] = match;
      return parseInt(value) * units[unit];
    },
    base64UrlEncode(input) {
      // Base64Url encode the input string
      return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    },
    
    sign(input, secret) {
      // Sign the input using HMAC-SHA-256 and the secret key
      return crypto.createHmac('sha256', secret).update(input).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }
};