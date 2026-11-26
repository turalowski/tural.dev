#!/usr/bin/env python3
"""Build the text diagram used as each post's social preview image.

Writes public/blog/posts/<slug>/og.txt (plus app/og-home.txt and the
app/icon.txt logo when run for all posts): the post title in a box, with an
arrow down to a small "tural.dev" box. app/(pages)/blog/[slug]/opengraph-image.tsx
renders that file to a PNG.

Usage: yarn og            # all posts, home page and logo
       yarn og <slug>     # one post

The drawing is done by the text-diagram skill's Canvas helper. Override its
location with TEXT_DIAGRAM_SCRIPTS if it lives somewhere else.
"""
import os
import re
import sys
import textwrap
from pathlib import Path

SKILL_SCRIPTS = os.environ.get(
    "TEXT_DIAGRAM_SCRIPTS",
    str(Path.home() / ".claude/skills/turalowski/skills/text-diagram/scripts"),
)
sys.path.insert(0, SKILL_SCRIPTS)
from diagram import Canvas  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "public" / "blog" / "posts"

BOX_WIDTH = 45  # columns; fixed so every preview has the same frame
TEXT_WIDTH = BOX_WIDTH - 8  # leaves at least 3 spaces of padding per side
FOOTER = "tural.dev"


def read_title(index_md: Path) -> str:
    text = index_md.read_text(encoding="utf8")
    front = text.split("---", 2)[1] if text.startswith("---") else ""
    match = re.search(r'^title:\s*["\']?(.*?)["\']?\s*$', front, re.M)
    if not match:
        raise SystemExit(f"No title in {index_md}")
    # Box drawing needs single-width characters; normalise typographic dashes.
    return match.group(1).replace("—", "-").replace("–", "-")


def build(title: str | list[str]) -> str:
    lines = title if isinstance(title, list) else (textwrap.wrap(title, TEXT_WIDTH) or [title])
    c = Canvas()
    box = c.box(0, 0, ["", *lines, ""], width=BOX_WIDTH, style="light")
    footer_w = len(FOOTER) + 6
    footer_w += 1 - footer_w % 2  # odd width so it has a true centre
    foot = c.box(box.cx - footer_w // 2, box.y + box.h + 2, FOOTER, width=footer_w, style="rounded")
    c.arrow(box.bottom(), foot.top())
    return c.render() + "\n"


def build_icon() -> str:
    c = Canvas()
    c.box(0, 0, "T", pad=1, style="heavy")
    return c.render() + "\n"


def main(argv: list[str]) -> None:
    if not argv:
        app = ROOT / "app"
        (app / "og-home.txt").write_text(
            build(["Tural Hajiyev", "", "Notes on frontend engineering"]), encoding="utf8"
        )
        (app / "icon.txt").write_text(build_icon(), encoding="utf8")
        print("wrote app/og-home.txt, app/icon.txt")
    slugs = argv or sorted(
        p.name for p in POSTS.iterdir() if p.is_dir() and not p.name.startswith((".", "_"))
    )
    for slug in slugs:
        index_md = POSTS / slug / "index.md"
        if not index_md.exists():
            raise SystemExit(f"No post at {index_md}")
        (POSTS / slug / "og.txt").write_text(build(read_title(index_md)), encoding="utf8")
        print(f"wrote {slug}/og.txt")


if __name__ == "__main__":
    main(sys.argv[1:])
