
import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
// Define Collection (name & schema)
const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

//Các trường không được phép update
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt']

const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    //do là lúc insertOne vào thì nó bị là string do validate phía trên là Joi.
    let newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId)
    }

    // Nếu tồn tại dữ liệu boardInvitation thì update cho cái boardId
    if (validData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }

    const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd)
    return createdInvitation
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (invitationId) => {
  try {
    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({ _id: new ObjectId(invitationId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (invitationId, updateData) => {
  try {
    //Loại bỏ các trường không được phép update
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) delete updateData[fieldName]
    })

    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(updateData.boardInvitation.boardId)
      }
    }

    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(invitationId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Query tổng hợp arregate để lấy những bản ghi thuốc về một thằng user cụ thể
const findByUser = async (userId) => {
  try {
    const queryConditions = [
      { inviteeId: new ObjectId(userId) },
      { _destroy: false }
    ]
    //tạm thời giống như findOneById
    const results = await GET_DB().collection(INVITATION_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'inviterId', // người đi mời
          foreignField: '_id',
          as: 'inviter',
          pipeline: [
            { $project: { 'password': 0, 'verifyToken': 0 } }
          ]
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'inviteeId', // người được mời
          foreignField: '_id',
          as: 'invitee',
          pipeline: [
            { $project: { 'password': 0, 'verifyToken': 0 } }
          ]
        }
      },
      {
        $lookup: {
          from: boardModel.BOARD_COLLECTION_NAME,
          localField: 'boardInvitation.boardId',
          foreignField: '_id',
          as: 'board'
        }
      }
    ]).toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}


export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update,
  findByUser
}
