import json
import os
from datetime import datetime

def convert_timestamp_to_epoch(timestamp):
    if isinstance(timestamp, (int, float)):
        return int(timestamp)
    return int(datetime.now().timestamp())

def parse_arc_json(json_data):
    bookmarks = []
    
    # Function to process items recursively
    def process_items(items):
        if not isinstance(items, list):
            return
        
        for i in range(0, len(items), 2):
            if i + 1 >= len(items):
                continue
                
            item_id = items[i]
            item_data = items[i + 1]
            
            if isinstance(item_data, dict):
                # Handle both direct values and nested value objects
                value_data = item_data.get('value', item_data)
                
                # Check if it's a bookmark with tab data
                if 'data' in value_data and 'tab' in value_data['data']:
                    tab_data = value_data['data']['tab']
                    bookmark = {
                        'title': tab_data.get('savedTitle', '') or tab_data.get('savedURL', ''),
                        'url': tab_data.get('savedURL', ''),
                        'add_date': convert_timestamp_to_epoch(value_data.get('createdAt', 0))
                    }
                    if bookmark['url']:
                        bookmarks.append(bookmark)
                
                # Process nested items
                if 'childrenIds' in value_data:
                    child_items = []
                    for child_id in value_data['childrenIds']:
                        child_items.extend([child_id, None])  # Placeholder for the data
                        # Try to find the corresponding data in the items list
                        for j in range(0, len(items), 2):
                            if j + 1 < len(items) and items[j] == child_id:
                                child_items[-1] = items[j + 1]
                                break
                    process_items(child_items)

    # Process sidebarSyncState items
    if 'sidebarSyncState' in json_data and 'items' in json_data['sidebarSyncState']:
        process_items(json_data['sidebarSyncState']['items'])
    
    # Process firebaseSyncState items
    if 'firebaseSyncState' in json_data and 'syncData' in json_data['firebaseSyncState']:
        firebase_items = json_data['firebaseSyncState']['syncData'].get('items', [])
        process_items(firebase_items)
    
    return bookmarks

def generate_netscape_bookmarks(bookmarks):
    html = '''<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="{}" PERSONAL_TOOLBAR="true">Arc Browser Bookmarks</H3>
    <DL><p>'''.format(int(datetime.now().timestamp()))

    for bookmark in bookmarks:
        html += f'''
        <DT><A HREF="{bookmark['url']}" ADD_DATE="{bookmark['add_date']}">{bookmark['title']}</A>'''

    html += '''
    </DL><p>
</DL><p>'''

    return html

def convert_arc_to_bookmarks(input_file, output_file):
    try:
        # Read and parse the Arc JSON file
        with open(input_file, 'r', encoding='utf-8') as f:
            arc_data = json.load(f)
        
        # Extract bookmarks
        bookmarks = parse_arc_json(arc_data)
        
        if not bookmarks:
            print("Warning: No bookmarks found in the file")
            
        # Generate Netscape bookmark format HTML
        bookmark_html = generate_netscape_bookmarks(bookmarks)
        
        # Write to output file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(bookmark_html)
        
        return True, len(bookmarks)
    except Exception as e:
        print(f"Error: {str(e)}")
        return False, 0

if __name__ == "__main__":
    input_file = os.path.expanduser("~/Library/Application Support/Arc/StorableSidebar.json") #location in mac where Arc stores sidebar tabs/ pinned tabs/ folders. 
    # another way to do is find StorableSidebar.json file and put it in the same folder as this script. 
    output_file = "bookmarks.html"
    
    success, count = convert_arc_to_bookmarks(input_file, output_file)
    if success:
        print(f"Successfully converted {count} bookmarks to {output_file}")
        print("\nTo import these bookmarks:")
        print("1. In Chrome: Open Bookmarks Manager (⌘⇧B) -> Click three dots -> Import bookmarks")
        print("2. In Firefox: Open Library (⌘⇧B) -> Import and Backup -> Import Bookmarks from HTML")
    else:
        print("Conversion failed") 