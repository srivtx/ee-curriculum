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
PROJECT_FONTS = Path(__file__).parent / 'fonts'

def register_fonts():
    """Register all needed TTF fonts. Uses Inter + JetBrains Mono (matching the website)
    with FreeSerif/FreeSans/FreeMono as fallbacks for symbols."""
    # Primary fonts — match the website design system
    pdfmetrics.registerFont(TTFont('Inter',         str(PROJECT_FONTS / 'Inter-Regular.ttf')))
    pdfmetrics.registerFont(TTFont('Inter-Bold',    str(PROJECT_FONTS / 'Inter-Bold.ttf')))
    pdfmetrics.registerFont(TTFont('JetBrainsMono',       str(PROJECT_FONTS / 'JetBrainsMono-Regular.ttf')))
    pdfmetrics.registerFont(TTFont('JetBrainsMono-Bold',  str(PROJECT_FONTS / 'JetBrainsMono-Bold.ttf')))
    # Fallback fonts for symbol coverage
    pdfmetrics.registerFont(TTFont('FreeSerif',          str(FONT_DIR/'freefont/FreeSerif.ttf')))
    pdfmetrics.registerFont(TTFont('FreeSerif-Bold',     str(FONT_DIR/'freefont/FreeSerifBold.ttf')))
    pdfmetrics.registerFont(TTFont('FreeSerif-Italic',   str(FONT_DIR/'freefont/FreeSerifItalic.ttf')))
    pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', str(FONT_DIR/'freefont/FreeSerifBoldItalic.ttf')))
    pdfmetrics.registerFont(TTFont('FreeSans',           str(FONT_DIR/'freefont/FreeSans.ttf')))
    pdfmetrics.registerFont(TTFont('FreeSans-Bold',      str(FONT_DIR/'freefont/FreeSansBold.ttf')))
    pdfmetrics.registerFont(TTFont('FreeMono',           str(FONT_DIR/'freefont/FreeMono.ttf')))
    pdfmetrics.registerFont(TTFont('FreeMono-Bold',      str(FONT_DIR/'freefont/FreeMonoBold.ttf')))
    # DejaVu for symbol coverage
    pdfmetrics.registerFont(TTFont('DejaVuSans',         str(FONT_DIR/'dejavu/DejaVuSans.ttf')))
    pdfmetrics.registerFont(TTFont('DejaVuSans-Bold',    str(FONT_DIR/'dejavu/DejaVuSans-Bold.ttf')))

    # Font family registration
    from reportlab.pdfbase.pdfmetrics import registerFontFamily
    registerFontFamily('Inter', normal='Inter', bold='Inter-Bold')
    registerFontFamily('JetBrainsMono', normal='JetBrainsMono', bold='JetBrainsMono-Bold')
    registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold',
                       italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')
    registerFontFamily('FreeSans', normal='FreeSans', bold='FreeSans-Bold')
    registerFontFamily('FreeMono', normal='FreeMono', bold='FreeMono-Bold')

register_fonts()

# ─── Palette — WHITE pages, GREEN headings (Minecraft voxel motif) ─────────
PAGE_BG       = colors.HexColor('#ffffff')   # body pages are pure white
SECTION_BG    = colors.HexColor('#fafafa')   # very light gray for soft section bg
CARD_BG       = colors.HexColor('#f5f5f5')   # light gray card / code bg
TABLE_STRIPE  = colors.HexColor('#f0f0f0')   # zebra stripe
HEADER_FILL   = colors.HexColor('#1f8a3d')   # dark phosphor green — table headers
COVER_BLOCK   = colors.HexColor('#1f8a3d')   # voxel accent green
BORDER        = colors.HexColor('#d0d0d0')   # light gray border
ICON          = colors.HexColor('#1f8a3d')
ACCENT        = colors.HexColor('#1f8a3d')   # phosphor green for headings/accents
ACCENT_2      = colors.HexColor('#0d6b2a')   # darker green for h3
ACCENT_SOFT   = colors.HexColor('#e8f5ec')   # very pale green wash for callout bodies
TEXT_PRIMARY  = colors.HexColor('#1a1a1a')   # near-black body text
TEXT_MUTED    = colors.HexColor('#666666')   # medium gray muted
SEM_SUCCESS   = colors.HexColor('#1f8a3d')   # green
SEM_WARNING   = colors.HexColor('#d97706')   # amber
SEM_ERROR     = colors.HexColor('#dc2626')   # red
SEM_INFO      = colors.HexColor('#2563eb')   # blue

TABLE_HEADER_COLOR = HEADER_FILL
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = TABLE_STRIPE

# ─── Styles ─────────────────────────────────────────────────────────────────
# Use Inter (matches website) for body/headings, JetBrains Mono for code/labels
BODY_FONT = 'Inter'
HEAD_FONT = 'Inter'
MONO_FONT = 'JetBrainsMono'

styles = {
    'h1': ParagraphStyle('h1', fontName=f'{HEAD_FONT}-Bold', fontSize=24, leading=32,
                         textColor=ACCENT, spaceBefore=18, spaceAfter=12,
                         alignment=TA_LEFT),
    'h2': ParagraphStyle('h2', fontName=f'{HEAD_FONT}-Bold', fontSize=16, leading=24,
                         textColor=ACCENT, spaceBefore=16, spaceAfter=10,
                         alignment=TA_LEFT),
    'h3': ParagraphStyle('h3', fontName=f'{HEAD_FONT}-Bold', fontSize=13, leading=20,
                         textColor=ACCENT_2, spaceBefore=12, spaceAfter=8,
                         alignment=TA_LEFT),
    'h4': ParagraphStyle('h4', fontName=f'{HEAD_FONT}-Bold', fontSize=11, leading=16,
                         textColor=colors.HexColor('#333333'), spaceBefore=10, spaceAfter=6,
                         alignment=TA_LEFT),
    'body': ParagraphStyle('body', fontName=BODY_FONT, fontSize=10.5, leading=17,
                           textColor=TEXT_PRIMARY, spaceBefore=4, spaceAfter=8,
                           alignment=TA_JUSTIFY, firstLineIndent=0),
    'body_left': ParagraphStyle('body_left', fontName=BODY_FONT, fontSize=10.5, leading=17,
                                textColor=TEXT_PRIMARY, alignment=TA_LEFT,
                                spaceBefore=4, spaceAfter=8),
    'kicker': ParagraphStyle('kicker', fontName=f'{HEAD_FONT}', fontSize=9, leading=13,
                             textColor=TEXT_MUTED, alignment=TA_LEFT, spaceAfter=3),
    'caption': ParagraphStyle('caption', fontName=f'{HEAD_FONT}', fontSize=9, leading=13,
                              textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=3, spaceAfter=10),
    'diagram_caption': ParagraphStyle('diagram_caption', fontName=f'{HEAD_FONT}', fontSize=9,
                                       leading=13, textColor=TEXT_MUTED, alignment=TA_CENTER,
                                       spaceBefore=4, spaceAfter=12, fontStyle='italic'),
    'bullet': ParagraphStyle('bullet', fontName=BODY_FONT, fontSize=10.5, leading=16,
                             textColor=TEXT_PRIMARY, alignment=TA_LEFT,
                             leftIndent=18, bulletIndent=4, spaceBefore=2, spaceAfter=4),
    'code': ParagraphStyle('code', fontName=MONO_FONT, fontSize=9, leading=13,
                           textColor=TEXT_PRIMARY, alignment=TA_LEFT,
                           leftIndent=10, rightIndent=10, spaceBefore=6, spaceAfter=6,
                           backColor=CARD_BG, borderColor=BORDER, borderWidth=0.4,
                           borderPadding=8),
    'callout_title': ParagraphStyle('callout_title', fontName=f'{HEAD_FONT}-Bold', fontSize=10,
                                    textColor=colors.white, alignment=TA_LEFT, leading=13),
    'callout_body': ParagraphStyle('callout_body', fontName=BODY_FONT, fontSize=10, leading=15,
                                   textColor=TEXT_PRIMARY, alignment=TA_LEFT,
                                   spaceBefore=4, spaceAfter=2),
    'formula': ParagraphStyle('formula', fontName=BODY_FONT, fontSize=11, leading=16,
                              textColor=TEXT_PRIMARY, alignment=TA_CENTER,
                              spaceBefore=6, spaceAfter=8),
    'toc1': ParagraphStyle('toc1', fontName=f'{HEAD_FONT}-Bold', fontSize=11, leading=18,
                           textColor=ACCENT, leftIndent=0, spaceBefore=6),
    'toc2': ParagraphStyle('toc2', fontName=BODY_FONT, fontSize=10, leading=15,
                           textColor=TEXT_PRIMARY, leftIndent=18, spaceBefore=2),
    'toc3': ParagraphStyle('toc3', fontName=BODY_FONT, fontSize=9.5, leading=14,
                           textColor=TEXT_MUTED, leftIndent=36, spaceBefore=1),
}

# ─── Helpers ────────────────────────────────────────────────────────────────
def heading(text, level=0):
    """Heading flowable that registers itself with TOC.
    For h1 (phase titles), append a green horizontal rule below for visual weight."""
    style = styles[['h1','h2','h3','h4'][level]]
    key = f'h_{hashlib.md5(text.encode()).hexdigest()[:8]}'
    p = Paragraph(f'<a name="{key}"/>{text}', style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    if level == 0:
        # Return a list-style: heading + green rule. But callers append single flowables,
        # so return a KeepTogether-like container via a small Table that holds both.
        rule = HRFlowable(width="100%", thickness=1.4, color=ACCENT,
                          spaceBefore=2, spaceAfter=8)
        # Use a Table to keep them together visually
        wrap = Table([[p], [rule]], colWidths=[None])
        wrap.setStyle(TableStyle([
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ]))
        # Preserve TOC notification by transferring bookmark attrs to the wrap
        wrap.bookmark_name = key
        wrap.bookmark_level = level
        wrap.bookmark_text = text
        wrap.bookmark_key = key
        return wrap
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
    """A 'CS Bridge' callout — amber tinted box with amber left border."""
    title = Paragraph('CS BRIDGE', styles['callout_title'])
    body = Paragraph(text, styles['callout_body'])
    inner = Table([[title], [body]], colWidths=[None])
    inner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SEM_WARNING),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#fef6e7')),
        ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
        ('LEFTPADDING',(0,0), (-1,-1), 10),
        ('RIGHTPADDING',(0,0),(-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('BOTTOMPADDING',(0,0),(-1,0), 6),
        ('TOPPADDING', (0,1), (-1,1), 8),
        ('BOTTOMPADDING',(0,1),(-1,1), 8),
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
        ('BACKGROUND', (0,1), (-1,1), ACCENT_SOFT),
        ('LEFTPADDING',(0,0), (-1,-1), 10),
        ('RIGHTPADDING',(0,0),(-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('BOTTOMPADDING',(0,0),(-1,0), 6),
        ('TOPPADDING', (0,1), (-1,1), 8),
        ('BOTTOMPADDING',(0,1),(-1,1), 8),
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
        ('BACKGROUND', (0,1), (-1,1), ACCENT_SOFT),
        ('LEFTPADDING',(0,0), (-1,-1), 10),
        ('RIGHTPADDING',(0,0),(-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('BOTTOMPADDING',(0,0),(-1,0), 6),
        ('TOPPADDING', (0,1), (-1,1), 8),
        ('BOTTOMPADDING',(0,1),(-1,1), 8),
        ('LINEBEFORE', (0,0), (0,-1), 3, SEM_SUCCESS),
    ]))
    return inner

def formula_box(text):
    """A centered formula box."""
    return Paragraph(text, styles['formula'])

# ─── Guide character "Volt" — pixel-art narrator ────────────────────────────
# Volt is a small pixel-art character (8x8 grid) that appears in callout boxes
# throughout the curriculum, offering narrative asides, tips, and motivation.
# This gives the curriculum a "story" feel without rewriting all technical content.

# Volt avatar: 8x8 pixel grid. 1=green body, 2=darker green (eyes/details), 0=empty
VOLT_AVATAR = [
    [0,0,1,1,1,1,0,0],  # top of head
    [0,1,1,1,1,1,1,0],  # head
    [1,1,2,1,1,2,1,1],  # eyes (2 = darker)
    [1,1,1,1,1,1,1,1],  # face
    [1,1,1,1,1,1,1,1],  # chin
    [0,1,1,1,1,1,1,0],  # neck
    [0,1,0,0,0,0,1,0],  # body sides
    [0,1,1,1,1,1,1,0],  # body bottom
]

def volt_avatar(size=32):
    """Render Volt as a small pixel-art Drawing flowable."""
    from reportlab.graphics.shapes import Drawing, Rect
    cell = size // 8
    d = Drawing(size, size)
    for r, row in enumerate(VOLT_AVATAR):
        for c, val in enumerate(row):
            if val == 1:
                color = ACCENT
            elif val == 2:
                color = ACCENT_2
            else:
                continue
            x = c * cell
            y = size - (r + 1) * cell
            d.add(Rect(x, y, cell, cell, fillColor=color, strokeColor=None))
    return d

def volt_says(text, mood='tip'):
    """A narrative callout featuring Volt the guide character.
    mood: 'tip' (green), 'warning' (amber), 'insight' (blue), 'story' (purple)
    Gives the curriculum a story/narrative feel.

    Layout: [avatar] | [colored label bar on top, body text below]
    The label bar gets the mood color as background with white text —
    this fixes the contrast issue where white label text was invisible
    on the pale body background.
    """
    from reportlab.graphics.shapes import Drawing, Rect

    mood_colors = {
        'tip':     (ACCENT, ACCENT_SOFT, '#1f8a3d'),
        'warning': (SEM_WARNING, colors.HexColor('#fef6e7'), '#d97706'),
        'insight': (SEM_INFO, colors.HexColor('#eff6ff'), '#2563eb'),
        'story':   (colors.HexColor('#7c3aed'), colors.HexColor('#f5f0ff'), '#7c3aed'),
    }
    border_color, bg_color, label_bg_hex = mood_colors.get(mood, mood_colors['tip'])
    label_bg = colors.HexColor(label_bg_hex)
    mood_label = {'tip': 'VOLT SAYS', 'warning': 'VOLT WARNS', 'insight': 'VOLT INSIGHT', 'story': 'VOLT NARRATES'}
    label = mood_label.get(mood, 'VOLT SAYS')

    # Avatar — render at a good size
    avatar = volt_avatar(40)

    # Label bar — white text on COLORED background (the mood color)
    label_p = Paragraph(f'<b>{label}</b>', ParagraphStyle(
        'volt_label', fontName='JetBrainsMono-Bold', fontSize=9, leading=12,
        textColor=colors.white, alignment=TA_LEFT))
    label_bar = Table([[label_p]], colWidths=[None])
    label_bar.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), label_bg),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))

    # Body text — dark on pale background, generous spacing
    body_p = Paragraph(text, ParagraphStyle(
        'volt_body', fontName=BODY_FONT, fontSize=10.5, leading=16,
        textColor=TEXT_PRIMARY, alignment=TA_LEFT,
        spaceBefore=6, spaceAfter=2))

    # Inner: label bar on top, body text below
    inner = Table([[label_bar], [body_p]], colWidths=[None])
    inner.setStyle(TableStyle([
        ('LEFTPADDING',(0,0),(-1,-1), 0),
        ('RIGHTPADDING',(0,0),(-1,-1), 0),
        ('TOPPADDING',(0,0),(-1,-1), 0),
        ('BOTTOMPADDING',(0,0),(-1,-1), 0),
        ('TOPPADDING',(0,1),(0,1), 6),  # space above body text
    ]))

    # Outer: avatar | inner, with mood-colored left border
    outer = Table([[avatar, inner]], colWidths=[48, None])
    outer.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), bg_color),     # avatar cell gets pale bg
        ('BACKGROUND', (1,0), (1,-1), bg_color),     # text cell gets pale bg
        ('LINEBEFORE', (0,0), (0,-1), 4, border_color),  # thick colored left border
        ('VALIGN', (0,0), (0,0), 'TOP'),             # avatar top-aligned
        ('VALIGN', (1,0), (1,0), 'TOP'),
        ('LEFTPADDING',(0,0), (0,0), 6),             # avatar cell padding
        ('RIGHTPADDING',(0,0),(0,0), 4),
        ('TOPPADDING',(0,0), (0,0), 8),
        ('BOTTOMPADDING',(0,0),(0,0), 8),
        ('LEFTPADDING',(1,0), (1,0), 0),             # text cell no extra padding (inner handles it)
        ('RIGHTPADDING',(1,0),(1,0), 8),
        ('TOPPADDING',(1,0), (1,0), 0),
        ('BOTTOMPADDING',(1,0),(1,0), 8),
    ]))
    return outer

# ─── Guide character "Amp" — Volt's friend, asks CS-engineer questions ──────
# Amp is a second pixel-art character (8x8 grid, amber theme) that appears in
# callout boxes alongside Volt's, asking the kind of questions a software
# engineer would actually ask. This turns the curriculum into a dialogue.

# Amp avatar: 8x8 pixel grid. 1=amber body, 2=darker amber (eyes/details), 0=empty
AMP_AVATAR = [
    [0,0,0,1,1,1,1,0],  # top of head
    [0,0,1,1,1,1,1,1],  # head
    [0,1,1,2,1,2,1,1],  # eyes (2 = darker amber)
    [1,1,1,1,1,1,1,1],  # face
    [1,1,1,1,1,1,1,1],  # chin
    [0,1,1,1,1,1,1,0],  # neck
    [0,1,0,1,1,0,1,0],  # body sides
    [0,1,1,1,1,1,1,0],  # body bottom
]

# Amp color palette (amber/orange theme — distinct from Volt's green)
AMP_AMBER       = colors.HexColor('#d97706')  # primary amber
AMP_AMBER_DARK  = colors.HexColor('#92400e')  # eyes/details
AMP_AMBER_SOFT  = colors.HexColor('#fef6e7')  # very pale amber wash for callout body

def amp_avatar(size=32):
    """Render Amp as a small pixel-art Drawing flowable (amber theme)."""
    from reportlab.graphics.shapes import Drawing, Rect
    cell = size // 8
    d = Drawing(size, size)
    for r, row in enumerate(AMP_AVATAR):
        for c, val in enumerate(row):
            if val == 1:
                color = AMP_AMBER
            elif val == 2:
                color = AMP_AMBER_DARK
            else:
                continue
            x = c * cell
            y = size - (r + 1) * cell
            d.add(Rect(x, y, cell, cell, fillColor=color, strokeColor=None))
    return d

def amp_says(text, mood='question'):
    """A callout featuring Amp, Volt's friend. Amp asks the kind of questions
    a software engineer would ask, turning the curriculum into a dialogue.

    mood: 'question' (amber, 'AMP ASKS') or 'insight' (deeper amber, 'AMP NOTES')
    Layout mirrors volt_says: [avatar] | [colored label bar on top, body below]
    """
    mood_colors = {
        'question': (AMP_AMBER,       AMP_AMBER_SOFT, '#d97706'),
        'insight':  (AMP_AMBER_DARK,  AMP_AMBER_SOFT, '#92400e'),
    }
    border_color, bg_color, label_bg_hex = mood_colors.get(mood, mood_colors['question'])
    label_bg = colors.HexColor(label_bg_hex)
    mood_label = {'question': 'AMP ASKS', 'insight': 'AMP NOTES'}
    label = mood_label.get(mood, 'AMP ASKS')

    # Avatar
    avatar = amp_avatar(40)

    # Label bar — white text on amber background
    label_p = Paragraph(f'<b>{label}</b>', ParagraphStyle(
        'amp_label', fontName='JetBrainsMono-Bold', fontSize=9, leading=12,
        textColor=colors.white, alignment=TA_LEFT))
    label_bar = Table([[label_p]], colWidths=[None])
    label_bar.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), label_bg),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))

    # Body text
    body_p = Paragraph(text, ParagraphStyle(
        'amp_body', fontName=BODY_FONT, fontSize=10.5, leading=16,
        textColor=TEXT_PRIMARY, alignment=TA_LEFT,
        spaceBefore=6, spaceAfter=2))

    # Inner: label bar on top, body text below
    inner = Table([[label_bar], [body_p]], colWidths=[None])
    inner.setStyle(TableStyle([
        ('LEFTPADDING',(0,0),(-1,-1), 0),
        ('RIGHTPADDING',(0,0),(-1,-1), 0),
        ('TOPPADDING',(0,0),(-1,-1), 0),
        ('BOTTOMPADDING',(0,0),(-1,-1), 0),
        ('TOPPADDING',(0,1),(0,1), 6),
    ]))

    # Outer: avatar | inner, with amber left border
    outer = Table([[avatar, inner]], colWidths=[48, None])
    outer.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), bg_color),
        ('BACKGROUND', (1,0), (1,-1), bg_color),
        ('LINEBEFORE', (0,0), (0,-1), 4, border_color),
        ('VALIGN', (0,0), (0,0), 'TOP'),
        ('VALIGN', (1,0), (1,0), 'TOP'),
        ('LEFTPADDING',(0,0), (0,0), 6),
        ('RIGHTPADDING',(0,0),(0,0), 4),
        ('TOPPADDING',(0,0), (0,0), 8),
        ('BOTTOMPADDING',(0,0),(0,0), 8),
        ('LEFTPADDING',(1,0), (1,0), 0),
        ('RIGHTPADDING',(1,0),(1,0), 8),
        ('TOPPADDING',(1,0), (1,0), 0),
        ('BOTTOMPADDING',(1,0),(1,0), 8),
    ]))
    return outer

# ─── Pull quote — large visual quote for emphasis ───────────────────────────
def pull_quote(text, attribution=None):
    """A large, visually distinct quote — like a magazine pull quote."""
    quote_p = Paragraph(f'<i>"{text}"</i>', ParagraphStyle(
        'pullquote', fontName=BODY_FONT, fontSize=14, leading=20,
        textColor=ACCENT, alignment=TA_LEFT, leftIndent=12, rightIndent=12,
        spaceBefore=8, spaceAfter=4))
    elements = [quote_p]
    if attribution:
        attr_p = Paragraph(f'— {attribution}', ParagraphStyle(
            'pullquote_attr', fontName='JetBrainsMono', fontSize=9, leading=12,
            textColor=TEXT_MUTED, alignment=TA_LEFT, leftIndent=12, spaceAfter=8))
        elements.append(attr_p)
    # Left green border
    wrap = Table([[e] for e in elements], colWidths=[None])
    wrap.setStyle(TableStyle([
        ('LINEBEFORE', (0,0), (0,-1), 3, ACCENT),
        ('LEFTPADDING',(0,0),(-1,-1), 0),
        ('RIGHTPADDING',(0,0),(-1,-1), 0),
        ('TOPPADDING',(0,0),(-1,-1), 2),
        ('BOTTOMPADDING',(0,0),(-1,-1), 2),
    ]))
    return wrap

# ─── Pixel diagram library ──────────────────────────────────────────────────

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

# ════════════════════════════════════════════════════════════════════════════
# PIXEL DIAGRAM LIBRARY — Minecraft-style voxel art for EE concepts
# ════════════════════════════════════════════════════════════════════════════
from reportlab.graphics.shapes import Drawing, Rect, Line, String, Circle, Polygon
from reportlab.graphics import renderPDF

def _g(s):
    """Convert a multi-line string of '.' (empty) and 'X'/'#' (filled) to a 2D list."""
    lines = [ln for ln in s.strip('\n').split('\n')]
    return [[1 if c in ('X', '#') else 0 for c in line] for line in lines]

def pixel_diagram(grid, cell_size=10, color=None, gap=1):
    """Generate a Minecraft-style pixel diagram as a ReportLab Drawing.
    `grid` is a 2D list of 0/1. Returns a Drawing flowable."""
    if color is None:
        color = ACCENT
    if isinstance(color, str):
        color = colors.HexColor(color)
    rows = len(grid)
    cols = len(grid[0]) if rows > 0 else 0
    width = cols * (cell_size + gap) - gap if cols > 0 else 0
    height = rows * (cell_size + gap) - gap if rows > 0 else 0
    d = Drawing(width, height)
    for r, row in enumerate(grid):
        for c, cell in enumerate(row):
            if cell:
                x = c * (cell_size + gap)
                y = height - (r + 1) * cell_size - r * gap  # flip Y so row 0 is top
                d.add(Rect(x, y, cell_size, cell_size,
                           fillColor=color, strokeColor=None))
    return d

def pixel_diagram_block(grid, caption=None, cell_size=10, color=None,
                         align='CENTER', keep=True):
    """Return a list of flowables: small spacer + centered diagram + optional caption.
    The diagram is wrapped in a single-cell Table so it can be horizontally centered.
    `keep=True` wraps the whole thing in KeepTogether to avoid awkward page breaks."""
    if color is None:
        color = ACCENT
    drawing = pixel_diagram(grid, cell_size=cell_size, color=color, gap=1)
    items = [Spacer(1, 4)]
    # Wrap drawing in a Table for horizontal centering
    t = Table([[drawing]], colWidths=[CONTENT_WIDTH])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), align),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    items.append(t)
    if caption:
        items.append(Paragraph(f'<i>{caption}</i>', styles['diagram_caption']))
    items.append(Spacer(1, 4))
    if keep:
        return [KeepTogether(items)]
    return items

def pixel_divider(width_cells=46, cell_size=4, color=None, gap=2):
    """A horizontal pixel-art divider — alternating filled/empty blocks across the page.
    Used between major sections (phases)."""
    if color is None:
        color = ACCENT
    # 3-row pattern: top/bottom rows have alternating blocks, middle is sparse dots
    grid = []
    grid.append([1 if i % 2 == 0 else 0 for i in range(width_cells)])
    grid.append([1 if i % 4 == 0 else 0 for i in range(width_cells)])
    grid.append([1 if i % 2 == 1 else 0 for i in range(width_cells)])
    d = pixel_diagram(grid, cell_size=cell_size, color=color, gap=gap)
    t = Table([[d]], colWidths=[CONTENT_WIDTH])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    return t

# ─── Pixel-art diagram definitions ─────────────────────────────────────────
# Each diagram is a 2D grid (list of lists) of 0/1, designed so that an EE
# can recognise the concept at a glance. Use _g() to convert multi-line art.

# Resistor — box with two leads (American rectangle style)
DIAG_RESISTOR = _g("""
..XXXXXX..
XX......XX
..XXXXXX..
..........
""")

# Capacitor — two parallel plates with leads
DIAG_CAPACITOR = _g("""
.............
XXXXX...XXXXX
.............
.............
""")

# Inductor — three-coil series
DIAG_INDUCTOR = _g("""
.XX.XX.XX.
X........X
..........
..........
""")

# Diode — triangle pointing right with cathode bar
DIAG_DIODE = _g("""
...X....
..XXX...
.XXXXX..
XXXXXXX.
.XXXXX..
..XXX...
...X....
""")

# Ground symbol
DIAG_GROUND = _g("""
...X...
..XXX..
.XXXXX.
XXXXXXX
.......
""")

# NPN BJT transistor
DIAG_TRANSISTOR_NPN = _g("""
............
....X.......
...XXX......
....X.......
....X.......
XXXXXXX......
....X.......
....X.......
....X.......
...XXX.X....
............
""")

# MOSFET (n-channel enhancement)
DIAG_MOSFET = _g("""
..............
.....X........
....XXX.......
.....X........
.....X........
XXXXXXX........
.....X........
.....X........
....XXX.......
..............
""")

# Op-amp triangle
DIAG_OPAMP = _g("""
.........
.........
XX.......
XX..XX...
XX....XX.
XX......X
XX....XX.
XX..XX...
XX.......
.........
""")

# Half-wave rectifier — AC source → diode → load → ground
DIAG_HALF_WAVE = _g("""
................
.X..............
X.X....X........
.X.....XXX......
.X......X.......
.X......X......X
.X......X......X
.X......X.....XX
........X.......
........XXXX....
""")

# RC low-pass filter — R in series, C to ground, Vout at midpoint
DIAG_RC_LOW_PASS = _g("""
................
..XXXXXX...X....
XX......X..X....
..XXXXXX...X....
...........X....
..XXXXX....X....
XX....X....X....
..XXXXX...XXX....
""")

# RLC series resonance — R + L + C in series, output across C
DIAG_RLC = _g("""
................
..XXXXXX...X....
XX......X..X....
..XXXXXX...X....
...........X....
.XX.XX.X...X....
X........X.X....
.XX.XX.X..XXX....
""")

# Op-amp inverting amplifier — Rf feedback + Rin input
DIAG_OPAMP_INV = _g("""
................
....X.....X.....
....X....XXX....
XXXX.....X......
....X....XXX....
....X.....X.....
....X.....X.....
....X...........
....X...........
""")

# Buck converter — switch + diode + inductor + cap
DIAG_BUCK = _g("""
........................
.X.......X..X..XXX.......
.X.......X..X....X.......
.XXXXXXX.X..X....X.......
.......X.X..X..XXXXXXX...
.......X.X..X........X...
.......X.X..X........X...
.......XXXX.X........XXX.
""")

# D flip-flop — block with D, CLK, Q, Q-bar
DIAG_D_FLIP_FLOP = _g("""
................
.X........X.....
.X........X.....
.X........X.....
.XXXXX....XXX...
.X........X.....
.X........X.....
.X........X.....
.XXXXX.....X....
................
""")

# Sinusoidal waveform — 1.5 cycles, pixelated
DIAG_SINE_WAVE = _g("""
........................
..........XX....XX......
........XX........XX....
......XX............XX..
....XX................XX
..XX....................X
XX.......................
........................
""")

# Square wave — 2.5 cycles
DIAG_SQUARE_WAVE = _g("""
........................
XXXXX.......XXXXX.......
....X.......X.....X.....
....X.......X.....X.....
....XXXXXXX.......XXXXXX
........................
........................
........................
""")

# Bode plot of low-pass — flat then -20 dB/dec rolloff
DIAG_BODE_LOW_PASS = _g("""
........................
XXXXXXXXX...............
........X...............
........XX..............
.........XX.............
..........XX............
...........XXX..........
..............XXXXXX....
........................
""")

# Smith chart — pixel circle with impedance grid
DIAG_SMITH = _g("""
......XXXX......
....XX....XX....
...X........X...
..X..........X..
.X....XXXX....X.
.X..XX....XX..X.
.X.X........X.X.
.X.X........X.X.
.X..XX....XX..X.
.X....XXXX....X.
..X..........X..
...X........X...
....XX....XX....
......XXXX......
................
""")

# Three-phase phasors — three arrows 120° apart
DIAG_THREE_PHASE = _g("""
......X......
.....XXX.....
....XXXXX....
...XX...XX...
..XX.....XX..
.XX.......XX.
XX....X....XX
.....XXX.....
....XX.XX....
...XX...XX...
..XX.....XX..
.X.........X.
X...........X
.............
""")

# PID feedback loop — setpoint → error → PID → plant → output → feedback
DIAG_PID_LOOP = _g("""
............................
.X....XXX....XXX....XXX....X
.X....X.X....X.X....X.X....X
.X....XXX....XXX....XXX....X
.X....XXX....XXX....XXX....X
.X....X.X....X.X....X.X....X
.X....XXX....XXX....XXX....X
.XXXXXXXXXXXXXXXXXXXXXXXXXXX
............................
""")

# FOC motor control — Clarke+Park transform block diagram
DIAG_FOC = _g("""
............................
.X..XX..XXX..XXX..XXX..XXX..
.X..XX..X.X..X.X..X.X..X.X..
.XXXXX..XXX..XXX..XXX..XXX..
.X..XX..XXX..XXX..XXX..XXX..
.X..XX..X.X..X.X..X.X..X.X..
.XXXXX..XXX..XXX..XXX..XXX..
............................
............................
""")

# CMOS inverter — PMOS top, NMOS bottom, input on left, output midpoint
DIAG_CMOS_INVERTER = _g("""
................
.....X.....X....
....XXX...XXX...
.....X.....X....
.....X.....X....
XXXXXXX...XXXXXX
.....X.....X....
.....X.....X....
....XXX...XXX...
.....X.....X....
................
""")

# Dipole antenna — vertical bar with radiation lobes
DIAG_DIPOLE = _g("""
................
.......X.......
......XXX......
.....XXXXX.....
....XX...XX....
....XX...XX....
....XX...XX....
....XX...XX....
....XX...XX....
....XX...XX....
.....XXXXX.....
......XXX......
.......X.......
................
""")

# Solar PV + MPPT — panel + MPPT block + load
DIAG_SOLAR_MPPT = _g("""
........................
.XXX..X..XX..XXX........
.X.X..X..XX..X.X..XXX...
.XXX..X..XX..XXX..X.X...
.X.X..X..XX..X.X..XXX...
.XXX..X..XX..XXX..XXX...
......X..XX.............
......X..XX.............
........................
""")

# Constant-current source / current mirror (two transistors)
DIAG_CURRENT_MIRROR = _g("""
........................
....X.........X.........
...XXX.......XXX........
....X.........X.........
XXXXXXX.....XXXXXXX.....
....X.........X.........
....X.........X.........
....X.........X.........
...XXX.......XXX........
........................
""")

# Logic AND gate
DIAG_AND_GATE = _g("""
..........
..........
XX........
XX..XXXX..
XX.....XX.
XX......XX
XX.....XX.
XX..XXXX..
XX........
..........
""")

# 555 timer block diagram
DIAG_555_TIMER = _g("""
................
.X..............
.XXXXXX..XXX....
.X.....X..X.....
.X.....X..XXX...
.X.....X....X...
.XXXXXX..XXX....
.X..............
................
""")

# Filter response: band-pass
DIAG_BANDPASS = _g("""
........................
..........XX............
.........XXXX...........
........XXXXXX..........
.......XXXXXXXX.........
......XXXXXXXXXX........
.....XXXXXXXXXXXX.......
....XXXXXXXXXXXXXX......
...XXXXXXXXXXXXXXXX.....
..XXXXXXXXXXXXXXXXXX....
.XXXXXXXXXXXXXXXXXXXX...
........................
""")

# Tree of circuit-analysis methods (just a simple tree)
DIAG_TREE = _g("""
............X............
............X............
...........XXX...........
..........XXXXX..........
.........XXXXXXX.........
........XXXXX.XX.........
.......XXX.....XX........
......XX........XX.......
.....XX..........XX......
....XX............XX.....
...XX..............XX....
..XX................XX...
.XX..................XX..
XX....................XX.
""")

# ─── Phase 0: foundational law diagrams ────────────────────────────────────
# Ohm's law triangle: V at top, I and R on bottom row
DIAG_OHM_LAW = _g("""
............X............
...........XXX...........
..........XXXXX..........
.........XXXXXXX.........
........XXXXX.XX.........
.......XXX.....XX........
......XX.........XX......
.....XX...........XX.....
....XX.............XX....
...XX...............XX...
..XX.................XX..
.XX...................XX.
XX.....................XX
""")

# KVL loop: a square loop with arrows around it
DIAG_KVL_LOOP = _g("""
................
.XXXXXXXXXXXXXX.
.X............X.
.X............X.
.X............X.
.X............X.
.X............X.
.XXXXXXXXXXXXXX.
................
""")

# KCL node: three currents meeting at a single point
DIAG_KCL_NODE = _g(r"""
.......X........
.......X........
.......X........
....X..X..X.....
.....\..|../.....
......\.|./......
.......X.X.......
........X.......
........X.......
""")

# Thevenin equivalent: source + R in a box with two terminals
DIAG_THEVENIN_EQUIV = _g("""
................
.X..XXX.....X...
.X..X.X.X...X...
.X..XXX.....X...
.X..........X...
.X..........X...
.X..........X...
.XXXXXXXXXXXX...
................
""")

# Superposition: two sources contributing to one output
DIAG_SUPERPOSITION = _g("""
........................
.X....XXX....XXX....X...
.X....X.X....X.X....X...
.X....XXX....XXX....X...
.X.....................X
.X.....................X
.X.....................X
.XXXXXXXXXXXXXXXXXXXXXX.
........................
""")

# ─── Phase 1: DC circuit topologies ────────────────────────────────────────
# Voltage divider: V_in → R1 → node → R2 → gnd
DIAG_VOLTAGE_DIVIDER = _g("""
................
.XXXXXX.........
.X....X.........
.XXXXXX.........
......X.........
......XXXXXXXXXX
......X.........
......X.........
......X.........
XXXXXXXXXXXXXXXX
""")

# Wheatstone bridge: diamond of four resistors
DIAG_WHEATSTONE = _g("""
........X........
.......XXX.......
......XX.XX......
.....XX...XX.....
....XX.....XX....
...XX.......XX...
..XX.........XX..
.X.............X.
X...............X
""")

# RC charging curve: exponential rise
DIAG_RC_CHARGING = _g("""
........................
XX......................
.XX.....................
..XX....................
...XXX..................
.....XXX................
.......XXXX.............
..........XXXXX.........
...............XXXXXXXXX
........................
""")

# RL charging: similar exponential rise (current vs time)
DIAG_RL_CHARGING = _g("""
........................
XX......................
.XX.....................
..XX....................
...XXX..................
.....XXX................
.......XXXX.............
..........XXXXX.........
...............XXXXXXXXX
........................
""")

# RLC damped: decaying sinusoid
DIAG_RLC_DAMPED = _g("""
........................
.......XX......XX.......
.....XX..XX..XX..XX.....
....X......XX......XX...
...X........X........X..
...X.........X........X.
....X.........X........X
.....X..........X......X
......X..........X....X.
.......X..........X..X..
........X..........XX...
.........X..........X...
..........X..........X..
...........X.............
............X............
.............X...........
""")

# ─── Phase 2: AC analysis diagrams ─────────────────────────────────────────
# AC phasor: rotating arrow in complex plane
DIAG_AC_PHASOR = _g("""
............X....
...........X.....
..........X......
.........X.......
........X........
.......X.........
......X..........
.....X...........
....X............
...X.............
..X..............
.X...............
X................
""")

# Impedance triangle: R horizontal, X vertical, Z hypotenuse
DIAG_IMPEDANCE_TRIANGLE = _g("""
................
XXXXXXXXX.......
........X.......
........X.......
........X.......
........X.......
........X.......
........X.......
........X.......
""")

# Power triangle: P horizontal, Q vertical, S hypotenuse
DIAG_POWER_TRIANGLE = _g("""
................
XXXXXXXXX.......
........X.......
........X.......
........X.......
........X.......
........X.......
........X.......
........X.......
""")

# Series resonance: RLC in a string with peak marker
DIAG_SERIES_RESONANCE = _g("""
........................
.X.....X.....X.....X....
.X....X.X....X....X.X...
.X...X...X...X...X...X..
.X..X.....X..X..X.....X.
.X.X.......X.X.X.......X
.XX.........XXX.........
........................
""")

# Parallel resonance: tank circuit (L || C)
DIAG_PARALLEL_RESONANCE = _g("""
........................
.X....X.X....X.X....X...
.X...X...X...X...X...X..
.X..X.....X..X..X.....X.
.X.X.......X.X.X.......X
.XX.........XXX.........
........................
""")

# ─── Phase 3: analog electronics topologies ────────────────────────────────
# Full-wave bridge rectifier: 4 diodes + load
DIAG_FULL_WAVE = _g("""
........................
.X......X......X........
.X.X..X.X.X..X.X.X......
.X..XX..X..XX..X..X.....
.X...X..X...X..X...X....
.X......X......X........
.XXXXXXXXXXXXXXXXXXXXXX.
........................
""")

# Common-emitter amplifier: BJT with R_C and R_E
DIAG_CE_AMPLIFIER = _g("""
........................
...X....................
..XXX...................
...X....................
...X....................
XXXXXXX.................
...X....................
...X....................
...XXX..................
....X...................
........................
""")

# Common-source amplifier: MOSFET with R_D
DIAG_CS_AMPLIFIER = _g("""
........................
.....X..................
....XXX.................
.....X..................
.....X..................
XXXXXXX.................
.....X..................
.....X..................
....XXX.................
.....X..................
........................
""")

# Sallen-Key filter topology: 2 RC + op-amp
DIAG_SALLEN_KEY = _g("""
........................
.XXXXXX...X.....XXX.....
.X....X...X....X.X......
.XXXXXX...X....XXX......
..........X.....X.......
..........X.....X.......
..........X.....X.......
..........X.............
..........X.............
........................
""")

# Integrator: op-amp with cap feedback
DIAG_INTEGRATOR = _g("""
........................
.X.....X.....X..........
.X....XXX....X..........
.X.....X.....X..........
.X.....X.....X..........
.X.....X.....X..........
.X.....X.....X..........
.X.....X.....X..........
.X.....X.....X..........
........................
""")

# ─── Phase 4: digital logic topologies ─────────────────────────────────────
# NAND gate: AND with bubble
DIAG_NAND_GATE = _g("""
..........
..........
XX........
XX..XXXX..
XX.....XX.
XX......XX
XX.....XX.
XX..XXXX..
XX.......
..........
""")

# NOR gate: OR with bubble
DIAG_NOR_GATE = _g("""
..........
..........
XX....XXX.
XX...XX.XX
XX..XX..XX
XX.XX...XX
XXXX....XX
XXX......X
XX........
..........
""")

# Multiplexer: trapezoid with select input
DIAG_MUX = _g("""
................
XX..............
XXX............X
XXXX..........XX
XXXXX........XXX
XXXXXX......XXXX
XXXXXXX....XXXXX
XXXXXXXX..XXXXXX
XXXXXXXXXXXXXXXX
................
""")

# Decoder: input → multiple outputs (one-hot)
DIAG_DECODER = _g("""
........................
.X....................X.
.X...................XX.
.X..................XXX.
.X.................XXXX.
.X................XXXXX.
.X...............XXXXXX.
.X..............XXXXXXX.
.X....................X.
........................
""")

# 4-bit counter: row of flip-flops
DIAG_COUNTER_4BIT = _g("""
........................
.X.....X.....X.....X....
.X.....X.....X.....X....
.XXXXX.XXXXX.XXXXX.XXXXX
.X.....X.....X.....X....
.X.....X.....X.....X....
.XXXXX.XXXXX.XXXXX.XXXXX
.X.....X.....X.....X....
.X.....X.....X.....X....
........................
""")

# Shift register: flip-flops in a chain
DIAG_SHIFT_REGISTER = _g("""
........................
.X.....X.....X.....X....
.X.....X.....X.....X....
.XXXXX.XXXXX.XXXXX.XXXXX
.X.....X.....X.....X....
.X.....X.....X.....X....
.XXXXX.XXXXX.XXXXX.XXXXX
.X.....X.....X.....X....
.X.....X.....X.....X....
........................
""")

# SPI bus: master + 3 slaves with shared SCK/MOSI/MISO + individual CS
DIAG_SPI_BUS = _g("""
........................
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
........................
""")

# I2C bus: master + slaves sharing 2 wires (SDA, SCL)
DIAG_I2C_BUS = _g("""
........................
.X....................X.
.X....................X.
.XXXXXXXXXXXXXXXXXXXXXX.
.X....................X.
.X....................X.
.XXXXXXXXXXXXXXXXXXXXXX.
.X....................X.
.X....................X.
........................
""")

# ─── Phase 5: signals & DSP diagrams ───────────────────────────────────────
# Impulse response: delta function + decaying tail
DIAG_IMPULSE_RESPONSE = _g("""
........................
........X...............
.......XXX..............
......XXXXX.............
.....XXXXXXX............
....XXXXXXXXX...........
...XXXXXXXXXXX..........
..XXXXXXXXXXXXX.........
.XXXXXXXXXXXXXXX........
XXXXXXXXXXXXXXXXXXXXXXX.
""")

# Convolution demo: two signals overlapping
DIAG_CONVOLUTION = _g("""
........................
...XX........XX.........
..XXXX......XXXX........
.XXXXXX....XXXXXX.......
.XXXXXXX..XXXXXXX.......
..XXXXXXX.XXXXXXX.......
...XXXXXXXXXXXXX........
....XXXXXXXXXXX..........
.....XXXXXXXXX..........
......XXXXXXX...........
.......XXXXX............
........XXX.............
.........X..............
""")

# FFT butterfly: classic radix-2 diagram
DIAG_FFT_BUTTERFLY = _g("""
........................
.X........X............X
.X........X...........X.
.X........X..........X..
.X........X.........X...
..XX....XX........X.....
....XXXX........X.......
......XX......X.........
......XX....X...........
....XXXX..X.............
..XX....XX..............
.X........X.............
.X........X.............
.X........X.............
.X........X.............
""")

# FIR filter: tapped delay line with summing junction
DIAG_FIR_FILTER = _g("""
........................
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.XXXXXXXXXXXXXXXXXXXXXX.
.X....................X.
.X....................X.
.XXXXXXXXXXXXXXXXXXXXXX.
........................
""")

# IIR filter: feedback path
DIAG_IIR_FILTER = _g("""
........................
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.XXXXXXXXXXXXXXXXXXXXXX.
.X....................X.
.X....................X.
.XXXXXXXXXXXXXXXXXXXXXX.
.X....................X.
.X....................X.
.XXXXXXXXXXXXXXXXXXXXXX.
........................
""")

# ─── Phase 6: control systems diagrams ─────────────────────────────────────
# Feedback loop: setpoint → sum → controller → plant → output (with feedback path)
DIAG_FEEDBACK_LOOP = _g("""
............................
.X...XXX...XXX...XXX...XXX.X
.X...X.X...X.X...X.X...X.X.X
.X...XXX...XXX...XXX...XXX.X
.X........................X
.X........................X
.XXXXXXXXXXXXXXXXXXXXXXXXXXX
............................
""")

# Root locus: poles (X) and zeros (O) with locus curves
DIAG_ROOT_LOCUS = _g("""
........................
..........X.............
........X.X.X...........
.......X..X..X..........
......X...X...X.........
.....X....X....X........
....X.....X.....X.......
...X......X......X......
..X.......X.......X.....
.X........X........X....
X.........X.........X...
""")

# Nyquist plot: polar curve encircling -1
DIAG_NYQUIST = _g("""
........................
.....XXXXXXXX...........
....XX......XX..........
...X..........X.........
..X............X........
..X.....XX.....X........
..X....X..X....X........
..X...X....X...X........
..X....X..X....X........
..X.....XX.....X........
..X............X........
...X..........X.........
....XX......XX..........
.....XXXXXXXX...........
""")

# PID block: P + I + D summed
DIAG_PID_BLOCK = _g("""
........................
.X...XXX...XXX...XXX....
.X...X.X...X.X...X.X....
.X...XXX...XXX...XXX....
.X...XXX...XXX...XXX....
.X...X.X...X.X...X.X....
.X...XXX...XXX...XXX....
.XXXXXXXXXXXXXXXXXXXXXX.
""")

# State-space: A B C D matrix block diagram
DIAG_STATE_SPACE = _g("""
........................
.X..XX..XXX..XXX..XXX....
.X..XX..X.X..X.X..X.X....
.XXXXX..XXX..XXX..XXX....
.X..XX..XXX..XXX..XXX....
.X..XX..X.X..X.X..X.X....
.XXXXX..XXX..XXX..XXX....
........................
""")

# ─── Phase 7: power electronics + machines ─────────────────────────────────
# Boost converter: switch + diode + inductor + cap (step-up)
DIAG_BOOST = _g("""
........................
.X.......X..X..XXX.......
.X.......X..X....X.......
.XXXXXXX.X..X....X.......
.......X.X..X..XXXXXXX...
.......X.X..X........X...
.......X.X..X........X...
.......XXXX.X........XXX.
""")

# Buck-boost: inductor in middle, inverting output
DIAG_BUCK_BOOST = _g("""
........................
.X.......X..X..XXX.......
.X.......X..X....X.......
.XXXXXXX.X..X....X.......
.......X.X..X..XXXXXXX...
.......X.X..X........X...
.......X.X..X........X...
.......XXXX.X........XXX.
""")

# H-bridge: 4 switches in H pattern driving load
DIAG_H_BRIDGE = _g("""
........................
.X..........X..........
.X..........X..........
.XXXXXXXXXXXXXXXXXXXXXX.
.X..........X..........
.X..........X..........
.XXXXXXXXXXXXXXXXXXXXXX.
.X..........X..........
.X..........X..........
........................
""")

# SPWM: sine wave overlaid on triangle carrier
DIAG_SPWM = _g("""
........................
...XX....XX....XX.......
..X..X..X..X..X..X......
.X....XX....XX....XX....
........................
XX....XX....XX....XX....
.X..X..X..X..X..X......X
..XX....XX....XX....XX..
........................
""")

# BLDC 6-step: three-phase, six switching states
DIAG_BLDC_6STEP = _g("""
........................
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.XXXXXXXXXXXXXXXXXXXXXX.
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.XXXXXXXXXXXXXXXXXXXXXX.
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
........................
""")

# Induction motor: stator + rotating field + cage rotor
DIAG_INDUCTION_MOTOR = _g("""
........................
....XXXXXXXXXXXXXXXX....
...XX................XX.
..XX..................XX
.XX....................X
.X.....................X
.X.....................X
.X....................XX
..XX..................XX
...XX................XX.
....XXXXXXXXXXXXXXXX....
........................
""")

# ─── Phase 8: EM/RF/comms diagrams ─────────────────────────────────────────
# EM wave: E and B fields perpendicular, propagating in z
DIAG_EM_WAVE = _g("""
........................
....X....X....X....X....
...XXX..XXX..XXX..XXX...
....X....X....X....X....
........................
X....X....X....X....X...
XX..XX..XX..XX..XX..XX..
X....X....X....X....X...
........................
....X....X....X....X....
...XXX..XXX..XXX..XXX...
....X....X....X....X....
""")

# Transmission line: distributed L and C
DIAG_TRANSMISSION_LINE = _g("""
........................
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.XXXXXXXXXXXXXXXXXXXXXX.
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
.XXXXXXXXXXXXXXXXXXXXXX.
........................
""")

# Matching network: L + C arrangement between source and load
DIAG_MATCHING_NETWORK = _g("""
........................
.XXXXXX....X....XXXXXX..
.X....X...XXX...X....X..
.XXXXXX....X....XXXXXX..
...........X............
...........X............
...........X............
XXXXXXXXXXXXXXXXXXXXXXXX
""")

# AM modulation: carrier × envelope
DIAG_AM_MODULATION = _g("""
........................
...XX...XX...XX...XX....
..XXXX..XXXX..XXXX..XXX.
.XXXXX.XXXXX.XXXXX.XXXX.
XXXXXXXXXXXXXXXXXXXXXXXX
.XXXXX.XXXXX.XXXXX.XXXX.
..XXXX..XXXX..XXXX..XXX.
...XX...XX...XX...XX....
""")

# FM modulation: constant amplitude, varying frequency
DIAG_FM_MODULATION = _g("""
........................
..XX....XXXX..XX....XXX.
.XXXX..XXXXXX.XXXX..XXXX
XXXXXX.XXXXXX XXXXXX.XXX
.XXXX..XXXXXX.XXXX..XXXX
..XX....XXXX..XX....XXX.
........................
""")

# QAM constellation: 16 points in a 4x4 grid
DIAG_QAM_CONSTELLATION = _g("""
........................
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
........................
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
........................
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
........................
""")

# ─── Phase 9: VLSI layout diagrams ─────────────────────────────────────────
# NAND CMOS: 2 PMOS in parallel (top) + 2 NMOS in series (bottom)
DIAG_NAND_CMOS = _g("""
........................
....X.....X.............
...XXX...XXX............
....X.....X.............
....X.....X.............
XXXXXXX.XXXXXXX.........
....X.....X.............
....X.....X.............
....X..X..X.............
...XXX.X.XXX............
....X..X..X.............
........................
""")

# NOR CMOS: 2 PMOS in series (top) + 2 NMOS in parallel (bottom)
DIAG_NOR_CMOS = _g("""
........................
....X..X..X.............
...XXX.X.XXX............
....X..X..X.............
....X..X..X.............
XXXXXXX.XXXXXXX.........
....X.....X.............
....X.....X.............
....X.....X.............
...XXX...XXX............
....X.....X.............
........................
""")

# D flip-flop CMOS: master-slave with transmission gates
DIAG_D_FLIP_FLOP_CMOS = _g("""
........................
.X........X............
.X........X............
.X........X............
.XXXXX....XXX..........
.X........X............
.X........X............
.X........X............
.XXXXX.....X...........
........................
""")

# STA paths: launch flop → combinational cloud → capture flop
DIAG_STA_PATHS = _g("""
........................
.X...XXXXXXXXXXXX...X...
.X...X..........X...X...
.X...X..........X...X...
.X...X..........X...X...
.X...X..........X...X...
.X...XXXXXXXXXXXX...X...
.X....................X.
.X....................X.
.XXXXXXXXXXXXXXXXXXXXXX.
........................
""")

# Layout inverter: top-down view of CMOS inverter layout
DIAG_LAYOUT_INVERTER = _g("""
........................
.XXXXXXXXXXXXXXXXXXXXXX.
.X..XX..XX..XX..XX..XX..
.X..XX..XX..XX..XX..XX..
.XXXXXXXXXXXXXXXXXXXXXX.
.X....................X.
.X..XX..XX..XX..XX..XX..
.X..XX..XX..XX..XX..XX..
.XXXXXXXXXXXXXXXXXXXXXX.
........................
""")

# ─── Phase 10: power systems diagrams ──────────────────────────────────────
# Grid topology: generation + transmission + distribution + load
DIAG_GRID_TOPOLOGY = _g("""
........................
....X........X........X.
....X........X........X.
....X........X........X.
XXXXXXXXXXXXXXXXXXXXXXXX
.X.....................X
.X.....................X
.X.....................X
 XXXXXXXXXXXXXXXXXXXXXXX
.X..X..X..X..X..X..X....
.X..X..X..X..X..X..X....
""")

# Transformer substation: HV → transformer → LV with breakers
DIAG_TRANSFORMER_SUBSTATION = _g("""
........................
.X..XX..XXX..XXX..XXX...
.X..XX..X.X..X.X..X.X...
.XXXXXX. XXX. XXX. XXX..
.X..XX..XXX..XXX..XXX...
.X..XX..X.X..X.X..X.X...
.XXXXXX. XXX. XXX. XXX..
........................
""")

# PV system: panel + inverter + grid/load
DIAG_PV_SYSTEM = _g("""
........................
.XXX..XX..XXX..XXX......
.X.X..XX..X.X..X.X..XXX.
.XXX..XX..XXX..XXX..X.X.
.X.X..XX..X.X..X.X..XXX.
.XXX..XX..XXX..XXX..XXX.
.....XX.................
.....XX.................
........................
""")

# Wind turbine: tower + blades + nacelle
DIAG_WIND_TURBINE = _g("""
........................
........X...............
.......XXX..............
......XXXXX.............
.....XXXXXXX............
....XX.XXX.XX...........
...XX..XXX..XX..........
..XX...XXX...XX.........
.XX....XXX....XX........
.......XXX..............
.......XXX..............
.......XXX..............
.......XXX..............
.......XXX..............
""")

# EV charger: AC input → rectifier → DC/DC → battery
DIAG_EV_CHARGER = _g("""
........................
.XXXXXX...XXX....XXX....
.X....X...X.X....X.X....
.XXXXXX...XXX....XXX....
..........X......X......
..........X......X......
..........X......X......
..........X.............
..........X.............
........................
""")

# Registry mapping diagram name → grid (for content files to look up)
PIXEL_DIAGRAMS = {
    'resistor':          DIAG_RESISTOR,
    'capacitor':         DIAG_CAPACITOR,
    'inductor':          DIAG_INDUCTOR,
    'diode':             DIAG_DIODE,
    'ground':            DIAG_GROUND,
    'transistor_npn':    DIAG_TRANSISTOR_NPN,
    'mosfet':            DIAG_MOSFET,
    'opamp':             DIAG_OPAMP,
    'half_wave':         DIAG_HALF_WAVE,
    'rc_low_pass':       DIAG_RC_LOW_PASS,
    'rlc':               DIAG_RLC,
    'opamp_inv':         DIAG_OPAMP_INV,
    'buck':              DIAG_BUCK,
    'd_flip_flop':       DIAG_D_FLIP_FLOP,
    'sine_wave':         DIAG_SINE_WAVE,
    'square_wave':       DIAG_SQUARE_WAVE,
    'bode_low_pass':     DIAG_BODE_LOW_PASS,
    'smith':             DIAG_SMITH,
    'three_phase':       DIAG_THREE_PHASE,
    'pid_loop':          DIAG_PID_LOOP,
    'foc':               DIAG_FOC,
    'cmos_inverter':     DIAG_CMOS_INVERTER,
    'dipole':            DIAG_DIPOLE,
    'solar_mppt':        DIAG_SOLAR_MPPT,
    'current_mirror':    DIAG_CURRENT_MIRROR,
    'and_gate':          DIAG_AND_GATE,
    '555_timer':         DIAG_555_TIMER,
    'bandpass':          DIAG_BANDPASS,
    'tree':              DIAG_TREE,
    # Phase 0
    'ohm_law':           DIAG_OHM_LAW,
    'kvl_loop':          DIAG_KVL_LOOP,
    'kcl_node':          DIAG_KCL_NODE,
    'thevenin_equiv':    DIAG_THEVENIN_EQUIV,
    'superposition':     DIAG_SUPERPOSITION,
    # Phase 1
    'voltage_divider':   DIAG_VOLTAGE_DIVIDER,
    'wheatstone_bridge': DIAG_WHEATSTONE,
    'rc_charging':       DIAG_RC_CHARGING,
    'rl_charging':       DIAG_RL_CHARGING,
    'rlc_damped':        DIAG_RLC_DAMPED,
    # Phase 2
    'ac_phasor':         DIAG_AC_PHASOR,
    'impedance_triangle':DIAG_IMPEDANCE_TRIANGLE,
    'power_triangle':    DIAG_POWER_TRIANGLE,
    'series_resonance':  DIAG_SERIES_RESONANCE,
    'parallel_resonance':DIAG_PARALLEL_RESONANCE,
    # Phase 3
    'full_wave':         DIAG_FULL_WAVE,
    'ce_amplifier':      DIAG_CE_AMPLIFIER,
    'cs_amplifier':      DIAG_CS_AMPLIFIER,
    'sallen_key':        DIAG_SALLEN_KEY,
    'integrator':        DIAG_INTEGRATOR,
    # Phase 4
    'nand_gate':         DIAG_NAND_GATE,
    'nor_gate':          DIAG_NOR_GATE,
    'mux':               DIAG_MUX,
    'decoder':           DIAG_DECODER,
    'counter_4bit':      DIAG_COUNTER_4BIT,
    'shift_register':    DIAG_SHIFT_REGISTER,
    'spi_bus':           DIAG_SPI_BUS,
    'i2c_bus':           DIAG_I2C_BUS,
    # Phase 5
    'impulse_response':  DIAG_IMPULSE_RESPONSE,
    'convolution_demo':  DIAG_CONVOLUTION,
    'fft_butterfly':     DIAG_FFT_BUTTERFLY,
    'fir_filter':        DIAG_FIR_FILTER,
    'iir_filter':        DIAG_IIR_FILTER,
    # Phase 6
    'feedback_loop':     DIAG_FEEDBACK_LOOP,
    'root_locus':        DIAG_ROOT_LOCUS,
    'nyquist_plot':      DIAG_NYQUIST,
    'pid_block':         DIAG_PID_BLOCK,
    'state_space':       DIAG_STATE_SPACE,
    # Phase 7
    'boost_converter':   DIAG_BOOST,
    'buck_boost':        DIAG_BUCK_BOOST,
    'h_bridge':          DIAG_H_BRIDGE,
    'spwm':              DIAG_SPWM,
    'bldc_6step':        DIAG_BLDC_6STEP,
    'induction_motor':   DIAG_INDUCTION_MOTOR,
    # Phase 8
    'em_wave':           DIAG_EM_WAVE,
    'transmission_line': DIAG_TRANSMISSION_LINE,
    'matching_network':  DIAG_MATCHING_NETWORK,
    'am_modulation':     DIAG_AM_MODULATION,
    'fm_modulation':     DIAG_FM_MODULATION,
    'qam_constellation': DIAG_QAM_CONSTELLATION,
    # Phase 9
    'nand_cmos':         DIAG_NAND_CMOS,
    'nor_cmos':          DIAG_NOR_CMOS,
    'd_flip_flop_cmos':  DIAG_D_FLIP_FLOP_CMOS,
    'sta_paths':         DIAG_STA_PATHS,
    'layout_inverter':   DIAG_LAYOUT_INVERTER,
    # Phase 10
    'grid_topology':     DIAG_GRID_TOPOLOGY,
    'transformer_substation': DIAG_TRANSFORMER_SUBSTATION,
    'pv_system':         DIAG_PV_SYSTEM,
    'wind_turbine':      DIAG_WIND_TURBINE,
    'ev_charger':        DIAG_EV_CHARGER,
}

def diagram(name, caption=None, cell_size=10, color=None):
    """Look up a named diagram from PIXEL_DIAGRAMS and return a flowable list."""
    grid = PIXEL_DIAGRAMS.get(name)
    if grid is None:
        raise KeyError(f'unknown pixel diagram: {name}')
    return pixel_diagram_block(grid, caption=caption, cell_size=cell_size, color=color)

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
    """Draw header & footer on every body page — WHITE background, green svx."""
    canvas.saveState()
    # ── Explicit WHITE page background ─────────────────────────────────
    canvas.setFillColor(colors.white)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    # Top thin rule (light gray)
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.4)
    canvas.line(doc.leftMargin, A4[1] - 12*mm, A4[0] - doc.rightMargin, A4[1] - 12*mm)
    # Top label (running header) — gray "EE CURRICULUM" left, green "by svx" right
    canvas.setFont('JetBrainsMono', 8)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(doc.leftMargin, A4[1] - 9*mm, 'EE CURRICULUM')
    canvas.setFillColor(ACCENT)
    canvas.drawRightString(A4[0] - doc.rightMargin, A4[1] - 9*mm, 'by svx')
    # Footer
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.4)
    canvas.line(doc.leftMargin, 12*mm, A4[0] - doc.rightMargin, 12*mm)
    canvas.setFont('JetBrainsMono', 8)
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
  .footer .handle { color: #7FFF9F; }
</style>
</head>
<body>
<div class="cover">
  <div class="edition">v3.0</div>

  <h1 class="title">
    Electrical Engineering<br>
    for Computer <span class="accent">Scientists</span>
  </h1>

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
    <span class="handle">by svx</span>
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
    'PAGE_BG','SECTION_BG','HEADER_FILL','ACCENT','ACCENT_2','ACCENT_SOFT','BORDER','TEXT_PRIMARY','TEXT_MUTED',
    'CARD_BG','TABLE_STRIPE','SEM_SUCCESS','SEM_WARNING','SEM_ERROR','SEM_INFO','COVER_BLOCK','ICON',
    'colors','mm','cm','inch','A4','PageBreak','Spacer','KeepTogether','TableOfContents',
    'Paragraph','ParagraphStyle','TA_LEFT','TA_CENTER','TA_JUSTIFY',
    # Pixel diagram library
    'pixel_diagram','pixel_diagram_block','pixel_divider','diagram','PIXEL_DIAGRAMS',
    'DIAG_RESISTOR','DIAG_CAPACITOR','DIAG_INDUCTOR','DIAG_DIODE','DIAG_GROUND',
    'DIAG_TRANSISTOR_NPN','DIAG_MOSFET','DIAG_OPAMP','DIAG_HALF_WAVE','DIAG_RC_LOW_PASS',
    'DIAG_RLC','DIAG_OPAMP_INV','DIAG_BUCK','DIAG_D_FLIP_FLOP','DIAG_SINE_WAVE',
    'DIAG_SQUARE_WAVE','DIAG_BODE_LOW_PASS','DIAG_SMITH','DIAG_THREE_PHASE',
    'DIAG_PID_LOOP','DIAG_FOC','DIAG_CMOS_INVERTER','DIAG_DIPOLE','DIAG_SOLAR_MPPT',
    'DIAG_CURRENT_MIRROR','DIAG_AND_GATE','DIAG_555_TIMER','DIAG_BANDPASS','DIAG_TREE',
    # Guide character + narrative elements
    'volt_says','volt_avatar','pull_quote',
    'amp_says','amp_avatar','AMP_AVATAR',
]
