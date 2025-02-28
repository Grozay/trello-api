import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

//middleware này đảm nhiệm việc quan trọng: xác thực cái JWT accessToken nhận được từ phía FE hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  //Lấy access token nằm trong request cookies phía client - withCredentials trong file authorizedAxiosInstance hay không
  const clientAccessToken = req.cookies?.accessToken

  //nếu không có access token thì trả về lỗi 401
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (No access token)'))
    return
  }

  try {
    //1. Thực hiện giản mã token xem nó có hợp lệ hay là không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    //2. Quan trọng: nếu như cái token hợp lệ, thì sẽ cần phải lưu thông tin giải mã được và cái req. jwtDecoded, để sử dụng cho các jtần cần xử lí ở phía sau
    req.jwtDecoded = accessTokenDecoded
    // 3. Cho phép cái request đi tiếp
    next()
  } catch (error) {
    // console.log('🚀 ~ isAuthorized ~ error:', error)
    //Nếu cái access token hết hạn (expired) thì sẽ trả về môtrj cái mã lỗi cho phía FE biết để goij api refreshToken để lấy accessToken mới
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
      return
    }
    //Nếu như cái accessToken nó không hợp lệ do bất kì điều gì khác vụ hết hạn thì chúng ta chứ thẳng tay trả về mã 401 cho phía FE gọi api sign_out luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}