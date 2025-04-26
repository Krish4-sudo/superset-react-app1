import React, { createContext, useState, useContext } from 'react';

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [supersetUrl, setSupersetUrl] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Login
  const login = (token, csrf, url) => {
    setAccessToken(token);
    setCsrfToken(csrf);
    setSupersetUrl(url);
    setIsAuthenticated(true);
  };
  
  // Logout
  const logout = () => {
    setAccessToken(null);
    setCsrfToken(null);
    setSupersetUrl('');
    setIsAuthenticated(false);
  };
  
  return (
    <AppContext.Provider value={{
      accessToken,
      csrfToken,
      supersetUrl,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);

export default AppContext;