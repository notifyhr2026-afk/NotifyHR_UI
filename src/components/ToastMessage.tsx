import React from "react";
import { ToastContainer, toast, Slide, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Props interface (optional if you want to show inline toasts)
export interface ToastMessageProps {
  type?: "success" | "error" | "info" | "warning";
  message: string;
  autoClose?: number; // in ms
}

// Singleton object to trigger toasts anywhere
const ToastMessage = {
  show: (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success",
    autoClose = 3000
  ) => {
    const options: ToastOptions = {
      position: "top-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      transition: Slide,
    };

    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      case "info":
        toast.info(message, options);
        break;
      case "warning":
        toast.warning(message, options);
        break;
    }
  },
};

// ToastProvider to include in your root component or page
export const ToastProvider: React.FC = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      transition={Slide}
    />
  );
};

export default ToastMessage;
