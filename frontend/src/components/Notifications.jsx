import { useEffect, useState } from "react";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setNotifications(res.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    await axios.put(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotification = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div>
      <h3>Notifications</h3>
      {notifications.length === 0 ? <p>No notifications</p> : (
        notifications.map(n => (
          <div key={n.id} style={{ padding: "10px", borderBottom: "1px solid gray" }}>
            <p>{n.message}</p>
            {!n.is_read && <button onClick={() => markAsRead(n.id)}>Mark as Read</button>}
            <button onClick={() => deleteNotification(n.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
