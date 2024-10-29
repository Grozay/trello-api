/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError.js'
import { boardService } from '~/services/boardService.js'

const createNew = async (req, res, next) => {
  try {
    // console.log(res.body)

    //điều hướng đến service để xử lý
    const createBoard = await boardService.createNew(req.body)
    //có kết quả trả về client
    res.status(StatusCodes.CREATED).json(createBoard)
  } catch (error) { next(error)}
}

export const boardController = {
  createNew
}
