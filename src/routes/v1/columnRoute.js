import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController.js'

const Router = express.Router()

Router.route('/')
  .post(columnValidation.createNew, columnController.createNew)

export const columnRoute = Router
