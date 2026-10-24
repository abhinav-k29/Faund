import React, { useId } from "react";

function Bloom({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <circle r="10" fill="#e0b840" />
      {Array.from({ length: 10 }, (_, i) => (
        <circle
          key={i}
          cx={Math.cos(i * 0.628) * 9}
          cy={Math.sin(i * 0.628) * 9}
          r="4.9"
          fill={i % 3 ? "#f0d36e" : "#fff0a7"}
        />
      ))}
      <circle cx="-2" cy="-3" r="6" fill="#f4db7a" />
    </g>
  );
}
export function Creature({
  kind = 0,
  stage = 1,
  className = "",
}: {
  kind?: number;
  stage?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, ""),
    bodyId = `companion-body-${uid}`,
    leafId = `companion-leaf-${uid}`,
    clipId = `bee-bands-${uid}`;
  const tree = kind === 5,
    plant = tree || kind === 2,
    bee = kind === 3,
    wren = kind === 1,
    kook = kind === 4;
  const face = (x: number, y: number, size = 1) => (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 16} 0)`}>
          <ellipse rx="8" ry="10.5" fill="#fff8e7" />
          <ellipse cx="-.6" cy="1" rx="5.5" ry="8" fill="#193f38" />
          <circle cx="-2" cy="-2" r="2.1" fill="#fffdf4" />
        </g>
      ))}
    </g>
  );
  return (
    <svg
      className={`creature ${className}`}
      viewBox="0 0 300 300"
      role="img"
      aria-label={`Original ${plant ? (tree ? "eucalyptus sapling" : "wattle sprout") : bee ? "six-legged bee" : wren ? "fairywren" : kook ? "kookaburra" : "lorikeet"}-inspired companion, evolution stage ${stage}`}
    >
      <defs>
        <linearGradient id={bodyId} x2=".8" y2="1">
          <stop
            stopColor={
              wren ? "#9bb9af" : kook ? "#c7b18b" : bee ? "#9bc5c4" : "#79a77f"
            }
          />
          <stop
            offset="1"
            stopColor={
              wren ? "#678e91" : kook ? "#9f8664" : bee ? "#35575a" : "#3e765f"
            }
          />
        </linearGradient>
        <linearGradient id={leafId} x2="1" y2="1">
          <stop stopColor={tree ? "#afc5b0" : "#9eb97a"} />
          <stop offset="1" stopColor={tree ? "#719c8b" : "#668e56"} />
        </linearGradient>
        <clipPath id={clipId}>
          <path d="M107 139Q64 155 83 212Q101 251 151 235Q197 214 172 173Q148 137 107 139Z" />
        </clipPath>
      </defs>
      <ellipse
        cx="151"
        cy="274"
        rx={plant ? 75 : 65}
        ry="8"
        fill="#275344"
        opacity=".1"
      />
      {plant ? (
        <>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M148 243Q123 246 105 262Q95 269 82 267M148 244Q135 257 134 272Q132 281 118 281M154 245Q164 253 178 269Q190 277 202 271M159 242Q184 244 202 259Q215 269 228 262M148 243Q148 265 157 276"
              stroke={tree ? "#a3977b" : "#8c7b56"}
              strokeWidth={tree ? 9 : 7}
            />
            <path
              d="M108 260q-4 10-15 13M177 267q10-2 14-9M134 267q-10-3-18 4M202 259q11-8 19-5"
              stroke={tree ? "#a3977b" : "#8c7b56"}
              strokeWidth="3"
            />
            {stage === 3 && (
              <path
                d="M142 244q-30-11-45 5q-10 10-23 6M163 242q16-13 37-8q13 4 20-3"
                stroke={tree ? "#b1a58a" : "#9b8a5d"}
                strokeWidth="5"
              />
            )}
            <path
              d="M146 246Q126 249 109 262M159 246q15 6 29 20"
              stroke={tree ? "#d4c7a7" : "#b1a06c"}
              strokeWidth="2"
            />
          </g>
          {tree ? (
            <>
              <path
                d="M128 249Q143 206 136 176Q132 141 150 99L164 93Q155 136 164 173Q165 216 176 249Q153 259 128 249Z"
                fill="#c2b495"
              />
              <path
                d="M134 246Q149 199 144 171Q139 146 153 114"
                fill="none"
                stroke="#e0d2b1"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M158 244Q151 216 158 188M159 170q-7-21-3-46"
                stroke="#9e9479"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M145 150Q116 135 99 102M157 137q29-15 40-55M154 117q-7-35 7-55"
                stroke="#b6a98b"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <g fill={`url(#${leafId})`} stroke="#719889" strokeWidth="1.3">
                <path d="M103 105Q58 105 66 158Q102 153 103 105Z" />
                <path d="M110 122Q68 132 91 177Q117 156 110 122Z" />
                <path d="M195 88Q233 103 213 155Q188 132 195 88Z" />
                <path d="M187 110Q156 117 174 166Q204 147 187 110Z" />
                <path d="M160 64Q112 65 133 117Q161 103 160 64Z" />
                <path d="M162 65Q184 31 210 62Q197 92 162 65Z" />
              </g>
              <g fill="none" stroke="#c6d0b2" strokeWidth="1.5">
                <path d="M102 108L76 148M194 91l17 52M158 66l-18 41M162 65l35-6M187 113l-9 41" />
              </g>
              {stage >= 2 && (
                <>
                  <path
                    d="M143 155Q113 149 82 133M159 127q42 3 67-20"
                    stroke="#b6a98b"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M84 134Q39 120 40 171Q75 176 84 134Z"
                    fill="#91b09b"
                  />
                  <path
                    d="M220 109Q261 123 234 163Q208 147 220 109Z"
                    fill="#89aa97"
                  />
                  <path
                    d="M90 112l-2 14M99 114l4 17"
                    stroke="#ab9f7e"
                    strokeWidth="2"
                  />
                  <ellipse cx="87" cy="129" rx="5" ry="7" fill="#a5a281" />
                  <ellipse cx="104" cy="134" rx="5" ry="7" fill="#a5a281" />
                </>
              )}
              {stage === 3 && (
                <>
                  <path
                    d="M152 114q-15-56-38-65M163 145q48 7 81-26"
                    stroke="#b6a98b"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path d="M115 50Q68 44 76 88Q111 93 115 50Z" fill="#a5bdaa" />
                  <path
                    d="M240 122Q278 134 253 175Q227 158 240 122Z"
                    fill="#789e8c"
                  />
                  <path
                    d="M112 53l-23 27M242 126l9 36"
                    stroke="#c5d0b4"
                    strokeWidth="1.5"
                  />
                </>
              )}
              {face(151, 194, 0.76)}
              <path
                d="M145 213q7 5 13-1"
                stroke="#747e66"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : (
            <>
              <path
                d="M134 249Q145 216 141 194Q133 168 148 139Q158 158 160 182Q154 220 169 249Q150 258 134 249Z"
                fill="#b9ac68"
              />
              <path
                d="M143 247q10-36 6-60q-4-22 2-43"
                fill="none"
                stroke="#d1c582"
                strokeWidth="5"
              />
              <path
                d="M150 172Q127 143 101 116M152 155Q174 134 190 104M152 152Q148 117 155 84"
                fill="none"
                stroke="#7b9459"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <g fill={`url(#${leafId})`} stroke="#648b53" strokeWidth="1.2">
                <path d="M133 161Q76 157 62 106Q117 101 133 161Z" />
                <path d="M161 154Q205 108 242 125Q223 166 161 154Z" />
                <path d="M137 135Q99 104 111 69Q152 86 137 135Z" />
                <path d="M171 126Q174 72 213 62Q224 108 171 126Z" />
                <path d="M155 105Q142 67 160 40Q185 77 155 105Z" />
              </g>
              <g fill="none" stroke="#becb8d" strokeWidth="1.6">
                <path d="M129 156l-56-42M166 151l65-22M136 131l-19-51M175 122l32-48M157 96l3-43" />
              </g>
              {stage >= 2 && (
                <>
                  <path
                    d="M154 142q-37-18-64-7M154 138q37-2 59-38"
                    stroke="#82975c"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    d="M118 141Q85 112 64 139Q79 169 118 141Z"
                    fill="#8eac6e"
                  />
                  <path
                    d="M182 130Q207 100 230 107Q233 144 182 130Z"
                    fill="#769b62"
                  />
                  <Bloom x={89} y={130} size={0.8} />
                  <Bloom x={213} y={96} size={0.92} />
                </>
              )}
              <Bloom x={101} y={111} />
              <Bloom x={155} y={80} size={1.09} />
              <Bloom x={191} y={99} size={0.95} />
              {stage === 3 && (
                <>
                  <path
                    d="M148 136Q125 95 82 88M162 134q37 1 66-15"
                    stroke="#82975c"
                    strokeWidth="4"
                    fill="none"
                  />
                  <Bloom x={80} y={85} size={0.8} />
                  <Bloom x={125} y={61} size={0.86} />
                  <Bloom x={232} y={117} size={0.87} />
                  <Bloom x={177} y={53} size={0.75} />
                </>
              )}
              {face(151, 207, 0.7)}
              <path
                d="M146 224q5 5 11-1"
                fill="none"
                stroke="#5d7149"
                strokeWidth="2.3"
                strokeLinecap="round"
              />
            </>
          )}
        </>
      ) : bee ? (
        <>
          <g stroke="#a9c9c0" strokeWidth="1" fill="#edf6e9" opacity=".88">
            <path d="M131 148Q41 158 36 98Q56 58 131 148Z" />
            <path d="M147 144Q196 61 232 83Q259 125 147 144Z" />
            <path d="M121 164Q41 201 40 150Q47 117 121 164Z" />
            <path d="M157 159Q249 115 249 161Q235 199 157 159Z" />
          </g>
          <g stroke="#b4ccc0" fill="none" strokeWidth="1.2">
            <path d="M126 147L49 96M157 142l68-52M113 160l-61-7M162 163l73-5M93 126l-26-4M190 115l21-1" />
          </g>
          <g
            stroke="#526b5c"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeWidth="4"
          >
            <path d="M106 175l-35 28-3 25M102 192l-24 29 5 23M116 210l-15 28 12 13M168 173l29 22 14 20M174 190l30 20 4 24M166 209l21 22-4 18" />
          </g>
          <path
            d="M107 139Q64 155 83 212Q101 251 151 235Q197 214 172 173Q148 137 107 139Z"
            fill={`url(#${bodyId})`}
          />
          <g
            clipPath={`url(#${clipId})`}
            stroke="#345457"
            fill="none"
            strokeWidth="12"
          >
            <path d="M64 164q64 1 110 52M64 192q55-5 100 48M79 218q22-2 49 28" />
          </g>
          <path
            d="M118 161Q100 140 112 121Q137 102 163 124Q184 145 158 173Z"
            fill="#c2a666"
          />
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse
              key={i}
              cx={118 + i * 7}
              cy={126 + Math.sin(i) * 5}
              rx="7"
              ry="9"
              fill={i % 2 ? "#d4bb80" : "#dfca96"}
            />
          ))}
          <path
            d="M123 121Q108 86 137 75Q168 64 186 90Q201 114 177 139Q152 154 123 121Z"
            fill="#d3b77c"
          />
          {face(155, 109, 0.88)}
          <path
            d="M150 129q6 5 12-1"
            fill="none"
            stroke="#8b764c"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M135 80q-17-25-10-43M165 78q18-26 13-43"
            stroke="#4c6d5c"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="126" cy="36" rx="4" ry="6" fill="#739984" />
          <ellipse cx="178" cy="34" rx="4" ry="6" fill="#739984" />
          {stage >= 2 && (
            <>
              <ellipse
                cx="105"
                cy="234"
                rx="7"
                ry="10"
                fill="#e1c35f"
                transform="rotate(-25 105 234)"
              />
              <ellipse cx="194" cy="226" rx="6" ry="9" fill="#e1c35f" />
            </>
          )}
          {stage === 3 && (
            <g stroke="#e7d5a0" strokeWidth="2" fill="none">
              <path d="M117 145l-8-2M114 153l-8 1M164 143l8-5M165 151l9 1M107 165l-7 3" />
            </g>
          )}
        </>
      ) : (
        <>
          <g
            fill={wren ? "#4d8198" : kook ? "#928168" : "#679c7c"}
            stroke={wren ? "#386579" : kook ? "#7e7058" : "#4c7f64"}
            strokeWidth="1"
          >
            {wren ? (
              <>
                <path d="M167 217Q209 147 224 64Q245 63 232 114Q210 193 181 231Z" />
                <path d="M177 224Q222 162 247 102Q261 111 238 151Q207 211 186 234Z" />
              </>
            ) : (
              <>
                <path d="M122 218Q100 240 102 268Q125 262 143 232Z" />
                <path d="M143 226q1 34 15 44q16-27 8-48" />
                <path d="M166 224q22 33 42 37q-1-27-25-47" />
              </>
            )}
            {stage === 3 && (
              <path
                d={
                  wren
                    ? "M167 217Q190 122 193 74Q214 72 208 118Q192 200 178 228Z"
                    : "M111 215q-41 21-38 45q28-5 59-31"
                }
                fill={wren ? "#719eac" : kook ? "#beac87" : "#c0b276"}
              />
            )}
          </g>
          {kook && (
            <g stroke="#6e634e" strokeWidth="5">
              <path d="M106 248l19-6M112 259l11-5M173 244l22 2M178 254l21 4" />
            </g>
          )}
          <g
            stroke="#a48961"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M125 235v20m-1-1l-13 7m14-7l4 10m-4-10l14 4M176 235v20m-1-1l-13 7m14-7l4 10m-4-10l14 4"
              strokeWidth={wren ? 4 : 5}
            />
          </g>
          <path
            d={
              wren
                ? "M111 147Q84 171 97 218Q115 246 153 244Q187 246 194 219Q204 181 181 151Q148 133 111 147Z"
                : kook
                  ? "M108 137Q79 167 91 214Q98 245 147 249Q194 250 205 218Q220 174 187 141Z"
                  : "M113 137Q82 158 90 203Q92 243 146 250Q194 248 205 210Q218 164 186 140Z"
            }
            fill={`url(#${bodyId})`}
          />
          <path
            d={
              wren
                ? "M117 164Q101 187 114 222Q139 246 169 226Q185 207 173 169Z"
                : "M118 163Q101 194 118 228Q143 250 174 227Q188 193 175 162Z"
            }
            fill={kook ? "#e4d7b8" : wren ? "#d1d9bf" : "#e5bc69"}
          />
          {kind === 0 && (
            <path d="M113 160q30-24 67 0l-5 22q-31 11-57-2Z" fill="#df9858" />
          )}
          <path
            d={
              wren
                ? "M107 157Q75 174 103 221Q125 207 122 172Z"
                : "M106 149Q66 168 96 224Q124 204 124 167Z"
            }
            fill={wren ? "#558a94" : kook ? "#988363" : "#4a8467"}
          />
          <path
            d={
              wren
                ? "M183 160Q211 175 185 222Q167 207 170 176Z"
                : "M186 150Q229 172 201 226Q174 205 173 171Z"
            }
            fill={wren ? "#548c9a" : kook ? "#9f8d6c" : "#5b9674"}
          />
          <g
            strokeLinecap="round"
            fill="none"
            strokeWidth="4"
            stroke={wren ? "#92b9b8" : kook ? "#c9b58e" : "#8fba8b"}
          >
            <path d="M96 170q-3 19 10 33M88 177q-1 23 13 34M193 171q10 22-1 37M202 182q5 17-3 30" />
          </g>
          <path
            d={
              kook
                ? "M88 119Q85 76 128 67Q168 48 198 87Q218 114 199 150Q184 167 150 164Q111 165 94 143Z"
                : wren
                  ? "M103 124Q101 87 135 79Q169 66 189 100Q208 124 187 151Q171 167 142 161Q113 159 103 139Z"
                  : "M101 116Q91 74 129 62Q170 48 193 85Q209 117 192 149Q173 167 141 162Q112 159 101 137Z"
            }
            fill={kook ? "#d9c9a3" : wren ? "#79acc1" : "#8198ab"}
          />
          {kook ? (
            <>
              <path
                d="M98 122q22-14 40 1l-2 14q-20-10-34 5M167 120q21-13 34 0l-5 17q-19-10-30-1"
                fill="#857359"
              />
              {face(148, 129, 0.9)}
              <path
                d="M147 143Q189 143 223 160Q190 172 148 163Z"
                fill="#beac7c"
              />
              <path d="M151 160l63 2" stroke="#88764f" strokeWidth="2" />
              <path
                d="M135 72q-15-35-30-27q-1 26 15 35M150 68q0-33 15-35q14 18 7 40"
                fill="#b2a17f"
              />
            </>
          ) : wren ? (
            <>
              <path
                d="M107 127q18-14 29-3l-1 17q-15-7-25 3M164 126q14-11 28-1l-3 16q-12-9-24-1"
                fill="#3c6b7b"
              />
              {face(149, 130, 0.79)}
              <path d="M142 145l31 7-29 7Z" fill="#405b58" />
              <path d="M136 83q11-25 31-17q-1 16-18 24" fill="#8dbbc6" />
              {stage >= 2 && (
                <path
                  d="M109 103Q87 94 90 80Q113 79 122 99M182 101q19-24 33-16q-4 22-27 31"
                  fill="#9ac6c8"
                />
              )}
            </>
          ) : (
            <>
              {face(149, 126, 0.94)}
              <path
                d="M140 145Q165 138 168 156Q168 171 152 179Q158 162 141 162Z"
                fill="#dba050"
              />
              <path
                d="M147 158q8-4 14 0"
                stroke="#a7773e"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M123 72Q111 53 122 49Q136 49 143 65M145 64Q143 42 156 40Q170 49 166 67"
                fill="#a299c4"
              />
              {stage >= 2 && (
                <path d="M165 70Q177 48 188 53Q191 66 181 81" fill="#b7b08e" />
              )}
              {stage === 3 && (
                <path d="M116 76q-22-13-25-3q6 14 26 17" fill="#c6b777" />
              )}
            </>
          )}
          {kook && (
            <g stroke="#ac9774" strokeWidth="2" strokeLinecap="round">
              <path d="M135 188l-2 14M147 191v16M159 189l3 15M142 214l-1 10M155 216l2 11" />
            </g>
          )}
        </>
      )}
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
