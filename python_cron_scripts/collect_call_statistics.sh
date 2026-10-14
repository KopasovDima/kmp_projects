# Update all statistics
# /var/apps/python_cron_scripts/.venv/bin/python /var/apps/python_cron_scripts/collect_call_statistics.py

# Update statistics for 04.2025
#/var/apps/python_cron_scripts/.venv/bin/python /var/apps/python_cron_scripts/collect_call_statistics.py --year=2025 --month=04

# Update all statistics checking files hash
/var/apps/python_cron_scripts/.venv/bin/python /var/apps/python_cron_scripts/collect_call_statistics.py --check_files_hash=1
