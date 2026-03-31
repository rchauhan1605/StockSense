with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Rename investorType to viewType globally
text = text.replace('investorType', 'viewType')
text = text.replace('setInvestorType', 'setViewType')

# 2. Fix ordering
bad_presets = """  const activePresets = 
    viewType === "fundamental" ? FUNDAMENTAL_PRESETS :
    viewType === "technical"   ? TECHNICAL_PRESETS :
    COMBINED_PRESETS;
"""

# Remove from top
text = text.replace(bad_presets, '')

# We need to insert bad_presets AFTER viewType is declared.
hook_line = '  const [viewType, setViewType] = useState("fundamental");'
new_code = hook_line + '\n' + bad_presets

text = text.replace(hook_line, new_code)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
