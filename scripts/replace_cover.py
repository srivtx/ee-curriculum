"""Replace the COVER_HTML in ee_curriculum_part1_setup.py with the v3 design."""
from pathlib import Path

SETUP_FILE = Path('/home/z/my-project/scripts/ee_curriculum_part1_setup.py')
src = SETUP_FILE.read_text()

# Voxel grid: 16x8, half-wave rectifier
# D=diode, R=resistor, C=capacitor, G=ground, .=empty
VOXEL_GRID = [
    ['.','.','.','.','.','D','D','D','.','.','.','.','.','.','.','.'],
    ['.','.','.','.','.','D','.','.','D','.','.','.','.','.','.','.'],
    ['.','.','.','.','.','D','D','D','.','.','.','.','.','.','.','.'],
    ['.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.'],
    ['.','R','R','R','R','R','.','.','.','.','C','C','C','C','C','.'],
    ['.','.','.','.','.','.','.','.','.','.','C','C','C','C','C','.'],
    ['.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.'],
    ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','.'],
]

voxel_cells = []
for row in VOXEL_GRID:
    for cell in row:
        if cell != '.':
            voxel_cells.append('<div class="b"></div>')
        else:
            voxel_cells.append('<div></div>')
VOXEL_INNER = '\n    '.join(voxel_cells)

NEW_COVER = '''COVER_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>EE Curriculum v3 Cover</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&family=JetBrains+Mono:wght@400&family=Source+Serif+4:ital,wght@1,400&display=swap" rel="stylesheet">
<style>
  @page { size: 794px 1123px; margin: 0; }
  html, body { margin: 0; padding: 0; background: #0a0a0a; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
  .cover {
    position: relative; width: 794px; height: 1123px;
    background: #0a0a0a; color: #dadbdf; overflow: hidden;
  }
  /* Edition badge — the only serif on the cover */
  .edition {
    position: absolute; top: 64px; right: 80px;
    font-family: 'Source Serif 4', serif; font-style: italic;
    font-size: 28px; font-weight: 400; color: #7FFF9F;
    letter-spacing: -0.01em; line-height: 1;
  }
  /* Eyebrow */
  .eyebrow {
    position: absolute; top: 144px; left: 80px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px; font-weight: 400; color: #7FFF9F;
    letter-spacing: 1.4px; line-height: 20px;
    text-transform: uppercase;
  }
  /* Display title */
  .title {
    position: absolute; top: 244px; left: 80px; right: 80px;
    font-family: 'Inter', sans-serif; font-size: 72px; font-weight: 400;
    color: #ffffff; letter-spacing: -1.8px; line-height: 76px;
    margin: 0; max-width: 640px;
  }
  .title .accent { color: #7FFF9F; }
  /* Lead paragraph */
  .lead {
    position: absolute; top: 432px; left: 80px; right: 80px;
    font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 400;
    color: #dadbdf; line-height: 28px; max-width: 520px; margin: 0;
  }
  /* Voxel motif — half-wave rectifier schematic as pixel blocks */
  .voxel-wrap {
    position: absolute; top: 612px; left: 50%; transform: translateX(-50%);
    width: 384px; height: 192px;
    filter: drop-shadow(0 0 24px rgba(127, 255, 159, 0.12));
  }
  .voxel {
    width: 384px; height: 192px;
    image-rendering: pixelated; image-rendering: crisp-edges;
    display: grid;
    grid-template-columns: repeat(16, 24px);
    grid-template-rows: repeat(8, 24px);
  }
  .voxel .b { background: #7FFF9F; }
  .voxel div { width: 24px; height: 24px; }
  /* Stats row */
  .stats {
    position: absolute; top: 870px; left: 80px; right: 80px;
    display: grid; grid-template-columns: repeat(5, 1fr);
    border-top: 1px solid #212327;
    border-bottom: 1px solid #212327;
  }
  .stat { padding: 24px 12px; border-right: 1px solid #212327; }
  .stat:last-child { border-right: none; }
  .stat-num {
    font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 400;
    color: #ffffff; line-height: 36px; letter-spacing: 0;
  }
  .stat-lbl {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    font-weight: 400; color: #6a7079; letter-spacing: 1.4px;
    text-transform: uppercase; margin-top: 6px; line-height: 16px;
  }
  /* Footer — single line, hairline above */
  .footer {
    position: absolute; bottom: 64px; left: 80px; right: 80px;
    border-top: 1px solid #212327; padding-top: 18px;
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    font-weight: 400; color: #6a7079; letter-spacing: 1.2px;
    text-transform: uppercase; display: flex; gap: 18px; flex-wrap: wrap;
    align-items: center;
  }
  .footer .sep { color: #363a3f; }
  .footer .handle { color: #9aa0a8; }
</style>
</head>
<body>
<div class="cover">
  <div class="edition">v3.0</div>

  <div class="eyebrow">// SVX · EE CURRICULUM · v3.0</div>

  <h1 class="title">
    Electrical Engineering<br>
    for Computer <span class="accent">Scientists</span>
  </h1>

  <p class="lead">
    A rigorous, hardware-plus-simulation curriculum that takes a working
    computer scientist from Ohm's law to field-oriented motor control,
    FPGA prototyping, and grid-tied solar inverters &mdash; without skipping
    the math, the physics, or the bench time.
  </p>

  <div class="voxel-wrap">
    <div class="voxel" aria-label="Voxel schematic of a half-wave rectifier with RC smoothing">
    ''' + VOXEL_INNER + '''
    </div>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-num">11</div><div class="stat-lbl">Phases</div></div>
    <div class="stat"><div class="stat-num">91</div><div class="stat-lbl">Modules</div></div>
    <div class="stat"><div class="stat-num">140</div><div class="stat-lbl">Lessons</div></div>
    <div class="stat"><div class="stat-num">52</div><div class="stat-lbl">Projects</div></div>
    <div class="stat"><div class="stat-num">6</div><div class="stat-lbl">Capstones</div></div>
  </div>

  <div class="footer">
    <span class="handle">by svx</span><span class="sep">&middot;</span>
    <span>Sribatsha dash</span><span class="sep">&middot;</span>
    <span>github.com/srivtx</span><span class="sep">&middot;</span>
    <span>v3.0</span>
  </div>
</div>
</body>
</html>
"""'''

# Find the old COVER_HTML block and replace it
# The block starts with 'COVER_HTML = """' and ends with '"""' on its own line
import re
pattern = re.compile(r'COVER_HTML = """.*?"""', re.DOTALL)
match = pattern.search(src)
if not match:
    raise RuntimeError("Could not find COVER_HTML block")

new_src = src[:match.start()] + NEW_COVER + src[match.end():]
SETUP_FILE.write_text(new_src)
print(f"Replaced COVER_HTML. New file size: {len(new_src)} bytes")
print(f"Voxel cells generated: {len(voxel_cells)} (filled: {sum(1 for c in voxel_cells if 'b' in c)})")
