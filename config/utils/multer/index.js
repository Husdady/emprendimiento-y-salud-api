const multer = require('multer')

const diskStorage = multer.diskStorage({
  filename: (_, file, cb) => cb(null, file.originalname)
})

const upload = multer({ storage: diskStorage })

module.exports = { upload }