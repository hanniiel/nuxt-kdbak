require("dotenv");
const ImgurStorage = require('multer-storage-imgur');
const multer = require('multer');

const upload = multer({
    storage: ImgurStorage({ 
        clientId: process.env.IMGUR_ID
    })
  });

/*const upmulter = multer({
  dest: 'public/images/'
});
*/

const imgur = upload.single("avatar");
//const imgur = upload.fields([{name:"cover",maxCount:1},{name:"full",maxCount:1}]);


module.exports = imgur;