import * as React from "react";
import { motion } from "motion/react";

export type BatteryAnimationProps = React.SVGProps<SVGSVGElement> & {
  /** When false, bars stay solid with no pulse. Default: true. */
  charging?: boolean;
  /**
   * 0-based index of the first bar that animates. Bars with index &lt; `startFromBar`
   * stay fully filled (no animation). Default: 0 (all bars animate from empty).
   */
  startFromBar?: number;
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

const VIEWBOX_X = 2.5;
const VIEWBOX_Y = 14.68392;
const VIEWBOX_W = 48;
const VIEWBOX_H = 23.63216;
const VIEWBOX_STR = `${VIEWBOX_X} ${VIEWBOX_Y} ${VIEWBOX_W} ${VIEWBOX_H}`;

const DEFAULT_BAR_APPEAR_INTERVAL_S = 1;

const BatteryAnimation = ({
  charging = true,
  startFromBar = 0,
  barAppearIntervalS = DEFAULT_BAR_APPEAR_INTERVAL_S,
  barColor = DEFAULT_BAR_COLOR,
  className,
  ...props
}: BatteryAnimationProps) => {
  const staticBars = CHARGE_BAR_PATHS.slice(0, startFromBar);
  const animatedBars = charging ? CHARGE_BAR_PATHS.slice(startFromBar) : [];

  return (
    <motion.svg viewBox={VIEWBOX_STR} width={VIEWBOX_W} height={VIEWBOX_H}>
      <motion.path
        transform="translate(0,0)"
        style={{ fill: "rgb(237,237,237)" }}
        strokeLinecap="round"
        d="M 46.42014 17.68392 L 46.42014 35.31608 C 46.42014 36.97293 45.077 38.31608 43.42014 38.31608 L 5.5 38.31608 C 3.84315 38.31608 2.5 36.97293 2.5 35.31608 L 2.5 17.68392 C 2.5 16.02707 3.84315 14.68392 5.5 14.68392 L 43.42014 14.68392 C 45.077 14.68392 46.42014 16.02707 46.42014 17.68392 Z"
      />
      {staticBars.map((d, i) => (
        <motion.path
          key={i}
          transform="translate(0,0)"
          strokeLinecap="round"
          d={d}
          style={{ fill: barColor }}
        />
      ))}
      {animatedBars.map((d, i) => (
        <motion.path
          key={i}
          animate={{ opacity: [0, null, 1, null, 0] }}
          transition={{
            duration: (animatedBars.length + 1) * barAppearIntervalS,
            times: [
              0,
              (i + 1) / (animatedBars.length + 1),
              (i + 1 + 2) / (animatedBars.length + 1),
              1,
              1,
            ],
            repeat: Infinity,
          }}
          transform="translate(0,0)"
          strokeLinecap="round"
          d={d}
          style={{ fill: barColor }}
        />
      ))}
      <motion.path
        transform="translate(0,0)"
        style={{ fill: "rgb(219,219,219)" }}
        strokeLinecap="round"
        d="M 46.42014 22.29215 L 46.42014 30.70785 L 48.5 30.70785 C 49.60457 30.70785 50.5 29.81242 50.5 28.70785 L 50.5 24.29215 C 50.5 23.18758 49.60457 22.29215 48.5 22.29215 Z"
      />
    </motion.svg>
  );
};

export default BatteryAnimation;
