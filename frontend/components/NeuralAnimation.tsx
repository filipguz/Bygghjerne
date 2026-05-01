"use client";

const layers = [
  [{ x: 70, y: 80 }, { x: 70, y: 155 }, { x: 70, y: 230 }],
  [{ x: 210, y: 50 }, { x: 210, y: 115 }, { x: 210, y: 185 }, { x: 210, y: 250 }],
  [{ x: 350, y: 80 }, { x: 350, y: 155 }, { x: 350, y: 230 }],
  [{ x: 460, y: 120 }, { x: 460, y: 195 }],
];

interface Connection {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

const connections: Connection[] = [];
for (let l = 0; l < layers.length - 1; l++) {
  for (const from of layers[l]) {
    for (const to of layers[l + 1]) {
      connections.push({ from, to });
    }
  }
}

export default function NeuralAnimation() {
  return (
    <svg
      viewBox="0 0 530 300"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        {connections.map((_, i) => (
          <path
            key={i}
            id={`p${i}`}
            d={`M ${connections[i].from.x} ${connections[i].from.y} L ${connections[i].to.x} ${connections[i].to.y}`}
            fill="none"
          />
        ))}
      </defs>

      {/* Connection lines */}
      {connections.map((c, i) => (
        <line
          key={i}
          x1={c.from.x} y1={c.from.y}
          x2={c.to.x} y2={c.to.y}
          stroke="#bae6fd"
          strokeWidth="1"
          opacity="0.45"
        />
      ))}

      {/* Animated data particles */}
      {connections.map((_, i) => (
        <circle key={i} r="2.5" fill="#38bdf8" opacity="0.9">
          <animateMotion
            dur={`${1.8 + (i % 9) * 0.25}s`}
            repeatCount="indefinite"
            begin={`-${(i * 0.37) % 3}s`}
          >
            <mpath href={`#p${i}`} />
          </animateMotion>
        </circle>
      ))}

      {/* Nodes */}
      {layers.flat().map((n, i) => (
        <g key={i}>
          {/* Outer pulse */}
          <circle cx={n.x} cy={n.y} r="13" fill="#0ea5e9" opacity="0.08">
            <animate
              attributeName="r"
              values="11;16;11"
              dur={`${2.4 + (i % 5) * 0.4}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.08;0.18;0.08"
              dur={`${2.4 + (i % 5) * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
          {/* Mid ring */}
          <circle cx={n.x} cy={n.y} r="8" fill="#0284c7" opacity="0.25" />
          {/* Core */}
          <circle cx={n.x} cy={n.y} r="5" fill="#0ea5e9" opacity="0.9" />
        </g>
      ))}

      {/* Output glow */}
      {layers[layers.length - 1].map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="9" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.8s" repeatCount="indefinite" begin={`${i * 0.9}s`} />
        </circle>
      ))}
    </svg>
  );
}
