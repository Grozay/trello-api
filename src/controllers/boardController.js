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
    const userId = req.jwtDecoded._id
    // console.log(res.body)
    //điều hướng đến service để xử lý
    const createBoard = await boardService.createNew(userId, req.body)
    //có kết quả trả về client
    res.status(StatusCodes.CREATED).json(createBoard)
  } catch (error) { next(error)}
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const boardDetails = await boardService.getDetails(userId, boardId)

    res.status(StatusCodes.OK).json(boardDetails)
  } catch (error) { next(error)}
}

const update = async (req, res, next) => {
  try {
    const updatedBoard = await boardService.update(req.params.id, req.body)

    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) { next(error)}
}

const moveCardToDifferentColumns = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumns(req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error)}
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // Page và itemsPerPage được truyền vào trong query url từ phía FE nên BE sẽ lấy thông tin qua req.query
    const { page, itemsPerPage } = req.query
    const results = await boardService.getBoards(userId, page, itemsPerPage)

    res.status(StatusCodes.OK).json(results)
  } catch (error) { next(error)}
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumns,
  getBoards
}
