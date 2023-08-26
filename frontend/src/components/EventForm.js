import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const EventForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    preRequirements: "",
  });

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");

    navigate("/login");

    window.location.reload();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("/events", {
        ...formData,
        user: userEmail,
      })
      .then((response) => {
        console.log("Event created successfully!", response.data);
        navigate("/home");
      })
      .catch((error) => {
        console.error("Error creating event:", error.response.data);
      });
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
              <Link to="/profile" style={{ marginRight: "10px" }}>
                Welcome, <u>{userEmail}</u>
              </Link>
              <span> | </span>
              <Link to="/home">
                <u>Go to Home</u>
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
      <h1>Post an Event</h1>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Pre-Requirements:</label>
            <textarea
              name="preRequirements"
              value={formData.preRequirements}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
