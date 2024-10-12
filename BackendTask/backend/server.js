import express from "express";
import fs from "fs";
import path from "path";
import { performance } from "perf_hooks"; // For capturing accurate response times
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const DATA_FILE = path.join(process.cwd(), "data", "todos.json");

// Helper function to read the JSON file
const readTodos = () => {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
};

// Helper function to write to the JSON file
const writeTodos = (todos) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos));
};

// Utility function to simulate delays
const simulateDelay = (duration) => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

// Simulate a random behavior (fast, slow, error)
const simulateRandomBehavior = async (req, res, callback) => {
  const random = Math.random();
  if (random < 0.2) {
    // Simulate slow response (2s delay)
    await simulateDelay(2000);
    callback();
  } else if (random < 0.4) {
    // Simulate error response
    res.status(500).send("Internal Server Error");
  } else {
    // Fast response
    callback();
  }
};

// Custom logging middleware for capturing metrics
app.use((req, res, next) => {
  const start = performance.now(); // Start time
  const { method, url, body } = req;

  // Log initial request details
  console.log(
    `Worker ${
      process.pid
    } - ${method} ${url} - Start: ${new Date().toISOString()}`
  );

  // Log request body if it's a POST or PUT request
  if (method === "POST" || method === "PUT") {
    console.log(`Request Body: ${JSON.stringify(body)}`);
  }

  // Capture when the response finishes
  res.on("finish", () => {
    const duration = performance.now() - start;
    const statusCode = res.statusCode;

    // Log request details along with response time and status code
    console.log(
      `Worker ${
        process.pid
      } - ${method} ${url} - Status: ${statusCode} - Duration: ${duration.toFixed(
        2
      )}ms`
    );
  });

  next();
});

// Get all TODOs (simulating delay)
app.get("/todos", async (req, res) => {
  simulateRandomBehavior(req, res, () => {
    const todos = readTodos();
    res.status(200).json(todos);
  });
});

// Get a single TODO by id (simulating varied behavior)
app.get("/todos/:id", async (req, res) => {
  simulateRandomBehavior(req, res, () => {
    const todos = readTodos();
    const todo = todos.find((t) => t.id === parseInt(req.params.id));
    if (todo) {
      res.status(200).json(todo);
    } else {
      res.status(404).send("Todo not found");
    }
  });
});

// Create a new TODO (simulating fast and slow responses)
app.post("/todos", async (req, res) => {
  simulateRandomBehavior(req, res, () => {
    const todos = readTodos();
    const newTodo = {
      id: todos.length ? todos[todos.length - 1].id + 1 : 1,
      text: req.body.text,
      completed: req.body.completed || false,
    };
    todos.push(newTodo);
    writeTodos(todos);
    res.status(201).json(newTodo);
  });
});

// Update a TODO by id (simulating error)
app.put("/todos/:id", async (req, res) => {
  simulateRandomBehavior(req, res, () => {
    const todos = readTodos();
    const index = todos.findIndex((t) => t.id === parseInt(req.params.id));
    if (index !== -1) {
      todos[index] = { ...todos[index], ...req.body };
      writeTodos(todos);
      res.json(todos[index]);
    } else {
      res.status(404).send("Todo not found");
    }
  });
});

// Delete a TODO by id (simulating slow and fast responses)
app.delete("/todos/:id", async (req, res) => {
  simulateRandomBehavior(req, res, () => {
    const todos = readTodos();
    const updatedTodos = todos.filter((t) => t.id !== parseInt(req.params.id));
    if (updatedTodos.length !== todos.length) {
      writeTodos(updatedTodos);
      res.status(204).send();
    } else {
      res.status(404).send("Todo not found");
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, PID: ${process.pid}`);
});
