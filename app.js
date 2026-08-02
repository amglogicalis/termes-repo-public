// TERMES CONSOLE — Web Dashboard Application Logic

class TermesConsole {
  constructor() {
    this.token = localStorage.getItem('termes_github_token') || '';
    this.storageRepo = '.termes-storage';
    this.cdnRepo = 'termes-repo-public';
    this.state = {
      specs: {},
      webhooks: {},
      trophallaxisBridges: {},
      history: [],
      auditLog: []
    };
    this.owner = '';
  }

  async init() {
    if (this.token) {
      document.getElementById('github-token').value = this.token;
      await this.loadVaultState();
    }
    this.renderAll();
  }

  saveToken() {
    const val = document.getElementById('github-token').value.trim();
    if (!val) {
      this.showToast('Please enter a valid GitHub token.', 'error');
      return;
    }
    this.token = val;
    localStorage.setItem('termes_github_token', val);
    this.showToast('Token saved! Loading Termitarium state...', 'success');
    this.loadVaultState();
  }

  async fetchGitHub(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Termes-Console-App/1.0',
        ...(options.headers || {})
      }
    });
    return res;
  }

  async getOwner() {
    if (this.owner) return this.owner;
    const res = await this.fetchGitHub('/user');
    if (res.ok) {
      const u = await res.json();
      this.owner = u.login;
      return this.owner;
    }
    return '';
  }

  async ensureStorageRepo() {
    const owner = await this.getOwner();
    if (!owner) return;
    const res = await this.fetchGitHub(`/repos/${owner}/${this.storageRepo}`);
    if (res.status === 404) {
      await this.fetchGitHub('/user/repos', {
        method: 'POST',
        body: JSON.stringify({
          name: this.storageRepo,
          description: '🔒 TERMES — Encrypted Vault Storage (Inverted APIs & Specs)',
          private: true,
          auto_init: true
        })
      });
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  async loadVaultState() {
    try {
      await this.ensureStorageRepo();
      const owner = await this.getOwner();
      if (!owner) return;

      const res = await this.fetchGitHub(`/repos/${owner}/${this.storageRepo}/contents/state.json`);
      if (res.status === 404) {
        await this.saveVaultState('Initialize Termes Vault State');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const content = atob(data.content.replace(/\n/g, ''));
        this.state = JSON.parse(content);
        if (!this.state.specs) this.state.specs = {};
        if (!this.state.webhooks) this.state.webhooks = {};
        if (!this.state.trophallaxisBridges) this.state.trophallaxisBridges = {};
        this.showToast('Termitarium Vault loaded successfully!', 'success');
        this.renderAll();
      }
    } catch (e) {
      this.showToast(`Error loading state: ${e.message}`, 'error');
    }
  }

  async saveVaultState(message = 'Update Termes State') {
    try {
      const owner = await this.getOwner();
      if (!owner) return;

      const getRes = await this.fetchGitHub(`/repos/${owner}/${this.storageRepo}/contents/state.json`);
      let sha;
      if (getRes.ok) {
        const d = await getRes.json();
        sha = d.sha;
      }

      const contentEncoded = btoa(JSON.stringify(this.state, null, 2));
      await this.fetchGitHub(`/repos/${owner}/${this.storageRepo}/contents/state.json`, {
        method: 'PUT',
        body: JSON.stringify({ message, content: contentEncoded, sha })
      });
    } catch (e) {
      this.showToast(`Error saving state: ${e.message}`, 'error');
    }
  }

  // Render UI
  renderAll() {
    this.renderStats();
    this.renderSpecs();
    this.renderWebhooks();
    this.renderBridges();
  }

  renderStats() {
    const specsCount = Object.keys(this.state.specs || {}).length;
    const webhooksCount = Object.keys(this.state.webhooks || {}).length;
    const bridgesCount = Object.keys(this.state.trophallaxisBridges || {}).length;

    document.getElementById('stat-specs').textContent = specsCount;
    document.getElementById('stat-apis').textContent = specsCount;
    document.getElementById('stat-webhooks').textContent = webhooksCount;
    document.getElementById('stat-bridges').textContent = bridgesCount;
  }

  renderSpecs() {
    const tbody = document.getElementById('specs-table-body');
    const specs = Object.values(this.state.specs || {});

    if (specs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No extraction specs created yet in Termitarium.</td></tr>`;
      return;
    }

    const owner = this.owner || 'user';
    tbody.innerHTML = specs.map(s => {
      const cdnUrl = `https://${owner}.github.io/${this.cdnRepo}/api/v1/termes/${s.specId}.json`;
      const selectorsSummary = Object.keys(s.selectors || {}).join(', ') || 'None';

      return `
        <tr>
          <td><code>${s.specId}</code></td>
          <td><strong>${s.name}</strong></td>
          <td><a href="${s.targetUrl}" target="_blank" style="color: var(--primary); font-size: 0.82rem;">${s.targetUrl}</a></td>
          <td><span class="badge badge-gold">${selectorsSummary}</span></td>
          <td>
            <a href="${cdnUrl}" target="_blank" class="badge badge-primary">🌐 Synthetic API</a>
          </td>
          <td>
            <button class="btn-icon" onclick="app.digestSpec('${s.specId}')" title="Digest URL">⚡</button>
            <button class="btn-icon" onclick="app.openEditSpecModal('${s.specId}')" title="Edit">✏️</button>
            <button class="btn-icon" onclick="app.deleteSpec('${s.specId}')" title="Delete">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderWebhooks() {
    const tbody = document.getElementById('webhooks-table-body');
    const webhooks = Object.values(this.state.webhooks || {});

    if (webhooks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No Inverted Webhooks configured.</td></tr>`;
      return;
    }

    tbody.innerHTML = webhooks.map(w => `
      <tr>
        <td><code>${w.ruleId}</code></td>
        <td><strong>${w.name}</strong></td>
        <td><span class="badge badge-blue">${w.triggerCondition}</span></td>
        <td><span style="font-size: 0.82rem; color: var(--text-muted);">${w.targetUrl}</span></td>
        <td><span class="badge badge-green">Active</span></td>
        <td>
          <button class="btn-icon" onclick="app.deleteWebhook('${w.ruleId}')" title="Delete">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  renderBridges() {
    const tbody = document.getElementById('bridges-table-body');
    const bridges = Object.values(this.state.trophallaxisBridges || {});

    if (bridges.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No Multi-Cloud Bridges configured.</td></tr>`;
      return;
    }

    tbody.innerHTML = bridges.map(b => `
      <tr>
        <td><code>${b.targetId}</code></td>
        <td><strong>${b.name}</strong></td>
        <td><span class="badge badge-gold">${b.type}</span></td>
        <td><span style="font-size: 0.82rem; color: var(--text-muted);">${b.config.webhookUrl || b.config.endpoint || 'Configured'}</span></td>
        <td><span class="badge badge-green">Active</span></td>
        <td>
          <button class="btn-icon" onclick="app.deleteBridge('${b.targetId}')" title="Delete">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  // Form Handlers
  async handleCreateSpec(e) {
    e.preventDefault();
    const name = document.getElementById('spec-name').value.trim();
    const targetUrl = document.getElementById('spec-target-url').value.trim();
    const selectorsStr = document.getElementById('spec-selectors').value.trim();
    const description = document.getElementById('spec-description').value.trim();

    let selectors = {};
    try {
      selectors = JSON.parse(selectorsStr);
    } catch {
      const pairs = selectorsStr.split(',').map(p => p.split('=').map(s => s.trim()));
      selectors = Object.fromEntries(pairs);
    }

    const specId = `spec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const spec = {
      specId,
      name,
      description,
      targetUrl,
      selectors,
      active: true,
      createdAt: now,
      updatedAt: now
    };

    this.state.specs[specId] = spec;
    await this.saveVaultState(`Create spec ${name}`);
    this.closeModal('create-spec-modal');
    document.getElementById('create-spec-form').reset();
    this.showToast('Inverted API Spec created in Termitarium!', 'success');
    this.renderAll();
  }

  openEditSpecModal(specId) {
    const s = this.state.specs[specId];
    if (!s) return;
    document.getElementById('edit-spec-id').value = specId;
    document.getElementById('edit-spec-name').value = s.name;
    document.getElementById('edit-spec-target-url').value = s.targetUrl;
    document.getElementById('edit-spec-selectors').value = JSON.stringify(s.selectors, null, 2);
    this.openModal('edit-spec-modal');
  }

  async handleUpdateSpec(e) {
    e.preventDefault();
    const specId = document.getElementById('edit-spec-id').value;
    const s = this.state.specs[specId];
    if (!s) return;

    s.name = document.getElementById('edit-spec-name').value.trim();
    s.targetUrl = document.getElementById('edit-spec-target-url').value.trim();
    try {
      s.selectors = JSON.parse(document.getElementById('edit-spec-selectors').value);
    } catch {
      this.showToast('Selectors must be valid JSON.', 'error');
      return;
    }
    s.updatedAt = new Date().toISOString();

    await this.saveVaultState(`Update spec ${s.name}`);
    this.closeModal('edit-spec-modal');
    this.showToast('Spec updated successfully!', 'success');
    this.renderAll();
  }

  async deleteSpec(specId) {
    if (!confirm('Are you sure you want to delete this Spec from Termitarium?')) return;
    delete this.state.specs[specId];
    await this.saveVaultState(`Delete spec ${specId}`);
    this.showToast('Spec deleted.', 'success');
    this.renderAll();
  }

  async digestSpec(specId) {
    const s = this.state.specs[specId];
    if (!s) return;

    this.showToast(`Digesting ${s.name}...`, 'info');
    const simulatedData = {
      specId,
      digestedAt: new Date().toISOString(),
      sampleTitle: `Digested Content from ${s.name}`,
      status: 'OK'
    };

    s.lastResult = simulatedData;
    s.lastDigestedAt = new Date().toISOString();

    // Publish Synthetic API JSON to CDN
    const owner = await this.getOwner();
    if (owner) {
      const path = `api/v1/termes/${specId}.json`;
      const contentEncoded = btoa(JSON.stringify(simulatedData, null, 2));
      const getRes = await this.fetchGitHub(`/repos/${owner}/${this.cdnRepo}/contents/${path}`);
      let sha;
      if (getRes.ok) {
        const d = await getRes.json();
        sha = d.sha;
      }
      await this.fetchGitHub(`/repos/${owner}/${this.cdnRepo}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify({ message: `Digest ${s.name}`, content: contentEncoded, sha })
      });
    }

    await this.saveVaultState(`Digest spec ${s.name}`);
    this.showToast(`Digested successfully! Synthetic API updated.`, 'success');
    this.renderAll();
  }

  // Webhooks
  async handleCreateWebhook(e) {
    e.preventDefault();
    const name = document.getElementById('webhook-name').value.trim();
    const targetUrl = document.getElementById('webhook-url').value.trim();
    const triggerCondition = document.getElementById('webhook-condition').value;

    const ruleId = `wh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    this.state.webhooks[ruleId] = {
      ruleId,
      name,
      targetUrl,
      triggerCondition,
      active: true,
      createdAt: new Date().toISOString()
    };

    await this.saveVaultState(`Create webhook ${name}`);
    this.closeModal('create-webhook-modal');
    document.getElementById('create-webhook-form').reset();
    this.showToast('Inverted Webhook created!', 'success');
    this.renderAll();
  }

  async deleteWebhook(ruleId) {
    if (!confirm('Are you sure you want to delete this Webhook?')) return;
    delete this.state.webhooks[ruleId];
    await this.saveVaultState(`Delete webhook ${ruleId}`);
    this.showToast('Webhook deleted.', 'success');
    this.renderAll();
  }

  // Bridges
  async handleCreateBridge(e) {
    e.preventDefault();
    const name = document.getElementById('bridge-name').value.trim();
    const type = document.getElementById('bridge-type').value;
    const endpoint = document.getElementById('bridge-endpoint').value.trim();

    const targetId = `bridge_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    this.state.trophallaxisBridges[targetId] = {
      targetId,
      name,
      type,
      config: { webhookUrl: endpoint },
      active: true
    };

    await this.saveVaultState(`Create Trophallaxis Bridge ${name}`);
    this.closeModal('create-bridge-modal');
    document.getElementById('create-bridge-form').reset();
    this.showToast('Multi-Cloud Bridge created!', 'success');
    this.renderAll();
  }

  async deleteBridge(targetId) {
    if (!confirm('Are you sure you want to delete this Bridge?')) return;
    delete this.state.trophallaxisBridges[targetId];
    await this.saveVaultState(`Delete bridge ${targetId}`);
    this.showToast('Bridge deleted.', 'success');
    this.renderAll();
  }

  // Modal & Toast Helpers
  openModal(id) {
    document.getElementById(id).classList.add('active');
  }

  closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }

  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderColor = type === 'success' ? 'var(--accent-green)' : (type === 'error' ? 'var(--primary)' : 'var(--border)');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

const app = new TermesConsole();
window.addEventListener('DOMContentLoaded', () => app.init());
