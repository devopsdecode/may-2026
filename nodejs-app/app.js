const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const auth = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------------
// Intentional Security Flaw #1: Hardcoded Secret Tokens (Secrets Leak)
// Generic credentials embedded directly in code
// -------------------------------------------------------------
const INTERNAL_API_TOKEN = "demo_internal_api_secret_token_key_1234567890";
const NOTIFICATION_BOT_TOKEN = "demo_bot_service_secret_token_abcdef123456";

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Node.js Application is running successfully!",
    version: "1.0.0",
    docs: "/health, /api/ping, /api/merge, /api/file, /api/auth/login"
  });
});

// Health Check Endpoint (used by CI/CD and deployment checks)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "UP",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// Intentional Security Flaw #2: Command Injection Vulnerability (CWE-78)
// Trivy Code Scanner / SAST flags unsanitized execution of system commands
// -------------------------------------------------------------
app.get('/api/ping', (req, res) => {
  const host = req.query.host || '127.0.0.1';
  // BUG: Unsanitized user input passed directly to child_process.exec
  const command = `ping -c 1 ${host}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message, stderr });
    }
    res.json({ output: stdout });
  });
});

// -------------------------------------------------------------
// Intentional Security Flaw #3: Prototype Pollution via lodash (CWE-1321)
// Trivy Dependency Scanner (SCA) flags vulnerable lodash (CVE-2020-8203)
// -------------------------------------------------------------
app.post('/api/merge', (req, res) => {
  const target = {};
  const payload = req.body;
  // BUG: lodash.merge on vulnerable lodash 4.17.20 allows Prototype Pollution
  _.merge(target, payload);
  res.json({ success: true, target });
});

// -------------------------------------------------------------
// Intentional Security Flaw #4: Path Traversal Vulnerability (CWE-22)
// Trivy SAST / Code Analysis identifies unsafe file access
// -------------------------------------------------------------
app.get('/api/file', (req, res) => {
  const fileName = req.query.name || 'app.js';
  // BUG: Arbitrary file reading without validation or directory restriction
  const filePath = path.join(__dirname, fileName);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: "File not found or unreadable" });
    }
    res.send(data);
  });
});

// Authentication endpoints using auth module
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const result = auth.loginUser(username, password);
  res.json(result);
});

app.post('/api/auth/execute-payload', (req, res) => {
  const { payload } = req.body;
  const result = auth.executePayload(payload);
  res.json(result);
});

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
