const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'


let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customeSubject, customHtmlContent) => {
  //tạo một cái sendSmtpEmail với nhưng thông tin cần thiết
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  //tài khoảng gửi mail: luu ý địa chỉ admin email phải là cái email mà cá ban phải tạo trước đó trên Brevo
  sendSmtpEmail.sender = {
    name: env.ADMIN_EMAIL_NAME,
    email: env.ADMIN_EMAIL_ADDRESS
  }

  //những tài khoản nhận email
  //'to' phải là một array để sau chúng ta có thể tùy biến gửi 1 email tơi cho nhiều user tùy tính năng dự án
  sendSmtpEmail.to = [{ email: recipientEmail }]

  //thông tin email
  sendSmtpEmail.subject = customeSubject
  sendSmtpEmail.htmlContent = customHtmlContent

  //gửi email
  const result = await apiInstance.sendTransacEmail(sendSmtpEmail)

  return result
}

export const brevoProvider = {
  sendEmail
}