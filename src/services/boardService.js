import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'


const createNew = async (userId, reqBody) => {
  try {
    //xử lí logic dữ liệu tùy đặt thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    //gọi tới tần models để xử lí lưu bản ghi newBoard vào trong database
    const createdBoard = await boardModel.createNew(userId, newBoard)

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

const getDetails = async (userId, boardId) => {
  try {
    const boardDetails = await boardModel.getDetails(userId, boardId)
    if (!boardDetails) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    const resBoard = cloneDeep(boardDetails)
    //Đưa card vào đúng column của nó
    resBoard.columns.forEach((column) => {
      //So sánh ObjectId với nhau equals nó của mongod nên ko cần chuyển về string vì nó đã support
      column.cards = resBoard.cards.filter((card) => card.columnId.equals(column._id))
      //Cách khác
      // column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString())
    })
    //Xóa cards ra khỏi resBoard vì không cần thiết phải trả về cho FE
    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)
    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardToDifferentColumns = async (reqBody) => {
  try {
    //B1: update lại columnOrderIds của board ban đầu chứa nó (xóa id của card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    //B2: Update mảng cardOrderIds của column mới chứa nó (thêm id của card vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    //B3: Update lại columnId của card
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
      updatedAt: Date.now()
    })

    return { updateResult: 'Successfully!' }
  } catch (error) { throw error }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Nếu không tồn tại page hoặc itemsPerPage từ FE thì BE sẽ luôn gán giá trị mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const resutls = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10))
    return resutls
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumns,
  getBoards
}
