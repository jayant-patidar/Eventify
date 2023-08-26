const express = require("express");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const axios = require("axios");

const router = express.Router();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

router.get("/", (req, res) => {
  const params = {
    TableName: "EventsTable1",
  };

  dynamoDB.scan(params, (error, data) => {
    if (error) {
      console.error("Error querying events data:", error);
      return res.status(500).json({ error: "Error fetching events" });
    }

    const events = data.Items;

    return res.json(events);
  });
});

// Create Event Route
router.post("/", async (req, res) => {
  const { title, date, location, description, preRequirements } = req.body;
  const userEmail = req.body.user;

  const params = {
    TableName: "EventsTable1",
    Item: {
      id: uuidv4(),
      title,
      date,
      location,
      description,
      preRequirements,
      createdBy: userEmail,
      participants: [],
    },
  };

  try {
    await dynamoDB.put(params).promise();

    // Retrieve the API Gateway URL from Secrets Manager
    const secretsManager = new AWS.SecretsManager();
    const secretName = "APIGatewayURL";
    const secret = await secretsManager
      .getSecretValue({ SecretId: secretName })
      .promise();

    console.log(secret.SecretString);
    const apiGatewayUrl = secret.SecretString;
    console.log(apiGatewayUrl);
    // Make the API Gateway call using the retrieved URL
    const response = await axios.post(apiGatewayUrl, req.body);
    console.log("API Gateway response:", response.data);

    return res.json({ message: "Event created successfully" });
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ error: "Error creating event" });
  }
});

// Edit Event Route
router.put("/:id", (req, res) => {
  const eventId = req.params.id;
  const { title, date, location, description, preRequirements } = req.body;

  // Update event data in DynamoDB
  const params = {
    TableName: "EventsTable1",
    Key: { id: eventId },
    UpdateExpression:
      "set title = :title, date = :date, location = :location, description = :description, preRequirements = :preRequirements",
    ExpressionAttributeValues: {
      ":title": title,
      ":date": date,
      ":location": location,
      ":description": description,
      ":preRequirements": preRequirements,
    },
    ReturnValues: "UPDATED_NEW",
  };

  dynamoDB.update(params, (error) => {
    if (error) {
      console.error("Error updating event data:", error);
      return res.status(500).json({ error: "Error updating event" });
    }

    return res.json({ message: "Event updated successfully" });
  });
});

// Delete Event Route
router.delete("/:id", (req, res) => {
  const eventId = req.params.id;

  // Delete event data from DynamoDB
  const params = {
    TableName: "EventsTable1",
    Key: { id: eventId },
  };

  dynamoDB.delete(params, (error) => {
    if (error) {
      console.error("Error deleting event:", error);
      return res.status(500).json({ error: "Error deleting event" });
    }

    return res.json({ message: "Event deleted successfully" });
  });
});

// Get Single Event by ID Route
router.get("/:id", (req, res) => {
  const eventId = req.params.id;

  // Query a specific event from DynamoDB based on the provided ID
  const params = {
    TableName: "EventsTable1",
    Key: {
      id: eventId,
    },
  };

  dynamoDB.get(params, (error, data) => {
    if (error) {
      console.error("Error querying event data:", error);
      return res.status(500).json({ error: "Error fetching event by ID" });
    }

    if (!data.Item) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = data.Item;

    return res.json(event);
  });
});

router.post("/getEventsByCreatedBy", (req, res) => {
  const { userEmail } = req.body;

  const params = {
    TableName: "EventsTable1",
  };

  dynamoDB.scan(params, (error, data) => {
    if (error) {
      console.error("Error querying events data:", error);
      return res.status(500).json({ error: "Error fetching events data" });
    }

    const events = data.Items.filter((event) => event.createdBy === userEmail);

    return res.json({ events });
  });
});

router.post("/joinEvent", (req, res) => {
  const { eventId, userEmail } = req.body;

  const getParams = {
    TableName: "EventsTable1",
    Key: {
      id: eventId,
    },
  };

  dynamoDB.get(getParams, (error, data) => {
    if (error) {
      console.error("Error fetching event data:", error);
      return res.status(500).json({ error: "Error joining the event" });
    }

    const event = data.Item;

    if (!Array.isArray(event.participants)) {
      event.participants = [];
    }

    const updatedParticipants = [...event.participants, userEmail];

    const updateParams = {
      TableName: "EventsTable1",
      Key: {
        id: eventId,
      },
      UpdateExpression: "SET participants = :participants",
      ExpressionAttributeValues: {
        ":participants": updatedParticipants,
      },
    };

    dynamoDB.update(updateParams, (error) => {
      if (error) {
        console.error("Error updating event data:", error);
        return res.status(500).json({ error: "Error joining the event" });
      }

      return res.json({ message: "Joined the event successfully" });
    });
  });
});

router.post("/getEventsByUserEmail", (req, res) => {
  const { userEmail } = req.body;

  const params = {
    TableName: "EventsTable1",
  };

  dynamoDB.scan(params, (error, data) => {
    if (error) {
      console.error("Error querying events data:", error);
      return res.status(500).json({ error: "Error fetching events data" });
    }

    const events = data.Items.filter(
      (event) =>
        Array.isArray(event.participants) &&
        event.participants.includes(userEmail)
    );

    return res.json({ events });
  });
});

router.post("/translate", (req, res) => {
  const { eventId } = req.body;

  const params = {
    TableName: "EventsTable1",
    Key: {
      id: eventId,
    },
  };

  dynamoDB.get(params, async (error, data) => {
    if (error) {
      console.error("Error fetching event data for translation:", error);
      return res.status(500).json({ error: "Error translating event details" });
    }

    const event = data.Item;

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    try {
      const apiGatewayUrl =
        "https://3lniiq76ra.execute-api.us-east-1.amazonaws.com/translate/";
      const response = await axios.post(apiGatewayUrl, event);

      return res.json(response.data);
    } catch (error) {
      console.error("Error making a post call to Lambda API Gateway:", error);
      return res.status(500).json({ error: "Error translating event details" });
    }
  });
});

module.exports = router;
