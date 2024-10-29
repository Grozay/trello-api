/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'

const createNew = async (req, res, next) => {
  //note: mặc định chúng ta ko cần custom message ở phía BE làm gì vì để FE tự làm validate và custom message phía FE cho đẹp
  //BE validate đảm bảo dữ liệu chuẩn xác, và trả về message mặc định của thư viện là được
  //Quan trọng: Việc validate dữ liệu là bắt buộc phải có ở phía BE, vì đây là điểm cuối lưu dữ liệu vào db
  //và thông thường trong thực tế, điều tốt nhất trong hệ thống hãy luôn validate dữ liệu cả ở phía BE và FE
  const correctCondition = joi.object({
    title: joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must be at most 50 characters long',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: joi.string().optional().min(1).max(256).trim().strict()
  })
  try {
    //set abortEarly: false to show all errors
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    //validate thành công thì chuyển tiếp sang controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const boardValidation = {
  createNew
}
