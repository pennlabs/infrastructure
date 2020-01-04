#!/bin/bash

if [ $2 == "startexec" ]; then
  container_exec.sh
  exit $?
fi

echo "List of active sessions:"

tmux ls

echo -n "Enter session name: "

read session_name

tmux has-session -t $session_name 2>/dev/null


if [ $? != 0 ]; then
  tmux new -s $session_name "startexec"
else
  tmux attach -t $session_name
fi
