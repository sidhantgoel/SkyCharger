/**
 * LiPo voltage to approximate percentage (0–100 or -1 for invalid).
 */
export function lipoVoltsToPersentage(volts: number): number {
  if (volts >= 4.2) return 100.0;
  if (volts >= 4.15) return 95.0 + (5.0 * (volts - 4.15)) / (4.2 - 4.15);
  if (volts >= 4.11) return 90.0 + (5.0 * (volts - 4.11)) / (4.15 - 4.11);
  if (volts >= 4.08) return 85.0 + (5.0 * (volts - 4.08)) / (4.11 - 4.08);
  if (volts >= 4.02) return 80.0 + (5.0 * (volts - 4.02)) / (4.08 - 4.02);
  if (volts >= 3.98) return 75.0 + (5.0 * (volts - 3.98)) / (4.02 - 3.98);
  if (volts >= 3.95) return 70.0 + (5.0 * (volts - 3.95)) / (3.98 - 3.95);
  if (volts >= 3.91) return 65.0 + (5.0 * (volts - 3.91)) / (3.95 - 3.91);
  if (volts >= 3.87) return 60.0 + (5.0 * (volts - 3.87)) / (3.91 - 3.87);
  if (volts >= 3.85) return 55.0 + (5.0 * (volts - 3.85)) / (3.87 - 3.85);
  if (volts >= 3.84) return 50.0 + (5.0 * (volts - 3.84)) / (3.85 - 3.84);
  if (volts >= 3.82) return 45.0 + (5.0 * (volts - 3.82)) / (3.84 - 3.82);
  if (volts >= 3.8) return 40.0 + (5.0 * (volts - 3.8)) / (3.82 - 3.8);
  if (volts >= 3.79) return 35.0 + (5.0 * (volts - 3.79)) / (3.8 - 3.79);
  if (volts >= 3.77) return 30.0 + (5.0 * (volts - 3.77)) / (3.79 - 3.77);
  if (volts >= 3.75) return 25.0 + (5.0 * (volts - 3.75)) / (3.77 - 3.75);
  if (volts >= 3.73) return 20.0 + (5.0 * (volts - 3.73)) / (3.75 - 3.73);
  if (volts >= 3.71) return 15.0 + (5.0 * (volts - 3.71)) / (3.73 - 3.71);
  if (volts >= 3.69) return 10.0 + (5.0 * (volts - 3.69)) / (3.71 - 3.69);
  if (volts >= 3.61) return 5.0 + (5.0 * (volts - 3.61)) / (3.69 - 3.61);
  if (volts >= 3.27) return 0.0 + (5.0 * (volts - 3.27)) / (3.61 - 3.27);
  return -1.0;
}

export function lifeVoltsToPersentage(volts: number): number {
  if (volts >= 3.65) return 100.0;
  if (volts >= 3.4) return 90.0 + (10.0 * (volts - 3.4)) / (3.65 - 3.4);
  if (volts >= 3.35) return 80.0 + (10.0 * (volts - 3.35)) / (3.4 - 3.35);
  if (volts >= 3.32) return 70.0 + (10.0 * (volts - 3.35)) / (3.35 - 3.32);
  if (volts >= 3.29) return 60.0 + (10.0 * (volts - 3.29)) / (3.32 - 3.29);
  if (volts >= 3.27) return 50.0 + (10.0 * (volts - 3.27)) / (3.29 - 3.27);
  if (volts >= 3.25) return 40.0 + (10.0 * (volts - 3.25)) / (3.27 - 3.25);
  if (volts >= 3.22) return 30.0 + (10.0 * (volts - 3.22)) / (3.25 - 3.22);
  if (volts >= 3.2) return 20.0 + (10.0 * (volts - 3.2)) / (3.22 - 3.2);
  if (volts >= 3.0) return 10.0 + (10.0 * (volts - 3.0)) / (3.2 - 3.0);
  if (volts >= 2.5) return 0.0 + (10.0 * (volts - 2.5)) / (3.0 - 2.5);
}

export function liioVoltsToPersentage(volts: number): number {
  if (volts >= 3.4) return 100.0;
  if (volts >= 3.35) return 90.0 + (10.0 * (volts - 3.35)) / (3.4 - 3.35);
  if (volts >= 3.32) return 80.0 + (10.0 * (volts - 3.32)) / (3.35 - 3.32);
  if (volts >= 3.3) return 70.0 + (10.0 * (volts - 3.3)) / (3.32 - 3.3);
  if (volts >= 3.27) return 60.0 + (10.0 * (volts - 3.27)) / (3.3 - 3.27);
  if (volts >= 3.26) return 50.0 + (10.0 * (volts - 3.26)) / (3.27 - 3.26);
  if (volts >= 3.25) return 40.0 + (10.0 * (volts - 3.25)) / (3.27 - 3.25);
  if (volts >= 3.22) return 30.0 + (10.0 * (volts - 3.22)) / (3.25 - 3.22);
  if (volts >= 3.2) return 20.0 + (10.0 * (volts - 3.2)) / (3.22 - 3.2);
  if (volts >= 3.0) return 10.0 + (10.0 * (volts - 3.0)) / (3.2 - 3.0);
  if (volts >= 2.5) return 0.0 + (10.0 * (volts - 2.5)) / (3.0 - 2.5);
}
