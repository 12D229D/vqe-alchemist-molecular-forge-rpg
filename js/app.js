/**
 * app.js
 * Main Controller for VQE Alchemist: Molecular Orbital Forge RPG.
 * Coordinates Molecule Selector, Ansatz Circuit Builder & Gate Sliders,
 * VQE Optimization Engine, Born-Oppenheimer Potential Energy Curve Canvas,
 * Orbital Cloud Simulation, and Web Audio API synthesizer.
 */

import { MOLECULES_DB } from './molecular-hamiltonians.js';
import { VQEAnsatzEngine } from './vqe-ansatz-engine.js';
import { ALCHEMY_QUESTS, ALCHEMY_RANKS, AlchemyProgressionManager } from './alchemy-rpg-progression.js';
import { QasmEstimatorBridge } from './qasm-estimator-bridge.js';
import { AlchemistDatabase } from './db.js';

class VQEAlchemistApp {
  constructor() {
    this.db = new AlchemistDatabase();
    this.currentMoleculeKey = 'h2';
    this.currentLevelIndex = 1; // R=0.74 Å by default
    this.currentQuestIndex = 0;
    
    // Variational parameters theta
    this.params = [0.15, -0.25, 0.1];
    this.ansatzType = 'uccsd';

    this.audioCtx = null;
    this.initDOM();
    this.setupEventListeners();
    this.loadMolecule(this.currentMoleculeKey);
    this.updatePlayerUI();
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.audioCtx = new AudioContext();
    }
  }

  playChime(freq = 523.25, type = 'sine', duration = 0.2) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  initDOM() {
    this.dom = {
      // Header & RPG Badges
      playerRankBadge: document.getElementById('player-rank-badge'),
      playerXpVal: document.getElementById('player-xp-val'),
      moleculeSelect: document.getElementById('molecule-select'),
      questSelect: document.getElementById('quest-select'),

      // Molecule & Bond Info
      molTitle: document.getElementById('mol-title'),
      molFormula: document.getElementById('mol-formula'),
      molDesc: document.getElementById('mol-desc'),
      bondDistanceSelect: document.getElementById('bond-distance-select'),
      hfStateBadge: document.getElementById('hf-state-badge'),
      fciEnergyBadge: document.getElementById('fci-energy-badge'),

      // Ansatz Sliders
      gateSlidersContainer: document.getElementById('gate-sliders-container'),
      btnOptimizeVQE: document.getElementById('btn-optimize-vqe'),
      btnForgeCrystal: document.getElementById('btn-forge-crystal'),

      // Live Meters & Energy
      vqeEnergyDisplay: document.getElementById('vqe-energy-display'),
      fciEnergyDisplay: document.getElementById('fci-energy-display'),
      errorMhaDisplay: document.getElementById('error-mha-display'),
      purityBadge: document.getElementById('purity-badge'),
      precisionAlert: document.getElementById('precision-alert'),

      // Canvas
      canvasBO: document.getElementById('canvas-born-oppenheimer'),
      canvasOrbitals: document.getElementById('canvas-orbitals'),

      // QASM & Modal
      btnShowQasm: document.getElementById('btn-show-qasm'),
      qasmModal: document.getElementById('qasm-modal'),
      qasmContent: document.getElementById('qasm-content'),
      btnCloseQasm: document.getElementById('btn-close-qasm'),
      btnCopyQasm: document.getElementById('btn-copy-qasm'),

      // Pauli table
      pauliTermsList: document.getElementById('pauli-terms-list')
    };

    this.populateSelects();
    this.initCanvasRenderers();
  }

  populateSelects() {
    const unlocked = this.db.getUnlockedMolecules();
    this.dom.moleculeSelect.innerHTML = '';
    for (const [key, mol] of Object.entries(MOLECULES_DB)) {
      const opt = document.createElement('option');
      opt.value = key;
      const isLocked = !unlocked.includes(key);
      opt.textContent = `${isLocked ? '🔒 ' : '🧪 '}${mol.name} (${mol.formula})`;
      opt.disabled = isLocked;
      this.dom.moleculeSelect.appendChild(opt);
    }

    this.dom.questSelect.innerHTML = '';
    const completed = this.db.getCompletedQuests();
    ALCHEMY_QUESTS.forEach((q, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      const isDone = completed.includes(q.id);
      opt.textContent = `${isDone ? '✅ ' : '📜 '}${q.name}`;
      this.dom.questSelect.appendChild(opt);
    });
  }

  setupEventListeners() {
    this.dom.moleculeSelect.addEventListener('change', (e) => {
      this.loadMolecule(e.target.value);
    });

    this.dom.questSelect.addEventListener('change', (e) => {
      this.loadQuest(parseInt(e.target.value, 10));
    });

    this.dom.bondDistanceSelect.addEventListener('change', (e) => {
      this.currentLevelIndex = parseInt(e.target.value, 10);
      this.updateHamiltonian();
    });

    this.dom.btnOptimizeVQE.addEventListener('click', () => {
      this.initAudio();
      this.runClassicalOptimization();
    });

    this.dom.btnForgeCrystal.addEventListener('click', () => {
      this.initAudio();
      this.forgeCrystal();
    });

    this.dom.btnShowQasm.addEventListener('click', () => {
      this.showQasm();
    });
    this.dom.btnCloseQasm.addEventListener('click', () => {
      this.dom.qasmModal.classList.add('hidden');
    });
    this.dom.btnCopyQasm.addEventListener('click', () => {
      navigator.clipboard.writeText(this.dom.qasmContent.textContent);
      this.playChime(880, 'sine', 0.1);
      alert('Circuito OpenQASM 3.0 copiado al portapapeles.');
    });
  }

  loadMolecule(key) {
    this.currentMoleculeKey = key;
    const mol = MOLECULES_DB[key];
    this.dom.molTitle.textContent = mol.name;
    this.dom.molFormula.textContent = mol.formula;
    this.dom.molDesc.textContent = mol.description;
    this.dom.hfStateBadge.textContent = `|${mol.hfState}⟩`;

    // Populate R distances
    this.dom.bondDistanceSelect.innerHTML = '';
    mol.levels.forEach((lvl, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `R = ${lvl.r.toFixed(2)} Å ${lvl.r === mol.equilibriumR ? '★ (Equilibrio)' : ''}`;
      this.dom.bondDistanceSelect.appendChild(opt);
    });

    // Select equilibrium level if found
    const eqIdx = mol.levels.findIndex(l => l.r === mol.equilibriumR);
    this.currentLevelIndex = eqIdx >= 0 ? eqIdx : 0;
    this.dom.bondDistanceSelect.value = this.currentLevelIndex;

    // Reset parameters
    const paramCount = mol.qubits === 2 ? 3 : mol.qubits * 2;
    this.params = new Array(paramCount).fill(0.05);

    this.buildGateSliders();
    this.updateHamiltonian();
  }

  loadQuest(questIdx) {
    this.currentQuestIndex = questIdx;
    const quest = ALCHEMY_QUESTS[questIdx];
    this.loadMolecule(quest.moleculeId);

    // Set target R
    const mol = MOLECULES_DB[quest.moleculeId];
    const rIdx = mol.levels.findIndex(l => Math.abs(l.r - quest.targetR) < 0.01);
    if (rIdx >= 0) {
      this.currentLevelIndex = rIdx;
      this.dom.bondDistanceSelect.value = rIdx;
      this.updateHamiltonian();
    }
  }

  buildGateSliders() {
    const mol = MOLECULES_DB[this.currentMoleculeKey];
    this.dom.gateSlidersContainer.innerHTML = '';

    const paramLabels = mol.qubits === 2
      ? ['θ₀ [Rotación HOMO q0]', 'θ₁ [Rotación LUMO q1]', 'θ₂ [Excitación Doble CNOT]']
      : [
          'θ₀ [q0 Ry]', 'θ₁ [q1 Ry]', 'θ₂ [q2 Ry]', 'θ₃ [q3 Ry]',
          'θ₄ [q0 Ent]', 'θ₅ [q1 Ent]', 'θ₆ [q2 Ent]', 'θ₇ [q3 Ent]'
        ];

    this.params.forEach((val, idx) => {
      const group = document.createElement('div');
      group.className = 'slider-group';

      const header = document.createElement('div');
      header.className = 'slider-header';
      header.innerHTML = `<span>${paramLabels[idx] || `θ_${idx}`}:</span> <strong id="param-val-${idx}">${val.toFixed(3)} rad</strong>`;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '-3.14';
      slider.max = '3.14';
      slider.step = '0.02';
      slider.value = val;

      slider.addEventListener('input', (e) => {
        this.params[idx] = parseFloat(e.target.value);
        document.getElementById(`param-val-${idx}`).textContent = `${this.params[idx].toFixed(3)} rad`;
        this.evaluateCurrentVQE();
      });

      group.appendChild(header);
      group.appendChild(slider);
      this.dom.gateSlidersContainer.appendChild(group);
    });
  }

  updateHamiltonian() {
    const mol = MOLECULES_DB[this.currentMoleculeKey];
    const lvl = mol.levels[this.currentLevelIndex];
    this.dom.fciEnergyBadge.textContent = `${lvl.fciEnergy.toFixed(5)} Ha`;

    // Render Pauli Terms
    this.dom.pauliTermsList.innerHTML = '';
    lvl.pauliTerms.forEach(t => {
      const badge = document.createElement('span');
      badge.className = 'pauli-badge';
      const sign = t.coeff >= 0 ? '+' : '';
      badge.textContent = `${sign}${t.coeff.toFixed(4)} · ${t.pauli}`;
      this.dom.pauliTermsList.appendChild(badge);
    });

    this.evaluateCurrentVQE();
    this.renderBornOppenheimerCurve();
  }

  evaluateCurrentVQE() {
    const mol = MOLECULES_DB[this.currentMoleculeKey];
    const lvl = mol.levels[this.currentLevelIndex];

    const vqeEnergy = VQEAnsatzEngine.evaluateHamiltonian(
      lvl.pauliTerms,
      mol.qubits,
      mol.hfState,
      this.params,
      this.ansatzType
    );

    const precision = VQEAnsatzEngine.isChemicalPrecision(vqeEnergy, lvl.fciEnergy);
    const purity = AlchemyProgressionManager.getPurityGrade(precision.errorMHa);

    // Update Live Meters
    this.dom.vqeEnergyDisplay.textContent = `${vqeEnergy.toFixed(5)} Ha`;
    this.dom.fciEnergyDisplay.textContent = `${lvl.fciEnergy.toFixed(5)} Ha`;
    this.dom.errorMhaDisplay.textContent = `${precision.errorMHa.toFixed(2)} mHa`;

    this.dom.purityBadge.textContent = `${purity.badge} ${purity.grade}`;
    this.dom.purityBadge.style.color = purity.color;

    if (precision.achieved) {
      this.dom.precisionAlert.classList.remove('hidden');
      this.dom.precisionAlert.textContent = `✨ ¡PRECISIÓN QUÍMICA ALCANZADA! Error = ${precision.errorMHa.toFixed(2)} mHa < 1.6 mHa. La forja está lista para cristalizar.`;
    } else {
      this.dom.precisionAlert.classList.add('hidden');
    }
  }

  runClassicalOptimization() {
    const mol = MOLECULES_DB[this.currentMoleculeKey];
    const lvl = mol.levels[this.currentLevelIndex];

    this.playChime(440, 'triangle', 0.15);
    const result = VQEAnsatzEngine.optimizeVQE(
      lvl.pauliTerms,
      mol.qubits,
      mol.hfState,
      this.params,
      40
    );

    this.params = [...result.optimalParams];
    this.buildGateSliders();
    this.evaluateCurrentVQE();

    const precision = VQEAnsatzEngine.isChemicalPrecision(result.finalEnergy, lvl.fciEnergy);
    this.playChime(precision.achieved ? 659 : 350, 'sine', 0.3);

    alert(`⚡ Bucle VQE Híbrido Concluido:\nEnergía Óptima: ${result.finalEnergy.toFixed(5)} Ha\nError FCI: ${precision.errorMHa.toFixed(2)} mHa\n¿Precisión Química?: ${precision.achieved ? 'SÍ (Estable)' : 'NO (Ajusta Ansatz)'}`);
  }

  forgeCrystal() {
    const mol = MOLECULES_DB[this.currentMoleculeKey];
    const lvl = mol.levels[this.currentLevelIndex];
    const quest = ALCHEMY_QUESTS[this.currentQuestIndex];

    const vqeEnergy = VQEAnsatzEngine.evaluateHamiltonian(
      lvl.pauliTerms,
      mol.qubits,
      mol.hfState,
      this.params,
      this.ansatzType
    );

    const precision = VQEAnsatzEngine.isChemicalPrecision(vqeEnergy, lvl.fciEnergy);
    const purity = AlchemyProgressionManager.getPurityGrade(precision.errorMHa);

    if (!precision.achieved) {
      this.playChime(196, 'sawtooth', 0.3);
      alert(`⚠️ La forja es inestable. El error (${precision.errorMHa.toFixed(2)} mHa) supera la precisión química (< 1.6 mHa). Ejecuta la optimización VQE para estabilizar el cristal.`);
      return;
    }

    // Award XP
    const earnedXP = quest && quest.moleculeId === mol.id ? quest.rewardXP : 150;
    const newXP = this.db.addXP(earnedXP);

    const qasm = QasmEstimatorBridge.exportVQECircuit(mol, lvl.r, this.params, this.ansatzType);

    this.db.recordForging({
      moleculeId: mol.id,
      formula: mol.formula,
      r: lvl.r,
      vqeEnergy,
      fciEnergy: lvl.fciEnergy,
      errorMHa: precision.errorMHa,
      purityGrade: purity.grade,
      questId: quest ? quest.id : null,
      unlockMolecule: quest ? quest.unlockMolecule : null,
      qasm
    });

    this.playChime(784, 'sine', 0.4);
    alert(`🎉 ¡CRISTAL CUÁNTICO FORJADO CON ÉXITO!\nCompuesto: ${mol.name} (${mol.formula})\nPureza: ${purity.grade}\nXP Ganada: +${earnedXP} XP\n¡Registrado en el Grimorio Alquímico!`);

    this.populateSelects();
    this.updatePlayerUI();
  }

  updatePlayerUI() {
    const xp = this.db.getPlayerXP();
    const rank = AlchemyProgressionManager.getRankForXP(xp);
    this.dom.playerRankBadge.textContent = `${rank.icon} ${rank.title}`;
    this.dom.playerXpVal.textContent = `${xp} XP`;
  }

  showQasm() {
    const mol = MOLECULES_DB[this.currentMoleculeKey];
    const lvl = mol.levels[this.currentLevelIndex];
    const qasm = QasmEstimatorBridge.exportVQECircuit(mol, lvl.r, this.params, this.ansatzType);
    this.dom.qasmContent.textContent = qasm;
    this.dom.qasmModal.classList.remove('hidden');
  }

  renderBornOppenheimerCurve() {
    const canvas = this.dom.canvasBO;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const mol = MOLECULES_DB[this.currentMoleculeKey];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pad = 40;
    const w = canvas.width - pad * 2;
    const h = canvas.height - pad * 2;

    // Determine min/max energy
    const energies = mol.levels.map(l => l.fciEnergy);
    const minE = Math.min(...energies) - 0.05;
    const maxE = Math.max(...energies) + 0.05;
    const rValues = mol.levels.map(l => l.r);
    const minR = Math.min(...rValues) - 0.2;
    const maxR = Math.max(...rValues) + 0.2;

    // Grid lines
    ctx.strokeStyle = 'hsla(220, 20%, 30%, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, w, h);

    // Plot FCI curve (Teal line)
    ctx.beginPath();
    mol.levels.forEach((lvl, i) => {
      const x = pad + ((lvl.r - minR) / (maxR - minR)) * w;
      const y = pad + h - ((lvl.fciEnergy - minE) / (maxE - minE)) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'hsl(180, 90%, 55%)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Plot points
    mol.levels.forEach((lvl, i) => {
      const x = pad + ((lvl.r - minR) / (maxR - minR)) * w;
      const y = pad + h - ((lvl.fciEnergy - minE) / (maxE - minE)) * h;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = (i === this.currentLevelIndex) ? 'hsl(45, 100%, 60%)' : 'hsl(180, 90%, 55%)';
      ctx.fill();
    });

    // Current selected point label
    const curLvl = mol.levels[this.currentLevelIndex];
    const curX = pad + ((curLvl.r - minR) / (maxR - minR)) * w;
    const curY = pad + h - ((curLvl.fciEnergy - minE) / (maxE - minE)) * h;
    ctx.beginPath();
    ctx.arc(curX, curY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'hsl(45, 100%, 60%)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'hsl(220, 15%, 85%)';
    ctx.font = '11px monospace';
    ctx.fillText(`R_eq = ${mol.equilibriumR} Å`, pad + 10, pad + 20);
    ctx.fillText(`FCI = ${curLvl.fciEnergy.toFixed(4)} Ha`, pad + 10, pad + 35);
  }

  initCanvasRenderers() {
    // Orbital Cloud Canvas Animation
    const canvas = this.dom.canvasOrbitals;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw two atomic nuclei
      const mol = MOLECULES_DB[this.currentMoleculeKey];
      const lvl = mol.levels[this.currentLevelIndex];
      const sep = Math.min(120, lvl.r * 50);

      // Nucleus 1
      ctx.beginPath();
      ctx.arc(cx - sep / 2, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(45, 100%, 65%)';
      ctx.shadowColor = 'hsl(45, 100%, 50%)';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Nucleus 2
      ctx.beginPath();
      ctx.arc(cx + sep / 2, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Electron Cloud (HOMO bonding orbital density)
      ctx.beginPath();
      ctx.ellipse(cx, cy, sep / 1.5 + Math.sin(t * 0.05) * 4, 30 + Math.cos(t * 0.05) * 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(180, 90%, 50%, 0.18)';
      ctx.fill();

      // LUMO antibonding orbital lobes
      ctx.beginPath();
      ctx.arc(cx - sep / 2 - 18, cy, 14 + Math.sin(t * 0.08) * 2, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(280, 85%, 65%, 0.15)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx + sep / 2 + 18, cy, 14 + Math.sin(t * 0.08) * 2, 0, Math.PI * 2);
      ctx.fill();

      t++;
      requestAnimationFrame(animate);
    };

    animate();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new VQEAlchemistApp();
});
