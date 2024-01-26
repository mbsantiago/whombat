import webbrowser

from colorama import Fore, Style, just_fix_windows_console
from fastapi import FastAPI

from whombat.system.database import (
    create_async_db_engine,
    get_async_session,
    get_database_url,
    init_database,
)
from whombat.system.settings import Settings
from whombat.system.users import is_first_user

just_fix_windows_console()


def print_ready_message(settings: Settings):
    host = settings.host
    port = settings.port

    print(
        f"""
    {Fore.GREEN}{Style.DIM}Whombat is ready to go!{Style.RESET_ALL}

    {Fore.GREEN}{Style.BRIGHT} * Listening on http://{host}:{port}/{Style.RESET_ALL}

    {Fore.YELLOW}Press Ctrl+C to exit.{Style.RESET_ALL}
    """
    )


def print_first_run_message(settings: Settings):
    host = settings.host
    port = settings.port

    print(
        f"""
    {Fore.YELLOW}{Style.BRIGHT}This is the first time you run Whombat, welcome!{Style.RESET_ALL}

    {Fore.GREEN}{Style.DIM}Whombat is ready to go!{Style.RESET_ALL}

    {Fore.GREEN}{Style.BRIGHT} * Navigate to http://{host}:{port}/first to create your first user.{Style.RESET_ALL}

    {Fore.YELLOW}Press Ctrl+C to exit.{Style.RESET_ALL}
    """
    )


async def is_first_run(settings: Settings) -> bool:
    """Check if this is the first time the application is run."""

    db_url = get_database_url(settings)
    engine = create_async_db_engine(db_url)
    async with get_async_session(engine) as session:
        is_first_run = await is_first_user(session)

    return is_first_run


def print_dev_message(settings: Settings):
    database_url = get_database_url(settings)
    settings_str = settings.model_dump_json(
        indent=4,
        exclude={"db_username", "db_password", "db_url"},
    )
    print(
        f"""
{Fore.RED}{Style.BRIGHT}Whombat is running in development mode!{Style.RESET_ALL}

{Fore.GREEN}{Style.BRIGHT}Database URL:{Style.RESET_ALL} {database_url}

{Fore.GREEN}{Style.BRIGHT}Settings:{Style.RESET_ALL} {settings_str}
    """
    )


def update_splash_screen(message: str) -> None:
    try:
        import pyi_splash  # type: ignore

        pyi_splash.update_text(message)
    except ImportError:
        return


def close_splash_screen() -> None:
    try:
        import pyi_splash  # type: ignore

        pyi_splash.close()
    except ImportError:
        return


async def whombat_init(settings: Settings, _: FastAPI):
    """Run at initialization."""

    if settings.dev:
        print_dev_message(settings)

    print("Please wait while the database is initialized...")

    await init_database(settings)

    if await is_first_run(settings):
        print_first_run_message(settings)

        if settings.open_on_startup and not settings.dev:
            webbrowser.open(f"http://{settings.host}:{settings.port}/first/")
        return

    print_ready_message(settings)

    if settings.open_on_startup and not settings.dev:
        webbrowser.open(f"http://{settings.host}:{settings.port}/")
