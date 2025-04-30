
# ImageMint

**ImageMint** is a fast, privacy-first, local image converter, resizer, and compressor built with modern HTML, CSS, and JavaScript. All processing happens directly in your browser—no images are ever uploaded to a server.

👉 **Live Demo:** [imagemint.pages.dev](https://imagemint.pages.dev)  
🔒 100% client-side, no tracking, no uploads.

---

## ✨ Features

- 🔐 **Privacy-Oriented**: Everything runs locally in your browser.
- 📦 **Batch Convert**: Convert and download multiple images at once.
- 🔧 **Flexible Settings**:
  - Choose output format: JPG, PNG, WebP, AVIF, BMP
  - Adjust quality (for JPG/WebP)
  - Resize by pixels or percentage
  - Set optional target file size (tries to compress accordingly)
- ⚡ **Fast UI**: Drag-and-drop or browse to upload images.
- 💾 **Persistent Settings**: Automatically remembers your last used settings.
- 📱 **Responsive**: Works great on mobile and desktop.

---

## 📸 How It Works

1. Drag & drop or select images.
2. Choose your desired output settings.
3. Hit **"Convert & Download All"**.
4. Converted images are automatically downloaded—no server involved.

---

## 🛠 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **UI Style**: Glassmorphic and neumorphic design
- **Compression/Conversion**: Canvas API with dynamic quality scaling

---

## 🚀 Getting Started Locally

```bash
git clone https://github.com/KarthikSambhuR/ImageMint.git
cd ImageMint
open index.html   # or serve via Live Server / any static server
```

No build steps, no dependencies. Pure static files.

---

## 📂 Project Structure

```
📁 ImageMint/
├── index.html          # Main HTML page
├── style.css           # UI styling
├── script.js           # Image processing and app logic
└── og-image.png        # Social/media preview image
```

---

## 🧠 Behind the Scenes

- Uses the **Canvas API** to convert and compress images locally.
- Implements an iterative algorithm to reach target size while balancing quality.
- Displays real-time progress for each image and batch conversion.

---

## 📄 License

MIT License

---

## 🙌 Author

**[Karthik Sambhu R](https://github.com/KarthikSambhuR)**

---

> ⭐️ Star this repo if you found it useful! Feedback and contributions are welcome.
