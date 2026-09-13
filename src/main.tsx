import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { createPoints, normalizeParams, type SimulationParams, wrap } from './simulation';

type Preset = { name: string; params: SimulationParams };

type Point = ReturnType<typeof createPoints>[number];

const presets: Preset[] = [
  { name: 'Balanced', params: { gravity: 0.55, population: 70, randomness: 0.35, speed: 1 } },
  { name: 'Storm', params: { gravity: 0.15, population: 120, randomness: 0.9, speed: 1.8 } },
  { name: 'Order', params: { gravity: 0.9, population: 45, randomness: 0.05, speed: 0.6 } },
  { name: 'Singularity', params: { gravity: 1, population: 100, randomness: 0.12, speed: 2.4 } },
];

const parameterKeys = ['gravity', 'population', 'randomness', 'speed'] as const;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const paramsRef = useRef<SimulationParams>(presets[0].params);
  const runningRef = useRef(true);
  const trailsRef = useRef(true);
  const attractorsRef = useRef(true);
  const [params, setParams] = useState<SimulationParams>(presets[0].params);
  const [running, setRunning] = useState(true);
  const [trails, setTrails] = useState(true);
  const [attractors, setAttractors] = useState(true);
  const [fps, setFps] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [seed, setSeed] = useState(1);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    trailsRef.current = trails;
  }, [trails]);

  useEffect(() => {
    attractorsRef.current = attractors;
  }, [attractors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let lastTime = performance.now();
    let fpsAccumulator = 0;
    let fpsFrames = 0;
    let lastFpsUpdate = lastTime;
    let width = 1;
    let height = 1;
    pointsRef.current = createPoints(180, 800, 500);

    const resizeCanvas = () => {
      width = Math.max(1, canvas.clientWidth);
      height = Math.max(1, canvas.clientHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.floor(width * ratio);
      const pixelHeight = Math.floor(height * ratio);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const resetPoints = () => {
      pointsRef.current = createPoints(180, Math.max(width, 320), Math.max(height, 320));
    };

    const draw = (now: number) => {
      const current = paramsRef.current;
      const dt = Math.min(32, Math.max(1, now - lastTime));
      lastTime = now;
      resizeCanvas();
      const points = pointsRef.current;
      const n = Math.min(current.population, points.length);
      const centerX = width / 2;
      const centerY = height / 2;

      if (trailsRef.current) {
        context.fillStyle = 'rgba(5, 7, 11, 0.18)';
      } else {
        context.fillStyle = '#05070b';
      }
      context.fillRect(0, 0, width, height);

      let totalEnergy = 0;
      for (let i = 0; i < n; i += 1) {
        const point = points[i];
        let ax = 0;
        let ay = current.gravity * 0.12;

        for (let j = 0; j < n; j += 1) {
          if (i === j) continue;
          const other = points[j];
          const dx = other.x - point.x;
          const dy = other.y - point.y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared > 25 && distanceSquared < 18000) {
            const force = (current.gravity * 0.02) / Math.sqrt(distanceSquared);
            ax += dx * force;
            ay += dy * force;
          }
        }

        if (attractorsRef.current) {
          const dx = centerX - point.x;
          const dy = centerY - point.y;
          const distance = Math.max(50, Math.hypot(dx, dy));
          const pull = (current.gravity * 0.018) / distance;
          ax += dx * pull;
          ay += dy * pull;
        }

        point.vx += ax * (dt / 16.67) + (Math.random() - 0.5) * current.randomness * 0.08;
        point.vy += ay * (dt / 16.67) + (Math.random() - 0.5) * current.randomness * 0.08;
        point.vx *= 0.995;
        point.vy *= 0.995;
        point.x = wrap(point.x + point.vx * current.speed * (dt / 16.67), width);
        point.y = wrap(point.y + point.vy * current.speed * (dt / 16.67), height);
        totalEnergy += point.vx * point.vx + point.vy * point.vy;
      }

      if (attractorsRef.current) {
        const pulse = 5 + Math.sin(now / 300) * 2;
        context.beginPath();
        context.arc(centerX, centerY, pulse, 0, Math.PI * 2);
        context.fillStyle = 'rgba(103,220,255,.8)';
        context.fill();
        context.beginPath();
        context.arc(centerX, centerY, 24 + pulse, 0, Math.PI * 2);
        context.strokeStyle = 'rgba(103,220,255,.16)';
        context.stroke();
      }

      for (let i = 0; i < n; i += 1) {
        const point = points[i];
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(110,220,255,.9)';
        context.fill();
      }

      fpsAccumulator += 1000 / dt;
      fpsFrames += 1;
      if (now - lastFpsUpdate > 500) {
        setFps(Math.round(fpsAccumulator / fpsFrames));
        setEnergy(Math.round(totalEnergy * 10) / 10);
        fpsAccumulator = 0;
        fpsFrames = 0;
        lastFpsUpdate = now;
      }

      if (runningRef.current) animationFrame = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resizeCanvas();
      if (pointsRef.current.length === 0) resetPoints();
    };

    resizeCanvas();
    window.addEventListener('resize', handleResize);
    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [seed]);

  const update = (key: keyof SimulationParams, value: number) => {
    setParams((current) => normalizeParams({ ...current, [key]: value }));
  };

  const applyPreset = (preset: Preset) => setParams(normalizeParams(preset.params));

  const reset = () => setSeed((current) => current + 1);

  const randomize = () => {
    setParams(normalizeParams({
      gravity: Math.random(),
      population: Math.round(30 + Math.random() * 110),
      randomness: Math.random(),
      speed: 0.4 + Math.random() * 2.6,
    }));
    reset();
  };

  const exportSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'sayanox-chaos-lab.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const toggleFullscreen = async () => {
    const target = canvasRef.current?.parentElement;
    if (!target) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (target.requestFullscreen) {
      await target.requestFullscreen();
    }
  };

  return (
    <main>
      <header>
        <div>
          <span className="eyebrow">SAYANOX / EXPERIMENTAL SYSTEMS</span>
          <h1>CHAOS <i>LAB</i></h1>
          <p>Change the rules. Watch the system break.</p>
        </div>
        <button className="primary" type="button" onClick={() => setRunning((current) => !current)}>
          {running ? 'PAUSE' : 'RESUME'}
        </button>
      </header>

      <section className="lab">
        <div className="canvasWrap">
          <canvas ref={canvasRef} aria-label="Live chaos particle simulation" />
          <div className="badge">● {running ? 'LIVE' : 'PAUSED'} SIMULATION</div>
          <div className="canvasTools">
            <button type="button" onClick={reset}>RESET</button>
            <button type="button" onClick={randomize}>RANDOMIZE</button>
            <button type="button" onClick={exportSnapshot}>EXPORT PNG</button>
            <button type="button" onClick={toggleFullscreen}>FULLSCREEN</button>
          </div>
        </div>

        <aside>
          <h2>CONTROL DECK</h2>
          {parameterKeys.map((key) => {
            const isPopulation = key === 'population';
            const isSpeed = key === 'speed';
            const max = isPopulation ? 180 : isSpeed ? 3 : 1;
            const min = isPopulation ? 10 : 0;
            const step = isPopulation ? 1 : 0.01;
            return (
              <label key={key}>
                <span>{key}<b>{params[key]}</b></span>
                <input type="range" min={min} max={max} step={step} value={params[key]} aria-label={`${key} control`} onChange={(event) => update(key, Number(event.target.value))} />
              </label>
            );
          })}

          <div className="switches">
            <button type="button" aria-pressed={trails} onClick={() => setTrails((value) => !value)}>TRAILS {trails ? 'ON' : 'OFF'}</button>
            <button type="button" aria-pressed={attractors} onClick={() => setAttractors((value) => !value)}>CORE {attractors ? 'ON' : 'OFF'}</button>
          </div>

          <h3>PRESETS</h3>
          <div className="presets">
            {presets.map((preset) => <button type="button" key={preset.name} onClick={() => applyPreset(preset)}>{preset.name}</button>)}
          </div>

          <div className="stats">
            <span>AGENTS <b>{params.population}</b></span>
            <span>FPS <b>{fps || '—'}</b></span>
            <span>ENERGY <b>{energy || '—'}</b></span>
            <span>ENGINE <b>CANVAS 2D</b></span>
            <span>NETWORK <b>OFFLINE</b></span>
          </div>
        </aside>
      </section>

      <footer>
        <span>v2.0.0 • interactive chaos engine</span>
        <span>100% browser-based • no API • no backend</span>
      </footer>
    </main>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root was not found.');
createRoot(rootElement).render(<App />);
