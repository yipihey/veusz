"""Aggregate JSONL traces from VEUSZ_PAINT_TRACE / VEUSZ_RECORDPAINT_TRACE.

Reads one or more JSONL files (one record per Python or C++ painter call)
and prints the measured call-frequency table that updates ``§1`` of
``docs/qpainter-audit.md``. This is the consumer for spike S1.

Usage
-----
    python tests/comparison/aggregate_trace.py trace1.jsonl trace2.jsonl

    # or, with the harness:
    VEUSZ_PAINT_TRACE=/tmp/py-trace.jsonl \
    VEUSZ_RECORDPAINT_TRACE=/tmp/cpp-trace.jsonl \
        python tests/comparison/veusz_render_compare.py --manifest --corpus
    python tests/comparison/aggregate_trace.py /tmp/py-trace.jsonl /tmp/cpp-trace.jsonl
"""

from __future__ import annotations

import argparse
import collections
import json
import sys
from pathlib import Path
from typing import Iterable


def iter_records(paths: Iterable[Path]):
    for path in paths:
        with open(path, "r", encoding="utf-8") as fp:
            for line in fp:
                line = line.strip()
                if not line:
                    continue
                try:
                    yield json.loads(line)
                except json.JSONDecodeError:
                    continue


def aggregate(paths: Iterable[Path]) -> dict:
    counts: collections.Counter = collections.Counter()
    by_widget: dict = collections.defaultdict(collections.Counter)
    path_sizes: list = []
    text_lens: list = []

    for rec in iter_records(paths):
        op = rec.get("op", "?")
        counts[op] += 1
        if "widget" in rec and rec["widget"]:
            by_widget[rec["widget"]][op] += 1
        if op == "drawPath" and "elements" in rec:
            path_sizes.append(rec["elements"])
        if op == "drawTextItem" and "len" in rec:
            text_lens.append(rec["len"])

    return {
        "counts": counts,
        "by_widget": by_widget,
        "path_sizes": path_sizes,
        "text_lens": text_lens,
    }


def print_table(agg: dict) -> None:
    counts = agg["counts"]
    total = sum(counts.values()) or 1
    print(f"{'method':30s} {'calls':>10s} {'pct':>7s}")
    print("-" * 50)
    for op, n in counts.most_common():
        pct = 100.0 * n / total
        print(f"{op:30s} {n:10d} {pct:6.2f}%")
    print("-" * 50)
    print(f"{'TOTAL':30s} {total:10d}")
    if agg["path_sizes"]:
        ps = agg["path_sizes"]
        print(f"\ndrawPath element count: n={len(ps)}, mean={sum(ps)/len(ps):.1f},"
              f" max={max(ps)}")
    if agg["text_lens"]:
        tl = agg["text_lens"]
        print(f"drawTextItem text length: n={len(tl)}, mean={sum(tl)/len(tl):.1f},"
              f" max={max(tl)}")


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("traces", nargs="+", type=Path)
    p.add_argument("--json", action="store_true", help="emit JSON instead of table")
    args = p.parse_args(argv)
    agg = aggregate(args.traces)
    if args.json:
        out = {
            "counts": dict(agg["counts"]),
            "by_widget": {k: dict(v) for k, v in agg["by_widget"].items()},
            "path_size_stats": _stats(agg["path_sizes"]),
            "text_len_stats": _stats(agg["text_lens"]),
        }
        print(json.dumps(out, indent=2))
    else:
        print_table(agg)
    return 0


def _stats(xs):
    if not xs:
        return None
    return {"n": len(xs), "min": min(xs), "max": max(xs),
            "mean": sum(xs) / len(xs)}


if __name__ == "__main__":
    sys.exit(main())
