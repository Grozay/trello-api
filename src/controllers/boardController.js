/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'

const createNew = async (req, res, next) => {
  try {
    // console.log(res.body)
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'BAD REQUEST')
    res.status(StatusCodes.CREATED).json({ message: 'POST from controller: API create a board' })
  } catch (error) { next(error)}
}

export const boardController = {
  createNew
}
