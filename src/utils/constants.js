/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

//những domain được phép truy cập vào tài nguyên của server
export const WHITELIST_DOMAINS = [
  'http://localhost:5173' //không cần thiết localhost nữa vì file config/cors đã luôn cho môi trường dev rồi
  //đẩy lên domain chính thức
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}
