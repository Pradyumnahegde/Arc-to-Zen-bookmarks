// arc_to_bookmarks.js
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const convertTimestampToEpoch = (timestamp) => {
    if (typeof timestamp === 'number') {
        return Math.floor(timestamp);
    }
    return Math.floor(Date.now() / 1000);
};

const parseArcJson = (jsonData) => {
    const bookmarks = [];

    const processItems = (items) => {
        if (!Array.isArray(items)) return;

        for (let i = 0; i < items.length; i += 2) {
            if (i + 1 >= items.length) continue;

            const itemId = items[i];
            const itemData = items[i + 1];

            if (itemData && typeof itemData === 'object') {
                // Handle both direct values and nested value objects
                const valueData = itemData.value || itemData;

                // Check if it's a bookmark with tab data
                if (valueData.data?.tab) {
                    const tabData = valueData.data.tab;
                    const bookmark = {
                        title: tabData.savedTitle || tabData.savedURL || '',
                        url: tabData.savedURL || '',
                        add_date: convertTimestampToEpoch(valueData.createdAt || 0)
                    };
                    if (bookmark.url) {
                        bookmarks.push(bookmark);
                    }
                }

                // Process nested items
                if (valueData.childrenIds) {
                    const childItems = [];
                    for (const childId of valueData.childrenIds) {
                        childItems.push(childId, null); // Placeholder for the data
                        // Try to find the corresponding data in the items list
                        for (let j = 0; j < items.length; j += 2) {
                            if (j + 1 < items.length && items[j] === childId) {
                                childItems[childItems.length - 1] = items[j + 1];
                                break;
                            }
                        }
                    }
                    processItems(childItems);
                }
            }
        }
    };

    // Process sidebarSyncState items
    if (jsonData.sidebarSyncState?.items) {
        processItems(jsonData.sidebarSyncState.items);
    }

    // Process firebaseSyncState items
    if (jsonData.firebaseSyncState?.syncData?.items) {
        processItems(jsonData.firebaseSyncState.syncData.items);
    }

    return bookmarks;
};

const generateNetscapeBookmarks = (bookmarks) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${currentTimestamp}" PERSONAL_TOOLBAR="true">Arc Browser Bookmarks</H3>
    <DL><p>`;

    for (const bookmark of bookmarks) {
        html += `
        <DT><A HREF="${bookmark.url}" ADD_DATE="${bookmark.add_date}">${bookmark.title}</A>`;
    }

    html += `
    </DL><p>
</DL><p>`;

    return html;
};

const convertArcToBookmarks = async (inputFile, outputFile) => {
    try {
        // Read and parse the Arc JSON file
        const arcData = JSON.parse(await fs.readFile(inputFile, 'utf-8'));
        
        // Extract bookmarks
        const bookmarks = parseArcJson(arcData);
        
        if (!bookmarks.length) {
            console.warn("Warning: No bookmarks found in the file");
        }
        
        // Generate Netscape bookmark format HTML
        const bookmarkHtml = generateNetscapeBookmarks(bookmarks);
        
        // Write to output file
        await fs.writeFile(outputFile, bookmarkHtml, 'utf-8');
        
        return { success: true, count: bookmarks.length };
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return { success: false, count: 0 };
    }
};

const main = async () => {
    const inputFile = path.join(os.homedir(), 'Library/Application Support/Arc/StorableSidebar.json'); //location in mac where Arc stores sidebar tabs/ pinned tabs/ folders. 
    // another way to do is find StorableSidebar.json file and put it in the same folder as this script. 
    const outputFile = 'bookmarks.html';

    const { success, count } = await convertArcToBookmarks(inputFile, outputFile);
    
    if (success) {
        console.log(`Successfully converted ${count} bookmarks to ${outputFile}`);
        console.log("\nTo import these bookmarks:");
        console.log("1. In Chrome: Open Bookmarks Manager (⌘⇧B) -> Click three dots -> Import bookmarks");
        console.log("2. In Firefox: Open Library (⌘⇧B) -> Import and Backup -> Import Bookmarks from HTML");
    } else {
        console.log("Conversion failed");
    }
};

// Run the script if it's being executed directly
if (require.main === module) {
    main().catch(console.error);
}