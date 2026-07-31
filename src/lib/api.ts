export interface User {
  id: number;
  username: string;
}

export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export async function me(): Promise<User> {
  const res = await fetch('/app/api/auth/me', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Not logged in');
  return res.json();
}

export async function login(username: string, password: string): Promise<User> {
  const res = await fetch('/app/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function register(username: string, password: string): Promise<User> {
  const res = await fetch('/app/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch('/app/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
}

export async function getTodos(): Promise<Todo[]> {
  const res = await fetch('/app/api/todos', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTodo(title: string): Promise<Todo> {
  const res = await fetch('/app/api/todos', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTodo(id: number, done: boolean): Promise<Todo> {
  const res = await fetch(`/app/api/todos/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done })
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`/app/api/todos/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete task');
}
