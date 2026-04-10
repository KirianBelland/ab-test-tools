// AB Test Generator Panel - Version HYBRIDE
// Combine inspection + génération naturelle + CSS global
(function() {
  'use strict';

  // Vérifier si le panel existe déjà
  if (document.getElementById('ab-test-bookmarklet-panel')) {
    alert('Le panel est déjà ouvert!');
    return;
  }

  // Injecter les styles CSS du panel
  const style = document.createElement('style');
  style.textContent = `
    #ab-test-bookmarklet-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 500px;
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
      font-size: 0.95rem;
    }
    .ab-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .ab-btn-primary {
      background: #2563eb;
      color: #fff;
    }
    .ab-btn-success {
      background: #10b981;
      color: #fff;
    }
    .ab-btn-warning {
      background: #f59e0b;
      color: #fff;
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
    .ab-input-code {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9rem;
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
    .ab-message-success {
      background: #d1fae5;
      color: #065f46;
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
    .ab-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }
    .ab-tab {
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-weight: 600;
      color: #64748b;
      transition: all 0.2s;
    }
    .ab-tab:hover {
      color: #2563eb;
    }
    .ab-tab.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
    }
    .ab-tab-content {
      display: none;
    }
    .ab-tab-content.active {
      display: block;
    }
  `;
  document.head.appendChild(style);

  // Créer le panel HTML
  const panel = document.createElement('div');
  panel.id = 'ab-test-bookmarklet-panel';
  panel.innerHTML = `
    <div id='ab-panel-header'>
      <div>
        <h2 style='margin:0;font-size:1.3rem'>🎨 AB Test - Version Complète</h2>
        <p style='margin:0;opacity:0.9;font-size:0.9rem'>Inspection + Génération + CSS</p>
      </div>
      <button id='ab-close-btn'>✕</button>
    </div>
    <div id='ab-panel-content'>

      <div class='ab-section'>
        <h3>📍 Page actuelle</h3>
        <p style='font-size:0.85rem;color:#64748b;word-break:break-all'>${window.location.href}</p>
      </div>

      <div class='ab-section'>
        <h3>🎯 Mode inspection</h3>
        <button id='ab-inspect-btn' class='ab-btn ab-btn-primary'>🔍 Activer l'inspection</button>
        <p id='ab-selected' style='margin:0.5rem 0;font-size:0.85rem;color:#64748b'>Aucun élément sélectionné</p>
      </div>

      <div class='ab-section'>
        <div class='ab-tabs'>
          <button class='ab-tab active' data-tab='natural'>💬 Langage naturel</button>
          <button class='ab-tab' data-tab='css'>🎨 CSS direct</button>
        </div>

        <div class='ab-tab-content active' id='tab-natural'>
          <h3>💬 Génération intelligente</h3>
          <p style='font-size:0.85rem;color:#64748b;margin-bottom:0.5rem'>
            Décrivez votre modification en français
          </p>
          <textarea id='ab-variant-input' class='ab-input' placeholder='Ex: Change la couleur du bouton en rouge\nMasque cet élément\nAugmente la taille à 24px' rows='3'></textarea>
          <button id='ab-generate-btn' class='ab-btn ab-btn-primary'>⚡ Générer le code CSS</button>
        </div>

        <div class='ab-tab-content' id='tab-css'>
          <h3>🎨 Éditeur CSS</h3>
          <p style='font-size:0.85rem;color:#64748b;margin-bottom:0.5rem'>
            Écrivez directement du CSS
          </p>
          <textarea id='ab-css-input' class='ab-input ab-input-code' placeholder='Exemple:\nbutton {\n  background: orange !important;\n}' rows='6'></textarea>
        </div>

        <button id='ab-apply-btn' class='ab-btn ab-btn-success'>✨ Appliquer sur la page</button>
        <button id='ab-clear-btn' class='ab-btn ab-btn-warning'>🗑️ Effacer les modifications</button>
        <div id='ab-messages'></div>
      </div>

      <div class='ab-section' id='ab-code-section' style='display:none'>
        <h3>📝 Code CSS généré</h3>
        <div id='ab-code-output'></div>
        <button id='ab-copy-btn' class='ab-btn'>📋 Copier pour AB Tasty</button>
      </div>

    </div>
  `;
  document.body.appendChild(panel);

  // Variables globales
  let inspectMode = false;
  let selectedEl = null;
  let hoverEl = null;
  let appliedCSS = null;
  let currentTab = 'natural';

  // Fonction pour ajouter des messages
  const addMsg = (txt, type = 'system') => {
    const msg = document.createElement('div');
    msg.className = `ab-message ab-message-${type}`;
    msg.textContent = txt;
    const msgContainer = document.getElementById('ab-messages');
    msgContainer.appendChild(msg);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    if (type === 'system') {
      setTimeout(() => msg.remove(), 5000);
    }
  };

  // Gestion des onglets
  document.querySelectorAll('.ab-tab').forEach(tab => {
    tab.onclick = () => {
      const tabName = tab.dataset.tab;

      // Activer l'onglet
      document.querySelectorAll('.ab-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Afficher le contenu
      document.querySelectorAll('.ab-tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`tab-${tabName}`).classList.add('active');

      currentTab = tabName;
    };
  });

  // Fermer le panel
  document.getElementById('ab-close-btn').onclick = () => {
    panel.classList.toggle('closed');
  };

  // Mode inspection
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

    // Générer le sélecteur CSS
    let selector = '';
    if (selectedEl.id) {
      selector = `#${selectedEl.id}`;
    } else if (selectedEl.className && typeof selectedEl.className === 'string') {
      const classes = selectedEl.className.split(' ').filter(c => c && !c.startsWith('ab-') && !c.match(/^css-[a-z0-9]+$/i));
      if (classes.length > 0) {
        selector = `.${classes[0]}`;
      } else {
        selector = selectedEl.tagName.toLowerCase();
      }
    } else {
      selector = selectedEl.tagName.toLowerCase();
    }

    // Stocker le sélecteur
    selectedEl._cssSelector = selector;

    document.getElementById('ab-selected').textContent = `Sélectionné: ${selector}`;
    addMsg(`✅ Élément sélectionné: ${selector}`, 'success');

    inspectMode = false;
    document.getElementById('ab-inspect-btn').textContent = '🔍 Activer l\'inspection';
    document.body.style.cursor = '';
    if (hoverEl) hoverEl.classList.remove('ab-inspect-hover');
  };

  document.addEventListener('mouseover', handleHover);
  document.addEventListener('click', handleClick, true);

  // Analyse de la description en langage naturel et génération CSS
  const analyzeDescription = (desc) => {
    const lower = desc.toLowerCase();
    const selector = selectedEl?._cssSelector || 'body';

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

    let cssCode = '';

    // === POSITIONNEMENT ===

    // Sticky
    if (lower.includes('sticky') || lower.includes('collant') || (lower.includes('reste') && lower.includes('haut'))) {
      const topValue = lower.match(/(\d+)\s*px/) ? lower.match(/(\d+)\s*px/)[1] : '0';
      cssCode = `${selector} {\n  position: sticky !important;\n  top: ${topValue}px !important;\n  z-index: 1000 !important;\n}`;
      addMsg(`Action: Position sticky (top: ${topValue}px)`, 'system');
    }
    // Fixed
    else if (lower.includes('fixed') || lower.includes('fixe')) {
      let position = 'top: 0; left: 0;';
      if (lower.includes('bas')) position = 'bottom: 0; left: 0;';
      if (lower.includes('droite')) position = 'top: 0; right: 0;';
      cssCode = `${selector} {\n  position: fixed !important;\n  ${position}\n  z-index: 9999 !important;\n}`;
      addMsg('Action: Position fixed', 'system');
    }

    // === AJOUT DE CONTENU VISUEL ===

    // Ajouter un badge
    else if (lower.includes('badge') || lower.includes('etiquette')) {
      const badgeText = lower.match(/"([^"]+)"|'([^']+)'/)
        ? (lower.match(/"([^"]+)"|'([^']+)'/)[1] || lower.match(/"([^"]+)"|'([^']+)'/)[2])
        : 'PROMO';
      let badgeColor = '#ef4444';
      for (const [name, hex] of Object.entries(colors)) {
        if (lower.includes(name)) {
          badgeColor = hex;
          break;
        }
      }
      cssCode = `${selector} {\n  position: relative !important;\n}\n\n${selector}::before {\n  content: "${badgeText}" !important;\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  background: ${badgeColor};\n  color: white;\n  padding: 6px 12px;\n  border-radius: 20px;\n  font-weight: bold;\n  font-size: 12px;\n  z-index: 10;\n}`;
      addMsg(`Action: Ajouter badge "${badgeText}"`, 'system');
    }
    // Ajouter un bouton VISUEL (pas cliquable)
    else if (lower.includes('ajoute') && (lower.includes('bouton') || lower.includes('cta'))) {
      const btnText = lower.match(/"([^"]+)"|'([^']+)'/)
        ? (lower.match(/"([^"]+)"|'([^']+)'/)[1] || lower.match(/"([^"]+)"|'([^']+)'/)[2])
        : 'Cliquez ici';
      let btnColor = '#FF6B35';
      for (const [name, hex] of Object.entries(colors)) {
        if (lower.includes(name)) {
          btnColor = hex;
          break;
        }
      }
      cssCode = `${selector}::after {\n  content: "${btnText}" !important;\n  display: block;\n  background: ${btnColor};\n  color: white;\n  padding: 12px 24px;\n  margin-top: 1rem;\n  border-radius: 8px;\n  font-weight: 600;\n  text-align: center;\n  cursor: pointer;\n}\n\n/* ⚠️ ATTENTION: Bouton visuel seulement (non cliquable)\n   Pour un vrai bouton, utilisez JavaScript */`;
      addMsg(`⚠️ Bouton visuel créé (non cliquable). Pour un vrai bouton, passez en mode CSS et ajoutez du JavaScript`, 'system');
    }

    // === ANIMATIONS ===

    // Faire clignoter
    else if (lower.includes('clignote') || lower.includes('pulse') || lower.includes('pulsation')) {
      cssCode = `@keyframes ab-pulse {\n  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.05); }\n}\n\n${selector} {\n  animation: ab-pulse 2s infinite !important;\n}`;
      addMsg('Action: Animation pulsation', 'system');
    }
    // Faire apparaître en fondu
    else if (lower.includes('fondu') || lower.includes('fade')) {
      cssCode = `@keyframes ab-fade-in {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n${selector} {\n  animation: ab-fade-in 1s ease !important;\n}`;
      addMsg('Action: Apparition en fondu', 'system');
    }
    // Faire glisser
    else if (lower.includes('glisse') || lower.includes('slide')) {
      const direction = lower.includes('gauche') ? '-100px, 0' : lower.includes('droite') ? '100px, 0' : lower.includes('bas') ? '0, 100px' : '0, -100px';
      cssCode = `@keyframes ab-slide {\n  from { transform: translate(${direction}); opacity: 0; }\n  to { transform: translate(0, 0); opacity: 1; }\n}\n\n${selector} {\n  animation: ab-slide 0.5s ease !important;\n}`;
      addMsg('Action: Animation glissement', 'system');
    }

    // === TRANSFORMATIONS ===

    // Agrandir/Réduire
    else if (lower.includes('agrandit') || lower.includes('scale') || lower.includes('zoom')) {
      const scale = lower.match(/(\d+)\s*%/) ? parseInt(lower.match(/(\d+)\s*%/)[1]) / 100 : '1.2';
      cssCode = `${selector} {\n  transform: scale(${scale}) !important;\n  transition: transform 0.3s !important;\n}`;
      addMsg(`Action: Agrandir ${scale}x`, 'system');
    }
    // Rotation
    else if (lower.includes('tourne') || lower.includes('rotation') || lower.includes('rotate')) {
      const degrees = lower.match(/(\d+)\s*(deg|degré)/) ? lower.match(/(\d+)\s*(deg|degré)/)[1] : '45';
      cssCode = `${selector} {\n  transform: rotate(${degrees}deg) !important;\n}`;
      addMsg(`Action: Rotation ${degrees}°`, 'system');
    }

    // === VISIBILITÉ ===

    // Opacité
    else if (lower.includes('opacite') || lower.includes('opacity') || lower.includes('transparent')) {
      const opacity = lower.match(/(\d+)\s*%/)
        ? parseInt(lower.match(/(\d+)\s*%/)[1]) / 100
        : lower.match(/0\.\d+/)
          ? lower.match(/0\.\d+/)[0]
          : '0.5';
      cssCode = `${selector} {\n  opacity: ${opacity} !important;\n}`;
      addMsg(`Action: Opacité ${opacity}`, 'system');
    }
    // Flou
    else if (lower.includes('flou') || lower.includes('blur')) {
      const amount = lower.match(/(\d+)\s*px/) ? lower.match(/(\d+)\s*px/)[1] : '5';
      cssCode = `${selector} {\n  filter: blur(${amount}px) !important;\n}`;
      addMsg(`Action: Flou ${amount}px`, 'system');
    }

    // === BASIQUES (comme avant) ===

    // Masquer/Cacher
    else if (lower.includes('masque') || lower.includes('cache') || lower.includes('supprime')) {
      cssCode = `${selector} {\n  display: none !important;\n}`;
      addMsg('Action: Masquer l\'élément', 'system');
    }
    // Afficher
    else if (lower.includes('affiche') || lower.includes('montre')) {
      cssCode = `${selector} {\n  display: block !important;\n  visibility: visible !important;\n}`;
      addMsg('Action: Afficher l\'élément', 'system');
    }
    // Changer le texte
    else if (lower.includes('texte') && lower.match(/"([^"]+)"|'([^']+)'/)) {
      const newText = desc.match(/"([^"]+)"|'([^']+)'/)[1] || desc.match(/"([^"]+)"|'([^']+)'/)[2];
      cssCode = `${selector} {\n  font-size: 0 !important;\n}\n\n${selector}::before {\n  content: "${newText}" !important;\n  font-size: 16px !important;\n  display: block;\n}`;
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
        cssCode = `${selector} {\n  background-color: ${color} !important;\n}`;
        addMsg(`Action: Couleur de fond ${color}`, 'system');
      } else if (lower.includes('bordure') || lower.includes('border')) {
        cssCode = `${selector} {\n  border: 3px solid ${color} !important;\n}`;
        addMsg(`Action: Bordure ${color}`, 'system');
      } else {
        cssCode = `${selector} {\n  color: ${color} !important;\n}`;
        addMsg(`Action: Couleur du texte ${color}`, 'system');
      }
    }
    // Taille
    else if (lower.includes('taille') && (lower.includes('police') || lower.includes('texte') || lower.includes('font'))) {
      const size = lower.match(/(\d+)\s*px/) ? lower.match(/(\d+)\s*px/)[1] : '24';
      cssCode = `${selector} {\n  font-size: ${size}px !important;\n}`;
      addMsg(`Action: Taille ${size}px`, 'system');
    }
    // Largeur
    else if (lower.includes('largeur') || lower.includes('width')) {
      const width = lower.match(/(\d+)\s*(%|px)/) ? lower.match(/(\d+)\s*(%|px)/)[0] : '100%';
      cssCode = `${selector} {\n  width: ${width} !important;\n}`;
      addMsg(`Action: Largeur ${width}`, 'system');
    }
    // Gras
    else if (lower.includes('gras') || lower.includes('bold')) {
      cssCode = `${selector} {\n  font-weight: 700 !important;\n}`;
      addMsg('Action: Mettre en gras', 'system');
    }
    // Centrer
    else if (lower.includes('centrer') || lower.includes('center')) {
      cssCode = `${selector} {\n  text-align: center !important;\n}`;
      addMsg('Action: Centrer le texte', 'system');
    }
    // Arrondi
    else if (lower.includes('arrondi') || lower.includes('border-radius')) {
      const radius = lower.match(/(\d+)\s*px/) ? lower.match(/(\d+)\s*px/)[1] : '8';
      cssCode = `${selector} {\n  border-radius: ${radius}px !important;\n}`;
      addMsg(`Action: Arrondir ${radius}px`, 'system');
    }
    // Ombre
    else if (lower.includes('ombre') || lower.includes('shadow')) {
      cssCode = `${selector} {\n  box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;\n}`;
      addMsg('Action: Ajouter une ombre', 'system');
    }
    // Par défaut
    else {
      cssCode = `${selector} {\n  background-color: #FF6B35 !important;\n  padding: 1rem !important;\n}`;
      addMsg('Action: Modification par défaut (fond orange)', 'system');
    }

    return cssCode;
  };

  // Générer le code CSS depuis langage naturel
  document.getElementById('ab-generate-btn').onclick = () => {
    const input = document.getElementById('ab-variant-input').value.trim();

    if (!input) {
      addMsg('❌ Veuillez décrire une modification', 'error');
      return;
    }

    if (!selectedEl) {
      addMsg('⚠️ Aucun élément sélectionné. Le code s\'appliquera à toute la page (body)', 'system');
    }

    addMsg(`📝 "${input}"`, 'user');

    const cssCode = analyzeDescription(input);
    document.getElementById('ab-css-input').value = cssCode;

    // Passer à l'onglet CSS
    document.querySelector('[data-tab="css"]').click();

    addMsg('✅ Code CSS généré! Cliquez sur "Appliquer" pour le tester', 'success');
  };

  // Appliquer le CSS (depuis les deux onglets)
  document.getElementById('ab-apply-btn').onclick = () => {
    const cssCode = document.getElementById('ab-css-input').value.trim();

    if (!cssCode) {
      addMsg('❌ Aucun code CSS à appliquer', 'error');
      return;
    }

    try {
      // Supprimer l'ancien
      if (appliedCSS) {
        appliedCSS.remove();
      }

      // Créer et injecter
      appliedCSS = document.createElement('style');
      appliedCSS.id = 'ab-test-injected-css';
      appliedCSS.textContent = cssCode;
      document.head.appendChild(appliedCSS);

      // Afficher le code
      document.getElementById('ab-code-output').textContent = cssCode;
      document.getElementById('ab-code-section').style.display = 'block';

      // Stocker pour copie
      window.abTestCSS = cssCode;

      addMsg('✅ CSS appliqué avec succès!', 'success');
      addMsg('💡 Rechargez (F5) pour annuler', 'system');

      // Effet visuel
      document.body.style.outline = '3px solid #10b981';
      setTimeout(() => {
        document.body.style.outline = '';
      }, 1000);

    } catch (e) {
      addMsg(`❌ Erreur: ${e.message}`, 'error');
    }
  };

  // Effacer
  document.getElementById('ab-clear-btn').onclick = () => {
    if (appliedCSS) {
      appliedCSS.remove();
      appliedCSS = null;
      addMsg('🗑️ Modifications effacées', 'success');
      document.getElementById('ab-code-section').style.display = 'none';
    } else {
      addMsg('💡 Aucune modification à effacer', 'system');
    }
  };

  // Copier
  document.getElementById('ab-copy-btn').onclick = () => {
    const code = window.abTestCSS || '';
    if (!code) {
      addMsg('❌ Aucun code à copier', 'error');
      return;
    }

    const abTastyCode = `// AB Test CSS - ${new Date().toLocaleString('fr-FR')}
(function() {
  const style = document.createElement('style');
  style.textContent = \`
${code}
\`;
  document.head.appendChild(style);
})();`;

    navigator.clipboard.writeText(abTastyCode)
      .then(() => addMsg('📋 Code copié pour AB Tasty!', 'success'))
      .catch(() => addMsg('❌ Erreur de copie', 'error'));
  };

  // Message de bienvenue
  addMsg('🎨 Panel hybride ouvert! Sélectionnez un élément puis décrivez votre modification.', 'system');
})();
