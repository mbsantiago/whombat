tmux new -s whombat -n "servers" "make frontend-dev" \; \
	split-window -h "make backend-dev" \; \
	new-window -n "frontend" -c "front" "nvim" \; \
	new-window -n "backend" -c "back" "pdm run nvim" \;
