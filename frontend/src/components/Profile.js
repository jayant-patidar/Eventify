import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const [userDetails, setUserDetails] = useState({});
  const [userEvents, setUserEvents] = useState([]);
  const [userParticipatedEvents, setUserParticipatedEvents] = useState([]);
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    if (userEmail) {
      fetchUserDetails();
      fetchUserEvents();
      fetchUserParticipatedEvents();
    }
  }, [userEmail]);

  const fetchUserDetails = () => {
    axios
      .post("/users/getUserByEmail", {
        userEmail: userEmail,
      })
      .then((response) => {
        setUserDetails(response.data.user);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error.response.data);
      });
  };

  const fetchUserEvents = () => {
    axios
      .post("/events/getEventsByCreatedBy", {
        userEmail: userEmail,
      })
      .then((response) => {
        setUserEvents(response.data.events);
      })
      .catch((error) => {
        console.error("Error fetching user events:", error.response.data);
      });
  };

  const fetchUserParticipatedEvents = () => {
    axios
      .post("/events/getEventsByUserEmail", {
        userEmail: userEmail,
      })
      .then((response) => {
        setUserParticipatedEvents(response.data.events);
      })
      .catch((error) => {
        console.error(
          "Error fetching user participated events:",
          error.response.data
        );
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/login");
    window.location.reload();
  };

  return (
    <div>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "40px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>Eventify</h1>
        </div>
        <div>
          {userEmail ? (
            <>
              <Link to="/home" style={{ marginRight: "10px" }}>
                <u>Go to Home</u>
              </Link>
              <span> | </span>
              <Link to="/post-event">
                <u>Post an Event</u>
              </Link>
              <span> | </span>
              <Link onClick={handleLogout}>
                <u>Logout</u>
              </Link>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>
      <div style={{ margin: "20px" }}>
        <h1>User Profile</h1>

        <div>
          <p>Name: {userDetails.name}</p>
          <p>Email: {userDetails.email}</p>
        </div>
        <h2>Events You Have Created</h2>
        {userEvents.length > 0 ? (
          userEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <p>Date: {event.date}</p>
              <p>Location: {event.location}</p>
              <p>Requirements: {event.preRequirements}</p>
              <p>Participants :</p>
              <ul>
                {event.participants.map((participant, index) => (
                  <li key={index}>{participant}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No events created by the user</p>
        )}
        <h2>Events You Have Participated In</h2>
        {userParticipatedEvents.length > 0 ? (
          userParticipatedEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <p>Date: {event.date}</p>
              <p>Location: {event.location}</p>
              <p>Requirements: {event.preRequirements}</p>
            </div>
          ))
        ) : (
          <p>No events participated by the user</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
