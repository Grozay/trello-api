import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }

    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      //đây là tạo 1 cái mảng thì này do backend lm hay frontend lm điều được theo cấu trúc của frontend
      getNewColumn.cards = []
    }

    //cập nhập mảng cardOrderIds trong colection board
    await boardModel.pushColumnOrderIds(getNewColumn)

    return getNewColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)
    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }
    //xoa column
    await columnModel.deleteOneById(columnId)
    //xoa all card
    await cardModel.deleteManyByColumnId(columnId)
    //xoa columnId trong mảng columnOrderIds trong collection board
    await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteResult: 'Column and its cards deleted successfully' }
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}
