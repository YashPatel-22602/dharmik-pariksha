const axios = require("axios");

const sendSms = async (mobileNumber, message) => {
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      new URLSearchParams({
        route: "q",
        message: message,
        numbers: mobileNumber
      }).toString(),
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    console.log("SMS sent:", response.data);
    return response.data;

  } catch (error) {
    console.error(
      "SMS Error:",
      error.response?.data || error.message
    );
  }
};

module.exports = sendSms;
