import typer
import uvicorn
import os

app = typer.Typer()

@app.command("start-server")
def start_server(
    host: str = typer.Option("127.0.0.1", help="The host IP to bind the server to."),
    port: int = typer.Option(8000, help="The port number to bind the server to."),
    reload: bool = typer.Option(False, "--reload", help="Enable auto-reload on code changes.")
):
    """Starts the ForgeIQ FastAPI server."""
    # Path to the app object within the src layout: backend.app:app
    # The uvicorn runner needs the path relative to where Python looks for modules,
    # which includes the src directory when installed edita
    # uvicorn.run("backend.app:app", ...)

    # Determine the app path for uvicorn
    # Uvicorn needs the path like 'module.submodule:variable'
    app_module_str = "backend.app:app"
    
    typer.echo(f"Starting server on {host}:{port} with reload={reload}...")
    
    # Pass reload_dirs='src' if reload is enabled, so uvicorn watches the src directory
    reload_dirs = ['src'] if reload else None
    
    uvicorn.run(app_module_str, host=host, port=port, reload=reload, reload_dirs=reload_dirs)

if __name__ == "__main__":
    app() 