const express = require("express");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const router = express.Router();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Registration Route
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  // Check if the email already exists
  const params = {
    TableName: "UsersTable",
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  dynamoDB.scan(params, (error, data) => {
    if (error) {
      console.error("Error querying user data:", error);
      return res.status(500).json({ error: "Error registering user" });
    }

    const users = data.Items;

    if (users.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Save user data in DynamoDB
    const params = {
      TableName: "UsersTable",
      Item: {
        id: uuidv4(),
        name,
        email,
        password,
      },
    };

    dynamoDB.put(params, (error) => {
      if (error) {
        console.error("Error saving user data:", error);
        return res.status(500).json({ error: "Error registering user" });
      }

      return res.json({ message: "User registered successfully" });
    });
  });
});

// Login Route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Perform a full table scan to find the user with the matching email
  const params = {
    TableName: "UsersTable1",
  };

  dynamoDB.scan(params, (error, data) => {
    if (error) {
      console.error("Error querying user data:", error);
      return res.status(500).json({ error: "Error logging in" });
    }

    const users = data.Items;

    // Find the user with the matching email
    const user = users.find((user) => user.email === email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // If login is successful, you can return the user data or a JWT token for authentication
    return res.json({ message: "Login successful", user });
  });
});
// Profile Route
router.get("/profile", (req, res) => {
  const userEmail = req.body.user; // Extract user email from the request body

  // Check if the user exists in the database
  const params = {
    TableName: "UsersTable1",
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": userEmail,
    },
  };

  dynamoDB.scan(params, (error, data) => {
    if (error) {
      console.error("Error querying user data:", error);
      return res.status(500).json({ error: "Error fetching user data" });
    }

    const users = data.Items;

    if (users.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    // User found, fetch events created by the user
    const user = users[0];

    // Fetch events created by the user
    const eventsParams = {
      TableName: "EventsTable1",
      FilterExpression: "createdBy = :createdBy",
      ExpressionAttributeValues: {
        ":createdBy": user.email,
      },
    };

    dynamoDB.scan(eventsParams, (error, eventsData) => {
      if (error) {
        console.error("Error querying events data:", error);
        return res.status(500).json({ error: "Error fetching events data" });
      }

      const userEvents = eventsData.Items;

      // Return user details and events created by the user
      return res.json({ user, userEvents });
    });
  });
});

// users API to get user details by email
router.post("/getUserByEmail", (req, res) => {
  const { userEmail } = req.body;

  // Perform a full table scan to find the user with the matching email
  const params = {
    TableName: "UsersTable1",
  };

  dynamoDB.scan(params, (error, data) => {
    if (error) {
      console.error("Error querying user data:", error);
      return res.status(500).json({ error: "Error fetching user data" });
    }

    const users = data.Items;

    // Find the user with the matching email
    const user = users.find((user) => user.email === userEmail);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  });
});

module.exports = router;
