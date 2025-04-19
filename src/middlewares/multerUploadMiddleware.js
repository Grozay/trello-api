import multer from 'multer'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '../utils/validators'
import { ApiError } from '../utils/ApiError'
import { StatusCodes } from 'http-status-codes'
// Hầu hết những thứ bên dưới điều có docs của multer, chỉ có anh tổ chức lại sao cho khoa học và gọn gàng nhất có thể

// Function kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file, callback) => {

  // Đối với thằng multer, kiểm tra kiểu file thì sử dụng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  //Nếu như kiểu file hợp lệ:
  return callback(null, true)
}

// Khởi tạo function upload được bọc bởi multer, để sử dụng nó trong các route
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleware = { upload }
