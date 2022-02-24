import axios from "axios"

const token = process.env.INFOBIP_TOKEN
const url = `${process.env.INFOBIP_BASE_URL}/sms/2/text/advanced`

interface smsResponse {
 sms_error: boolean
}

const sendBulkSms =  async (options: {numbers: (string | number)[];  message: any; from: any}): Promise<smsResponse> => {
 const {numbers, message, from} = options

 //format numbers
 let eachNumbers = numbers.map((num) => {return {to: num}})
try {
 const body = {
  messages: [
   {
    from: from,
    destinations: [
     ...eachNumbers
    ],
    text: message
   }
  ]
 }
 const config = {
  headers: {
   "Content-Type": "application/json",
   "Authorization": `App ${token}`
  }
 }
 const {data} = await axios.post(url, body, config)

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