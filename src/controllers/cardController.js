/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    const createCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createCard)
  } catch (error) { next(error)}
}

const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const cardCover = req.file
    const userInfo = req.jwtDecoded
    const updateCard = await cardService.update(cardId, req.body, cardCover, userInfo)
    res.status(StatusCodes.OK).json(updateCard)
  } catch (error) {
    next(error)
  }
}

export const cardController = {
  createNew,
  update
}
