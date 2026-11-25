# vqe-alchemist-molecular-forge-rpg

> **RPG de Alquimia Cuántica y Forja Molecular mediante el Algoritmo Variacional VQE (Variational Quantum Eigensolver).**  
> *Sintetiza moléculas reales ($\text{H}_2, \text{HeH}^+, \text{LiH}, \text{BeH}_2$, catalizadores ecológicos) alcanzando la Precisión Química ($< 1.6 \text{ mHa}$) a lo largo de las curvas de potencial de Born-Oppenheimer.*

---

## 📌 Visión General

`vqe-alchemist-molecular-forge-rpg` combina la progresión RPG de fantasía científica con los fundamentos de la química cuántica computacional. En lugar de forjar armas convencionales, el jugador encarna a un Alquimista Cuántico que estabiliza compuestos químicos resolviendo la ecuación de Schrödinger electrónica mapeada a computadoras cuánticas mediante la transformación de **Jordan-Wigner**:

$$\hat{H}_{\text{mol}} = \sum_k c_k \hat{P}_k \quad (\hat{P}_k \in \{I, X, Y, Z\}^{\otimes n})$$

El jugador diseña un *Ansatz* variacional (UCCSD o Hardware-Efficient), rota excitaciones electrónicas con compuertas $R_y(\theta)$ y escaleras `CNOT`, y activa un optimizador clásico híbrido (Powell / descenso coordinado) para converger al estado fundamental $E_0 \le \langle \psi(\vec{\theta}) | \hat{H} | \psi(\vec{\theta}) \rangle$. Cuando el error respecto al valor exacto de interacción de configuraciones completas (FCI) es menor a **$1.6 \text{ mHa}$ (1 kcal/mol — Precisión Química)**, el cristal se forja con éxito.

---

## 🚀 Características Principales

1. **Base de Datos Molecular Real (`js/molecular-hamiltonians.js`):**
   - Coeficientes de Pauli reales para $\text{H}_2$, $\text{HeH}^+$, $\text{LiH}$, $\text{BeH}_2$ y catalizadores de captura de $\text{CO}_2$ en base mínima STO-3G y simetrías $Z_2$.
   - Curvas de energía potencial vs. distancia interatómica $R$ ($\text{\AA}$).
2. **Motor Variacional VQE (`js/vqe-ansatz-engine.js`):**
   - Estado de referencia Hartree-Fock $|\Phi_{\text{HF}}\rangle$.
   - Compuertas de rotación $R_y(\theta)$ y compuertas entrelazantes CNOT.
   - Cálculo analítico del valor esperado tensorial $\sum c_k \langle P_k \rangle$.
   - Optimizador clásico sin gradientes estilo Powell.
3. **Campaña de Misiones del Gremio Alquímico (`js/alchemy-rpg-progression.js`):**
   - Sistema de rangos (Iniciado, Aprendiz, Adepto, Maestro, Gran Alquimista).
   - Calidades de pureza: *Oro Cuántico* ($< 0.5 \text{ mHa}$), *Precisión Química* ($< 1.6 \text{ mHa}$), *Industrial* ($< 5.0 \text{ mHa}$).
4. **Exportador OpenQASM 3.0 (`js/qasm-estimator-bridge.js`):**
   - Generación de código OpenQASM 3.0 y script de Qiskit Runtime EstimatorV2.
5. **Persistencia SQLite (`js/db.js`):**
   - Registro de compuestos cristalizados, XP y desbloqueo de recetas.

---

## 💻 Ejecución Local

No requiere transpiladores ni node_modules:
```bash
# Servidor estático
python -m http.server 8080
# o
npx serve .
```
Abre en tu navegador `http://localhost:8080` para jugar la forja.
