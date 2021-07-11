const express = require('express');
const cors = require('cors');

const { v4: uuidv4  } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  
  if (!user) {
    return response.status(404).json({ error: `${username} not found` })
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.find(
    user => user.username === username,
  );

  const newUser = { 
    id: uuidv4(),
    name, 
    username, 
    todos: [],
  };

  if (user) {
    return response.status(400).json({ error: `${username} already exists` })
  } else {
    users.push(newUser);
  }

  return response.status(201).json(newUser).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos).send();  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newToDo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };
  
  user.todos.push(newToDo);

  return response.status(201).json(newToDo).send();

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const index = user.todos.findIndex((todo) => todo.id === id);

  if (index < 0) {
    return response.status(404).json({ error: `${id} todo not found` })
  }

  user.todos[index] = {
    id: id,
    title: title,
    done: user.todos[index].done,
    deadline: new Date(deadline),
    created_at: user.todos[index].created_at,
  };

  return response.status(200).json(user.todos[index]).send();

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const index = user.todos.findIndex((todo) => todo.id === id);

  if (index < 0) {
    return response.status(404).json({ error: `${id} todo not found` });
  }

  user.todos[index].done = true;

  return response.status(200).json(user.todos[index]).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const index = user.todos.findIndex((todo) => todo.id === id);
  
  if (index < 0) {
    return response.status(404).json({ error: `${id} todo not found` });
  } else {
    user.todos.splice(index, 1);
    return response.status(204).json(user.todos);
  }
});

module.exports = app;
