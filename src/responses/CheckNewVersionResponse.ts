export interface NewVersion {
    haveNewVersion: boolean;
  }
  
  function createCheckNewVersion(haveNewVersion: boolean): NewVersion {
      return { haveNewVersion };
  }
  
  export function parseCheckNewVersion(data: Uint8Array | number[]): NewVersion | null {
      console.log("CheckNewVersionResponse: " + Buffer.from(data).toString('hex'));
      const d = data instanceof Uint8Array ? data : new Uint8Array(data);
      if(d.length < 2) return null;
      const haveNewVersion = d[0] === 1;
      return createCheckNewVersion(haveNewVersion);
  }