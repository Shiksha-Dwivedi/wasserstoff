import cluster from "cluster";
import os from "os";
import http from "http";

const numCPUs = os.cpus().length;

// Track active requests for each worker for Least Connections strategy
const workerRequests = {};

// Round Robin index tracker
let currentWorkerIndex = 0;

// Priority queue for managing high-priority tasks
const priorityQueue = [];

if (cluster.isMaster) {
  console.log(`Master process is running with PID: ${process.pid}`);

  // Fork workers for each CPU
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workerRequests[worker.process.pid] = 0; // Initialize active requests for each worker

    // Listen to worker messages for incrementing/decrementing requests
    worker.on("message", (message) => {
      if (message.cmd === "increment") {
        workerRequests[worker.process.pid] += 1;
      } else if (message.cmd === "decrement") {
        workerRequests[worker.process.pid] -= 1;
      }
    });
  }

  // Round Robin Strategy: evenly distribute requests among workers
  const roundRobin = () => {
    const workerPIDs = Object.keys(cluster.workers);
    const worker = cluster.workers[workerPIDs[currentWorkerIndex]];
    currentWorkerIndex = (currentWorkerIndex + 1) % workerPIDs.length;
    return worker;
  };

  // Least Connections Strategy: send requests to the worker with the fewest active requests
  const leastConnections = () => {
    const workerPID = Object.keys(workerRequests).reduce((minPID, pid) => {
      return workerRequests[pid] < workerRequests[minPID] ? pid : minPID;
    }, Object.keys(workerRequests)[0]);
    return cluster.workers[workerPID];
  };

  // Handle Priority Queue tasks
  const handlePriorityQueue = () => {
    while (priorityQueue.length > 0) {
      const { req, res, priority } = priorityQueue.shift(); // Dequeue the task
      console.log(`Handling priority ${priority} request`);
      const worker = roundRobin(); // You can change this to leastConnections if needed
      worker.send({ cmd: "handleRequest", req, res });
    }
  };

  // Create the load balancer server
  const server = http.createServer((req, res) => {
    const priority = req.url.startsWith("/high-priority") ? 1 : 0;

    if (priority === 1) {
      // Handle high-priority requests through the priority queue
      priorityQueue.push({ req, res, priority });
      handlePriorityQueue();
    } else {
      // Use Least Connections Strategy for normal requests
      const worker = leastConnections();
      worker.send({ cmd: "handleRequest", req, res });
    }
  });

  server.listen(8000, () => {
    console.log("Load balancer running on port 8000");
  });

  // Restart worker if it dies
  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker with PID: ${worker.process.pid} died. Starting a new worker...`
    );
    const newWorker = cluster.fork();
    workerRequests[newWorker.process.pid] = 0; // Initialize request count
  });
} else {
  import("./server.js"); // Import the server in worker

  process.on("message", (message) => {
    if (message.cmd === "handleRequest") {
      // Simulate request handling for load balancing
      const req = message.req;
      const res = message.res;

      // Increment active requests in this worker
      process.send({ cmd: "increment" });

      // Simulate handling request (your existing Express server logic)
      const app = require("./server"); // Import your Express app
      app(req, res); // Forward request to the Express app

      // Decrement active requests after finishing
      res.on("finish", () => {
        process.send({ cmd: "decrement" });
      });
    }
  });
}
