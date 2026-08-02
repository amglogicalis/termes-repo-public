<p align="center">
  <img src="assets/logo_termes.png" alt="TERMES Logo" width="220" />
</p>

<h1 align="center">🕷️ TERMES</h1>

<p align="center">
  <b>Terra Ecosystem • Autonomous Web Digesting, Headless Automation & Inverted APIs Engine at $0 Cost</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/terra-termes"><img src="https://img.shields.io/badge/npm-terra--termes-f93318.svg?style=for-the-badge&logo=npm" alt="NPM Package" /></a>
  <a href="https://amglogicalis.github.io/termes-repo-public/"><img src="https://img.shields.io/badge/Termes%20Console-ONLINE-10b981.svg?style=for-the-badge&logo=githubpages" alt="Live Console" /></a>
  <a href="https://github.com/amglogicalis/Termes"><img src="https://img.shields.io/badge/Server%20Cost-%240%20Forever-f59e0b.svg?style=for-the-badge" alt="Zero Server Cost" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" /></a>
</p>

---

## 💡 What is TERMES?

**TERMES** is the autonomous web digesting, headless automation, and synthetic API engine of the **Terra Ecosystem** (inspired by termite mound biology & symbiotic digestion).

It allows developers to turn **ANY website without an API**, legacy portal, SPA, or document into a live **Inverted API** and **Site-to-Webhook** event trigger with **100% Privacy & Security** and **$0 Monthly Server Overhead**.

---

## ⚡ The Inverted API Concept

In traditional web development, APIs must be published by the target service provider. 

**TERMES Inverted APIs** invert this relationship:
1. **Declare Spec**: Define CSS selectors, XPath rules, or regex patterns for the data you need from any target website.
2. **Digest Cellulose**: **Nasute Workers** navigate target sites using Playwright/Puppeteer headless runners, bypassing JS rendering and anti-bots.
3. **Publish Synthetic API**: **Protozoa Engine** digests raw cellulose into structured JSON objects and publishes live **Synthetic REST APIs** on global CDN (GitHub Pages / Ballom Endpoint) with **0ms server delay** and **$0 cost**.
4. **Site-to-Webhook (Alates Swarm)**: Transform passive websites into active **Inverted Webhooks**. TERMES monitors DOM changes and dispatches HTTP POST events to your app, Slack, or Discord.
5. **Multi-Cloud Trophallaxis**: Feed digested data seamlessly into Terra Titans (**Combase**, **Rolla**, **Lumina**) and Multi-Cloud providers (**AWS S3/EventBridge/DynamoDB**, **Azure Blob/EventGrid**, **GCP Storage/PubSub**).

---

## 🏛️ Termite Ecosystem Architecture & Modules

```
                           🏰 TERMES CONSOLE / TERMITARIUM
                                  (Control Plane)
                                         │
               ┌─────────────────────────┼─────────────────────────┐
               ▼                         ▼                         ▼
       👃 NASUTE WORKERS        🕳️ MUD TUNNEL PROXY        🪵 CELLULOSE PROCESSOR
     (Headless Execution)      (Stealth & User-Agents)       (HTML/DOM/PDF Cleaning)
               │                         │                         │
               └─────────────────────────┼─────────────────────────┘
                                         ▼
                              🦠 PROTOZOA ENGINE
                     (Parser CSS/XPath & Schema Builder)
                                         │
               ┌─────────────────────────┴─────────────────────────┐
               ▼                                                   ▼
      🌐 SYNTHETIC REST API                                 🦟 ALATES SWARM
    (Inverted API - 0ms CDN)                             (Inverted Webhooks Engine)
               │                                                   │
               └─────────────────────────┬─────────────────────────┘
                                         ▼
                                🔄 TROPHALLAXIS
         (Feeds to Combase/Rolla & AWS/Azure/GCP Multi-Cloud Bridges)
```

1. 🏰 **Termitarium**: Control plane & extraction specs dashboard inside **Termes Console**.
2. 👃 **Nasute Workers**: Autonomous Headless execution runners (Playwright/Puppeteer) executing in GitHub Actions.
3. 🕳️ **Mud Tunnel Proxy**: Stealth layer, User-Agent rotation, header spoofing & Anti-Bot bypass.
4. 🪵 **Cellulose Processor**: Cleaning and extraction of HTML, DOM trees, tables, and PDFs.
5. 🦠 **Protozoa Engine**: Symbiotic parser transforming raw cellulose into clean JSON schemas.
6. 🦟 **Alates Swarm**: Inverted Webhooks (Site-to-Webhook) triggering alerts when DOM content changes.
7. 🔄 **Trophallaxis**: Multi-Cloud data feeder & bridges (AWS, Azure, GCP, Terra Titans).

---

## 📦 Installation & Setup

### Option 1: Global NPM Installation (Recommended)

Install `terra-termes` globally to access the `termes` CLI command anywhere:

```bash
# Install package globally via npm
npm install -g terra-termes

# Verify CLI installation
termes --help
```

### Option 2: Instant NPX Usage (Zero Installation)

Run TERMES CLI commands directly:

```bash
# Launch live web console
npx terra-termes console

# Run CLI commands
npx terra-termes spec list
```

---

## 🔑 Authentication

Set your GitHub Personal Access Token (PAT) with `repo` permissions as an environment variable:

```bash
# On Linux / macOS
export GITHUB_TOKEN="ghp_your_github_personal_access_token"

# On Windows PowerShell
$env:GITHUB_TOKEN="ghp_your_github_personal_access_token"
```

---

## 💻 CLI Commands Reference

### 🌐 Launch Termes Console
```bash
termes console
```

### 🏰 Termitarium Specs & Inverted APIs
```bash
# Create a new Inverted API spec
termes spec create --name tracker-precio --url "https://tienda.com/laptop" --selectors '{"precio":".price"}'

# List active specs
termes spec list

# Digest URL and publish Synthetic API
termes spec digest --id spec_xyz123

# Delete a spec
termes spec delete --id spec_xyz123
```

### 🦟 Alates Swarm (Inverted Webhooks)
```bash
# Create an Inverted Webhook (Site-to-Webhook)
termes webhook create --name "Alerta Oferta" --url "https://mi-app.com/webhook" --condition on_change

# List active webhooks
termes webhook list

# Delete a webhook
termes webhook delete --id wh_xyz123
```

### 🔄 Trophallaxis (Multi-Cloud Bridges)
```bash
# Create a multi-cloud bridge for AWS S3
termes bridge create --name "AWS S3 Sync" --type aws_s3 --endpoint "https://aws-bridge.com/events"

# List active bridges
termes bridge list
```

---

## 🛠️ Node.js / TypeScript SDK Usage

```typescript
import { Termes } from 'terra-termes';

const termes = new Termes({
  githubToken: process.env.GITHUB_TOKEN!
});

// Initialize state from private Vault
await termes.init();

// 1. Create an Inverted API Spec
const spec = await termes.createSpec(
  'laptop-price-tracker',
  'https://store.com/laptops',
  {
    title: 'h1.product-title',
    price: '.product-price'
  }
);

// 2. Digest and publish Synthetic API to CDN
const { result, cdnUrl } = await termes.digestSpec(spec.specId);
console.log('Inverted Synthetic API URL:', cdnUrl);
console.log('Digested Data:', result.data);

// 3. Create an Inverted Webhook
const webhook = await termes.createInvertedWebhook(
  'Price Change Alert',
  'https://myapp.com/api/webhooks',
  'on_change'
);
```

---

<p align="center">
  <b>Powered by Terra Ecosystem • $0 Monthly Hosting • MIT License</b>
</p>
