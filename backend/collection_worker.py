"""Render Cron Job entry point: python -m backend.collection_worker --once.

Schedules and source execution locks are stored in SYSTEM Oracle, not memory or
the ephemeral Render filesystem. Unknown/stale runs require explicit review.
"""
import argparse
import json
import re

from backend import collection, config
from backend.database import close_pool


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--once', action='store_true', required=True)
    parser.add_argument('--limit', type=int, default=20, choices=range(1, 51))
    parser.add_argument('--job-id', help='Limit this execution to one existing due job (operations/QA).')
    args = parser.parse_args(argv)
    if args.job_id and not re.fullmatch(r'[0-9a-f]{32}', args.job_id):
        parser.error('--job-id must be a saved job ID.')
    if config.STORAGE != 'oracle':
        parser.error('Scheduled production collection requires SYSTEM Oracle.')
    try:
        report = collection.run_due(args.limit, args.job_id)
        print(json.dumps(report, ensure_ascii=False))
        return 1 if any(status in ('FAILED', 'UNKNOWN') for status in report['statuses']) else 0
    except Exception as error:
        # No exception text: upstream URLs, authorization data and DSNs stay private.
        print(json.dumps({'status': 'failed', 'error_type': type(error).__name__,
                          'message': 'Collection worker failed; review SYSTEM connectivity and saved run history.'}))
        return 1
    finally:
        close_pool()


if __name__ == '__main__':
    raise SystemExit(main())
