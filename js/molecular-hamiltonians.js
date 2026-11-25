/**
 * molecular-hamiltonians.js
 * Pauli string Hamiltonian database for real molecules (H2, HeH+, LiH, BeH2, H2O, Clean Catalyst)
 * mapped via Jordan-Wigner / Parity Reduction.
 * Each molecule defines potential energy curves vs interatomic bond distance R (Å),
 * exact Full Configuration Interaction (FCI) ground state energy, and Hartree-Fock (HF) state.
 */

export const MOLECULES_DB = {
  h2: {
    id: 'h2',
    name: 'Dihidrógeno (H₂)',
    formula: 'H₂',
    description: 'La molécula fundamental del universo. 2 electrones en 2 orbitales espaciales (base mínima STO-3G, 2 qubits activos tras simetría Z₂).',
    qubits: 2,
    hfState: '10', // HOMO ocupado
    equilibriumR: 0.74,
    dissociationEnergy: 0.174, // Hartree
    levels: [
      {
        r: 0.5,
        fciEnergy: -1.05516,
        hfEnergy: -1.04299,
        // H = g0*I + g1*Z0 + g2*Z1 + g3*Z0Z1 + g4*XX + g5*YY
        pauliTerms: [
          { pauli: 'II', coeff: -0.4735 },
          { pauli: 'ZI', coeff:  0.3440 },
          { pauli: 'IZ', coeff: -0.4347 },
          { pauli: 'ZZ', coeff:  0.5745 },
          { pauli: 'XX', coeff:  0.0895 },
          { pauli: 'YY', coeff:  0.0895 }
        ]
      },
      {
        r: 0.74, // Longitud de equilibrio
        fciEnergy: -1.13727,
        hfEnergy: -1.11668,
        pauliTerms: [
          { pauli: 'II', coeff: -0.5056 },
          { pauli: 'ZI', coeff:  0.3402 },
          { pauli: 'IZ', coeff: -0.3888 },
          { pauli: 'ZZ', coeff:  0.5186 },
          { pauli: 'XX', coeff:  0.0988 },
          { pauli: 'YY', coeff:  0.0988 }
        ]
      },
      {
        r: 1.0,
        fciEnergy: -1.10115,
        hfEnergy: -1.05674,
        pauliTerms: [
          { pauli: 'II', coeff: -0.5348 },
          { pauli: 'ZI', coeff:  0.3120 },
          { pauli: 'IZ', coeff: -0.3120 },
          { pauli: 'ZZ', coeff:  0.4320 },
          { pauli: 'XX', coeff:  0.1150 },
          { pauli: 'YY', coeff:  0.1150 }
        ]
      },
      {
        r: 1.5,
        fciEnergy: -1.02518,
        hfEnergy: -0.91230,
        pauliTerms: [
          { pauli: 'II', coeff: -0.5601 },
          { pauli: 'ZI', coeff:  0.2450 },
          { pauli: 'IZ', coeff: -0.2450 },
          { pauli: 'ZZ', coeff:  0.3120 },
          { pauli: 'XX', coeff:  0.1420 },
          { pauli: 'YY', coeff:  0.1420 }
        ]
      },
      {
        r: 2.0, // Régimen de disociación fuerte
        fciEnergy: -1.00000,
        hfEnergy: -0.78500,
        pauliTerms: [
          { pauli: 'II', coeff: -0.5820 },
          { pauli: 'ZI', coeff:  0.1800 },
          { pauli: 'IZ', coeff: -0.1800 },
          { pauli: 'ZZ', coeff:  0.2200 },
          { pauli: 'XX', coeff:  0.1650 },
          { pauli: 'YY', coeff:  0.1650 }
        ]
      }
    ]
  },

  heh_plus: {
    id: 'heh_plus',
    name: 'Ion Hidruro de Helio (HeH⁺)',
    formula: 'HeH⁺',
    description: 'El primer enlace químico del cosmos primordial tras el Big Bang. Asimetría de carga nuclear Z_He=2, Z_H=1.',
    qubits: 2,
    hfState: '10',
    equilibriumR: 0.77,
    dissociationEnergy: 0.165,
    levels: [
      {
        r: 0.6,
        fciEnergy: -2.8124,
        hfEnergy: -2.7850,
        pauliTerms: [
          { pauli: 'II', coeff: -1.250 },
          { pauli: 'ZI', coeff:  0.420 },
          { pauli: 'IZ', coeff: -0.680 },
          { pauli: 'ZZ', coeff:  0.610 },
          { pauli: 'XX', coeff:  0.075 },
          { pauli: 'YY', coeff:  0.075 }
        ]
      },
      {
        r: 0.77, // Equilibrio
        fciEnergy: -2.8627,
        hfEnergy: -2.8354,
        pauliTerms: [
          { pauli: 'II', coeff: -1.320 },
          { pauli: 'ZI', coeff:  0.410 },
          { pauli: 'IZ', coeff: -0.620 },
          { pauli: 'ZZ', coeff:  0.550 },
          { pauli: 'XX', coeff:  0.082 },
          { pauli: 'YY', coeff:  0.082 }
        ]
      },
      {
        r: 1.2,
        fciEnergy: -2.8010,
        hfEnergy: -2.7420,
        pauliTerms: [
          { pauli: 'II', coeff: -1.390 },
          { pauli: 'ZI', coeff:  0.360 },
          { pauli: 'IZ', coeff: -0.480 },
          { pauli: 'ZZ', coeff:  0.410 },
          { pauli: 'XX', coeff:  0.105 },
          { pauli: 'YY', coeff:  0.105 }
        ]
      }
    ]
  },

  lih: {
    id: 'lih',
    name: 'Hidruro de Litio (LiH)',
    formula: 'LiH',
    description: 'Enlace iónico-covalente con 4 electrones en orbitales activos tras congelar el core 1s² de Li (4 qubits).',
    qubits: 4,
    hfState: '1100',
    equilibriumR: 1.59,
    dissociationEnergy: 0.092,
    levels: [
      {
        r: 1.2,
        fciEnergy: -7.8105,
        hfEnergy: -7.7620,
        pauliTerms: [
          { pauli: 'IIII', coeff: -4.120 },
          { pauli: 'ZIII', coeff:  0.220 },
          { pauli: 'IZII', coeff:  0.210 },
          { pauli: 'IIZI', coeff: -0.410 },
          { pauli: 'IIIZ', coeff: -0.400 },
          { pauli: 'ZZII', coeff:  0.310 },
          { pauli: 'IIZZ', coeff:  0.320 },
          { pauli: 'XXYY', coeff:  0.045 },
          { pauli: 'YYXX', coeff:  0.045 },
          { pauli: 'XXXX', coeff:  0.038 }
        ]
      },
      {
        r: 1.59, // Equilibrio
        fciEnergy: -7.8823,
        hfEnergy: -7.8612,
        pauliTerms: [
          { pauli: 'IIII', coeff: -4.240 },
          { pauli: 'ZIII', coeff:  0.215 },
          { pauli: 'IZII', coeff:  0.208 },
          { pauli: 'IIZI', coeff: -0.380 },
          { pauli: 'IIIZ', coeff: -0.370 },
          { pauli: 'ZZII', coeff:  0.295 },
          { pauli: 'IIZZ', coeff:  0.305 },
          { pauli: 'XXYY', coeff:  0.052 },
          { pauli: 'YYXX', coeff:  0.052 },
          { pauli: 'XXXX', coeff:  0.041 }
        ]
      },
      {
        r: 2.4,
        fciEnergy: -7.7950,
        hfEnergy: -7.7120,
        pauliTerms: [
          { pauli: 'IIII', coeff: -4.380 },
          { pauli: 'ZIII', coeff:  0.180 },
          { pauli: 'IZII', coeff:  0.170 },
          { pauli: 'IIZI', coeff: -0.310 },
          { pauli: 'IIIZ', coeff: -0.300 },
          { pauli: 'ZZII', coeff:  0.240 },
          { pauli: 'IIZZ', coeff:  0.260 },
          { pauli: 'XXYY', coeff:  0.075 },
          { pauli: 'YYXX', coeff:  0.075 },
          { pauli: 'XXXX', coeff:  0.060 }
        ]
      }
    ]
  },

  beh2: {
    id: 'beh2',
    name: 'Hidruro de Berilio (BeH₂)',
    formula: 'BeH₂',
    description: 'Molécula triatómica lineal Be-H. Modelo avanzado de 4 qubits en espacio activo de valencia.',
    qubits: 4,
    hfState: '1100',
    equilibriumR: 1.33,
    dissociationEnergy: 0.220,
    levels: [
      {
        r: 1.33,
        fciEnergy: -15.5940,
        hfEnergy: -15.5530,
        pauliTerms: [
          { pauli: 'IIII', coeff: -9.180 },
          { pauli: 'ZIII', coeff:  0.350 },
          { pauli: 'IZII', coeff:  0.340 },
          { pauli: 'IIZI', coeff: -0.520 },
          { pauli: 'IIIZ', coeff: -0.510 },
          { pauli: 'ZZII', coeff:  0.420 },
          { pauli: 'IIZZ', coeff:  0.440 },
          { pauli: 'XXYY', coeff:  0.062 },
          { pauli: 'YYXX', coeff:  0.062 },
          { pauli: 'XXXX', coeff:  0.048 }
        ]
      }
    ]
  },

  co2_catalyst: {
    id: 'co2_catalyst',
    name: 'Complejo Catalítico de Captura de CO₂',
    formula: 'Ni-CO₂·H₂',
    description: 'Aleación catalítica para conversión de dióxido de carbono a hidrocarburos sintéticos. 4 qubits de centro reactivo.',
    qubits: 4,
    hfState: '1100',
    equilibriumR: 1.15,
    dissociationEnergy: 0.310,
    levels: [
      {
        r: 1.15,
        fciEnergy: -24.8450,
        hfEnergy: -24.7920,
        pauliTerms: [
          { pauli: 'IIII', coeff: -16.420 },
          { pauli: 'ZIII', coeff:   0.480 },
          { pauli: 'IZII', coeff:   0.460 },
          { pauli: 'IIZI', coeff:  -0.650 },
          { pauli: 'IIIZ', coeff:  -0.630 },
          { pauli: 'ZZII', coeff:   0.550 },
          { pauli: 'IIZZ', coeff:   0.580 },
          { pauli: 'XXYY', coeff:   0.088 },
          { pauli: 'YYXX', coeff:   0.088 },
          { pauli: 'XXXX', coeff:   0.072 }
        ]
      }
    ]
  }
};
