import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());

// List of backend servers
const backendServers = [
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

// Delivery partners across the system
const deliveryPartners = [
  { id: 1, name: "Delivery Partner A", status: "available" },
  { id: 2, name: "Delivery Partner B", status: "available" },
  { id: 3, name: "Delivery Partner C", status: "available" },
];

// Round-robin indices
let currentServerIndex = 0;
let currentPartnerIndex = 0;

// Load balancer route to distribute requests and assign delivery partners
app.post("/assign-order", async (req, res) => {
  const orderDetails = req.body;

  // Select the next backend server using round-robin
  const targetServer = backendServers[currentServerIndex];

  // Select the next available delivery partner using round-robin
  const assignedPartner = deliveryPartners[currentPartnerIndex];

  console.log(
    `Forwarding order to ${targetServer}. Current server index: ${currentServerIndex}`
  );

  // Check if the selected delivery partner is available
  if (assignedPartner.status === "available") {
    try {
      // Forward the order to the selected backend server
      const response = await axios.post(`${targetServer}/assign-order`, {
        orderDetails,
        assignedPartner,
      });

      // Mark the partner as busy
      assignedPartner.status = "busy";

      // Simulate delivery completion and make the partner available after some time
      setTimeout(() => {
        assignedPartner.status = "available";
        console.log(`${assignedPartner.name} is now available again`);
      }, 5000);

      // Send the response back to the client
      res.json({
        message: `Order assigned to ${assignedPartner.name}`,
        server: targetServer,
        partner: assignedPartner,
        serverResponse: response.data,
      });
    } catch (error) {
      console.error("Error forwarding request to backend:", error.message);
      res.status(500).json({ message: "Error assigning order" }); 
    }
  } else {
    res.status(500).json({ message: "No available delivery partners" });
  }

  // Move to the next backend server and delivery partner for the next request
  currentServerIndex = (currentServerIndex + 1) % backendServers.length;
  currentPartnerIndex = (currentPartnerIndex + 1) % deliveryPartners.length;
});

// Start the load balancer
app.listen(PORT, () => {
  console.log(`Load balancer running on http://localhost:${PORT}`);
});
