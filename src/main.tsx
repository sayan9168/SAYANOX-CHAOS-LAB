import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { createPoints, normalizeParams, type SimulationParams, wrap } from './simulation';

type Preset = { name: string; params: SimulationParams };

const presets: Preset[] = [
  { name: 'Balanced', params: { gravity: 0.55, population: 70, randomness: 0.35, speed: 1 } },
  { name: 'Storm', params: { gravity: 0.15, population: 120, randomness: 0.9, speed: 1.8 } },
  { name: 'Order', params: { gravity: 0.9, population: 45, randomness: 0.05, speed: 0.6 } },
];

const parameterKeys = ['gravity', 'population', 'randomness', 'speed'] as const;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState<SimulationParams>(presets[0].params);
  const [running, setRunning] = useState(true);
  const [count, setCount] = useState(presets[0].params.population);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let lastCount = -1;
    let points = createPoints(140, 800, 500);

    const resizeCanvas = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.floor(width * ratio);
      const pixelHeight = Math.floor(height * ratio);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      return { width, height };
    };

    const draw = () => {
      const { width, height } = resizeCanvas();
      const n = params.population;
      context.fillStyle = '#070a11';
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < n; i += 1) {
        const point = points[i];
        let ax = 0;
        let ay = params.gravity * 0.12;

        for (let j = 0; j < n; j += 1) {
          if (i === j) continue;
          const other = points[j];
          const dx = other.x - point.x;
          const dy = other.y - point.y;
          const distanceSquared = dx * dx + dy * dy;

          if (distanceSquared > 25 && distanceSquared < 18000) {
            const force = (params.gravity * 0.02) / Math.sqrt(distanceSquared);
            ax += dx * force;
            ay += dy * force;
          }
        }

        point.vx += ax + (Math.random() - 0.5) * params.randomness * 0.08;
        point.vy += ay + (Math.random() - 0.5) * params.randomness * 0.08;
        point.vx *= 0.995;
        point.vy *= 0.995;
        point.x = wrap(point.x + point.vx * params.speed, width);
        point.y = wrap(point.y + point.vy * params.speed, height);
      }

      for (let i = 0; i < n; i += 1) {
        const point = points[i];
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(110,220,255,.85)';
        context.fill();
      }

      if (lastCount !== n) {
        lastCount = n;
        setCount(n);
      }

      if (running) animationFrame = requestAnimationFrame(draw);
    };

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [params, running]);

  const update = (key: keyof SimulationParams, value: number) => {
    setParams((current) => normalizeParams({ ...current, [key]: value }));
  };

  const applyPreset = (preset: Preset) => setParams(normalizeParams(preset.params));

  return (
    <main>
      <header>
        <div>
          <span className="eyebrow">SAYANOX / EXPERIMENTAL SYSTEMS</span>
          <h1>CHAOS <i>LAB</i></h1>
          <p>Change the rules. Watch the system break.</p>
        </div>
        <button type="button" onClick={() => setRunning((current) => !current)}>
          {running ? 'PAUSE' : 'RESUME'}
        </button>
      </header>

      <section className="lab">
        <div className="canvasWrap">
          <canvas ref={canvasRef} aria-label="Live chaos particle simulation" />
          <div className="badge">● LIVE SIMULATION</div>
        </div>

        <aside>
          <h2>CONTROL DECK</h2>
          {parameterKeys.map((key) => {
            const isPopulation = key === 'population';
            const isSpeed = key === 'speed';
            const max = isPopulation ? 140 : isSpeed ? 3 : 1;
            const min = isPopulation ? 10 : 0;
            const step = isPopulation ? 1 : 0.01;

            return (
              <label key={key}>
                <span>
                  {key}
                  <b>{params[key]}</b>
                </span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={params[key]}
                  aria-label={`${key} control`}
                  onChange={(event) => update(key, Number(event.target.value))}
                />
              </label>
            );
          })}

          <h3>PRESETS</h3>
          <div className="presets">
            {presets.map((preset) => (
              <button type="button" key={preset.name} onClick={() => applyPreset(preset)}>
                {preset.name}
              </button>
            ))}
          </div>

          <div className="stats">
            <span>AGENTS <b>{count}</b></span>
            <span>MODE <b>PARTICLE</b></span>
            <span>ENGINE <b>CLIENT</b></span>
          </div>
        </aside>
      </section>

      <footer>
        <span>v1.0.1 • browser simulation engine</span>
        <span>100% browser-based • no API • no backend</span>
      </footer>
    </main>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root was not found.');

createRoot(rootElement).render(<App />);
