import express from "express";

const app = express();
const PORT = 3002;

app.use(express.json());

app.post("/assign-order", (req, res) => {
  const { orderDetails, assignedPartner } = req.body;

  console.log(`Order received on server ${PORT}:`, orderDetails);
  console.log(`Assigned delivery partner: ${assignedPartner.name}`);

  res.json({
    message: `Order processed by server ${PORT} and assigned to ${assignedPartner.name}`,
  });
});

// Start the backend server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
