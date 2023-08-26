const AWS = require("aws-sdk");
const translate = new AWS.Translate({
  apiVersion: "2017-07-01",
  region: "",
  credentials: new AWS.Credentials({
    accessKeyId: "",
    secretAccessKey: "",
  }),
});

exports.handler = async (event) => {
  try {
    const { title, description, preRequirements } = event;

    const translatedTitle = await translateText(title, "fr");
    const translatedDescription = await translateText(description, "fr");
    const translatedPreRequirements = await translateText(
      preRequirements,
      "fr"
    );

    console.log(translatedPreRequirements);

    const translatedEvent = {
      title: translatedTitle,
      description: translatedDescription,
      preRequirements: translatedPreRequirements,
    };

    const response = {
      statusCode: 200,
      body: JSON.stringify(translatedEvent),
    };
    return response;
  } catch (error) {
    console.error("Error translating event details:", error);
    const response = {
      statusCode: 500,
      body: JSON.stringify({ error: "Error translating event details" }),
    };
    return response;
  }
};

const translateText = async (text, targetLanguageCode) => {
  const params = {
    Text: text,
    SourceLanguageCode: "en",
    TargetLanguageCode: targetLanguageCode,
  };

  return new Promise((resolve, reject) => {
    translate.translateText(params, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data.TranslatedText);
      }
    });
  });
};
