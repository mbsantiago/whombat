__all__ = ["print_welcome_message"]


WELCOME_MESSAGE = r"""
Welcome to:

__      _| |__   ___  _ __ ___ | |__   __ _| |_
\ \ /\ / / '_ \ / _ \| '_ ` _ \| '_ \ / _` | __|
 \ V  V /| | | | (_) | | | | | | |_) | (_| | |_
  \_/\_/ |_| |_|\___/|_| |_| |_|_.__/ \__,_|\__|

An ML-focused audio annotation tool.

Please wait while Whombat starts up...
"""


def print_welcome_message():
    print(WELCOME_MESSAGE)
