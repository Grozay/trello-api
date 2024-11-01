/* eslint-disable no-useless-catch */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    //xử lí logic dữ liệu tùy đặt thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    //gọi tới tần models để xử lí lưu bản ghi newBoard vào trong database
    const createdBoard = await boardModel.createNew(newBoard)

    //lấy bản ghi vừa tạo và trả về cho controller
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    //làm thêm xử lí logic khác với các conlection khác tùy thuộc đặc thù dự án...vv
    //Băn email, notification về cho admin khi có một cái board mới được tạo...

    //Trả kết quả về, trong service luôn phải có return nếu không thì req sẽ chết
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (boardId) => {
  try {
    const boardDetails = await boardModel.getDetails(boardId)

    if (!boardDetails) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    return boardDetails
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails
}
