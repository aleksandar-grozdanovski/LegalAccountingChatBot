#!/usr/bin/env bash
# backup.sh - create backups of specified docker volumes or folders
# Usage: ./backup.sh /path/to/output [volume1 volume2 ...]

set -euo pipefail

OUTDIR="${1:-/srv/backups/legalchatbot}"
shift || true
VOLUMES=("$@")

mkdir -p "$OUTDIR"
TS=$(date +"%Y%m%d-%H%M%S")

if [ ${#VOLUMES[@]} -eq 0 ]; then
  echo "No volumes specified. Backing up /srv/docker/apps/legalchatbot directory as fallback."
  tar -C / -czf "$OUTDIR/legalchatbot-files-$TS.tar.gz" srv/docker/apps/legalchatbot || true
  echo "Backup written to $OUTDIR/legalchatbot-files-$TS.tar.gz"
  exit 0
fi

for vol in "${VOLUMES[@]}"; do
  echo "Backing up volume: $vol"
  docker run --rm \
    -v ${vol}:/volume \
    -v "$OUTDIR":/backup \
    alpine \
    sh -c "tar czf /backup/${vol//[\/:]/_}-$TS.tar.gz -C /volume ."
  echo "Wrote $OUTDIR/${vol//[\/:]/_}-$TS.tar.gz"
done

# Optionally prune old backups (keep 14)
find "$OUTDIR" -type f -name "*.tar.gz" -mtime +14 -delete || true

echo "All backups completed."
