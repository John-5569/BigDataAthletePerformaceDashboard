import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate();

  return (
    <div className="hero-container">
      <div className="overlay"></div>
      <div className="content">
        <h1 className="title">VICTORY <span className="highlight">STARTS</span> HERE</h1>
        <p className="subtitle">Join the elite community of athletes and fans.</p>
        
        <div className="button-group">
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            GET STARTED
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>
            MEMBER LOGIN
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home