const multer = require('multer');
const path = require('path');
if(process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}

const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,process.env.MULTER_DEST)
    },
    filename:(req,file,cb) => {
        const suffix = Date.now()
        cb(null, file.fieldname + '-' + file.originalname);
    }
})
const upload = multer({
    limits: {
        fileSize: 2*1024*1024
    },
    
    storage:storage,

    fileFilter(req,file,cb) {
        const ext = path.extname(file.originalname).toLowerCase()
        // path.extname() 取的副檔名 (ex. .jpg)

        if(ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
            // 拒絕上傳檔案
            cb('檔案格式錯誤, 僅限上傳 jpg, jpeg, png 格式')
        }
        // 接受檔案
        cb(null, true);
    },
}).array('EDM',[,20])

module.exports = upload;