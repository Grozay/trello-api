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

// Lấy danh sách lời mời của người dùng
const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    // Vì các dữ liệu inviter, invitee và board là đang ở giá trị mảng 1 phần tử nếu lấy ra được nên chúng ta biến đổi về Json Object trước khi trả về phía FE
    const resInvitation = getInvitations.map((i) => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invitee: i.invitee[0] || {},
        board: i.board[0] || {}
      }
    })
    return resInvitation
  } catch (error) {
    throw error
  }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    //Tìm bản ghi invitaion trong model
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found')
    }

    // Sau khi có Invitaion rồi thì lấy full thông tin trong của board
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)

    if (!getBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    //Kiểm tra xem nếu status là eccepted join bỏad mà cái thằng user (invitee) đã là ownêr hoặc member của board rồi thì về về thông báo lỗi luôn
    // note: 2 mảng memberIds và ownerIds của board nó đang là kiểu dữ liệu ObjectId nên cho nó về String hết luôn để check

    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()

    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLEO, 'You are already a member of this board')
    }

    //Create data để update vào schema invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status
      }
    }

    //B1: Cập nhập státus trong bản ghi invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData)


    //B2: Nếu trường hợp accept một lời mời thành công, thì cần phải thêm thông tin của thằng user (userId) vào bản ghi memberIds trong collection board
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId)
    }

    return updatedInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}