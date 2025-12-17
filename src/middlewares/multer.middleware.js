import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req ,file ,cb){
        cb(null ,"./public/temp")
    },
    filename: function () {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)// 1E9 means one billion
        cb(null ,file.filename + "-" + uniqueSuffix)
    }
});

export const upload = multer({
    storage, 
});