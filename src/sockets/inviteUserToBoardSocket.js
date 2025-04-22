export const inviteUserToBoardSocket = (socket) => {
  //Lắng nghe sự kiện FE_USER_INVITED_TO_BOARD mà client emit lên
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    //Cách làm nhanh nhất và đơn giản nhất là emit ngược lại về cho client khác (ngoại trừ chính cái thẳng gửi request lên) , rồi đẻ phía FE check
    socket.broadcast.emit('FE_USER_INVITED_TO_BOARD', invitation)
  })
}
