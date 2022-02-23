import axios from "axios"

const token = process.env.D7_TOKEN
const url = process.env.D7_URL

interface smsResponse {
 sms_error: boolean
}

const sendBulkSms =  async (options: {numbers: (string | number)[];  message: any; from: any}): Promise<smsResponse> => {
 const {numbers, message, from} = options
try {
 const body = {
  messages: [
   {
    to: numbers,
    content: message,
    from: from
   }
  ]
 }
 const config = {
  headers: {
   "Content-Type": "application/json",
   "Authorization": `Basic ${token}`
  }
 }
 const {data} = await axios.post(url, body, config)
 console.log(data?.data?.batchId)
 return {sms_error: false}
} catch (error) {
 if(error.response){
  console.log(error?.response?.data)
  return {sms_error: true}
 }
 console.log(error)
 return{sms_error: true}
}
}

export default sendBulkSms