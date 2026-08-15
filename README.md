<p align="center">
  <img src="https://raw.githubusercontent.com/amglogicalis/termes-repo-public/gh-pages/assets/logo_termes.png" alt="TERMES Logo" width="220" />
</p>

<h1 align="center">🕷️ TERMES — Public Inverted APIs & Web Digesting Engine</h1>

<p align="center">
  <b>Terra Ecosystem • Autonomous Web Digesting, Headless Automation & Inverted APIs Engine at $0 Cost</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/terra-termes"><img src="https://img.shields.io/badge/npm-terra--termes-f93318.svg?style=for-the-badge&logo=npm" alt="NPM Package" /></a>
  <a href="https://amglogicalis.github.io/termes-repo-public/"><img src="https://img.shields.io/badge/Termes%20Console-ONLINE-10b981.svg?style=for-the-badge&logo=githubpages" alt="Live Console" /></a>
  <a href="https://github.com/amglogicalis/termes-repo-public"><img src="https://img.shields.io/badge/Server%20Cost-%240%20Forever-f59e0b.svg?style=for-the-badge" alt="Zero Server Cost" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" /></a>
</p>

---

<p align="center">
  <img src="https://raw.githubusercontent.com/amglogicalis/termes-repo-public/gh-pages/assets/console_web_termes_preview.png" alt="TERMES Web Console Preview" width="100%" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

---

## 💡 What is TERMES?

**TERMES** is the autonomous web digesting, headless automation, and synthetic API engine of the **Terra Ecosystem** (inspired by termite mound biology and symbiotic digestion).

It allows developers to turn **ANY website without an API**, e-commerce store, legacy portal, SPA, or document into a live **Inverted API** and **Site-to-Webhook** event trigger with **100% Privacy & Security** and **$0 Monthly Server Overhead**.

> [!IMPORTANT]
> **No Git Cloning Needed!**
> The core Terra monorepo is private. TERMES is distributed globally over the internet as an open-access NPM package (**`terra-termes`**) and live Web Console. You do **NOT** need to clone any repository to use TERMES in your terminal or applications.

---

## ⚡ How TERMES Works (The Inverted API Concept)

In traditional web development, APIs are published and controlled by target service providers (who often paywall or restrict them).

**TERMES Inverted APIs** invert this relationship:

```
                            🏰 TERMES CONSOLE / TERMITARIUM
                                   (Control Plane)
                                          │
                ┌─────────────────────────┼─────────────────────────┐
                ▼                         ▼                         ▼
        👃 NASUTE WORKERS        🕳️ MUD TUNNEL PROXY        🪵 CELLULOSE PROCESSOR
      (Headless Execution)      (Stealth & Anti-Bot)          (HTML/DOM Cleaning)
                │                         │                         │
                └─────────────────────────┼─────────────────────────┘
                                          ▼
                               🦠 PROTOZOA ENGINE
                      (Parser CSS/XPath & Schema Builder)
                                          │
                ┌─────────────────────────┴─────────────────────────┐
                ▼                                                   ▼
       🌐 SYNTHETIC REST API                                 🦟 ALATES SWARM
     (Termitomyces - 0ms CDN)                             (Inverted Webhooks Engine)
                │                                                   │
                └─────────────────────────┬─────────────────────────┘
                                          ▼
                                 🔄 TROPHALLAXIS
          (Feeds to Combase/Rolla & AWS/Azure/GCP Multi-Cloud Bridges)
```

1. **Declare Spec (Termitarium 🏰)**: Define CSS selectors, XPath rules, or regex patterns for the target data you want to extract from any website in the world.
2. **Stealth Navigation (Mud Tunnel 🕳️ & Nasute Workers 👃)**: TERMES navigates target sites using headless runners with anti-bot bypass, stealth headers, and proxy rotation.
3. **Digest Raw Content (Cellulose Processor 🪵 & Protozoa Engine 🦠)**: Cleans raw HTML/DOM trees and digests unstructured cellulose into clean JSON schemas.
4. **Publish Synthetic REST API (Termitomyces 🍄)**: Cultivates and publishes live **Synthetic REST APIs** on global CDN (GitHub Pages / Raw CDN) with **0ms server delay** and **$0 cost**.
5. **Site-to-Webhook (Alates Swarm 🦟)**: Converts passive websites into active **Inverted Webhooks**. TERMES monitors DOM content changes and dispatches instant `POST` alerts to your app, Discord, or Slack.
6. **Multi-Cloud Data Feeds (Trophallaxis 🔄)**: Streams digested data directly to Terra Titans (**Combase**, **Rolla**, **Lumina**) and Cloud Providers (**AWS S3**, **Azure Blob**, **GCP Storage**).

---

## 🏛️ Ecosystem Core Concepts & Terminology

| Biological Metaphor | Module Name | Technical Function |
| :--- | :--- | :--- |
| 🏰 **Termitarium** | **Extraction Spec Engine** | Control panel & recipe manager storing target URLs and CSS selectors. |
| 👃 **Nasute Workers** | **Headless Execution** | Autonomous web runners executing extraction tasks. |
| 🕳️ **Mud Tunnel** | **Stealth Layer** | User-Agent rotation, stealth proxying, and Anti-Bot bypass. |
| 🪵 **Cellulose** | **DOM Content** | Unstructured raw HTML, JavaScript DOM trees, or document tables. |
| 🦠 **Protozoa** | **Symbiotic Parser** | Schema builder converting raw DOM nodes into structured JSON objects. |
| 🍄 **Termitomyces** | **Synthetic APIs** | Live public or private REST endpoints served from global CDNs at 0ms. |
| 🦟 **Alates Swarm** | **Inverted Webhooks** | Site-to-Webhook engine firing HTTP alerts when target DOM varies. |
| 🔄 **Trophallaxis** | **Multi-Cloud Bridges** | Data exchange pipelines feeding Combase, Rolla, AWS, Azure, and GCP. |

---

## 📦 Global Installation & Quick Start

Installing TERMES requires only **Node.js 18+** installed on your machine.

### Option 1: Global CLI Installation (Recommended)

Install `terra-termes` globally via NPM:

```bash
# Install globally from NPM
npm install -g terra-termes

# Verify installation
termes --version
```

### Option 2: Instant NPX Execution (No Setup)

Run TERMES CLI directly without permanent installation:

```bash
# Launch live web console directly
npx terra-termes console

# Create an extraction spec
npx terra-termes spec list
```

---

## 🔑 Authentication Setup

TERMES uses a GitHub Personal Access Token (PAT) with `repo` permissions to publish 0ms Synthetic APIs and maintain state at $0 cost.

Set your token as an environment variable in your terminal:

```bash
# On Linux / macOS
export GITHUB_TOKEN="ghp_your_github_personal_access_token"

# On Windows PowerShell
$env:GITHUB_TOKEN="ghp_your_github_personal_access_token"
```

---

## 💻 CLI Commands Reference

### 🌐 Abrir Consola Web Local (Offline en Localhost)
```bash
# Abrir consola web local en puerto por defecto (http://localhost:3720)
termes console

# O en puerto personalizado:
termes studio --port 4000
```
*Inicia un servidor HTTP local en `http://localhost:3720` (o puerto personalizado) para administrar TERMES de forma 100% privada sin depender de Internet. Si el puerto está ocupado, detecta automáticamente el siguiente disponible.*

---

### 🏰 Termitarium Extraction Specs & Inverted APIs

```bash
# 1. Create a new Inverted API Spec
termes spec create --name "tracker-precios" --url "https://tienda.com/producto" --selectors '{"precio":".price-tag","titulo":"h1"}'

# 2. List all active extraction specs
termes spec list

# 3. Digest a spec and publish live Synthetic API
termes spec digest --id spec_xyz123

# 4. Delete a spec
termes spec delete --id spec_xyz123
```

---

### 🦟 Alates Swarm — Inverted Webhooks (Site-to-Webhook)

```bash
# 1. Create an Inverted Webhook trigger
termes webhook create --name "Alerta Cambio Precio" --url "https://mi-app.com/webhook" --condition on_change

# 2. List active webhooks
termes webhook list

# 3. Delete a webhook
termes webhook delete --id wh_xyz123
```

---

### 🔄 Trophallaxis — Multi-Cloud Bridges & Mapeador de Campos

```bash
# 1. Crear un puente Multi-Cloud con Mapeador de Campos JSON
termes bridge create \
  --name "Sync Combase Events" \
  --type terra_combase \
  --repo "https://github.com/amglogicalis/combase-storage" \
  --target "sandbox_events" \
  --spec "spec_xyz123" \
  --mapper '{"precio":"price_eur","titulo":"product_title"}'

# 2. Listar puentes activos y sus destinos
termes bridge list

# 3. Probar un puente mediante Simulación Dry-Run (sin enviar datos reales)
termes bridge simulate --id bridge_xyz123

# 4. Ver histórico y logs de auditoría de un puente
termes bridge logs --id bridge_xyz123

# 5. Actualizar configuración de un puente existente
termes bridge update --id bridge_xyz123 --target "eventos_v2"

# 6. Eliminar un puente
termes bridge delete --id bridge_xyz123
```

### 🔬 Symbiont AI Gateway — Web-AI Bridge & OpenAI Endpoints (CLI & SDK)

El motor **Symbiont** transforma sesiones web de IA (Google Gemini Web, DeepSeek, ChatGPT, Claude) en un servidor local estándar compatible con **OpenAI REST API** (`/v1/chat/completions`) a **coste $0 y sin límites de API comercial**:

```bash
# 1. Iniciar el servidor local OpenAI-compatible en el puerto 7420
termes symbiont start --port 7420

# 2. Generar una llave sk-termes-symbiont con Auto-Fallback (Gemini -> DeepSeek -> ChatGPT)
termes symbiont key create --name "Cursor IDE Dev" --model "gemini-3.7-flash"

# 3. Generar una llave pública abierta (consumible sin exigencia de Bearer token)
termes symbiont key create --name "Public Dev Key" --model "gemini-3.7-flash" --no-auth

# 4. Listar todas las llaves generadas y su estado
termes symbiont key list

# 5. Registrar un proveedor web adicional o actualizar prioridad
termes symbiont provider add --type gemini_web --name "Google Gemini Web 3.7"

# 6. Listar proveedores y orden de Auto-Fallback
termes symbiont provider list

# 7. Probar una consulta de inferencia en tiempo real desde la terminal
termes symbiont test --prompt "Quien es el mejor jugador de futbol del mundo?" --model "gemini-3.7-flash"
```

#### 🔌 Integración con Cursor IDE (`settings.json`)
```json
{
  "openai.baseUrl": "http://localhost:7420/v1",
  "openai.apiKey": "sk-termes-symbiont-default-live",
  "openai.model": "gemini-3.7-flash"
}
```

#### 🐍 Consumo desde Python con el SDK Oficial de OpenAI
```python
from openai import OpenAI

# Conecta al Gateway de Termes en local
client = OpenAI(
    base_url="http://localhost:7420/v1",
    api_key="sk-termes-symbiont-default-live"  # o sin clave si allowPublicAccess está activo
)

response = client.chat.completions.create(
    model="gemini-3.7-flash",
    messages=[{"role": "user", "content": "Escribe un script en Python para procesar un CSV"}]
)

print(response.choices[0].message.content)
```

---

## 🛠️ Node.js & TypeScript SDK Usage

You can import `terra-termes` directly into any Node.js, Next.js, Express, or TypeScript project:

```typescript
import { Termes, SymbiontGateway } from 'terra-termes';

// Initialize TERMES SDK
const termes = new Termes({
  githubToken: process.env.GITHUB_TOKEN!
});

// Load state from Vault
await termes.init();

// ── 🔬 Symbiont AI Gateway (OpenAI Compatible Bridge) ──
// 1. Generate a Symbiont API Key
const key = termes.createSymbiontKey({
  name: 'Dev Assistant Key',
  providerChain: ['prov_gemini_web', 'prov_deepseek_web', 'prov_chatgpt_web'],
  defaultModel: 'gemini-3.7-flash',
  authRequired: false // Libre acceso público
});
console.log('🔑 New Symbiont Key:', key.keyId);

// 2. Start Local REST Server (compatible with OpenAI standard)
await termes.startSymbiontGateway(7420);
console.log('⚡ OpenAI endpoint ready at http://localhost:7420/v1/chat/completions');

// 3. Direct Chat Completion with Auto-Fallback
const completion = await termes.symbiontChatCompletion({
  model: 'gemini-3.7-flash',
  messages: [{ role: 'user', content: 'Hola mundo desde Termes Symbiont' }]
}, key.keyId);

console.log('🤖 Assistant:', completion.choices[0].message.content);
console.log('🔄 Provider Used:', completion.provider_used);
console.log('⚠️ Fallback Occurred:', completion.fallback_occurred);
```

---

## 🔌 Conectar con Cursor IDE, n8n y Python OpenAI SDK

### 1. Cursor IDE (`settings.json`)
```json
{
  "openai.baseUrl": "http://localhost:7420/v1",
  "openai.apiKey": "sk-termes-symbiont-default-live",
  "openai.model": "gemini-2.5-flash"
}
```

### 2. Python OpenAI SDK
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:7420/v1",
    api_key="sk-termes-symbiont-default-live"
)

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[{"role": "user", "content": "¿Cómo funciona el puente?"}]
)
print(response.choices[0].message.content)
```

---

## 🌐 Live Online Console

Access the official TERMES Web Console hosted on GitHub Pages:
👉 **[https://amglogicalis.github.io/termes-repo-public/](https://amglogicalis.github.io/termes-repo-public/)**

---

<p align="center">
  <b>Powered by Terra Ecosystem • $0 Monthly Server Cost • MIT License</b>
</p>
