import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { cloudinaryProvider } from '~/providers/CloudinaryProvider'
const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }

    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    //cập nhập mảng cardOrderIds trong collection column
    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      //Trường hợp upload file lên cloud cụ thể là cloudinary
      const uploadResult = await cloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
    } else if ( updateData.commentToAdd ) {
      //Tạo dữ liệu comment để thêm vào database, cần bổ sung thêm những field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        createdAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      updatedCard = await cardModel.unShiftNewComment(cardId, commentData)
    } else if ( updateData.incomeingMemberInfo ) {
      //Trường hợp ADD hoặc REMOVE thành viên khỏi card
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomeingMemberInfo)
    } else {
      // Các trường hợp update chung như title, description, ...
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update
}
