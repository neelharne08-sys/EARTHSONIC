from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAIN = ROOT / "backend" / "main.py"
DASHBOARD = ROOT / "frontend" / "src" / "pages" / "Dashboard.jsx"


def replace_once(source, anchor, replacement, label):
    count = source.count(anchor)
    if count != 1:
        raise RuntimeError(
            f"Cannot safely patch {label}: expected one anchor, found {count}"
        )
    return source.replace(anchor, replacement, 1)


def main():
    backend = MAIN.read_text(encoding="utf-8")
    dashboard = DASHBOARD.read_text(encoding="utf-8")
    pending = {}

    router_import = "from backend.nasa_power_api import router as science_router"
    router_registration = "app.include_router(science_router)"

    if router_import not in backend:
        backend = replace_once(
            backend,
            "from backend.image_processing import IMAGE_PATH",
            f"{router_import}\nfrom backend.image_processing import IMAGE_PATH",
            "backend import",
        )

    if router_registration not in backend:
        backend = replace_once(
            backend,
            "\n\nclass RegisterRequest(BaseModel):",
            f"\n\n{router_registration}\n\nclass RegisterRequest(BaseModel):",
            "backend router registration",
        )

    if backend != MAIN.read_text(encoding="utf-8"):
        pending[MAIN] = backend

    science_import = "import NASATemperatureLab from '../components/NASATemperatureLab';"
    if science_import not in dashboard:
        dashboard = replace_once(
            dashboard,
            "import MixStudio from '../components/MixStudio';",
            "import MixStudio from '../components/MixStudio';\n"
            + science_import,
            "dashboard import",
        )

    if "<NASATemperatureLab />" not in dashboard:
        dashboard = replace_once(
            dashboard,
            '        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">',
            '        <NASATemperatureLab />\n\n'
            '        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">',
            "dashboard science section",
        )

    if dashboard != DASHBOARD.read_text(encoding="utf-8"):
        pending[DASHBOARD] = dashboard

    for path, content in pending.items():
        path.write_text(content, encoding="utf-8")
        print(f"Updated: {path.relative_to(ROOT)}")

    if pending:
        print("NASA POWER integration applied successfully")
    else:
        print("NASA POWER integration already applied")


if __name__ == "__main__":
    main()
