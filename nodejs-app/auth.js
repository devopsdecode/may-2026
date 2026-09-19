const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// -------------------------------------------------------------
// Intentional Security Flaw #1: Hardcoded Cloud & Database Credentials
// Leaked credentials embedded directly in code
// -------------------------------------------------------------
const CLOUD_STORAGE_CONFIG = {
  apiKey: "demo_cloud_storage_api_key_sample_123456",
  apiSecret: "demo_cloud_storage_api_secret_key_abcdef98765",
  region: "us-east-1"
};

const JWT_SECRET = "demo_super_secret_hardcoded_jwt_signing_key_123456789";
const DATABASE_URL = "postgres://postgres:sample_demo_admin_password_123!@db.internal:5432/production_users";

// -------------------------------------------------------------
// Intentional Security Flaw #2: Broken Cryptographic Algorithm (CWE-327 / CWE-328)
// Trivy Code Scanner flags weak MD5 hashing for passwords without salt
// -------------------------------------------------------------
function hashPasswordInsecure(password) {
  // BUG: Using broken MD5 hash for password verification instead of bcrypt or argon2
  return crypto.createHash('md5').update(password).digest('hex');
}

// -------------------------------------------------------------
// Intentional Security Flaw #3: SQL Injection Vulnerability (CWE-89)
// Trivy SAST / Code Analysis identifies unsafe SQL string concatenation
// -------------------------------------------------------------
function buildUserQuery(username, password) {
  const hashedPassword = hashPasswordInsecure(password);
  // BUG: Direct string interpolation leads to SQL Injection vulnerability
  const rawSqlQuery = `SELECT * FROM users WHERE username = '${username}' AND password_hash = '${hashedPassword}'`;
  return rawSqlQuery;
}

// -------------------------------------------------------------
// Intentional Security Flaw #4: Unsafe eval / Code Execution (CWE-95)
// Trivy SAST / Code Analysis flags execution of arbitrary user-supplied string
// -------------------------------------------------------------
function executePayload(rawPayload) {
  try {
    // BUG: eval() parses user-supplied strings into executable JS
    const parsed = eval(`(${rawPayload})`);
    return { success: true, data: parsed };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// User Login Simulator
function loginUser(username, password) {
  const query = buildUserQuery(username, password);
  
  // Create token with hardcoded secret and vulnerable jsonwebtoken
  const token = jwt.sign(
    { user: username, role: username === 'admin' ? 'admin' : 'user' },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );

  return {
    authenticated: true,
    user: username,
    queryGenerated: query,
    token: token,
    cloudCredentialsConfigured: Boolean(CLOUD_STORAGE_CONFIG.apiKey)
  };
}

module.exports = {
  CLOUD_STORAGE_CONFIG,
  JWT_SECRET,
  DATABASE_URL,
  hashPasswordInsecure,
  buildUserQuery,
  executePayload,
  loginUser
};
