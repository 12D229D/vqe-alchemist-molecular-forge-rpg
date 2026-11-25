/**
 * alchemy-rpg-progression.js
 * RPG Campaign, Quests, Guild Ranks, and Catalyst Synthesizer Progression.
 * Manages player experience (XP), Alchemist Titles, unlocked molecular recipes,
 * and chemical purity grades (Standard, High-Purity, Legend Quantum Gold).
 */

export const ALCHEMY_QUESTS = [
  {
    id: 'quest_1',
    name: 'Iniciación Alquímica: Forja de Dihidrógeno',
    rankRequired: 'Aprendiz Cuántico',
    moleculeId: 'h2',
    targetR: 0.74,
    description: 'Sintetiza la molécula más abundante del cosmos (H₂) en su punto de equilibrio. Sintoniza el ansatz para superar el estado Hartree-Fock y alcanzar precisión química (< 1.6 mHa).',
    rewardXP: 100,
    rewardTitle: 'Domador del Protón',
    unlockMolecule: 'heh_plus'
  },
  {
    id: 'quest_2',
    name: 'El Enlace Primordial: HeH⁺ del Cosmos Temprano',
    rankRequired: 'Adepto de Enlace',
    moleculeId: 'heh_plus',
    targetR: 0.77,
    description: 'El helio y el hidrógeno formaron el primer compuesto tras la recombinación del universo. Compensa la mayor carga nuclear del helio para estabilizar el enlace.',
    rewardXP: 250,
    rewardTitle: 'Cosmoquímico Ancestral',
    unlockMolecule: 'lih'
  },
  {
    id: 'quest_3',
    name: 'Disociación Molecular: Rompiendo el Vínculo H₂',
    rankRequired: 'Adepto de Enlace',
    moleculeId: 'h2',
    targetR: 2.0,
    description: 'En grandes distancias interatómicas (R=2.0 Å), la correlación estática destruye la validez de Hartree-Fock. Solo un ansatz cuántico entrelazado puede encontrar la energía correcta.',
    rewardXP: 400,
    rewardTitle: 'Disociador Entrelazado',
    unlockMolecule: 'beh2'
  },
  {
    id: 'quest_4',
    name: 'Transmutación Iónica: Cristales de LiH',
    rankRequired: 'Maestro de Orbitales',
    moleculeId: 'lih',
    targetR: 1.59,
    description: 'Construye un ansatz de 4 qubits con compuertas CNOT entrelazantes para forjar Hidruro de Litio sólido con precisión de laboratorio.',
    rewardXP: 700,
    rewardTitle: 'Cristalógrafo Cuántico',
    unlockMolecule: 'co2_catalyst'
  },
  {
    id: 'quest_5',
    name: 'La Gran Obra Verde: Catalizador de Captura de CO₂',
    rankRequired: 'Gran Alquimista Cuántico',
    moleculeId: 'co2_catalyst',
    targetR: 1.15,
    description: 'La forja magna: Optimiza el complejo catalítico de níquel para absorber dióxido de carbono y transmutarlo en combustible ecológico.',
    rewardXP: 1200,
    rewardTitle: 'Señor del Ecosistema Cuántico',
    unlockMolecule: null
  }
];

export const ALCHEMY_RANKS = [
  { minXP: 0, title: 'Iniciado de la Forja', icon: '🧪', maxQubits: 2 },
  { minXP: 100, title: 'Aprendiz Cuántico', icon: '⚗️', maxQubits: 2 },
  { minXP: 350, title: 'Adepto de Enlace', icon: '🔮', maxQubits: 4 },
  { minXP: 800, title: 'Maestro de Orbitales', icon: '⚡', maxQubits: 4 },
  { minXP: 1600, title: 'Gran Alquimista Cuántico', icon: '👑', maxQubits: 4 }
];

export class AlchemyProgressionManager {
  static getRankForXP(xp) {
    let current = ALCHEMY_RANKS[0];
    for (const r of ALCHEMY_RANKS) {
      if (xp >= r.minXP) current = r;
    }
    return current;
  }

  static getPurityGrade(errorMHa) {
    if (errorMHa <= 0.5) {
      return { grade: 'Trascendente (Oro Cuántico)', badge: '🌟🌟🌟', color: 'hsl(45, 100%, 60%)' };
    }
    if (errorMHa <= 1.6) {
      return { grade: 'Precisión Química (Certificado)', badge: '🌟🌟', color: 'hsl(145, 80%, 55%)' };
    }
    if (errorMHa <= 5.0) {
      return { grade: 'Grado Industrial (Aceptable)', badge: '🌟', color: 'hsl(200, 90%, 60%)' };
    }
    return { grade: 'Sub-Hartree (Inestable)', badge: '⚠️', color: 'hsl(0, 80%, 60%)' };
  }
}
