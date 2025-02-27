import { userModel } from '../models/userModel'
import { ApiError } from '../utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { pickUser } from '../utils/formatters'

const createNew = async (reqBody) => {
  try {
    //kiểm trangh email đã tồn tại trong hệ thống chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }
    //tạo data để lưu vào db
    // nameFromEmail: nếu email là abc@gmail.com thì nameFromEmail là abc
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      username: nameFromEmail,
      displayName: nameFromEmail, //mặc đinh để giống username khi đăng kí, về sau thêm tính năng update cho user
      avatar: `https://avatar.vercel.sh/${nameFromEmail}`,
      password: bcrypt.hashSync(reqBody.password, 8), //tham số thứ 2 là số lần mã hóa nên số càng lớn thì mã hóa càng an toàn và càng giải mã lâu
      verifyToken: uuidv4()
    }

    //thực hiện lưu vào db
    const createdUser = await userModel.createNew(newUser)

    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    //gửi email cho người dùng xác thực tài khoản

    //return trả về dữ liệu cho phía Controller
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew
}