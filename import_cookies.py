"""Разовый импорт куки hh.ru, экспортированных вручную из другого браузера
(например, расширением Cookie-Editor), в state.json — файл сессии, который
HHClient грузит через storage_state (см. hh_client.py::STATE_FILE).

Использование:
    python import_cookies.py путь/к/hh_cookies.json

Принимает JSON-экспорт в формате Cookie-Editor / EditThisCookie (список
объектов с полями name/value/domain/...). Куки не с домена hh.ru отбрасываются.
"""

import json
import sys
import time
from pathlib import Path

STATE_FILE = Path(__file__).resolve().parent / "state.json"

SAME_SITE_MAP = {
    "no_restriction": "None",
    "unspecified": "Lax",
    "lax": "Lax",
    "strict": "Strict",
    "none": "None",
}


def convert_cookie(raw: dict) -> dict | None:
    domain = raw.get("domain", "")
    if "hh.ru" not in domain:
        return None

    if raw.get("session") or "expirationDate" not in raw:
        expires = -1
    else:
        expires = float(raw["expirationDate"])

    same_site_raw = str(raw.get("sameSite", "unspecified")).lower()
    same_site = SAME_SITE_MAP.get(same_site_raw, "Lax")

    return {
        "name": raw["name"],
        "value": raw["value"],
        "domain": domain,
        "path": raw.get("path", "/"),
        "expires": expires,
        "httpOnly": bool(raw.get("httpOnly", False)),
        "secure": bool(raw.get("secure", True)),
        "sameSite": same_site,
    }


def main():
    if len(sys.argv) != 2:
        print("Использование: python import_cookies.py путь/к/hh_cookies.json")
        sys.exit(1)

    export_path = Path(sys.argv[1])
    raw_cookies = json.loads(export_path.read_text(encoding="utf-8"))

    converted = [c for c in (convert_cookie(rc) for rc in raw_cookies) if c is not None]
    if not converted:
        print("Не нашёл ни одной куки с доменом hh.ru в этом файле.")
        sys.exit(1)

    if STATE_FILE.exists():
        state = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    else:
        state = {"cookies": [], "origins": []}

    existing = {(c["name"], c["domain"]): i for i, c in enumerate(state["cookies"])}
    for cookie in converted:
        key = (cookie["name"], cookie["domain"])
        if key in existing:
            state["cookies"][existing[key]] = cookie
        else:
            state["cookies"].append(cookie)

    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Импортировано {len(converted)} куки hh.ru в {STATE_FILE}")
    print(f"(записано {time.strftime('%Y-%m-%d %H:%M:%S')})")


if __name__ == "__main__":
    main()
