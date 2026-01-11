
import './App.css';
import { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

const App = () => {
  const [jobs, setJobs] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [payloadText, setPayloadText] = useState('{}');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    const res = await fetch(`${API_BASE}/jobs?${params.toString()}`);
    const data = await res.json();
    setJobs(data);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const createJob = async () => {
    if (!taskName.trim()) return alert('Task name required');
    let payload = {};
    try {
      payload = payloadText ? JSON.parse(payloadText) : {};
    } catch (e) {
      return alert('Payload must be valid JSON');
    }

    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskName, payload, priority })
    });
    if (res.ok) {
      setTaskName('');
      setPayloadText('{}');
      fetchJobs({ status: statusFilter, priority: priorityFilter });
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create job');
    }
  };

  const runJob = async (id) => {
    await fetch(`${API_BASE}/run-job/${id}`, { method: 'POST' });
    setTimeout(() => fetchJobs({ status: statusFilter, priority: priorityFilter }), 500);
    setTimeout(() => fetchJobs({ status: statusFilter, priority: priorityFilter }), 3500);
  };

  const openDetails = async (id) => {
    const res = await fetch(`${API_BASE}/jobs/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedJob(data);
    }
  };

  const applyFilters = () => {
    fetchJobs({ status: statusFilter, priority: priorityFilter });
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      <h1>Job Scheduler</h1>

      <section style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
        <h2>Create Job</h2>
        <div style={{ marginBottom: 8 }}>
          <label>Task name: </label>
          <input value={taskName} onChange={e => setTaskName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Priority: </label>
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Payload (JSON): </label>
          <br />
          <textarea rows={4} cols={60} value={payloadText} onChange={e => setPayloadText(e.target.value)} />
        </div>
        <button onClick={createJob}>Create Job</button>
      </section>

      <section style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
        <h2>Jobs</h2>
        <div style={{ marginBottom: 8 }}>
          <label>Status: </label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">pending</option>
            <option value="running">running</option>
            <option value="completed">completed</option>
          </select>
          <label style={{ marginLeft: 12 }}>Priority: </label>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button style={{ marginLeft: 12 }} onClick={applyFilters}>Apply</button>
          <button style={{ marginLeft: 8 }} onClick={() => { setStatusFilter(''); setPriorityFilter(''); fetchJobs(); }}>Reset</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>ID</th>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>Task</th>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>Priority</th>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>Status</th>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>Created</th>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id}>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{j.id}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{j.taskName}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{j.priority}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{j.status}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{j.createdAt}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>
                  {j.status === 'pending' && <button onClick={() => runJob(j.id)}>Run</button>}
                  <button style={{ marginLeft: 8 }} onClick={() => openDetails(j.id)}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedJob && (
        <section style={{ border: '1px solid #aaa', padding: 12 }}>
          <h2>Job Details</h2>
          <div><strong>ID:</strong> {selectedJob.id}</div>
          <div><strong>Task:</strong> {selectedJob.taskName}</div>
          <div><strong>Priority:</strong> {selectedJob.priority}</div>
          <div><strong>Status:</strong> {selectedJob.status}</div>
          <div><strong>Created:</strong> {selectedJob.createdAt}</div>
          <div><strong>Updated:</strong> {selectedJob.updatedAt}</div>
          <div><strong>Completed:</strong> {selectedJob.completedAt || '-'}</div>
          <div style={{ marginTop: 8 }}>
            <strong>Payload:</strong>
            <pre style={{ background: '#f7f7f7', padding: 8 }}>{JSON.stringify(selectedJob.payload, null, 2)}</pre>
          </div>
          <button onClick={() => setSelectedJob(null)}>Close</button>
        </section>
      )}
    </div>
  );
};

export default App;
