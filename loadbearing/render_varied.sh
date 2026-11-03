#!/usr/bin/env bash
cd "$(dirname "$0")"
printf "%s\n" "$@" | xargs -P 2 -I{} sh -c 'python3 varied.py render {} 2>&1 | grep -v Fontconfig'
