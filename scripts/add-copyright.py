#!/usr/bin/env python3
"""
Copyright Header Injection Script
Automatically adds copyright headers to all source files in the project.

© 2022-2026 Ashraf Morningstar
https://github.com/AshrafMorningstar
"""

import os
import re
from pathlib import Path

# Copyright header templates
HEADERS = {
    'typescript': '''/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

''',
    'python': '''"""
© 2022-2026 Ashraf Morningstar
https://github.com/AshrafMorningstar

This file is part of LinkedIn Viral Scheduler.
Created for educational and skill development purposes.
"""

''',
    'markdown': '''<!--
© 2022-2026 Ashraf Morningstar
https://github.com/AshrafMorningstar

This file is part of LinkedIn Viral Scheduler.
Created for educational and skill development purposes.
-->

''',
}

EXTENSIONS = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'typescript',
    '.jsx': 'typescript',
    '.py': 'python',
    '.md': 'markdown',
    '.css': 'typescript',
}

SKIP_FILES = {'package-lock.json', 'yarn.lock', '.gitignore', 'LICENSE', 'COPYRIGHT.md'}
SKIP_DIRS = {'node_modules', '.git', 'dist', 'build', '.vscode', '.idea', 'coverage'}


def has_copyright(content: str) -> bool:
    """Check if file already has copyright."""
    patterns = [r'©.*Ashraf Morningstar', r'Copyright.*Ashraf Morningstar', r'github\.com/AshrafMorningstar']
    return any(re.search(p, content, re.IGNORECASE) for p in patterns)


def add_copyright_header(file_path: Path) -> bool:
    """Add copyright header to file."""
    if file_path.name in SKIP_FILES or file_path.suffix.lower() not in EXTENSIONS:
        return False
    
    try:
        content = file_path.read_text(encoding='utf-8')
        if has_copyright(content):
            print(f"⏭️  Skipped: {file_path.name}")
            return False
        
        header = HEADERS[EXTENSIONS[file_path.suffix.lower()]]
        file_path.write_text(header + content, encoding='utf-8')
        print(f"✅ Added: {file_path.name}")
        return True
    except Exception as e:
        print(f"❌ Error: {file_path.name} - {e}")
        return False


def main():
    """Main function."""
    print("=" * 60)
    print("Copyright Header Injection")
    print("© 2022-2026 Ashraf Morningstar")
    print("=" * 60)
    
    project_root = Path(__file__).parent.parent
    print(f"\n📁 Project: {project_root}\n")
    
    count = 0
    for item in project_root.rglob('*'):
        if item.is_file() and not any(skip in item.parts for skip in SKIP_DIRS):
            if add_copyright_header(item):
                count += 1
    
    print(f"\n✅ Processed {count} files\n")


if __name__ == '__main__':
    main()
