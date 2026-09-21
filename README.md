# Twelve-Factor Express Microservice

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v24+-green.svg)](https://nodejs.org/)

Minimal Node.js Express microservice structured from the ground up adhering to the **[Twelve-Factor App](https://12factor.net/)** methodology.

---

## 📋 12-Factor Methodology Mapping

| Factor | Principle | Implementation in this service |
| :--- | :--- | :--- |
| **I. Codebase** | One codebase tracked in revision control, many deploys | Single Git repository on GitHub (`weslleych/twelve-factor-express-service`). |
| **II. Dependencies** | Explicitly declare and isolate dependencies | Declared explicitly in `package.json` and pinned via `package-lock.json`. No reliance on implicit system-wide packages. |
| **III. Config** | Store config in the environment | Centralized validation module (`src/config.js`) parses, validates, and freezes runtime configuration (`PORT`, `NODE_ENV`, `APP_NAME`) from environment variables. Secrets and local configs are excluded via `.gitignore`. |
| **IV. Backing services** | Treat backing services as attached resources | Future databases, message brokers, and caches will be connected via environment URL/connection strings. |
| **V. Build, release, run** | Strictly separate build and run stages | Clear operational scripts (`npm start` for production run, CI/CD pipeline compatibility). |
| **VI. Processes** | Execute the app as one or more stateless processes | Stateless HTTP request handling; shared state is never kept in-memory across requests. |
| **VII. Port binding** | Export services via port binding | Self-contained HTTP service binding directly to `process.env.PORT || 3000`. |
| **VIII. Concurrency** | Scale out via the process model | Individual Node.js process ready to be scaled horizontally across containers/processes. |
| **IX. Disposability** | Maximize robustness with fast startup and graceful shutdown | Intercepts `SIGTERM` and `SIGINT`, rejects new requests (503), stops HTTP listener, drains active sockets, closes idle keep-alive connections, and enforces a failsafe timeout. |
| **X. Dev/prod parity** | Keep development, staging, and production as similar as possible | Consistent execution environment and configuration model across all stages. |
| **XI. Logs** | Treat logs as event streams | Middleware streams structured JSON lines (`method`, `route`, `status`, `duration`) directly to `stdout`. Zero log files written to local disk. |
| **XII. Admin processes** | Run admin/management tasks as one-off processes | Admin scripts/migrations can run as one-off tasks in the same environment. |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

Clone the repository and install dependencies:

```bash
git clone git@github.com:weslleych/twelve-factor-express-service.git
cd twelve-factor-express-service
npm install
```

### Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Available environment variables:
- `APP_NAME`: Name identifier for the microservice (defaults to `twelve-factor-express-service`).
- `PORT`: TCP port on which the HTTP server will listen (defaults to `3000`).
- `NODE_ENV`: Application runtime environment (`development`, `production`, `test`). Defaults to `development`.

### Running the Application

- **Production mode:**
  ```bash
  npm start
  ```

- **Development mode (with live watch):**
  ```bash
  npm run dev
  ```

---

## 📡 API Endpoints

- `GET /`: Returns service metadata and status.
- `GET /health`: Healthcheck endpoint for container orchestrators (liveness / readiness probes).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
