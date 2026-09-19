# Node.js Application with Security Flaws for Trivy Testing

This Node.js application is designed for demonstrating and validating security scanning in a CI/CD pipeline using **Trivy**.

## Application Overview

- **Framework**: Express.js
- **Runtime**: Node.js 18+ / 20+
- **Port**: `3000` (default)
- **Container**: Dockerfile provided

---

## Security Flaws Cataloged for Trivy Detection

The code contains deliberate security issues across **two primary files** (`app.js` and `auth.js`) as well as vulnerable dependencies in `package.json`:

### 1. File 1: `app.js`
| Vulnerability | Type / CWE | Trivy Scanner | Detection Mechanism |
| :--- | :--- | :--- | :--- |
| **Hardcoded Secret Tokens** | Secret Leak | `secret` | High-entropy GitHub and Slack API tokens |
| **Command Injection** | CWE-78 | `config` / SAST | Direct `child_process.exec` on unescaped user parameter |
| **Prototype Pollution** | CWE-1321 | `vuln` (SCA) | Unsanitized `lodash.merge()` on vulnerable `lodash@4.17.20` |
| **Path Traversal** | CWE-22 | `config` / SAST | Unrestricted `fs.readFile` using `path.join(__dirname, req.query.name)` |

### 2. File 2: `auth.js`
| Vulnerability | Type / CWE | Trivy Scanner | Detection Mechanism |
| :--- | :--- | :--- | :--- |
| **Hardcoded AWS Credentials** | Secret Leak | `secret` | Plaintext AWS Access Key (`AKIA...`) and Secret Access Key |
| **Database Connection String** | Secret Leak | `secret` | Embedded Postgres password in connection URL |
| **Broken Cryptography (MD5)** | CWE-327 / CWE-328 | SAST / Code | Deprecated MD5 hashing algorithm used for password validation |
| **SQL Injection** | CWE-89 | SAST / Code | Unsanitized string interpolation in SQL query generation |
| **Unsafe `eval()` Execution** | CWE-95 | SAST / Code | Dynamic code execution via `eval()` on raw user payload |

### 3. Dependencies: `package.json`
- `lodash@4.17.20` -> CVE-2020-8203, CVE-2021-23337
- `jsonwebtoken@8.5.1` -> CVE-2022-23529, CVE-2022-23540
- `axios@0.21.1` -> CVE-2020-28168, CVE-2021-3749
- `minimist@1.2.0` -> CVE-2020-7598, CVE-2021-44906

---

## Running Locally

### Install Dependencies
```bash
npm install
```

### Run Automated Tests
```bash
npm test
```

### Start Server
```bash
npm start
```

---

## Trivy Security Scan Commands

Run Trivy locally against the project directory:

```bash
# Scan for vulnerabilities, secrets, and misconfigurations
trivy fs --scanners vuln,secret,misconfig .

# Scan specifically for secrets
trivy fs --scanners secret .

# Scan dependencies only
trivy fs --scanners vuln .
```
