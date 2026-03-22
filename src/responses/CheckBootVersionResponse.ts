export interface BootVersion {
  bootVersion: number;
}

function createBootVersion(bootVersion: number): BootVersion {
    return { bootVersion };
}

export function parseBootVersion(data: Uint8Array | number[]): BootVersion | null {
    console.log("BootVersionResponse: " + Buffer.from(data).toString('hex'));
    const d = data instanceof Uint8Array ? data : new Uint8Array(data);
    if(d.length < 2) return null;
    const bootVersion = d[0] + (d[1] / 100);
    return createBootVersion(bootVersion);
}