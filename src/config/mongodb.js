/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { env } from '~/config/environment.js'


import { MongoClient, ServerApiVersion } from 'mongodb'

// khởi tạo biến lưu trữ instance của MongoDB = null (vì chúng ta chưa connect)
let trelloDatabaseInstance = null

// khởi tạo instance của MongoClient để connect vào MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  // lưu ý: cấu hình serverApi có từ bản 5.0 trở đi, có thể không càn dùng nó, nếu có dùng nó chúng ta sẽ chỉ định một cái  stable API version của mongodb
  //đọc thêm ở đây: https://www.mongodb.com/docs/drivers/node/current/fundamentals/stable-api/
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

//kết nối tới MongoDB
export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()

  //kết nối thành công thì lấy  ra database theo tên và gán ngược vào lại biên trelloDatabaseInstance ở trên của chúng ta
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

//Đóng kết nối tới MongoDB
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}


//function GET_DB (ko async) này có nhiệm vụ export cái trello database Instance sau khi đã connect thành công tới mongodb để chúng ta sử dụng chúng nhiều nơi khác nhau trong code
//Lưu ý phải đảm bảo chỉ luôn gọi cái GET_DB sau khi đã connect thành công tới MongoDB
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Connect to MongoDB first!')
  return trelloDatabaseInstance
}

