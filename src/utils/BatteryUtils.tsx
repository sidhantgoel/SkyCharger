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
