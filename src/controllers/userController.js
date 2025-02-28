import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ms from 'ms'
import  ApiError from '~/utils/ApiError'
const createNew = async (req, res, next) => {
  try {
    const createUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) { next(error)}
}


const verifyAccount = async (req, res, next) => {
  try {
    const verifyUser = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(verifyUser)
  } catch (error) { next(error) }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    // xử lí trả về http only cookie cho phía trình duyệt 
    // về cái maxAge và thư viện ms: https://expressjs.com/en/api.html
    // Đối với cái maxAge thời gian sống của cookie thì chúng ta sẽ để tối đa là 14 ngày, tùy dự án. lưu ý thời gian sống của cookie khác với thời gian sống của token đừng nhầm lẫn nhé XD
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In! (error from refresh token)')) }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken
}
