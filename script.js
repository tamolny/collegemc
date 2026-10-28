console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const MAX_LEAVES = 35;
  let currentLeafCount = 0;
  let totalFlowersClicked = 0;

  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.8s ease-in';
    document.body.style.opacity = '1';
  }, 100);

  // ----- Announcement banner (dismissible, stored in localStorage) -----
  const BANNER_STORAGE_KEY = 'collegemc-banner-dismissed';
  const announcementBanner = document.getElementById('announcement-banner');
  const announcementDismiss = document.getElementById('announcement-dismiss');

  if (announcementBanner && announcementDismiss) {
    if (localStorage.getItem(BANNER_STORAGE_KEY) === 'true') {
      announcementBanner.setAttribute('data-dismissed', 'true');
      document.body.classList.add('banner-dismissed');
    }
    announcementDismiss.addEventListener('click', () => {
      announcementBanner.setAttribute('data-dismissed', 'true');
      document.body.classList.add('banner-dismissed');
      localStorage.setItem(BANNER_STORAGE_KEY, 'true');
    });
  }

  // ----- Nav: layered menu (Map / Leaderboard → Vanilla / Modded), hamburger or Back in center -----
  const NAV_URLS = {
    map: { vanilla: 'https://map.collegemc.com', modded: 'https://moddedmap.collegemc.com' },
    leaderboard: { vanilla: 'https://playerstats.collegemc.com/hof', modded: 'https://moddedplayerstats.collegemc.com/hof' }
  };

  const NAV_ICONS = {
    map: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>',
    leaderboard: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>'
  };

  const menuToggle = document.getElementById('menu-toggle');
  const navBack = document.getElementById('nav-back');
  const navMenu = document.getElementById('nav-menu');
  const navItemLeft = document.getElementById('nav-item-left');
  const navItemRight = document.getElementById('nav-item-right');
  const navPillContainer = document.getElementById('nav-pill-container');
  const navOverlay = document.getElementById('nav-overlay');

  if (menuToggle && navBack && navMenu && navItemLeft && navItemRight) {
    let navLevel = 0; // 0 = main (Web Map, Leaderboard), 1 = submenu (Vanilla, Modded)

    function renderMainMenu() {
      navItemLeft.innerHTML = `<button type="button" class="nav-link" data-nav="map">
        <span class="nav-link-icon" aria-hidden="true">${NAV_ICONS.map}</span>
        <span class="nav-link-label">Web Map</span>
      </button>`;
      navItemRight.innerHTML = `<button type="button" class="nav-link" data-nav="leaderboard">
        <span class="nav-link-icon" aria-hidden="true">${NAV_ICONS.leaderboard}</span>
        <span class="nav-link-label">Leaderboard</span>
      </button>`;
    }

    function renderSubmenu(type) {
      const urls = NAV_URLS[type];
      const isMap = type === 'map';
      navItemLeft.innerHTML = `<a href="${urls.vanilla}" class="nav-link" target="_blank" rel="noopener">
        <span class="nav-link-icon" aria-hidden="true">${isMap ? NAV_ICONS.map : NAV_ICONS.leaderboard}</span>
        <span class="nav-link-label">Vanilla ${isMap ? 'Map' : 'Leaderboard'}</span>
      </a>`;
      navItemRight.innerHTML = `<a href="${urls.modded}" class="nav-link" target="_blank" rel="noopener">
        <span class="nav-link-icon" aria-hidden="true">${isMap ? NAV_ICONS.map : NAV_ICONS.leaderboard}</span>
        <span class="nav-link-label">Modded ${isMap ? 'Map' : 'Leaderboard'}</span>
      </a>`;
    }

    function setCenterButtons(level) {
      navLevel = level;
      if (level === 0) {
        menuToggle.style.display = '';
        navBack.style.display = 'none';
      } else {
        menuToggle.style.display = 'none';
        navBack.style.display = '';
      }
    }

    function setNavOpen(open) {
      const isOpen = !!open;
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      navMenu.setAttribute('aria-expanded', isOpen);

      if (isOpen) {
        navPillContainer.classList.add('open');
        menuToggle.classList.add('open');
        navOverlay.classList.add('active');
        navOverlay.setAttribute('aria-hidden', 'false');
      } else {
        navPillContainer.classList.remove('open');
        menuToggle.classList.remove('open');
        navOverlay.classList.remove('active');
        navOverlay.setAttribute('aria-hidden', 'true');
        navLevel = 0;
        renderMainMenu();
        setCenterButtons(0);
      }
    }

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        setNavOpen(false);
      } else {
        renderMainMenu();
        setCenterButtons(0);
        setNavOpen(true);
      }
    });

    navBack.addEventListener('click', (e) => {
      e.stopPropagation();
      renderMainMenu();
      setCenterButtons(0);
    });

    navMenu.addEventListener('click', (e) => {
      // Handle main menu button clicks
      const btn = e.target.closest('[data-nav]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const type = btn.getAttribute('data-nav');
      if (type === 'map' || type === 'leaderboard') {
        renderSubmenu(type);
        setCenterButtons(1);
      }
    });

    document.addEventListener('click', (e) => {
      if (navMenu.getAttribute('aria-expanded') === 'true' && !e.target.closest('.nav-pill-container')) {
        setNavOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.getAttribute('aria-expanded') === 'true') {
        if (navLevel === 1) {
          renderMainMenu();
          setCenterButtons(0);
        } else {
          setNavOpen(false);
        }
      }
    });

    renderMainMenu();
  }

  // ----- Dynamic servers (from servers.json for GitHub Pages) -----
  const SERVERS_JSON = 'servers.json';
  const COLLEGEMC_API_BASE = 'https://api.collegemc.com';
  const MCSTATUS_API = 'https://api.mcstatus.io/v2/status/java';
  // A server that does not answer in time counts as unknown, so one slow API never holds up the others
  const STATUS_TIMEOUT_MS = 4000;

  /** Fetch status: CollegeMC custom API (same shape as debug.js) or mcstatus.io.
   *  Returns { online, playersDisplay, motd, players: [{ name }], world } or null. */
  async function fetchServerStatus(server) {
    const source = server.statusSource || 'mcstatus';
    if (source === 'none') return null;

    if (source === 'collegemc') {
      try {
        const base = server.apiBase || COLLEGEMC_API_BASE;
        const path = server.apiPath || '/api';
        const res = await fetch(`${base}${path}`, { cache: 'no-cache', signal: AbortSignal.timeout(STATUS_TIMEOUT_MS) });
        if (!res.ok) return null;
        const data = await res.json();
        const playersDisplay = data.playerCountDisplay != null
          ? data.playerCountDisplay
          : (data.playerCount != null && data.maxPlayers != null)
            ? `${data.playerCount} / ${data.maxPlayers}`
            : null;
        return {
          online: !!data.online,
          playersDisplay: playersDisplay ?? null,
          motd: data.serverInfo?.motd || null,
          version: data.serverInfo?.version || null,
          players: Array.isArray(data.players) ? data.players.filter(p => p && p.name) : [],
          world: data.worldInfo || null
        };
      } catch {
        return null;
      }
    }

    try {
      const res = await fetch(`${MCSTATUS_API}/${encodeURIComponent(server.address)}`, { cache: 'no-cache', signal: AbortSignal.timeout(STATUS_TIMEOUT_MS) });
      if (!res.ok) return null;
      const data = await res.json();
      const cur = data.players?.online;
      const max = data.players?.max;
      const playersDisplay = (cur != null && max != null) ? `${cur} / ${max}` : null;
      const list = Array.isArray(data.players?.list) ? data.players.list : [];
      return {
        online: !!data.online,
        playersDisplay,
        motd: data.motd?.clean || null,
        version: data.version?.name_clean || null,
        players: list.map(p => ({ name: p.name_clean || p.name_raw })).filter(p => p.name),
        world: null
      };
    } catch {
      return null;
    }
  }

  async function loadServers() {
    const container = document.getElementById('server-cards');
    const loading = document.getElementById('server-loading');
    if (!container) return;

    // Try multiple URLs so it works locally and on GitHub Pages
    const pathname = window.location.pathname.replace(/\/$/, '') || '/';
    const base = pathname.endsWith('.html') ? pathname.replace(/\/[^/]*$/, '') : pathname;
    const urlsToTry = [
      (base ? base + '/' : './') + SERVERS_JSON,
      '/servers.json',
      './servers.json'
    ].filter((u, i, a) => a.indexOf(u) === i);

    let servers = [];
    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data)) {
          servers = data;
          break;
        }
      } catch {
        continue;
      }
    }

    // Only include valid entries (name + address)
    servers = servers.filter(s => s && typeof s.name === 'string' && typeof s.address === 'string');
    if (servers.length === 0) {
      container.innerHTML = '<p class="server-loading">No servers configured or servers.json could not be loaded. Add entries to servers.json.</p>';
      if (loading) loading.remove();
      return;
    }

    if (loading) loading.remove();

    container.innerHTML = servers.map((server, i) => {
      const cardId = `server-card-${i}`;
      const statusId = `server-status-${i}`;
      const playersId = `server-players-${i}`;
      const displayAddr = escapeHtml(server.address);
      const copyAddr = escapeHtml(server.addressCopy != null ? server.addressCopy : server.address);
      const name = escapeHtml(server.name);
      const noStatus = (server.statusSource || '') === 'none';
      // A server with no status (e.g. "Coming soon") has nothing real to copy
      const copyable = noStatus ? '' : copyAddr;
      const statusInitial = noStatus ? 'Not yet' : '…';
      const playersInitial = noStatus ? 'Not yet' : '…';
      // Joinable versions: servers.json "java" wins, else the version the server reports; "bedrock" marks Geyser
      const javaChip = server.java ? `<li>Java ${escapeHtml(server.java)}</li>` : '';
      const bedrockChip = server.bedrock ? '<li class="server-version--bedrock">Bedrock</li>' : '';
      return `<div class="server-card" id="${cardId}">
  <img class="server-icon" src="images/logo_cmc.png" alt="" width="64" height="64">
  <div class="server-main">
    <div class="server-title-row">
      <h3 class="server-card-name">${name}</h3>
      <span class="server-signal" id="server-signal-${i}" data-state="${noStatus ? 'none' : 'pinging'}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
    </div>
    <p class="server-motd" id="server-motd-${i}">${noStatus ? 'Coming soon' : '…'}</p>
    <ul class="server-versions" id="server-versions-${i}" aria-label="Versions you can join with"${javaChip || bedrockChip ? '' : ' hidden'}>${javaChip}${bedrockChip}</ul>
  </div>
  <div class="server-address-container">
    <code class="server-address" data-address="${copyable}"${noStatus ? '' : ' title="Click to copy"'}>${displayAddr}</code>
    <button type="button" class="copy-button" data-address="${copyable}" aria-label="Copy address"${noStatus ? ' disabled' : ''}>Copy</button>
  </div>
  <dl class="server-stats">
    <div class="server-status"><dt>Status</dt><dd><span class="server-status-unknown" id="${statusId}" data-checked="${noStatus}" data-no-status="${noStatus}">${statusInitial}</span></dd></div>
    <div class="player-count"><dt>Players</dt><dd><span class="server-players" id="${playersId}">${playersInitial}</span></dd></div>
  </dl>
</div>`;
    }).join('');

    container.querySelectorAll('.copy-button').forEach(btn => {
      btn.addEventListener('click', () => copyAddress(btn.dataset.address, btn));
    });
    container.querySelectorAll('.server-address').forEach(el => {
      el.addEventListener('click', () => copyAddress(el.dataset.address, el.nextElementSibling));
    });

    function showReportedVersion(i, server, version) {
      const list = document.getElementById(`server-versions-${i}`);
      if (!list || server.java || !version) return;
      let chip = list.querySelector('.server-version--reported');
      if (!chip) {
        chip = document.createElement('li');
        chip.className = 'server-version--reported';
        list.prepend(chip);
      }
      chip.textContent = `Java ${stripFormatting(version)}`;
      list.hidden = false;
    }

    async function refreshAllStatuses() {
      const online = []; // { name, server } across every server
      let world = null;
      let anyAnswered = false;
      for (let i = 0; i < servers.length; i++) {
        const server = servers[i];
        const statusEl = document.getElementById(`server-status-${i}`);
        const playersEl = document.getElementById(`server-players-${i}`);
        const signalEl = document.getElementById(`server-signal-${i}`);
        const motdEl = document.getElementById(`server-motd-${i}`);
        if (!statusEl || !playersEl) continue;
        if (statusEl.dataset.noStatus === 'true') continue;
        statusEl.textContent = 'Checking…';
        statusEl.className = 'server-status-unknown';
        statusEl.dataset.checked = 'true';
        if (signalEl) signalEl.dataset.state = 'pinging';
        let data = null;
        try {
          data = await fetchServerStatus(server);
        } catch {
          data = null;
        }
        if (data !== null) anyAnswered = true;
        if (data?.online) {
          statusEl.textContent = 'Online';
          statusEl.className = 'server-status-online';
          playersEl.textContent = data.playersDisplay || 'N/A';
          if (signalEl) signalEl.dataset.state = 'online';
          if (motdEl) motdEl.textContent = stripFormatting(data.motd) || server.address;
          showReportedVersion(i, server, data.version);
          data.players.forEach(p => online.push({ name: p.name, server: server.name }));
          if (!world && data.world) world = data.world;
        } else {
          statusEl.textContent = data === null ? 'Unknown' : 'Offline';
          statusEl.className = data === null ? 'server-status-unknown' : 'server-status-offline';
          playersEl.textContent = data === null ? 'N/A' : '0 / 0';
          if (signalEl) signalEl.dataset.state = data === null ? 'unknown' : 'offline';
          if (motdEl) motdEl.textContent = data === null ? 'Can’t reach the server right now' : 'Server is offline';
        }
        if (motdEl) motdEl.title = motdEl.textContent;
        // Show what has arrived so far; don't wait for an unrelated server
        renderOnlineNow(online, anyAnswered);
        applySky(world);
      }
      renderOnlineNow(online, anyAnswered);
      applySky(world);
    }

    await refreshAllStatuses();
    setInterval(refreshAllStatuses, 30000);
  }

  function copyAddress(address, buttonEl) {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      if (buttonEl?.classList?.contains('copy-button')) {
        buttonEl.textContent = 'Copied';
        buttonEl.classList.add('copied');
        setTimeout(() => {
          buttonEl.textContent = 'Copy';
          buttonEl.classList.remove('copied');
        }, 2000);
      }
    });
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s == null ? '' : String(s);
    return div.innerHTML;
  }

  /** Minecraft text can carry § formatting codes; the page shows plain text. */
  function stripFormatting(text) {
    return text ? String(text).replace(/§./g, '').trim() : '';
  }

  // ----- Online now: real players' heads in the hero -----
  function renderOnlineNow(players, anyAnswered) {
    const box = document.getElementById('online-now');
    const label = document.getElementById('online-now-label');
    const list = document.getElementById('online-now-heads');
    if (!box || !label || !list) return;
    if (!anyAnswered) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    if (players.length === 0) {
      label.textContent = 'Nobody’s online right now. Hop on and be the first!';
      list.innerHTML = '';
      return;
    }
    label.textContent = players.length === 1 ? '1 player online now' : `${players.length} players online now`;
    const shown = players.slice(0, 8);
    list.innerHTML = shown.map(p => {
      const name = escapeHtml(p.name);
      const where = escapeHtml(p.server);
      return `<li title="${name} on ${where}"><img src="https://mc-heads.net/avatar/${encodeURIComponent(p.name)}/40" alt="${name}" width="40" height="40" loading="lazy"></li>`;
    }).join('') + (players.length > shown.length ? `<li class="online-now-more">+${players.length - shown.length}</li>` : '');
  }

  // ----- The site follows the server's sky -----
  // Minecraft time: 0 is sunrise, 6000 noon, 12000 sunset, 18000 midnight (24000 ticks a day)
  function skyPhase(ticks) {
    const t = ((Number(ticks) % 24000) + 24000) % 24000;
    if (t >= 22500 || t < 1000) return 'dawn';
    if (t < 11500) return 'day';
    if (t < 13500) return 'dusk';
    return 'night';
  }

  function applySky(world) {
    const root = document.documentElement;
    const note = document.getElementById('sky-note');
    if (!world || world.timeOfDay == null) {
      delete root.dataset.sky;
      delete root.dataset.weather;
      if (note) note.hidden = true;
      return;
    }
    const phase = skyPhase(world.timeOfDay);
    const raw = String(world.weather || 'clear').toLowerCase();
    const weather = raw.includes('thunder') || raw.includes('storm') ? 'thunder' : raw.includes('rain') ? 'rain' : 'clear';
    root.dataset.sky = phase;
    root.dataset.weather = weather;
    if (note) {
      const words = { dawn: 'Dawn', day: 'Daytime', dusk: 'Dusk', night: 'Night' };
      const wx = { clear: 'clear skies', rain: 'raining', thunder: 'thunderstorm' };
      note.textContent = `In-game right now: ${words[phase]}, ${wx[weather]}`;
      note.hidden = false;
    }
  }

  loadServers();


  function updateFlowerCounter() {
    const counter = document.getElementById("flower-counter");
    if (counter) {
      counter.textContent = `${currentLeafCount} falling`;
    }
  }

  const MILESTONES = [
    { at: 10, message: "Nice! 10 flowers!" },
    { at: 50, message: "Wow! 50 flowers!" },
    { at: 100, message: "AMAZING! 100 flowers!!!", storm: true }
  ];
  const BEST_STORAGE_KEY = 'collegemc-petal-best';
  let bestScore = 0;
  try {
    bestScore = parseInt(localStorage.getItem(BEST_STORAGE_KEY), 10) || 0;
  } catch {
    bestScore = 0;
  }

  function updateBest() {
    if (totalFlowersClicked > bestScore) {
      bestScore = totalFlowersClicked;
      try {
        localStorage.setItem(BEST_STORAGE_KEY, String(bestScore));
      } catch { /* storage blocked: the best score lasts this visit only */ }
    }
    const bestEl = document.getElementById("petal-best");
    if (bestEl) bestEl.textContent = `Best: ${bestScore}`;
    const dock = document.querySelector('.petal-dock');
    dock?.classList.toggle('is-blossom-master', bestScore >= 100);
    if (bestScore >= 100 && dock && !dock.querySelector('.petal-achievement')) {
      const achievement = document.createElement('p');
      achievement.className = 'petal-achievement';
      achievement.textContent = 'Blossom master unlocked';
      dock.querySelector('.petal-panel')?.appendChild(achievement);
    }
  }

  function updateClickCounter(previous, origin) {
    const clickCounter = document.getElementById("click-counter");
    if (clickCounter) {
      clickCounter.textContent = `Flowers popped: ${totalFlowersClicked}`;
    }
    updateBest();
    // A golden petal is worth 10, so milestones fire when crossed, not only when hit exactly
    MILESTONES.forEach(m => {
      if (previous < m.at && totalFlowersClicked >= m.at) {
        showMilestone(m.message);
        if (m.storm) petalStorm(origin);
      }
    });
  }

  // Milestones look like Minecraft's "Advancement Made!" toast
  function showMilestone(message) {
    document.querySelectorAll(".advancement").forEach(el => el.remove());
    const toast = document.createElement("div");
    toast.className = "advancement";
    toast.setAttribute("role", "status");
    toast.innerHTML = `<img src="images/cherryblossomleaf.png" alt="" width="34" height="32">
      <div><p class="advancement-title">Advancement Made!</p><p class="advancement-text"></p></div>`;
    toast.querySelector(".advancement-text").textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("is-leaving");
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  // At 100: summon a blossom, hold the bloom, then release a golden petal shower.
  function petalStorm(origin) {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches || document.getElementById('petal-pause')?.checked) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const radius = Math.min(130, w * 0.3, h * 0.23);
    // Keep the entire bloom visible even when the winning pop was at an edge.
    const inset = radius + 24;
    const cx = Math.max(inset, Math.min(w - inset, origin?.x ?? w / 2));
    const cy = Math.max(inset, Math.min(h - inset, origin?.y ?? h / 2));
    const count = w < 600 ? 48 : 72;
    const duration = 4800;
    const finale = document.createElement('div');
    finale.className = 'petal-finale';
    finale.setAttribute('aria-hidden', 'true');
    document.body.appendChild(finale);
    const animations = [];
    const play = (el, frames, options = {}) => {
      const animation = el.animate(frames, {
        duration, easing: 'linear', fill: 'forwards', ...options
      });
      animations.push(animation);
      return animation;
    };

    const halo = document.createElement('div');
    halo.className = 'bloom-halo';
    halo.style.left = `${cx}px`;
    halo.style.top = `${cy}px`;
    finale.appendChild(halo);
    play(halo, [
      { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(0.85)', opacity: 0.6, offset: 0.23 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.85, offset: 0.58 },
      { transform: 'translate(-50%, -50%) scale(1.12)', opacity: 0.7, offset: 0.64 },
      { transform: 'translate(-50%, -50%) scale(2.4)', opacity: 0, offset: 0.83 },
      { transform: 'translate(-50%, -50%) scale(2.4)', opacity: 0 }
    ]);

    const medal = document.createElement('div');
    medal.className = 'bloom-medal';
    medal.style.left = `${cx}px`;
    medal.style.top = `${cy}px`;
    medal.innerHTML = '<span class="bloom-medal-score">100</span><span class="bloom-medal-title">Blossom<br>master</span>';
    finale.appendChild(medal);
    play(medal, [
      { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0, offset: 0.2 },
      { transform: 'translate(-50%, -50%) scale(1.08)', opacity: 1, offset: 0.32 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.42 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.76 },
      { transform: 'translate(-50%, -65%) scale(0.9)', opacity: 0, offset: 0.9 },
      { transform: 'translate(-50%, -65%) scale(0.9)', opacity: 0 }
    ]);

    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = i % 6 === 0 ? 'storm-petal leaf--gold' : 'storm-petal';
      petal.style.left = '0px';
      petal.style.top = '0px';
      finale.appendChild(petal);
      const angle = i / count * Math.PI * 2;
      const startX = Math.random() * w;
      const startY = Math.random() * h;
      // A five-lobed flower silhouette, rather than a tiny overlapping ring.
      const flowerRadius = radius * (0.76 + 0.24 * Math.cos(angle * 5));
      const x = cx + Math.cos(angle) * flowerRadius;
      const y = cy + Math.sin(angle) * flowerRadius;
      const orbitX = cx + Math.cos(angle - 1) * radius * 1.25;
      const orbitY = cy + Math.sin(angle - 1) * radius * 1.25;
      const flight = angle + (Math.random() - 0.5) * 0.25;
      const reach = Math.max(w, h) * 0.75 + 120;
      const midX = cx + Math.cos(flight) * radius * 2.3;
      const midY = cy + Math.sin(flight) * radius * 2.3;
      const endX = cx + Math.cos(flight) * reach;
      const endY = cy + Math.sin(flight) * reach + 120;
      const pose = (px, py, turn, scale) => `translate(${px}px, ${py}px) rotate(${turn}deg) scale(${scale})`;
      play(petal, [
        { transform: pose(startX, startY, 0, 0.4), opacity: 0 },
        { transform: pose(startX, startY, 20, 0.8), opacity: 1, offset: 0.08,
          easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)' },
        { transform: pose(orbitX, orbitY, 100, 0.85), opacity: 1, offset: 0.23,
          easing: 'ease-in-out' },
        { transform: pose(x, y, angle * 180 / Math.PI + 90, 0.9), opacity: 1, offset: 0.42 },
        { transform: pose(x, y, angle * 180 / Math.PI + 105, 0.9), opacity: 1, offset: 0.58 },
        { transform: pose(cx + (x - cx) * 0.82, cy + (y - cy) * 0.82, 180, 0.7),
          opacity: 1, offset: 0.64, easing: 'cubic-bezier(0.25, 0, 0.5, 1)' },
        { transform: pose(midX, midY, 320, 1.15), opacity: 1, offset: 0.8 },
        { transform: pose(endX, endY, 540 + i * 7, 0.6), opacity: 0 }
      ]);
    }

    const stop = () => animations.forEach(animation => animation.cancel());
    const onMotionChange = () => { if (motion.matches) stop(); };
    motion.addEventListener('change', onMotionChange);
    // finished also settles on cancellation; paused finales live until resumed.
    Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      motion.removeEventListener('change', onMotionChange);
      finale.remove();
    });
  }

  function createLeaf() {
    // No new petals while paused or under reduced motion
    const petalPause = document.getElementById("petal-pause");
    if ((petalPause && petalPause.checked) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (currentLeafCount >= MAX_LEAVES) {
      console.log("Max leaves reached, skipping creation");
      return;
    }

    const leaf = document.createElement("div");
    leaf.classList.add("leaf");
    // About 1 in 25 petals is golden and worth 10
    const golden = Math.random() < 0.04;
    if (golden) leaf.classList.add("leaf--gold");

    const leftPosition = Math.random() * 100;
    const duration = Math.random() * (15 - 5) + 5;

    leaf.style.left = `${leftPosition}vw`;
    leaf.style.animationDuration = `${duration}s`;

    document.getElementById("falling-leaves").appendChild(leaf);
    currentLeafCount++;
    updateFlowerCounter();

    leaf.addEventListener("click", function (e) {
      const points = golden ? 10 : 1;
      const previous = totalFlowersClicked;
      totalFlowersClicked += points;
      updateClickCounter(previous, { x: e.clientX, y: e.clientY });
      explodeWithNumber(leaf, points, golden);
    });

    leaf.addEventListener("animationend", function () {
      leaf.remove();
      currentLeafCount--;
      updateFlowerCounter();
      console.log(`Leaf animation ended, removed. Current count: ${currentLeafCount}`);
    });
  }

  function explodeWithNumber(leaf, points, golden) {
    const leafRect = leaf.getBoundingClientRect();

    const popNumber = document.createElement("div");
    popNumber.className = golden ? "pop-number pop-number--gold" : "pop-number";
    popNumber.textContent = `+${points}`;
    popNumber.style.left = `${leafRect.left + leafRect.width / 2}px`;
    popNumber.style.top = `${leafRect.top}px`;

    document.body.appendChild(popNumber);

    setTimeout(() => {
      popNumber.remove();
    }, 1000);

    leaf.remove();
    currentLeafCount--;
    updateFlowerCounter();
  }

  for (let i = 0; i < 12; i++) {
    createLeaf();
  }

  setInterval(createLeaf, 450);
  updateBest();

  // Pause also holds a 100-petal storm mid-flight
  document.getElementById('petal-pause')?.addEventListener('change', (e) => {
    document.querySelectorAll('.petal-finale').forEach((el) => {
      el.getAnimations({ subtree: true }).forEach((animation) => {
        if (e.target.checked) animation.pause();
        else animation.play();
      });
    });
  });

  // ----- Interactive Flower Pop Particles -----
  document.addEventListener('click', (e) => {
    // Only spawn particles if clicking generally on the background, 
    // avoiding clicks on interactive elements like buttons or the nav
    if (e.target.closest('button, a, input, label, summary, .petal-dock, .nav-pill-container, .server-card')) {
      return;
    }

    const numParticles = Math.floor(Math.random() * 3) + 3; // 3 to 5 particles

    for (let i = 0; i < numParticles; i++) {
      // little blossoms, the same petal art as the falling ones
      const particle = document.createElement('div');
      particle.className = 'flower-particle';
      particle.setAttribute('aria-hidden', 'true');

      // Random spread direction
      const angle = Math.random() * Math.PI * 2;
      const velocity = 30 + Math.random() * 50;
      const tx = Math.cos(angle) * velocity + 'px';
      const ty = Math.sin(angle) * velocity + 'px';
      const rot = (Math.random() * 360 - 180) + 'deg';

      particle.style.left = e.clientX + window.scrollX + 'px';
      particle.style.top = e.clientY + window.scrollY + 'px';
      particle.style.setProperty('--tx', tx);
      particle.style.setProperty('--ty', ty);
      particle.style.setProperty('--rot', rot);

      document.body.appendChild(particle);

      // Clean up particle
      setTimeout(() => {
        particle.remove();
      }, 800);
    }
  });

});
