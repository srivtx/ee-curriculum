// Starter Python scripts for playground lessons.
// Each snippet is educational, runs in Pyodide (numpy/scipy/matplotlib),
// and prints concise output. Where useful, it renders a plot via
// matplotlib (saved to /tmp/plot.png and surfaced as base64 PNG by the
// PythonPlayground component).

export interface Snippet {
  code: string;
  /** Hint shown above the editor describing what the demo does. */
  hint: string;
  /** Whether the snippet produces a matplotlib plot. */
  hasPlot: boolean;
}

const PLOT_HEADER = `import matplotlib
matplotlib.use('Agg')  # headless backend for Pyodide
import matplotlib.pyplot as plt
import numpy as np
`;

export const PLAYGROUND_SNIPPETS: Record<string, Snippet> = {
  // ── Phase 0 — Math Bridge ────────────────────────────────────────────
  'p0m1l4': {
    hint: 'Euler\u2019s identity in action: convert between Cartesian and polar form, then visualize three phasors as rotating vectors.',
    hasPlot: true,
    code: `${PLOT_HEADER}# Complex numbers & phasors
# z = 3 + 4j  ->  |z| = 5,  angle = 53.13 deg
z = 3 + 4j
print(f"z        = {z}")
print(f"|z|      = {abs(z):.4f}")
print(f"angle    = {np.angle(z, deg=True):.4f} deg")
print(f"conj(z)  = {np.conj(z)}")
print(f"z * conj = {z * np.conj(z)}  (real, = |z|^2)")

# Three phasors at the same frequency
V = [5 + 0j, 3 * np.exp(1j * np.pi/3), 2 * np.exp(1j * np.pi/2)]
labels = ['V1 = 5\u2220\u00b0', 'V2 = 3\u222060\u00b0', 'V3 = 2\u222090\u00b0']
Vsum = sum(V)
print(f"\\nV1 + V2 + V3 = {Vsum.real:.3f} + {Vsum.imag:.3f}j")
print(f"|sum|        = {abs(Vsum):.3f},  angle = {np.angle(Vsum, deg=True):.2f} deg")

# Plot the phasors
fig, ax = plt.subplots(figsize=(6, 5))
for v, lab in zip(V, labels):
    ax.arrow(0, 0, v.real, v.imag, head_width=0.15, length_includes_head=True, linewidth=2)
    ax.text(v.real * 1.1, v.imag * 1.1, lab, fontsize=10)
ax.arrow(0, 0, Vsum.real, Vsum.imag, head_width=0.2, length_includes_head=True,
         linewidth=3, color='red', label='Sum')
ax.text(Vsum.real * 1.1, Vsum.imag * 1.1, 'Sum', fontsize=11, color='red', fontweight='bold')
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.set_xlim(-1, 7); ax.set_ylim(-1, 7)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.set_title('Phasor addition'); plt.tight_layout()
plt.savefig('/tmp/plot.png', dpi=110); print('\\n[plot saved]')
`,
  },

  // ── Phase 1 — DC circuits ────────────────────────────────────────────
  'p1m2l4': {
    hint: 'Solve a 4-node circuit with nodal analysis by building the conductance matrix G and source vector I, then solving G\u00b7V = I.',
    hasPlot: false,
    code: `import numpy as np
# Nodal analysis:  G * V = I
# Circuit:  5V source -> R1=1k -> node A -> R2=2k -> node B -> R3=3k -> GND
# Plus a 2k resistor from node A to GND.
# Unknowns: V_A, V_B  (node 0 = ground = 0V)

# Resistor values (ohms)
R1, R2, R3, R4 = 1000, 2000, 3000, 2000  # R4 = A->GND

G = np.zeros((2, 2))
# KCL at node A: (V_A - 5)/R1 + V_A/R4 + (V_A - V_B)/R2 = 0
G[0, 0] = 1/R1 + 1/R4 + 1/R2
G[0, 1] = -1/R2
# KCL at node B: (V_B - V_A)/R2 + V_B/R3 = 0
G[1, 0] = -1/R2
G[1, 1] = 1/R2 + 1/R3

I = np.array([5/R1, 0])  # injected current from the 5V source via R1
V = np.linalg.solve(G, I)
print(f"V_A = {V[0]:.4f} V")
print(f"V_B = {V[1]:.4f} V")

# Branch currents
i_R1 = (5 - V[0]) / R1
i_R2 = (V[0] - V[1]) / R2
i_R3 = V[1] / R3
i_R4 = V[0] / R4
print(f"\\ni_R1 = {i_R1*1000:.3f} mA   (5V -> A)")
print(f"i_R2 = {i_R2*1000:.3f} mA   (A -> B)")
print(f"i_R3 = {i_R3*1000:.3f} mA   (B -> GND)")
print(f"i_R4 = {i_R4*1000:.3f} mA   (A -> GND)")

# KCL sanity check at node A
print(f"\\nKCL at A: in - out = {(i_R1 - i_R2 - i_R4)*1e6:.3f} uA (should be ~0)")
`,
  },

  'p1m6l2': {
    hint: 'First-order RC step response: v(t) = Vs \u00b7 (1 - exp(-t/RC)). Plot the 63% / 95% / 99% markers at 1\u03c4, 3\u03c4, 5\u03c4.',
    hasPlot: true,
    code: `${PLOT_HEADER}# RC step response
R = 1e3        # 1 kohm
C = 1e-6       # 1 uF
tau = R * C    # time constant
Vs = 5.0       # step amplitude
t = np.linspace(0, 6 * tau, 400)
v = Vs * (1 - np.exp(-t / tau))

print(f"tau = RC = {tau*1e3:.1f} ms")
print(f"v(1\u03c4) = {Vs * (1 - np.exp(-1)):.3f} V  (63.2%)")
print(f"v(3\u03c4) = {Vs * (1 - np.exp(-3)):.3f} V  (95.0%)")
print(f"v(5\u03c4) = {Vs * (1 - np.exp(-5)):.3f} V  (99.3%)")

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(t * 1e3, v, lw=2, color='#0d9488')
for k, pct in [(1, 63.2), (3, 95.0), (5, 99.3)]:
    ax.axvline(k * tau * 1e3, color='gray', ls='--', lw=0.8)
    ax.axhline(Vs * pct / 100, color='gray', ls=':', lw=0.8)
    ax.annotate(f'{k}\u03c4 \u2192 {pct}%', xy=(k * tau * 1e3, Vs * pct / 100),
                xytext=(k * tau * 1e3 + 0.3, Vs * pct / 100 - 0.4), fontsize=9)
ax.set_xlabel('t (ms)'); ax.set_ylabel('v_C(t)  [V]')
ax.set_title(f'RC step response  (\u03c4 = {tau*1e3:.1f} ms)')
ax.grid(True, alpha=0.3); ax.set_ylim(0, Vs * 1.1)
plt.tight_layout(); plt.savefig('/tmp/plot.png', dpi=110)
print('\\n[plot saved]')
`,
  },

  'p1m6l3': {
    hint: 'Second-order RLC transient \u2014 sweep damping ratio \u03b6 and watch the response transition from overdamped to underdamped.',
    hasPlot: true,
    code: `${PLOT_HEADER}from scipy.integrate import odeint
# Series RLC step response
# s^2 + 2*zeta*wn*s + wn^2 = 0
# wn = 1/sqrt(LC),  zeta = (R/2) * sqrt(C/L)
L = 10e-3      # 10 mH
C = 100e-9     # 100 nF
wn = 1 / np.sqrt(L * C)
print(f"wn = {wn:.1f} rad/s   fn = {wn/(2*np.pi):.1f} Hz")

def rlc(y, t, zeta):
    # state: [v_C, dv_C/dt];  dv_C/dt = i_L/C;  di_L/dt = (Vs - R*i - v_C)/L
    vC, iL = y
    R = 2 * zeta * np.sqrt(L / C)
    dvC = iL / C
    diL = (5.0 - R * iL - vC) / L
    return [dvC, diL]

t = np.linspace(0, 2e-3, 600)
fig, ax = plt.subplots(figsize=(7, 4))
colors = ['#dc2626', '#d97706', '#0d9488', '#0891b2']
for zeta, c in zip([1.5, 1.0, 0.5, 0.2], colors):
    R = 2 * zeta * np.sqrt(L / C)
    sol = odeint(rlc, [0, 0], t, args=(zeta,))
    label = '\u03b6=%.1f (R=%d\u03a9)' % (zeta, R)
    ax.plot(t * 1e3, sol[:, 0], color=c, lw=1.8, label=label)

ax.axhline(5.0, color='k', ls=':', lw=0.6)
ax.set_xlabel('t (ms)'); ax.set_ylabel('v_C(t)  [V]')
ax.set_title('RLC step response \u2014 four damping regimes')
ax.grid(True, alpha=0.3); ax.legend(fontsize=9)
plt.tight_layout(); plt.savefig('/tmp/plot.png', dpi=110)
print('\\n[plot saved]')
`,
  },

  // ── Phase 2 — AC ─────────────────────────────────────────────────────
  'p2m4l2': {
    hint: 'Bode plot of a 2nd-order low-pass: H(s) = \u03c9n\u00b2 / (s\u00b2 + 2\u03b6\u03c9n s + \u03c9n\u00b2). Magnitude in dB, phase in degrees.',
    hasPlot: true,
    code: `${PLOT_HEADER}from scipy import signal
wn = 1000.0   # natural freq (rad/s)
zetas = [0.2, 0.5, 1.0, 1.5]
w = np.logspace(1, 5, 600)

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(7, 5.5), sharex=True)
for z in zetas:
    num = [wn**2]
    den = [1, 2 * z * wn, wn**2]
    w_, h = signal.freqs(num, den, worN=w)
    mag_db = 20 * np.log10(np.abs(h) + 1e-12)
    phase_deg = np.degrees(np.unwrap(np.angle(h)))
    ax1.semilogx(w_, mag_db, lw=1.8, label=f'\u03b6={z}')
    ax2.semilogx(w_, phase_deg, lw=1.8, label=f'\u03b6={z}')

ax1.axvline(wn, color='k', ls=':', lw=0.6); ax1.axhline(-3, color='gray', ls=':', lw=0.6)
ax1.set_ylabel('|H| (dB)'); ax1.grid(True, alpha=0.3, which='both'); ax1.legend(fontsize=9)
ax1.set_title('Bode plot \u2014 2nd-order low-pass  (\u03c9n = 1000 rad/s)')
ax2.set_xlabel('\u03c9 (rad/s)'); ax2.set_ylabel('\u2220H (deg)')
ax2.grid(True, alpha=0.3, which='both'); ax2.set_ylim(-200, 10)
plt.tight_layout(); plt.savefig('/tmp/plot.png', dpi=110)
print('Bode plot saved.')
print('Note: each pole contributes -20 dB/decade and -90\u00b0 phase asymptote.')
`,
  },

  // ── Phase 5 — Signals / DSP ──────────────────────────────────────────
  'p5m1l2': {
    hint: 'Convolution as a sliding dot product: y[n] = (x * h)[n]. Visualize x, h, and the resulting y for a moving-average filter.',
    hasPlot: true,
    code: `${PLOT_HEADER}# Discrete convolution
x = np.array([0, 0, 1, 2, 3, 2, 1, 0, 0, 0], dtype=float)
h = np.array([1, 1, 1]) / 3.0   # 3-point moving average
y = np.convolve(x, h, mode='full')

print(f"x has {len(x)} samples, h has {len(h)} samples")
print(f"y = x*h has {len(y)} samples (len(x)+len(h)-1)")
print(f"y = {np.round(y, 3)}")

fig, axes = plt.subplots(3, 1, figsize=(7, 5.5), sharex=False)
axes[0].stem(np.arange(len(x)), x, basefmt=' ', linefmt='#0d9488', markerfmt='o')
axes[0].set_title('x[n]'); axes[0].set_ylim(-0.2, 3.5); axes[0].grid(alpha=0.3)
axes[1].stem(np.arange(len(h)), h, basefmt=' ', linefmt='#d97706', markerfmt='s')
axes[1].set_title('h[n]  (3-pt moving average)'); axes[1].set_ylim(-0.1, 0.6); axes[1].grid(alpha=0.3)
axes[2].stem(np.arange(len(y)), y, basefmt=' ', linefmt='#0891b2', markerfmt='^')
axes[2].set_title('y[n] = x * h'); axes[2].set_ylim(-0.2, 2.5); axes[2].grid(alpha=0.3)
plt.tight_layout(); plt.savefig('/tmp/plot.png', dpi=110)
print('\\n[plot saved]')
`,
  },

  'p5m3l2': {
    hint: 'Parseval\u2019s theorem: \u03a3|x[n]|\u00b2 = (1/N)\u00b7\u03a3|X[k]|\u00b2. Verify energy is conserved between time and frequency domains.',
    hasPlot: false,
    code: `import numpy as np
# Parseval: sum(|x[n]|^2) = (1/N) * sum(|X[k]|^2)
N = 64
n = np.arange(N)
x = np.cos(2 * np.pi * 5 * n / N) + 0.5 * np.cos(2 * np.pi * 12 * n / N)
X = np.fft.fft(x)

E_time = np.sum(np.abs(x) ** 2)
E_freq = np.sum(np.abs(X) ** 2) / N
print(f"N = {N}")
print(f"Energy in time domain:  sum(|x[n]|^2)   = {E_time:.6f}")
print(f"Energy in freq domain:  (1/N)*sum|X[k]|^2 = {E_freq:.6f}")
print(f"Match? {np.isclose(E_time, E_freq)}  (diff = {abs(E_time - E_freq):.2e})")

# DFT shift property: shift x by n0 -> X[k] * exp(-j*2pi*k*n0/N), |X[k]| unchanged
n0 = 7
x_shift = np.roll(x, n0)
X_shift = np.fft.fft(x_shift)
print(f"\\nShift by n0={n0}:")
print(f"  max |X|       = {np.max(np.abs(X)):.6f}")
print(f"  max |X_shift| = {np.max(np.abs(X_shift)):.6f}  (should be identical)")

# Scaling: x[2n] -> X[2k] with periodic repetition
x_scaled = x[::2]
X_scaled = np.fft.fft(x_scaled)
print(f"\\nDecimate by 2 (x[2n]):  original peak at bin 5 -> decimated peak near bin 5 (mod {len(x_scaled)})")
print(f"  top-2 decimated bins: {np.argsort(np.abs(X_scaled))[-2:][::-1]}")
`,
  },

  'p5m4l1': {
    hint: 'Laplace transform & pole/zero plot. Build H(s) = (s - z1) / (s - p1)(s - p2) and visualize the s-plane.',
    hasPlot: true,
    code: `${PLOT_HEADER}# Pole/zero plot in the s-plane
# H(s) = (s - z1) / ((s - p1)*(s - p2))
z1 = -2 + 0j
p1 = -1 + 4j
p2 = -1 - 4j

# Quick analytic: damped sinusoid, settling time ~ 4/(Re(pole)) = 4s
print(f"Zeros: {z1}")
print(f"Poles: {p1}, {p2}")
print(f"Settling time ~ 4/sigma = {4/abs(p1.real):.2f} s")
print(f"Damped freq = {abs(p1.imag):.2f} rad/s")

fig, ax = plt.subplots(figsize=(6, 6))
ax.plot(z1.real, z1.imag, 'o', ms=12, mfc='none', mec='#d97706', mew=2, label='zero')
ax.plot(p1.real, p1.imag, 'x', ms=12, mew=3, color='#dc2626', label='pole')
ax.plot(p2.real, p2.imag, 'x', ms=12, mew=3, color='#dc2626')
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
# Shade stable region (left half plane)
ax.axvspan(-6, 0, color='#059669', alpha=0.08)
ax.text(-3, 5, 'stable\\n(LHP)', color='#059669', fontsize=10, ha='center')
ax.set_xlim(-6, 4); ax.set_ylim(-6, 6)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.set_xlabel('Re(s)'); ax.set_ylabel('Im(s)')
ax.set_title('s-plane pole/zero map'); ax.legend()
plt.tight_layout(); plt.savefig('/tmp/plot.png', dpi=110)
print('\\n[plot saved]')
`,
  },

  'p5m6l1': {
    hint: 'Z-transform & stability: a pole inside the unit circle means stable. Plot the z-plane with the unit circle.',
    hasPlot: true,
    code: `${PLOT_HEADER}# Z-plane: stability iff poles inside unit circle
# H(z) = 1 / (1 - a*z^-1),  a = 0.9 stable, a = 1.1 unstable
th = np.linspace(0, 2 * np.pi, 200)
fig, ax = plt.subplots(figsize=(6, 6))
ax.plot(np.cos(th), np.sin(th), color='#0d9488', lw=1.5, label='unit circle')
for a, c, lab in [(0.9, '#059669', 'stable (a=0.9)'),
                  (1.1, '#dc2626', 'unstable (a=1.1)')]:
    pole = a + 0j
    ax.plot(pole.real, pole.imag, 'x', ms=14, mew=3, color=c, label=lab)
    # impulse response
    n = np.arange(20)
    h = a ** n
    print(f"a={a}: h[5]={h[5]:.3f}, h[19]={h[19]:.3f}")
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.set_xlim(-1.8, 1.8); ax.set_ylim(-1.8, 1.8)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.set_xlabel('Re(z)'); ax.set_ylabel('Im(z)')
ax.set_title('Z-plane \u2014 unit circle test for stability'); ax.legend(fontsize=9)
plt.tight_layout(); plt.savefig('/tmp/plot.png', dpi=110)
print('\\nRule: ALL poles inside |z|=1 -> stable causal LTI system.')
`,
  },

  'p5m7l1': {
    hint: 'DFT & spectral leakage: a non-integer-period sine leaks across bins. Apply a Hann window to see the sidelobes drop.',
    hasPlot: true,
    code: `${PLOT_HEADER}# DFT of a sine that is NOT periodic in N -> spectral leakage
N = 64
n = np.arange(N)
f0 = 5.4   # not integer -> leakage
x = np.sin(2 * np.pi * f0 * n / N)
win = np.hanning(N)
xw = x * win
X  = np.abs(np.fft.fft(x))  / N
Xw = np.abs(np.fft.fft(xw)) / N
bins = np.arange(N)

fig, ax = plt.subplots(figsize=(7, 4))
ax.stem(bins[:N//2], X[:N//2],  basefmt=' ', linefmt='#dc2626', markerfmt='o', label='rect (no window)')
ax.stem(bins[:N//2] + 0.3, Xw[:N//2], basefmt=' ', linefmt='#0d9488', markerfmt='s', label='Hann window')
ax.set_yscale('log')
ax.set_xlabel('DFT bin k'); ax.set_ylabel('|X[k]| / N')
ax.set_title(f'Spectral leakage \u2014 sine at f0={f0} (non-integer bin)')
ax.grid(True, alpha=0.3, which='both'); ax.legend(fontsize=9)
plt.tight_layout(); plt.savefig('/tmp/plot.png', dpi=110)
print(f"True frequency bin = {f0} (between bins 5 and 6)")
print(f"Rect peak bin:  {np.argmax(X)}   Hann peak bin: {np.argmax(Xw)}")
print("Windowing trades resolution for much lower sidelobes.")
`,
  },

  'p5m8l2': {
    hint: 'IIR design via bilinear transform: design an analog Butterworth low-pass, warp to digital, and compare magnitude responses.',
    hasPlot: true,
    code: `${PLOT_HEADER}from scipy import signal
# Digital Butterworth low-pass via bilinear transform
fs = 8000
fc = 800   # cutoff
order = 4
b, a = signal.butter(order, fc, btype='low', fs=fs, analog=False)
w, h = signal.freqz(b, a, worN=1024, fs=fs)

print(f"Digital Butterworth order={order}, fc={fc} Hz, fs={fs} Hz")
print(f"DC gain  |H(0)|   = {abs(h[0]):.4f}")
print(f"At fc    |H(fc)|  = {abs(h[np.argmin(abs(w - fc))]):.4f}  (~-3 dB)")
print(f"At 2*fc  |H(2fc)| = {abs(h[np.argmin(abs(w - 2*fc))]):.4f}")

fig, ax = plt.subplots(figsize=(7, 4))
ax.semilogx(w[1:], 20*np.log10(np.abs(h[1:]) + 1e-12), lw=2, color='#0d9488')
ax.axvline(fc, color='gray', ls='--', lw=0.8, label=f'fc = {fc} Hz')
ax.axhline(-3, color='gray', ls=':', lw=0.8)
ax.axhline(-3*order*20/20, color='#d97706', ls=':', lw=0.6)
ax.set_xlabel('Frequency (Hz)'); ax.set_ylabel('|H| (dB)')
ax.set_title(f'{order}-th order Butterworth low-pass (digital)')
ax.grid(True, alpha=0.3, which='both'); ax.legend()
plt.tight_layout(); plt.savefig('/tmp/plot.png', dpi=110)
print('\\n[plot saved]')
`,
  },

  'p5m9l1': {
    hint: 'LMS adaptive filter: identify an unknown FIR system by minimizing mean-square error with a gradient descent step.',
    hasPlot: false,
    code: `import numpy as np
# LMS adaptive filter to identify an unknown FIR system
np.random.seed(0)
N = 2000
# Unknown system: h_true = [0.5, -0.3, 0.2]
h_true = np.array([0.5, -0.3, 0.2])
M = len(h_true)
x = np.random.randn(N)             # white input
d = np.convolve(x, h_true, mode='full')[:N] + 0.05 * np.random.randn(N)

mu = 0.05                          # step size
w = np.zeros(M)                    # adaptive weights
mses = []
for n in range(M, N):
    x_buf = x[n - M:n][::-1]       # most-recent-first
    y = w @ x_buf
    e = d[n] - y
    w = w + mu * e * x_buf
    mses.append(e * e)

print(f"True  weights: {h_true}")
print(f"Final weights: {np.round(w, 4)}")
print(f"Final MSE    : {np.mean(mses[-200:]):.6f}")
print(f"\\nLMS update:  w[n+1] = w[n] + mu * e[n] * x[n]")
print(f"Converged after ~{int(np.argmax(np.array(mses) < 0.01))} samples.")
`,
  },

  // ── Phase 6 — Control ────────────────────────────────────────────────
  'p6m5l1': {
    hint: 'Bode + Nyquist of an open-loop plant. Read off gain margin and phase margin to assess closed-loop stability.',
    hasPlot: true,
    code: `${PLOT_HEADER}from scipy import signal
# Open-loop: G(s) = K / (s * (s+1) * (s+2))
K = 2.0
num = [K]
den = np.polymul([1, 0], np.polymul([1, 1], [1, 2]))
sys_ol = signal.lti(num, den)
w = np.logspace(-2, 2, 1000)
w_, h = signal.freqresp(sys_ol, w)
mag = np.abs(h).flatten(); phase = np.degrees(np.unwrap(np.angle(h).flatten()))
mag_db = 20 * np.log10(mag)

# Margins
gm_idx = np.argmin(np.abs(phase + 180))
gm_db = -mag_db[gm_idx]
pm_idx = np.argmin(np.abs(mag_db))
pm_deg = 180 + phase[pm_idx]
print(f"Gain margin  = {gm_db:.2f} dB")
print(f"Phase margin = {pm_deg:.2f} deg")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 4))
ax1.semilogx(w_, mag_db, lw=2, color='#0d9488')
ax1.semilogx(w_, phase, lw=2, color='#d97706')
ax1.axhline(0, color='k', lw=0.5); ax1.axhline(-180, color='k', ls=':', lw=0.6)
ax1.set_xlabel('\u03c9 (rad/s)'); ax1.set_ylabel('dB  /  deg')
ax1.set_title('Bode'); ax1.grid(True, alpha=0.3, which='both')
ax1.legend(['|G| (dB)', '\u2220G (deg)'], fontsize=9)

ax2.plot(h.real.flatten(), h.imag.flatten(), lw=1.5, color='#0d9488')
ax2.plot(-1, 0, 'rx', ms=12, mew=2)
ax2.axhline(0, color='k', lw=0.5); ax2.axvline(0, color='k', lw=0.5)
ax2.set_aspect('equal'); ax2.grid(True, alpha=0.3)
ax2.set_title('Nyquist  (red = -1 critical point)')
plt.tight_layout(); plt.savefig('/tmp/plot.png', dpi=110)
`,
  },

  // ── Phase 7 — Power Electronics ──────────────────────────────────────
  'p7m8l1': {
    hint: 'Clarke + Park transform of three-phase stator currents to the dq reference frame (rotating with the rotor).',
    hasPlot: true,
    code: `${PLOT_HEADER}# Clarke (abc -> alpha-beta) + Park (alpha-beta -> dq) transforms
theta_e = np.linspace(0, 4*np.pi, 600)
I = 1.0
ia = I * np.cos(theta_e)
ib = I * np.cos(theta_e - 2*np.pi/3)
ic = I * np.cos(theta_e + 2*np.pi/3)

# Clarke (amplitude-invariant)
ialpha = (2/3) * (ia - 0.5*ib - 0.5*ic)
ibeta  = (2/3) * (np.sqrt(3)/2 * (ib - ic))

# Park (align d-axis with rotor -> d=I, q=0 for pure magnetizing current)
id =  ialpha * np.cos(theta_e) + ibeta * np.sin(theta_e)
iq = -ialpha * np.sin(theta_e) + ibeta * np.cos(theta_e)

print(f"3-phase amplitude I = {I}")
print(f"After Park (aligned): id mean = {id.mean():.4f},  iq mean = {iq.mean():.4f}")
print("For a balanced 3-phase set, id, iq become DC quantities \u2014 this is why FOC works.")

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 5.5), sharex=True)
for y, lab, c in [(ia, 'ia', '#dc2626'), (ib, 'ib', '#d97706'), (ic, 'ic', '#0d9488')]:
    ax1.plot(theta_e, y, color=c, lw=1.5, label=lab)
ax1.set_ylabel('abc currents'); ax1.grid(alpha=0.3); ax1.legend(fontsize=9, ncol=3)
ax1.set_title('Three-phase stator currents')
ax2.plot(theta_e, id, lw=2, color='#059669', label='id (d-axis)')
ax2.plot(theta_e, iq, lw=2, color='#0891b2', label='iq (q-axis)')
ax2.set_xlabel('\u03b8_e (rad)'); ax2.set_ylabel('dq currents')
ax2.grid(alpha=0.3); ax2.legend(fontsize=9)
ax2.set_title('After Clarke + Park transform \u2014 DC quantities in rotor frame')
plt.tight_layout(); plt.savefig('/tmp/plot.png', dpi=110)
`,
  },
};

/** Fallback snippet for any playground lesson we haven't customized. */
export const DEFAULT_SNIPPET: Snippet = {
  hint: 'Edit and run \u2014 numpy, scipy, and matplotlib are available. Print or save plots to /tmp/plot.png.',
  hasPlot: false,
  code: `import numpy as np
# Your Python code here. Numpy, scipy, matplotlib are loaded.
x = np.linspace(0, 2*np.pi, 100)
y = np.sin(x)
print(f"sin(pi/2) = {np.sin(np.pi/2)}")
print(f"max(y)    = {np.max(y)}")
print(f"mean(y)   = {np.mean(y):.4f}")
`,
};

export function getSnippet(lessonId: string): Snippet {
  return PLAYGROUND_SNIPPETS[lessonId] ?? DEFAULT_SNIPPET;
}
