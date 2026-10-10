import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_gradient(width, height, color_top, color_bottom):
    gradient = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(gradient)
    top_r, top_g, top_b = color_top[:3]
    bot_r, bot_g, bot_b = color_bottom[:3]
    for y in range(height):
        ratio = y / float(height)
        r = int(top_r + (bot_r - top_r) * ratio)
        g = int(top_g + (bot_g - top_g) * ratio)
        b = int(top_b + (bot_b - top_b) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    return gradient

def draw_trishul_symbol(draw, cx, cy, size, color=(255, 215, 0, 255)):
    w = size // 2
    h = size
    # Middle prong
    draw.line([(cx, cy + h // 2), (cx, cy - h // 2)], fill=color, width=9)
    draw.polygon([(cx - 10, cy - h // 2 + 10), (cx + 10, cy - h // 2 + 10), (cx, cy - h // 2 - 14)], fill=color)
    
    # Left prong curve
    draw.arc([cx - w, cy - h // 4, cx, cy + h // 3], start=90, end=270, fill=color, width=9)
    draw.line([(cx - w, cy - h // 4 + 8), (cx - w, cy - h // 3)], fill=color, width=9)
    draw.polygon([(cx - w - 9, cy - h // 3), (cx - w + 9, cy - h // 3), (cx - w, cy - h // 3 - 14)], fill=color)
    
    # Right prong curve
    draw.arc([cx, cy - h // 4, cx + w, cy + h // 3], start=270, end=90, fill=color, width=9)
    draw.line([(cx + w, cy - h // 4 + 8), (cx + w, cy - h // 3)], fill=color, width=9)
    draw.polygon([(cx + w - 9, cy - h // 3), (cx + w + 9, cy - h // 3), (cx + w, cy - h // 3 - 14)], fill=color)
    
    # Base circle ring
    draw.ellipse([cx - 14, cy + h // 3 - 2, cx + 14, cy + h // 3 + 14], fill=color)

def draw_lotus_sindoor_symbol(draw, cx, cy, size, color=(255, 220, 160, 255)):
    # Flame/Lotus Petals
    draw.polygon([(cx, cy - size // 2), (cx - 16, cy + size // 4), (cx + 16, cy + size // 4)], fill=color)
    draw.polygon([(cx - size // 3, cy - size // 5), (cx - 22, cy + size // 4), (cx, cy + size // 4)], fill=color)
    draw.polygon([(cx + size // 3, cy - size // 5), (cx + 22, cy + size // 4), (cx, cy + size // 4)], fill=color)
    draw.arc([cx - size // 2, cy - 5, cx + size // 2, cy + size // 3], start=0, end=180, fill=color, width=7)
    draw.ellipse([cx - 10, cy + size // 3, cx + 10, cy + size // 3 + 12], fill=color)

def draw_atom_brahmos_symbol(draw, cx, cy, size, color=(160, 255, 200, 255)):
    draw.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], fill=color)
    draw.ellipse([cx - size // 2, cy - size // 4, cx + size // 2, cy + size // 4], outline=color, width=6)
    draw.ellipse([cx - size // 3, cy - size // 2, cx + size // 3, cy + size // 2], outline=color, width=6)

def build_poster(config, output_path):
    W, H = 1080, 1440
    img = create_gradient(W, H, config["bg_top"], config["bg_bot"])

    # Fonts
    font_bold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    font_reg = "/System/Library/Fonts/Supplemental/Arial.ttf"
    
    title_font = ImageFont.truetype(font_bold, 78)
    subtitle_font = ImageFont.truetype(font_bold, 34)
    badge_font = ImageFont.truetype(font_bold, 21)
    head_title_font = ImageFont.truetype(font_bold, 34)
    head_sub_font = ImageFont.truetype(font_bold, 21)
    card_head_font = ImageFont.truetype(font_bold, 26)
    card_body_font = ImageFont.truetype(font_bold, 22)
    card_sub_font = ImageFont.truetype(font_reg, 18)
    footer_font = ImageFont.truetype(font_reg, 18)
    tagline_font = ImageFont.truetype(font_bold, 22)

    # Ambient glow
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    ov_draw.ellipse([W//2 - 380, 240, W//2 + 380, 960], fill=config["accent_glow"])
    overlay = overlay.filter(ImageFilter.GaussianBlur(110))
    img.paste(overlay, (0, 0), overlay)
    draw = ImageDraw.Draw(img)

    # --- Top Navigation / Header Card ---
    header_box = [40, 40, W - 40, 175]
    draw.rounded_rectangle(header_box, radius=24, fill=(255, 255, 255, 250), outline=(225, 235, 248, 255), width=2)

    # Place OFFICIAL BLUE LOGO EMBLEM
    logo_path = "assets/frontend/img/logo_emblem.png"
    if os.path.exists(logo_path):
        emblem = Image.open(logo_path).convert("RGBA")
        emblem = emblem.resize((104, 104), Image.Resampling.LANCZOS)
        img.paste(emblem, (60, 56), emblem)

    # Header text
    draw.text((182, 63), "SHREE GURUS", fill=(7, 21, 61), font=head_title_font)
    draw.text((182, 100), "NEET & JEE ACADEMY • VIJAYAWADA", fill=(42, 79, 214), font=head_sub_font)
    draw.text((182, 128), "Guiding Minds • Building Futures", fill=(100, 116, 139), font=ImageFont.truetype(font_reg, 17))

    # Better Guidance Tag on right
    tag_x = W - 330
    draw.text((tag_x, 72), "Better Guidance,", fill=(7, 21, 61), font=ImageFont.truetype(font_bold, 21))
    draw.text((tag_x, 100), "Brighter Future", fill=(42, 79, 214), font=ImageFont.truetype(font_bold, 21))

    # --- Academic Year Badge (Auto-fit Width) ---
    year_badge_text = config["year_badge"]
    b_bbox = badge_font.getbbox(year_badge_text)
    text_w = b_bbox[2] - b_bbox[0]
    badge_w = text_w + 64
    badge_x = (W - badge_w) // 2
    draw.rounded_rectangle([badge_x, 205, badge_x + badge_w, 255], radius=25, fill=config["badge_fill"], outline=config["badge_outline"], width=2)
    draw.text((badge_x + 32, 219), year_badge_text, fill=config["badge_text_color"], font=badge_font)

    # --- Program Title Section ---
    emblem_y = 330
    if config["symbol"] == "trishul":
        draw_trishul_symbol(draw, W // 2, emblem_y, 90, color=config["symbol_color"])
    elif config["symbol"] == "lotus":
        draw_lotus_sindoor_symbol(draw, W // 2, emblem_y, 90, color=config["symbol_color"])
    elif config["symbol"] == "atom":
        draw_atom_brahmos_symbol(draw, W // 2, emblem_y, 90, color=config["symbol_color"])

    # Title
    t_bbox = title_font.getbbox(config["title"])
    t_w = t_bbox[2] - t_bbox[0]
    draw.text(((W - t_w) // 2, 385), config["title"], fill=(255, 255, 255), font=title_font)

    # Subtitle Pill
    sub_text = config["subtitle"]
    s_bbox = subtitle_font.getbbox(sub_text)
    s_w = s_bbox[2] - s_bbox[0]
    sub_pill_w = s_w + 56
    sub_pill_x = (W - sub_pill_w) // 2
    draw.rounded_rectangle([sub_pill_x, 480, sub_pill_x + sub_pill_w, 536], radius=28, fill=config["sub_pill_fill"], outline=config["sub_pill_outline"], width=2)
    draw.text(((W - s_w) // 2, 490), sub_text, fill=config["sub_pill_text"], font=subtitle_font)

    # --- 3 Specifications Columns (Seats, Classroom, Hostel) ---
    col_y = 570
    col_h = 445
    card_w = 316
    gap = 26
    start_x = (W - (card_w * 3 + gap * 2)) // 2

    # Column 1: Seats & Intake Breakdown
    c1_x = start_x
    draw.rounded_rectangle([c1_x, col_y, c1_x + card_w, col_y + col_h], radius=24, fill=(255, 255, 255, 250), outline=(220, 230, 248), width=2)
    draw.rounded_rectangle([c1_x, col_y, c1_x + card_w, col_y + 75], radius=24, fill=config["card_header_fill"])
    draw.rectangle([c1_x, col_y + 50, c1_x + card_w, col_y + 75], fill=config["card_header_fill"])
    draw.text((c1_x + 28, col_y + 24), "TOTAL SEATS", fill=(255, 255, 255), font=card_head_font)

    draw.text((c1_x + 28, col_y + 100), "120 SEATS", fill=config["primary_brand"], font=ImageFont.truetype(font_bold, 34))
    draw.line([(c1_x + 28, col_y + 150), (c1_x + card_w - 28, col_y + 150)], fill=(225, 235, 250), width=2)

    draw.text((c1_x + 28, col_y + 168), "Cohort Strength:", fill=(100, 116, 139), font=card_sub_font)
    draw.text((c1_x + 28, col_y + 200), f"Girls: {config['girls_intake']}", fill=(7, 21, 61), font=card_body_font)
    draw.text((c1_x + 28, col_y + 238), f"Boys: {config['boys_intake']}", fill=(7, 21, 61), font=card_body_font)
    draw.line([(c1_x + 28, col_y + 285), (c1_x + card_w - 28, col_y + 285)], fill=(225, 235, 250), width=2)
    draw.text((c1_x + 28, col_y + 305), "Faculty Attention:", fill=(42, 79, 214), font=card_sub_font)
    draw.text((c1_x + 28, col_y + 335), "1:20 Intensive Mentorship", fill=(7, 21, 61), font=card_body_font)
    draw.text((c1_x + 28, col_y + 372), "Daily Micro Error Logs", fill=(100, 116, 139), font=card_sub_font)

    # Column 2: Classroom Features
    c2_x = c1_x + card_w + gap
    draw.rounded_rectangle([c2_x, col_y, c2_x + card_w, col_y + col_h], radius=24, fill=(255, 255, 255, 250), outline=(220, 230, 248), width=2)
    draw.rounded_rectangle([c2_x, col_y, c2_x + card_w, col_y + 75], radius=24, fill=config["card_header_fill"])
    draw.rectangle([c2_x, col_y + 50, c2_x + card_w, col_y + 75], fill=config["card_header_fill"])
    draw.text((c2_x + 28, col_y + 24), "CLASS ROOM", fill=(255, 255, 255), font=card_head_font)

    draw.text((c2_x + 28, col_y + 100), "A/C (Air-Cooled)", fill=config["primary_brand"], font=ImageFont.truetype(font_bold, 30))
    draw.line([(c2_x + 28, col_y + 150), (c2_x + card_w - 28, col_y + 150)], fill=(225, 235, 250), width=2)
    draw.text((c2_x + 28, col_y + 168), "Classroom Setup:", fill=(100, 116, 139), font=card_sub_font)
    draw.text((c2_x + 28, col_y + 200), "Interactive Digital AV", fill=(7, 21, 61), font=card_body_font)
    draw.text((c2_x + 28, col_y + 238), "Ergonomic Desk Layout", fill=(7, 21, 61), font=card_body_font)
    draw.line([(c2_x + 28, col_y + 285), (c2_x + card_w - 28, col_y + 285)], fill=(225, 235, 250), width=2)
    draw.text((c2_x + 28, col_y + 305), "Academic System:", fill=(42, 79, 214), font=card_sub_font)
    draw.text((c2_x + 28, col_y + 335), "3-Tier Error Analysis", fill=(7, 21, 61), font=card_body_font)
    draw.text((c2_x + 28, col_y + 372), "Concept Drill Workbooks", fill=(100, 116, 139), font=card_sub_font)

    # Column 3: Residential Hostels
    c3_x = c2_x + card_w + gap
    draw.rounded_rectangle([c3_x, col_y, c3_x + card_w, col_y + col_h], radius=24, fill=(255, 255, 255, 250), outline=(220, 230, 248), width=2)
    draw.rounded_rectangle([c3_x, col_y, c3_x + card_w, col_y + 75], radius=24, fill=config["card_header_fill"])
    draw.rectangle([c3_x, col_y + 50, c3_x + card_w, col_y + 75], fill=config["card_header_fill"])
    draw.text((c3_x + 28, col_y + 24), "HOSTEL ROOM", fill=(255, 255, 255), font=card_head_font)

    draw.text((c3_x + 28, col_y + 100), "Non A/C (Ventilated)", fill=config["primary_brand"], font=ImageFont.truetype(font_bold, 28))
    draw.line([(c3_x + 28, col_y + 150), (c3_x + card_w - 28, col_y + 150)], fill=(225, 235, 250), width=2)
    draw.text((c3_x + 28, col_y + 168), "Campus Facilities:", fill=(100, 116, 139), font=card_sub_font)
    draw.text((c3_x + 28, col_y + 200), "Nutritious Mess Food", fill=(7, 21, 61), font=card_body_font)
    draw.text((c3_x + 28, col_y + 238), "Night Doubt Faculty", fill=(7, 21, 61), font=card_body_font)
    draw.line([(c3_x + 28, col_y + 285), (c3_x + card_w - 28, col_y + 285)], fill=(225, 235, 250), width=2)
    draw.text((c3_x + 28, col_y + 305), "Safety & Supervision:", fill=(42, 79, 214), font=card_sub_font)
    draw.text((c3_x + 28, col_y + 335), "24/7 Wardens & CCTV", fill=(7, 21, 61), font=card_body_font)
    draw.text((c3_x + 28, col_y + 372), "Doctor On-Call Support", fill=(100, 116, 139), font=card_sub_font)

    # --- Call To Action Ribbon ---
    cta_y = 1045
    draw.rounded_rectangle([40, cta_y, W - 40, cta_y + 115], radius=24, fill=(255, 255, 255, 250), outline=(220, 230, 248), width=2)
    draw.text((70, cta_y + 26), config["cta_title"], fill=(7, 21, 61), font=ImageFont.truetype(font_bold, 26))
    draw.text((70, cta_y + 66), config["cta_subtitle"], fill=(42, 79, 214), font=ImageFont.truetype(font_bold, 21))

    # Apply button on right of CTA
    btn_w = 240
    btn_x = W - 40 - btn_w - 30
    draw.rounded_rectangle([btn_x, cta_y + 25, btn_x + btn_w, cta_y + 90], radius=32, fill=config["btn_fill"], outline=config["btn_outline"], width=2)
    btn_label = "ENROL NOW →"
    b_bbox = badge_font.getbbox(btn_label)
    bw = b_bbox[2] - b_bbox[0]
    draw.text((btn_x + (btn_w - bw) // 2, cta_y + 46), btn_label, fill=(255, 255, 255), font=badge_font)

    # --- Bottom 5 Pillars ---
    pillars_y = 1185
    pillars = [
        "Experienced\nFaculty",
        "Focused\nTraining",
        "Performance\nTracking",
        "Safe & Secure\nCampus",
        "Holistic\nDevelopment"
    ]
    p_w = (W - 80) // 5
    for i, p in enumerate(pillars):
        px = 40 + i * p_w
        draw.line([(px, pillars_y), (px + p_w - 15, pillars_y)], fill=(255, 255, 255, 90), width=1)
        lines = p.split("\n")
        draw.text((px + 10, pillars_y + 14), lines[0], fill=(255, 255, 255), font=footer_font)
        draw.text((px + 10, pillars_y + 38), lines[1], fill=(210, 225, 255), font=footer_font)

    # --- Footer Tagline & Contact Bar ---
    foot_bar_y = 1275
    draw.rounded_rectangle([40, foot_bar_y, W - 40, H - 40], radius=24, fill=(5, 12, 38, 245), outline=(255, 255, 255, 50), width=1)
    
    # Left: Tagline & Address
    draw.text((70, foot_bar_y + 22), "Join Today... Build Tomorrow...", fill=(255, 215, 0), font=tagline_font)
    draw.text((70, foot_bar_y + 54), "D.No: 48-19-5/9, Ballem Vari Street, Vijayawada - 520007, A.P.", fill=(200, 215, 240), font=ImageFont.truetype(font_reg, 17))
    
    # Right: Helpline
    draw.text((W - 390, foot_bar_y + 22), "Admissions Helpline:", fill=(200, 215, 240), font=ImageFont.truetype(font_reg, 17))
    draw.text((W - 390, foot_bar_y + 50), "+91 9640711111 / 9171222333", fill=(255, 255, 255), font=ImageFont.truetype(font_bold, 22))

    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.convert("RGB").save(output_path, quality=95)
    print(f"Created {output_path}")

# Configurations
configs = [
    {
        "title": "TRISHUL",
        "subtitle": "IPE + JEE (MAIN)",
        "symbol": "trishul",
        "symbol_color": (255, 215, 0, 255),
        "year_badge": "ACADEMIC YEAR 2027 – 2028 (PRE-BOOKINGS OPEN)",
        "badge_fill": (230, 240, 255, 255),
        "badge_outline": (42, 79, 214, 255),
        "badge_text_color": (26, 62, 184, 255),
        "bg_top": (10, 30, 90, 255),
        "bg_bot": (5, 12, 38, 255),
        "accent_glow": (30, 90, 230, 80),
        "sub_pill_fill": (255, 255, 255, 30),
        "sub_pill_outline": (255, 215, 0, 200),
        "sub_pill_text": (255, 225, 120, 255),
        "card_header_fill": (26, 62, 184, 255),
        "primary_brand": (26, 62, 184),
        "girls_intake": "40 Girls (1 Sec = 40M)",
        "boys_intake": "80 Boys (2 Sec = 80M)",
        "cta_title": "ADMISSIONS OPEN FOR 2027 – 2028",
        "cta_subtitle": "Engineering Stream • Limited to 120 Students Only",
        "btn_fill": (26, 62, 184, 255),
        "btn_outline": (60, 110, 240, 255),
        "output": "assets/frontend/img/programs/trishul-jee.jpg"
    },
    {
        "title": "SINDOOR",
        "subtitle": "IPE + JEE ADVANCED",
        "symbol": "lotus",
        "symbol_color": (255, 220, 160, 255),
        "year_badge": "ACADEMIC YEAR 2027 – 2028 (PRE-BOOKINGS OPEN)",
        "badge_fill": (255, 235, 235, 255),
        "badge_outline": (180, 30, 50, 255),
        "badge_text_color": (160, 20, 40, 255),
        "bg_top": (80, 15, 25, 255),
        "bg_bot": (28, 5, 10, 255),
        "accent_glow": (220, 40, 60, 70),
        "sub_pill_fill": (255, 255, 255, 30),
        "sub_pill_outline": (255, 200, 150, 200),
        "sub_pill_text": (255, 220, 180, 255),
        "card_header_fill": (170, 25, 45, 255),
        "primary_brand": (170, 25, 45),
        "girls_intake": "40 Girls (1 Sec = 40M)",
        "boys_intake": "80 Boys (2 Sec = 80M)",
        "cta_title": "ADMISSIONS OPEN FOR 2027 – 2028",
        "cta_subtitle": "Elite IIT-JEE Advanced • Top Rankers Cohort",
        "btn_fill": (170, 25, 45, 255),
        "btn_outline": (220, 50, 70, 255),
        "output": "assets/frontend/img/programs/sindoor-jee-advanced.jpg"
    },
    {
        "title": "BRAHMOS",
        "subtitle": "IPE + NEET (BiPC MEDICAL)",
        "symbol": "atom",
        "symbol_color": (170, 255, 210, 255),
        "year_badge": "ADMISSIONS OPEN: 2026 – 2027 (ACTIVE NOW) & 2027 – 2028",
        "badge_fill": (230, 255, 240, 255),
        "badge_outline": (20, 140, 70, 255),
        "badge_text_color": (10, 110, 50, 255),
        "bg_top": (10, 65, 35, 255),
        "bg_bot": (4, 25, 14, 255),
        "accent_glow": (30, 180, 90, 70),
        "sub_pill_fill": (255, 255, 255, 30),
        "sub_pill_outline": (160, 255, 200, 200),
        "sub_pill_text": (190, 255, 220, 255),
        "card_header_fill": (18, 120, 60, 255),
        "primary_brand": (18, 120, 60),
        "girls_intake": "90 Girls (3 Sec = 90M)",
        "boys_intake": "30 Boys (1 Sec = 30M)",
        "cta_title": "ADMISSIONS OPEN FOR 2026 – 2027 (ACTIVE NOW)",
        "cta_subtitle": "Exclusive Medical NEET Flagship • Enrol Today",
        "btn_fill": (18, 120, 60, 255),
        "btn_outline": (40, 160, 80, 255),
        "output": "assets/frontend/img/programs/brahmos-neet.jpg"
    }
]

for cfg in configs:
    build_poster(cfg, cfg["output"])
