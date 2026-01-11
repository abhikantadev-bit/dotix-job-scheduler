const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'jobs.db');
const db = new sqlite3.Database(DB_PATH);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const WEBHOOK_URL = process.env.WEBHOOK_URL || '';

// Initialize DB
db.serialize(() => {
	db.run(`
		CREATE TABLE IF NOT EXISTS jobs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			taskName TEXT NOT NULL,
			payload TEXT,
			priority TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'pending',
			createdAt DATETIME DEFAULT (datetime('now')),
			updatedAt DATETIME DEFAULT (datetime('now')),
			completedAt DATETIME
		)
	`);
});

const sendWebhook = async (payload) => {
	if (!WEBHOOK_URL) return;
	try {
		await axios.post(WEBHOOK_URL, payload, { headers: { 'Content-Type': 'application/json' } });
		console.log('Webhook delivered');
	} catch (err) {
		console.error('Webhook error:', err.message);
	}
};

// Create job
app.post('/jobs', (req, res) => {
	const { taskName, payload = {}, priority } = req.body;
	if (!taskName || !priority) {
		return res.status(400).json({ error: 'taskName and priority are required' });
	}

	const payloadText = JSON.stringify(payload);
	const stmt = db.prepare(`INSERT INTO jobs (taskName, payload, priority, status) VALUES (?, ?, ?, 'pending')`);
	stmt.run(taskName, payloadText, priority, function (err) {
		if (err) return res.status(500).json({ error: err.message });
		const id = this.lastID;
		db.get('SELECT * FROM jobs WHERE id = ?', [id], (err2, row) => {
			if (err2) return res.status(500).json({ error: err2.message });
			row.payload = row.payload ? JSON.parse(row.payload) : {};
			res.status(201).json(row);
		});
	});
	stmt.finalize();
});

// List jobs with optional filters
app.get('/jobs', (req, res) => {
	const { status, priority } = req.query;
	let query = 'SELECT * FROM jobs WHERE 1=1';
	const params = [];
	if (status) {
		query += ' AND status = ?';
		params.push(status);
	}
	if (priority) {
		query += ' AND priority = ?';
		params.push(priority);
	}
	query += ' ORDER BY createdAt DESC';

	db.all(query, params, (err, rows) => {
		if (err) return res.status(500).json({ error: err.message });
		const parsed = rows.map(r => ({ ...r, payload: r.payload ? JSON.parse(r.payload) : {} }));
		res.json(parsed);
	});
});

// Job detail
app.get('/jobs/:id', (req, res) => {
	const { id } = req.params;
	db.get('SELECT * FROM jobs WHERE id = ?', [id], (err, row) => {
		if (err) return res.status(500).json({ error: err.message });
		if (!row) return res.status(404).json({ error: 'Job not found' });
		row.payload = row.payload ? JSON.parse(row.payload) : {};
		res.json(row);
	});
});

// Run job (simulate background work)
app.post('/run-job/:id', (req, res) => {
	const { id } = req.params;
	db.get('SELECT * FROM jobs WHERE id = ?', [id], (err, job) => {
		if (err) return res.status(500).json({ error: err.message });
		if (!job) return res.status(404).json({ error: 'Job not found' });
		if (job.status === 'running' || job.status === 'completed') {
			return res.status(400).json({ error: `Job is already ${job.status}` });
		}

		const now = new Date().toISOString();
		db.run('UPDATE jobs SET status = ?, updatedAt = ? WHERE id = ?', ['running', now, id], function (uerr) {
			if (uerr) return res.status(500).json({ error: uerr.message });
			res.json({ message: 'Job started' });

			// simulate work asynchronously
			setTimeout(() => {
				const completedAt = new Date().toISOString();
				db.run('UPDATE jobs SET status = ?, completedAt = ?, updatedAt = ? WHERE id = ?', ['completed', completedAt, completedAt, id], function (cerr) {
					if (cerr) return console.error('Error updating job:', cerr.message);
					db.get('SELECT * FROM jobs WHERE id = ?', [id], (err2, finishedJob) => {
						if (err2) return console.error(err2.message);
						const payload = finishedJob.payload ? JSON.parse(finishedJob.payload) : {};
						const webhookPayload = {
							jobId: finishedJob.id,
							taskName: finishedJob.taskName,
							status: finishedJob.status,
							priority: finishedJob.priority,
							payload,
							completedAt: finishedJob.completedAt
						};
						sendWebhook(webhookPayload);
					});
				});
			}, 3000);
		});
	});
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

