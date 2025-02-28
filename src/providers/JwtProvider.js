import JWT from 'jsonwebtoken'

//function tạo mới một token cần 3 tham số
//userInfo: Nhưng thông tin muốn đính kèm trong token
//secrétignature: chữ ký bí mật dùng để mã hóa và giải mã token
//tokenLife: thời gian sống của token

const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    //HS256: thuật toán mã hóa và giải mã token mặc định
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

//function kiểm tra token có hợp lệ hay không
//hợp lệ là đúng với private key trong dự án ha không
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}
