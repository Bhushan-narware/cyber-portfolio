// --- GLOBAL STATES & CONSTANTS ---
let audioCtx = null;
let ambientOsc = null;
let ambientLfo = null;
let isAudioEnabled = false;
let isMatrixEnabled = false;
let terminalLogHistory = [];

// --- UTILITY SOUND SYNTHESIZER (Web Audio API) ---
function initAudio() {
  if (audioCtx) return;
  // Create audio context
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContextClass();
}

function playBeep(freq = 800, duration = 0.08, type = 'sine') {
  if (!isAudioEnabled) return;
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  // Exponential decay envelope
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playExploitSound() {
  if (!isAudioEnabled) return;
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  const duration = 1.2;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, now);
  // Sweep frequency up and down dramatically
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.8);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 1.2);
  
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.linearRampToValueAtTime(0.1, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(now + duration);
}

function startAmbientDrone() {
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const now = audioCtx.currentTime;
  
  // Drone oscillator
  ambientOsc = audioCtx.createOscillator();
  const droneGain = audioCtx.createGain();
  
  ambientOsc.type = 'triangle';
  ambientOsc.frequency.setValueAtTime(55, now); // Low A hum
  
  // LFO to modulate volume/filter for a space-age engine throb
  ambientLfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  
  ambientLfo.frequency.setValueAtTime(0.2, now); // 0.2Hz throb
  lfoGain.gain.setValueAtTime(0.02, now);
  
  ambientLfo.connect(lfoGain);
  lfoGain.connect(droneGain.gain); // modulate gain
  
  droneGain.gain.setValueAtTime(0.03, now); // Quiet background hum
  
  ambientOsc.connect(droneGain);
  droneGain.connect(audioCtx.destination);
  
  ambientOsc.start();
  ambientLfo.start();
}

function stopAmbientDrone() {
  if (ambientOsc) {
    try { ambientOsc.stop(); } catch(e) {}
    ambientOsc = null;
  }
  if (ambientLfo) {
    try { ambientLfo.stop(); } catch(e) {}
    ambientLfo = null;
  }
}

// --- INTERACTIVE CUSTOM CURSOR & HOVER GLOWS ---
function initCustomCursor() {
  const cursor = document.getElementById('cyber-cursor');
  const trail = document.getElementById('cursor-trail');
  
  if (!cursor || !trail) return;
  
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let trailX = 0, trailY = 0;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Position trail with minimum delay
    trail.style.left = mouseX + 'px';
    trail.style.top = mouseY + 'px';
  });

  // Smooth out main cursor movements (Lerp)
  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Highlight expanders
  const clickables = document.querySelectorAll('a, button, select, input, textarea, .skill-container, .launch-sim-btn, .hover-tilt');
  clickables.forEach(item => {
    item.addEventListener('mouseenter', () => {
      cursor.classList.add('expand');
      playBeep(900, 0.04, 'triangle');
    });
    item.addEventListener('mouseleave', () => {
      cursor.classList.remove('expand');
    });
    item.addEventListener('click', () => {
      playBeep(1200, 0.08, 'sine');
    });
  });
}

// --- THREE.JS BACKGROUND: CONNECTED NODE GRID ---
function initThreeBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  // Adjust camera to fit wide scenes
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle properties
  const particleCount = 180;
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 200;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    color: 0x0066ff,
    size: 1.5,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);

  // Line connections between particle system
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x0033cc,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
  });

  let lineSegments;
  
  function updateConnections() {
    if (lineSegments) scene.remove(lineSegments);
    
    const coords = particleSystem.geometry.attributes.position.array;
    const linePositions = [];
    const maxDist = 28;
    
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = coords[i * 3] - coords[j * 3];
        const dy = coords[i * 3 + 1] - coords[j * 3 + 1];
        const dz = coords[i * 3 + 2] - coords[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < maxDist) {
          linePositions.push(coords[i * 3], coords[i * 3 + 1], coords[i * 3 + 2]);
          linePositions.push(coords[j * 3], coords[j * 3 + 1], coords[j * 3 + 2]);
        }
      }
    }
    
    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineSegments = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(lineSegments);
  }

  // Animation Loop
  let clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Slow rotational glide
    particleSystem.rotation.y = elapsedTime * 0.03;
    particleSystem.rotation.x = elapsedTime * 0.01;
    
    // Wave motion of particles simulating anti-gravity drift
    const coords = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      coords[i * 3 + 1] += Math.sin(elapsedTime + coords[i * 3]) * 0.02; // float Y
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    
    updateConnections();
    renderer.render(scene, camera);
  }
  
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// --- THREE.JS HERO CANVAS: HOLOGRAPHIC DIGITAL CORE ---
function initHero3DScene() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 12;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Hologram core sphere
  const sphereGeo = new THREE.SphereGeometry(2, 32, 32);
  const sphereMat = new THREE.PointsMaterial({
    color: 0x0066ff,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const coreSphere = new THREE.Points(sphereGeo, sphereMat);
  scene.add(coreSphere);

  // Outer orbital rings
  const ring1Geo = new THREE.TorusGeometry(3, 0.02, 8, 64);
  const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x0033cc, transparent: true, opacity: 0.4 });
  const orbitRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
  orbitRing1.rotation.x = Math.PI / 3;
  scene.add(orbitRing1);

  const ring2Geo = new THREE.TorusGeometry(3.6, 0.015, 8, 64);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x0066ff, transparent: true, opacity: 0.3 });
  const orbitRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
  orbitRing2.rotation.y = Math.PI / 4;
  scene.add(orbitRing2);

  // Hexagons orbiting inside (Using low-segment shapes)
  const hexGroup = new THREE.Group();
  scene.add(hexGroup);
  
  const hexGeo = new THREE.RingGeometry(0.15, 0.2, 6);
  const hexMat = new THREE.MeshBasicMaterial({ color: 0x00a8ff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
  
  const hexCount = 12;
  const hexagons = [];
  
  for (let i = 0; i < hexCount; i++) {
    const hex = new THREE.Mesh(hexGeo, hexMat);
    
    // Distribute around core
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const radius = 2.4 + Math.random() * 0.8;
    
    hex.position.x = radius * Math.sin(phi) * Math.cos(theta);
    hex.position.y = radius * Math.sin(phi) * Math.sin(theta);
    hex.position.z = radius * Math.cos(phi);
    
    hex.lookAt(0, 0, 0);
    hexGroup.add(hex);
    
    hexagons.push({
      mesh: hex,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01),
      basePos: hex.position.clone(),
      phase: Math.random() * 100
    });
  }

  // Lighting
  const light = new THREE.PointLight(0x0066ff, 2, 50);
  light.position.set(0, 0, 5);
  scene.add(light);

  // Mouse drag rotation setup
  let isDragging = false;
  let prevMouseX = 0, prevMouseY = 0;
  
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });
  
  window.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    
    coreSphere.rotation.y += deltaX * 0.007;
    coreSphere.rotation.x += deltaY * 0.007;
    
    hexGroup.rotation.y += deltaX * 0.005;
    hexGroup.rotation.x += deltaY * 0.005;
    
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  // Animation Loop
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    // Core spin
    if (!isDragging) {
      coreSphere.rotation.y += 0.005;
      coreSphere.rotation.x += 0.002;
      hexGroup.rotation.y -= 0.003;
    }
    
    // Orbit rings spin
    orbitRing1.rotation.z += 0.004;
    orbitRing2.rotation.z -= 0.006;
    
    // Floating hex nodes
    hexagons.forEach(item => {
      item.mesh.position.x = item.basePos.x + Math.sin(time * 0.8 + item.phase) * 0.15;
      item.mesh.position.y = item.basePos.y + Math.cos(time * 0.6 + item.phase) * 0.15;
      item.mesh.position.z = item.basePos.z + Math.sin(time * 0.5 + item.phase) * 0.15;
      item.mesh.rotation.z += 0.01;
    });
    
    renderer.render(scene, camera);
  }
  animate();

  // Resize canvas wrapper
  window.addEventListener('resize', () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

// --- MATRIX RAIN BACKGROUND EFFECT ---
function initMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  
  const katakana = '01BINARYXPORTSVULNSHIELD010101';
  const alphabet = katakana.split('');
  
  const fontSize = 14;
  const columns = width / fontSize;
  
  const rainDrops = [];
  for (let x = 0; x < columns; x++) {
    rainDrops[x] = 1;
  }
  
  function draw() {
    if (!isMatrixEnabled) return;
    
    ctx.fillStyle = 'rgba(5, 5, 8, 0.06)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#0066ff';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < rainDrops.length; i++) {
      const text = alphabet[Math.floor(Math.random() * alphabet.length)];
      ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
      
      if (rainDrops[i] * fontSize > height && Math.random() > 0.975) {
        rainDrops[i] = 0;
      }
      rainDrops[i]++;
    }
  }
  
  setInterval(draw, 30);
  
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

// --- HERO SECTION TYPING SUBTITLE ---
function initTypingSubtitle() {
  const target = document.getElementById('typing-subtitle');
  if (!target) return;
  
  const sentences = [
    "Cyber Security Researcher",
    "Ethical Hacker",
    "Python Developer",
    "AI Developer",
    "Full Stack Developer"
  ];
  
  let i = 0;
  let timer;

  function typeWriter(text, i, cb) {
    if (i < text.length) {
      target.textContent += text.charAt(i);
      // Play brief typing clicking sound
      if (Math.random() > 0.4) {
        playBeep(1200 + Math.random() * 200, 0.02, 'triangle');
      }
      timer = setTimeout(function() {
        typeWriter(text, i + 1, cb);
      }, 70 + Math.random() * 30);
    } else {
      setTimeout(cb, 1800); // Wait before clearing
    }
  }

  function deleteWriter(text, i, cb) {
    if (i >= 0) {
      target.textContent = text.substring(0, i);
      timer = setTimeout(function() {
        deleteWriter(text, i - 1, cb);
      }, 35);
    } else {
      setTimeout(cb, 500); // Wait before next sentence
    }
  }

  let index = 0;
  function startLoop() {
    typeWriter(sentences[index], 0, function() {
      deleteWriter(sentences[index], sentences[index].length, function() {
        index = (index + 1) % sentences.length;
        startLoop();
      });
    });
  }
  
  startLoop();
}

// --- INTERACTIVE TERMINAL HUD LOGIC ---
const terminalCommands = {
  'help': () => {
    return [
      "BHUSHAN_SEC LINUX GRID SHELL - HELP DIRECTORY",
      "==================================================",
      "about        - Query Bhushan's profile biography data",
      "skills       - Scan active technology metrics matrix",
      "experience   - Show detailed work mission log records",
      "projects     - List secure programs and portfolio modules",
      "nmap         - Scan this systems ports for diagnostic data",
      "vulnscan     - Scan cybersecurity matrix endpoints",
      "exploit      - Launch payload execution sweep simulation",
      "matrix       - Toggle the background code matrix overlay",
      "darkweb      - Boot the integrated interactive Onion Portal sandbox",
      "clear        - Wipe the terminal output buffer"
    ];
  },
  'about': () => {
    return [
      "[FILE ACCESS GRANTED]: Profile bio metrics",
      "--------------------------------------------------",
      "Identity: Bhushan Narware",
      "Focus Area: Offensive and Defensive Cybersecurity",
      "Mission Goal: Bridge complex technical penetration testing",
      "with overarching enterprise defensive guidelines.",
      "Status: Eager to join offensive security labs."
    ];
  },
  'skills': () => {
    return [
      "[ACTIVE PROBE]: Target skill metrics loaded",
      "--------------------------------------------------",
      "* Python Scripting & Automation:  [90% OK]",
      "* Burp Suite / Nmap Scanning:     [88% OK]",
      "* Metasploit & Wireshark Labs:    [80% OK]",
      "* Kali Linux Frameworks:          [92% OK]",
      "* Web Security / OWASP Top 10:    [85% OK]",
      "* OSINT target reconnaissance:    [90% OK]"
    ];
  },
  'experience': () => {
    return [
      "[LOG DECRYPTED]: Mission logs directory",
      "--------------------------------------------------",
      "* Cybrom Technology (Cybersec Intern) [10/2025 - 04/2026]",
      "  - Audited web applications using OWASP Top 10",
      "  - Logged network recon utilizing Nmap and Kali Linux",
      "* Naman Digital (Cybersec Intern) [06/2025 - 08/2025]",
      "  - Checked MSME network config loop-holes",
      "* Codsoft (Python Intern) [09/2025 - 09/2025]",
      "  - Built automation script arrays in Python"
    ];
  },
  'projects': () => {
    return [
      "[STORAGE BLOCK]: Active program repository",
      "--------------------------------------------------",
      "1. DarknetEye       - OSINT footprints automation framework",
      "2. PassGenX         - Password entropy generator utility",
      "3. IPTracker        - Remote geolocation reconnaissance tracker",
      "4. Local AI Host    - Llama.cpp Qwen3 (8B) model implementation",
      "5. Dark Web Sim     - Simulated Tor browser and hacking game environment"
    ];
  },
  'nmap': () => {
    playBeep(440, 0.25, 'sine');
    return [
      "Starting Nmap 7.94 ( https://nmap.org ) at 2026-06-30",
      "Nmap scan report for portfolio.bhushan.sec (127.0.0.1)",
      "Host is up (0.000084s latency).",
      "Not shown: 994 closed tcp ports (reset)",
      "PORT     STATE SERVICE",
      "22/tcp   open  ssh (Vulnerability Scan: SECURE)",
      "80/tcp   open  http (Nginx Web Server)",
      "443/tcp  open  https (SSL Cert: VALID)",
      "1337/tcp open  cyber-hud-daemon",
      "3000/tcp open  vite-dev-client",
      "8080/tcp open  llama-cpp-server",
      "",
      "Nmap done: 1 IP address scanned (5 hosts up) -- Scan Complete."
    ];
  },
  'vulnscan': () => {
    playBeep(600, 0.15, 'sawtooth');
    return [
      "[!] AUDITING SECURITY ENDPOINTS...",
      "[-] Scanning portfolio components...",
      "[-] Web forms integrity: OK (glitch proof configuration)",
      "[-] Three.js anti-gravity fields: STABLE",
      "[-] Custom audio synthesizers: ONLINE",
      "[-] Total vulnerabilities identified: 0",
      "[+] Integrity level remains at 99.87%"
    ];
  },
  'exploit': () => {
    playExploitSound();
    return [
      "[!] INITIATING PAYLOAD HANDSHAKE SIMULATION...",
      "[+] Allocating virtual memory nodes... done.",
      "[+] Injecting secure shellcode bypass...",
      "[*] Reverse socket connected to 127.0.0.1:4444",
      "[-] Remote terminal command shell initialized.",
      "[-] visitor@bhushan_target:~$ whoami",
      "[-] bhushan_admin (SUCCESS // SECTOR COMPROMISED)"
    ];
  },
  'matrix': () => {
    document.getElementById('toggle-matrix').click();
    return ["Matrix rain background mode toggled."];
  },
  'darkweb': () => {
    setTimeout(() => {
      const btn = document.getElementById('open-darkweb-portal-btn');
      if (btn) btn.click();
    }, 250);
    return [
      "[+] Initiating secure Tor gateway proxy...",
      "[+] Bypassing exit nodes... encryption: AES-256",
      "[+] Loading interactive Shadownet Onion Portal v3.14..."
    ];
  }
};

function initTerminalConsole() {
  const panel = document.getElementById('terminal-popup');
  const input = document.getElementById('terminal-input');
  const feed = document.getElementById('terminal-feed');
  const triggerBtn = document.getElementById('toggle-terminal');
  const closeBtn = document.getElementById('minimize-terminal');
  const clearBtn = document.getElementById('clear-terminal');

  if (!panel || !input || !feed) return;

  // Toggle terminal
  triggerBtn.addEventListener('click', () => {
    panel.classList.toggle('translate-y-full');
    if (!panel.classList.contains('translate-y-full')) {
      input.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.add('translate-y-full');
  });

  clearBtn.addEventListener('click', () => {
    feed.innerHTML = '<div>Buffer cleared. Security grid standby.</div>';
  });

  // Handle command input
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const rawVal = input.value.trim();
      input.value = '';
      
      if (!rawVal) return;

      // Print prompt (preserving original casing in logs)
      const line = document.createElement('div');
      line.className = 'text-slate-300';
      line.textContent = `visitor@bhushan_sec:~$ ${rawVal}`;
      feed.appendChild(line);

      const args = rawVal.split(' ');
      const cmdName = args[0].toLowerCase();

      // Handle command
      if (cmdName === 'clear') {
        feed.innerHTML = '<div>Terminal wiped. Standby.</div>';
        return;
      }
      
      const cmd = terminalCommands[cmdName];
      if (cmd) {
        const response = cmd(args);
        response.forEach(txt => {
          const respLine = document.createElement('div');
          respLine.textContent = txt;
          feed.appendChild(respLine);
        });
      } else {
        const errLine = document.createElement('div');
        errLine.className = 'text-cyber-pink';
        errLine.textContent = `bash: command not found: ${cmdName}. Type 'help' for systems checklist.`;
        feed.appendChild(errLine);
      }

      // Scroll to bottom
      feed.scrollTop = feed.scrollHeight;
    }
  });
}

// --- PROJECT SIMULATOR TRIGGERS ---
function initProjectSimulators() {
  const buttons = document.querySelectorAll('.launch-sim-btn');
  const terminalPanel = document.getElementById('terminal-popup');
  const feed = document.getElementById('terminal-feed');
  const input = document.getElementById('terminal-input');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const proj = btn.getAttribute('data-project');
      
      // Open terminal if minimized
      terminalPanel.classList.remove('translate-y-full');
      
      // Play exploit hack sound
      playExploitSound();

      // Print executing simulator line
      const loadingLine = document.createElement('div');
      loadingLine.className = 'text-cyber-accent font-bold mt-4';
      loadingLine.textContent = `[LOCAL_EXEC] visitor@bhushan_sec:~$ python simulate_proj.py --type ${proj}`;
      feed.appendChild(loadingLine);

      // Simulated logging scripts
      let logs = [];
      if (proj === 'passgenx') {
        logs = [
          "[+] Initializing PassGenX secure generation kernel...",
          "[*] Parameters: length=16, complexity=maximum, include_symbols=true",
          "[*] Computing cryptographic system entropy value...",
          "[+] Successfully generated password hash:",
          "    -> e$R8#mK9!2wQp&5xZ (Entropy Strength: 128 bits - EXTREME)",
          "[+] Credentials matrix protected."
        ];
      } else if (proj === 'vishai') {
        logs = [
          "[+] Connecting to VishAI cognitive pipeline...",
          "[*] Loading dynamic LLM model vectors...",
          "[-] System prompt check: OPERATOR=Bhushan",
          "[-] Decrypted query response: 'Welcome back. Hacking division status is green. All nodes secure.'",
          "[+] VishAI connection closed."
        ];
      } else if (proj === 'portfolio') {
        logs = [
          "[+] Syncing portfolio code status...",
          "[*] Loading Vite configurations and asset pipelines...",
          "[*] Processing asset files (main.js, index.html, style.css)...",
          "[-] All files compiled. Server listening on localhost:5173",
          "[+] Deployment completed successfully."
        ];
      } else if (proj === 'bugbounty') {
        logs = [
          "[+] Launching Bug Bounty automated scanner...",
          "[*] Subdomain discovery module active...",
          "[-] Fuzzing target directories for hidden paths...",
          "[-] 200 OK: /admin-panel, /config.json (EXPOSED)",
          "[+] Bug Bounty vulnerability reports generated."
        ];
      } else if (proj === 'netscanner') {
        logs = [
          "[+] Initializing Scapy ARP-ping network scan...",
          "[*] Scanning subnet 192.168.1.0/24...",
          "[-] Target found: 192.168.1.105 (MAC: 00:0C:29:XX:XX:XX)",
          "[-] Grabbed banner on port 80: Apache/2.4.41 (Ubuntu)",
          "[+] NetScanner scan complete."
        ];
      } else if (proj === 'passmanager') {
        logs = [
          "[+] Opening SQLite password database vault...",
          "[*] Verification: AES-256 cipher blocks checking master key...",
          "[-] Validation success: credentials authenticated.",
          "[-] Decrypted passwords: [Github: *******], [Google: *******]",
          "[+] Password Manager session encrypted and locked."
        ];
      } else if (proj === 'socdash') {
        logs = [
          "[+] Streaming live security alert feeds...",
          "[*] Alert triggered: Multiple failed SSH attempts from 185.220.101.4",
          "[-] Blocking suspect host IP via iptables firewall rules...",
          "[-] Connection closed. Status: DEFENDED",
          "[+] SOC system logs updated."
        ];
      } else if (proj === 'threatintel') {
        logs = [
          "[+] Querying Threat Intel API feed...",
          "[*] Downloading latest malware hash patterns (MD5/SHA256)...",
          "[-] Identified threat: Ransomware.LockBit.v3 hash detected",
          "[-] Mapped 14 command-and-control server IPs to blacklists",
          "[+] Threat Intelligence Platform update finalized."
        ];
      }

      // Append lines with dynamic delay simulation
      let logIndex = 0;
      function printLog() {
        if (logIndex < logs.length) {
          const l = document.createElement('div');
          l.textContent = logs[logIndex];
          feed.appendChild(l);
          feed.scrollTop = feed.scrollHeight;
          logIndex++;
          setTimeout(printLog, 120);
        }
      }
      
      setTimeout(printLog, 100);
      input.focus();
    });
  });
}

// --- AI DIGITAL CHATBOT COGNITIVE LOGIC ---
const aiResponses = {
  'skills': () => {
    return "Bhushan's security skills span offensive security (Burp Suite, Nmap, Metasploit, Wireshark, SQLMap, John the Ripper, Gobuster), developer skills (Python, JavaScript/TypeScript, React/Next.js, FastAPI, Node.js), databases (MySQL, Postgres, MongoDB), and local AI deployment. He holds a Certified Ethical Hacker (CEH) license.";
  },
  'vishai': () => {
    return "VishAI is a cognitive AI chatbot interface that integrates dynamic local contextual configurations to provide expert systems security suggestions.";
  },
  'passgenx': () => {
    return "PassGenX is a secure, highly-customizable desktop password utility that generates credentials with maximum entropy parameters to eliminate weak passwords.";
  },
  'portfolio': () => {
    return "This cyber portfolio is a high-fidelity Single Page Application built using Vanilla JS, Vite, Tailwind CSS, GSAP, and Three.js.";
  },
  'bugbounty': () => {
    return "The Bug Bounty Toolkit is a set of automation scripts fuzzer pipelines designed for rapid subdomain discovery and port mapping.";
  },
  'netscanner': () => {
    return "Network Scanner is an ARP-request network mapper that scans host IP blocks, grabs port banners, and maps target subnets.";
  },
  'passmanager': () => {
    return "Password Manager is a local master-key encrypted vault using AES-256 cipher blocks in SQLite database layers.";
  },
  'socdash': () => {
    return "SOC Dashboard represents a SIEM alert monitoring station that streams firewall block actions and incident reports.";
  },
  'threatintel': () => {
    return "Threat Intelligence Platform aggregates Indicators of Compromise (IoCs) via open APIs and maps malware hash threats.";
  },
  'contact': () => {
    return "You can reach Bhushan Narware immediately via bhushannarware0911@gmail.com, or check his LinkedIn profile at linkedin.com/in/Bhushan_narware.";
  },
  'hire': () => {
    return "Bhushan is currently seeking cybersecurity roles (internships or junior associate positions) in Red Teaming, Vulnerability Assessment, and Penetration Testing.";
  },
  'about': () => {
    return "Bhushan Narware is a Computer Science graduate, Certified Ethical Hacker (CEH v12), and active cybersecurity researcher who enjoys finding vulnerabilities and designing python tools.";
  }
};

function initAIChatAssistant() {
  const toggle = document.getElementById('ai-assistant-toggle');
  const panel = document.getElementById('ai-chat-panel');
  const feed = document.getElementById('ai-chat-feed');
  const input = document.getElementById('ai-chat-input');
  const send = document.getElementById('send-ai-chat');
  const close = document.getElementById('close-ai-chat');
  const suggestButtons = document.querySelectorAll('.ai-suggestion-btn');

  if (!toggle || !panel || !feed || !input) return;

  toggle.addEventListener('click', () => {
    panel.classList.toggle('hidden');
    input.focus();
  });

  close.addEventListener('click', () => {
    panel.classList.add('hidden');
  });

  // Handle message send
  function sendMessage(text) {
    if (!text.trim()) return;

    // Play button synth beep
    playBeep(700, 0.05, 'triangle');

    // Add User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'flex items-start space-x-2 justify-end';
    userBubble.innerHTML = `
      <p class="leading-relaxed bg-cyber-purple/20 p-2 rounded border border-cyber-purple/40 text-slate-200">${text}</p>
      <span class="text-cyber-accent font-bold">[USER]:</span>
    `;
    feed.appendChild(userBubble);
    feed.scrollTop = feed.scrollHeight;

    // AI typing response simulation
    setTimeout(() => {
      const cleaned = text.trim().toLowerCase();
      let reply = "I do not recognize that query option. Please query [SEC_SKILLS], [DARKNETEYE_RECON], [GET_IN_TOUCH], or ask about his experience.";
      
      if (cleaned.includes('skill') || cleaned.includes('sec_skills') || cleaned.includes('tech')) {
        reply = aiResponses['skills']();
      } else if (cleaned.includes('darkneteye') || cleaned.includes('recon')) {
        reply = aiResponses['darkneteye']();
      } else if (cleaned.includes('passgen') || cleaned.includes('entropy')) {
        reply = aiResponses['passgenx']();
      } else if (cleaned.includes('iptracker') || cleaned.includes('geo')) {
        reply = aiResponses['iptracker']();
      } else if (cleaned.includes('contact') || cleaned.includes('touch') || cleaned.includes('email') || cleaned.includes('relay')) {
        reply = aiResponses['contact']();
      } else if (cleaned.includes('hire') || cleaned.includes('job') || cleaned.includes('open')) {
        reply = aiResponses['hire']();
      } else if (cleaned.includes('about') || cleaned.includes('who') || cleaned.includes('bio')) {
        reply = aiResponses['about']();
      }

      // Add AI Bubble
      const aiBubble = document.createElement('div');
      aiBubble.className = 'flex items-start space-x-2';
      aiBubble.innerHTML = `
        <span class="text-cyber-purple font-bold">[AI]:</span>
        <p class="leading-relaxed bg-cyber-light/40 p-2 rounded border border-cyber-border/40 text-slate-300"></p>
      `;
      feed.appendChild(aiBubble);
      
      const p = aiBubble.querySelector('p');
      let charIndex = 0;
      
      function typeChar() {
        if (charIndex < reply.length) {
          p.textContent += reply.charAt(charIndex);
          charIndex++;
          if (Math.random() > 0.6) {
            playBeep(1400, 0.015, 'sine');
          }
          setTimeout(typeChar, 25);
          feed.scrollTop = feed.scrollHeight;
        }
      }
      typeChar();
    }, 600);
  }

  send.addEventListener('click', () => {
    const txt = input.value;
    input.value = '';
    sendMessage(txt);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const txt = input.value;
      input.value = '';
      sendMessage(txt);
    }
  });

  // Suggestion click binds
  suggestButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const commandText = btn.textContent.replace('[', '').replace(']', '');
      sendMessage(commandText);
    });
  });
}

// --- SECURE CONTACT FORM LOGIC ---
function initContactForm() {
  const form = document.getElementById('cyber-contact-form');
  const feedback = document.getElementById('contact-form-feedback');

  if (!form || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Play sound on submission
    playBeep(900, 0.1, 'sine');
    setTimeout(() => {
      playBeep(1200, 0.15, 'sine');
    }, 120);

    feedback.classList.remove('hidden');
    feedback.textContent = '[SYSTEM]: Transmitting secure contact data blocks...';
    
    setTimeout(() => {
      feedback.className = 'mt-4 p-4 rounded bg-cyber-black/80 border border-dashed border-green-500/40 font-mono text-[10px] text-green-400';
      feedback.textContent = '[SYSTEM SUCCESS]: Handshake established. Relayed contact packet to Bhushan\'s primary memory core.';
      form.reset();
    }, 1800);
  });
}

// --- GSAP SCROLL TRIGGERS & HUD CONTROLS ---
function initGSAPAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Animate skill bars as they enter viewport
  const skillBars = document.querySelectorAll('.skill-bar');
  skillBars.forEach(bar => {
    const targetWidth = bar.getAttribute('data-width');
    gsap.to(bar, {
      width: targetWidth,
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: bar,
        start: "top 90%",
      }
    });
  });

  // Parallax floating scrolling effect for sections
  const parallaxItems = document.querySelectorAll('.scroll-reveal-item');
  parallaxItems.forEach(item => {
    gsap.from(item, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
      }
    });
  });

  // Academic cards slide in and float
  const eduCards = document.querySelectorAll('#education-hud .hover-tilt');
  gsap.from(eduCards, {
    scale: 0.9,
    opacity: 0,
    y: 40,
    stagger: 0.12,
    duration: 0.8,
    scrollTrigger: {
      trigger: '#education-hud',
      start: "top 80%",
    }
  });

  // Certifications slide in and float
  const certCards = document.querySelectorAll('#certifications .hover-tilt');
  gsap.from(certCards, {
    scale: 0.9,
    opacity: 0,
    y: 40,
    stagger: 0.12,
    duration: 0.8,
    scrollTrigger: {
      trigger: '#certifications',
      start: "top 80%",
    }
  });

  // Projects slide in
  const projectCards = document.querySelectorAll('#projects > div > div');
  gsap.from(projectCards, {
    opacity: 0,
    y: 50,
    stagger: 0.15,
    duration: 1,
    scrollTrigger: {
      trigger: '#projects',
      start: "top 80%",
    }
  });
}

// --- INTERACTIVE UI CONTROL TRIGGERS (Header panel) ---
function initHUDControls() {
  const toggleAudio = document.getElementById('toggle-audio');
  const audioIcon = document.getElementById('audio-icon');
  const audioVisualizer = document.getElementById('audio-visualizer');
  
  const toggleMatrixBtn = document.getElementById('toggle-matrix');
  const matrixCanvas = document.getElementById('matrix-canvas');
  
  const toggleTheme = document.getElementById('toggle-theme');
  const body = document.body;

  const toggleMobileMenu = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  const printResumeBtn = document.getElementById('download-resume-btn');

  const diagnosticTrigger = document.getElementById('trigger-vulnscan-hud');
  const probeDetails = document.getElementById('skills-probe-details');
  const probeDescription = document.getElementById('probe-description');

  // Ambient sound synth toggle
  toggleAudio.addEventListener('click', () => {
    isAudioEnabled = !isAudioEnabled;
    if (isAudioEnabled) {
      audioIcon.className = 'hidden';
      audioVisualizer.classList.remove('hidden');
      toggleAudio.classList.add('bg-cyber-purple/20', 'border-cyber-purple');
      startAmbientDrone();
      playBeep(880, 0.1, 'sine');
    } else {
      audioIcon.className = 'fa-solid fa-volume-xmark text-sm';
      audioVisualizer.classList.add('hidden');
      toggleAudio.classList.remove('bg-cyber-purple/20', 'border-cyber-purple');
      stopAmbientDrone();
    }
  });

  // Matrix rain overlay toggle
  toggleMatrixBtn.addEventListener('click', () => {
    isMatrixEnabled = !isMatrixEnabled;
    if (isMatrixEnabled) {
      matrixCanvas.classList.remove('opacity-0');
      matrixCanvas.classList.add('opacity-45');
      toggleMatrixBtn.classList.add('bg-cyber-cyan/20', 'border-cyber-cyan', 'text-cyber-cyan');
      playBeep(900, 0.08, 'triangle');
    } else {
      matrixCanvas.classList.add('opacity-0');
      matrixCanvas.classList.remove('opacity-45');
      toggleMatrixBtn.classList.remove('bg-cyber-cyan/20', 'border-cyber-cyan', 'text-cyber-cyan');
    }
  });

  // Dark/Light toggle
  toggleTheme.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    if (body.classList.contains('light-theme')) {
      toggleTheme.classList.add('bg-cyber-accent/20', 'border-cyber-accent');
    } else {
      toggleTheme.classList.remove('bg-cyber-accent/20', 'border-cyber-accent');
    }
    playBeep(800, 0.08, 'sine');
  });

  // Mobile menu toggle
  toggleMobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // Close mobile menu on link click
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });

  // Print Resume PDF (Clean print view)
  printResumeBtn.addEventListener('click', () => {
    playBeep(1200, 0.2, 'sine');
  });

  // Diagnostic Audit trigger
  diagnosticTrigger.addEventListener('click', () => {
    const terminalPanel = document.getElementById('terminal-popup');
    const feed = document.getElementById('terminal-feed');
    terminalPanel.classList.remove('translate-y-full');
    
    const lines = terminalCommands['nmap']();
    lines.forEach(txt => {
      const respLine = document.createElement('div');
      respLine.textContent = txt;
      feed.appendChild(respLine);
    });
    feed.scrollTop = feed.scrollHeight;
  });

  // Skill descriptions probe on click
  const skillContainers = document.querySelectorAll('.skill-container');
  skillContainers.forEach(container => {
    container.addEventListener('click', () => {
      const title = container.getAttribute('data-skill');
      const desc = container.getAttribute('data-desc');
      
      probeDetails.classList.remove('hidden');
      probeDescription.innerHTML = `<span class="text-cyber-accent font-bold">[${title.toUpperCase()}]:</span> ${desc}`;
    });
  });

  // Dark Web Simulator Modal Handlers
  const openDarkwebBtn = document.getElementById('open-darkweb-portal-btn');
  const closeDarkwebBtn = document.getElementById('close-darkweb-modal');
  const darkwebModal = document.getElementById('darkweb-modal');
  const darkwebIframe = document.getElementById('darkweb-iframe');
  const darkwebLoading = document.getElementById('darkweb-loading');

  if (openDarkwebBtn && closeDarkwebBtn && darkwebModal) {
    openDarkwebBtn.addEventListener('click', () => {
      playBeep(900, 0.1, 'triangle');
      
      darkwebLoading.classList.remove('hidden');
      darkwebIframe.src = 'dark-web-simulator/index.html';
      darkwebIframe.classList.add('opacity-0');
      darkwebIframe.classList.remove('opacity-100');
      
      darkwebModal.classList.remove('translate-y-full');
      
      darkwebIframe.onload = () => {
        darkwebLoading.classList.add('hidden');
        darkwebIframe.classList.remove('opacity-0');
        darkwebIframe.classList.add('opacity-100');
        
        if (isAudioEnabled) {
          playBeep(1200, 0.15, 'sine');
        }
      };
    });

    closeDarkwebBtn.addEventListener('click', () => {
      playBeep(700, 0.08, 'triangle');
      darkwebModal.classList.add('translate-y-full');
      darkwebIframe.src = '';
      darkwebIframe.classList.add('opacity-0');
      darkwebIframe.classList.remove('opacity-100');
    });
  }
}

// --- FPS COUNTER (HUD Stat) ---
function initFPSCounter() {
  const counter = document.getElementById('fps-counter');
  if (!counter) return;

  let lastTime = performance.now();
  let frameCount = 0;
  
  function tick() {
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastTime;
    
    if (elapsed >= 1000) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      counter.textContent = fps;
      frameCount = 0;
      lastTime = now;
    }
    requestAnimationFrame(tick);
  }
  tick();
}

// --- INSANE INTRO LOADER SEQUENCER ---
function initLoader() {
  const loader = document.getElementById('intro-loader');
  const feed = document.getElementById('loader-terminal');
  const percentage = document.getElementById('loader-percentage');
  const progressBar = document.getElementById('loader-progress-bar');
  
  if (!loader) return;

  const logs = [
    "[SYSTEM]: Handshake request initiated...",
    "[SYSTEM]: Connecting to remote memory nodes at betuls_core...",
    "[SYSTEM]: Access granted. Retrieving operator profiles...",
    "[SYSTEM]: Initializing Decryption Engine (AES-256)...",
    "[SYSTEM]: Decrypting profile fields (Name: Bhushan Narware)...",
    "[SYSTEM]: Initializing WebGL Canvas particle grid buffers...",
    "[SYSTEM]: Syncing Three.js 3D viewport parameters...",
    "[SYSTEM]: Registering GSAP trigger modules...",
    "[SYSTEM]: Establishing audio synthesizer pipelines...",
    "[SYSTEM]: Boot sequence 100% complete. Transitioning to HUD..."
  ];

  let progress = 0;
  let logIdx = 0;

  function updateLoader() {
    progress += Math.floor(Math.random() * 5) + 3;
    if (progress > 100) progress = 100;

    // Update bar and percentage text
    if (progressBar) progressBar.style.width = progress + '%';
    if (percentage) percentage.textContent = progress + '%';

    // Print a log at regular intervals
    const targetIdx = Math.floor((progress / 100) * logs.length);
    while (logIdx < targetIdx && logIdx < logs.length) {
      const newLine = document.createElement('div');
      newLine.className = logIdx % 2 === 0 ? 'text-cyber-accent' : 'text-slate-400';
      newLine.textContent = logs[logIdx];
      feed.appendChild(newLine);
      feed.scrollTop = feed.scrollHeight;
      
      if (isAudioEnabled) playBeep(600 + logIdx * 80, 0.03, 'sine');
      logIdx++;
    }

    if (progress < 100) {
      setTimeout(updateLoader, 60 + Math.random() * 80);
    } else {
      // Smoothly fade out the loader overlay
      gsap.to(loader, {
        opacity: 0,
        y: -100,
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: () => {
          loader.style.display = 'none';
          document.body.classList.remove('overflow-hidden');
          // Automatically prompt welcome in console
          const terminalFeed = document.getElementById('terminal-feed');
          if (terminalFeed) {
            const welcome = document.createElement('div');
            welcome.className = 'text-cyber-accent font-bold';
            welcome.textContent = '[UPLINK ACTIVE]: Welcome Operator. Type "help" to start hacking.';
            terminalFeed.appendChild(welcome);
          }
        }
      });
    }
  }

  // Prevent page scroll during loading
  document.body.classList.add('overflow-hidden');
  
  // Start loading sequence with a slight delay
  setTimeout(updateLoader, 300);
}

// --- INTERACTIVE HACKING TOOLS GRID HUD ---
function initHackerToolkit() {
  const buttons = document.querySelectorAll('.tool-hud-btn');
  const hudName = document.getElementById('hud-tool-name');
  const hudType = document.getElementById('hud-tool-type');
  const hudSyntax = document.getElementById('hud-tool-syntax');
  const hudDesc = document.getElementById('hud-tool-desc');
  const hudStatus = document.getElementById('tool-status');

  if (!buttons.length || !hudName) return;

  buttons.forEach(btn => {
    // On Hover, update the HUD screen
    btn.addEventListener('mouseenter', () => {
      const tool = btn.getAttribute('data-tool');
      const type = btn.getAttribute('data-type');
      const syntax = btn.getAttribute('data-syntax');
      const desc = btn.getAttribute('data-desc');

      hudName.textContent = tool;
      hudType.textContent = type;
      hudSyntax.textContent = syntax;
      hudDesc.textContent = desc;
      
      if (hudStatus) {
        hudStatus.textContent = `[ ACTIVE_QUERY: ${tool.toUpperCase()} ]`;
        hudStatus.className = "text-cyber-accent animate-pulse";
      }

      // Play light click sound
      if (isAudioEnabled) playBeep(900, 0.015, 'sine');
    });

    btn.addEventListener('mouseleave', () => {
      if (hudStatus) {
        hudStatus.textContent = "[ IDLE_STANDBY ]";
        hudStatus.className = "text-slate-500";
      }
    });

    btn.addEventListener('click', () => {
      const tool = btn.getAttribute('data-tool');
      // Trigger a brief command execution printout in the main console panel!
      const consoleFeed = document.getElementById('terminal-feed');
      if (consoleFeed) {
        // Open terminal if minimized
        const terminalPanel = document.getElementById('terminal-console-panel');
        if (terminalPanel) terminalPanel.classList.remove('translate-y-full');

        playExploitSound();

        const cmdLine = document.createElement('div');
        cmdLine.className = 'text-cyber-accent font-bold mt-4';
        cmdLine.textContent = `[TOOL_EXEC] visitor@bhushan_sec:~$ ${btn.getAttribute('data-syntax')}`;
        consoleFeed.appendChild(cmdLine);

        const outcome = document.createElement('div');
        outcome.className = 'text-slate-300';
        outcome.textContent = `[*] Invoking ${tool} subprocess pipeline. Scan module initialized successfully.`;
        consoleFeed.appendChild(outcome);
        
        consoleFeed.scrollTop = consoleFeed.scrollHeight;
      }
    });
  });
}

// --- DYNAMIC CLOCK AND VISITOR CORES HUD ---
function initRealTimeStats() {
  const clock = document.getElementById('hud-clock');
  const visitors = document.getElementById('visitor-count');

  if (clock) {
    function tickClock() {
      const now = new Date();
      clock.textContent = now.toLocaleTimeString() + " UTC" + (now.getTimezoneOffset() > 0 ? "-" : "+") + Math.abs(now.getTimezoneOffset()/60);
    }
    setInterval(tickClock, 1000);
    tickClock();
  }

  if (visitors) {
    let count = 4289;
    // Animate initial count up
    let current = 0;
    const step = Math.floor(count / 30);
    function countUp() {
      current += step;
      if (current >= count) {
        current = count;
        visitors.textContent = current.toLocaleString();
        
        // Randomly increment every few seconds
        setInterval(() => {
          if (Math.random() > 0.6) {
            count += Math.floor(Math.random() * 3) + 1;
            visitors.textContent = count.toLocaleString();
            if (isAudioEnabled) playBeep(1100, 0.01, 'sine');
          }
        }, 4000);
      } else {
        visitors.textContent = current.toLocaleString();
        setTimeout(countUp, 30);
      }
    }
    countUp();
  }
}

// --- INITIALIZE ALL MODULES ---
window.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initHUDControls();
  initCustomCursor();
  initTypingSubtitle();
  initThreeBackground();
  initHero3DScene();
  initMatrixRain();
  initTerminalConsole();
  initProjectSimulators();
  initAIChatAssistant();
  initContactForm();
  initGSAPAnimations();
  initFPSCounter();
  initHackerToolkit();
  initRealTimeStats();
});
