import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminUserPerformance.css";

const AdminUserPerformance = () => {
  const { email } = useParams();
  const [data, setData] = useState(null);
  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_BASE}/admin/user-performance/${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [email]);

  if (!data) return <div className="performance-loading">Loading...</div>;

  return (
    <div className="performance-container">
      <div className="performance-header">
        <h1>PERFORMANCE INSIGHTS</h1>
        <p>{email}</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Average Sleep</h3>
          <p>{data.avg_sleep} hrs</p>
        </div>

        <div className="metric-card">
          <h3>Average HRV</h3>
          <p>{data.avg_hrv}</p>
        </div>

        <div className="metric-card">
          <h3>Max Sleep</h3>
          <p>{data.max_sleep} hrs</p>
        </div>

        <div className="metric-card">
          <h3>Min Sleep</h3>
          <p>{data.min_sleep} hrs</p>
        </div>
      </div>
    </div>
  );
};

export default AdminUserPerformance;
