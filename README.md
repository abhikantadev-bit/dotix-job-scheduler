# Job Scheduler & Automation System

A full-stack job scheduling and automation system built with **React**, **Node.js/Express**, and **SQLite**. This project demonstrates a complete end-to-end system for creating, managing, and executing background jobs with automatic webhook notifications.

---

## 🎯 Features

- ✅ **Create Jobs** — Add tasks with name, priority, and optional JSON payload
- ✅ **View & Filter Jobs** — Dashboard table with real-time filtering by status and priority
- ✅ **Run Jobs** — Execute pending jobs with status tracking (pending → running → completed)
- ✅ **Job Details** — View full job information including payload, timestamps, and status
- ✅ **Webhook Trigger** — Automatically notify external systems when jobs complete
- ✅ **Persistent Storage** — SQLite database stores all jobs and their states
- ✅ **REST APIs** — Full CRUD and action endpoints for job management

---

## 🛠 Tech Stack

### Frontend
- **React 19.2.3** — UI framework with hooks (useState, useEffect)
- **Fetch API** — Native HTTP client (no axios)
- **Arrow Functions** — Modern JS syntax throughout
- **Plain CSS** — Inline styles for simplicity

### Backend
- **Node.js** — JavaScript runtime
- **Express 5.2.1** — Lightweight web framework
- **SQLite3 5.1.6** — Embedded SQL database
- **Nodemon 3.1.11** — Development auto-reload
- **CORS & Body-Parser** — HTTP middleware

---

## 📁 Project Structure

```
dotix_Assignment/
├── frontend/                  # React app
│   ├── src/
│   │   ├── App.js            # Main job scheduler UI
│   │   ├── App.css           # Styles
│   │   └── index.js          # React entry point
│   ├── package.json
│   └── public/
│
├── backend/                   # Express server
│   ├── index.js              # Server + API endpoints + DB setup
│   ├── jobs.db               # SQLite database (auto-created)
│   ├── package.json
│   └── .env.example          # Environment variable template
│
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** (comes with Node.js)

### Backend Setup

1. Navigate to backend folder:
```bash
cd dotix_Assignment/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Start the server:
```bash
npm run dev
# or for production:
npm start
```

Expected output:
```
Server running on port 4000
```

### Frontend Setup

1. Open a new terminal and navigate to frontend:
```bash
cd dotix_Assignment/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start React dev server:
```bash
npm start
```

Expected: Browser opens at **http://localhost:3000**

---

## 📋 How to Use

### 1. **Create a Job**
- Enter a **Task Name** (e.g., "Send Email", "Generate Report")
- Select **Priority** (Low, Medium, High)
- (Optional) Add **Payload** as JSON (e.g., `{"email": "user@example.com"}`)
- Click **Create Job**
- Job appears in table with status = `pending`

### 2. **View & Filter Jobs**
- Table shows all jobs with columns: ID, Task, Priority, Status, Created
- Use **Status filter** (pending, running, completed)
- Use **Priority filter** (Low, Medium, High)
- Click **Apply** to filter
- Click **Reset** to show all

### 3. **Run a Job**
- Click **Run** button on a `pending` job
- Status changes to `running` (runs for 3 seconds)
- Status auto-updates to `completed`
- Webhook POST is sent to external URL (if configured)

### 4. **View Job Details**
- Click **Details** button on any job
- See full details: ID, task name, priority, status, timestamps
- View formatted JSON payload
- Click **Close** to dismiss

---

## 🔌 API Endpoints

### POST /jobs
**Create a new job**
```bash
curl -X POST http://localhost:4000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Send Email",
    "priority": "High",
    "payload": {"email": "user@example.com"}
  }'
```

Response:
```json
{
  "id": 1,
  "taskName": "Send Email",
  "priority": "High",
  "status": "pending",
  "payload": {"email": "user@example.com"},
  "createdAt": "2025-01-09T...",
  "updatedAt": "2025-01-09T...",
  "completedAt": null
}
```

---

### GET /jobs
**List all jobs (with optional filters)**
```bash
curl "http://localhost:4000/jobs"
curl "http://localhost:4000/jobs?status=pending"
curl "http://localhost:4000/jobs?priority=High"
curl "http://localhost:4000/jobs?status=completed&priority=High"
```

---

### GET /jobs/:id
**Get job details**
```bash
curl "http://localhost:4000/jobs/1"
```

---

### POST /run-job/:id
**Execute a pending job**
```bash
curl -X POST http://localhost:4000/run-job/1
```

Response:
```json
{"message": "Job started"}
```

Job status: `pending` → `running` (3 sec) → `completed` + webhook fired

---

## 🔗 Webhook Configuration

When a job completes, the backend sends a POST request to a **Webhook URL**.

### Setup Webhook URL

1. **Get a test webhook URL** from [webhook.site](https://webhook.site) (free service)
2. Copy the unique URL (e.g., `https://webhook.site/12345-67890`)
3. **Set environment variable** in backend/.env:
```env
WEBHOOK_URL=https://webhook.site/12345-67890
```

4. Restart backend:
```bash
npm run dev
```

### Webhook Payload
When a job completes, this JSON is POSTed to your WEBHOOK_URL:
```json
{
  "jobId": 1,
  "taskName": "Send Email",
  "status": "completed",
  "priority": "High",
  "payload": {"email": "user@example.com"},
  "completedAt": "2025-01-09T12:34:56.789Z"
}
```

### Test Webhook Flow
1. Create a job from UI
2. Click **Run**
3. Visit your webhook.site URL
4. See the POST request logged in real-time ✅

---

## 🗄 Database Schema

SQLite table: `jobs`

```sql
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskName TEXT NOT NULL,
  payload TEXT,                          -- Stored as JSON string
  priority TEXT NOT NULL,                -- 'Low', 'Medium', 'High'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed'
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME
);
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Backend starts: `npm run dev` → "Server running on port 4000"
- [ ] Frontend loads: `npm start` → http://localhost:3000 opens
- [ ] Create job → appears in table with `pending` status
- [ ] Filter by status → filters correctly
- [ ] Click Run → status changes: pending → running → completed
- [ ] Click Details → shows full job info + formatted payload
- [ ] Webhook fires (check webhook.site) → receives POST with completed job data

### Testing with Postman/cURL
- Test `POST /jobs` → creates job
- Test `GET /jobs` → lists jobs
- Test `GET /jobs/1` → shows details
- Test `POST /run-job/1` → executes job

---

## 📦 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repo → Auto-deploy
4. Set `REACT_APP_API_BASE` env var to backend URL

### Backend (Render)
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service → Connect repo
4. Build command: `npm install`
5. Start command: `npm start`
6. Add env var: `WEBHOOK_URL=<your-webhook-url>`

---

## 🔒 Environment Variables

**Backend (.env)**
```env
# Port (default: 4000)
PORT=4000

# Webhook URL (optional, leave empty to skip webhooks)
WEBHOOK_URL=https://webhook.site/your-unique-id
```

See [.env.example](./backend/.env.example) for template.

---

## 📝 Code Architecture

### Frontend (`App.js`)
- **State Management:** useState for jobs, filters, selected job
- **API Calls:** Fetch API with async/await
- **Arrow Functions:** All event handlers use arrow syntax
- **Styling:** Inline CSS for quick styling

### Backend (`index.js`)
- **Express Setup:** CORS, body-parser middleware
- **Database:** SQLite with prepared statements
- **APIs:** 5 RESTful endpoints
- **Async Jobs:** setTimeout simulates background work
- **Webhooks:** axios POST to external URL on job completion

---

## 🐛 Troubleshooting

### Backend Error: "Cannot find module 'sqlite3'"
```bash
cd backend
npm install sqlite3 --save
```

### Port 4000 Already in Use
```bash
# Find process on port 4000
netstat -ano | findstr :4000

# Kill it (Windows PowerShell)
Stop-Process -Id <PID> -Force

# Or use different port:
PORT=5000 npm start
```

### Frontend Can't Connect to Backend
- Ensure backend is running on http://localhost:4000
- Check browser console for CORS errors
- Verify API_BASE in `App.js` is correct

### Webhook Not Firing
- Set `WEBHOOK_URL` in `.env`
- Check backend logs for errors
- Verify webhook URL is accessible (test with curl)

---

## 📄 License

ISC

---

## 👤 Author

Built as a full-stack job scheduling system project.

---

## 📞 Support

For issues or questions, check:
1. Backend logs: `npm run dev` output
2. Browser console: Press F12 in frontend
3. Network tab: Check API response in DevTools
4. Webhook logs: webhook.site dashboard
