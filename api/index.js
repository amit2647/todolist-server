const express = require("express");
const serverless = require("serverless-http");
const clientPromise = require("../lib/mongodb");

const app = express();
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express on Vercel!' });
});

app.post('/api/echo', (req, res) => {
  res.json({ received: req.body });
});


// Add task
app.post("/api/tasks/add", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("todolist");
    const tasks = db.collection("tasks");

    const task = req.body;

    if (!task || !task.id || !task.title || !task.userId) {
      return res.status(400).json({ error: "Invalid task format or missing userId" });
    }

    await tasks.insertOne(task);
    res.status(201).json({ message: "Task added" });
  } catch (e) {
    console.error("Add task error:", e);
    res.status(500).json({ error: "Failed to add task" });
  }
});

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("todolist");
    const tasks = db.collection("tasks");

    const allTasks = await tasks.find().toArray();
    res.status(200).json(allTasks);
  } catch (e) {
    console.error("Fetch tasks error:", e);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Get single task by ID
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = await clientPromise;
    const db = client.db("todolist");
    const tasks = db.collection("tasks");

    const task = await tasks.findOne({ id });

    if (task) {
      res.status(200).json(task);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (e) {
    console.error("Fetch single task error:", e);
    res.status(500).json({ error: "Failed to get task" });
  }
});

// Update task
app.put("/api/tasks/update", async (req, res) => {
  console.log("[PUT /api/tasks/update] Start");
  const start = Date.now();

  try {
    const updatedTask = { ...req.body };
    delete updatedTask._id;

    const client = await clientPromise;
    const db = client.db("todolist");
    const tasks = db.collection("tasks");

    const result = await tasks.updateOne(
      { id: updatedTask.id },
      { $set: updatedTask }
    );

    const end = Date.now();
    console.log("[PUT /api/tasks/update] Completed in", end - start, "ms");

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Task not found or already updated" });
    }

    res.status(200).json({ message: "Task updated" });
  } catch (e) {
    console.error("[PUT /api/tasks/update] Error:", e);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete task
app.delete("/api/tasks/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = await clientPromise;
    const db = client.db("todolist");
    const tasks = db.collection("tasks");

    const result = await tasks.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted" });
  } catch (e) {
    console.error("Delete task error:", e);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Reset all tasks
app.post("/api/tasks/reset", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("todolist");
    const tasks = db.collection("tasks");

    await tasks.deleteMany({});
    res.status(200).json({ message: "All tasks cleared" });
  } catch (e) {
    console.error("Reset tasks error:", e);
    res.status(500).json({ error: "Failed to clear tasks" });
  }
});

module.exports = app;
module.exports.handler = serverless(app);
