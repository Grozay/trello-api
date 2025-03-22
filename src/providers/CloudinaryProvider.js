import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'

//Bước đầu cấu hình cloudinary, sử dụng v2
const cloudinaryV2 = cloudinary.v2

cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

// Khởi tạo function upload file lên cloudinary
const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinaryV2.uploader.upload_stream({ folder: folderName }, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
    // Thực hiện upload cái luồn bằng lib streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const cloudinaryProvider = { streamUpload }