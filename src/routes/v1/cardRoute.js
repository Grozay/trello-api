import express from 'express'
import { cardValidation } from '~/validations/cardValidation.js'
import { cardController } from '~/controllers/cardController.js'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

export const cardRoute = Router
