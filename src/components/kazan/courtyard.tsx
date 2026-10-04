"use client";

import { useId } from "react";
import styles from "./kazan.module.css";

function Herb({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M0 0Q-5 -23 1 -46M0 -12Q-21 -12 -23 -29Q-7 -35 0 -12M1 -25Q19 -23 24 -42Q7 -44 1 -25M1 -37Q-11 -43 -9 -57Q6 -56 1 -37"
        fill="#789464"
      />
      <path d="M0 0L1 -42" stroke="#597a50" strokeWidth="2" />
    </g>
  );
}

function GardenBed({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="72" cy="26" rx="116" ry="22" fill="#7e8161" opacity=".13" />
      <path d="M-35 -10L119 -29 180 0 22 23Z" fill="#786d4c" />
      <path d="M-35 -10L22 23V43L-35 7Z" fill="#9d8b64" />
      <path d="M22 23L180 0V20L22 43Z" fill="#bcaa7e" />
      <path d="M24 31L177 9M-30 -1L17 26" stroke="#d7c69c" strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Herb key={i} x={i * 30} y={-8 + i * 2} scale={0.8 + (i % 2) * 0.2} />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${45 + i * 34} ${7 - i * 5})`}>
          <path
            d="M0 0Q-26 -28 -27 -9Q-27 7 0 0Q8 -26 18 -16Q29 1 0 0Q-9 -32 -18 -25Q-23 -5 0 0"
            fill={i % 2 ? "#96a574" : "#6e8a5a"}
          />
          <circle cy="-3" r="5" fill="#b86f49" />
        </g>
      ))}
    </g>
  );
}

function ProduceCrate({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="43" cy="59" rx="71" ry="13" fill="#6e6c50" opacity=".14" />
      <path d="M0 0L84 -11 110 7 25 20Z" fill="#897751" />
      {Array.from({ length: 8 }, (_, i) => (
        <g
          key={i}
          transform={`translate(${15 + (i % 4) * 22} ${2 - Math.floor(i / 4) * 12})`}
        >
          <circle
            r="13"
            fill={i % 3 === 0 ? "#c18750" : i % 3 === 1 ? "#a4ad71" : "#bb7254"}
          />
          <path
            d="M0 -10Q-9 -20 -12 -13Q-9 -5 0 -10Q4 -21 11 -16Q10 -8 0 -10"
            fill="#6f8756"
          />
        </g>
      ))}
      <path d="M0 0L25 20V68L0 45Z" fill="#a38a5e" />
      <path d="M25 20L110 7V54L25 68Z" fill="#c3aa79" />
      {[28, 42, 56].map((y) => (
        <path
          key={y}
          d={`M28 ${y}L106 ${y - 12}M3 ${y - 15}L21 ${y - 1}`}
          stroke="#8b764f"
          strokeWidth="2"
          opacity=".65"
        />
      ))}
      <path d="M26 19V68M109 7V54" stroke="#d8c399" strokeWidth="5" />
      <path d="M49 27L83 22V28L49 33Z" fill="#887451" />
    </g>
  );
}

/** Decorative school courtyard, independent of progress and student data. */
export function Courtyard() {
  const id = useId().replace(/:/g, "");
  const ref = (name: string) => `url(#${id}-${name})`;
  return (
    <svg
      className={styles.courtyard}
      viewBox="0 0 1600 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor="#ebeee0" />
          <stop offset=".58" stopColor="#f0eedb" />
          <stop offset="1" stopColor="#dbe2c7" />
        </linearGradient>
        <linearGradient id={`${id}-ground`} x2=".4" y2="1">
          <stop stopColor="#dde2ca" />
          <stop offset="1" stopColor="#e7dfc7" />
        </linearGradient>
        <radialGradient id={`${id}-light`}>
          <stop stopColor="#fff6d6" stopOpacity=".85" />
          <stop offset="1" stopColor="#fff6d6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-stone`} x2="0" y2="1">
          <stop stopColor="#e6ddc4" />
          <stop offset="1" stopColor="#c8bd9e" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x2="1" y2=".5">
          <stop stopColor="#e1ddc8" />
          <stop offset="1" stopColor="#d4d4ba" />
        </linearGradient>
        <filter id={`${id}-grain`}>
          <feTurbulence
            baseFrequency=".65"
            numOctaves="3"
            seed="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <g id={`${id}-flower`}>
          <path d="M0 0L-2 -15" stroke="#97a279" strokeWidth="2" />
          <g fill="#f6f0d6">
            <ellipse cy="-22" rx="3" ry="6" />
            <ellipse cx="-6" cy="-16" rx="6" ry="3" />
            <ellipse cx="6" cy="-16" rx="6" ry="3" />
            <ellipse cy="-11" rx="3" ry="6" />
          </g>
          <circle cy="-16" r="3" fill="#b9a362" />
        </g>
      </defs>
      <rect width="1600" height="800" fill={ref("sky")} />
      <ellipse cx="1180" cy="100" rx="530" ry="350" fill={ref("light")} />
      <circle cx="1250" cy="108" r="43" fill="#e7d8a1" opacity=".3" />
      <g fill="#fcfaef" opacity=".45">
        <path d="M516 129Q534 103 559 113Q574 87 595 108Q626 101 641 125Q669 124 674 140H500Q495 129 516 129Z" />
        <path d="M944 183Q953 164 976 170Q993 143 1016 168Q1046 164 1058 187H932Z" />
      </g>
      <g opacity=".5">
        <path
          d="M0 345Q160 263 338 328Q549 258 713 320Q964 236 1154 305Q1400 249 1600 328V476H0Z"
          fill="#c9d3b2"
        />
        <path
          d="M0 377Q212 318 375 370Q600 307 787 355Q1045 315 1240 361Q1470 306 1600 364V473H0Z"
          fill="#b6c6a3"
        />
      </g>
      <g opacity=".58" transform="translate(1115 240)">
        <path d="M-35 8L187 -38 407 14 402 34H-33Z" fill="#b9af8c" />
        <path d="M0 30H379V186H0Z" fill={ref("wall")} />
        <path d="M-10 182H393V199H-10Z" fill="#c1c4a5" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`translate(${27 + i * 56} 57)`}>
            <rect width="29" height="44" rx="2" fill="#aabca8" />
            <path d="M14 1V43M1 23H28" stroke="#e4e4cd" strokeWidth="3" />
            <rect y="69" width="29" height="41" rx="2" fill="#aabca8" />
            <path d="M14 70V109M1 89H28" stroke="#e4e4cd" strokeWidth="3" />
          </g>
        ))}
      </g>
      <path
        d="M0 430Q388 384 796 443Q1190 380 1600 442V800H0Z"
        fill={ref("ground")}
      />
      <path
        d="M852 413Q606 452 445 800H1325Q965 524 852 413Z"
        fill="#ece5d0"
        opacity=".58"
      />
      <path
        d="M-30 601Q703 491 1630 622M-40 690Q700 533 1640 715M-30 792Q742 589 1630 828"
        fill="none"
        stroke="#c9c3a8"
        strokeWidth="1"
        opacity=".4"
      />
      {[220, 480, 750, 1030, 1340].map((x, i) => (
        <path
          key={x}
          d={`M${720 + i * 55} 435Q${x + 80} 560 ${x} 800`}
          fill="none"
          stroke="#cec7ac"
          strokeWidth="1"
          opacity=".32"
        />
      ))}
      <g transform="translate(52 297)" opacity=".76">
        <path d="M0 39L187 0 307 48 120 91Z" fill="#b6ad85" />
        <path
          d="M3 38V216M119 91V259M303 49V229M190 2V167"
          stroke="#ad9c76"
          strokeWidth="9"
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M${i * 35} ${38 - i * 7}L${120 + i * 35} ${90 - i * 7}`}
            stroke="#cab995"
            strokeWidth="8"
          />
        ))}
        <path
          d="M3 55Q30 44 38 18Q53 -7 76 14Q103 13 117 -10Q144 -22 162 4Q191 2 211 22Q244 18 260 43"
          fill="none"
          stroke="#8d9e6d"
          strokeWidth="17"
          strokeLinecap="round"
        />
        <path
          d="M4 58Q9 128 -1 174M121 81Q131 120 121 173"
          fill="none"
          stroke="#7f9567"
          strokeWidth="5"
        />
        {[30, 63, 96, 130, 164, 199, 236].map((x, i) => (
          <ellipse
            key={x}
            cx={x}
            cy={20 + (i % 3) * 10}
            rx="19"
            ry="11"
            transform={`rotate(${i % 2 ? 30 : -25} ${x} ${20 + (i % 3) * 10})`}
            fill="#9caa78"
          />
        ))}
        <path d="M26 169L174 143 219 166 68 192Z" fill="#ac9770" />
        <path
          d="M68 192V216M204 169V195M38 175V196"
          stroke="#948563"
          strokeWidth="6"
        />
      </g>
      <path
        d="M152 312Q724 388 1400 294"
        fill="none"
        stroke="#a7a58b"
        strokeWidth="1"
        opacity=".7"
      />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <path
          key={i}
          d="M0 0L19 2 8 29Z"
          transform={`translate(${235 + i * 94} ${323 + Math.sin((i / 11) * Math.PI) * 34 - i * 2}) rotate(${12 - i * 2})`}
          fill={["#b6bf93", "#d2b484", "#c9bfa0"][i % 3]}
          opacity=".8"
        />
      ))}
      <GardenBed x={164} y={535} scale={1.02} />
      <GardenBed x={1380} y={505} scale={0.9} />
      <g transform="translate(1340 564)">
        <path d="M0 0L153 -8 22 72Z" fill="#8d916e" opacity=".15" />
        <path d="M0 0H168V13H0Z" fill="#ac9872" />
        <path d="M10 13L6 57M150 13L155 57" stroke="#8d805f" strokeWidth="6" />
        <path d="M4 -10H164V0H4Z" fill="#c4b18a" />
      </g>
      <ellipse cx="684" cy="636" rx="396" ry="70" fill="#9b9a76" opacity=".1" />
      <ellipse
        cx="684"
        cy="619"
        rx="353"
        ry="60"
        fill={ref("stone")}
        opacity=".6"
      />
      <ellipse
        cx="684"
        cy="614"
        rx="353"
        ry="57"
        fill="#e6dfc8"
        opacity=".75"
      />
      <ellipse
        cx="684"
        cy="614"
        rx="294"
        ry="45"
        fill="none"
        stroke="#bdb69a"
        strokeWidth="1"
        opacity=".35"
      />
      <g opacity=".8">
        <ProduceCrate x={1268} y={661} scale={1.05} />
        <ProduceCrate x={1392} y={687} scale={0.75} />
      </g>
      <g transform="translate(140 677)">
        <ellipse cy="38" rx="38" ry="9" fill="#9a9474" opacity=".13" />
        <path d="M-24 0L-19 35Q0 46 20 35L26 0Z" fill="#bd9c76" />
        <ellipse rx="27" ry="8" fill="#ccaf89" />
        <ellipse rx="22" ry="5" fill="#837551" />
        <Herb x={-4} y={0} scale={1.3} />
        <Herb x={11} y={1} scale={0.8} />
      </g>
      {Array.from({ length: 28 }, (_, i) => (
        <g
          key={i}
          transform={`translate(${(i * 163) % 1600} ${682 + ((i * 31) % 110)})`}
        >
          <path d="M0 0L-3 -10M0 0L5 -8" stroke="#a1ae83" strokeWidth="1.5" />
          {i % 3 === 0 && (
            <use href={`#${id}-flower`} transform="translate(8 1) scale(.8)" />
          )}
        </g>
      ))}
      <g className={styles.butterfly} transform="translate(365 409)">
        <path
          d="M0 0Q-19 -19 -20 -3Q-13 6 0 0Q15 -20 18 -8Q16 5 0 0"
          fill="#d1b77d"
        />
        <path d="M0 -3V5" stroke="#8e8664" strokeWidth="2" />
      </g>
      <g className={styles.butterfly} transform="translate(1080 433)">
        <path
          d="M0 0Q-13 -15 -16 -3Q-11 6 0 0Q12 -16 15 -6Q13 6 0 0"
          fill="#f1e6b4"
        />
      </g>
      <g className={styles.mobileGarden}>
        <GardenBed x={565} y={544} scale={0.65} />
        <ProduceCrate x={985} y={620} scale={0.75} />
        <Herb x={595} y={660} scale={1.2} />
        <Herb x={1005} y={656} scale={1.4} />
      </g>
      <rect
        width="1600"
        height="800"
        filter={ref("grain")}
        opacity=".035"
        style={{ mixBlendMode: "multiply" }}
      />
    </svg>
  );
}
