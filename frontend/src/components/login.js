import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      navigate("/home");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("/users/login", formData)
      .then((response) => {
        console.log("Login successful!", response.data);
        localStorage.setItem("userEmail", formData.email);
        navigate("/home");
      })
      .catch((error) => {
        console.error("Login failed:", error.response.data);
        setErrorMessage("Invalid email or password");
      });
  };

  return (
    <div className="form-container">
      <h1>Sign in</h1>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          value={formData.email}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={formData.password}
          required
        />
        <button type="submit">Sign In</button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
      <p>
        Skip and go to <Link to="/home">Events</Link>
      </p>
    </div>
  );
};

export default Login;
