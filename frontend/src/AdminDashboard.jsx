import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const debounceRef = useRef(null);

  const API_BASE = "http://127.0.0.1:8000";

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= MANAGE ================= */
  const openManage = (user) => {
    setSelectedUser({ ...user });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE}/admin/manage`,
        {
          email: selectedUser.email,
          username: selectedUser.username,
          role: selectedUser.role.toLowerCase()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (email) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${email}?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/admin/delete`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          email: email
        }
      });

      alert("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  /* ================= SEARCH ================= */
  const handleSearch = (value) => {
    setSearchText(value);
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (value.trim() === "") {
        fetchUsers();
        return;
      }

      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE}/admin/search?text=${value}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
            MVP<span>ADMIN</span>
          </div>

          <nav className="nav-menu">
            <div className="nav-item active">USER ROSTER</div>
          </nav>

          <div className="nav-item logout-item" onClick={handleLogout}>
            LOGOUT
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>ATHLETE DATABASE</h1>
          </div>

          <div className="header-right">
            <input
              className="search-input"
              placeholder="Search username or email..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="user-count">
              TOTAL ENTRIES: {users.length}
            </div>
          </div>
        </header>

        <div className="table-container">
          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>USERNAME</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th className="action-header">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.email}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role.toUpperCase()}</td>

                    <td>
                      <div className="action-group">
                        <button
                          className="manage-btn"
                          onClick={() => openManage(u)}
                        >
                          MANAGE
                        </button>

                        <button
                          className="view-btn"
                          onClick={() =>
                            navigate(`/admin/performance/${u.email}`)
                          }
                        >
                          VIEW
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(u.email)}
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* MODAL */}
      {showModal && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Manage User</h2>

            <div className="modal-fields">
              <div className="field">
                <label>Username</label>
                <input
                  value={selectedUser.username}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      username: e.target.value
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value
                    })
                  }
                >
                  <option value="admin">admin</option>
                  <option value="user">user</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleUpdate}>
                SAVE
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
