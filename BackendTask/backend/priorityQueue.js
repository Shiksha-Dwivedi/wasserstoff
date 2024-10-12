import express from "express";
import { PriorityQueue } from "./queueManager.js";

const app = express();
const port = 3000;

// Create a new priority queue
const queue = new PriorityQueue();

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to handle incoming requests
app.post("/request", (req, res) => {
  const { data, priority } = req.body;

  // Validate input
  if (typeof priority !== "number") {
    return res.status(400).json({ error: "Priority must be a number." });
  }

  // Add the request to the priority queue
  queue.enqueue({ data, priority });
  console.log(`Request with priority ${priority} added to the queue.`);

  res.status(202).json({ message: "Request accepted for processing." });
});

// Function to process requests
const processRequests = () => {
  if (!queue.isEmpty()) {
    const { data, priority } = queue.dequeue();
    console.log(`Processing request with priority ${priority}:`, data);

    // Simulate processing time
    setTimeout(() => {
      console.log(`Finished processing request with priority ${priority}`);
    }, 2000);
  }
};

// Start processing requests at regular intervals
setInterval(processRequests, 3000);

// Start the Express server
app.listen(port, () => {
  console.log(`Load balancer listening at http://localhost:${port}`);
});
