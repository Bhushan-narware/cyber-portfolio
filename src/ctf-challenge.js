// --- INTERACTIVE CAPTURE THE FLAG (CTF) GAME DAEMON ---

document.addEventListener('DOMContentLoaded', () => {
  // Log the final key in console for visitors to discover as an Easter Egg
  console.log("%c[CTF RELAY NODES]: FLAG SOURCE LOADED.", "color: #8A2BE2; font-weight: bold; font-size: 12px;");
  console.log("%cFlag Key is: FLAG{BHUSHAN_SHIELD_DECRYPTED}", "color: #00F5FF; font-family: monospace; font-size: 11px;");

  let ctfStage = 1; // Stages: 1 = hash decryption, 2 = code audit, 3 = final flag input, 4 = complete

  // Bind commands directly into the global terminal console commands index
  if (window.terminalCommands) {
    
    // Help details update
    const oldHelp = window.terminalCommands['help'];
    window.terminalCommands['help'] = () => {
      const response = oldHelp();
      // Insert ctf help listing
      response.splice(11, 0, "ctf          - Initialize the Capture The Flag (CTF) hacker game");
      return response;
    };

    window.terminalCommands['ctf'] = (args) => {
      // If args are provided
      if (args && args.length > 1) {
        const subcmd = args[1].toLowerCase();
        
        if (subcmd === 'decode') {
          if (ctfStage !== 1) return ["[!] Stage 1 already decrypted or bypassed."];
          const hash = args[2];
          if (hash === 'qkg4x1nfaq19nt1kdle=' || hash === 'Qkg4X1NFQ19NT0RVTEU=') {
            ctfStage = 2;
            window.playBeep(1000, 0.1, 'sine');
            return [
              "[+] STAGE 1 COMPLETED: Decryption handshake valid.",
              "[-] Decoded String: 'BH8_SEC_MODULE'",
              "",
              "[!] STAGE 2: VULNERABILITY CODE AUDIT INITIALIZED.",
              "Type 'ctf code' to dump the target buffer function source code."
            ];
          } else {
            return ["[!] ERROR: Invalid hash decryption value. Hint: use Base64 decoder."];
          }
        }
        
        if (subcmd === 'code') {
          if (ctfStage < 2) return ["[!] Access Denied: Resolve Stage 1 first."];
          return [
            "--------------------------------------------------",
            "SOURCE CODE DUMP: copy_data.c",
            "--------------------------------------------------",
            "1: void copy_buffer_data(char *input_str) {",
            "2:     char dest_buffer[16];",
            "3:     strcpy(dest_buffer, input_str);",
            "4: }",
            "--------------------------------------------------",
            "Audit the lines above and find the secure memory loophole.",
            "Type 'ctf answer [vuln_name]' to submit. Hint: look at strcpy."
          ];
        }

        if (subcmd === 'answer') {
          if (ctfStage !== 2) return ["[!] Code audit state is currently inactive."];
          const ans = args.slice(2).join(' ').toLowerCase();
          if (ans.includes('overflow') || ans.includes('strcpy') || ans.includes('bounds') || ans.includes('size')) {
            ctfStage = 3;
            window.playBeep(1200, 0.15, 'sine');
            return [
              "[+] STAGE 2 COMPLETED: Loopholes analyzed successfully.",
              "[-] Vulnerability: Buffer Overflow via strcpy (unsafe bounds copy).",
              "",
              "[!] STAGE 3: DATA EXTRAPOLATION.",
              "Find the final FLAG hidden inside your browser console logs (Inspect Element).",
              "Enter the key using: ctf flag FLAG{...}"
            ];
          } else {
            return ["[!] AUDIT FAILED: Loophole not detected. Hint: what happens if string size > 16?"];
          }
        }

        if (subcmd === 'flag') {
          if (ctfStage < 3) return ["[!] Access Denied: Resolve previous stages first."];
          const flagKey = args[2];
          if (flagKey === 'FLAG{BHUSHAN_SHIELD_DECRYPTED}' || flagKey === 'flag{bhushan_shield_decrypted}') {
            ctfStage = 4;
            triggerCtfVictory();
            return [
              "==================================================",
              "[SUCCESS]: CTF HACK CHALLENGE SOLVED SUCCESSFULLY!",
              "==================================================",
              "Bhushan Narware has awarded you the CTF OPERATOR badge.",
              "Check your status in the HUD Logo node at the top left!",
              "Handshake secure. Daemon connection terminated."
            ];
          } else {
            return ["[!] ERROR: Invalid flag key signature. Inspect your browser console."];
          }
        }
        
        return [`Unknown ctf command parameter: ${subcmd}. Type 'ctf' for details.`];
      }

      // Base CTF greeting
      if (ctfStage === 1) {
        return [
          "==================================================",
          "CAPTURE THE FLAG (CTF) INTERACTIVE CHANNELS",
          "==================================================",
          "Challenge yourself to audit systems security.",
          "Solve 3 hacker stages to decrypt the CTF status badge.",
          "",
          "[!] STAGE 1: DECRYPT DELETED TRANSCRIPTION.",
          "We intercepted a Base64 string value:",
          "  -> Qkg4X1NFQ19NT0RVTEU=",
          "",
          "Decode it and type: ctf decode [decoded_string]"
        ];
      } else if (ctfStage === 2) {
        return [
          "[!] CTF Stage 1 complete.",
          "Currently on STAGE 2: Code Audit.",
          "Type 'ctf code' to print source code for auditing."
        ];
      } else if (ctfStage === 3) {
        return [
          "[!] CTF Stages 1 & 2 complete.",
          "Currently on STAGE 3: Console Logs extraction.",
          "Retrieve final flag from developer console logs, then type: ctf flag FLAG{...}"
        ];
      } else {
        return ["[+] CTF Challenge solved! Operator status badge is active."];
      }
    };
  }

  // Victor adjustments: Award badge in logo!
  function triggerCtfVictory() {
    window.playExploitSound();

    const logoSys = document.querySelector('.text-slate-100');
    if (logoSys) {
      // Append CTF passed indicator
      const badge = document.createElement('span');
      badge.className = 'text-green-500 font-mono text-[9px] ml-1 bg-green-500/10 px-1 border border-green-500/30 rounded animate-pulse';
      badge.textContent = '[CTF_OK]';
      logoSys.appendChild(badge);
    }

    // Flash a premium success banner in HUD
    const banner = document.createElement('div');
    banner.className = 'fixed top-24 left-1/2 -translate-x-1/2 bg-cyber-black/95 border border-green-500 p-6 rounded shadow-[0_0_30px_rgba(0,255,100,0.5)] z-50 text-center font-mono text-xs text-green-400 backdrop-blur-md';
    banner.innerHTML = `
      <div class="text-base font-bold font-orbitron text-white mb-2">🏆 ACCESS GRANTED: CTF CLEARED</div>
      <p class="mb-4">You decrypted Bhushan's security shield system coordinates!</p>
      <button id="dismiss-ctf-victory" class="px-4 py-1.5 bg-green-500/20 hover:bg-green-500 border border-green-500 text-green-400 hover:text-black font-orbitron font-bold rounded transition-colors text-[10px]">
        DISMISS TERMINAL ALERT
      </button>
    `;
    document.body.appendChild(banner);

    document.getElementById('dismiss-ctf-victory').addEventListener('click', () => {
      banner.remove();
    });
  }
});
