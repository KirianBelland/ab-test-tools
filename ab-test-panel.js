// AB Test Generator Panel - Version Améliorée
// Club Med Edition
(function() {
  'use strict';

  // Vérifier si le panel existe déjà
  if (document.getElementById('ab-test-bookmarklet-panel')) {
    alert('Le panel est déjà ouvert!');
    return;
  }

  // Injecter les styles CSS
  const style = document.createElement('style');
  style.textContent = `
    #ab-test-bookmarklet-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 450px;
      height: 100vh;
      background: #fff;
      box-shadow: -5px 0 30px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      transform: translateX(0);
      transition: transform 0.3s ease;
    }
    #ab-test-bookmarklet-panel.closed {
      transform: translateX(100%);
    }
    #ab-panel-header {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: #fff;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #ab-panel-content {
      padding: 1.5rem;
      overflow-y: auto;
      height: calc(100vh - 80px);
    }
    .ab-section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }
    .ab-section h3 {
      margin: 0 0 1rem;
      font-size: 1rem;
      color: #0f172a;
    }
    .ab-btn {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      margin: 0.5rem 0;
      transition: all 0.2s;
    }
    .ab-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .ab-btn-primary {
      background: #2563eb;
      color: #fff;
    }
    .ab-btn-primary:hover {
      background: #1d4ed8;
    }
    .ab-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-family: inherit;
      margin: 0.5rem 0;
      font-size: 0.95rem;
    }
    .ab-input:focus {
      outline: none;
      border-color: #2563eb;
    }
    #ab-close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: #fff;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.2rem;
      transition: background 0.2s;
    }
    #ab-close-btn:hover {
      background: rgba(255,255,255,0.3);
    }
    #ab-code-output {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 6px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      margin: 1rem 0;
      max-height: 300px;
      overflow-y: auto;
      line-height: 1.5;
    }
    .ab-message {
      padding: 0.75rem;
      margin: 0.5rem 0;
      border-radius: 6px;
      font-size: 0.85rem;
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ab-message-system {
      background: #e0e7ff;
      color: #3730a3;
    }
    .ab-message-user {
      background: #2563eb;
      color: #fff;
    }
    .ab-message-error {
      background: #fee2e2;
      color: #991b1b;
    }
    .ab-inspect-hover {
      outline: 3px solid #2563eb !important;
      outline-offset: 2px;
      cursor: crosshair !important;
    }
  `;
  document.head.appendChild(style);

  // Créer le panel HTML
  const panel = document.createElement('div');
  panel.id = 'ab-test-bookmarklet-panel';
  panel.innerHTML = `
    <div id='ab-panel-header'>
      <div>
        <h2 style='margin:0;font-size:1.3rem'>🧪 AB Test Generator</h2>
        <p style='margin:0;opacity:0.9;font-size:0.9rem'>Version Améliorée</p>
      </div>
      <button id='ab-close-btn'>✕</button>
    </div>
    <div id='ab-panel-content'>
      <div class='ab-section'>
        <h3>📍 Page actuelle</h3>
        <p style='font-size:0.85rem;color:#64748b;word-break:break-all'>${window.location.href}</p>
      </div>
      <div class='ab-section'>
        <h3>💬 Génération de variante</h3>
        <textarea id='ab-variant-input' class='ab-input' placeholder='Ex: Change la couleur du bouton en bleu' rows='3'></textarea>
        <button id='ab-generate-btn' class='ab-btn ab-btn-primary'>Générer le code</button>
        <div id='ab-messages'></div>
      </div>
      <div class='ab-section'>
        <h3>🎯 Mode inspection</h3>
        <button id='ab-inspect-btn' class='ab-btn'>🔍 Activer l'inspection</button>
        <p id='ab-selected' style='margin:0.5rem 0;font-size:0.85rem;color:#64748b'>Aucun élément sélectionné</p>
      </div>
      <div class='ab-section' id='ab-code-section' style='display:none'>
        <h3>📝 Code généré</h3>
        <div id='ab-code-output'></div>
        <button id='ab-copy-btn' class='ab-btn'>📋 Copier le code</button>
        <button id='ab-preview-btn' class='ab-btn'>👁️ Preview sur la page</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // Variables globales
  let inspectMode = false;
  let selectedEl = null;
  let hoverEl = null;

  // Fonction pour ajouter des messages
  const addMsg = (txt, type = 'system') => {
    const msg = document.createElement('div');
    msg.className = `ab-message ab-message-${type}`;
    msg.textContent = txt;
    const msgContainer = document.getElementById('ab-messages');
    msgContainer.appendChild(msg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  };

  // Analyse de la description et génération du code
  const analyzeDescription = (desc) => {
    const lower = desc.toLowerCase();

    // Dictionnaire des couleurs
    const colors = {
      'orange': '#FF6B35',
      'bleu': '#2563eb',
      'rouge': '#ef4444',
      'vert': '#10b981',
      'jaune': '#fbbf24',
      'violet': '#a855f7',
      'rose': '#ec4899',
      'noir': '#000000',
      'blanc': '#ffffff',
      'gris': '#6b7280'
    };

    let jsCode = '';
    let cssCode = '';

    // Déterminer le sélecteur
    const sel = selectedEl
      ? (selectedEl.id
          ? `#${selectedEl.id}`
          : selectedEl.className
            ? `.${selectedEl.className.split(' ').filter(c => c && !c.startsWith('ab-'))[0] || selectedEl.className.split(' ')[0]}`
            : `${selectedEl.tagName.toLowerCase()}`)
      : 'body';

    // Masquer/Cacher
    if (lower.includes('masque') || lower.includes('cache') || lower.includes('supprime')) {
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.display = 'none';\n}`;
      addMsg('Action: Masquer l\'élément', 'system');
    }
    // Afficher
    else if (lower.includes('affiche') || lower.includes('montre')) {
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.display = 'block';\n  el.style.visibility = 'visible';\n}`;
      addMsg('Action: Afficher l\'élément', 'system');
    }
    // Changer le texte
    else if (lower.includes('texte') && lower.match(/"([^"]+)"|'([^']+)'/)) {
      const newText = desc.match(/"([^"]+)"|'([^']+)'/)[1] || desc.match(/"([^"]+)"|'([^']+)'/)[2];
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.textContent = "${newText.replace(/"/g, '\\"')}";\n}`;
      addMsg(`Action: Changer le texte en "${newText}"`, 'system');
    }
    // Couleur
    else if (lower.includes('couleur') || lower.includes('color')) {
      let color = '#FF6B35';
      for (const [name, hex] of Object.entries(colors)) {
        if (lower.includes(name)) {
          color = hex;
          break;
        }
      }
      if (lower.match(/#[0-9a-f]{6}/i)) {
        color = lower.match(/#[0-9a-f]{6}/i)[0];
      }

      if (lower.includes('fond') || lower.includes('background')) {
        jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.backgroundColor = '${color}';\n}`;
        addMsg(`Action: Changer la couleur de fond en ${color}`, 'system');
      } else if (lower.includes('bordure') || lower.includes('border')) {
        jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.border = '3px solid ${color}';\n}`;
        addMsg(`Action: Ajouter une bordure ${color}`, 'system');
      } else {
        jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.color = '${color}';\n}`;
        addMsg(`Action: Changer la couleur du texte en ${color}`, 'system');
      }
    }
    // Taille de police
    else if (lower.includes('taille') && (lower.includes('police') || lower.includes('texte') || lower.includes('font'))) {
      const size = lower.match(/(\d+)\s*px/) ? lower.match(/(\d+)\s*px/)[1] : '24';
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.fontSize = '${size}px';\n}`;
      addMsg(`Action: Changer la taille à ${size}px`, 'system');
    }
    // Largeur
    else if (lower.includes('largeur') || lower.includes('width')) {
      const width = lower.match(/(\d+)\s*(%|px)/) ? lower.match(/(\d+)\s*(%|px)/)[0] : '100%';
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.width = '${width}';\n}`;
      addMsg(`Action: Changer la largeur à ${width}`, 'system');
    }
    // Hauteur
    else if (lower.includes('hauteur') || lower.includes('height')) {
      const height = lower.match(/(\d+)\s*px/) ? lower.match(/(\d+)\s*px/)[0] : 'auto';
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.height = '${height}';\n}`;
      addMsg(`Action: Changer la hauteur à ${height}`, 'system');
    }
    // Ajouter un badge
    else if (lower.includes('badge') || lower.includes('etiquette')) {
      const badgeText = lower.match(/"([^"]+)"|'([^']+)'/)
        ? lower.match(/"([^"]+)"|'([^']+)'/)[1] || lower.match(/"([^"]+)"|'([^']+)'/)[2]
        : 'PROMO';
      let badgeColor = '#ef4444';
      for (const [name, hex] of Object.entries(colors)) {
        if (lower.includes(name)) {
          badgeColor = hex;
          break;
        }
      }
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  const badge = document.createElement('span');\n  badge.textContent = '${badgeText}';\n  badge.style.cssText = 'position:absolute;top:10px;right:10px;background:${badgeColor};color:#fff;padding:4px 12px;border-radius:4px;font-weight:700;font-size:12px;z-index:10';\n  el.style.position = 'relative';\n  el.appendChild(badge);\n}`;
      addMsg(`Action: Ajouter un badge "${badgeText}"`, 'system');
    }
    // Ajouter un bouton
    else if (lower.includes('ajoute') && (lower.includes('bouton') || lower.includes('cta'))) {
      const btnText = lower.match(/"([^"]+)"|'([^']+)'/)
        ? lower.match(/"([^"]+)"|'([^']+)'/)[1] || lower.match(/"([^"]+)"|'([^']+)'/)[2]
        : 'En savoir plus';
      let btnColor = '#FF6B35';
      for (const [name, hex] of Object.entries(colors)) {
        if (lower.includes(name)) {
          btnColor = hex;
          break;
        }
      }
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  const btn = document.createElement('button');\n  btn.textContent = '${btnText}';\n  btn.style.cssText = 'background:${btnColor};color:#fff;border:none;padding:12px 24px;font-size:16px;font-weight:600;border-radius:8px;cursor:pointer;margin-top:1rem;transition:all 0.3s';\n  btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';\n  btn.onmouseout = () => btn.style.transform = 'translateY(0)';\n  btn.onclick = () => console.log('CTA clicked - AB Test');\n  el.appendChild(btn);\n}`;
      addMsg(`Action: Ajouter un bouton "${btnText}"`, 'system');
    }
    // Arrondir les coins
    else if (lower.includes('arrondi') || lower.includes('border-radius')) {
      const radius = lower.match(/(\d+)\s*px/) ? lower.match(/(\d+)\s*px/)[1] : '8';
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.borderRadius = '${radius}px';\n}`;
      addMsg(`Action: Arrondir les coins (${radius}px)`, 'system');
    }
    // Ajouter une ombre
    else if (lower.includes('ombre') || lower.includes('shadow')) {
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';\n}`;
      addMsg('Action: Ajouter une ombre', 'system');
    }
    // Mettre en gras
    else if (lower.includes('gras') || lower.includes('bold')) {
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.fontWeight = '700';\n}`;
      addMsg('Action: Mettre en gras', 'system');
    }
    // Mettre en italique
    else if (lower.includes('italique') || lower.includes('italic')) {
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.fontStyle = 'italic';\n}`;
      addMsg('Action: Mettre en italique', 'system');
    }
    // Centrer
    else if (lower.includes('centrer') || lower.includes('center')) {
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.textAlign = 'center';\n}`;
      addMsg('Action: Centrer le texte', 'system');
    }
    // Opacité
    else if (lower.includes('opacite') || lower.includes('opacity')) {
      const opacity = lower.match(/(\d+)\s*%/)
        ? parseInt(lower.match(/(\d+)\s*%/)[1]) / 100
        : lower.match(/0\.\d+/)
          ? lower.match(/0\.\d+/)[0]
          : '0.5';
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.opacity = '${opacity}';\n}`;
      addMsg(`Action: Changer l'opacité à ${opacity}`, 'system');
    }
    // Action par défaut
    else {
      jsCode = `const el = document.querySelector('${sel}');\nif (el) {\n  el.style.backgroundColor = '#FF6B35';\n  el.style.padding = '1rem';\n}`;
      addMsg('Action: Modification par défaut (fond orange)', 'system');
    }

    return { jsCode, cssCode, selector: sel };
  };

  // Event handlers
  document.getElementById('ab-close-btn').onclick = () => {
    panel.classList.toggle('closed');
  };

  document.getElementById('ab-inspect-btn').onclick = () => {
    inspectMode = !inspectMode;
    document.getElementById('ab-inspect-btn').textContent = inspectMode
      ? '✓ Inspection active'
      : '🔍 Activer l\'inspection';
    document.body.style.cursor = inspectMode ? 'crosshair' : '';

    if (!inspectMode && hoverEl) {
      hoverEl.classList.remove('ab-inspect-hover');
    }
  };

  const handleHover = (e) => {
    if (!inspectMode || e.target.closest('#ab-test-bookmarklet-panel')) return;

    if (hoverEl) hoverEl.classList.remove('ab-inspect-hover');
    e.target.classList.add('ab-inspect-hover');
    hoverEl = e.target;
  };

  const handleClick = (e) => {
    if (!inspectMode || e.target.closest('#ab-test-bookmarklet-panel')) return;

    e.preventDefault();
    e.stopPropagation();

    selectedEl = e.target;
    const sel = selectedEl.id
      ? `#${selectedEl.id}`
      : selectedEl.className
        ? `.${selectedEl.className.split(' ').filter(c => c && !c.startsWith('ab-'))[0] || selectedEl.className.split(' ')[0]}`
        : `${selectedEl.tagName.toLowerCase()}`;

    document.getElementById('ab-selected').textContent = `Sélectionné: ${sel}`;
    addMsg(`Élément sélectionné: ${sel}`, 'system');

    inspectMode = false;
    document.getElementById('ab-inspect-btn').textContent = '🔍 Activer l\'inspection';
    document.body.style.cursor = '';
    if (hoverEl) hoverEl.classList.remove('ab-inspect-hover');
  };

  document.addEventListener('mouseover', handleHover);
  document.addEventListener('click', handleClick, true);

  document.getElementById('ab-generate-btn').onclick = () => {
    const input = document.getElementById('ab-variant-input').value.trim();

    if (!input) {
      addMsg('Veuillez décrire une modification', 'error');
      return;
    }

    addMsg(`📝 ${input}`, 'user');

    const result = analyzeDescription(input);
    const combined = `// AB Test - ${new Date().toLocaleString('fr-FR')}
// Description: ${input}
// Sélecteur: ${result.selector}

(function() {
  'use strict';

  ${result.jsCode}

  ${result.cssCode ? `// Injection CSS
  const style = document.createElement('style');
  style.textContent = \`${result.cssCode}\`;
  document.head.appendChild(style);` : ''}
})();`;

    document.getElementById('ab-code-output').textContent = combined;
    document.getElementById('ab-code-section').style.display = 'block';
    window.abTestCode = combined;

    addMsg('✅ Code JavaScript généré!', 'system');
  };

  document.getElementById('ab-copy-btn').onclick = () => {
    navigator.clipboard.writeText(window.abTestCode || '')
      .then(() => addMsg('📋 Code copié pour AB Tasty!', 'system'))
      .catch(() => addMsg('❌ Erreur de copie', 'error'));
  };

  document.getElementById('ab-preview-btn').onclick = () => {
    try {
      eval(window.abTestCode || '');
      addMsg('👁️ Preview appliqué! Rechargez pour annuler.', 'system');
    } catch (e) {
      addMsg(`❌ Erreur: ${e.message}`, 'error');
    }
  };

  // Message de bienvenue
  addMsg('🎉 Panel ouvert! Version améliorée avec génération intelligente.', 'system');
})();
