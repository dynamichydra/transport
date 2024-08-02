var bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

var DokuMe_SyncInterface = function(executor, express) {
    let _ = this;
    _.executor = executor;
    _.app = express;
    _.app.use(bodyParser.json());
    _.app.use(bodyParser.urlencoded({ extended: true }));

    _.storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, 'uploads/');
      },
      filename: function(req, file, cb) {
        const uniqueFileName = Date.now() + '-' + file.originalname;    
        cb(null, uniqueFileName);
      }
    });
    _.upload = multer({ storage: _.storage });
}


DokuMe_SyncInterface.prototype.start = function(){
    let _ = this;

    _.app.post('/upload', _.upload.single('file'), function (req, res) {
      res.json({STATUS:true,MESSAGE:req.file});
    });

    _.app.get('/files/:filename', (req, res) => {
      const fileName = req.params.filename;
      const filePath = path.join(__dirname, '../uploads', fileName);
      if (fs.existsSync(filePath)) {
          res.download(filePath);
      } else {
          res.status(404).send('File not found.');
      }
    });

    _.app.post('/task/submit', function (req, res) {
        let obj = req.body;
        _.executor.executeTask(obj.SOURCE, obj.TYPE, obj.TASK, obj.DATA).then(function(result){
            if(result){
                res.json(result);
            }else{
                res.json(result);
            }
        }).catch(function(error){
            console.log(error);
            res.json(error);
        });
    });
}

module.exports = DokuMe_SyncInterface;