// --- GLOBAL ATTACK MAP MONITOR MODULE ---

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('attack-map-canvas');
  const feed = document.getElementById('attack-log-feed');
  if (!canvas || !feed) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = canvas.offsetWidth;
  let height = canvas.height = canvas.offsetHeight;

  // Major digital nodes across the world grid
  const nodes = [
    { name: 'BHOPAL_SEC_NODE (Bhushan)', x: 0.68, y: 0.52, isTarget: true },
    { name: 'US_EAST_PROBE_7', x: 0.28, y: 0.35, isTarget: false },
    { name: 'UK_PROXY_SERVER', x: 0.48, y: 0.30, isTarget: false },
    { name: 'JP_TOKYO_GATEWAY', x: 0.85, y: 0.40, isTarget: false },
    { name: 'DE_FRANKFURT_EXIT', x: 0.52, y: 0.32, isTarget: false },
    { name: 'AU_SYDNEY_RELAY', x: 0.88, y: 0.78, isTarget: false },
    { name: 'RU_MOSCOW_IP_SPOOF', x: 0.65, y: 0.26, isTarget: false },
    { name: 'BR_SAO_PAULO_VPN', x: 0.38, y: 0.72, isTarget: false },
    { name: 'CN_BEIJING_BOTNET', x: 0.78, y: 0.38, isTarget: false },
    { name: 'ZA_CAPE_TOWN_NODE', x: 0.55, y: 0.80, isTarget: false }
  ];

  // Attack logs configuration data
  const attackTypes = [
    { type: 'SSH Brute Force Attack', severity: 'HIGH', action: 'BLOCK_SSH_GATE' },
    { type: 'SQL-Injection Payload Probe', severity: 'MEDIUM', action: 'SANITIZE_DB_INPUT' },
    { type: 'OSINT Subdomain Recon Scan', severity: 'LOW', action: 'ALERT_ADMIN' },
    { type: 'DNS Hijacking Injection Probe', severity: 'HIGH', action: 'BLOCK_DNS_REQUEST' },
    { type: 'Port Sweep reconnaissance', severity: 'LOW', action: 'LOG_IP_BLOCK' },
    { type: 'Zero-Day Buffer Overflow Exploit', severity: 'CRITICAL', action: 'OVERLOAD_INTRUSION_SHIELD' }
  ];

  const activeAttacks = [];
  const impactPulses = [];

  // Log feed population utility
  function appendAttackLog(origin, type, severity, action) {
    const timestamp = new Date().toLocaleTimeString();
    const logItem = document.createElement('div');
    
    let colorClass = 'text-cyber-accent';
    if (severity === 'HIGH') colorClass = 'text-cyber-purple';
    if (severity === 'CRITICAL') colorClass = 'text-cyber-pink animate-pulse';

    logItem.className = 'border-b border-cyber-border/20 pb-1.5 leading-relaxed';
    logItem.innerHTML = `
      <span class="text-slate-500">[${timestamp}]</span> 
      <span class="text-cyber-pink font-semibold">[!] INTRUSION:</span> 
      <span class="${colorClass}">${type}</span><br>
      <span class="pl-4 text-slate-400">SRC: ${origin} -> Bhopal Node</span><br>
      <span class="pl-4 text-green-400 font-mono">[FW_RULE]: ${action} [OK]</span>
    `;

    feed.appendChild(logItem);
    feed.scrollTop = feed.scrollHeight;

    // Prune excessive logs
    while (feed.childNodes.length > 25) {
      feed.removeChild(feed.firstChild);
    }
  }

  // Draw cyber digital coordinate background dots
  function drawBackgroundGrid() {
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.03)';
    ctx.lineWidth = 1;
    
    // Draw crosshair grid
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Grid dots
    ctx.fillStyle = 'rgba(0, 245, 255, 0.08)';
    for (let x = 20; x < width; x += 30) {
      for (let y = 20; y < height; y += 30) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // Draw node locations on canvas
  function drawNodes(time) {
    nodes.forEach(node => {
      const nx = node.x * width;
      const ny = node.y * height;

      // Pulse circle
      const pulseRadius = 6 + Math.sin(time * 5 + (node.isTarget ? 2 : 0)) * 3;
      
      ctx.beginPath();
      ctx.arc(nx, ny, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = node.isTarget ? 'rgba(0, 245, 255, 0.15)' : 'rgba(138, 43, 226, 0.15)';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = node.isTarget ? '#00F5FF' : '#8A2BE2';
      ctx.stroke();

      // Core dot
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = node.isTarget ? '#00FFFF' : '#bd00ff';
      ctx.fill();

      // Text labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '8px monospace';
      ctx.fillText(node.name, nx + 8, ny + 3);
    });
  }

  // Generate attack vector line (Bezier arc)
  function createAttack() {
    // Select random attacker origin
    const originCandidates = nodes.filter(n => !n.isTarget);
    const originNode = originCandidates[Math.floor(Math.random() * originCandidates.length)];
    const targetNode = nodes.find(n => n.isTarget);

    const startX = originNode.x * width;
    const startY = originNode.y * height;
    const endX = targetNode.x * width;
    const endY = targetNode.y * height;

    // Midpoint control for Bezier curve (bow upward/downward randomly)
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2 - 80 - Math.random() * 50;

    const attackInfo = attackTypes[Math.floor(Math.random() * attackTypes.length)];

    activeAttacks.push({
      startX, startY,
      midX, midY,
      endX, endY,
      progress: 0,
      speed: 0.012 + Math.random() * 0.008,
      color: attackInfo.severity === 'CRITICAL' ? '#FF007F' : (attackInfo.severity === 'HIGH' ? '#8A2BE2' : '#00FFFF'),
      originName: originNode.name,
      ...attackInfo
    });
  }

  // Draw active vector arcs and moving lasers
  function drawAttacks() {
    for (let i = activeAttacks.length - 1; i >= 0; i--) {
      const attack = activeAttacks[i];
      attack.progress += attack.speed;

      // Draw arc line
      ctx.beginPath();
      ctx.moveTo(attack.startX, attack.startY);
      ctx.quadraticCurveTo(attack.midX, attack.midY, attack.endX, attack.endY);
      ctx.strokeStyle = attack.color + '22'; // Faint line
      ctx.lineWidth = 1;
      ctx.stroke();

      // Calculate particle position on Bezier curve (de Casteljau's algorithm)
      const t = attack.progress;
      const u = 1 - t;
      const px = u * u * attack.startX + 2 * u * t * attack.midX + t * t * attack.endX;
      const py = u * u * attack.startY + 2 * u * t * attack.midY + t * t * attack.endY;

      // Draw moving particle
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = attack.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = attack.color;
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow

      // Attack complete (collides at target)
      if (attack.progress >= 1) {
        impactPulses.push({
          x: attack.endX,
          y: attack.endY,
          radius: 2,
          maxRadius: 24,
          opacity: 1,
          color: attack.color
        });

        // Trigger log print
        appendAttackLog(attack.originName, attack.type, attack.severity, attack.action);
        
        // Play brief defense collision blip sound
        if (window.playBeep && window.isAudioEnabled) {
          window.playBeep(1400, 0.05, 'triangle');
        }

        activeAttacks.splice(i, 1);
      }
    }
  }

  // Draw collision pulses at destination
  function drawImpacts() {
    for (let i = impactPulses.length - 1; i >= 0; i--) {
      const pulse = impactPulses[i];
      pulse.radius += 1.2;
      pulse.opacity -= 0.04;

      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
      ctx.strokeStyle = pulse.color + Math.floor(pulse.opacity * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (pulse.opacity <= 0) {
        impactPulses.splice(i, 1);
      }
    }
  }

  // Animation Loop
  let lastTime = 0;
  function render(time) {
    requestAnimationFrame(render);
    ctx.clearRect(0, 0, width, height);

    drawBackgroundGrid();
    drawAttacks();
    drawImpacts();
    drawNodes(time * 0.001);

    // Periodically spawn attacks
    if (time - lastTime > 2400) {
      createAttack();
      lastTime = time;
    }
  }
  requestAnimationFrame(render);

  // Resize handler
  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });

  // Spawn initial attacks & logs
  for (let i = 0; i < 4; i++) {
    createAttack();
  }
});
