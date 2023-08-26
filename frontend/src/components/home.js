import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const userEmail = localStorage.getItem("userEmail");
  const [translatedEvent, setTranslatedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTModal, setTShowModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventName, setSelectedEventName] = useState("");

  useEffect(() => {
    if (selectedEventId) {
      const selectedEvent = events.find(
        (event) => event.id === selectedEventId
      );
      setSelectedEventName(selectedEvent ? selectedEvent.title : "");
    }
  }, [selectedEventId, events]);
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    axios
      .get("/events/")
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error.response.data);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/login");
    window.location.reload();
  };

  const handleJoinEvent = () => {
    if (!userEmail) {
      navigate("/login");
      return;
    }

    if (selectedEventId) {
      axios
        .post("/events/joinEvent", {
          eventId: selectedEventId,
          userEmail: userEmail,
        })
        .then((response) => {
          console.log("Joined the event successfully!", response.data);
          setSelectedEventName(
            events.find((event) => event.id === selectedEventId).title
          );
          setShowSuccessMessage(true);
        })
        .catch((error) => {
          console.error("Error joining the event:", error.response.data);
        });
    }
  };

  const handleTranslation = async (eventId) => {
    if (!eventId) {
      console.error("No event selected for translation.");
      return;
    }

    try {
      const response = await axios.post("/events/translate", {
        eventId: eventId,
      });

      console.log("Translation success!", response.data);

      setTranslatedEvent(response.data);
      const parsedEvent = JSON.parse(response.data.body);

      setTranslatedEvent(parsedEvent);
      console.log(response.data);

      setTShowModal(true);
    } catch (error) {
      console.error("Error translating event details:", error.response.data);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowSuccessMessage(false);
    setSelectedEventId(null);
    navigate("/profile");
  };
  const handleTModalClose = () => {
    console.log("Translated Event Details (French):", translatedEvent);
    setTShowModal(false);
    setSelectedEventId(null);
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
              <Link to="/profile" className="nav-link">
                Welcome, <u>{userEmail} </u>
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
      <h2>Upcoming Events</h2>
      {events.map((event) => (
        <div key={event.id} className="event-card">
          <h3>{event.title}</h3>
          <p>Date: {event.date}</p>
          <p>Location: {event.location}</p>
          <p>Description: {event.description}</p>
          <p>Requirements: {event.preRequirements}</p>
          <button
            className="join-btn"
            onClick={() => {
              setSelectedEventId(event.id);
              setShowModal(true);
            }}
          >
            Join the Event
          </button>
          <span> </span>
          <button
            className="join-btn"
            onClick={() => {
              handleTranslation(event.id);
            }}
          >
            French Translation
          </button>
        </div>
      ))}

      {showTModal && translatedEvent && (
        <div className="modal">
          <h3 className="modal-title">Translated Event Details (French)</h3>
          <div className="modal-content">
            <p>
              <strong>Title:</strong> {translatedEvent.title}
            </p>
            <p>
              <strong>Description:</strong> {translatedEvent.description}
            </p>
            <p>
              <strong>Pre-Requirements:</strong>{" "}
              {translatedEvent.preRequirements}
            </p>
          </div>
          <button className="close-btn" onClick={handleTModalClose}>
            Close
          </button>
        </div>
      )}
      {showModal && (
        <div className="modal">
          {showSuccessMessage ? (
            <>
              <h3 className="modal-title">
                You have successfully joined the event!
              </h3>
              <button className="close-btn" onClick={handleModalClose}>
                Close
              </button>
            </>
          ) : (
            <>
              <h3 className="modal-title">
                Please confirm you want to join "{selectedEventName}"?
              </h3>
              <div className="modal-btn-container">
                <button className="confirm-btn" onClick={handleJoinEvent}>
                  Confirm
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
