"""
EE Curriculum PDF Generator - Part 1: Setup, fonts, palette, helpers, cover HTML.

This file defines the boilerplate (fonts, palette, styles, helpers, cover HTML).
The content (phases, modules, lessons) is appended in subsequent parts and
the final build is run from ee_curriculum_build.py which imports this file.
"""

import os, sys, hashlib, subprocess, textwrap
from pathlib import Path

# ─── Paths ──────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path("/home/z/my-project")
PDF_SKILL_DIR = PROJECT_ROOT / "skills" / "pdf"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
DOWNLOAD_DIR = PROJECT_ROOT / "download"
WORK_DIR = SCRIPTS_DIR / "ee_pdf_work"
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
WORK_DIR.mkdir(parents=True, exist_ok=True)

# ─── ReportLab imports ──────────────────────────────────────────────────────
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm, inch
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether,
    Table, TableStyle, Image, ListFlowable, ListItem, HRFlowable,
    Flowable,
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
from reportlab.platypus.frames import Frame

# ─── Font registration ─────────────────────────────────────────────────────
FONT_DIR = Path("/usr/share/fonts/truetype")

def register_fonts():
    """Register all needed TTF fonts. MUST be called before any Paragraph usage."""
    # English serif/sans/mono
    pdfmetrics.registerFont(TTFont('FreeSerif',          str(FONT_DIR/'freefont/FreeSerif.ttf')))
    pdfmetrics.registerFont(TTFont('FreeSerif-Bold',     str(FONT_DIR/'freefont/FreeSerifBold.ttf')))
    pdfmetrics.registerFont(TTFont('FreeSerif-Italic',   str(FONT_DIR/'freefont/FreeSerifItalic.ttf')))
    pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', str(FONT_DIR/'freefont/FreeSerifBoldItalic.ttf')))
    pdfmetrics.registerFont(TTFont('FreeSans',           str(FONT_DIR/'freefont/FreeSans.ttf')))
    pdfmetrics.registerFont(TTFont('FreeSans-Bold',      str(FONT_DIR/'freefont/FreeSansBold.ttf')))
    pdfmetrics.registerFont(TTFont('FreeMono',           str(FONT_DIR/'freefont/FreeMono.ttf')))
    pdfmetrics.registerFont(TTFont('FreeMono-Bold',      str(FONT_DIR/'freefont/FreeMonoBold.ttf')))
    # DejaVu for symbol coverage (CJK fallback not needed for English-only curriculum)
    pdfmetrics.registerFont(TTFont('DejaVuSans',         str(FONT_DIR/'dejavu/DejaVuSans.ttf')))
    pdfmetrics.registerFont(TTFont('DejaVuSans-Bold',    str(FONT_DIR/'dejavu/DejaVuSans-Bold.ttf')))

    # Font family registration
    from reportlab.pdfbase.pdfmetrics import registerFontFamily
    registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold',
                       italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')
    registerFontFamily('FreeSans', normal='FreeSans', bold='FreeSans-Bold')
    registerFontFamily('FreeMono', normal='FreeMono', bold='FreeMono-Bold')

register_fonts()

# ─── Palette (from palette.cascade --harmony triadic --seed 42) ────────────
PAGE_BG       = colors.HexColor('#f4f5f5')
SECTION_BG    = colors.HexColor('#f0f1f2')
CARD_BG       = colors.HexColor('#e8eaeb')
TABLE_STRIPE  = colors.HexColor('#ebeded')
HEADER_FILL   = colors.HexColor('#32454e')
COVER_BLOCK   = colors.HexColor('#566a74')
BORDER        = colors.HexColor('#acbdc5')
ICON          = colors.HexColor('#4b86a4')
ACCENT        = colors.HexColor('#1f6c92')
ACCENT_2      = colors.HexColor('#c23a94')
TEXT_PRIMARY  = colors.HexColor('#131515')
TEXT_MUTED    = colors.HexColor('#5a6166')
SEM_SUCCESS   = colors.HexColor('#529067')
SEM_WARNING   = colors.HexColor('#8c7443')
SEM_ERROR     = colors.HexColor('#a25b54')
SEM_INFO      = colors.HexColor('#507aa4')

TABLE_HEADER_COLOR = HEADER_FILL
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = TABLE_STRIPE

# ─── Styles ─────────────────────────────────────────────────────────────────
BODY_FONT = 'FreeSerif'
HEAD_FONT = 'FreeSans'
MONO_FONT = 'FreeMono'

styles = {
    'h1': ParagraphStyle('h1', fontName=f'{HEAD_FONT}-Bold', fontSize=22, leading=28,
                         textColor=HEADER_FILL, spaceBefore=14, spaceAfter=10,
                         alignment=TA_LEFT),
    'h2': ParagraphStyle('h2', fontName=f'{HEAD_FONT}-Bold', fontSize=16, leading=22,
                         textColor=HEADER_FILL, spaceBefore=14, spaceAfter=8,
                         alignment=TA_LEFT),
    'h3': ParagraphStyle('h3', fontName=f'{HEAD_FONT}-Bold', fontSize=12.5, leading=18,
                         textColor=ACCENT, spaceBefore=10, spaceAfter=6,
                         alignment=TA_LEFT),
    'h4': ParagraphStyle('h4', fontName=f'{HEAD_FONT}-Bold', fontSize=11, leading=15,
                         textColor=TEXT_PRIMARY, spaceBefore=8, spaceAfter=4,
                         alignment=TA_LEFT),
    'body': ParagraphStyle('body', fontName=BODY_FONT, fontSize=10.5, leading=15.5,
                           textColor=TEXT_PRIMARY, spaceBefore=2, spaceAfter=6,
                           alignment=TA_JUSTIFY, firstLineIndent=0),
    'body_left': ParagraphStyle('body_left', fontName=BODY_FONT, fontSize=10.5, leading=15.5,
                                textColor=TEXT_PRIMARY, alignment=TA_LEFT),
    'kicker': ParagraphStyle('kicker', fontName=f'{HEAD_FONT}', fontSize=9, leading=12,
                             textColor=TEXT_MUTED, alignment=TA_LEFT, spaceAfter=2),
    'caption': ParagraphStyle('caption', fontName=f'{HEAD_FONT}', fontSize=9, leading=12,
                              textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=2, spaceAfter=8),
    'bullet': ParagraphStyle('bullet', fontName=BODY_FONT, fontSize=10.5, leading=15,
                             textColor=TEXT_PRIMARY, alignment=TA_LEFT,
                             leftIndent=18, bulletIndent=4, spaceBefore=1, spaceAfter=2),
    'code': ParagraphStyle('code', fontName=MONO_FONT, fontSize=9, leading=12,
                           textColor=TEXT_PRIMARY, alignment=TA_LEFT,
                           leftIndent=10, rightIndent=10, spaceBefore=4, spaceAfter=4,
                           backColor=CARD_BG, borderColor=BORDER, borderWidth=0.4,
                           borderPadding=6),
    'callout_title': ParagraphStyle('callout_title', fontName=f'{HEAD_FONT}-Bold', fontSize=10,
                                    textColor=colors.white, alignment=TA_LEFT, leading=13),
    'callout_body': ParagraphStyle('callout_body', fontName=BODY_FONT, fontSize=10, leading=14,
                                   textColor=TEXT_PRIMARY, alignment=TA_LEFT),
    'formula': ParagraphStyle('formula', fontName=BODY_FONT, fontSize=11, leading=15,
                              textColor=TEXT_PRIMARY, alignment=TA_CENTER,
                              spaceBefore=4, spaceAfter=6),
    'toc1': ParagraphStyle('toc1', fontName=f'{HEAD_FONT}-Bold', fontSize=11, leading=16,
                           textColor=HEADER_FILL, leftIndent=0, spaceBefore=4),
    'toc2': ParagraphStyle('toc2', fontName=BODY_FONT, fontSize=10, leading=14,
                           textColor=TEXT_PRIMARY, leftIndent=18, spaceBefore=1),
    'toc3': ParagraphStyle('toc3', fontName=BODY_FONT, fontSize=9.5, leading=13,
                           textColor=TEXT_MUTED, leftIndent=36, spaceBefore=0),
}

# ─── Helpers ────────────────────────────────────────────────────────────────
def heading(text, level=0):
    """Heading flowable that registers itself with TOC."""
    style = styles[['h1','h2','h3','h4'][level]]
    key = f'h_{hashlib.md5(text.encode()).hexdigest()[:8]}'
    p = Paragraph(f'<a name="{key}"/>{text}', style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def p(text, style='body'):
    return Paragraph(text, styles[style])

def bullet_list(items, style='bullet'):
    """Return a ListFlowable of bullets."""
    return ListFlowable(
        [ListItem(Paragraph(x, styles[style]), leftIndent=18, value='•') for x in items],
        bulletType='bullet', bulletColor=ACCENT, leftIndent=18,
    )

def numbered_list(items, style='bullet'):
    return ListFlowable(
        [ListItem(Paragraph(x, styles[style]), leftIndent=18) for x in items],
        bulletType='1', bulletFormat='%s.', leftIndent=18,
    )

def hr(color=BORDER, thickness=0.6, spaceBefore=4, spaceAfter=4):
    return HRFlowable(width="100%", thickness=thickness, color=color,
                      spaceBefore=spaceBefore, spaceAfter=spaceAfter)

def cs_bridge(text):
    """A 'CS Bridge' callout — yellow tinted box with accent left border."""
    title = Paragraph('CS BRIDGE', styles['callout_title'])
    body = Paragraph(text, styles['callout_body'])
    inner = Table([[title], [body]], colWidths=[None])
    inner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SEM_WARNING),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#fdf6e9')),
        ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
        ('LEFTPADDING',(0,0), (-1,-1), 8),
        ('RIGHTPADDING',(0,0),(-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('LINEBEFORE', (0,0), (0,-1), 3, SEM_WARNING),
    ]))
    return inner

def project_box(title, spec_lines):
    """A 'Hands-on Project' callout — blue tinted box.
    spec_lines: list of tuples. Each tuple is (label, desc) OR (label, desc, desc2, ...)
    Extra description strings are concatenated with a space."""
    body_items = []
    for tup in spec_lines:
        if len(tup) == 2:
            label, desc = tup
        else:
            label = tup[0]
            desc = ' '.join(tup[1:])
        body_items.append(Paragraph(f'<b>{label}</b> {desc}' if label else desc, styles['callout_body']))
    title_p = Paragraph(f'HANDS-ON PROJECT — {title}', styles['callout_title'])
    body_table = Table([[x] for x in body_items], colWidths=[None])
    body_table.setStyle(TableStyle([
        ('LEFTPADDING',(0,0),(-1,-1),0),
        ('RIGHTPADDING',(0,0),(-1,-1),0),
        ('TOPPADDING',(0,0),(-1,-1),2),
        ('BOTTOMPADDING',(0,0),(-1,-1),2),
    ]))
    inner = Table([[title_p], [body_table]], colWidths=[None])
    inner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), ACCENT),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#eef4f9')),
        ('LEFTPADDING',(0,0), (-1,-1), 8),
        ('RIGHTPADDING',(0,0),(-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('LINEBEFORE', (0,0), (0,-1), 3, ACCENT),
    ]))
    return inner

def checkpoint_box(items):
    """A 'Checkpoint' callout — green tinted box at end of module."""
    title_p = Paragraph('CHECKPOINT — Can you answer these?', styles['callout_title'])
    body_items = [Paragraph(f'• {x}', styles['callout_body']) for x in items]
    body_table = Table([[x] for x in body_items], colWidths=[None])
    body_table.setStyle(TableStyle([
        ('LEFTPADDING',(0,0),(-1,-1),0),
        ('RIGHTPADDING',(0,0),(-1,-1),0),
        ('TOPPADDING',(0,0),(-1,-1),1),
        ('BOTTOMPADDING',(0,0),(-1,-1),1),
    ]))
    inner = Table([[title_p], [body_table]], colWidths=[None])
    inner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SEM_SUCCESS),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#eef7f0')),
        ('LEFTPADDING',(0,0), (-1,-1), 8),
        ('RIGHTPADDING',(0,0),(-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('LINEBEFORE', (0,0), (0,-1), 3, SEM_SUCCESS),
    ]))
    return inner

def formula_box(text):
    """A centered formula box."""
    return Paragraph(text, styles['formula'])

def make_table(data, col_widths=None, header=True):
    """Build a styled table."""
    if col_widths is None:
        n = len(data[0])
        avail = 170*mm
        col_widths = [avail/n]*n
    # Wrap cells in Paragraph for proper text wrapping
    wrapped = []
    for ri, row in enumerate(data):
        wrow = []
        for cell in row:
            if isinstance(cell, str):
                if ri == 0 and header:
                    wrow.append(Paragraph(f'<b>{cell}</b>', ParagraphStyle(
                        'th', fontName=f'{HEAD_FONT}-Bold', fontSize=9.5, leading=12,
                        textColor=colors.white, alignment=TA_LEFT)))
                else:
                    wrow.append(Paragraph(cell, ParagraphStyle(
                        'td', fontName=BODY_FONT, fontSize=9.5, leading=12.5,
                        textColor=TEXT_PRIMARY, alignment=TA_LEFT)))
            else:
                wrow.append(cell)
        wrapped.append(wrow)
    t = Table(wrapped, colWidths=col_widths, repeatRows=1 if header else 0)
    style = [
        ('GRID', (0,0), (-1,-1), 0.4, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING',(0,0),(-1,-1), 6),
        ('RIGHTPADDING',(0,0),(-1,-1), 6),
        ('TOPPADDING',(0,0),(-1,-1), 4),
        ('BOTTOMPADDING',(0,0),(-1,-1), 4),
    ]
    if header:
        style.extend([
            ('BACKGROUND', (0,0), (-1,0), TABLE_HEADER_COLOR),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ])
        for r in range(1, len(data)):
            bg = TABLE_ROW_EVEN if r % 2 == 1 else TABLE_ROW_ODD
            style.append(('BACKGROUND', (0,r), (-1,r), bg))
    t.setStyle(TableStyle(style))
    return t

# ─── TOC DocTemplate ────────────────────────────────────────────────────────
class TocDocTemplate(BaseDocTemplate):
    """Document template that feeds TOC entries."""
    def __init__(self, filename, **kw):
        BaseDocTemplate.__init__(self, filename, **kw)
        frame = Frame(self.leftMargin, self.bottomMargin,
                      self.width, self.height, id='normal')
        self.addPageTemplates([PageTemplate(id='main', frames=[frame],
                                            onPage=draw_page_decoration)])

    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

def draw_page_decoration(canvas, doc):
    """Draw header & footer on every body page."""
    canvas.saveState()
    # Top thin rule
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.4)
    canvas.line(doc.leftMargin, A4[1] - 12*mm, A4[0] - doc.rightMargin, A4[1] - 12*mm)
    # Top label (running header)
    canvas.setFont('FreeSans', 8)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(doc.leftMargin, A4[1] - 9*mm,
                      'ELECTRICAL ENGINEERING — A MASTER CURRICULUM FOR COMPUTER SCIENTISTS')
    canvas.drawRightString(A4[0] - doc.rightMargin, A4[1] - 9*mm,
                           'by svx · Sribatsha dash · 2026')
    # Footer
    canvas.setLineWidth(0.4)
    canvas.line(doc.leftMargin, 12*mm, A4[0] - doc.rightMargin, 12*mm)
    canvas.setFont('FreeSans', 8)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(doc.leftMargin, 8*mm, 'svx · EE Curriculum')
    canvas.drawRightString(A4[0] - doc.rightMargin, 8*mm, f'Page {doc.page}')
    canvas.restoreState()

# ─── Cover HTML (Template 01 HUD) ──────────────────────────────────────────
COVER_HTML = """<!DOCTYPE html>
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
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div class="b"></div>
    <div></div>
    <div></div>
    <div class="b"></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div class="b"></div>
    <div></div>
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
"""

def build_cover_pdf(output_path):
    """Render the cover HTML to a single-page PDF via Playwright."""
    html_path = WORK_DIR / "cover.html"
    html_path.write_text(COVER_HTML, encoding='utf-8')
    # Validate first
    validator = PDF_SKILL_DIR / "scripts" / "poster_validate.py"
    if validator.exists():
        try:
            subprocess.run(['python3', str(validator), 'check-html', str(html_path)],
                           check=False, capture_output=True, timeout=30)
        except Exception:
            pass
    # Use html2poster.js (single page, fixed dimensions)
    html2poster = PDF_SKILL_DIR / "scripts" / "html2poster.js"
    cmd = ['node', str(html2poster), str(html_path),
           '--output', str(output_path), '--width', '794px']
    print(f"[cover] running: {' '.join(cmd)}")
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if res.returncode != 0:
        print(f"[cover] STDERR:\n{res.stderr[-2000:]}")
        raise RuntimeError(f"Cover build failed: {res.returncode}")
    print(f"[cover] OK → {output_path}")
    return output_path

# ─── Page geometry ──────────────────────────────────────────────────────────
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 20*mm
RIGHT_MARGIN = 20*mm
TOP_MARGIN = 18*mm
BOTTOM_MARGIN = 18*mm
CONTENT_WIDTH = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN  # ≈ 170mm

# Export commonly used names
__all__ = [
    'PAGE_W','PAGE_H','LEFT_MARGIN','RIGHT_MARGIN','TOP_MARGIN','BOTTOM_MARGIN','CONTENT_WIDTH',
    'styles','heading','p','bullet_list','numbered_list','hr','cs_bridge','project_box',
    'checkpoint_box','formula_box','make_table','TocDocTemplate','draw_page_decoration',
    'build_cover_pdf','WORK_DIR','DOWNLOAD_DIR','PDF_SKILL_DIR',
    'PAGE_BG','HEADER_FILL','ACCENT','ACCENT_2','BORDER','TEXT_PRIMARY','TEXT_MUTED',
    'CARD_BG','TABLE_STRIPE','SEM_SUCCESS','SEM_WARNING','SEM_INFO','COVER_BLOCK','ICON',
    'colors','mm','cm','inch','A4','PageBreak','Spacer','KeepTogether','TableOfContents',
    'Paragraph','ParagraphStyle','TA_LEFT','TA_CENTER','TA_JUSTIFY',
]
