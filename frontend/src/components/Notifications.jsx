import { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css"

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setNotifications(res.data || []);
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
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <div className="notifications-container">
          {notifications.map(n => (
            <div 
              key={n.id} 
              className={`notification ${n.is_read ? 'read' : 'unread'}`} 
              onClick={() => markAsRead(n.id)}
            >
              <p>{n.message}</p>
              <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id)}}> 
                Delete 
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
