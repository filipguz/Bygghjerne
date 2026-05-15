// Static decorative SVG — no client JS needed
type Node = { x: number; y: number; r: number; coral: boolean; delay: number; dur: number }

const NODES: Node[] = [
  // far left
  { x: 40,   y: 130, r: 2.5, coral: false, delay: 0,    dur: 3.2 },
  { x: 100,  y: 300, r: 2,   coral: false, delay: 1.4,  dur: 2.8 },
  { x: 60,   y: 450, r: 3,   coral: true,  delay: 2.6,  dur: 3.5 },
  // left cluster
  { x: 190,  y: 70,  r: 2,   coral: false, delay: 0.7,  dur: 3.0 },
  { x: 230,  y: 210, r: 4,   coral: false, delay: 1.9,  dur: 2.6 },
  { x: 170,  y: 380, r: 2.5, coral: false, delay: 0.3,  dur: 3.4 },
  { x: 280,  y: 330, r: 3,   coral: true,  delay: 2.2,  dur: 3.1 },
  // left-center
  { x: 370,  y: 55,  r: 2,   coral: false, delay: 1.0,  dur: 2.9 },
  { x: 390,  y: 190, r: 3,   coral: false, delay: 1.6,  dur: 3.3 },
  { x: 340,  y: 460, r: 2.5, coral: false, delay: 0.5,  dur: 2.7 },
  { x: 460,  y: 310, r: 4,   coral: false, delay: 2.8,  dur: 3.6 },
  { x: 490,  y: 110, r: 2,   coral: false, delay: 1.2,  dur: 3.0 },
  // center-left
  { x: 560,  y: 250, r: 3.5, coral: true,  delay: 0.2,  dur: 2.8 },
  { x: 620,  y: 70,  r: 2,   coral: false, delay: 1.8,  dur: 3.2 },
  { x: 580,  y: 420, r: 3,   coral: false, delay: 0.9,  dur: 2.6 },
  // center
  { x: 700,  y: 170, r: 2.5, coral: false, delay: 2.4,  dur: 3.4 },
  { x: 720,  y: 360, r: 2,   coral: false, delay: 1.5,  dur: 3.0 },
  { x: 660,  y: 490, r: 3,   coral: false, delay: 0.6,  dur: 2.8 },
  // center-right
  { x: 810,  y: 90,  r: 3,   coral: false, delay: 0.4,  dur: 3.1 },
  { x: 840,  y: 270, r: 4,   coral: true,  delay: 2.0,  dur: 2.9 },
  { x: 790,  y: 440, r: 2,   coral: false, delay: 2.7,  dur: 3.5 },
  { x: 900,  y: 180, r: 2.5, coral: false, delay: 0.8,  dur: 3.2 },
  { x: 920,  y: 390, r: 3,   coral: false, delay: 1.3,  dur: 2.7 },
  // right
  { x: 1000, y: 60,  r: 2,   coral: false, delay: 2.1,  dur: 3.0 },
  { x: 1020, y: 210, r: 3.5, coral: false, delay: 0.5,  dur: 3.3 },
  { x: 980,  y: 360, r: 2,   coral: true,  delay: 1.7,  dur: 2.8 },
  { x: 1080, y: 290, r: 3,   coral: false, delay: 0.1,  dur: 3.6 },
  { x: 1060, y: 460, r: 2.5, coral: false, delay: 2.3,  dur: 3.1 },
  // far right
  { x: 1160, y: 100, r: 2,   coral: false, delay: 0.9,  dur: 2.9 },
  { x: 1180, y: 290, r: 3,   coral: false, delay: 1.6,  dur: 3.4 },
  { x: 1140, y: 440, r: 2.5, coral: true,  delay: 0.4,  dur: 3.0 },
  { x: 1240, y: 200, r: 2,   coral: false, delay: 2.5,  dur: 3.2 },
  { x: 1250, y: 380, r: 3,   coral: false, delay: 1.1,  dur: 2.7 },
]

type Edge = { i: number; j: number; len: number }
const THRESHOLD = 230
const edges: Edge[] = []
for (let i = 0; i < NODES.length; i++) {
  for (let j = i + 1; j < NODES.length; j++) {
    const dx = NODES[i].x - NODES[j].x
    const dy = NODES[i].y - NODES[j].y
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len < THRESHOLD) edges.push({ i, j, len: Math.ceil(len) })
  }
}

export default function NeuralNetworkBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <svg
        viewBox="0 0 1300 520"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Base lines */}
        {edges.map(({ i, j, len }, idx) => {
          const lineDur  = 3 + (idx % 7) * 0.6
          const lineDelay = ((NODES[i].delay + NODES[j].delay) / 2 + idx * 0.11) % 6

          // every 4th edge gets a traveling signal
          const hasSignal = idx % 4 === 0
          const sigDur    = 2.5 + (idx % 5) * 0.9
          const sigDelay  = (idx * 0.83) % 9

          return (
            <g key={`e${i}-${j}`}>
              <line
                x1={NODES[i].x} y1={NODES[i].y}
                x2={NODES[j].x} y2={NODES[j].y}
                stroke="rgba(147,183,255,1)"
                strokeWidth="0.7"
                className="nn-line"
                style={{ animationDuration: `${lineDur}s`, animationDelay: `${lineDelay}s` }}
              />
              {hasSignal && (
                <line
                  x1={NODES[i].x} y1={NODES[i].y}
                  x2={NODES[j].x} y2={NODES[j].y}
                  stroke={NODES[i].coral || NODES[j].coral ? 'rgba(255,94,61,0.7)' : 'rgba(147,183,255,0.8)'}
                  strokeWidth="1.2"
                  strokeDasharray={`7 ${len + 30}`}
                  strokeDashoffset={len + 30}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from={len + 30}
                    to={-(len + 30)}
                    dur={`${sigDur}s`}
                    begin={`${sigDelay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.08;0.92;1"
                    dur={`${sigDur}s`}
                    begin={`${sigDelay}s`}
                    repeatCount="indefinite"
                  />
                </line>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {NODES.map((n, i) => (
          <g key={`n${i}`}>
            {/* Expanding ring on coral nodes */}
            {n.coral && (
              <circle
                cx={n.x} cy={n.y} r={n.r * 1.2}
                fill="none"
                stroke="rgba(255,94,61,0.6)"
                strokeWidth="0.8"
                className="nn-ring"
                style={{ animationDuration: `${n.dur + 0.5}s`, animationDelay: `${n.delay}s` }}
              />
            )}
            {/* Node body */}
            <circle
              cx={n.x} cy={n.y} r={n.r}
              fill={n.coral ? '#ff5e3d' : '#93b7ff'}
              className="nn-node"
              style={{ animationDuration: `${n.dur}s`, animationDelay: `${n.delay}s` }}
            />
          </g>
        ))}
      </svg>

      {/* Gradient fade — top and bottom — so content reads cleanly */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(6,9,26,0.4) 0%, transparent 30%, transparent 70%, rgba(6,9,26,0.8) 100%)',
        }}
      />
    </div>
  )
}
