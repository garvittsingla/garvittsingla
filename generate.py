#!/usr/bin/env python3
"""
generate.py - GitHub Profile Terminal SVG Generator for @garvittsingla

Fetches user configuration from profile.json, ASCII art from assets/ascii.txt,
and dynamic GitHub account statistics via GitHub API, then renders a high-quality,
fastfetch/neofetch-styled dark terminal card SVG saved to assets/profile.svg.
"""

import html
import json
import os
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

import requests
from dateutil.relativedelta import relativedelta

# Paths
BASE_DIR = Path(__file__).parent
CONFIG_PATH = BASE_DIR / "profile.json"
ASCII_PATH = BASE_DIR / "assets" / "ascii.txt"
OUTPUT_SVG_PATH = BASE_DIR / "assets" / "profile.svg"

# GitHub Username
DEFAULT_USERNAME = "garvittsingla"


class GitHubAPI:
    """Helper for fetching data from GitHub REST API with rate-limiting and pagination support."""

    BASE_URL = "https://api.github.com"

    def __init__(self, username: str, token: Optional[str] = None):
        self.username = username
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": f"github-profile-generator/{username}",
        })
        if self.token:
            self.session.headers["Authorization"] = f"Bearer {self.token}"

    def github_get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Optional[Any]:
        url = f"{self.BASE_URL}/{endpoint.lstrip('/')}"
        try:
            response = self.session.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 403:
                print(f"Warning: GitHub API rate limited or forbidden for {endpoint}", file=sys.stderr)
                return None
            elif response.status_code == 404:
                print(f"Warning: GitHub API endpoint not found: {endpoint}", file=sys.stderr)
                return None
            else:
                print(f"Warning: GitHub API HTTP {response.status_code} for {endpoint}", file=sys.stderr)
                return None
        except Exception as e:
            print(f"Error fetching {endpoint}: {e}", file=sys.stderr)
            return None

    def github_get_paginated(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        results: List[Dict[str, Any]] = []
        page = 1
        query_params = dict(params or {})
        query_params["per_page"] = 100

        while True:
            query_params["page"] = page
            url = f"{self.BASE_URL}/{endpoint.lstrip('/')}"
            try:
                resp = self.session.get(url, params=query_params, timeout=10)
                if resp.status_code != 200:
                    break
                data = resp.json()
                if not isinstance(data, list) or not data:
                    break
                results.extend(data)
                if "next" not in resp.links:
                    break
                page += 1
                if page > 20:  # Safeguard against excessive pagination
                    break
            except Exception as e:
                print(f"Error fetching paginated {endpoint} page {page}: {e}", file=sys.stderr)
                break

        return results

    def get_user_profile(self) -> Optional[Dict[str, Any]]:
        return self.github_get(f"users/{self.username}")

    def get_owned_repositories(self) -> List[Dict[str, Any]]:
        repos = self.github_get_paginated(f"users/{self.username}/repos", params={"type": "owner"})
        # Filter strictly for repos owned by username and non-fork
        owned_public = [
            r for r in repos
            if isinstance(r, dict)
            and r.get("owner", {}).get("login", "").lower() == self.username.lower()
            and not r.get("fork", False)
            and not r.get("private", False)
        ]
        return owned_public

    def get_public_commits_estimate(self, owned_repos: List[Dict[str, Any]]) -> str:
        """
        Attempts to calculate or estimate public commits/contributions.
        1. Try search API for author commits if token is available.
        2. Fall back to summing commit counts across top owned repos.
        """
        # Attempt 1: Search API (requires token for commit search in some contexts)
        if self.token:
            search_res = self.github_get("search/commits", params={"q": f"author:{self.username}"})
            if search_res and "total_count" in search_res:
                return str(search_res["total_count"])

        # Attempt 2: Check commit header per_page=1 on top owned non-fork repos
        total_commits = 0
        counted_repos = 0
        sorted_repos = sorted(owned_repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)

        for repo in sorted_repos[:15]:  # Limit requests to top 15 repos to respect rate limits
            repo_name = repo.get("name")
            if not repo_name:
                continue
            url = f"{self.BASE_URL}/repos/{self.username}/{repo_name}/commits"
            try:
                resp = self.session.get(url, params={"author": self.username, "per_page": 1}, timeout=5)
                if resp.status_code == 200:
                    counted_repos += 1
                    # Read 'Link' header for total pages count if present
                    if "Link" in resp.headers and 'rel="last"' in resp.headers["Link"]:
                        links = resp.headers["Link"].split(",")
                        for link in links:
                            if 'rel="last"' in link:
                                page_num = link.split("page=")[-1].split(">")[0]
                                if page_num.isdigit():
                                    total_commits += int(page_num)
                                    break
                    else:
                        data = resp.json()
                        if isinstance(data, list):
                            total_commits += len(data)
            except Exception:
                continue

        if total_commits > 0:
            if len(sorted_repos) > counted_repos:
                return f"{total_commits}+"
            return str(total_commits)

        return "N/A"


def load_profile_config(path: Path) -> Dict[str, Any]:
    if not path.exists():
        print(f"Warning: {path} not found. Using defaults.", file=sys.stderr)
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {path}: {e}", file=sys.stderr)
        return {}


def load_ascii_art(path: Path) -> List[str]:
    if not path.exists():
        return [
            "  ██████╗  █████╗ ██████╗ ██╗   ██╗██╗████████╗",
            " ██╔════╝ ██╔══██╗██╔══██╗██║   ██║██║╚══██╔══╝",
            " ██║  ███╗███████║██████╔╝██║   ██║██║   ██║   ",
            " ██║   ██║██╔══██║██╔══██╗╚██╗ ██╔╝██║   ██║   ",
            " ╚██████╔╝██║  ██║██║  ██║ ╚████╔╝ ██║   ██║   ",
            "  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝   ╚═╝   ",
        ]
    try:
        with open(path, "r", encoding="utf-8") as f:
            lines = [line.rstrip("\r\n") for line in f]
            return lines
    except Exception as e:
        print(f"Error reading ASCII file {path}: {e}", file=sys.stderr)
        return ["(ASCII Art missing)"]


def calculate_uptime(created_at_iso: Optional[str]) -> str:
    if not created_at_iso:
        return "N/A"
    try:
        # Handle ISO format timestamp (e.g., 2021-09-15T12:34:56Z)
        created_at = datetime.fromisoformat(created_at_iso.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        delta = relativedelta(now, created_at)

        parts = []
        if delta.years > 0:
            parts.append(f"{delta.years} year{'s' if delta.years > 1 else ''}")
        if delta.months > 0:
            parts.append(f"{delta.months} month{'s' if delta.months > 1 else ''}")
        if delta.days > 0 or not parts:
            parts.append(f"{delta.days} day{'s' if delta.days > 1 else ''}")

        return ", ".join(parts[:3])
    except Exception as e:
        print(f"Error calculating account uptime: {e}", file=sys.stderr)
        return "N/A"


def escape(text: str) -> str:
    return html.escape(str(text), quote=True)


def format_value(val: Any) -> str:
    if isinstance(val, list):
        return ", ".join(str(item) for item in val if item)
    if val is None:
        return ""
    return str(val)


def render_terminal_svg(
    config: Dict[str, Any],
    ascii_lines: List[str],
    stats: Dict[str, Any],
) -> str:
    username = config.get("username", DEFAULT_USERNAME)
    user_title = f"{username}@github"

    # Gather rows for the right pane
    rows: List[Tuple[str, str, str]] = []  # (type: 'info'|'section'|'link', label, value_or_link)

    # 1. System Info
    os_info = format_value(config.get("os", ["Linux", "macOS", "Windows"]))
    uptime_info = stats.get("uptime", "N/A")
    host_info = config.get("name", "Garvit Singla")
    if config.get("education"):
        host_info += f" ({config.get('education')})"
    kernel_info = config.get("role", "Software Developer")
    ide_info = format_value(config.get("ide", ["VS Code", "Neovim"]))

    rows.append(("info", "OS", os_info))
    rows.append(("info", "Uptime", uptime_info))
    rows.append(("info", "Host", host_info))
    rows.append(("info", "Kernel", kernel_info))
    rows.append(("info", "IDE", ide_info))

    # Blank gap
    rows.append(("gap", "", ""))

    # 2. Languages & Tech
    langs = config.get("languages", {})
    if isinstance(langs, dict):
        if langs.get("programming"):
            rows.append(("info", "Languages.Programming", format_value(langs["programming"])))
        if langs.get("web"):
            rows.append(("info", "Languages.Web", format_value(langs["web"])))
        if langs.get("computer"):
            rows.append(("info", "Languages.Computer", format_value(langs["computer"])))

    if config.get("backend"):
        rows.append(("info", "Frameworks.Backend", format_value(config["backend"])))
    if config.get("databases"):
        rows.append(("info", "Databases", format_value(config["databases"])))
    if config.get("tools"):
        rows.append(("info", "Tools", format_value(config["tools"])))

    # Blank gap
    rows.append(("gap", "", ""))

    # 3. Interests
    interests = config.get("interests", {})
    if isinstance(interests, dict):
        if interests.get("software"):
            rows.append(("info", "Hobbies.Software", format_value(interests["software"])))
        if interests.get("other"):
            rows.append(("info", "Hobbies.Other", format_value(interests["other"])))

    # Blank gap
    rows.append(("gap", "", ""))

    # 4. Contact Section
    contacts = config.get("contact", {})
    has_contact = any(v for v in contacts.values()) if isinstance(contacts, dict) else False
    if has_contact or contacts:
        rows.append(("section", "- Contact ", ""))
        if isinstance(contacts, dict):
            for platform, handle in contacts.items():
                if handle:
                    platform_label = platform.capitalize()
                    rows.append(("info", platform_label, str(handle)))

        rows.append(("gap", "", ""))

    # 5. GitHub Stats Section
    rows.append(("section", "- GitHub Stats ", ""))
    rows.append(("stat", "Repos", str(stats.get("public_repos", "N/A"))))
    rows.append(("stat", "Stars", str(stats.get("total_stars", "N/A"))))
    rows.append(("stat", "Forks", str(stats.get("total_forks", "N/A"))))
    rows.append(("stat", "Public Contributions", str(stats.get("public_commits", "N/A"))))
    rows.append(("stat", "Followers", str(stats.get("followers", "N/A"))))
    rows.append(("stat", "Following", str(stats.get("following", "N/A"))))

    # Layout Calculations
    line_height = 24
    header_y = 65
    content_start_y = 105

    # Determine heights & widths
    ascii_line_count = len(ascii_lines)
    ascii_box_height = ascii_line_count * 18
    right_pane_line_count = len([r for r in rows if r[0] != "gap"]) + rows.count(("gap", "", "")) + 2
    right_box_height = right_pane_line_count * line_height

    total_content_height = max(ascii_box_height + 100, right_box_height + 120)
    svg_width = 1200
    svg_height = int(max(680, total_content_height))

    left_pane_x = 45
    ascii_font_size = 12
    ascii_line_height = 16

    # Vertically center ASCII art relative to right pane height
    ascii_total_h = ascii_line_count * ascii_line_height
    ascii_start_y = content_start_y + max(0, (right_box_height - ascii_total_h) // 2) - 15

    right_pane_x = 510
    total_right_width_chars = 56

    # Begin SVG construction
    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_width} {svg_height}" width="{svg_width}" height="{svg_height}">',
        '  <defs>',
        '    <style>',
        '      @import url(\'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&amp;display=swap\');',
        '      .term-bg { fill: #111820; stroke: #212830; stroke-width: 2; }',
        '      .header-bg { fill: #18202a; stroke: #212830; stroke-width: 1; }',
        '      .btn-red { fill: #ff5f56; }',
        '      .btn-yellow { fill: #ffbd2e; }',
        '      .btn-green { fill: #27c93f; }',
        '      .term-title { font-family: \'JetBrains Mono\', monospace; font-size: 13px; fill: #8b949e; font-weight: 500; }',
        '      .user-host { font-family: \'JetBrains Mono\', monospace; font-size: 18px; fill: #a3be8c; font-weight: 700; }',
        '      .ascii-art { font-family: \'JetBrains Mono\', monospace; font-size: 12px; fill: #88c0d0; white-space: pre; font-weight: 500; }',
        '      .label { font-family: \'JetBrains Mono\', monospace; font-size: 14px; fill: #e5a05b; font-weight: 600; }',
        '      .dots { font-family: \'JetBrains Mono\', monospace; font-size: 14px; fill: #4c566a; font-weight: 400; }',
        '      .value { font-family: \'JetBrains Mono\', monospace; font-size: 14px; fill: #88c0d0; font-weight: 400; }',
        '      .section-heading { font-family: \'JetBrains Mono\', monospace; font-size: 15px; fill: #d8dee9; font-weight: 700; }',
        '      .separator-line { stroke: #3b4252; stroke-width: 1.5; stroke-dasharray: 4,4; }',
        '      .separator-solid { stroke: #3b4252; stroke-width: 1.5; }',
        '      .stat-value { font-family: \'JetBrains Mono\', monospace; font-size: 14px; fill: #a3be8c; font-weight: 700; }',
        '      .v-sep { stroke: #212830; stroke-width: 1.5; stroke-dasharray: 3,3; }',
        '    </style>',
        '  </defs>',
        '',
        '  <!-- Terminal Window Background -->',
        f'  <rect class="term-bg" x="10" y="10" width="{svg_width - 20}" height="{svg_height - 20}" rx="12" ry="12"/>',
        '',
        '  <!-- Terminal Header Bar -->',
        f'  <rect class="header-bg" x="10" y="10" width="{svg_width - 20}" height="38" rx="12" ry="12"/>',
        '  <!-- Header control dots -->',
        '  <circle class="btn-red" cx="35" cy="29" r="6"/>',
        '  <circle class="btn-yellow" cx="53" cy="29" r="6"/>',
        '  <circle class="btn-green" cx="71" cy="29" r="6"/>',
        f'  <text class="term-title" x="{svg_width // 2}" y="33" text-anchor="middle">garvittsingla@github:~ (fastfetch)</text>',
        '',
        '  <!-- Vertical Separator Line between ASCII and Info -->',
        f'  <line class="v-sep" x1="475" y1="65" x2="475" y2="{svg_height - 35}"/>',
        '',
        '  <!-- LEFT PANE: ASCII Art -->',
        f'  <text class="ascii-art" x="{left_pane_x}" y="{ascii_start_y}">',
    ]

    # Insert ASCII Art lines
    for idx, line in enumerate(ascii_lines):
        dy_attr = f' dy="{ascii_line_height}"' if idx > 0 else ""
        escaped_line = escape(line)
        svg_parts.append(f'    <tspan x="{left_pane_x}"{dy_attr}>{escaped_line}</tspan>')

    svg_parts.append('  </text>')
    svg_parts.append('')
    svg_parts.append('  <!-- RIGHT PANE: Fastfetch Details -->')

    # Top Title
    current_y = header_y + 10
    svg_parts.append(f'  <text class="user-host" x="{right_pane_x}" y="{current_y}">{escape(user_title)}</text>')

    current_y += 12
    svg_parts.append(f'  <line class="separator-solid" x1="{right_pane_x}" y1="{current_y}" x2="{svg_width - 45}" y2="{current_y}"/>')

    current_y += 24

    # Render Rows
    for row_type, label, val in rows:
        if row_type == "gap":
            current_y += 10
            continue

        if row_type == "section":
            # Section header like "- Contact ---------------------------------"
            current_y += 6
            section_title = label
            dash_count = max(5, total_right_width_chars - len(section_title))
            dash_str = "-" * dash_count
            full_header = f"{section_title}{dash_str}"
            svg_parts.append(f'  <text class="section-heading" x="{right_pane_x}" y="{current_y}">{escape(full_header)}</text>')
            current_y += line_height
            continue

        # Row type: 'info' or 'stat'
        # Compute terminal dot alignment
        label_str = label
        val_str = str(val)

        # Handle dot alignment calculation
        target_dot_col = 25  # Column where dots end
        label_len = len(label_str)

        if label_len < target_dot_col:
            dots_count = target_dot_col - label_len
            dots_str = "." * dots_count
        else:
            dots_str = "."

        val_class = "stat-value" if row_type == "stat" else "value"

        svg_parts.append(f'  <text x="{right_pane_x}" y="{current_y}">')
        svg_parts.append(f'    <tspan class="label">{escape(label_str)}</tspan>')
        svg_parts.append(f'    <tspan class="dots">{escape(dots_str)} </tspan>')

        # Check if value is very long and needs clean rendering
        max_val_len = 42
        if len(val_str) > max_val_len:
            # Wrap value into multiple lines if needed
            words = val_str.split(", ")
            line1_words = []
            line2_words = []
            curr_len = 0
            for w in words:
                if curr_len + len(w) + 2 <= max_val_len:
                    line1_words.append(w)
                    curr_len += len(w) + 2
                else:
                    line2_words.append(w)

            l1_text = ", ".join(line1_words)
            l2_text = ", ".join(line2_words)

            svg_parts.append(f'    <tspan class="{val_class}">{escape(l1_text)}</tspan>')
            svg_parts.append('  </text>')

            if l2_text:
                current_y += line_height - 2
                indent_dots = " " * (target_dot_col + 1)
                svg_parts.append(f'  <text x="{right_pane_x}" y="{current_y}">')
                svg_parts.append(f'    <tspan class="dots">{escape(indent_dots)}</tspan>')
                svg_parts.append(f'    <tspan class="{val_class}">{escape(l2_text)}</tspan>')
                svg_parts.append('  </text>')
        else:
            svg_parts.append(f'    <tspan class="{val_class}">{escape(val_str)}</tspan>')
            svg_parts.append('  </text>')

        current_y += line_height

    svg_parts.append('</svg>')
    return "\n".join(svg_parts)


def validate_svg_xml(svg_content: str) -> bool:
    try:
        ET.fromstring(svg_content)
        return True
    except ET.ParseError as e:
        print(f"SVG Validation Error: {e}", file=sys.stderr)
        return False


def main():
    print("--- Starting GitHub Profile Terminal SVG Generator ---")

    # 1. Load Profile JSON
    config = load_profile_config(CONFIG_PATH)
    username = config.get("username", DEFAULT_USERNAME)
    print(f"Generating terminal profile for user: {username}")

    # 2. Load ASCII Art
    ascii_lines = load_ascii_art(ASCII_PATH)
    print(f"Loaded ASCII art ({len(ascii_lines)} lines).")

    # 3. Fetch Dynamic Data from GitHub API
    gh_api = GitHubAPI(username=username)

    print("Fetching GitHub user profile...")
    user_data = gh_api.get_user_profile() or {}

    print("Fetching GitHub repositories...")
    owned_repos = gh_api.get_owned_repositories()

    public_repos = user_data.get("public_repos", len(owned_repos))
    followers = user_data.get("followers", 0)
    following = user_data.get("following", 0)
    created_at = user_data.get("created_at")

    total_stars = sum(r.get("stargazers_count", 0) for r in owned_repos)
    total_forks = sum(r.get("forks_count", 0) for r in owned_repos)

    print("Estimating public contributions/commits...")
    public_commits = gh_api.get_public_commits_estimate(owned_repos)

    uptime_str = calculate_uptime(created_at)

    stats = {
        "public_repos": public_repos,
        "followers": followers,
        "following": following,
        "created_at": created_at,
        "uptime": uptime_str,
        "total_stars": total_stars,
        "total_forks": total_forks,
        "public_commits": public_commits,
    }

    print(f"Stats compiled: {stats}")

    # 4. Render SVG
    svg_content = render_terminal_svg(config, ascii_lines, stats)

    # 5. Validate SVG XML
    if not validate_svg_xml(svg_content):
        print("Error: Generated SVG failed XML validation!", file=sys.stderr)
        sys.exit(1)

    # 6. Save SVG to Output Path
    OUTPUT_SVG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_SVG_PATH, "w", encoding="utf-8") as f:
        f.write(svg_content)

    print(f"Successfully generated profile SVG at: {OUTPUT_SVG_PATH}")
    print("--- Done ---")


if __name__ == "__main__":
    main()
