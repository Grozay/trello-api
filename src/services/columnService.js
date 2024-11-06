import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'

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

export const columnService = {
  createNew
}
