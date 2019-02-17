#!/usr/bin/env bash
tput setaf 4; echo '><> ilearn Duct Tape!'
cd ~/iLearn

pkill -9 gunicorn
sleep 1

tput setaf 1; echo '-> Killed Old Processes'
tput setaf 2; echo '-> Starting Servers'

tput setaf 4; echo '  -> [8082] Dashboard'
NODE='dash' gunicorn dashboard:app -c gunicorn.config.py -D
tput setaf 4; echo '  -> [8081] DataAPI'
NODE='udev' gunicorn data:app -c gunicorn.config.py -D
tput setaf 4; echo '  -> [8080] RootAPI'
NODE='uopt' gunicorn ilearn:app -c gunicorn.config.py -D

sleep 1
pgrep -f -l -a gunicorn

tput setaf 2; echo '-> Hopefully everything works.'
