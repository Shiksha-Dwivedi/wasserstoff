import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderForm = () => {
  const [orderDetails, setOrderDetails] = useState({
    customerName: "",
    deliveryAddress: "",
    orderItems: "",
  });

  const [responseMessage, setResponseMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails({
      ...orderDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/assign-order",
        orderDetails
      );
      setResponseMessage(response.data.message);
      console.log("Order successfully assigned:", response.data);
    } catch (error) {
      toast.info("Deliver Partner is not available", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      setResponseMessage("Failed to assign order.");
    }
  };

  return (
    <>
      <div className="order-form-container">
        <h2>Order Assignment Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer Name:</label>
            <input
              type="text"
              name="customerName"
              value={orderDetails.customerName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Delivery Address:</label>
            <input
              type="text"
              name="deliveryAddress"
              value={orderDetails.deliveryAddress}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Order Items:</label>
            <input
              name="orderItems"
              value={orderDetails.orderItems}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit">Submit Order</button>
        </form>

        {responseMessage && <p>{responseMessage}</p>}
      </div>
      <ToastContainer />
    </>
  );
};

export default OrderForm;
