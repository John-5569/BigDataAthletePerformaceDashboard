import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import './UserDashboard.css';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function UserDashboard() {
  const [activeTab, setActiveTab] = useState('management');
  const [username, setUsername] = useState('Athlete');
  const [biometrics, setBiometrics] = useState({ sleep: '', hrv: '' });
  const [csvFile, setCsvFile] = useState(null);

  const [analysisData, setAnalysisData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const navigate = useNavigate();
  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.sub || decoded.username || decoded.email);
    } catch (error) {
      handleLogout();
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // -------------------------
  // FETCH BIOMETRIC ANALYSIS
  // -------------------------
  const fetchAnalysis = async () => {
    const token = localStorage.getItem('token');
    setLoadingAnalysis(true);

    try {
      const response = await axios.get(
        `${API_BASE}/user/get_biometrics`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAnalysisData(response.data);
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to load analysis");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // -------------------------
  // Manual Biometrics Submit
  // -------------------------
  const handleLogSession = async () => {
    const token = localStorage.getItem('token');
    if (!biometrics.sleep || !biometrics.hrv) {
      alert("Please enter valid values");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/user/biometrics`,
        {
          sleep_hours: parseFloat(biometrics.sleep),
          hrv: parseInt(biometrics.hrv)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Biometrics saved successfully');
      setBiometrics({ sleep: '', hrv: '' });
    } catch (error) {
      alert(error.response?.data?.detail || "Error saving biometrics");
    }
  };

  // -------------------------
  // CSV Upload
  // -------------------------
  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleCsvUpload = async () => {
    const token = localStorage.getItem('token');

    if (!csvFile) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await axios.post(
        `${API_BASE}/user/biometrics/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert(`Upload Successful. Rows inserted: ${response.data.rows_inserted}`);
      setCsvFile(null);
    } catch (error) {
      alert(error.response?.data?.detail || "CSV upload failed");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">MVP<span>PLAYER</span></div>
          <div style={{color: '#ff4d00', marginTop: '10px', fontSize: '0.85rem'}}>
            {username}
          </div>
        </div>

        <nav className="nav-menu">
          <div
            className={`nav-item ${activeTab === 'management' ? 'active' : ''}`}
            onClick={() => setActiveTab('management')}
          >
            Data Management
          </div>
          <div
            className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('analysis');
              fetchAnalysis();
            }}
          >
            Performance Analysis
          </div>
        </nav>

        <div className="logout-container">
          <button className="logout-link" onClick={handleLogout}>LOGOUT</button>
        </div>
      </aside>

      <main className="main-content">
        {activeTab === 'management' ? (
          <div>
            <h1 className="page-title">Data Ingestion</h1>

            <div className="card-grid">
              <div className="sports-card">
                <h2>Manual Biometrics</h2>

                <label className="input-label">Sleep Hours</label>
                <input
                  type="number"
                  className="sports-input"
                  value={biometrics.sleep}
                  onChange={(e) =>
                    setBiometrics({...biometrics, sleep: e.target.value})
                  }
                />

                <label className="input-label">HRV</label>
                <input
                  type="number"
                  className="sports-input"
                  value={biometrics.hrv}
                  onChange={(e) =>
                    setBiometrics({...biometrics, hrv: e.target.value})
                  }
                />

                <button className="sports-btn" onClick={handleLogSession}>
                  Log Session
                </button>
              </div>

              <div className="sports-card">
                <h2>Big Data Upload (CSV)</h2>

                <input
                  type="file"
                  accept=".csv"
                  className="sports-input"
                  onChange={handleFileChange}
                />

                <button className="sports-btn" onClick={handleCsvUpload}>
                  Ingest Sensor Data
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="analysis-view">
            <h1 className="page-title">Performance Insights</h1>

            {loadingAnalysis ? (
              <p>Loading...</p>
            ) : analysisData ? (
              <>
                <div className="card-grid">
                  <div className="sports-card">
                    <h2>Average Sleep</h2>
                    <p style={{fontSize: "2rem"}}>{analysisData.avg_sleep.toFixed(2)} hrs</p>
                  </div>

                  <div className="sports-card">
                    <h2>Average HRV</h2>
                    <p style={{fontSize: "2rem"}}>{analysisData.avg_hrv.toFixed(2)}</p>
                  </div>

                  <div className="sports-card">
                    <h2>Max Sleep</h2>
                    <p style={{fontSize: "2rem"}}>{analysisData.max_sleep.toFixed(2)} hrs</p>
                  </div>

                  <div className="sports-card">
                    <h2>Min Sleep</h2>
                    <p style={{fontSize: "2rem"}}>{analysisData.min_sleep.toFixed(2)} hrs</p>
                  </div>
                </div>

                <div className="sports-card" style={{marginTop: "30px"}}>
                  <h2>Sleep Analytics Overview</h2>
                  <Line
                    data={{
                      labels: ["Average", "Maximum", "Minimum"],
                      datasets: [
                        {
                          label: "Sleep Hours",
                          data: [
                            analysisData.avg_sleep,
                            analysisData.max_sleep,
                            analysisData.min_sleep
                          ],
                          borderColor: "#ff4d00",
                          backgroundColor: "rgba(255,77,0,0.2)",
                          tension: 0.4
                        }
                      ]
                    }}
                  />
                </div>
              </>
            ) : (
              <p>No biometric data available.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default UserDashboard;
