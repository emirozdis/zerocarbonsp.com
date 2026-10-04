"use client";

import { useId } from "react";

/** Reusable, deterministic cutaway illustration; fill is always in [0, 1]. */
export function Cauldron({ fill }: { fill: number }) {
  const id = useId().replace(/:/g, "");
  const ref = (name: string) => `url(#${id}-${name})`;
  const level = Math.max(0, Math.min(1, fill));
  const ingredients = [
    "tomato",
    "orange",
    "pear",
    "aubergine",
    "apple",
    "carrot",
    "broccoli",
  ];
  return (
    <svg
      className="kazan-illustration"
      viewBox="0 0 720 530"
      role="img"
      aria-label={`Okulun ortak kazanı yüzde ${Math.floor(level * 100)} dolu. Meyve ve sebzeler tasarrufu simgeler.`}
    >
      <defs>
        <linearGradient id={`${id}-copper`} x1="0" x2="1" y2=".3">
          <stop stopColor="#663c27" />
          <stop offset=".14" stopColor="#ad7346" />
          <stop offset=".35" stopColor="#efc493" />
          <stop offset=".58" stopColor="#b47b50" />
          <stop offset=".83" stopColor="#845031" />
          <stop offset="1" stopColor="#462f23" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="0" x2="0" y2="1">
          <stop stopColor="#f8d6a5" />
          <stop offset=".35" stopColor="#bc8858" />
          <stop offset=".7" stopColor="#74452c" />
          <stop offset="1" stopColor="#d9a873" />
        </linearGradient>
        <radialGradient id={`${id}-inside`} cx=".45" cy=".25" r=".8">
          <stop stopColor="#b18b60" />
          <stop offset="1" stopColor="#382d20" />
        </radialGradient>
        <radialGradient id={`${id}-red`} cx=".3" cy=".2">
          <stop stopColor="#f2ae73" />
          <stop offset=".38" stopColor="#d65a3a" />
          <stop offset="1" stopColor="#942e23" />
        </radialGradient>
        <radialGradient id={`${id}-orange`} cx=".3" cy=".2">
          <stop stopColor="#ffe29b" />
          <stop offset=".4" stopColor="#e8a044" />
          <stop offset="1" stopColor="#b36b2e" />
        </radialGradient>
        <radialGradient id={`${id}-green`} cx=".3" cy=".2">
          <stop stopColor="#d8df8b" />
          <stop offset=".5" stopColor="#97ad52" />
          <stop offset="1" stopColor="#4e6b35" />
        </radialGradient>
        <linearGradient id={`${id}-purple`}>
          <stop stopColor="#494332" />
          <stop offset=".4" stopColor="#867189" />
          <stop offset="1" stopColor="#3b3346" />
        </linearGradient>
        <linearGradient id={`${id}-glass`}>
          <stop stopColor="#e1b57e" stopOpacity=".3" />
          <stop offset=".4" stopColor="#fff7d6" stopOpacity=".04" />
          <stop offset="1" stopColor="#8b643c" stopOpacity=".24" />
        </linearGradient>
        <radialGradient id={`${id}-ground`}>
          <stop stopColor="#68764d" stopOpacity=".28" />
          <stop offset="1" stopColor="#68764d" stopOpacity="0" />
        </radialGradient>
        <filter
          id={`${id}-shadow`}
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="3"
            floodColor="#302314"
            floodOpacity=".26"
          />
        </filter>
        <clipPath id={`${id}-bowl`}>
          <path d="M184 216 Q360 154 536 216 L518 355 Q506 422 360 431 Q214 422 202 355Z" />
        </clipPath>
        <g id={`${id}-leaf`}>
          <path
            d="M0 0 Q-20 -30 -43 -19 Q-30 7 0 0 Q13 -24 35 -20 Q29 5 0 0"
            fill="#5e7b3d"
          />
          <path
            d="M-33 -16L0 0 27 -16"
            fill="none"
            stroke="#b3c07b"
            strokeWidth="1.5"
          />
        </g>
        <g id={`${id}-tomato`}>
          <path
            d="M0 -22C-44 -39 -48 22 -15 30C0 39 38 28 39 5C42 -20 23 -31 0 -22Z"
            fill={ref("red")}
          />
          <path
            d="M-5 -23L-23 -29 -12 -15 -28 -12 -4 -9 8 2 7 -14 27 -20 9 -22 2 -37Z"
            fill="#526b37"
          />
          <path
            d="M-27 -7Q-33 3 -26 13"
            stroke="#ffd4a0"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".35"
            fill="none"
          />
        </g>
        <g id={`${id}-orange`}>
          <circle r="33" fill={ref("orange")} />
          <path
            d="M-22 -9Q-28 0 -22 10"
            stroke="#fff1ba"
            strokeWidth="3"
            fill="none"
            opacity=".45"
          />
          <path d="M0 -31Q5 -43 23 -35Q17 -23 0 -31" fill="#627b3b" />
          {[
            [-12, 15],
            [8, 22],
            [20, 7],
            [-1, -12],
            [-20, 3],
            [15, -9],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.2"
              fill="#a96d31"
              opacity=".35"
            />
          ))}
        </g>
        <g id={`${id}-pear`}>
          <path
            d="M-12 -25C-11 -48 14 -44 16 -21C18 -8 39 11 25 29C12 47 -20 40 -28 22C-36 3 -14 -10 -12 -25Z"
            fill={ref("green")}
          />
          <path
            d="M0 -36Q-4 -47 5 -52"
            stroke="#635136"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M-16 2Q-24 12 -17 22"
            stroke="#f1edb2"
            strokeWidth="4"
            opacity=".35"
            fill="none"
          />
        </g>
        <g id={`${id}-apple`}>
          <path
            d="M0 -23C-35 -43 -49 -11 -33 18C-19 47 -3 30 3 33C27 47 47 7 33 -14C25 -31 13 -30 0 -23Z"
            fill={ref("green")}
          />
          <path d="M1 -24L5 -40" stroke="#5c4830" strokeWidth="4" />
          <use href={`#${id}-leaf`} transform="translate(4 -33) scale(.55)" />
          <path
            d="M-24 -9Q-30 1 -23 12"
            fill="none"
            stroke="#f1eab7"
            strokeWidth="4"
            opacity=".45"
          />
        </g>
        <g id={`${id}-aubergine`}>
          <path
            d="M-6 -32C-1 -10 -41 2 -30 27C-15 56 32 24 29 1C29 -13 10 -15 10 -34Z"
            fill={ref("purple")}
          />
          <path
            d="M-8 -32L-17 -12 -3 -18 5 -9 10 -21 23 -16 12 -35Z"
            fill="#718449"
          />
          <path
            d="M2 -30Q12 -45 20 -47"
            stroke="#677540"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M-18 11Q-24 28 -10 29"
            fill="none"
            stroke="#bea1b8"
            strokeWidth="4"
            opacity=".5"
          />
        </g>
        <g id={`${id}-carrot`}>
          <path
            d="M-17 -22Q0 -34 17 -20Q22 -8 -4 49Q-18 9 -17 -22Z"
            fill={ref("orange")}
          />
          <path
            d="M-13 -8L1 -4M3 11L12 13M-9 23L0 26"
            stroke="#ae6535"
            strokeWidth="2"
            opacity=".6"
          />
          <path
            d="M0 -25Q-28 -47 -16 -60Q0 -56 0 -25Q-2 -65 14 -67Q26 -48 0 -25Q19 -53 31 -42Q26 -29 0 -25"
            fill="#648347"
          />
        </g>
        <g id={`${id}-broccoli`}>
          <path d="M-6 35L-8 -5 8 -5 13 35Z" fill="#97a75c" />
          <path d="M0 17L-20 -8M4 9L24 -10" stroke="#9cac63" strokeWidth="8" />
          {[
            [-23, -10, 20],
            [22, -13, 22],
            [-9, -29, 22],
            [8, -30, 22],
            [0, -5, 25],
          ].map(([x, y, r], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill={i % 2 ? "#627c42" : "#79934e"}
              stroke="#506d3b"
              strokeWidth="2"
            />
          ))}
          <path
            d="M-28 -18Q-21 -30 -14 -21M-4 -38Q4 -46 11 -34M10 -10Q17 -17 22 -8"
            fill="none"
            stroke="#b2c47c"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".55"
          />
        </g>
      </defs>

      <ellipse cx="358" cy="446" rx="260" ry="55" fill={ref("ground")} />
      <g opacity=".55" fill="#97aa78">
        <path d="M91 389Q49 361 68 330Q93 343 91 389M94 389Q93 350 119 346Q128 374 94 389" />
        <path d="M618 381Q588 347 604 321Q628 331 618 381M619 381Q625 339 650 342Q655 368 619 381" />
      </g>
      <path
        d="M225 397L215 436Q221 447 242 441L259 413M461 413L477 441Q498 447 504 436L491 397"
        fill="#5e4430"
      />
      <path
        d="M181 244C104 200 99 312 186 300M539 244C616 200 621 312 534 300"
        fill="none"
        stroke="#563f2b"
        strokeWidth="20"
      />
      <path
        d="M177 237C110 208 112 298 184 290M543 237C610 208 608 298 536 290"
        fill="none"
        stroke={ref("rim")}
        strokeWidth="12"
      />
      <path
        d="M168 207Q360 143 552 207L532 358Q519 445 360 453Q201 445 188 358Z"
        fill={ref("copper")}
        stroke="#765134"
        strokeWidth="2"
      />
      <ellipse cx="360" cy="208" rx="191" ry="57" fill={ref("rim")} />
      <ellipse cx="360" cy="205" rx="174" ry="43" fill={ref("inside")} />
      <path
        d="M184 216Q360 154 536 216L518 355Q506 422 360 431Q214 422 202 355Z"
        fill={ref("inside")}
      />
      <g clipPath={ref("bowl")}>
        <g
          className="kazan-produce"
          style={{
            transform: `translateY(${(1 - level) * 280 + (level === 0 ? 65 : 0)}px)`,
          }}
          filter={ref("shadow")}
        >
          {Array.from({ length: 6 }, (_, row) =>
            Array.from({ length: 7 }, (_, col) => {
              const index = row * 7 + col;
              const x = 166 + col * 61 + (row % 2) * 23;
              const y = 400 - row * 43;
              return (
                <use
                  key={index}
                  href={`#${id}-${ingredients[(index * 3 + row) % ingredients.length]}`}
                  transform={`translate(${x} ${y}) rotate(${((index * 37) % 70) - 35}) scale(${0.87 + (index % 3) * 0.09})`}
                />
              );
            }),
          )}
        </g>
        <path d="M180 170H542V450H180Z" fill={ref("glass")} />
        <path
          d="M214 242L225 350Q236 395 276 402"
          fill="none"
          stroke="#fff0ca"
          strokeWidth="4"
          opacity=".18"
        />
      </g>
      <path
        d="M169 211Q360 285 551 211"
        fill="none"
        stroke="#5d3d29"
        strokeWidth="12"
      />
      <path
        d="M169 207Q360 277 551 207"
        fill="none"
        stroke={ref("rim")}
        strokeWidth="9"
      />
      <path
        d="M201 361Q216 437 359 444Q503 437 519 361"
        fill="none"
        stroke="#e5b87f"
        strokeWidth="3"
        opacity=".6"
      />
      {[212, 508].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="271" rx="8" ry="11" fill="#755035" />
          <ellipse cx={x - 1} cy="269" rx="5" ry="7" fill="#d4a16b" />
        </g>
      ))}
      <use
        href={`#${id}-carrot`}
        transform="translate(147 435) rotate(62) scale(.7)"
        filter={ref("shadow")}
      />
      <use
        href={`#${id}-tomato`}
        transform="translate(548 438) scale(.7)"
        filter={ref("shadow")}
      />
      <use
        href={`#${id}-leaf`}
        transform="translate(594 451) rotate(-30) scale(.65)"
      />
      {level >= 1 && (
        <g className="kazan-sparkles" fill="#b3934f">
          <path d="M166 135l4 12 12 4-12 4-4 12-4-12-12-4 12-4ZM563 135l4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" />
          <circle cx="229" cy="127" r="4" />
          <circle cx="499" cy="119" r="4" />
        </g>
      )}
    </svg>
  );
}
