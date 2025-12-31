import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center p-5 bg-white rounded shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h1 className="mb-4">Welcome to the Home Page</h1>
        <p className="mb-4 text-muted">Start your journey by logging into your account.</p>
        <Link to="/login" className="btn btn-primary btn-lg w-100">
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default Home;
