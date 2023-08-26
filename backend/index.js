const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const app = express();

// Configure AWS DynamoDB
const dynamoDBConfig = {
  region: "us-east-1",
};
AWS.config.update(dynamoDBConfig);

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// User Component
const userRoutes = require("./app/components/users/users");
app.use("/users", userRoutes);

// Event Component
const eventRoutes = require("./app/components/events/events");
app.use("/events", eventRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
