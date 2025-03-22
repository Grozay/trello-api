import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { brevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import { cloudinaryProvider } from '~/providers/CloudinaryProvider'
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
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`

    const customeSubject = 'Please verify your email before using our service'
    const htmlContent = `
			<h3>Here is your verificaiton link:</h3>
			<a href="${verificationLink}">${verificationLink}</a>
			<p>If you did not request this, please ignore this email.</p>
		`

    await brevoProvider.sendEmail(getNewUser.email, customeSubject, htmlContent)

    //return trả về dữ liệu cho phía Controller
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    //query user trong db
    const existUser = await userModel.findOneByEmail(reqBody.email)

    //kiểm tra xem user có tồn tại trong db không
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    //kiểm tra xem user đã được xác thực chưa
    if (existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'User already verified')
    }

    //kiểm tra xem token có đúng không
    if (existUser.verifyToken !== reqBody.token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token')
    }

    //nếu mọi thứ đúng thì cập nhật trạng thái user
    const updatedData = {
      isActive: true,
      verifyToken: null
    }

    const updatedUser = await userModel.update(existUser._id, updatedData)

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    if (!existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    }

    if (!bcrypt.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!')
    }

    //tạo token cho user
    const userInfo = { _id: existUser._id, email: existUser.email }

    //tạo access token và refresh token
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
      // 15
    )

    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)
    const userInfo = { _id: refreshTokenDecoded._id, email: refreshTokenDecoded.email }
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    )
    return { accessToken }
  } catch (error) {
    throw error
  }
}

const update = async ( userId, reqBody, userAvatarFile ) => {
  try {
    //Query user và kiểm trang cho chắc chắn
    const existUser = await userModel.findOneById(userId)
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    if (!existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not verified!')
    }

    //khởi tạo kết quả udpated user ban đầu là empty
    let updatedUser = {}
    // trường hợp change password
    if (reqBody.current_password && reqBody.new_password) {
      //kiểm tra xem current_password có đúng không
      if (!bcrypt.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is incorrect!')
      }
      //Nếu như current_password đúng thì chúng ta sẽ hash một mật khẩu mới và udpatê password mới vào db
      updatedUser = await userModel.update(existUser._id, {
        password: bcrypt.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      //Trường hợp upload file lên cloud cụ thể là cloudinary
      const uploadResult = await cloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      })
      // Lưu lại ủl của cái file ảnh vào trong database
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      })
    } else {
      //Trường hợp update các thông tin chung, ví dụ như displayName
      updatedUser = await userModel.update(existUser._id, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}
