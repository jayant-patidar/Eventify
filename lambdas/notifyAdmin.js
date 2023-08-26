const AWS = require("aws-sdk");

const sns = new AWS.SNS();

exports.handler = async (event) => {
  try {
    const { title, date, location, description, preRequirements, user } = event;

    const emailContent = `
      New Event Created:
      Title: ${title}
      Date: ${date}
      Location: ${location}
      Description: ${description}
      Requirements: ${preRequirements}
      Created By: ${user}
    `;

    const params = {
      Message: emailContent,
      Subject: "New Event Created",
      TopicArn: "arn:aws:sns:us-east-1:605014000255:adminNotifyTopic",
    };

    await sns.publish(params).promise();

    return {
      statusCode: 200,
      body: "Email sent successfully!",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: "Error sending email",
    };
  }
};
