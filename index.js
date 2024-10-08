const express = require('express');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const TodoTask = require("./models/TodoTask");

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables from .env file
dotenv.config();

// Middleware and route setup
app.use("/static", express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// GET route to render the main page
app.get('/', async (req, res) => {
  try {
    const tasks = await TodoTask.find(); // Fetch tasks to display
    res.render('todo.ejs', { todoTasks: tasks });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching tasks");
  }
});

// POST route to add a new todo task
app.post('/', async (req, res) => {
  const todoTask = new TodoTask({
    content: req.body.content
  });

  try {
    await todoTask.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving task");
  }
});

// Connection to the database
if (!process.env.DB_CONNECT) {
  console.error("DB_CONNECT is not defined. Please check your .env file.");
  process.exit(1);
}

mongoose.connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("Connected to db!");
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch(err => {
    console.error("Database connection error:", err);
  });

  app.route("/edit/:id")
  .get(async (req, res) => {
      const id = req.params.id;
      try {
          const tasks = await TodoTask.find(); // Fetch all tasks
          res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id }); // Pass tasks to the view
      } catch (err) {
          console.error(err);
          res.status(500).send("Error retrieving tasks for editing");
      }
  })
  .post(async (req, res) => {
      const id = req.params.id;
      try {
          await TodoTask.findByIdAndUpdate(id, { content: req.body.content });
          res.redirect("/");
      } catch (err) {
          console.error(err);
          res.status(500).send("Error updating task");
      }
  });

  const { ObjectId } = require('mongoose').Types;

  // Route to delete a todo task
  app.route("/remove/:id").get(async (req, res) => {
      const id = req.params.id;
  
      // Check if the ID is valid
      if (!ObjectId.isValid(id)) {
          console.error("Invalid ID format");
          return res.status(400).send("Invalid ID format");
      }
  
      try {
          // Use findByIdAndDelete instead of findByIdAndRemove
          const result = await TodoTask.findByIdAndDelete(id);
  
          // If no task was found with the given ID
          if (!result) {
              console.error("Task not found");
              return res.status(404).send("Task not found");
          }
  
          console.log(`Task with ID: ${id} removed successfully`);
          res.redirect("/");
      } catch (err) {
          console.error(err);
          res.status(500).send("Error removing task");
      }
  });
  