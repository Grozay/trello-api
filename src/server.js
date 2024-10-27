/* eslint-disable no-console */

/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb.js'
import { env } from '~/config/environment.js'


const START_SERVER = () => {
  const app = express()

  app.get('/', async (req, res) => {
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`3. Hello ${ env.AUTHOR }, I am running at ${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

  // Thực hiện các tác vụ Clean up
  exitHook(() => {
    console.log('4. Server is shutting down...')
    CLOSE_DB()
    console.log('5. MongoDB connection closed!')
  })
}


//Chỉ khi kết nối với db thành công mới start server lên
(async () => {
  try {
    console.log('1. Connecting to MongoDB...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB successfully!')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()


