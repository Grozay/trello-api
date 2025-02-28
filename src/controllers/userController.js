import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'

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

    //xử lí trả về http only cookie cho phía trình duyệt
    console.log('🚀 ~ login ~ result:', result)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const userController = {
  createNew,
  verifyAccount,
  login
}
