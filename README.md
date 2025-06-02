# Arc to Zen Bookmarks Converter

Convert your Arc Browser's sidebar items (pinned tabs, bookmarks, and folders) to a standard bookmarks format that can be imported into Zen Browser or any other modern browser.

## 🌟 Features

- Exports Arc Browser's sidebar items to standard Netscape bookmark format (HTML)
- Preserves bookmark titles, URLs, and timestamps
- Handles nested folder structures
- Works with both pinned tabs and saved bookmarks
- Available in both Python and JavaScript/Node.js versions

## 🚀 Quick Start

### Python Version

1. Clone this repository:
```bash
git clone https://github.com/yourusername/arc_to_zen_bookmarks.git
cd arc_to_zen_bookmarks
```

2. Run the script:
```bash
python arc_to_bookmarks.py
```

### JavaScript/Node.js Version

1. Clone this repository:
```bash
git clone https://github.com/yourusername/arc_to_zen_bookmarks.git
cd arc_to_zen_bookmarks
```

2. Run the script:
```bash
node arc_to_bookmarks.js
```

## 📝 How It Works

1. The script reads your Arc Browser's `StorableSidebar.json` file (located in `~/Library/Application Support/Arc/` on macOS)
2. Parses the JSON data to extract all bookmarked items
3. Converts them to the standard Netscape bookmark format (HTML)
4. Saves the result as `bookmarks.html` in the current directory

## 🔄 Importing Bookmarks

### Into Zen Browser
1. Open Zen Browser
2. Go to Bookmarks Manager
3. Click on Import Bookmarks
4. Select the generated `bookmarks.html` file

### Into Other Browsers
- **Chrome**: Open Bookmarks Manager (⌘⇧B) → Click three dots → Import bookmarks
- **Firefox**: Open Library (⌘⇧B) → Import and Backup → Import Bookmarks from HTML
- **Safari**: File → Import From → Bookmarks HTML File

## ⚠️ Important Notes

- The script only reads from your local Arc Browser data and creates a new HTML file
- All processing happens locally on your machine
- The generated `bookmarks.html` file contains your personal bookmarks - don't commit it to version control
