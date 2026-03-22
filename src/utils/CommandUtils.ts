/**
 * Encodes a command and args into a request buffer with header and checksum.
 * Mirrors the C# encodeCommand(byte command, byte[] args) behavior.
 */
export function encodeCommand(
  command: number,
  args: Uint8Array | number[],
): Uint8Array {
  const argsBytes = args instanceof Uint8Array ? args : new Uint8Array(args);
  const length = argsBytes.length + 4;
  const request = new Uint8Array(length);
  let sum = 0;

  request[0] = 0x0f;
  request[1] = argsBytes.length + 2;
  request[2] = command & 255;
  request.set(argsBytes, 3);

  for (let i = 2; i < request.length - 1; i++) {
    sum += request[i];
  }
  request[length - 1] = sum & 255;

  const hex = Array.from(request)
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join("-");

  return request;
}
