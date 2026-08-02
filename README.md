<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# ComplianceFlow — Enterprise Compliance Management Platform

ComplianceFlow is a multi-tenant enterprise compliance, audit, document, and renewal management platform.

View your app in AI Studio: https://ai.studio/apps/a642bebe-a5e7-49fb-bd80-b7a3056e6dd3

## Local Development

**Prerequisites:** Node.js v18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set environment variables in `.env.example` or `.env.local`:
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   APP_URL="http://localhost:3000"
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Production Build & Deployment

### Build Command

```bash
npm run build
```

This builds the SPA frontend with Vite and bundles the Node backend with `esbuild` into `dist/server.cjs`.

### Production Start Command

```bash
npm run start
```

Runs `node dist/server.cjs` serving the API routes and static production assets on `0.0.0.0:3000`.

### Security & Compliance Verification

- **Role-Based Access Control (RBAC)**: Enforced across all enterprise API endpoints.
- **Multi-Tenant Data Isolation**: Company-level tenant scoping on all database queries.
- **Security Headers & CORS**: Enforced on server responses (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, strict CORS).
- **Audit Logging**: Cryptographically referenced, immutable log generation for all sensitive mutations.
