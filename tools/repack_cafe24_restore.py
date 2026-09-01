from __future__ import annotations

import base64
import gzip
import io
import tarfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "release" / "tkddls8848_s2_260831230339_d_skin5_C.tar.gz"
WORK = ROOT / "cafe24-skin-work" / "skin5"
OUTPUT_DIR = ROOT / "release-fixed"
OUTPUT = OUTPUT_DIR / SOURCE.name

SKIP_PREFIXES = (
    "skin5/modules/mirnuri_office/",
    "skin5/SkinImg/mirnuri-office/",
)

REPLACEMENTS = {
    "skin5/index.html": WORK / "index.html",
    "skin5/layout/basic/layout.html": WORK / "layout/basic/layout.html",
    "skin5/modules/header/html/header.html": WORK / "modules/header/html/header.html",
    "skin5/modules/top_banner/html/text_fixed.html": WORK / "modules/top_banner/html/text_fixed.html",
}


def write_regular(output: tarfile.TarFile, member: tarfile.TarInfo, data: bytes) -> None:
    member.type = tarfile.REGTYPE
    member.linkname = ""
    member.size = len(data)
    output.addfile(member, io.BytesIO(data))


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    hero_data = base64.b64encode((ROOT / "assets" / "hero-office.jpg").read_bytes()).decode("ascii")
    theme_css = (WORK / "modules/mirnuri_office/css/theme.css").read_text(encoding="utf-8")
    home_css = (WORK / "modules/mirnuri_office/css/home.css").read_text(encoding="utf-8")
    home_css = home_css.replace("__MN_HERO_DATA__", f"data:image/jpeg;base64,{hero_data}")

    custom_name = "skin5/layout/basic/css/custom.css"
    replaced: set[str] = set()

    with tarfile.open(SOURCE, "r:gz") as source, OUTPUT.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, compresslevel=9, mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode="w", format=tarfile.GNU_FORMAT) as output:
                for member in source.getmembers():
                    if member.name.startswith(SKIP_PREFIXES):
                        continue

                    if member.name in REPLACEMENTS:
                        write_regular(output, member, REPLACEMENTS[member.name].read_bytes())
                        replaced.add(member.name)
                        continue

                    if member.name == custom_name:
                        original = source.extractfile(member)
                        if original is None:
                            raise RuntimeError(f"Cannot read {custom_name}")
                        combined = original.read().decode("utf-8")
                        combined += "\n\n/* MIRNURI OFFICE THEME */\n" + theme_css
                        combined += "\n\n/* MIRNURI OFFICE HOME */\n" + home_css
                        write_regular(output, member, combined.encode("utf-8"))
                        replaced.add(custom_name)
                        continue

                    stream = source.extractfile(member) if member.isreg() else None
                    output.addfile(member, stream)

    expected = set(REPLACEMENTS) | {custom_name}
    if replaced != expected:
        OUTPUT.unlink(missing_ok=True)
        raise RuntimeError(f"Replacement mismatch: expected={expected}, actual={replaced}")

    print(OUTPUT)


if __name__ == "__main__":
    main()
