import subprocess
import sys
import os
import signal
import time
import select
import tty
import termios

# --- Configuration ---
# Commands to start the servers
BACKEND_CMD = ["npm", "run", "dev", "--", "--filter=api"]
FRONTEND_CMD = ["npm", "run", "dev", "--", "--filter=client"]
# The script assumes it's running from the project root
PROJECT_ROOT = os.getcwd()

# --- Globals for Process Management ---
processes = {
    "backend": None,
    "frontend": None
}

def start_process(name, cmd):
    """Starts a process and stores its object."""
    print(f"🚀 Starting {name} server...")
    # Using preexec_fn=os.setsid creates a new process group.
    # This is crucial for making sure we can terminate the entire
    # process tree (e.g., npm and its children) cleanly.
    process = subprocess.Popen(
        cmd,
        cwd=PROJECT_ROOT,
        preexec_fn=os.setsid
    )
    processes[name] = process
    print(f"✅ {name.capitalize()} server started with PID: {process.pid}")

def restart_process(name, cmd):
    """Gracefully terminates and restarts a specific process."""
    if processes.get(name) and processes[name].poll() is None:
        print(f"🔄 Restarting {name} server...")
        # Kill the entire process group associated with the process
        os.killpg(os.getpgid(processes[name].pid), signal.SIGTERM)
        processes[name].wait()  # Wait for the process to fully terminate
    start_process(name, cmd)

def cleanup(sig, frame):
    """Kills all child processes on script exit (e.g., Ctrl+C)."""
    print("\n🛑 Shutting down all servers...")
    for name, proc in processes.items():
        if proc and proc.poll() is None:
            print(f"   -> Terminating {name} (PID: {proc.pid})...")
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    print("👋 Goodbye!")
    # Restore terminal settings before exiting
    termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)
    sys.exit(0)

# Register the cleanup function for Ctrl+C and termination signals
signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)


if __name__ == "__main__":
    # This script is designed for Linux/macOS.
    if os.name == 'nt':
        print("This script is designed for Linux/macOS and may not work correctly on Windows.")
        # A simple windows implementation would just start processes without restart functionality
        be = subprocess.Popen(["cmd", "/c", " ".join(BACKEND_CMD)], cwd=PROJECT_ROOT)
        fe = subprocess.Popen(["cmd", "/c", " ".join(FRONTEND_CMD)], cwd=PROJECT_ROOT)
        be.wait()
        fe.wait()
        sys.exit(0)


    print("--- E-Commerce Dev Server Manager ---")
    start_process("backend", BACKEND_CMD)
    start_process("frontend", FRONTEND_CMD)
    print("\n--- Controls ---")
    print("  r - Restart Backend")
    print("  R - Restart Frontend")
    print("  q - Quit")
    print("------------------\n")

    # Save current terminal settings to restore them on exit
    old_settings = termios.tcgetattr(sys.stdin)
    try:
        # Set terminal to "cbreak" mode to read single key presses instantly
        tty.setcbreak(sys.stdin.fileno())

        while True:
            # Use select to check for keyboard input without blocking the script
            if select.select([sys.stdin], [], [], 0.1)[0]:
                char = sys.stdin.read(1)
                if char == 'r':
                    restart_process("backend", BACKEND_CMD)
                elif char == 'R':
                    restart_process("frontend", FRONTEND_CMD)
                elif char == 'q':
                    cleanup(None, None)

            time.sleep(0.1)  # A small delay to prevent high CPU usage

    finally:
        # Always restore terminal settings
        termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)