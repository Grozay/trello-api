import { invitationService } from '~/services/invitationService'
import { StatusCodes } from 'http-status-codes'

const createNewBoardInvitation = async (req, res, next) => {
  try {
    // Lấy id của người gửi lời mời
    const inviterId = req.jwtDecoded._id
    const resInvitation = await invitationService.createNewBoardInvitation(req.body, inviterId)
    res.status(StatusCodes.CREATED).json(resInvitation)
  } catch (error) { next(error) }
}

export const invitationController = {
  createNewBoardInvitation
}