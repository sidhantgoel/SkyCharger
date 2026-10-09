import { useCallback, useEffect, useRef, useState } from "react";
import { Command } from "src/commands/Command";
import { bluetoothHelper } from "src/utils/BluetoothHelper";

const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Tracks a command awaiting a device reply, for disabling its button.
 * `pending` clears when `done()` is called, when the write fails, or after
 * timeoutMs, so a missing or rejected reply never leaves the button stuck.
 * `send` and `done` are stable, so they are safe in once-registered listeners.
 */
export function usePendingCommand(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPending(false);
  }, []);

  const send = useCallback(
    async (command: Command) => {
      if (timer.current) clearTimeout(timer.current);
      setPending(true);
      timer.current = setTimeout(done, timeoutMs);
      if (!(await bluetoothHelper.sendCommand(command))) done();
    },
    [done, timeoutMs],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { pending, send, done };
}
