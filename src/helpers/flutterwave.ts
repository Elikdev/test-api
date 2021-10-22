import axios from "axios";

export const verifyPaymentFromFlutterWave = async (endpoint: string) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FLUTTER_WAVE_SEC_KEY}`,
    },
  };

  try {
    const url = `${process.env.FLUTTER_WAVE_URL}/${endpoint}`;

    const { data } = await axios.get(url, config);

    return { data_received: data };
  } catch (error) {
    if (error.response) {
      console.log("Error from Flutterwave API >>> ", error.response.data);
      console.log("Status: ", error.response.status);
      console.log(error.response.headers);

      return { error: true, error_data: error.response.data };
    } else if (error.request) {
      console.log("Error from Flutterwave API >>> ", error.request);
      return { error: true, error_data: error?.request?.data };
    }
  }
};
