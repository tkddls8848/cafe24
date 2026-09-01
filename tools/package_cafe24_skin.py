from __future__ import annotations

import io
import tarfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tkddls8848_s2_260831230339_d_skin5_C.tar.gz"
WORK_SKIN = ROOT / "cafe24-skin-work" / "skin5"
RELEASE_DIR = ROOT / "release"
OUTPUT = RELEASE_DIR / SOURCE.name

REPLACEMENTS = {
    "skin5/index.html": WORK_SKIN / "index.html",
    "skin5/layout/basic/layout.html": WORK_SKIN / "layout/basic/layout.html",
    "skin5/modules/header/html/header.html": WORK_SKIN / "modules/header/html/header.html",
    "skin5/modules/top_banner/html/text_fixed.html": WORK_SKIN / "modules/top_banner/html/text_fixed.html",
}

ADDITIONS = {
    "skin5/modules/mirnuri_office/css/theme.css": WORK_SKIN / "modules/mirnuri_office/css/theme.css",
    "skin5/modules/mirnuri_office/css/home.css": WORK_SKIN / "modules/mirnuri_office/css/home.css",
    "skin5/SkinImg/mirnuri-office/hero-office.jpg": WORK_SKIN / "SkinImg/mirnuri-office/hero-office.jpg",
    "skin5/SkinImg/mirnuri-office/product-paper.jpg": WORK_SKIN / "SkinImg/mirnuri-office/product-paper.jpg",
    "skin5/SkinImg/mirnuri-office/product-notebook.jpg": WORK_SKIN / "SkinImg/mirnuri-office/product-notebook.jpg",
    "skin5/SkinImg/mirnuri-office/product-organizer.jpg": WORK_SKIN / "SkinImg/mirnuri-office/product-organizer.jpg",
    "skin5/SkinImg/mirnuri-office/product-pens.jpg": WORK_SKIN / "SkinImg/mirnuri-office/product-pens.jpg",
}


def add_bytes(archive: tarfile.TarFile, member: tarfile.TarInfo, data: bytes) -> None:
    member.type = tarfile.REGTYPE
    member.linkname = ""
    member.size = len(data)
    member.mode = 0o666
    archive.addfile(member, io.BytesIO(data))


def main() -> None:
    RELEASE_DIR.mkdir(exist_ok=True)
    missing = [str(path) for path in (*REPLACEMENTS.values(), *ADDITIONS.values()) if not path.is_file()]
    if missing:
        raise FileNotFoundError("Missing skin files:\n" + "\n".join(missing))

    replaced: set[str] = set()
    with tarfile.open(SOURCE, "r:gz") as source, tarfile.open(OUTPUT, "w:gz", format=tarfile.PAX_FORMAT) as output:
        for member in source.getmembers():
            if member.name in REPLACEMENTS:
                add_bytes(output, member, REPLACEMENTS[member.name].read_bytes())
                replaced.add(member.name)
                continue
            stream = source.extractfile(member) if member.isreg() else None
            output.addfile(member, stream)

        for archive_name, local_path in ADDITIONS.items():
            data = local_path.read_bytes()
            member = tarfile.TarInfo(archive_name)
            member.mode = 0o666
            member.mtime = int(local_path.stat().st_mtime)
            member.uname = "nobody"
            member.gname = "nobody"
            add_bytes(output, member, data)

    not_replaced = set(REPLACEMENTS) - replaced
    if not_replaced:
        OUTPUT.unlink(missing_ok=True)
        raise RuntimeError("Original archive members not found: " + ", ".join(sorted(not_replaced)))

    print(OUTPUT)


if __name__ == "__main__":
    main()
