enum ParseState {
  WAITING_FOR_START,
  WAITING_FOR_LENGTH,
  WAITING_FOR_DATA,
  WAITING_FOR_CHECKSUM,
}

/**
 * State-machine parser for device response frames: 0x0F, length, [payload], checksum.
 * Payload is (length - 1) bytes; checksum = sum(payload) & 0xFF.
 */
export class ResponseParser {
  private responses: Uint8Array[] = [];
  private length = 0;
  private buffer: Uint8Array = new Uint8Array(0);
  private bufferIndex = 0;
  private state: ParseState = ParseState.WAITING_FOR_START;

  /**
   * Feed one byte. Returns true when a complete valid frame was parsed.
   */
  consume(data: number): boolean {
    const byte = data & 0xff;

    switch (this.state) {
      case ParseState.WAITING_FOR_START:
        if (byte === 0x0f) {
          this.state = ParseState.WAITING_FOR_LENGTH;
        }
        return false;

      case ParseState.WAITING_FOR_LENGTH:
        this.length = byte;
        this.buffer = new Uint8Array(this.length - 1);
        this.bufferIndex = 0;
        this.state = ParseState.WAITING_FOR_DATA;
        return false;

      case ParseState.WAITING_FOR_DATA:
        this.buffer[this.bufferIndex] = byte;
        this.bufferIndex++;
        if (this.bufferIndex === this.buffer.length) {
          this.state = ParseState.WAITING_FOR_CHECKSUM;
        }
        return false;

      case ParseState.WAITING_FOR_CHECKSUM: {
        let sum = 0;
        for (let i = 0; i < this.buffer.length; i++) {
          sum += this.buffer[i];
        }
        if ((sum & 0xff) === byte) {
          this.responses.push(new Uint8Array(this.buffer));
          this.state = ParseState.WAITING_FOR_START;
          return true;
        }
        this.state = ParseState.WAITING_FOR_START;
        return false;
      }
    }

    return false;
  }

  hasResponse(): boolean {
    return this.responses.length > 0;
  }

  getResponse(): Uint8Array | null {
    if (this.responses.length === 0) return null;
    return this.responses.shift() ?? null;
  }
}
