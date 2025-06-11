# 📐 Tampermonkey GitHub Image Resizer

A Tampermonkey userscript that **automatically converts uploaded image Markdown** in GitHub Pull Requests into an HTML `<img>` tag with a customizable width.

This tool supports all GitHub image upload methods — including drag-and-drop, paste, and the attachment button — and ensures consistent visual layout for embedded images.

---

## 🚀 Features

- 🖼️ Automatically converts this:
  ```markdown
  ![alt text](https://github.com/user-attachments/assets/...)
  ```
  into:
  ```markdown
  <img src="https://github.com/user-attachments/assets/..." alt="alt text" width="300">
  ```

- ✅ Supports all image upload methods:
  - Drag-and-drop from desktop 💾
  - Clipboard paste 📋
  - Attachment button 📎
- 🔁 Converts image Markdown to HTML `<img>` on-the-fly — no need to manually edit it. 
- ⚙️ Customizable width via Tampermonkey menu
- 🧠 Intelligent detection even when GitHub silently updates the comment box after uploads

---

## 🧩 Installation

1. Install Tampermonkey:
  - [Chrome](https://tampermonkey.net/?ext=dhdg&browser=chrome)
  - [Firefox](https://tampermonkey.net/?ext=dhdg&browser=firefox)
  - [Edge](https://tampermonkey.net/?ext=dhdg&browser=edge)

2. Install the script:
  - From [GreasyFork](https://greasyfork.org/en/scripts/539143-github-image-resizer)
  - Or manually:
    1. Click the Tampermonkey icon → "Create a new script"
    2. Paste contents of github-pr-image-to-html.user.js
    3. Save

---

## 🛠 How to Set Custom Image Width

1. Click the Tampermonkey icon in your browser. 
2. Open the menu for "GitHub PR Image to HTML (Custom Width)". 
3. Click "Set Image Width". 
4. Enter a value (e.g. 400) to apply that width (in pixels) to all converted images.

Your setting is stored and applied persistently across sessions.

---

## 🔒 Privacy

- ✅ The script only runs on https://github.com/*
- ❌ It does not send or store any data externally 
- ✅ Your preferences are stored locally in Tampermonkey

---

## 📤 Contributing

Pull requests are welcomed for:

- Additional customizations (e.g. height, class, max-width)
- Theme-aware image styling
- Integration with GitHub Markdown preview styling

---

## 📄 License

MIT License — see [LICENSE]((https://github.com/miked49er/tampermonkey-github-image-resizer/blob/main/License.md))

---

## 🧪 Example

Before Upload:

![Oredered Listocat](https://github.com/user-attachments/assets/ebc19de7-8fc0-4d12-9495-1e51f5b05c6b)

After Upload (Automatically):

<img src="https://github.com/user-attachments/assets/ebc19de7-8fc0-4d12-9495-1e51f5b05c6b" alt="Ordered Listocat" width="300">
