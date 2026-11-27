import json
import os
import re
import pdfplumber

PDF_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "NCC KER INSTITUTIONS")
OUT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data", "kerala-institutions.json")

GROUP_META = {
    "TVM_inst.pdf": {"code": "TVM", "name": "Trivandrum Group (TVM)"},
    "Kollam_inst.pdf": {"code": "KLM", "name": "Kollam Group (KLM)"},
    "Kottayam_inst.pdf": {"code": "KTM", "name": "Kottayam Group (KTM)"},
    "Ernakulam_inst.pdf": {"code": "EKM", "name": "Ernakulam Group (EKM)"},
    "Kozhikode_inst.pdf": {"code": "CLT", "name": "Kozhikode Group (CLT)"},
}

UNIT_NORMALIZATIONS = {
    # Ernakulam
    "1 (K0 R&V Sqn": "1 (K) R&V Sqn",
    "21(K) Bn NCC": "21 (K) Bn NCC",
    "22 (K) BN NCC": "22 (K) Bn NCC",
    "23 (K) BN NCC": "23 (K) Bn NCC",
    # Kollam
    "3 K Girls Bn": "3 (K) Girls Bn",
    "3(K) NU": "3 (K) NU",
    "7 (K) BN": "7 (K) Bn",
    # Kottayam
    "33(K) Bn NCC": "33 (K) Bn NCC",
    "5(K) Girls Bn": "5 (K) Girls Bn",
    "5(K) NU NCC": "5 (K) NU NCC",
    # Kozhikode
    "30 K Bn": "30 (K) Bn",
    "9 (K) Girls": "9 (K) Girls Bn",
    # Trivandrum
    "1(K) Girls Bn": "1 (K) Girls Bn",
    "1(K) NU NCC": "1 (K) NU NCC",
    "2(K) Bn NCC": "2 (K) Bn NCC",
    "31(K) Bn NCC": "31 (K) Bn NCC",
}


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def normalize_unit(unit: str) -> str:
    u = clean(unit)
    return UNIT_NORMALIZATIONS.get(u, u)


def cluster_vals(xs, tol):
    xs = sorted(xs)
    groups = []
    for x in xs:
        if not groups or x - groups[-1][-1] > tol:
            groups.append([x])
        else:
            groups[-1].append(x)
    return [sum(g) / len(g) for g in groups]


def extract_standard_pdf(path: str):
    records = []
    last_cols = None
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            vlines = [e["x0"] for e in page.vertical_edges if (e["bottom"] - e["top"]) > 20]
            cols = cluster_vals(vlines, tol=15)
            if len(cols) >= 12:
                last_cols = cols
            elif last_cols and (page.horizontal_edges or page.vertical_edges):
                cols = last_cols
            else:
                continue

            hlines_raw = [e["top"] for e in page.horizontal_edges if (e["x1"] - e["x0"]) > 100]
            if not hlines_raw:
                continue
            if page.vertical_edges:
                hlines_raw += [
                    min(e["top"] for e in page.vertical_edges),
                    max(e["bottom"] for e in page.vertical_edges),
                ]
            hlines = cluster_vals(hlines_raw, tol=4)
            if len(hlines) < 2:
                continue

            tables = page.extract_tables(
                {
                    "vertical_strategy": "explicit",
                    "horizontal_strategy": "explicit",
                    "explicit_vertical_lines": cols,
                    "explicit_horizontal_lines": hlines,
                }
            )
            for table in tables:
                for row in table:
                    c = [clean(x) for x in row]
                    if not any(c):
                        continue
                    if c[0] == "Ser No" or (len(c) > 5 and "Name and Address" in c[5]):
                        continue
                    if c[0].isdigit() or (len(c) > 1 and c[1] == "K&L"):
                        records.append(c)
                    elif records:
                        for idx, val in enumerate(c):
                            if val and idx < len(records[-1]):
                                records[-1][idx] = (records[-1][idx] + " " + val).strip()
    return records


def extract_kozhikode_pdf(path: str):
    records = []
    with pdfplumber.open(path) as pdf:
        p0 = pdf.pages[0]
        cols = cluster_vals([e["x0"] for e in p0.vertical_edges if (e["bottom"] - e["top"]) > 20], 15)
        for pi, page in enumerate(pdf.pages):
            words = page.extract_words()
            anchors = sorted(
                set(
                    round(w["top"], 1)
                    for w in words
                    if cols[1] <= w["x0"] < cols[2] and "K&L" in w["text"]
                )
            )
            if not anchors:
                continue
            min_y = (anchors[0] - 18) if pi > 0 else 138
            buckets = [[] for _ in anchors]
            for w in words:
                if w["top"] < min_y:
                    continue
                placed = False
                for ai, ay in enumerate(anchors):
                    if w["top"] <= ay + 5:
                        buckets[ai].append(w)
                        placed = True
                        break
                if not placed:
                    buckets[-1].append(w)
            for b in buckets:
                cells = [[] for _ in range(11)]
                for w in sorted(b, key=lambda x: (round(x["top"] / 4), x["x0"])):
                    cx = (w["x0"] + w["x1"]) / 2
                    for ci in range(11):
                        if cols[ci] - 3 <= cx <= cols[ci + 1] + 3:
                            cells[ci].append(w["text"])
                            break
                records.append([clean(" ".join(c)) for c in cells])
    return records


def main():
    hierarchy = {}
    total_raw = 0
    total_unique = 0

    for filename, meta in GROUP_META.items():
        path = os.path.join(PDF_DIR, filename)
        if filename == "Kozhikode_inst.pdf":
            rows = extract_kozhikode_pdf(path)
        else:
            rows = extract_standard_pdf(path)

        group_name = meta["name"]
        battalions = {}
        seen_per_bn = {}

        for r in rows:
            unit = normalize_unit(r[4])
            inst_name = clean(r[5])
            if not unit or not inst_name:
                continue
            total_raw += 1

            if unit not in battalions:
                battalions[unit] = []
                seen_per_bn[unit] = set()

            key = inst_name.lower()
            if key not in seen_per_bn[unit]:
                seen_per_bn[unit].add(key)
                battalions[unit].append(inst_name)
                total_unique += 1

        hierarchy[group_name] = {
            "code": meta["code"],
            "battalions": [
                {"name": bn_name, "institutions": sorted(inst_list, key=str.lower)}
                for bn_name, inst_list in sorted(battalions.items(), key=lambda kv: kv[0].lower())
            ],
        }
        print(
            f"{group_name}: {len(rows)} raw rows -> {len(battalions)} battalions, "
            f"{sum(len(v) for v in battalions.values())} unique institutions"
        )

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(
            {
                "groups": [
                    {
                        "name": g_name,
                        "code": g_data["code"],
                        "battalions": g_data["battalions"],
                    }
                    for g_name, g_data in hierarchy.items()
                ]
            },
            f,
            indent=2,
            ensure_ascii=False,
        )
    print(f"Wrote {OUT_PATH} (raw={total_raw}, unique={total_unique})")


if __name__ == "__main__":
    main()
