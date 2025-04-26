import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Hardcoded Superset URL - update with your actual Superset server URL
  const supersetUrl = 'http://xxxxxxxxxxxxxx:8088';
  const supersetApiUrl = `${supersetUrl}/api/v1/security`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Login to get access token
      const loginResponse = await axios.post(
        `${supersetApiUrl}/login`, 
        {
          username: username,
          password: password,
          provider: 'db',
          refresh: true
        }, 
        {
          headers: { 
            "Content-Type": "application/json" 
          }
        }
      );

      const accessToken = loginResponse.data.access_token;
      console.log("Access Token obtained");
      
      // Step 2: Get CSRF token using the access token
      const csrfResponse = await axios.get(
        `${supersetApiUrl}/csrf_token/`, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      const csrfToken = csrfResponse.data.result;
      console.log("CSRF Token obtained");
      
      // Pass tokens back to parent component
      onLoginSuccess(accessToken, csrfToken, supersetUrl);
      
    } catch (err) {
      console.error("Login error:", err);
      
      // Provide user-friendly error messages
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setError('Authentication failed. Please check your username and password.');
        } else if (err.response.status === 404) {
          setError('API endpoint not found. Please check server configuration.');
        } else if (err.response.status === 500) {
          setError('Superset server error. Please try again later.');
        } else {
          setError(`Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError('Could not connect to Superset server. Please check your network connection.');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#1f4e79', 
        marginBottom: '25px',
        fontSize: '24px'
      }}>
        Dashboard Login
      </h2>
      
      {error && (
        <div style={{
          backgroundColor: '#fff0f0',
          color: '#d32f2f',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#333'
          }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              transition: 'border 0.3s ease'
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#333'
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              transition: 'border 0.3s ease'
            }}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#1f4e79',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'background-color 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        fontSize: '13px', 
        color: '#666' 
      }}>
        Log in with your Superset credentials to view dashboards
      </div>
    </div>
  );
}

export default Login;