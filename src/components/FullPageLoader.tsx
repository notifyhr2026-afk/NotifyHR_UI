import React from 'react';

interface FullPageLoaderProps {
  message?: string;
}

const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  message = 'Please wait...',
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        zIndex: 9999,
      }}
    >
      <div
        className="spinner-border text-light"
        role="status"
        style={{
          width: '4rem',
          height: '4rem',
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>

      <h5 className="text-white mt-4">{message}</h5>
    </div>
  );
};

export default FullPageLoader;