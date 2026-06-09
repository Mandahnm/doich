#!/usr/bin/env python3
"""Generate the Doich Pro pricing & features PDF (Mongolian) for Bonum."""
from fpdf import FPDF

FONT_DIR = "/usr/share/fonts/truetype/dejavu"

# Brand palette (matches the in-app PricingScreen)
PINK = (255, 111, 168)
PURPLE = (167, 139, 250)
GREEN = (34, 197, 94)
INK = (30, 30, 40)
MID = (90, 90, 105)
SOFT = (140, 140, 155)
LINE = (228, 228, 235)
TINT = (252, 244, 248)

PRICING = [
    # label, total, per_month, term, saving_pct, note
    ("Сарын",   "12,900₮", "12,900₮", "1 сар",  "",     ""),
    ("3 Сарын", "32,900₮", "10,967₮", "3 сар",  "15%",  "5,800₮ хэмнэнэ"),
    ("Жилийн",  "99,900₮", "8,325₮",  "12 сар", "35%",  "54,900₮ хэмнэнэ"),
]


class PDF(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-14)
        self.set_font("DejaVu", "", 8)
        self.set_text_color(*SOFT)
        self.cell(0, 8, "Doich  •  Герман хэл сурах апп  •  doichapp@gmail.com", align="C")


pdf = PDF(orientation="P", unit="mm", format="A4")
pdf.set_auto_page_break(auto=True, margin=18)
pdf.add_font("DejaVu", "", f"{FONT_DIR}/DejaVuSans.ttf")
pdf.add_font("DejaVu", "B", f"{FONT_DIR}/DejaVuSans-Bold.ttf")
pdf.add_page()

ML = 18  # left margin
CW = 210 - 2 * ML  # content width

# ---- Title band ----
pdf.set_fill_color(*PINK)
pdf.rect(0, 0, 210, 6, "F")

pdf.set_xy(ML, 16)
pdf.set_font("DejaVu", "B", 9)
pdf.set_text_color(*SOFT)
pdf.cell(0, 5, "ТАРИФИЙН ТӨЛӨВЛӨГӨӨ", new_x="LMARGIN", new_y="NEXT")

pdf.set_x(ML)
pdf.set_font("DejaVu", "B", 26)
pdf.set_text_color(*INK)
pdf.cell(0, 12, "Doich Pro", new_x="LMARGIN", new_y="NEXT")

pdf.set_x(ML)
pdf.set_font("DejaVu", "", 11)
pdf.set_text_color(*MID)
pdf.multi_cell(CW, 6, "Герман хэл сурах апп — Pro эрхийн үнэ болон багтсан боломжуудын дэлгэрэнгүй танилцуулга.")
pdf.ln(4)

# ---- Section: Pricing ----
def section_title(txt):
    pdf.set_x(ML)
    pdf.set_font("DejaVu", "B", 13)
    pdf.set_text_color(*INK)
    pdf.cell(0, 8, txt, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1)

section_title("Үнийн төлөвлөгөө")

# Table header
col = [38, 34, 38, 24, 40]  # widths sum ~174 == CW
heads = ["Хугацаа", "Нийт үнэ", "Сарын үнэ", "Хэмнэлт", "Тайлбар"]
pdf.set_x(ML)
pdf.set_font("DejaVu", "B", 9)
pdf.set_fill_color(*INK)
pdf.set_text_color(255, 255, 255)
for w, h in zip(col, heads):
    pdf.cell(w, 9, h, border=0, align="L", fill=True)
pdf.ln(9)

# Table rows
pdf.set_font("DejaVu", "", 10)
for i, (label, total, per, term, saving, note) in enumerate(PRICING):
    is_annual = (i == 2)
    pdf.set_x(ML)
    fill = is_annual
    if fill:
        pdf.set_fill_color(*TINT)
    y0 = pdf.get_y()
    # label
    pdf.set_font("DejaVu", "B", 10)
    pdf.set_text_color(*(PINK if is_annual else INK))
    pdf.cell(col[0], 11, f"{label}" + ("  ★" if is_annual else ""), border="B", fill=fill)
    # total
    pdf.set_font("DejaVu", "B", 10)
    pdf.set_text_color(*INK)
    pdf.cell(col[1], 11, total, border="B", fill=fill)
    # per month
    pdf.set_font("DejaVu", "", 10)
    pdf.set_text_color(*MID)
    pdf.cell(col[2], 11, f"{per} /сар", border="B", fill=fill)
    # saving
    if saving:
        pdf.set_font("DejaVu", "B", 9)
        pdf.set_text_color(*GREEN)
        pdf.cell(col[3], 11, saving, border="B", fill=fill)
    else:
        pdf.set_text_color(*SOFT)
        pdf.cell(col[3], 11, "—", border="B", fill=fill)
    # note
    pdf.set_font("DejaVu", "", 9)
    pdf.set_text_color(*MID)
    pdf.cell(col[4], 11, note if note else "—", border="B", fill=fill)
    pdf.ln(11)

pdf.ln(2)
pdf.set_x(ML)
pdf.set_font("DejaVu", "", 9)
pdf.set_text_color(*SOFT)
pdf.multi_cell(CW, 5, "• Бүх үнэ Монгол төгрөгөөр (₮).   • Хамгийн хэмнэлттэй: Жилийн багц — сард 8,325₮ (≈35% хямд).   "
                     "• Pro эрх автоматаар сунгагдахгүй, урьдчилсан төлбөртэй.")
pdf.ln(6)

# ---- Section: Free vs Pro ----
section_title("Багц бүрийн боломжууд")

FREE = [
    "A1–C1 бүх үг (үгийн сан бүтэн)",
    "Өдөр тутмын дасгал",
    "SRS давталт",
    "Тоглоом — шат бүрт эхний 10 шат",
    "CEFR түвшин бүрт нэг өгүүллэг",
    "AI Багшт өдөрт 5 чат",
]
PRO = [
    "Бүх шатны тоглоом (11-р шатаас цааш)",
    "Бүх уншлагын өгүүллэг",
    "AI Багшт хязгааргүй чат (өдөрт 500)",
    "Дүрмийн шалгуур",
    "Дуудлагын дасгал (Whisper)",
    "Үнэгүй багцын бүх боломж багтсан",
]

col_gap = 6
col_w = (CW - col_gap) / 2
x_left = ML
x_right = ML + col_w + col_gap
y_start = pdf.get_y()

def feature_card(x, title, items, pro=False):
    pad = 5
    card_h = 12 + len(items) * 8 + 4
    # card background
    if pro:
        pdf.set_fill_color(*TINT)
        pdf.set_draw_color(*PINK)
    else:
        pdf.set_fill_color(255, 255, 255)
        pdf.set_draw_color(*LINE)
    pdf.set_line_width(0.5)
    pdf.rect(x, y_start, col_w, card_h, "DF")
    # title
    pdf.set_xy(x + pad, y_start + pad)
    pdf.set_font("DejaVu", "B", 12)
    pdf.set_text_color(*(PINK if pro else INK))
    pdf.cell(col_w - 2 * pad, 7, title)
    # items
    yy = y_start + pad + 9
    pdf.set_font("DejaVu", "", 9)
    for it in items:
        pdf.set_xy(x + pad, yy)
        pdf.set_text_color(*(GREEN if not pro else PURPLE))
        pdf.cell(4, 7, "✓")
        pdf.set_text_color(*(MID if not pro else INK))
        pdf.multi_cell(col_w - 2 * pad - 4, 7, it)
        yy += 8
    return card_h

h1 = feature_card(x_left, "Үнэгүй", FREE, pro=False)
h2 = feature_card(x_right, "Pro", PRO, pro=True)
pdf.set_y(y_start + max(h1, h2) + 6)

# ---- Section: Payment terms for Bonum ----
section_title("Төлбөрийн нөхцөл")
pdf.set_x(ML)
pdf.set_font("DejaVu", "", 10)
pdf.set_text_color(*MID)
terms = [
    "Төлбөрийн төрөл: нэг удаагийн урьдчилсан төлбөр (3 хугацааны багцаас сонгоно).",
    "Валют: Монгол төгрөг (MNT, ₮).",
    "Pro эрх идэвхжих: төлбөр баталгаажсаны дараа сонгосон хугацаагаар (1 / 3 / 12 сар).",
    "Автомат сунгалт: байхгүй — хугацаа дуусахад хэрэглэгч дахин худалдан авна.",
    "Холбоо барих / дэмжлэг: doichapp@gmail.com",
]
for tline in terms:
    pdf.set_x(ML)
    pdf.set_text_color(*PINK)
    pdf.cell(4, 6, "•")
    pdf.set_text_color(*MID)
    pdf.multi_cell(CW - 4, 6, tline)
    pdf.ln(0.5)

pdf.output("/home/user/doich/Doich_Pro_Pricing_MN.pdf")
print("PDF written")
