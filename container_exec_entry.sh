#!/bin/bash

echo -n "Enter session name: "

read session_name

tmux has-session -t $session_name 2>/dev/null


if [ $? != 0 ]; then
  tmux new -s $session_name "./container_exec.sh"
else
  tmux attach -t $session_name
fi
