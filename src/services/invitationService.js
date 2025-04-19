import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    //Người đi mời : chính là người đang gửi request, nen chúng ta tìm theo id lấy từ token
    const inviter = await userModel.findOneById(inviterId)

    //Người được mời : chính là người được mời vào board
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    //Tìm luôn là cái board ra để lấy data xử lí
    const board = await boardModel.findOneById(reqBody.boardId)

    //Nếu tồn tại 1 trong 3 thì cứ thẳng tay reject
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, invitee or board not found')
    }

    // Tạo một data cần thiết để lưu vào db
    // có thể tử bỏ hoặc làm sai lệch type, boardInvitation , status để test xem model validate oke chưa
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), //Chuyển từ objectid về string vì sang model có check lại data ở hàm create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    //Gọi sang model để lưu vào db
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId.toString())

    //Ngoài thông tin của cái board invitation mới tọa thì trả về đủ luôn board, inviter, invitee cho FE thoải mái xử lí
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation
}