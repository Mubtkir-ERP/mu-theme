import os, glob, json

blocks_dir = 'nxt_theme/blocks'
all_blocks = []

block_dirs = sorted([d for d in glob.glob(os.path.join(blocks_dir, '*')) if os.path.isdir(d)])

for bdir in block_dirs:
    bname = os.path.basename(bdir)
    
    # Read html
    html_path = os.path.join(bdir, 'html.html')
    if not os.path.exists(html_path):
        html_path = os.path.join(bdir, 'template.html')
    html_content = ""
    if os.path.exists(html_path):
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

    # Read style
    style_path = os.path.join(bdir, 'style.css')
    style_content = ""
    if os.path.exists(style_path):
        with open(style_path, 'r', encoding='utf-8') as f:
            style_content = f.read()

    # Read script
    script_path = os.path.join(bdir, 'script.js')
    script_content = ""
    if os.path.exists(script_path):
        with open(script_path, 'r', encoding='utf-8') as f:
            script_content = f.read()

    # Read meta
    meta_path = os.path.join(bdir, 'meta.json')
    meta = {}
    if os.path.exists(meta_path):
        try:
            with open(meta_path, 'r', encoding='utf-8') as f:
                meta = json.load(f)
        except Exception:
            pass

    block_obj = {
        "custom_block_name": meta.get("name") or bname,
        "label": meta.get("label") or meta.get("name") or bname,
        "html": html_content,
        "style": style_content,
        "script": script_content
    }
    all_blocks.append(block_obj)

print(f"Compiled {len(all_blocks)} blocks.")

targets = [
    'nxt_theme/blocks/all_blocks.json',
    'nxt_theme/public/blocks/all_blocks.json',
    'custom_html_blocks.json',
    'nxt_theme/public/custom_html_blocks.json'
]

for t in targets:
    d = os.path.dirname(t)
    if d:
        os.makedirs(d, exist_ok=True)
    with open(t, 'w', encoding='utf-8') as f:
        json.dump(all_blocks, f, ensure_ascii=False, indent=2)
    print(f"Written to {t}")

# Validate reading back with json.load
for t in targets:
    with open(t, 'r', encoding='utf-8') as f:
        test_load = json.load(f)
    assert len(test_load) == len(all_blocks), f"Length mismatch in {t}"
print("All target JSON bundles validated successfully!")
