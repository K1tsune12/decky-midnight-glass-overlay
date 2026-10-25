"""Midnight Glass Overlay backend: styles the performance overlay (MangoHud).

In Game Mode the performance overlay is drawn by mangoapp, which reads a config
file that Steam writes (its path is in mangoapp's MANGOHUD_CONFIGFILE). Steam
rewrites that file whenever the overlay level changes, so a small loop keeps our
block at the end of it. MangoHud uses the last value of each key, and mangoapp
reloads the file when it changes.
"""

import asyncio
import glob
import os
import re

import decky

BEGIN = "# midnight-glass-overlay: begin"
END = "# midnight-glass-overlay: end"
CHECK_SECONDS = 2.0

_HEX = re.compile(r"^[0-9a-fA-F]{6}$")


def _find_config() -> str | None:
    """Path of the config file mangoapp is using, or None."""
    for pid in os.listdir("/proc"):
        if not pid.isdigit():
            continue
        try:
            with open(f"/proc/{pid}/comm") as f:
                if f.read().strip() != "mangoapp":
                    continue
            with open(f"/proc/{pid}/environ", "rb") as f:
                for entry in f.read().split(b"\0"):
                    if entry.startswith(b"MANGOHUD_CONFIGFILE="):
                        return entry.split(b"=", 1)[1].decode()
        except OSError:
            continue
    files = sorted(glob.glob("/tmp/mangohud.*"), key=os.path.getmtime, reverse=True)
    return files[0] if files else None


def _strip_block(text: str) -> str:
    out, inside = [], False
    for line in text.splitlines():
        if line.strip() == BEGIN:
            inside = True
            continue
        if line.strip() == END:
            inside = False
            continue
        if not inside:
            out.append(line)
    return "\n".join(out).rstrip("\n")


class Plugin:
    _style: dict | None = None
    _task: asyncio.Task | None = None

    async def _main(self):
        self._task = asyncio.get_event_loop().create_task(self._keep_applied())

    async def _unload(self):
        if self._task:
            self._task.cancel()
        self._style = None
        self._write(None)

    def _write(self, style: dict | None) -> bool:
        path = _find_config()
        if not path or not os.path.exists(path):
            return False
        try:
            with open(path) as f:
                current = f.read()
            base = _strip_block(current)
            text = base
            if style:
                block = [
                    BEGIN,
                    f"background_color={style['color']}",
                    f"background_alpha={style['alpha']:.2f}",
                    END,
                ]
                text = (base + "\n" if base else "") + "\n".join(block)
            text += "\n"
            if text != current:
                with open(path, "w") as f:
                    f.write(text)
            return True
        except OSError as e:
            decky.logger.error(f"failed to update {path}: {e}")
            return False

    async def _keep_applied(self):
        while True:
            try:
                if self._style:
                    self._write(self._style)
            except Exception as e:  # keep the loop alive
                decky.logger.error(f"overlay style loop: {e}")
            await asyncio.sleep(CHECK_SECONDS)

    async def set_perf_style(self, enabled: bool, color: str, alpha: float) -> bool:
        """Enable/disable the performance overlay background override."""
        if enabled:
            if not _HEX.match(str(color)):
                color = "000000"
            alpha = max(0.0, min(1.0, float(alpha)))
            self._style = {"color": color.lower(), "alpha": alpha}
        else:
            self._style = None
        return self._write(self._style)

    async def get_perf_info(self) -> dict:
        """Debug info: config path and its current content."""
        path = _find_config()
        content = None
        if path and os.path.exists(path):
            try:
                with open(path) as f:
                    content = f.read()[-4000:]
            except OSError as e:
                content = f"<unreadable: {e}>"
        return {"path": path, "content": content}
