import * as React from "react";

export type BatteryAnimationProps = React.SVGProps<SVGSVGElement> & {
  /** When false, bars stay solid with no pulse. Default: true. */
  charging?: boolean;
  /**
   * 0-based index of the first bar that animates. Bars with index &lt; `startFromBar`
   * stay fully filled (no animation). Default: 0 (all bars animate from empty).
   */
  startFromBar?: number;
  /**
   * Wall-clock duration of each bar’s 0→1 opacity fade (milliseconds).
   * Default matches the previous built-in fade length.
   */
  fadeMs?: number;
  /**
   * Seconds between consecutive bars appearing (same spacing from empty to the first bar).
   * One full loop lasts `barAppearIntervalS * (animatedBarCount + 1)` seconds.
   */
  barAppearIntervalS?: number;
  /** Fill color for charge segments (any CSS color, e.g. `#09af54`, `rgb(9,175,84)`). */
  barColor?: string;
};

/** Vertical charge segments (left → right). The outline and terminal cap are separate paths. */
const CHARGE_BAR_PATHS = [
  "M 10.13098 17.68408 L 6.5 17.68408 C 5.94772 17.68408 5.5 18.1318 5.5 18.68408 L 5.5 34.31592 C 5.5 34.8682 5.94772 35.31592 6.5 35.31592 L 10.13098 35.31592 C 10.68327 35.31592 11.13098 34.8682 11.13098 34.31592 L 11.13098 18.68408 C 11.13098 18.1318 10.68327 17.68408 10.13098 17.68408 Z",
  "M 18.13199 17.68408 L 14.50101 17.68408 C 13.94872 17.68408 13.50101 18.1318 13.50101 18.68408 L 13.50101 34.31592 C 13.50101 34.8682 13.94872 35.31592 14.50101 35.31592 L 18.13199 35.31592 C 18.68427 35.31592 19.13199 34.8682 19.13199 34.31592 L 19.13199 18.68408 C 19.13199 18.1318 18.68427 17.68408 18.13199 17.68408 Z",
  "M 26.13299 17.68408 L 22.50201 17.68408 C 21.94973 17.68408 21.50201 18.1318 21.50201 18.68408 L 21.50201 34.31592 C 21.50201 34.8682 21.94973 35.31592 22.50201 35.31592 L 26.13299 35.31592 C 26.68528 35.31592 27.13299 34.8682 27.13299 34.31592 L 27.13299 18.68408 C 27.13299 18.1318 26.68528 17.68408 26.13299 17.68408 Z",
  "M34.131 17.5L30.5 17.5C29.9477 17.5 29.5 17.9477 29.5 18.5L29.5 34.1318C29.5 34.6841 29.9477 35.1318 30.5 35.1318L34.131 35.1318C34.6833 35.1318 35.131 34.6841 35.131 34.1318L35.131 18.5C35.131 17.9477 34.6833 17.5 34.131 17.5Z",
  "M42.131 17.5L38.5 17.5C37.9477 17.5 37.5 17.9477 37.5 18.5L37.5 34.1318C37.5 34.6841 37.9477 35.1318 38.5 35.1318L42.131 35.1318C42.6833 35.1318 43.131 34.6841 43.131 34.1318L43.131 18.5C43.131 17.9477 42.6833 17.5 42.131 17.5Z",
] as const;

const DEFAULT_BAR_COLOR = "rgb(9,175,84)";

/** Tight bbox of all paths (was 53×53 with large empty margins). */
const VIEWBOX_X = 2.5;
const VIEWBOX_Y = 14.68392;
const VIEWBOX_W = 48;
const VIEWBOX_H = 23.63216;
const VIEWBOX_STR = `${VIEWBOX_X} ${VIEWBOX_Y} ${VIEWBOX_W} ${VIEWBOX_H}`;
/** Reference full-loop length when all `N` bars animate (used to derive default bar spacing). */
const DEFAULT_CYCLE_DURATION_S = 3.5;
const N = CHARGE_BAR_PATHS.length;
/** Default gap between bars: one timeline slot out of `N + 1` (empty + N bars). */
const DEFAULT_BAR_APPEAR_INTERVAL_S = DEFAULT_CYCLE_DURATION_S / (N + 1);

/**
 * Default 0→1 opacity ramp (ms). Values ≪ ~16ms often look identical on 60Hz (one frame).
 */
const DEFAULT_FADE_MS = 0.012;

function pct(n: number): string {
  return `${n.toFixed(10)}%`;
}

/** Stable CSS identifier fragment so @keyframes names change when fade/cycle change (avoids stale keyframes). */
function animIdPart(n: number): string {
  return String(n).replace(/\./g, "p").replace(/-/g, "neg");
}

function barAnimName(
  waveId: string,
  localIndex: number,
  barCount: number,
  fadeMs: number,
  cycleS: number,
): string {
  return `${waveId}-fill-m${barCount}-${localIndex}-fade${animIdPart(fadeMs)}-cyc${animIdPart(cycleS)}`;
}

/**
 * Cumulative fill among `barCount` animated segments. Fade `fill-opacity` 0 → 1 (SVG paths often
 * ignore animated `opacity` when `fill` is set; `fill-opacity` is reliable). `fadeMs` sets ramp
 * length as % of the cycle, capped to one slot.
 */
function fillKeyframesCss(
  waveId: string,
  localIndex: number,
  barCount: number,
  cycleS: number,
  fadeMs: number,
): string {
  const slotPct = 100 / (barCount + 1);
  const turnOnPct = (localIndex + 1) * slotPct;
  const fadeSpanFromMs = (fadeMs / 1000 / cycleS) * 100;
  const fadeSpanPct = Math.min(fadeSpanFromMs, slotPct * 0.92);
  const fadeStartPct = Math.max(localIndex * slotPct, turnOnPct - fadeSpanPct);
  const name = barAnimName(waveId, localIndex, barCount, fadeMs, cycleS);
  return `@keyframes ${name} {
  0%, ${pct(fadeStartPct)} { fill-opacity: 0; }
  ${pct(turnOnPct)}%, 100% { fill-opacity: 1; }
}`;
}

const BatteryAnimation = ({
  charging = true,
  startFromBar = 0,
  fadeMs = DEFAULT_FADE_MS,
  barAppearIntervalS = DEFAULT_BAR_APPEAR_INTERVAL_S,
  barColor = DEFAULT_BAR_COLOR,
  className,
  ...props
}: BatteryAnimationProps) => {
  const waveId = React.useId().replace(/:/g, "");
  const clampedStart = Math.min(Math.max(0, Math.floor(startFromBar)), N);
  const animatedCount = N - clampedStart;
  const cycleDurationS =
    animatedCount > 0
      ? barAppearIntervalS * (animatedCount + 1)
      : DEFAULT_CYCLE_DURATION_S;

  /** Remount when timing props change so the engine reapplies keyframes (Electron/SVG can cache). */
  const svgAnimKey = `${fadeMs}-${cycleDurationS}-${barAppearIntervalS}-${clampedStart}-${barColor}`;

  const animatedKeyframes =
    animatedCount > 0
      ? Array.from({ length: animatedCount }, (_, j) =>
          fillKeyframesCss(waveId, j, animatedCount, cycleDurationS, fadeMs),
        ).join("\n")
      : "";
  const animatedRules =
    animatedCount > 0
      ? Array.from({ length: animatedCount }, (_, j) => {
          const cls = barAnimName(
            waveId,
            j,
            animatedCount,
            fadeMs,
            cycleDurationS,
          );
          return `
          .${cls} {
            animation: ${cls} ${cycleDurationS}s linear infinite;
          }`;
        }).join("")
      : "";

  return (
    <svg
      key={svgAnimKey}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={VIEWBOX_W}
      height={VIEWBOX_H}
      viewBox={VIEWBOX_STR}
      className={className}
      {...props}
    >
      <style>{`
${animatedKeyframes}
${animatedRules}
          .${waveId}-bar-static {
            opacity: 1;
            fill-opacity: 1;
            animation: none;
          }
        `}</style>
      <path
        transform="translate(0,0)"
        style={{ fill: "rgb(237,237,237)" }}
        strokeLinecap="round"
        d="M 46.42014 17.68392 L 46.42014 35.31608 C 46.42014 36.97293 45.077 38.31608 43.42014 38.31608 L 5.5 38.31608 C 3.84315 38.31608 2.5 36.97293 2.5 35.31608 L 2.5 17.68392 C 2.5 16.02707 3.84315 14.68392 5.5 14.68392 L 43.42014 14.68392 C 45.077 14.68392 46.42014 16.02707 46.42014 17.68392 Z"
      />
      {CHARGE_BAR_PATHS.map((d, i) => (
        <path
          key={i}
          transform="translate(0,0)"
          strokeLinecap="round"
          d={d}
          className={
            !charging || i < clampedStart || animatedCount === 0
              ? `${waveId}-bar-static`
              : barAnimName(
                  waveId,
                  i - clampedStart,
                  animatedCount,
                  fadeMs,
                  cycleDurationS,
                )
          }
          style={{ fill: barColor }}
        />
      ))}
      <path
        transform="translate(0,0)"
        style={{ fill: "rgb(219,219,219)" }}
        strokeLinecap="round"
        d="M 46.42014 22.29215 L 46.42014 30.70785 L 48.5 30.70785 C 49.60457 30.70785 50.5 29.81242 50.5 28.70785 L 50.5 24.29215 C 50.5 23.18758 49.60457 22.29215 48.5 22.29215 Z"
      />
    </svg>
  );
};

export default BatteryAnimation;
