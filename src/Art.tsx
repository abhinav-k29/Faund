import React from "react";
export function Creature({
  kind = 0,
  stage = 1,
  className = "",
}: {
  kind?: number;
  stage?: number;
  className?: string;
}) {
  const plant = kind === 2 || kind === 5,
    bee = kind === 3;
  return (
    <svg
      className={"creature " + className}
      viewBox="0 0 300 300"
      role="img"
      aria-label={
        plant
          ? "Original botanical companion"
          : bee
            ? "Original bee-inspired companion"
            : "Original bird-inspired companion"
      }
    >
      <defs>
        <linearGradient id={"body" + kind} x2=".8" y2="1">
          <stop stopColor={plant ? "#f4df80" : bee ? "#b7e5e1" : "#9ccca7"} />
          <stop
            offset="1"
            stopColor={plant ? "#d5ad48" : bee ? "#5b9eac" : "#4b9480"}
          />
        </linearGradient>
        <filter id="shadow">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {stage >= 2 && (
        <g opacity=".85">
          <path
            d="M96 224Q27 218 45 168Q95 165 103 227M205 224Q274 218 256 168Q207 165 198 227"
            fill="#91ac7c"
            stroke="#d9ecb0"
            strokeWidth="2"
          />
        </g>
      )}
      {stage === 3 && (
        <g>
          <circle
            cx="151"
            cy="144"
            r="116"
            fill="none"
            stroke="#f9e8a2"
            strokeWidth="3"
            strokeDasharray="2 12"
          />
          <path
            d="M117 66l-12-25 28 8 17-27 18 27 28-8-12 25"
            fill="#d8bc73"
            stroke="#f6e4ac"
            strokeWidth="2"
          />
        </g>
      )}
      <ellipse
        cx="151"
        cy="267"
        rx="67"
        ry="11"
        fill="#1b493e"
        opacity=".15"
        filter="url(#shadow)"
      />
      {bee ? (
        <>
          <ellipse
            cx="90"
            cy="130"
            rx="35"
            ry="55"
            fill="#f2ffff"
            opacity=".8"
            transform="rotate(-40 90 130)"
          />
          <ellipse
            cx="212"
            cy="130"
            rx="35"
            ry="55"
            fill="#f2ffff"
            opacity=".8"
            transform="rotate(40 212 130)"
          />
        </>
      ) : (
        <>
          <path
            d="M92 167Q33 140 53 218Q89 245 110 207"
            fill={plant ? "#7da268" : "#7197a4"}
          />
          <path
            d="M206 164Q261 138 246 211Q215 240 194 207"
            fill={plant ? "#7da268" : "#7197a4"}
          />
        </>
      )}
      <path
        d="M128 247l-15 18 32-2M173 247l15 18-32-2"
        stroke="#a86e42"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M76 163Q67 91 121 76Q145 63 170 77Q234 84 225 167L218 203Q211 256 151 257Q86 257 79 207Z"
        fill={"url(#body" + kind + ")"}
      />
      <ellipse
        cx="152"
        cy="198"
        rx="49"
        ry="48"
        fill={plant ? "#fff0ae" : bee ? "#e4f5e9" : "#f6dda0"}
      />
      {bee && (
        <>
          <path d="M103 186h98M105 213h93" stroke="#5999a9" strokeWidth="14" />
        </>
      )}
      {plant ? (
        <>
          <path d="M148 90Q101 65 112 27Q159 24 160 81" fill="#4c8e64" />
          <path d="M156 85Q166 35 207 48Q209 87 158 99" fill="#75ae6f" />
          {[100, 135, 170, 200].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={88 - Math.sin(i) * 24}
              r="20"
              fill="#f6d361"
            />
          ))}
        </>
      ) : (
        <>
          <path d="M134 81Q104 37 144 43Q158 47 160 78" fill="#a99cf4" />
          <path d="M155 76Q158 20 183 45L173 84" fill="#bcb0fa" />
          <path d="M175 82Q209 42 212 69L192 99" fill="#d0c3fa" />
        </>
      )}
      <ellipse cx="119" cy="139" rx="8" ry="12" fill="#203e3a" />
      <ellipse cx="184" cy="139" rx="8" ry="12" fill="#203e3a" />
      <circle cx="122" cy="135" r="3" fill="white" />
      <circle cx="187" cy="135" r="3" fill="white" />
      <ellipse cx="100" cy="158" rx="13" ry="7" fill="#ef9c80" opacity=".65" />
      <ellipse cx="201" cy="158" rx="13" ry="7" fill="#ef9c80" opacity=".65" />
      {plant ? (
        <path
          d="M140 161q12 12 24 0"
          fill="none"
          stroke="#486847"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ) : (
        <path d="M137 154q16-12 32 0l-16 20z" fill="#eaac59" />
      )}
      <path
        d="M103 111q13-10 26-4M174 107q13-6 25 4"
        fill="none"
        stroke="#376e63"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M57 80l3-10 3 10 10 3-10 3-3 10-3-10-10-3ZM241 105l3-10 3 10 10 3-10 3-3 10-3-10-10-3Z"
        fill="#fff7d0"
      />
    </svg>
  );
}
export function Landscape({
  children,
  richness = 4,
}: {
  children?: React.ReactNode;
  richness?: number;
}) {
  return (
    <div className="landscape">
      <svg
        className="land"
        viewBox="0 0 900 480"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sky" x2="0" y2="1">
            <stop stopColor="#d7e8cf" />
            <stop offset="1" stopColor="#f6efcf" />
          </linearGradient>
          <linearGradient id="hill" x2="0" y2="1">
            <stop stopColor="#94b898" />
            <stop offset="1" stopColor="#4d8975" />
          </linearGradient>
        </defs>
        <rect width="900" height="480" fill="url(#sky)" />
        <circle cx="640" cy="95" r="46" fill="#fff5c8" />
        <path d="M0 300Q140 128 330 274Q570 112 900 270V480H0" fill="#b5c6a0" />
        <path
          d="M0 355Q210 188 420 331Q660 189 900 313V480H0"
          fill="url(#hill)"
        />
        <ellipse cx="455" cy="430" rx="330" ry="80" fill="#3f7761" />
        <ellipse cx="455" cy="401" rx="307" ry="72" fill="#a6c28a" />
        <path d="M370 443q46-90 196-84q-110 37-121 110" fill="#dbd5a0" />
        {(richness < 3 ? [60, 855] : [60, 160, 760, 855]).map((x, i) => (
          <g key={x} transform={`translate(${x} ${i % 2 ? 80 : 10})`}>
            <path d="M0 350L10 145" stroke="#727d50" strokeWidth="15" />
            <ellipse
              cx="5"
              cy="135"
              rx="70"
              ry="115"
              fill={i % 2 ? "#4c816a" : "#376c5b"}
            />
            <path
              d="M10 300L-25 250M10 240l30-45"
              stroke="#798c61"
              strokeWidth="5"
            />
          </g>
        ))}
        {(richness === 0
          ? []
          : richness < 3
            ? [215, 600]
            : [140, 215, 600, 700, 790, 310]
        ).map((x, i) => (
          <g key={x} transform={`translate(${x} ${380 + (i % 3) * 20})`}>
            <path
              d="M0 20V-10M0 10q-30-25-23-34q27 0 23 34M0 14q30-25 23-35q-27 0-23 35"
              fill="#427b59"
              stroke="#427b59"
              strokeWidth="3"
            />
            <circle cy="-15" r="9" fill={i % 2 ? "#e9b982" : "#f3d36e"} />
          </g>
        ))}
      </svg>
      {children}
    </div>
  );
}
