import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import React, { useEffect, useState } from "react";
import AWS from "aws-sdk";

import NotFound from "./components/NotFound";
import "./App.css";
import Login from "./components/login";
import Register from "./components/register";
import Home from "./components/home";
import EventForm from "./components/EventForm";
import Profile from "./components/Profile";

function App() {
  const [backendElasticIp, setBackendElasticIp] = useState("");
  useEffect(() => {
    const dynamoDBConfig = {
      region: "us-east-1",
    };

    AWS.config.update(dynamoDBConfig);

    const secretsManager = new AWS.SecretsManager();

    const getSecretValue = () => {
      const params = {
        SecretId: "MyElasticIPSecret",
      };

      secretsManager.getSecretValue(params, (err, data) => {
        if (err) {
          console.error("Error retrieving secret:", err);
        } else {
          try {
            const secretValue = JSON.parse(data.SecretString);
            console.log("Secret value:", secretValue);
            setBackendElasticIp(secretValue.backendElasticIp);
          } catch (parseError) {
            console.error("Error parsing secret value:", parseError);
          }
        }
      });
    };

    getSecretValue();
  }, []);
  axios.defaults.baseURL = "http://${backendElasticIp}:8000";
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/post-event" element={<EventForm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
