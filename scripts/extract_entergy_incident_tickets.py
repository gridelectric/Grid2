#!/usr/bin/env python3
"""Extract Entergy incident ticket values from OCR-layer PDF content streams.

This parser is purpose-built for the Entergy "Incident Summary Report" format
where each ticket is a single page with a consistent field layout.
"""

from __future__ import annotations

import argparse
import json
import re
import zlib
from dataclasses import dataclass
from pathlib import Path
from typing import Any


OBJECT_PATTERN = re.compile(rb"(\d+)\s+0\s+obj\s*<<(.*?)>>\s*stream\r?\n", re.S)
TM_PATTERN = re.compile(
    r"([\d.\-]+)\s+[\d.\-]+\s+[\d.\-]+\s+[\d.\-]+\s+([\d.\-]+)\s+([\d.\-]+)\s+Tm$"
)
TJ_PATTERN = re.compile(r"\((.*)\)\s+Tj$")
INCIDENT_NUMBER_PATTERN = re.compile(r"\b\d{10}\b")
INT_PATTERN = re.compile(r"^\d+$")


@dataclass
class TextToken:
    x: float
    y: float
    text: str


@dataclass
class TextRow:
    y: float
    items: list[TextToken]


def decode_pdf_text(value: str) -> str:
    # Basic PDF literal unescaping for this report format.
    return (
        value.replace(r"\(", "(")
        .replace(r"\)", ")")
        .replace(r"\\", "\\")
        .strip()
    )


def normalize_row_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def first_or_none(values: list[str]) -> str | None:
    return values[0] if values else None


def collect_rows(stream_text: str) -> list[TextRow]:
    tokens: list[TextToken] = []
    last_tm: tuple[float, float] | None = None

    for line in stream_text.splitlines():
        candidate = line.strip()
        tm_match = TM_PATTERN.match(candidate)
        if tm_match:
            x = float(tm_match.group(2))
            y = float(tm_match.group(3))
            last_tm = (x, y)
            continue

        tj_match = TJ_PATTERN.match(candidate)
        if not tj_match or last_tm is None:
            continue

        text = decode_pdf_text(tj_match.group(1))
        if not text:
            continue

        tokens.append(TextToken(x=last_tm[0], y=last_tm[1], text=text))

    rows: list[TextRow] = []
    for token in sorted(tokens, key=lambda item: (-item.y, item.x)):
        placed = False
        for row in rows:
            if abs(row.y - token.y) <= 1.0:
                row.items.append(token)
                placed = True
                break

        if not placed:
            rows.append(TextRow(y=token.y, items=[token]))

    for row in rows:
        row.items.sort(key=lambda item: item.x)

    return rows


def row_text(row: TextRow) -> str:
    return normalize_row_text(" ".join(item.text for item in row.items))


def find_rows_between(rows: list[TextRow], y_min: float, y_max: float) -> list[TextRow]:
    return [row for row in rows if y_min <= row.y <= y_max]


def value_in_range(items: list[TextToken], x_min: float, x_max: float) -> str:
    value = normalize_row_text(
        " ".join(token.text for token in items if x_min <= token.x < x_max)
    )
    return value


def clean_field_value(value: str | None, phrases: list[str]) -> str | None:
    if not value:
        return None

    cleaned = value
    for phrase in phrases:
        cleaned = re.sub(rf"\b{re.escape(phrase)}\b", " ", cleaned, flags=re.IGNORECASE)

    cleaned = normalize_row_text(cleaned)
    return cleaned or None


def pick_primary_data_row(rows: list[TextRow]) -> TextRow | None:
    for row in rows:
        text = row_text(row)
        if INCIDENT_NUMBER_PATTERN.search(text):
            return row
    return None


def parse_page(rows: list[TextRow]) -> dict[str, Any]:
    lines = [row_text(row) for row in rows]
    incident_row = pick_primary_data_row(rows)

    incident_number = None
    incident_type = None
    affected_customers = None

    top_band_text = normalize_row_text(" ".join(lines[:8]))
    incident_match = INCIDENT_NUMBER_PATTERN.search(top_band_text)
    incident_number = incident_match.group(0) if incident_match else None

    if incident_row:
        joined = " ".join(token.text for token in incident_row.items)
        incident_match_row = INCIDENT_NUMBER_PATTERN.search(joined)
        if incident_match_row:
            incident_number = incident_match_row.group(0)

    type_match = re.search(r"\b(LGTS)\b", top_band_text)
    if type_match:
        incident_type = type_match.group(1)
    elif incident_row:
        non_numeric = [token.text for token in incident_row.items if not INT_PATTERN.match(token.text)]
        incident_type = first_or_none(
            [
                value
                for value in non_numeric
                if value
                and value not in {"Incident", "Number", "Type", "Affected", "Customers", "Work", "Order", "ID"}
            ]
        )

    if incident_type:
        affected_match = re.search(rf"\b{re.escape(incident_type)}\b\s+(\d+)\b", top_band_text)
        if affected_match:
            affected_customers = affected_match.group(1)

    # Rows containing address/calls/start/ERT values live between the
    # "Address Calls Start Time ERT" label row and the next "Duration" row.
    schedule_rows: list[TextRow] = []
    label_index = next(
        (
            index
            for index, line in enumerate(lines)
            if "Address" in line and "Calls" in line and "Start" in line
        ),
        None,
    )
    if label_index is not None:
        duration_index = next(
            (
                index
                for index in range(label_index + 1, len(lines))
                if lines[index].startswith("Duration")
            ),
            None,
        )
        if duration_index is not None:
            schedule_rows = rows[label_index + 1 : duration_index]

    if not schedule_rows:
        # Fallback for unexpected variants.
        schedule_rows = find_rows_between(rows, 870.0, 910.0)
    schedule_tokens: list[TextToken] = []
    for row in schedule_rows:
        schedule_tokens.extend(row.items)

    address = value_in_range(schedule_tokens, 0.0, 180.0) or None
    calls = value_in_range(schedule_tokens, 180.0, 250.0) or None
    start_time = value_in_range(schedule_tokens, 280.0, 472.0) or None
    ert = value_in_range(schedule_tokens, 472.0, 999.0) or None

    def find_line_index(predicate: Any) -> int | None:
        for index, line in enumerate(lines):
            if predicate(line):
                return index
        return None

    duration = None
    duration_index = find_line_index(lambda line: line.startswith("Duration"))
    if duration_index is not None:
        for line in lines[duration_index + 1 :]:
            if "Device" in line:
                break
            match = re.search(r"\b\d+\s*h\b", line)
            if match:
                duration = match.group(0)
                break

    device_name = None
    network = None
    local_office = None
    device_name_label_index = find_line_index(lambda line: "Device Name" in line)
    device_type_label_index = find_line_index(lambda line: "Device Type" in line)
    if device_name_label_index is not None and device_type_label_index is not None:
        device_name_rows = rows[device_name_label_index + 1 : device_type_label_index]
        merged: list[TextToken] = []
        for row in device_name_rows:
            merged.extend(row.items)
        device_name = clean_field_value(value_in_range(merged, 0.0, 210.0), ["Device", "Name"])
        network = clean_field_value(value_in_range(merged, 240.0, 470.0), ["Network"])
        local_office = clean_field_value(value_in_range(merged, 470.0, 999.0), ["Local", "Office"])

    device_type = None
    feeder = None
    substation = None
    damage_label_index = find_line_index(lambda line: "Damage Assessment" in line)
    if device_type_label_index is not None and damage_label_index is not None:
        device_type_rows = rows[device_type_label_index + 1 : damage_label_index]
        merged: list[TextToken] = []
        for row in device_type_rows:
            merged.extend(row.items)
        device_type = clean_field_value(value_in_range(merged, 0.0, 210.0), ["Device", "Type"])
        feeder = clean_field_value(value_in_range(merged, 240.0, 470.0), ["Feeder"])
        substation = clean_field_value(value_in_range(merged, 470.0, 999.0), ["Substation"])

    poles_down = transformers_down = conductor_span = None
    services = cross_arms = tree_trim = None

    poles_label_index = find_line_index(lambda line: "Poles Down" in line)
    services_label_index = find_line_index(lambda line: "Services" in line and "Cross Arms" in line or line == "Services")
    dispatcher_label_index = find_line_index(lambda line: line.startswith("Dispatcher Comments"))

    def collect_numeric_values(source_lines: list[str]) -> list[str]:
        values: list[str] = []
        for line in source_lines:
            values.extend(re.findall(r"\b\d+\b", line))
        return values

    if (
        poles_label_index is not None
        and services_label_index is not None
        and services_label_index > poles_label_index
    ):
        top_numbers = collect_numeric_values(lines[poles_label_index + 1 : services_label_index])
        if len(top_numbers) >= 3:
            poles_down, transformers_down, conductor_span = top_numbers[0:3]

    if (
        services_label_index is not None
        and dispatcher_label_index is not None
        and dispatcher_label_index > services_label_index
    ):
        bottom_numbers = collect_numeric_values(lines[services_label_index + 1 : dispatcher_label_index])
        if len(bottom_numbers) >= 3:
            services, cross_arms, tree_trim = bottom_numbers[0:3]

    need_scout = None
    need_scout_rows = find_rows_between(rows, 456.0, 466.0)
    if need_scout_rows:
        candidate = value_in_range(need_scout_rows[0].items, 0.0, 180.0)
        normalized_candidate = candidate.replace(" ", "").lower() if candidate else ""
        if candidate and normalized_candidate not in {"need", "scout", "needscout"}:
            need_scout = candidate

    customer_comment_rows = [row for row in rows if row.y < 390.0]
    customer_comment = (
        normalize_row_text(" ".join(row_text(row) for row in customer_comment_rows)) or None
    )

    return {
        "incident_number": incident_number,
        "incident_type": incident_type,
        "address": address,
        "calls": calls,
        "start_time": start_time,
        "ert": ert,
        "duration": duration,
        "device_name": device_name,
        "device_type": device_type,
        "network": network,
        "feeder": feeder,
        "local_office": local_office,
        "substation": substation,
        "affected_customers": affected_customers,
        "work_order_id": device_name,  # This report maps Work Order ID to Device Name value.
        "damage_assessment": {
            "poles_down": poles_down,
            "services": services,
            "transformers_down": transformers_down,
            "cross_arms": cross_arms,
            "conductor_span": conductor_span,
            "tree_trim": tree_trim,
        },
        "dispatcher_comments": None,
        "crew_comments": None,
        "need_scout": need_scout,
        "first_customer_comment": customer_comment,
        "raw_lines": lines,
    }


def extract_incident_pages(pdf_path: Path) -> list[dict[str, Any]]:
    data = pdf_path.read_bytes()
    pages: list[dict[str, Any]] = []

    for match in OBJECT_PATTERN.finditer(data):
        object_id = int(match.group(1))
        dictionary = match.group(2)
        if b"/FlateDecode" not in dictionary:
            continue

        stream_start = match.end()
        stream_end = data.find(b"endstream", stream_start)
        if stream_end == -1:
            continue

        stream = data[stream_start:stream_end]
        if stream.endswith(b"\r\n"):
            stream = stream[:-2]
        elif stream.endswith(b"\n"):
            stream = stream[:-1]

        try:
            decoded = zlib.decompress(stream)
        except zlib.error:
            continue

        text = decoded.decode("latin1", "ignore")
        if "(Incident ) Tj" not in text or "(Summary ) Tj" not in text or "(Report ) Tj" not in text:
            continue

        rows = collect_rows(text)
        parsed = parse_page(rows)
        parsed["object_id"] = object_id
        pages.append(parsed)

    pages.sort(key=lambda item: item["object_id"])
    for page_number, payload in enumerate(pages, start=1):
        payload["page_number"] = page_number

    return pages


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract Entergy incident tickets from PDF.")
    parser.add_argument("input_pdf", type=Path, help="Path to source incident-ticket PDF")
    parser.add_argument(
        "--output-json",
        type=Path,
        default=Path("output/pdf/entergy_incident_tickets_batch1_extracted_v2.json"),
        help="Output JSON path",
    )
    args = parser.parse_args()

    incidents = extract_incident_pages(args.input_pdf)
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(incidents, indent=2), encoding="utf-8")

    summary = {
        "input_pdf": str(args.input_pdf.resolve()),
        "output_json": str(args.output_json.resolve()),
        "incident_count": len(incidents),
        "incident_numbers": [incident.get("incident_number") for incident in incidents],
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
