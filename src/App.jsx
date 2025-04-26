import React, { useEffect, useState, useRef } from 'react';
import { embedDashboard } from "@superset-ui/embedded-sdk";
import axios from 'axios';
import Login from './Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [supersetUrl, setSupersetUrl] = useState(null);
  const [status, setStatus] = useState('Please log in to view dashboards');
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  
  // You can add this to your state if you want to select from multiple dashboards
  const dashboardId = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  
  // Handle successful login
  const handleLoginSuccess = (token, csrf, url) => {
    setAccessToken(token);
    setCsrfToken(csrf);
    setSupersetUrl(url);
    setIsAuthenticated(true);
    setStatus('Successfully logged in. Loading dashboard...');
    
    // Automatically load the dashboard after login
    loadDashboard(token, csrf, url);
  };
  
  const loadDashboard = async (token, csrf, url) => {
    try {
      setStatus('Requesting guest token...');

      // Step 3: Get guest token
      const guestTokenResponse = await axios.post(
        `${url}/api/v1/security/guest_token/`,
        {
          resources: [
            {
              type: "dashboard",
              id: dashboardId
            }
          ],
          rls: [],
          user: {
            username: "guest_user",
            first_name: "Guest",
            last_name: "User"
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrf,
            "Content-Type": "application/json",
            Cookie: `csrf_token=${csrf}`
          }
        }
      );

      const guestToken = guestTokenResponse.data.token;
      console.log("Guest token obtained");
      setStatus('Embedding dashboard...');

      // Step 4: Embed Superset dashboard
      embedDashboard({
        id: dashboardId,
        supersetDomain: url,
        mountPoint: containerRef.current,
        fetchGuestToken: () => Promise.resolve(guestToken),
        dashboardUiConfig: { 
          hideTitle: false,
          hideChartControls: false,
          hideTab: false
        }
      });

      setTimeout(() => {
        const iframe = document.querySelector("iframe");
        if (iframe) {
          iframe.style.width = '100%';
          iframe.style.minHeight = '1000px';
          iframe.style.border = 'none';
          setStatus('Dashboard loaded successfully!');
        } else {
          setStatus('Warning: Dashboard embedded but iframe not found');
        }
      }, 1000);
    } catch (err) {
      console.error("Error embedding dashboard:", err);
      
      let errorMessage = "Failed to load dashboard";
      if (err.response) {
        console.error("Error response:", err.response.data);
        errorMessage = `Error ${err.response.status}: ${JSON.stringify(err.response.data)}`;
      }
      
      setStatus('Failed to load dashboard');
      setError(errorMessage);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessToken(null);
    setCsrfToken(null);
    setSupersetUrl(null);
    setStatus('Please log in to view dashboards');
    setError(null);
    
    // Clear the container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  };

  return (
    <div className="App">
      {/* Header */}
      <header style={{
        backgroundColor: '#1f4e79',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Dashboard Viewer</h1>
        {isAuthenticated && (
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        )}
      </header>
      
      {/* Main content */}
      <main style={{ padding: '20px' }}>
        {/* Status display */}
        <div style={{
          padding: '15px',
          margin: '10px 0',
          backgroundColor: '#f5f9ff',
          border: '1px solid #ddd',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <p><strong>Status:</strong> {status}</p>
          {error && (
            <p style={{ color: 'red', backgroundColor: '#fff0f0', padding: '10px', borderRadius: '4px' }}>
              <strong>Error:</strong> {error}
            </p>
          )}
        </div>
        
        {/* Login or Dashboard Content */}
        {!isAuthenticated ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div
            id="superset-container"
            ref={containerRef}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              minHeight: '1000px',
              marginTop: '20px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
              backgroundColor: '#fff'
            }}
          ></div>
        )}
      </main>
      
      {/* Footer */}
      <footer style={{ 
        marginTop: '30px', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#666', 
        padding: '15px' 
      }}>
        <p>Guest tokens are valid for a limited time (typically a few minutes).</p>
      </footer>
    </div>
  );
}

export default App;