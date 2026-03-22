# React

React is a modern library for creating the frontend of websites.

## How it works

React is unique because it keeps a "pretend version" of your webpage in memory. When something changes, like a number or text, it updates that pretend version first. Then React compares that pretend version to what’s actually on your screen. If it notices a difference, it only changes that exact part on your real webpage. This way, it doesn’t have to rebuild the whole page—just the part that changed.

If you want to build with React, you’ll typically start by defining components. A component is just a piece of your interface, like a button or a form. React lets you break the UI down into these parts and then combine them. Each component reacts to changes in data and updates the interface.

In a real web front-end, you have many interactive elements. State is what lets those elements respond. For example, a form input’s state holds what you type, a modal’s state controls whether it’s open or not, and a list’s state might hold items you’ve fetched. Instead of manually manipulating the page, you let the state drive what’s displayed. This makes complex interfaces manageable and predictable.

We’ll build a basic to-do list where you can add tasks.

## Setup

We will use Vite to help set up the project. Vite handles the build and development environment—making it fast and efficient. React itself is what you write inside the `src/` folder—your components, state, and UI logic. In short: Vite is the tool scaffolding your project; React is the library you use to build the UI inside that structure.

1. Open the terminal and run `npm create vite@latest my-app -- --template react`
2. Navigate into the project folder with `cd my-app` and run `npm install` to ensure dependencies are ready
3. Run `npm run dev` to launch the development server

When you run `npm create vite@latest`, it sets up a standard project structure. At the top level, you have a project folder. Inside, there’s a `package.json` file—this lists the project name, version, and dependencies. There's also a `vite.config.js` (or .ts) that configures the development build. The source code sits in a `src/` folder—this is where your React components go. Usually, `src/main.jsx` (or .tsx) is the entry point. Components can be organized in `src/` subfolders. You’ll also have a `public/` folder for static assets like images. Finally, you’ll run the project with `npm run dev`. In summary: configuration at the top, source code in `src/`, and static files in `public/`.

## Creating a Component

Next, we’ll define a simple React component. Inside your `src/` folder, open `App.jsx` and replace the code with the following:

```{JavaScript}
import { useState } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  return (
    <div>
      <input 
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Add a task"
      />
      <button onClick={() => setTasks([...tasks, newTask])}>
        Add Task
      </button>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>{task}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```
### State

We start by importing a function called `useState` from the `react` library. `useState` is a function that takes in any data type parameter and returns an array with two elements: (1) the current state, which is equal to the parameter you gave to the function (a number, string, list, object, etc), (2) a function that you call when you want to change the state (you are calling (2) to change (1)).

You can think of state as a special kind of variable tied to the component’s behavior. Unlike regular variables, when you update state using the provided function (like setTasks or setNewTask), React re-renders the component. So, state holds dynamic data that React watches and reacts to.

Think about whats going to change on the browser, and thats how you think about what state variables you'll need. You identify state variables based on what data you expect to change—whether through user input, events, or data fetched from somewhere. If it’s dynamic and the UI should reflect those changes, you manage it with state. Static elements or data that never change don’t need state. If you have a to-do list, the list of tasks is state because it changes when you add or remove tasks. In contrast, a static title like "My To-Do List" doesn’t change, so it’s not state. The list of tasks changes as you add new items, and the text input changes as the user types. Both require state to keep the UI in sync with those changes.

`const [tasks, setTasks] = useState([]);` calls the function `useState([])` which returns two items which we are naming as `tasks` for the state and `setTasks` as the function we call to update `tasks`. Since and empty list `[]` is passed in as a parameter to `useState()`, `tasks` is initialized as an empty list.

When we want to add the first item to the list, we call `setTasks([...tasks, newTask])`. This basically says "add all elements of the list (`...tasks`) and append the `newTask`".

`...tasks` equals the full current value of `tasks`.

The line const `[newTask, setNewTask] = useState('');` creates a piece of state called `newTask`, starting as an empty string. This is where we store what the user is currently typing into the input field. The `setNewTask` function allows us to update that text as the user types. When the input changes, we call `setNewTask(e.target.value)` to keep newTask in sync with what's in the text box.

The `e` is the event object passed in by the input field when you type. `e.target` is the element that triggered the event (in this case, the input box). `e.target.value` is the current text inside that input box. So when we call `setNewTask(e.target.value)`, we’re updating the `newTask` state to match what’s currently typed in the input.


### Return

The return statement in a React component is where we define what should be displayed on the screen. In this case, App is a component, and whatever we return is the user interface—what the user will see and interact with. So, inside that return, we’re essentially describing the structure and elements of the page—like text boxes, buttons, and lists—built from HTML-like elements.

Inside that return, we place the elements we need. The input field is where the user types. The button triggers an action when clicked. The list (the `ul` and `li` elements) shows all tasks. Each of these elements is connected to the state we set up—the input shows what’s being typed, the button adds to the list, and the list renders each task.

#### Input

The input element is where the user types a task. Its `value` attribute is tied to the `newTask` state, meaning whatever `newTask` is, that’s what you see inside the input. When the user types, the `onChange` event fires. This event takes what the user typed (`e.target.value`) and updates `newTask`, ensuring the input always matches what’s stored in that state.

#### Button

The button is a clickable element that triggers an action. When the user clicks it, it runs the function tied to its `onClick`. In this case, we take the current `newTask`, add it to the tasks array, and update the state with the new list.

#### List

The list is rendered from the `tasks` state. Each time tasks changes, React re-renders the list. We use a `map` function to go through each task and display it as a list item. Each item has a unique `key` (here we use the index). So, when you add a task, the list updates immediately, reflecting the current tasks state.

## User Interactions Beyond Adding To A List

We’ve already demonstrated how to add items to a list by updating state. Now we’ll extend this by allowing users to remove or mark tasks as complete. These interactions will show how we modify state in different ways, making our component more dynamic and responsive to user input. Let’s walk through removing a task first.

### Removing a task

First, we’ll add a “remove” button next to each task. When clicked, it will remove that task from the tasks array by creating a new array without that task and updating state.

Update the `<ul>` element to be the following:

```{JavaScript}
<ul>
  {tasks.map((task, index) => (
    <li key={index}>
      {task} 
      <button onClick={() => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
      }}>
        Remove
      </button>
    </li>
  ))}
</ul>
```

We've added a `<button>` object next to the `{task}` name. Since we want the `tasks` state variable to be changed to the same list only without that item, we create a variable `updatedTasks` equal to the current `tasks` list filtered to only include items not at the current index. The `filter` function takes in `(_, i)` where, since we don't care about the current item and only it's index, we use `_` for the first parameter.

### Marking tasks complete

To mark tasks as complete, we’ll store more information per task. Instead of just using a simple string `"new task 1"`, we’ll use an object `{ description: newTask, completed: false }` (where `newTask = "new task 1"`) for each task. Each object will have a description and a completed flag. Then we’ll add a button to toggle completion.

We'll change `<button onClick={() => setTasks([...tasks, newTask])}>` to the following:

```{JavaScript}
<button onClick={() => {
  setTasks([...tasks, { description: newTask, completed: false }]);
  setNewTask('');
}}>
```

This ensures each new task is an object with a description and a completed status (starting as false). After adding, we clear the input by calling `setNewTask('')`.

Now, let’s modify how we display each task. We’ll check the `completed` property. If it’s true, we can style the task differently—like crossing it out. After that, we’ll add a button to toggle the `completed` status.

```{JavaScript}
<ul>
  {tasks.map((task, index) => (
    <li key={index} style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
      {task.description}
      <button onClick={() => {
        const updatedTasks = tasks.map((t, i) => 
          i === index ? { ...t, completed: !t.completed } : t
        );
        setTasks(updatedTasks);
      }}>
        {task.completed ? 'Undo' : 'Complete'}
      </button>
      <button onClick={() => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
      }}>
        Remove
      </button>
    </li>
  ))}
</ul>
```

```{JavaScript}
<button onClick={() => {
    const updatedTasks = tasks.map((t, i) => 
        i === index ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    }}>
    {task.completed ? 'Undo' : 'Complete'}
</button>
```

This code is added to each item. The text of the button is `"Undo"` if `task.completed` is `true` and `"Complete"` if `false`. When you click the button, it maps through all the tasks (`t` is the task state and `i` is the index) and runs the following expression `i === index ? { ...t, completed: !t.completed } : t`: if `i === index` meaning if we're mapping over the current item where the button was clicked next to, set the `updatedTasks` variable to the object `{ ...t, completed: !t.completed }` (`...t` takes all the parts of the object (in this case it's only the description, so we could have also just used `{ description: t, completed: !t.completed }`)), but `...t` is good practice if you have more object features. So we take all of what `t` currently is, and change `completed` equal to `!t.completed` the opposite of what the completed value is currently. If `i === index` is false, just set it to `t` (the current value unmodified). Once we've set `updatedTasks` correctly, we call `setTasks` to change the state of the task.

## Storing Tasks with a backend and database

At this point, we are storing tasks in-memory in React, but if we refresh the page, our tasks disappear. We'll use a PostgreSQL database and a simple Express (using Node.js) backend to handle storing and retrieving tasks. Then we’ll connect our frontend to that backend so tasks stay even after a page reload.

### Setting up the backend server (Express with Node.js)

We’ll install Express, connect to PostgreSQL using a library like `pg`, and create routes to add, fetch, and delete tasks. Once that’s done, we’ll connect it to the React frontend.

In production, it's common to keep the frontend and backend as separate services or projects. Typically, you'd have a top-level directory—like a root project folder—and inside that, you’d have one folder for the frontend (your React app) and another for the backend (your Express or FastAPI server). Then, you deploy them separately—often with the frontend served by a static host (like Netlify or Vercel) and the backend hosted on a separate server (like Heroku, AWS, or Render).

Currently we have our `my-app` folder holding our React frontend. Lets create a better folder structure to separate our front end and backend.

1. Move up one directory with `cd ..`
2. Make the parent folder with `mkdir my-full-stack-app`
3. Create the frontend parent folder with `mkdir my-full-stack-app/frontend`
4. Create the backend parent folder with `mkdir my-full-stack-app/backend`
5. Move the React front end in that folder with `mv my-app my-full-stack-app/frontend/`
6. Enter into the root directory with `cd my-full-stack-app`

So the folder structure becomes:

```
my-full-stack-app
├── frontend
│   └── my-app
└── backend
```

Now we can begin working in the backend folder.

1. Enter into the backend folder with `cd backend`
2. Initialize a new default Node project using `npm init -y`
3. Install Express and pg by running `npm install express pg`
4. Install TypeScript development dependencies `npm install -D typescript tsx @types/node @types/express @types/pg`
5. Create the TypeScript config file with `npx tsc --init`

You should see:

```
backend
├── node_modules/
├── package-lock.json
├── package.json
└── tsconfig.json
```

The `package.json` file is where all your project’s metadata and dependencies live—so it tracks what libraries you installed and other project info. 

Since we're using TypeScript, we'll need to change the following from `package.json`:

Change:

```
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

to

```
"scripts": {
  "dev": "tsx src/index.ts",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

and add `"type": "module"`, so the final file should look like:

```
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "dev": "tsx src/index.ts",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "express": "^5.2.1",
    "pg": "^8.20.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.5.0",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3"
  }
}
```

`tsconfig.json` is a configuration file for a TypeScript file. Edit the file in the following ways:

1. Uncomment `"rootDir": "./src"` so TypeScript knows the source code lives in the `src/` folder.
2. Uncomment `"types": ["node"]` and `"lib": ["esnext"]`

Note: when you uncomment `"types": ["node"]` you will need to delete the other `
`"types": []` line

The `package-lock.json` locks the exact versions of those packages so everyone working on the project uses the same versions. And the `node_modules` folder is where all the installed packages sit. Now that we have those, we can create the server file and set up our first route.

Just like in our `/frontend` folder setup, the main code for the backend will go in a `src` folder. In that folder, we'll make an `index.ts` file which will be the entry point for the backend server (just like how `main.jsx` is the entry point for the React frontend).

1. Ensure you're in the backend folder with `cd my-full-stack-app/backend`
2. Create the folder with `mkdir src`
3. Create the `index.ts` file inside the `src` folder

You should see:

```
backend
├── node_modules/
├── package-lock.json
├── package.json
├── tsconfig.json
└── src
    └── index.ts
```

Paste the following in `src/index.ts`

```
import express from "express";

const app = express();
const PORT = 3001;

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

First, we load in the Express library with `import express from "express";` which will give us functions to help build a web server and define routes. We'll create an instance of a server object with `const app = express()`.

Now we'll add our first route.

We use routes when designing how the frontend and backend communicate to each other. Earlier, the frontend managed all the data locally in the browser. With a backend, the browser is no longer the only place data/logic can live. Our browser (the frontend React app) communicates to our backend by sending messages to it (requests) and receiving messages from it (responses). Routes allow us to define how the backend responds to different requests.

The following are common types of messages our frontend will send to the backend:

- **GET**: used to retrieve data from the server
- **POST**: used to send data to the server
- **PUT**: used to update a piece of data (like updating a users phone number)
- **DELETE**: used to delete data from the server

Our first route definition uses `app.get`. The code inside this block is essentially saying "when this backend server gets a GET request at the url ending in `/`, run the following".

The function takes in two parameters `req` (request) and `res` (response). `req` is an object containing information about the incoming request, like query parameters, headers, or data sent from the frontend. `res` is an object containing functions we can use to send something back to the browser. We can call the browser our "client" and the backend our "server".

`res.send()` is one of those functions which we use to send data back to teh client. In this case, we're sending the message "Backend server is running".

Lastly, we start the server with this chunk of code:

```
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

`app.listen` starts the server which allows it to begin listening for incoming requests.

PORT is similar to a port in real life. Your computer can run multiple programs at the same time if each is using a different port. Since we're using `PORT = 3001`, our backend will be accessible at the URL `http://localhost:3001`.

1. Start the server with the terminal command `npm run dev`
2. Open a browser and go to `http://localhost:3001`

You should see "Backend server is running".

### Setting up the database (PostgreSQL)

Now that the backend server is running, we need a place to store data permanently. For that we will use PostgreSQL.

PostgreSQL is a relational database system. It stores data in tables made up of rows and columns. You can think of it like a structured spreadsheet, except it is designed to handle large amounts of data and multiple applications interacting with it at the same time.

When you install PostgreSQL on your machine, it runs a database server locally. That server can manage multiple databases. During development we will use the local server on our machine. Later, when deploying an application, the database is usually hosted on a remote service such as Supabase, AWS RDS, or Neon.

1. Check that PostgreSQL is installed with `psql --version` (if nothing prints, PostgreSQL is not installed and you will need to install it before continuing. Instructions can be found on the web)
2. Connect to PostgreSQL using `psql -U postgres` (this opens an interactive terminal called `psql` which lets us run SQL commands against the database server).
3. Create the database for our project with `CREATE DATABASE tasks_db;`
4. Set a username and password that our backend server will use when connecting to the database with `CREATE USER tasks_user WITH PASSWORD 'mypassword';` (creating a new user-named similarly to the database name-for each application you create is good practice).
5. Grant that user access to the database with `GRANT ALL PRIVILEGES ON DATABASE tasks_db TO tasks_user;`
6. Connect to the specific database and grant schema permissions (read and write privileges)

```
\c tasks_db;
GRANT ALL PRIVILEGES ON SCHEMA public TO tasks_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tasks_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tasks_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO tasks_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO tasks_user;
```
7. Exit the `psql` terminal interface with `\q`

### Connecting the database to the backend 

Now that the database exists, we need to connect our backend server to it. The backend will be responsible for sending queries to PostgreSQL.

---

***Why do we need a backend if the database is storing the data***

At this point, you may ask "if the database stores the data, why doesn’t the React frontend just query the database directly?""

There are several reasons why modern web applications use a backend server between the frontend and the database.

- Security: a database requires credentials (username and password). If the frontend connected directly, those credentials would have to live in the browser code, which anyone could inspect. A backend keeps those credentials private on the server.

- Abstraction: the frontend should not care how data is stored. Today you might use PostgreSQL. Later you might move to MongoDB, Redis, or a different schema. If the frontend talks only to the backend API, the backend can change without breaking the frontend.

- Historical Architecture: early web apps often mixed database queries directly into page code. This led to widespread vulnerabilities such as SQL injection, where attackers could manipulate queries and access or destroy data. Modern architectures separate the frontend, backend, and database specifically to prevent those problems.

This pattern — frontend → backend → database — became the standard architecture for web applications because it separates concerns:

- frontend handles user interaction
- backend handles logic and APIs
- database handles storage

---

Right now, the main code in our backend is `index.ts`. As the project grows, we don't want everything to live in this file.

Even in small application, it's good practice to separate responsibilities into a few focused files. This keeps code easier to understand and mirrors how production backend projects are structured.

We'll add two more files in `src/`, so our folder should look like:

```
backend
├── src
│   ├── index.ts
│   ├── app.ts
│   └── db.ts
```

In `app.ts`:

```
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

export default app;
```

In `db.ts`:

```
import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "tasks_db",
  user: "tasks_user",
  password: "mypassword"
});

export default pool;
```

We've imported `Pool` from the `pg` library. A Pool manages connections to the database. We define the database connection credentials with:

```
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "tasks_db",
  user: "tasks_user",
  password: "mypassword"
});
```

These values match the database and user we created earlier in `psql`.
- `host` is the machine running the database server ("localhost" just means "this computer")
- `port` is the PostgreSQL default port
- `database` is the database we created
- `user` and `password` are the credentials the backend uses to make sure the right user is accessing the database

Change `index.ts` to the following:

```
import app from "./app.js";
import pool from "./db.js";

const PORT = 3001;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to PostgreSQL");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
  }
}

startServer();
```

`index.ts` acts as the entry point that wires the other files together. First, we import the server object (`app`) and the database connection (`db`) with `import app from "./app";` and `import pool from "./db";`.

We write a function `startServer()` using `async`. We use `async` to manage operations that take an unpredictable amount of time without interfering with the main program thread and freezing the application's user interface.

`await pool.query("SELECT 1");` tests that we have connected to the database successfully by running the sql command "SELECT 1". After confirming the connection, we start the server with `app.listen(PORT)`. We wrap this code in a `try/catch` statement, so that if it fails, we return the error and the program doesn't crash. Finally, we call the `startServer()` function.

Now that the backend can successfully connect to PostgreSQL, the next step is to create a table where our application data will live.

A PostgreSQL database can contain many tables. Each table stores a specific type of data. In our case we need a table that stores the tasks from our to-do list.

---
***Why we define tables in code instead of only in psql***

You could open `psql` and manually run a `CREATE TABLE` command. That works for quick experiments, but it creates problems for real projects.

If someone else clones the project, they would need to know to run that same command for it work.
---

In `db.ts`, add the following function:

```
export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      completed BOOLEAN DEFAULT false
    );
  `);
}
```

`pool.query` sends an SQL command to our database. SQL is a programming language designed to manage and interact with data stored in relational database systems (row and column-like tables). We create a table named `tasks` with the line `IF NOT EXISTS` to not create it more than once when this function is run. The table has three columns:

- `id` which assigns an identification number to each row item (each task, in this case). `SERIAL` ensures the id will get automatically incremented by PostgreSQL and `PRIMARY KEY` tells the system that if other tables want to reference a specific row, this column (`id`) is the unique identifier they should point to. We choose the `id` as the primary key because we know it will be unique. If we chose `description`, and two tasks have the same `description`, that would get confusing.
- `description` which stores the task text. `TEXT` tells the database that the data in this column will be text (text can include numbers). `NOT NULL` means every row must contain a `description` value.
- `completed` stores a `BOOLEAN` (thats a true/false data type) indicating if the task is completed. `DEFAULT false` automatically sets new tasks `completed` value to `false`.

We'll want this function to be called when the backend server starts. Update `index.ts`:

```
import app from "./app.js";
import pool, { initializeDatabase } from "./db.js";

const PORT = 3001;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    await initializeDatabase();

    console.log("Connected to PostgreSQL");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
  }
}

startServer();
```

### Reading from and writing to the database

Our backend server can successfully connect to PostgreSQL and we've ensured an accurate `tasks` table. Now we want the backend to interact with the tasks table.

Before, we were using routes to simply print "Backend server is running". Now, we will create routes that can run SQL queries on the database and send the results back to the frontend.

Similarly to how our backend used a route to communicate with the frontend, we use routes for our backend to communicate with the database.

#### Getting all tasks from the database

The first thing we want from our app is to load all the current tasks we have. The way we'll do this is by getting all the rows from the `tasks` table.

Update `app.ts` to the following:

```
import express from "express";
import pool from "./db.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    res.status(500).send("Failed to fetch tasks");
  }
});

export default app;
```

We `import pool from "./db.js";` so this file can connect to the database.

Next, we add a new route with `app.get`, stating that when the backend receives a GET request at the url ending with `/tasks`, run the following.

We make the function `async` because database queries take time to complete. Marking the function `async` allows us to use `await`, which pauses that function until the database returns the result from the command `pool.query("SELECT * FROM tasks ORDER BY id ASC")`, while the rest of the application continues running. `ORDER BY id ASC` sorts the results by `id` in ascending order, so older tasks appear first.

The result of `pool.query("SELECT * FROM tasks ORDER BY id ASC")` is an object containing information about the query. The actual rows returned from the database are in `result.rows`. We convert this array of rows into JSON with `res.json(result.rows);`. JSON is a standard data format used in JavaScript applications. It transforms the data from looking something like 

| id | description     | completed |
| -- | --------------- | --------- |
| 1  | Buy milk        | false     |
| 2  | Finish homework | true      |

to something like

```
[
  { id: 1, description: "Buy milk", completed: false },
  { id: 2, description: "Finish homework", completed: true }
]
```

We again wrap the route in a `try/catch` block so that if the query fails, we can handle the error cleanly. In the case of failure, we set the response status to 500 and send an error message to the client with `res.status(500).send("Failed to fetch tasks");`.

`500` is just one type of code we can use to communicate what happened on the backend. When a server responds to a request, it usually includes a numeric status code that tells the client what happened. Browsers, APIs, and developer tools rely on these codes to understand whether a request succeeded or failed.

Some other HTTP status codes are:

- 200: success (the request worked as planned)
- 404: not found (the connection was successful but what you're looking for does not exist)
- 500: internal service error (something went wrong on the server)