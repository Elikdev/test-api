import axios from 'axios'

const instance = axios.create({
    baseURL:process.env.PAYSTACK_URL,
    headers: {
        Authorization:`Bearer ${process.env.PAYSTACK_SECRET}`
    },

})

class Paystack{
    static async verifyPayment(reference:string){     
        try{
            const response = await instance.get(`/transaction/verify/${reference}`)
            return response
        }catch(error){
            throw error
        }
    }
}

export default Paystack