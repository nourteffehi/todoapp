import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setError('Impossible de contacter l\'API.');
    } finally {
      setLoading(false);
    }
  }

  async function addTask(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: input.trim() }),
    });
    const task = await res.json();
    setTasks([task, ...tasks]);
    setInput('');
  }

  async function toggleTask(id, done) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !done }),
    });
    const updated = await res.json();
    setTasks(tasks.map(t => t.id === id ? updated : t));
  }

  async function deleteTask(id) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter(t => t.id !== id));
  }

  const done = tasks.filter(t => t.done).length;

  return (
    <div className="app">
      <header>
        <h1>Mes Tâches</h1>
        <p className="subtitle">{done} / {tasks.length} complétées</p>
      </header>

      <form onSubmit={addTask} className="form">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nouvelle tâche..."
        />
        <button type="submit">Ajouter</button>
      </form>

      {loading && <p className="state">Chargement...</p>}
      {error  && <p className="state error">{error}</p>}

      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className={task.done ? 'done' : ''}>
            <button className="check" onClick={() => toggleTask(task.id, task.done)}>
              {task.done ? '✓' : '○'}
            </button>
            <span>{task.title}</span>
            <button className="del" onClick={() => deleteTask(task.id)}>✕</button>
          </li>
        ))}
        {!loading && tasks.length === 0 && (
          <li className="empty">Aucune tâche. Commencez par en ajouter une !</li>
        )}
      </ul>

      <footer>
        <small>TP Virtualisation &amp; Cloud — version Vercel complète</small>
      </footer>
    </div>
  );
}
