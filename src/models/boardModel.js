import joi from 'joi'

//define conlection (name, schema)
const BOARD_CONLECTION_NAME = 'boards'

const BOARD_CONLECTION_SCHEMA = joi.object({
  title: joi.string().required().min(3).max(50).trim().strict(),
  slug: joi.string().required().min(3).trim().strict(),
  description: joi.string().optional().min(1).max(256).trim().strict(),

  columnOrderIds: joi.array().items(joi.string().default([])),
  createdAt: joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: joi.date().timestamp('javascript').default(null),
  _destroy: joi.boolean().default(false)
})

export const boardModel = {
  BOARD_CONLECTION_NAME,
  BOARD_CONLECTION_SCHEMA
}
