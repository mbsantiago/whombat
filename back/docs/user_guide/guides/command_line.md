# Manage Whombat from the command line

Whombat has a command-line interface (CLI) for managing your installation from a terminal. This guide is for users familiar with a terminal who installed Whombat through Python. See the [installation instructions](../installation.md) to get started.

Once Whombat is installed, run:

```bash
whombat --help
```

This shows the available commands and how to use them.

## Start the web app

Run `whombat` on its own to start the web app:

```bash
whombat
```

Keep the terminal open while you use Whombat in your browser. Closing the terminal or stopping the command shuts down the app.

## Manage users

The CLI can list registered users and change their passwords. Run `whombat users --help` to see the available user commands.

### View user accounts

To list all users, run:

```bash
whombat users list
```

The table shows each user's ID, username, email address and administrator status. To show only administrators or get JSON output, run:

```bash
whombat users list --admins-only
whombat users list --format json
```

You can combine the options:

```bash
whombat users list --admins-only --format json
```

### Change a password

If you or another user has forgotten a password, provide the account's email address or username:

```bash
whombat users password name@example.com
```

Enter the new password twice when prompted. Your input is hidden as you type. If a username matches multiple accounts, Whombat shows their email addresses so you can select the account by email.

## Change settings file

By default, the CLI loads your Whombat settings from `$WHOMBAT_DIR/settings.json`. To use a different Whombat JSON settings file, pass `--config-path`:

```bash
whombat --config-path /path/to/whombat.json
whombat users list --config-path /path/to/whombat.json
```
