/* eslint-disable no-console */

import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb.js'
import { env } from '~/config/environment.js'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware.js'
import cookieParser from 'cookie-parser'
//xử lí socket real-time với socket.io
import socketIo from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from '~/sockets/inviteUserToBoardSocket'
const START_SERVER = () => {
  const app = express()

  //fix cái cache from disk của expressjs
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  //config cookie parser
  app.use(cookieParser())
  //enable cors
  app.use(cors(corsOptions))
  //enable req.body json data
  app.use(express.json())
  app.get('/', async (req, res) => {
    res.end('<h1>Hello World!</h1><hr>')
  })

  //user apis v1
  app.use('/v1', APIs_V1)

  //middleware xử lí lỗi tập trung
  app.use(errorHandlingMiddleware)

  //Tạo một cái server mới bọc thằng app của express dể làm việc với socket.io
  const server = http.createServer(app)
  //Khởi tạo socket.io và cấu hình cors
  const io = socketIo(server, { cors: corsOptions })

  //Tạo một cái socket để lắng nghe sự kiện connection
  io.on('connection', (socket) => {
    //gọi socket tùy theo tính năng
    inviteUserToBoardSocket(socket)
  })

  if (env.BUILD_MODE === 'production') {
    //production
    //Dùng server.listen để listen cái port của server thay vì app vì server đã được bọc bởi socket.io
    server.listen(process.env.PORT, () => {
      console.log(`3.Production: Hello ${ env.AUTHOR }, BE Server is runing successfully at port: ${ process.env.PORT }/`)
    })
  } else {
    //dev
    //Dùng server.listen để listen cái port của server thay vì app vì server đã được bọc bởi socket.io
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. Hello ${ env.AUTHOR }, I am running at ${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }


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


