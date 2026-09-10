"""
EE Curriculum PDF — Master Build Script.
Combines all content parts + cover + TOC + appendices into the final PDF.
Run: python3 /home/z/my-project/scripts/ee_curriculum_build.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Suppress pdfmetrics font warnings
import logging
logging.getLogger('reportlab').setLevel(logging.ERROR)

from ee_curriculum_part1_setup import (
    TocDocTemplate, TableOfContents, PageBreak, Spacer, Paragraph, ParagraphStyle,
    heading, p, hr, A4, mm, LEFT_MARGIN, RIGHT_MARGIN, TOP_MARGIN, BOTTOM_MARGIN,
    build_cover_pdf, WORK_DIR, DOWNLOAD_DIR, styles, HEADER_FILL, BORDER, ACCENT,
    TEXT_PRIMARY, TEXT_MUTED, colors, TA_LEFT, TA_CENTER,
)
from ee_curriculum_part2_phase0 import build_front_matter, build_phase0
from ee_curriculum_part3_phases1to3 import build_phase1, build_phase2, build_phase3
from ee_curriculum_part4_phases4to6 import build_phase4, build_phase5, build_phase6
from ee_curriculum_part5_phases7to10 import (
    build_phase7, build_phase8, build_phase9, build_phase10, build_appendices,
)
from reportlab.platypus.tableofcontents import TableOfContents
import subprocess, sys as _sys
from pathlib import Path

OUTPUT_BODY = WORK_DIR / "ee_body.pdf"
OUTPUT_COVER = WORK_DIR / "ee_cover.pdf"
OUTPUT_FINAL = DOWNLOAD_DIR / "EE_Curriculum_for_Computer_Scientists.pdf"

def build_body_pdf():
    print("[build] assembling story...")
    story = []

    # ── Table of Contents ─────────────────────────────────────────────────
    toc = TableOfContents()
    toc.levelStyles = [styles['toc1'], styles['toc2'], styles['toc3']]
    story.append(Paragraph('Table of Contents', styles['h1']))
    story.append(hr(color=ACCENT, thickness=1.2, spaceBefore=2, spaceAfter=8))
    story.append(toc)
    story.append(PageBreak())

    # ── Content sections ──────────────────────────────────────────────────
    print("[build]   front matter + phase 0")
    story.extend(build_front_matter())
    print("[build]   phase 1 (DC circuits)")
    story.extend(build_phase1())
    print("[build]   phase 2 (AC circuits)")
    story.extend(build_phase2())
    print("[build]   phase 3 (analog)")
    story.extend(build_phase3())
    print("[build]   phase 4 (digital/embedded)")
    story.extend(build_phase4())
    print("[build]   phase 5 (signals/DSP)")
    story.extend(build_phase5())
    print("[build]   phase 6 (control/robotics)")
    story.extend(build_phase6())
    print("[build]   phase 7 (power electronics)")
    story.extend(build_phase7())
    print("[build]   phase 8 (EM/RF)")
    story.extend(build_phase8())
    print("[build]   phase 9 (VLSI)")
    story.extend(build_phase9())
    print("[build]   phase 10 (capstones)")
    story.extend(build_phase10())
    print("[build]   appendices")
    story.extend(build_appendices())

    # ── Build PDF with multiBuild (TOC support) ───────────────────────────
    print(f"[build] building body PDF: {OUTPUT_BODY}")
    doc = TocDocTemplate(
        str(OUTPUT_BODY),
        pagesize=A4,
        leftMargin=LEFT_MARGIN, rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN, bottomMargin=BOTTOM_MARGIN,
        title='Electrical Engineering — A Master Curriculum for Computer Scientists',
        author='srivtx',
        subject='A 12-month project-based EE curriculum for CS engineers',
        creator='srivtx EE Curriculum v2.0',
    )
    doc.multiBuild(story)
    print(f"[build] body PDF done: {OUTPUT_BODY} ({OUTPUT_BODY.stat().st_size//1024} KB)")

def merge_cover_and_body():
    """Merge cover PDF (page 1) + body PDF (pages 2+) into the final output."""
    print(f"[build] rendering cover PDF: {OUTPUT_COVER}")
    build_cover_pdf(OUTPUT_COVER)
    print(f"[build] cover done: {OUTPUT_COVER} ({OUTPUT_COVER.stat().st_size//1024} KB)")

    print(f"[build] merging cover + body → {OUTPUT_FINAL}")
    try:
        from pypdf import PdfReader, PdfWriter
    except ImportError:
        from PyPDF2 import PdfReader, PdfWriter
    writer = PdfWriter()
    for src in (OUTPUT_COVER, OUTPUT_BODY):
        reader = PdfReader(str(src))
        for page in reader.pages:
            writer.add_page(page)
    # Set metadata
    writer.add_metadata({
        '/Title': 'Electrical Engineering — A Master Curriculum for Computer Scientists',
        '/Author': 'srivtx',
        '/Subject': 'A 12-month project-based EE curriculum for CS engineers',
        '/Creator': 'srivtx EE Curriculum v2.0',
        '/Keywords': 'electrical engineering, curriculum, computer science, circuits, DSP, control, power, RF, VLSI',
    })
    with open(OUTPUT_FINAL, 'wb') as f:
        writer.write(f)
    size = OUTPUT_FINAL.stat().st_size
    print(f"[build] FINAL PDF: {OUTPUT_FINAL}")
    print(f"[build] size: {size:,} bytes ({size//1024} KB)")
    # Page count
    final_reader = PdfReader(str(OUTPUT_FINAL))
    print(f"[build] pages: {len(final_reader.pages)}")

if __name__ == '__main__':
    build_body_pdf()
    merge_cover_and_body()
    print("\n[build] DONE. Output:")
    print(f"  {OUTPUT_FINAL}")
