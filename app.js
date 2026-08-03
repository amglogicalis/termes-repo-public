// TERMES CONSOLE — Web Dashboard Application Logic

class TermesConsole {
  constructor() {
    this.token = localStorage.getItem('termes_github_token') || '';
    this.storageRepo = '.termes-storage';
    this.defaultCdnRepo = 'termes-repo-public';
    this.state = {
      specs: {},
      termitomycesApis: {},
      webhooks: {},
      trophallaxisBridges: {},
      history: [],
      auditLog: []
    };
    this.owner = '';
    this.pendingConfirmCallback = null;
  }

  async init() {
    if (this.token) {
      document.getElementById('github-token').value = this.token;
      const owner = await this.getOwner();
      if (owner) {
        this.updateAuthUI(true, owner);
        await this.loadVaultState();
      } else {
        this.updateAuthUI(false);
      }
    } else {
      this.updateAuthUI(false);
    }
    this.renderAll();
  }

  updateAuthUI(isConnected, username = '') {
    const disconnectedBar = document.getElementById('auth-disconnected');
    const connectedBar = document.getElementById('auth-connected');
    const unauthContainer = document.getElementById('app-unauth-container');
    const authContent = document.getElementById('app-auth-content');
    const userBadge = document.getElementById('connected-user');

    if (isConnected) {
      if (disconnectedBar) disconnectedBar.classList.add('hidden');
      if (connectedBar) connectedBar.classList.remove('hidden');
      if (unauthContainer) unauthContainer.classList.add('hidden');
      if (authContent) authContent.classList.remove('hidden');
      if (userBadge) userBadge.textContent = `👤 @${username}`;
    } else {
      if (disconnectedBar) disconnectedBar.classList.remove('hidden');
      if (connectedBar) connectedBar.classList.add('hidden');
      if (unauthContainer) unauthContainer.classList.remove('hidden');
      if (authContent) authContent.classList.add('hidden');
    }
  }

  async saveToken() {
    const val = document.getElementById('github-token').value.trim();
    if (!val) {
      this.showToast('Please enter a valid GitHub token.', 'error');
      return;
    }
    this.token = val;
    const owner = await this.getOwner();
    if (!owner) {
      this.showToast('Invalid GitHub Token or Bad Credentials.', 'error');
      this.token = '';
      return;
    }

    localStorage.setItem('termes_github_token', val);
    this.updateAuthUI(true, owner);
    this.showToast(`Connected as @${owner}! Loading Termitarium state...`, 'success');
    await this.loadVaultState();
  }

  async saveTokenFromLock() {
    const val = document.getElementById('unauth-token-input').value.trim();
    if (!val) {
      this.showToast('Por favor introduce un token de GitHub válido.', 'error');
      return;
    }
    document.getElementById('github-token').value = val;
    await this.saveToken();
  }

  disconnect() {
    this.token = '';
    this.owner = '';
    localStorage.removeItem('termes_github_token');
    document.getElementById('github-token').value = '';
    document.getElementById('unauth-token-input').value = '';
    this.updateAuthUI(false);
    this.showToast('Desconectado de la Termes Console.', 'info');
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
    if (!this.token) return '';
    try {
      const res = await this.fetchGitHub('/user');
      if (res.ok) {
        const u = await res.json();
        this.owner = u.login;
        return this.owner;
      }
    } catch {
      return '';
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

  async ensureCdnRepo(cdnRepo = 'termes-repo-public') {
    const owner = await this.getOwner();
    if (!owner) return;
    const res = await this.fetchGitHub(`/repos/${owner}/${cdnRepo}`);
    if (res.status === 404) {
      // Auto-create CDN repository for the user
      await this.fetchGitHub('/user/repos', {
        method: 'POST',
        body: JSON.stringify({
          name: cdnRepo,
          description: '🍄 TERMES — Public Inverted APIs & CDN Storage',
          private: false,
          auto_init: true
        })
      });
      await new Promise(r => setTimeout(r, 1200));

      // Enable Pages
      await this.fetchGitHub(`/repos/${owner}/${cdnRepo}/pages`, {
        method: 'POST',
        body: JSON.stringify({
          source: { branch: 'main', path: '/' }
        })
      });

      // Write .nojekyll
      await this.fetchGitHub(`/repos/${owner}/${cdnRepo}/contents/.nojekyll`, {
        method: 'PUT',
        body: JSON.stringify({
          message: 'Initialize .nojekyll',
          content: ''
        })
      });
    }

    // Ensure gh-pages branch exists
    const ghPagesCheck = await this.fetchGitHub(`/repos/${owner}/${cdnRepo}/git/ref/heads/gh-pages`);
    if (ghPagesCheck.status === 404) {
      const mainRef = await this.fetchGitHub(`/repos/${owner}/${cdnRepo}/git/ref/heads/main`);
      if (mainRef.ok) {
        const mainData = await mainRef.json();
        const mainSha = mainData.object?.sha;
        if (mainSha) {
          await this.fetchGitHub(`/repos/${owner}/${cdnRepo}/git/refs`, {
            method: 'POST',
            body: JSON.stringify({
              ref: 'refs/heads/gh-pages',
              sha: mainSha
            })
          });
        }
      }
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
        if (!this.state.termitomycesApis) this.state.termitomycesApis = {};
        if (!this.state.webhooks) this.state.webhooks = {};
        if (!this.state.trophallaxisBridges) this.state.trophallaxisBridges = {};

        // Migrate API state defaults & ensure CDN URLs
        Object.values(this.state.termitomycesApis).forEach(a => {
          if (a.isPrivate === undefined) a.isPrivate = false;
          const targetRepo = a.cdnRepo || this.defaultCdnRepo;
          const path = `api/v1/termes/${a.specId}.json`;
          if (!a.isPrivate) {
            a.cdnUrl = `https://raw.githubusercontent.com/${owner}/${targetRepo}/gh-pages/${path}`;
          }
        });

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

  // Custom Glassmorphic Confirmation Modal
  customConfirm(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    this.pendingConfirmCallback = onConfirm;

    const okBtn = document.getElementById('confirm-ok-btn');
    okBtn.onclick = () => {
      if (this.pendingConfirmCallback) this.pendingConfirmCallback();
      this.closeModal('custom-confirm-modal');
    };

    this.openModal('custom-confirm-modal');
  }

  // Render UI
  renderAll() {
    this.renderStats();
    this.renderSpecs();
    this.renderCelluloseTable();
    this.renderTermitomycesApis();
    this.renderWebhooks();
    this.renderBridges();
  }

  renderStats() {
    const specsCount = Object.keys(this.state.specs || {}).length;
    const apisCount = Object.keys(this.state.termitomycesApis || {}).length;
    const webhooksCount = Object.keys(this.state.webhooks || {}).length;
    const bridgesCount = Object.keys(this.state.trophallaxisBridges || {}).length;

    document.getElementById('stat-specs').textContent = specsCount;
    document.getElementById('stat-apis').textContent = apisCount;
    document.getElementById('stat-webhooks').textContent = webhooksCount;
    document.getElementById('stat-bridges').textContent = bridgesCount;
  }

  renderSpecs() {
    const tbody = document.getElementById('specs-table-body');
    const specs = Object.values(this.state.specs || {});

    if (specs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No hay especificaciones creadas en el Termitarium.</td></tr>`;
      return;
    }

    tbody.innerHTML = specs.map(s => {
      const cdnRepo = s.cdnRepo || this.defaultCdnRepo;
      const mudTunnel = s.mudTunnel || { stealth: true };
      const stealthBadge = mudTunnel.stealth ? `<span class="badge badge-green">🕳️ Stealth</span>` : `<span class="badge badge-gold">Standard</span>`;

      return `
        <tr>
          <td><code>${s.specId}</code></td>
          <td><strong>${s.name}</strong></td>
          <td><a href="${s.targetUrl}" target="_blank" style="color: var(--primary); font-size: 0.82rem;">${s.targetUrl}</a></td>
          <td><span class="badge badge-gold">📦 ${cdnRepo}</span></td>
          <td>${stealthBadge}</td>
          <td>
            <button class="btn-icon" onclick="app.digestSpec('${s.specId}')" title="Digest URL">⚡ Digest</button>
            <button class="btn-icon" onclick="app.previewCellulose('${s.specId}')" title="Preview Cellulose 🧫">🧫 Celulosa</button>
            <button class="btn-icon" onclick="app.openEditSpecModal('${s.specId}')" title="Edit">✏️</button>
            <button class="btn-icon" onclick="app.deleteSpec('${s.specId}')" title="Delete">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderCelluloseTable() {
    const tbody = document.getElementById('cellulose-table-body');
    const specsWithCellulose = Object.values(this.state.specs || {}).filter(s => !!s.lastResult);

    if (specsWithCellulose.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Sin celulosa digerida en la sesión actual. Ejecuta un Digest ⚡ en el Termitarium.</td></tr>`;
      return;
    }

    tbody.innerHTML = specsWithCellulose.map(s => {
      const jsonLen = JSON.stringify(s.lastResult || {}).length;
      const statusBadge = `<span class="badge badge-green">🧫 Celulosa Digerida (${(jsonLen / 1024).toFixed(1)} KB)</span>`;

      return `
        <tr>
          <td><code>dig_${s.specId}</code></td>
          <td><strong>${s.name}</strong></td>
          <td><a href="${s.targetUrl}" target="_blank" style="color: var(--text-muted); font-size: 0.82rem;">${s.targetUrl}</a></td>
          <td>${statusBadge}</td>
          <td><span style="font-size: 0.8rem; color: var(--text-muted);">${s.lastDigestedAt ? new Date(s.lastDigestedAt).toLocaleTimeString() : 'Ahora'}</span></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="app.previewCellulose('${s.specId}')">🧫 Ver Celulosa</button>
            <button class="btn-icon" onclick="app.digestSpec('${s.specId}')" title="Digest URL">⚡ Digest</button>
            <button class="btn-icon" onclick="app.deleteCelluloseItem('${s.specId}')" title="Limpiar Celulosa 🗑️">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderTermitomycesApis() {
    const tbody = document.getElementById('apis-table-body');
    const apis = Object.values(this.state.termitomycesApis || {});

    if (apis.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Sin APIs Sintéticas cultivadas aún. Digiere una especificación para publicar.</td></tr>`;
      return;
    }

    tbody.innerHTML = apis.map(a => {
      const privacyBadge = a.isPrivate 
        ? `<span class="badge badge-gold">🔒 Privado</span>` 
        : `<span class="badge badge-green">🌐 Público</span>`;
      const cdnRepo = a.cdnRepo || this.defaultCdnRepo;

      return `
        <tr>
          <td><code>${a.apiId}</code></td>
          <td><strong>${a.name}</strong></td>
          <td>${privacyBadge}</td>
          <td><span class="badge badge-gold">📦 ${cdnRepo}</span></td>
          <td><a href="${a.cdnUrl}" target="_blank" class="badge badge-primary">🌐 Endpoint API</a></td>
          <td>
            <button class="btn-icon" onclick="app.copyApiUrl('${a.cdnUrl}')" title="Copy API URL 📋">📋 Copy API</button>
            <button class="btn-icon" onclick="app.openEditApiModal('${a.apiId}')" title="Editar API ✏️">✏️</button>
            <button class="btn-icon" onclick="app.previewCellulose('${a.specId}')" title="Preview JSON 🧫">🧫 JSON</button>
            <button class="btn-icon" onclick="app.deleteApi('${a.apiId}')" title="Borrar API 🗑️">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderWebhooks() {
    const tbody = document.getElementById('webhooks-table-body');
    const webhooks = Object.values(this.state.webhooks || {});

    if (webhooks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Sin Webhooks Invertidos configurados.</td></tr>`;
      return;
    }

    tbody.innerHTML = webhooks.map(w => `
      <tr>
        <td><code>${w.ruleId}</code></td>
        <td><strong>${w.name}</strong></td>
        <td><span class="badge badge-blue">${w.httpMethod || 'POST'} • ${w.triggerCondition}</span></td>
        <td><span style="font-size: 0.82rem; color: var(--text-muted);">${w.targetUrl}</span></td>
        <td><span class="badge badge-green">Active</span></td>
        <td>
          <button class="btn-icon" onclick="app.openEditWebhookModal('${w.ruleId}')" title="Editar Webhook ✏️">✏️</button>
          <button class="btn-icon" onclick="app.deleteWebhook('${w.ruleId}')" title="Eliminar Webhook 🗑️">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  renderBridges() {
    const tbody = document.getElementById('bridges-table-body');
    const bridges = Object.values(this.state.trophallaxisBridges || {});

    if (bridges.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Sin Puentes Multi-Cloud configurados.</td></tr>`;
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
          <button class="btn-icon" onclick="app.openEditBridgeModal('${b.targetId}')" title="Editar Puente ✏️">✏️</button>
          <button class="btn-icon" onclick="app.deleteBridge('${b.targetId}')" title="Eliminar Puente 🗑️">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  // Form Handlers — Specs
  async handleCreateSpec(e) {
    e.preventDefault();
    const name = document.getElementById('spec-name').value.trim();
    const targetUrl = document.getElementById('spec-target-url').value.trim();
    const selectorsStr = document.getElementById('spec-selectors').value.trim();
    const description = document.getElementById('spec-description').value.trim();
    const stealth = document.getElementById('spec-stealth').checked;

    const cultivateApi = document.getElementById('spec-cultivate-api').checked;
    const cdnRepo = document.getElementById('spec-cdn-repo').value.trim() || this.defaultCdnRepo;
    const apiIsPrivate = document.getElementById('spec-api-privacy').value === 'private';

    const webhookEnable = document.getElementById('spec-webhook-enable').checked;
    let webhookConfig = undefined;

    if (webhookEnable) {
      const whUrl = document.getElementById('spec-webhook-url').value.trim();
      const whMethod = document.getElementById('spec-webhook-method').value;
      const whHeadersStr = document.getElementById('spec-webhook-headers').value.trim();
      const whTemplate = document.getElementById('spec-webhook-template').value.trim();

      let headers = undefined;
      if (whHeadersStr) {
        try { headers = JSON.parse(whHeadersStr); } catch {}
      }

      webhookConfig = {
        ruleId: `wh_${Date.now().toString(36)}`,
        name: `Webhook for ${name}`,
        targetUrl: whUrl,
        httpMethod: whMethod,
        headers,
        customPayloadTemplate: whTemplate || undefined,
        triggerCondition: 'on_change',
        active: true
      };
    }

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
      mudTunnel: { stealth },
      cultivateApi,
      cdnRepo,
      apiIsPrivate,
      webhook: webhookConfig,
      active: true,
      createdAt: now,
      updatedAt: now
    };

    this.state.specs[specId] = spec;
    await this.saveVaultState(`Create spec ${name}`);
    this.closeModal('create-spec-modal');
    document.getElementById('create-spec-form').reset();
    this.showToast('Receta creada exitosamente en el Termitarium!', 'success');
    this.renderAll();
  }

  openEditSpecModal(specId) {
    const s = this.state.specs[specId];
    if (!s) return;
    document.getElementById('edit-spec-id').value = specId;
    document.getElementById('edit-spec-name').value = s.name;
    document.getElementById('edit-spec-target-url').value = s.targetUrl;
    document.getElementById('edit-spec-selectors').value = JSON.stringify(s.selectors, null, 2);
    document.getElementById('edit-spec-stealth').checked = s.mudTunnel?.stealth !== false;
    document.getElementById('edit-spec-cultivate-api').checked = s.cultivateApi !== false;
    document.getElementById('edit-spec-cdn-repo').value = s.cdnRepo || this.defaultCdnRepo;
    document.getElementById('edit-spec-api-privacy').value = s.apiIsPrivate ? 'private' : 'public';
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

    s.mudTunnel = {
      stealth: document.getElementById('edit-spec-stealth').checked
    };
    s.cultivateApi = document.getElementById('edit-spec-cultivate-api').checked;
    s.cdnRepo = document.getElementById('edit-spec-cdn-repo').value.trim() || this.defaultCdnRepo;
    s.apiIsPrivate = document.getElementById('edit-spec-api-privacy').value === 'private';
    s.updatedAt = new Date().toISOString();

    await this.saveVaultState(`Update spec ${s.name}`);
    this.closeModal('edit-spec-modal');
    this.showToast('Especificación actualizada correctamente!', 'success');
    this.renderAll();
  }

  deleteSpec(specId) {
    this.customConfirm(
      'Eliminar Especificación',
      '¿Seguro que deseas eliminar esta especificación del Termitarium?',
      async () => {
        delete this.state.specs[specId];
        delete this.state.termitomycesApis[`api_${specId}`];
        await this.saveVaultState(`Delete spec ${specId}`);
        this.showToast('Especificación eliminada.', 'success');
        this.renderAll();
      }
    );
  }

  async digestSpec(specId) {
    const s = this.state.specs[specId];
    if (!s) return;

    this.showToast(`Digestando ${s.name}...`, 'info');
    const simulatedData = {
      specId,
      digestedAt: new Date().toISOString(),
      sampleTitle: `Digested Content from ${s.name}`,
      dataExtracted: s.selectors,
      status: 'OK'
    };

    s.lastResult = simulatedData;
    s.lastDigestedAt = new Date().toISOString();

    const owner = await this.getOwner();
    if (owner && s.cultivateApi !== false) {
      const apiId = `api_${specId}`;
      const isPrivate = s.apiIsPrivate === true;
      const targetRepo = isPrivate ? this.storageRepo : (s.cdnRepo || this.defaultCdnRepo);

      if (!isPrivate) {
        await this.ensureCdnRepo(targetRepo);
      }

      const path = `api/v1/termes/${specId}.json`;
      const contentEncoded = btoa(JSON.stringify(simulatedData, null, 2));

      const getRes = await this.fetchGitHub(`/repos/${owner}/${targetRepo}/contents/${path}?ref=${isPrivate ? 'main' : 'gh-pages'}`);
      let sha;
      if (getRes.ok) {
        const d = await getRes.json();
        sha = d.sha;
      }

      const bodyPayload = {
        message: `Digest ${s.name}`,
        content: contentEncoded,
        sha
      };
      if (!isPrivate) bodyPayload.branch = 'gh-pages';

      let putRes = await this.fetchGitHub(`/repos/${owner}/${targetRepo}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify(bodyPayload)
      });

      if (!putRes.ok && !isPrivate) {
        delete bodyPayload.branch;
        putRes = await this.fetchGitHub(`/repos/${owner}/${targetRepo}/contents/${path}`, {
          method: 'PUT',
          body: JSON.stringify(bodyPayload)
        });
      }

      const branchUsed = bodyPayload.branch || 'main';
      const cdnUrl = isPrivate
        ? `https://api.github.com/repos/${owner}/${this.storageRepo}/contents/${path}`
        : `https://raw.githubusercontent.com/${owner}/${targetRepo}/${branchUsed}/${path}`;

      this.state.termitomycesApis[apiId] = {
        apiId,
        specId,
        name: s.name,
        cdnUrl,
        cdnRepo: targetRepo,
        isPrivate,
        lastUpdated: new Date().toISOString(),
        status: 'active',
        data: simulatedData
      };
    }

    await this.saveVaultState(`Digest spec ${s.name}`);
    this.showToast(`Digestión completada! API Sintética Termitomyces actualizada.`, 'success');
    this.renderAll();
  }

  // Form Handlers — Termitomyces APIs
  openEditApiModal(apiId) {
    const a = this.state.termitomycesApis[apiId];
    if (!a) return;
    document.getElementById('edit-api-id').value = apiId;
    document.getElementById('edit-api-name').value = a.name;
    document.getElementById('edit-api-cdn-repo').value = a.cdnRepo || this.defaultCdnRepo;
    document.getElementById('edit-api-privacy').value = a.isPrivate ? 'private' : 'public';
    document.getElementById('edit-api-status').value = a.status || 'active';
    this.openModal('edit-api-modal');
  }

  async handleUpdateApi(e) {
    e.preventDefault();
    const apiId = document.getElementById('edit-api-id').value;
    const a = this.state.termitomycesApis[apiId];
    if (!a) return;

    a.name = document.getElementById('edit-api-name').value.trim();
    a.cdnRepo = document.getElementById('edit-api-cdn-repo').value.trim() || this.defaultCdnRepo;
    const newPrivacy = document.getElementById('edit-api-privacy').value === 'private';
    a.isPrivate = newPrivacy;
    a.status = document.getElementById('edit-api-status').value;
    a.lastUpdated = new Date().toISOString();

    const owner = await this.getOwner();
    if (owner) {
      const path = `api/v1/termes/${a.specId}.json`;
      a.cdnUrl = newPrivacy
        ? `https://api.github.com/repos/${owner}/${this.storageRepo}/contents/${path}`
        : `https://raw.githubusercontent.com/${owner}/${a.cdnRepo}/gh-pages/${path}`;
    }

    await this.saveVaultState(`Update Termitomyces API ${a.name}`);
    this.closeModal('edit-api-modal');
    this.showToast('API Sintética actualizada correctamente!', 'success');
    this.renderAll();
  }

  deleteApi(apiId) {
    this.customConfirm(
      'Eliminar API Sintética',
      '¿Seguro que deseas eliminar esta API Sintética Termitomyces?',
      async () => {
        delete this.state.termitomycesApis[apiId];
        await this.saveVaultState(`Delete Termitomyces API ${apiId}`);
        this.showToast('API Sintética eliminada.', 'success');
        this.renderAll();
      }
    );
  }

  // Form Handlers — Webhooks
  async handleCreateWebhook(e) {
    e.preventDefault();
    const name = document.getElementById('webhook-name').value.trim();
    const targetUrl = document.getElementById('webhook-url').value.trim();
    const httpMethod = document.getElementById('webhook-method').value;
    const triggerCondition = document.getElementById('webhook-condition').value;
    const headersStr = document.getElementById('webhook-headers').value.trim();
    const customPayloadTemplate = document.getElementById('webhook-template').value.trim();

    let headers = undefined;
    if (headersStr) {
      try { headers = JSON.parse(headersStr); } catch {}
    }

    const ruleId = `wh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    this.state.webhooks[ruleId] = {
      ruleId,
      name,
      targetUrl,
      httpMethod,
      headers,
      customPayloadTemplate: customPayloadTemplate || undefined,
      triggerCondition,
      active: true,
      createdAt: new Date().toISOString()
    };

    await this.saveVaultState(`Create webhook ${name}`);
    this.closeModal('create-webhook-modal');
    document.getElementById('create-webhook-form').reset();
    this.showToast('Webhook Invertido creado!', 'success');
    this.renderAll();
  }

  openEditWebhookModal(ruleId) {
    const w = this.state.webhooks[ruleId];
    if (!w) return;
    document.getElementById('edit-webhook-id').value = ruleId;
    document.getElementById('edit-webhook-name').value = w.name;
    document.getElementById('edit-webhook-url').value = w.targetUrl;
    document.getElementById('edit-webhook-method').value = w.httpMethod || 'POST';
    document.getElementById('edit-webhook-condition').value = w.triggerCondition || 'on_change';
    document.getElementById('edit-webhook-headers').value = w.headers ? JSON.stringify(w.headers) : '';
    document.getElementById('edit-webhook-template').value = w.customPayloadTemplate || '';
    this.openModal('edit-webhook-modal');
  }

  async handleUpdateWebhook(e) {
    e.preventDefault();
    const ruleId = document.getElementById('edit-webhook-id').value;
    const w = this.state.webhooks[ruleId];
    if (!w) return;

    w.name = document.getElementById('edit-webhook-name').value.trim();
    w.targetUrl = document.getElementById('edit-webhook-url').value.trim();
    w.httpMethod = document.getElementById('edit-webhook-method').value;
    w.triggerCondition = document.getElementById('edit-webhook-condition').value;

    const headersStr = document.getElementById('edit-webhook-headers').value.trim();
    if (headersStr) {
      try { w.headers = JSON.parse(headersStr); } catch {}
    } else {
      delete w.headers;
    }

    w.customPayloadTemplate = document.getElementById('edit-webhook-template').value.trim() || undefined;

    await this.saveVaultState(`Update Webhook ${w.name}`);
    this.closeModal('edit-webhook-modal');
    this.showToast('Webhook Invertido actualizado!', 'success');
    this.renderAll();
  }

  deleteWebhook(ruleId) {
    this.customConfirm(
      'Eliminar Webhook Invertido',
      '¿Seguro que deseas eliminar este Webhook Invertido?',
      async () => {
        delete this.state.webhooks[ruleId];
        await this.saveVaultState(`Delete webhook ${ruleId}`);
        this.showToast('Webhook eliminado.', 'success');
        this.renderAll();
      }
    );
  }

  // Form Handlers — Bridges
  populateSourceSpecDropdowns() {
    const specs = Object.values(this.state.specs || {});
    const options = `<option value="">-- Seleccionar Termitarium --</option>` +
      specs.map(s => `<option value="${s.specId}">${s.name} (${s.specId})</option>`).join('');

    const createSelect = document.getElementById('bridge-source-spec');
    const editSelect = document.getElementById('edit-bridge-source-spec');
    if (createSelect) createSelect.innerHTML = options;
    if (editSelect) editSelect.innerHTML = options;
  }

  testBridgeSimulationFromSpecForm() {
    const name = document.getElementById('spec-name')?.value || 'Termitarium Test';
    const mapperStr = document.getElementById('spec-bridge-mapper')?.value.trim();
    const type = document.getElementById('spec-bridge-type')?.value || 'terra_combase';
    const repoUrl = document.getElementById('spec-bridge-repo-url')?.value.trim() || 'https://github.com/amglogicalis/combase-storage';
    const targetName = document.getElementById('spec-bridge-target')?.value.trim() || 'precios_db';

    let mapper = {};
    if (mapperStr) {
      try { mapper = JSON.parse(mapperStr); } catch {}
    }

    const sampleExtractedData = {
      titulo: 'Laptop Gaming Pro 16"',
      precio: 1299.99,
      stock: 'In Stock (12 unidades)',
      timestamp: new Date().toISOString()
    };

    const mappedData = {};
    for (const [key, val] of Object.entries(sampleExtractedData)) {
      const targetKey = mapper[key] || key;
      mappedData[targetKey] = val;
    }

    const previewJson = {
      dryRun: true,
      simulationResult: 'SUCCESS (200 OK)',
      bridgeType: type,
      destinationRepoUrl: repoUrl,
      destinationTarget: targetName,
      originalExtractedData: sampleExtractedData,
      fieldMapperApplied: mapper,
      transformedPayloadToSend: {
        source: 'termes_trophallaxis_dryrun',
        specName: name,
        data: mappedData
      }
    };

    const modal = document.getElementById('cellulose-preview-modal');
    const container = document.getElementById('cellulose-json-preview');
    if (container) container.textContent = JSON.stringify(previewJson, null, 2);
    this.openModal('cellulose-preview-modal');
    this.showToast('🧪 Simulación Dry-Run ejecutada con éxito!', 'success');
  }

  testBridgeSimulationFromBridgeForm(mode) {
    const prefix = mode === 'edit' ? 'edit-bridge-' : 'bridge-';
    const name = document.getElementById(`${prefix}name`)?.value || 'Bridge Test';
    const sourceSpecId = document.getElementById(`${prefix}source-spec`)?.value;
    const type = document.getElementById(`${prefix}type`)?.value || 'terra_combase';
    const repoUrl = document.getElementById(`${prefix}repo-url`)?.value.trim() || 'https://github.com/amglogicalis/combase-storage';
    const targetName = document.getElementById(`${prefix}target-name`)?.value.trim() || 'precios_db';
    const mapperStr = document.getElementById(`${prefix}field-mapper`)?.value.trim();

    let mapper = {};
    if (mapperStr) {
      try { mapper = JSON.parse(mapperStr); } catch {}
    }

    const spec = this.state.specs[sourceSpecId];
    const sampleData = spec?.lastResult || {
      titulo: 'Ejemplo de Producto Extraído',
      precio: '99.95 €',
      categoria: 'Electrónica'
    };

    const mappedData = {};
    for (const [key, val] of Object.entries(sampleData)) {
      const targetKey = mapper[key] || key;
      mappedData[targetKey] = val;
    }

    const previewJson = {
      dryRun: true,
      simulationResult: 'SUCCESS (200 OK)',
      bridgeName: name,
      sourceTermitarium: spec ? `${spec.name} (${spec.specId})` : 'Ninguno seleccionado',
      bridgeType: type,
      destinationRepoUrl: repoUrl,
      destinationTarget: targetName,
      originalData: sampleData,
      transformedPayloadToSend: mappedData
    };

    const container = document.getElementById('cellulose-json-preview');
    if (container) container.textContent = JSON.stringify(previewJson, null, 2);
    this.openModal('cellulose-preview-modal');
    this.showToast('🧪 Simulación de Puente ejecutada con éxito!', 'success');
  }

  async handleCreateBridge(e) {
    e.preventDefault();
    const name = document.getElementById('bridge-name').value.trim();
    const sourceSpecId = document.getElementById('bridge-source-spec').value;
    const type = document.getElementById('bridge-type').value;
    const repoUrl = document.getElementById('bridge-repo-url').value.trim();
    const targetName = document.getElementById('bridge-target-name').value.trim();
    const authToken = document.getElementById('bridge-auth-token').value.trim();
    const mapperStr = document.getElementById('bridge-field-mapper').value.trim();

    let fieldMapper = {};
    if (mapperStr) {
      try { fieldMapper = JSON.parse(mapperStr); } catch {}
    }

    const targetId = `bridge_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    this.state.trophallaxisBridges[targetId] = {
      targetId,
      name,
      type,
      sourceSpecId,
      repoUrl,
      targetName,
      authToken,
      fieldMapper,
      config: { webhookUrl: repoUrl },
      active: true,
      bridgeLogs: [
        {
          timestamp: new Date().toISOString(),
          status: 'success',
          statusCode: 200,
          message: 'Puente creado e inicializado correctamente.',
          payloadPreview: { status: 'ready', repoUrl, targetName }
        }
      ]
    };

    await this.saveVaultState(`Create Trophallaxis Bridge ${name}`);
    this.closeModal('create-bridge-modal');
    document.getElementById('create-bridge-form').reset();
    this.showToast('Puente Multi-Cloud creado!', 'success');
    this.renderAll();
  }

  openEditBridgeModal(targetId) {
    const b = this.state.trophallaxisBridges[targetId];
    if (!b) return;
    this.populateSourceSpecDropdowns();

    document.getElementById('edit-bridge-id').value = targetId;
    document.getElementById('edit-bridge-name').value = b.name;
    document.getElementById('edit-bridge-source-spec').value = b.sourceSpecId || '';
    document.getElementById('edit-bridge-type').value = b.type || 'terra_combase';
    document.getElementById('edit-bridge-repo-url').value = b.repoUrl || b.config?.webhookUrl || '';
    document.getElementById('edit-bridge-target-name').value = b.targetName || '';
    document.getElementById('edit-bridge-auth-token').value = b.authToken || '';
    document.getElementById('edit-bridge-field-mapper').value = b.fieldMapper ? JSON.stringify(b.fieldMapper) : '';

    this.openModal('edit-bridge-modal');
  }

  async handleUpdateBridge(e) {
    e.preventDefault();
    const targetId = document.getElementById('edit-bridge-id').value;
    const b = this.state.trophallaxisBridges[targetId];
    if (!b) return;

    b.name = document.getElementById('edit-bridge-name').value.trim();
    b.sourceSpecId = document.getElementById('edit-bridge-source-spec').value;
    b.type = document.getElementById('edit-bridge-type').value;
    b.repoUrl = document.getElementById('edit-bridge-repo-url').value.trim();
    b.targetName = document.getElementById('edit-bridge-target-name').value.trim();
    b.authToken = document.getElementById('edit-bridge-auth-token').value.trim();

    const mapperStr = document.getElementById('edit-bridge-field-mapper').value.trim();
    if (mapperStr) {
      try { b.fieldMapper = JSON.parse(mapperStr); } catch {}
    } else {
      delete b.fieldMapper;
    }

    b.config = { webhookUrl: b.repoUrl };

    await this.saveVaultState(`Update Bridge ${b.name}`);
    this.closeModal('edit-bridge-modal');
    this.showToast('Puente Multi-Cloud actualizado!', 'success');
    this.renderAll();
  }

  deleteBridge(targetId) {
    this.customConfirm(
      'Eliminar Puente Multi-Cloud',
      '¿Seguro que deseas eliminar este Puente Multi-Cloud?',
      async () => {
        delete this.state.trophallaxisBridges[targetId];
        await this.saveVaultState(`Delete bridge ${targetId}`);
        this.showToast('Puente eliminado.', 'success');
        this.renderAll();
      }
    );
  }

  // Cellulose Cleansers & Utility Helpers
  deleteCelluloseItem(specId) {
    this.customConfirm(
      'Limpiar Celulosa',
      '¿Seguro que deseas limpiar la celulosa digerida de esta especificación?',
      async () => {
        if (this.state.specs[specId]) {
          delete this.state.specs[specId].lastResult;
          delete this.state.specs[specId].lastDigestedAt;
          await this.saveVaultState(`Clear cellulose for ${specId}`);
          this.showToast('Celulosa eliminada de la tabla.', 'success');
          this.renderAll();
        }
      }
    );
  }

  clearAllCellulose() {
    this.customConfirm(
      'Limpiar Toda la Celulosa',
      '¿Seguro que deseas limpiar la celulosa digerida de TODAS las especificaciones?',
      async () => {
        Object.values(this.state.specs).forEach(s => {
          delete s.lastResult;
          delete s.lastDigestedAt;
        });
        await this.saveVaultState('Clear all cellulose');
        this.showToast('Toda la celulosa ha sido eliminada de la tabla.', 'success');
        this.renderAll();
      }
    );
  }

  showLatestCellulose() {
    const specs = Object.values(this.state.specs || {}).filter(s => s.lastResult);
    if (specs.length > 0) {
      this.previewCellulose(specs[0].specId);
    } else {
      this.previewCellulose('');
    }
  }

  previewCellulose(specId) {
    const s = this.state.specs[specId];
    const previewArea = document.getElementById('cellulose-json-preview');
    if (s && s.lastResult) {
      previewArea.textContent = JSON.stringify(s.lastResult, null, 2);
    } else {
      previewArea.textContent = JSON.stringify({
        status: 'pending_digestion',
        note: 'Esta receta aún no ha sido digestada. Haz clic en el botón ⚡ Digest para ejecutar los Nasute Workers.'
      }, null, 2);
    }
    this.openModal('cellulose-preview-modal');
  }

  copyApiUrl(url) {
    navigator.clipboard.writeText(url);
    this.showToast('🌐 URL de la API Sintética copiada al portapapeles!', 'success');
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
