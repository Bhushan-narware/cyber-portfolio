/**
 * SHADOWNET // Onion Portal v3.14
 * Developed by Bhushan
 * JS Controller File
 */

document.addEventListener('DOMContentLoaded', () => {
    // App State
    const state = {
        soundEnabled: true,
        wallet: {
            btc: 0.4052,
            xmr: 14.920
        },
        ipAddress: '185.220.101.42',
        terminalLines: [],
        marketItems: [
            {
                id: 'item-1',
                title: 'Shadow OS Zero-Day Exploit',
                desc: 'Privilege escalation zero-day POC exploit targeting Linux kernel versions 5.10 through 6.2. Fully bypasses KASLR.',
                price: 2.5,
                currency: 'XMR',
                category: 'exploit'
            },
            {
                id: 'item-2',
                title: 'Encrypted Government Ledger',
                desc: 'Raw DB dump containing classified budget accounts and transactional records from eastern region logistics network. PGP encrypted.',
                price: 0.125,
                currency: 'BTC',
                category: 'database'
            },
            {
                id: 'item-3',
                title: 'Root Access VPN Router v4',
                desc: 'Physical router firmware pre-flashed with custom OpenWRT, routing through 4 layers of cascaded onion networks with automatic killswitch.',
                price: 0.058,
                currency: 'BTC',
                category: 'hardware'
            },
            {
                id: 'item-4',
                title: 'Decrypted Corporate Database',
                desc: 'Full corporate directory including emails, hashed credentials, and proprietary schematic assets of major defense contractor.',
                price: 6.8,
                currency: 'XMR',
                category: 'database'
            },
            {
                id: 'item-5',
                title: 'Tor Proxy Cascade Suite',
                desc: 'Command line script tool that provisions and routes traffic through 12 ephemeral proxy containers simultaneously with IP rotation.',
                price: 1.2,
                currency: 'XMR',
                category: 'software'
            },
            {
                id: 'item-6',
                title: 'Encrypted Cryptocommunication Datapad',
                desc: 'Fictional blueprint specs for hardware modification of handheld systems to allow off-grid mesh encrypted messaging.',
                price: 0.095,
                currency: 'BTC',
                category: 'hardware'
            }
        ],
        game: {
            active: false,
            gridSize: 5,
            grid: [],
            targetSeq: [],
            buffer: [],
            bufferMax: 4,
            timer: 30,
            interval: null,
            currentRow: -1,
            currentCol: -1,
            lastStep: 'row'
        }
    };

    // DOM Elements
    const elements = {
        soundToggle: document.getElementById('sound-toggle'),
        soundText: document.getElementById('sound-text'),
        soundIcon: document.getElementById('sound-icon'),
        nodeIp: document.getElementById('node-ip'),
        navButtons: document.querySelectorAll('.nav-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        terminalOutput: document.getElementById('terminal-output'),
        terminalInput: document.getElementById('terminal-input'),
        terminalBody: document.getElementById('terminal-body'),
        marketGrid: document.getElementById('market-grid'),
        checkoutModal: document.getElementById('checkout-modal'),
        closeModal: document.getElementById('close-modal'),
        modalBody: document.getElementById('modal-body'),
        targetSequence: document.getElementById('target-sequence'),
        gameBufferFill: document.getElementById('game-buffer-fill'),
        gameBufferMax: document.getElementById('game-buffer-max'),
        gameTimer: document.getElementById('game-timer'),
        gameGrid: document.getElementById('game-grid'),
        gameBufferDisplay: document.getElementById('game-buffer-display'),
        startGameBtn: document.getElementById('start-game-btn'),
        gameStatusMsg: document.getElementById('game-status-msg'),
        ramProgress: document.getElementById('ram-progress'),
        ramVal: document.getElementById('ram-val'),
        diagNetworkLogs: document.getElementById('diag-network-logs'),
        diagThreatLogs: document.getElementById('diag-threat-logs'),
        walletBtc: document.getElementById('wallet-btc'),
        walletXmr: document.getElementById('wallet-xmr')
    };

    // Initialize display IP
    elements.nodeIp.textContent = state.ipAddress;

    // Set SVG progress ring parameters
    if (elements.ramProgress) {
        const radius = elements.ramProgress.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        elements.ramProgress.style.strokeDasharray = `${circumference} ${circumference}`;
        elements.ramProgress.style.strokeDashoffset = circumference;
    }

    // ==========================================
    // AUDIO SYNTHESIZER (Web Audio API)
    // ==========================================
    let audioCtx = null;
    let backgroundHumNode = null;

    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            startBackgroundDrone();
        } catch (e) {
            console.error("Audio Context initialization failed: ", e);
        }
    }

    function playTone(freq, type, duration, volume = 0.1) {
        if (!state.soundEnabled) return;
        initAudio();
        if (!audioCtx || audioCtx.state === 'suspended') return;

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    function playClickSound() {
        playTone(600 + Math.random() * 800, 'sine', 0.05, 0.03);
    }

    function playSuccessSound() {
        if (!state.soundEnabled) return;
        initAudio();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                playTone(freq, 'triangle', 0.4, 0.1);
            }, index * 100);
        });
    }

    function playFailureSound() {
        if (!state.soundEnabled) return;
        initAudio();
        if (!audioCtx) return;
        playTone(150, 'sawtooth', 0.5, 0.15);
        setTimeout(() => {
            playTone(110, 'sawtooth', 0.5, 0.15);
        }, 120);
    }

    function playPurchaseSound() {
        if (!state.soundEnabled) return;
        initAudio();
        if (!audioCtx) return;
        playTone(987.77, 'sine', 0.15, 0.08);
        setTimeout(() => {
            playTone(1318.51, 'sine', 0.3, 0.08);
        }, 100);
    }

    function startBackgroundDrone() {
        if (!state.soundEnabled || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const filter = audioCtx.createBiquadFilter();
            const gain = audioCtx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(55, audioCtx.currentTime);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(100, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.015, audioCtx.currentTime);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            backgroundHumNode = osc;
        } catch (err) {
            console.error("Drone hum start failed", err);
        }
    }

    function stopBackgroundDrone() {
        if (backgroundHumNode) {
            try {
                backgroundHumNode.stop();
                backgroundHumNode.disconnect();
            } catch(e) {}
            backgroundHumNode = null;
        }
    }

    elements.soundToggle.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        if (state.soundEnabled) {
            elements.soundText.textContent = "ON";
            elements.soundIcon.textContent = "🔊";
            elements.soundToggle.classList.remove('btn-dim');
            initAudio();
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            startBackgroundDrone();
        } else {
            elements.soundText.textContent = "OFF";
            elements.soundIcon.textContent = "🔇";
            elements.soundToggle.classList.add('btn-dim');
            stopBackgroundDrone();
        }
    });

    document.addEventListener('click', () => {
        if (state.soundEnabled && !audioCtx) {
            initAudio();
        }
    }, { once: true });


    // ==========================================
    // MATRIX CODE RAIN BACKGROUND
    // ==========================================
    const canvas = document.getElementById('matrix-rain');
    const ctx = canvas.getContext('2d');

    let columns = [];
    const fontSize = 14;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const colCount = Math.floor(canvas.width / fontSize) + 1;
        columns = Array(colCount).fill(0).map(() => Math.random() * -100);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const charList = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEF$#@%&*";

    function drawMatrix() {
        ctx.fillStyle = 'rgba(3, 8, 3, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < columns.length; i++) {
            const char = charList[Math.floor(Math.random() * charList.length)];
            const x = i * fontSize;
            const y = columns[i] * fontSize;

            ctx.fillStyle = '#ffffff';
            ctx.fillText(char, x, y);
            ctx.fillStyle = '#00ff41';
            
            if (Math.random() > 0.1) {
                ctx.fillText(charList[Math.floor(Math.random() * charList.length)], x, y - fontSize);
            }

            if (y > canvas.height && Math.random() > 0.975) {
                columns[i] = 0;
            }
            columns[i]++;
        }
    }

    setInterval(drawMatrix, 40);


    // ==========================================
    // TAB NAVIGATION
    // ==========================================
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playClickSound();
            const tabId = btn.getAttribute('data-tab');
            
            elements.navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            elements.tabContents.forEach(tab => {
                tab.classList.remove('active');
                if (tab.id === tabId) {
                    tab.classList.add('active');
                }
            });

            if (tabId === 'terminal-tab') {
                setTimeout(() => elements.terminalInput.focus(), 50);
            }
        });
    });


    // ==========================================
    // FAKE TERMINAL CONSOLE
    // ==========================================
    const bootSequence = [
        "SHADOWNET BOOT LOADER v3.14 (c) 2026",
        "ESTABLISHING CRYPTOGRAPHIC ENVELOPE...",
        "TOR PROXY INTERFACE STATUS: INITIALIZED",
        "GENERATING LOCAL ROUTING MAP...",
        "CONNECTING TO ONION RELAY: bhushan-portal.onion",
        "SYSTEM ENCRYPTION: SECURE AES-XTS-512",
        "----------------------------------------------",
        "WELCOME BHUSHAN. SYSTEM ACCESS GRANTED.",
        "Type 'help' to display available network commands.",
        "----------------------------------------------"
    ];

    function printTerminalLine(text, className = '') {
        const line = document.createElement('div');
        if (className) line.className = className;
        line.innerHTML = text;
        elements.terminalOutput.appendChild(line);
        elements.terminalOutput.scrollTop = elements.terminalOutput.scrollHeight;
    }

    let bootDelay = 0;
    bootSequence.forEach(line => {
        setTimeout(() => {
            printTerminalLine(line);
            playClickSound();
        }, bootDelay);
        bootDelay += 150 + Math.random() * 200;
    });

    elements.terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawCmd = elements.terminalInput.value.trim();
            elements.terminalInput.value = '';
            
            if (rawCmd === '') return;

            playClickSound();
            printTerminalLine(`bhushan@shadow-node:~$ ${rawCmd}`, 'prompt-cmd');

            const args = rawCmd.split(' ');
            const cmd = args[0].toLowerCase();

            setTimeout(() => {
                executeTerminalCommand(cmd, args);
            }, 100);
        }
    });

    elements.terminalBody.addEventListener('click', () => {
        elements.terminalInput.focus();
    });

    function executeTerminalCommand(cmd, args) {
        switch (cmd) {
            case 'help':
                printTerminalLine("AVAILABLE CONSOLE COMMANDS:");
                printTerminalLine("  <span class='text-cyan'>help</span>        - Display this information directory.");
                printTerminalLine("  <span class='text-cyan'>about</span>       - Print information about the platform creator.");
                printTerminalLine("  <span class='text-cyan'>scan</span>        - Run a fake port scan against exit gateway.");
                printTerminalLine("  <span class='text-cyan'>exploit</span>     - Execute interactive screen buffer hack animation.");
                printTerminalLine("  <span class='text-cyan'>market</span>      - List current database/software offerings.");
                printTerminalLine("  <span class='text-cyan'>status</span>      - Display local memory and block sync index.");
                printTerminalLine("  <span class='text-cyan'>clear</span>       - Clear all console visual output.");
                printTerminalLine("  <span class='text-cyan'>ip [address]</span>- Spoof exiting router node IP address.");
                break;

            case 'about':
                printTerminalLine("==============================================", "text-green");
                printTerminalLine("SHADOWNET ONION ROUTING PORTAL v3.14", "text-cyan");
                printTerminalLine("DEVELOPED BY: <span class='text-orange'>BHUSHAN</span> (Security Architect)", "text-green");
                printTerminalLine("PURPOSE: Cybersecurity Awareness & Game Simulation Sandbox", "text-green");
                printTerminalLine("==============================================", "text-green");
                break;

            case 'clear':
                elements.terminalOutput.innerHTML = '';
                break;

            case 'status':
                printTerminalLine("SHADOW NODE CONFIGURATION STATS:");
                printTerminalLine(`  SYSTEM USER  : bhushan`);
                printTerminalLine(`  GATEWAY IP   : ${state.ipAddress}`);
                printTerminalLine(`  ACTIVE TUNNEL: Tor Onion Tunnel (3-Hop Multiplex)`);
                printTerminalLine(`  LEDGER STATUS: BTC [Synced] // XMR [Synced]`);
                printTerminalLine(`  ENCRYPT ENGINE: WebCrypto/RSA-OAEP-4096 + AES-GCM-256`);
                break;

            case 'ip':
                if (args[1]) {
                    state.ipAddress = args[1];
                    elements.nodeIp.textContent = state.ipAddress;
                    printTerminalLine(`SPOOFING ROUTER IP TO: <span class='text-cyan'>${state.ipAddress}</span>`);
                    playSuccessSound();
                } else {
                    printTerminalLine(`CURRENT SPOOFED GATEWAY: <span class='text-cyan'>${state.ipAddress}</span>`);
                }
                break;

            case 'market':
                printTerminalLine("CURRENT BLACK MARKET LISTINGS (ACTIVE DUMMIES):");
                state.marketItems.forEach(item => {
                    printTerminalLine(`  [${item.id}] <span class='text-orange'>${item.title}</span> - ${item.price} ${item.currency}`);
                });
                printTerminalLine("Use the 'SHADOW MARKET' UI tab to securely inspect and checkout.");
                break;

            case 'scan':
                printTerminalLine("INITIALIZING SECURITY SCAN AGAINST PROXY EXIT GATEWAY...", "text-orange");
                let scanDelay = 300;
                const scans = [
                    "Checking port 22 (SSH)... FILTERED",
                    "Checking port 80 (HTTP)... CLOSED",
                    "Checking port 443 (HTTPS)... CLOSED",
                    "Checking port 9001 (TOR-OR)... OPEN [Tor Protocol Version 3]",
                    "Checking port 9050 (TOR-SOCKS)... OPEN [Access Restricted]",
                    "SCAN COMPLETE: Target system vulnerable to local loop simulation bypass.",
                ];
                scans.forEach((line, i) => {
                    setTimeout(() => {
                        printTerminalLine("  " + line, i === scans.length - 1 ? 'text-green' : 'text-green-dim');
                        playClickSound();
                    }, scanDelay);
                    scanDelay += 300;
                });
                break;

            case 'exploit':
                printTerminalLine("INJECTING BUFFER OVERFLOW EXPLOIT MATRIX...", "text-red");
                playFailureSound();
                
                let exploitDelay = 400;
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        const randomHex = Array(25).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')).join(' ');
                        printTerminalLine(`STACK OVERFLOW BUF_LOAD [${i*10}%]: ${randomHex}`, 'text-red');
                        playTone(100 + i * 40, 'sawtooth', 0.08, 0.05);
                    }, exploitDelay);
                    exploitDelay += 120;
                }

                setTimeout(() => {
                    printTerminalLine("SYSTEM BREACH SIMULATED SUCCESSFULLY! STACK ACCESS GRANTED.", "text-cyan");
                    playSuccessSound();
                }, exploitDelay + 100);
                break;

            default:
                printTerminalLine(`command not found: ${cmd}. Type <span class='text-cyan'>help</span> to review options.`, 'text-red');
                playTone(220, 'sine', 0.2, 0.05);
                break;
        }
    }


    // ==========================================
    // BLACK MARKETSTORE & CHECKOUT
    // ==========================================
    function renderMarket() {
        elements.marketGrid.innerHTML = '';
        state.marketItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div>
                    <div class="market-item-header">
                        <span class="market-item-title">${item.title}</span>
                        <span class="market-item-category">${item.category}</span>
                    </div>
                    <p class="market-item-desc">${item.desc}</p>
                </div>
                <div class="market-item-footer">
                    <span class="market-item-price ${item.currency === 'BTC' ? 'text-orange' : 'text-purple'}">
                        ${item.price} ${item.currency}
                    </span>
                    <button class="btn btn-primary buy-btn" data-id="${item.id}">BUY DUMMY</button>
                </div>
            `;
            elements.marketGrid.appendChild(card);
        });

        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.getAttribute('data-id');
                const item = state.marketItems.find(i => i.id === itemId);
                if (item) {
                    openCheckoutModal(item);
                }
            });
        });
    }

    renderMarket();

    function openCheckoutModal(item) {
        initAudio();
        playClickSound();
        elements.checkoutModal.style.display = 'flex';
        
        elements.modalBody.innerHTML = `
            <div class="checkout-flow">
                <div class="checkout-step">
                    <strong>ITEM:</strong> ${item.title}<br>
                    <strong>COST:</strong> ${item.price} ${item.currency}<br>
                    <strong>STATUS:</strong> Awaiting Payment Gateway
                </div>
                <div id="checkout-progress-zone">
                    <button class="btn btn-primary" id="btn-confirm-pay" style="width:100%">SEND CRYPTO DEPOSIT</button>
                </div>
            </div>
        `;

        document.getElementById('btn-confirm-pay').addEventListener('click', () => {
            runFakeCheckoutProcess(item);
        });
    }

    elements.closeModal.addEventListener('click', () => {
        elements.checkoutModal.style.display = 'none';
        playClickSound();
    });

    window.addEventListener('click', (e) => {
        if (e.target === elements.checkoutModal) {
            elements.checkoutModal.style.display = 'none';
        }
    });

    function runFakeCheckoutProcess(item) {
        const progressZone = document.getElementById('checkout-progress-zone');
        progressZone.innerHTML = '';

        const steps = [
            { text: "1. Generating Anonymous Single-use Wallet...", duration: 1500 },
            { text: "2. Awaiting blockchain verification on network...", duration: 2500 },
            { text: "3. Confirming ledger deposit transaction...", duration: 2000 },
            { text: "4. Downloading decrypt PGP payloads...", duration: 2000 },
            { text: "5. Finalizing packet decryption key...", duration: 1500 }
        ];

        let stepIndex = 0;

        function runStep() {
            if (stepIndex >= steps.length) {
                const isBTC = item.currency === 'BTC';
                if (isBTC) {
                    state.wallet.btc = Math.max(0, state.wallet.btc - item.price).toFixed(4);
                    elements.walletBtc.textContent = state.wallet.btc;
                } else {
                    state.wallet.xmr = Math.max(0, state.wallet.xmr - item.price).toFixed(3);
                    elements.walletXmr.textContent = state.wallet.xmr;
                }

                playPurchaseSound();
                progressZone.innerHTML = `
                    <div class="checkout-step text-green" style="border-color:var(--neon-green)">
                        <h4>TRANSACTION COMPLETE!</h4>
                        <p style="margin: 8px 0;">Item decrypted successfully. Decryption key generated: SHA256-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                        <a href="#" class="btn btn-primary" id="mock-download-btn" style="display:inline-block; text-align:center; width:100%; margin-top:5px;">DOWNLOAD DATA FILE</a>
                    </div>
                `;

                document.getElementById('mock-download-btn').addEventListener('click', (e) => {
                    e.preventDefault();
                    playSuccessSound();
                    alert(`Training Mode download simulator for: "${item.title}" successfully completed.`);
                });
                return;
            }

            const current = steps[stepIndex];
            const stepDiv = document.createElement('div');
            stepDiv.className = 'checkout-step';
            stepDiv.innerHTML = `
                <div>${current.text}</div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" id="pb-fill-${stepIndex}"></div>
                    <span class="progress-text" id="pb-text-${stepIndex}">0%</span>
                </div>
            `;
            progressZone.appendChild(stepDiv);

            const pbFill = document.getElementById(`pb-fill-${stepIndex}`);
            const pbText = document.getElementById(`pb-text-${stepIndex}`);
            let progress = 0;
            const stepDuration = current.duration;
            const intervalTime = 50;
            const increment = 100 / (stepDuration / intervalTime);

            const timer = setInterval(() => {
                progress += increment;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(timer);
                    stepIndex++;
                    playTone(400, 'sine', 0.1, 0.05);
                    setTimeout(runStep, 300);
                }
                pbFill.style.width = `${progress}%`;
                pbText.textContent = `${Math.floor(progress)}%`;
                
                if (Math.random() > 0.85) {
                    playTone(600, 'sine', 0.02, 0.02);
                }
            }, intervalTime);
        }

        runStep();
    }


    // ==========================================
    // FIREWALL BYPASS - BREACH PROTOCOL GAME
    // ==========================================
    function initGame() {
        state.game.active = false;
        state.game.buffer = [];
        state.game.currentRow = -1;
        state.game.currentCol = -1;
        state.game.lastStep = 'row';
        clearInterval(state.game.interval);

        elements.gameStatusMsg.textContent = "READY FOR OVERLOAD";
        elements.gameStatusMsg.className = "game-status-msg text-cyan";
        elements.gameTimer.textContent = "30s";
        elements.gameBufferFill.textContent = "0";

        const hexSymbols = ["BD", "1C", "E9", "55", "7A", "FF"];
        const grid = [];
        for (let i = 0; i < state.game.gridSize * state.game.gridSize; i++) {
            grid.push({
                val: hexSymbols[Math.floor(Math.random() * hexSymbols.length)],
                used: false,
                row: Math.floor(i / 5),
                col: i % 5
            });
        }
        state.game.grid = grid;

        const targetSeq = [];
        let r = 0;
        let c = Math.floor(Math.random() * 5);
        let nodeIndex = r * 5 + c;
        targetSeq.push(grid[nodeIndex].val);

        let nextR = Math.floor(Math.random() * 5);
        while (nextR === r) {
            nextR = Math.floor(Math.random() * 5);
        }
        nodeIndex = nextR * 5 + c;
        targetSeq.push(grid[nodeIndex].val);

        let nextC = Math.floor(Math.random() * 5);
        while (nextC === c) {
            nextC = Math.floor(Math.random() * 5);
        }
        nodeIndex = nextR * 5 + nextC;
        targetSeq.push(grid[nodeIndex].val);

        state.game.targetSeq = targetSeq;

        elements.targetSequence.innerHTML = targetSeq.map(b => `<span>${b}</span>`).join(' ');
        renderGameBoard();
        renderGameBuffer();
    }

    function renderGameBoard() {
        elements.gameGrid.innerHTML = '';
        state.game.grid.forEach((cell, idx) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'grid-cell';
            cellDiv.textContent = cell.val;
            
            if (!state.game.active) {
                cellDiv.classList.add('disabled');
            } else {
                const isFirstSelection = state.game.currentRow === -1 && cell.row === 0;
                const isCorrectRow = state.game.lastStep === 'col' && cell.row === state.game.currentRow;
                const isCorrectCol = state.game.lastStep === 'row' && cell.col === state.game.currentCol;

                if (cell.used) {
                    cellDiv.classList.add('disabled');
                } else if (isFirstSelection || isCorrectRow || isCorrectCol) {
                    if (isFirstSelection || isCorrectRow) cellDiv.classList.add('active-row');
                    if (isCorrectCol) cellDiv.classList.add('active-col');
                    
                    cellDiv.addEventListener('click', () => handleGridSelection(cell));
                } else {
                    cellDiv.classList.add('disabled');
                }
            }
            elements.gameGrid.appendChild(cellDiv);
        });
    }

    function renderGameBuffer() {
        elements.gameBufferDisplay.innerHTML = '';
        for (let i = 0; i < state.game.bufferMax; i++) {
            const node = document.createElement('div');
            node.className = 'buffer-node';
            if (i < state.game.buffer.length) {
                node.className = 'buffer-node filled';
                node.textContent = state.game.buffer[i];
            } else {
                node.textContent = '--';
            }
            elements.gameBufferDisplay.appendChild(node);
        }
    }

    function handleGridSelection(cell) {
        if (!state.game.active || cell.used) return;
        playClickSound();

        cell.used = true;
        state.game.buffer.push(cell.val);
        elements.gameBufferFill.textContent = state.game.buffer.length;

        state.game.currentRow = cell.row;
        state.game.currentCol = cell.col;
        state.game.lastStep = state.game.lastStep === 'row' ? 'col' : 'row';

        renderGameBoard();
        renderGameBuffer();
        checkWinCondition();
    }

    function checkWinCondition() {
        const buffer = state.game.buffer;
        const target = state.game.targetSeq;
        
        let win = false;
        for (let i = 0; i <= buffer.length - target.length; i++) {
            let match = true;
            for (let j = 0; j < target.length; j++) {
                if (buffer[i + j] !== target[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                win = true;
                break;
            }
        }

        if (win) {
            endGame(true);
        } else if (buffer.length >= state.game.bufferMax) {
            endGame(false);
        }
    }

    function endGame(victory) {
        state.game.active = false;
        clearInterval(state.game.interval);
        renderGameBoard();

        if (victory) {
            elements.gameStatusMsg.textContent = "FIREWALL BYPASS: SUCCESS";
            elements.gameStatusMsg.className = "game-status-msg text-green";
            playSuccessSound();
            
            printTerminalLine("[ALERT] SECURE BYPASS EXPLOIT TRIGGERED FROM DECIDED PORTAL", "text-cyan");
            printTerminalLine("[STATUS] ROOT SHELL INJECTED. FIREWALL COMPROMISED.", "text-cyan");
        } else {
            elements.gameStatusMsg.textContent = "DECRYPTION FAILED: TRACED";
            elements.gameStatusMsg.className = "game-status-msg text-red";
            playFailureSound();
        }
    }

    elements.startGameBtn.addEventListener('click', () => {
        initAudio();
        playClickSound();

        initGame();
        state.game.active = true;
        renderGameBoard();

        state.game.timer = 30;
        elements.gameTimer.textContent = state.game.timer + "s";
        elements.gameTimer.className = "text-green";

        state.game.interval = setInterval(() => {
            state.game.timer--;
            elements.gameTimer.textContent = state.game.timer + "s";

            if (state.game.timer <= 10) {
                elements.gameTimer.className = "text-red";
                playTone(800, 'sine', 0.05, 0.02);
            }

            if (state.game.timer <= 0) {
                endGame(false);
            }
        }, 1000);
    });

    initGame();


    // ==========================================
    // DYNAMIC DIAGNOSTICS & SYSTEM METRICS
    // ==========================================
    function updateMetrics() {
        for (let i = 1; i <= 4; i++) {
            const usage = Math.floor(Math.random() * 85) + 10;
            const fill = document.getElementById(`cpu-core-${i}`);
            const text = document.getElementById(`cpu-core-${i}-text`);
            if (fill && text) {
                fill.style.width = `${usage}%`;
                text.textContent = `${usage}%`;
            }
        }

        const ramUsed = (3.5 + Math.random() * 1.8).toFixed(1);
        elements.ramVal.textContent = ramUsed;
        if (elements.ramProgress) {
            const radius = elements.ramProgress.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const percent = (ramUsed / 8.0) * 100;
            elements.ramProgress.style.strokeDashoffset = circumference - (percent / 100) * circumference;
        }
    }

    setInterval(updateMetrics, 2000);
    updateMetrics();

    const networkLogs = [
        "IP packet forwarded: client -> proxy-1 -> shree-onion",
        "Connection request received from exit router node 194.109.206.212",
        "Encrypted TLS 1.3 handshake negotiation completed successfully",
        "Node entry validated. TLS secure signature: SHA384",
        "Packet sequence index sync packet dispatched... ACK recvd",
        "TCP Keep-Alive packet ping: rtt = 142ms",
        "DNS lookup bypass routing completed via encrypted server"
    ];

    const threatLogs = [
        "PORT SCAN ATTEMPT BLOCKED on exit daemon. Source: 218.92.0.12",
        "DDoS defense shield active. Current capacity: 100%",
        "Integrity check passed. File contents unmodified.",
        "Security token rotating... New auth token generated.",
        "Attempted SQL-Injection payload on static portal... Sanitized.",
        "Bypassed active gateway proxy tracker."
    ];

    function appendDiagLog(container, logs) {
        const entry = document.createElement('div');
        entry.className = 'diag-log-entry';
        const timestamp = new Date().toLocaleTimeString();
        const randLog = logs[Math.floor(Math.random() * logs.length)];
        entry.innerHTML = `<span class="text-cyan">[${timestamp}]</span> ${randLog}`;
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;

        while (container.childNodes.length > 15) {
            container.removeChild(container.firstChild);
        }
    }

    for (let i = 0; i < 6; i++) {
        appendDiagLog(elements.diagNetworkLogs, networkLogs);
        appendDiagLog(elements.diagThreatLogs, threatLogs);
    }

    setInterval(() => {
        if (Math.random() > 0.3) {
            appendDiagLog(elements.diagNetworkLogs, networkLogs);
        }
        if (Math.random() > 0.6) {
            appendDiagLog(elements.diagThreatLogs, threatLogs);
        }
    }, 4000);
});
