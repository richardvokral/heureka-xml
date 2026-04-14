import { useState, useEffect, useRef, useCallback } from 'react';

const DB_MIN = 20;
const DB_MAX = 130;
const HISTORY_SECONDS = 30;
const HISTORY_FPS = 10;
const HISTORY_LENGTH = HISTORY_SECONDS * HISTORY_FPS;

function clampDb(db: number): number {
  return Math.max(DB_MIN, Math.min(DB_MAX, db));
}

function getDbColor(db: number): string {
  if (db < 50) return '#22c55e';
  if (db < 70) return '#84cc16';
  if (db < 85) return '#eab308';
  if (db < 100) return '#f97316';
  return '#ef4444';
}

function getDbLabel(db: number): string {
  if (db < 30) return 'Ticho';
  if (db < 50) return 'Klidné prostředí';
  if (db < 60) return 'Normální hovor';
  if (db < 70) return 'Hlučnější prostředí';
  if (db < 80) return 'Hlasitá hudba';
  if (db < 90) return 'Velmi hlasité';
  if (db < 100) return 'Nebezpečná hlasitost';
  return 'Extrémní hlasitost!';
}

export function DecibelMeter() {
  const [db, setDb] = useState(0);
  const [minDb, setMinDb] = useState(DB_MAX);
  const [maxDb, setMaxDb] = useState(DB_MIN);
  const [avgDb, setAvgDb] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const samplesRef = useRef<number[]>([]);
  const historyRef = useRef<number[]>([]);
  const lastHistoryPush = useRef(0);

  const analyze = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sumSquares += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    const dbValue = rms > 0 ? 20 * Math.log10(rms) + 94 : DB_MIN;
    const clamped = clampDb(dbValue);

    setDb(clamped);
    samplesRef.current.push(clamped);

    setMinDb((prev) => Math.min(prev, clamped));
    setMaxDb((prev) => Math.max(prev, clamped));

    const samples = samplesRef.current;
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    setAvgDb(avg);

    const now = performance.now();
    if (now - lastHistoryPush.current > 1000 / HISTORY_FPS) {
      lastHistoryPush.current = now;
      historyRef.current.push(clamped);
      if (historyRef.current.length > HISTORY_LENGTH) {
        historyRef.current.shift();
      }
      setHistory([...historyRef.current]);
    }

    rafRef.current = requestAnimationFrame(analyze);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      streamRef.current = stream;
      samplesRef.current = [];
      historyRef.current = [];
      lastHistoryPush.current = 0;

      setMinDb(DB_MAX);
      setMaxDb(DB_MIN);
      setAvgDb(0);
      setHistory([]);
      setIsRunning(true);

      rafRef.current = requestAnimationFrame(analyze);
    } catch {
      setError('Přístup k mikrofonu byl zamítnut. Povolte mikrofon v nastavení prohlížeče.');
    }
  }, [analyze]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    };
  }, []);

  // Draw history graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    const gridLevels = [30, 50, 70, 90, 110];
    for (const level of gridLevels) {
      const y = h - ((level - DB_MIN) / (DB_MAX - DB_MIN)) * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${level}`, 2, y - 2);
    }

    // Draw line
    const step = w / (HISTORY_LENGTH - 1);
    const startIdx = HISTORY_LENGTH - history.length;

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    for (let i = 0; i < history.length; i++) {
      const x = (startIdx + i) * step;
      const y = h - ((history[i] - DB_MIN) / (DB_MAX - DB_MIN)) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = getDbColor(history[history.length - 1]);
    ctx.stroke();

    // Fill area under line
    const lastX = (startIdx + history.length - 1) * step;
    const firstX = startIdx * step;
    ctx.lineTo(lastX, h);
    ctx.lineTo(firstX, h);
    ctx.closePath();
    ctx.fillStyle = getDbColor(history[history.length - 1]) + '15';
    ctx.fill();
  }, [history]);

  const meterPercent = ((clampDb(db) - DB_MIN) / (DB_MAX - DB_MIN)) * 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Měřič hluku (dB)</h1>
        <a
          href="#/"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Heureka XML Editor
        </a>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-6 max-w-lg mx-auto w-full gap-6">
        {error && (
          <div className="w-full bg-red-900/50 border border-red-700 rounded-lg p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Main dB display */}
        <div className="text-center">
          <div
            className="text-8xl sm:text-9xl font-bold tabular-nums leading-none"
            style={{ color: isRunning ? getDbColor(db) : '#6b7280' }}
          >
            {isRunning ? Math.round(db) : '--'}
          </div>
          <div className="text-2xl text-gray-400 mt-1">dB</div>
          <div
            className="text-sm mt-2 font-medium"
            style={{ color: isRunning ? getDbColor(db) : '#6b7280' }}
          >
            {isRunning ? getDbLabel(db) : 'Měření zastaveno'}
          </div>
        </div>

        {/* Meter bar */}
        <div className="w-full">
          <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: isRunning ? `${meterPercent}%` : '0%',
                backgroundColor: getDbColor(db),
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
            <span>{DB_MIN}</span>
            <span>50</span>
            <span>70</span>
            <span>90</span>
            <span>110</span>
            <span>{DB_MAX}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 uppercase">Min</div>
            <div className="text-xl font-bold tabular-nums text-blue-400">
              {isRunning && minDb < DB_MAX ? Math.round(minDb) : '--'}
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 uppercase">Průměr</div>
            <div className="text-xl font-bold tabular-nums text-yellow-400">
              {isRunning && avgDb > 0 ? Math.round(avgDb) : '--'}
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 uppercase">Max</div>
            <div className="text-xl font-bold tabular-nums text-red-400">
              {isRunning && maxDb > DB_MIN ? Math.round(maxDb) : '--'}
            </div>
          </div>
        </div>

        {/* History graph */}
        <div className="w-full bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-2">
            Průběh ({HISTORY_SECONDS}s)
          </div>
          <canvas
            ref={canvasRef}
            className="w-full h-32 sm:h-40"
            style={{ display: 'block' }}
          />
          {!isRunning && history.length === 0 && (
            <div className="text-center text-gray-600 text-sm py-8">
              Spusťte měření pro zobrazení grafu
            </div>
          )}
        </div>

        {/* Start / Stop button */}
        <button
          onClick={isRunning ? stop : start}
          className={`w-full py-4 rounded-xl text-lg font-bold transition-colors ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isRunning ? 'Zastavit měření' : 'Spustit měření'}
        </button>

        <p className="text-xs text-gray-600 text-center">
          Hodnoty jsou orientační a závisí na kvalitě mikrofonu vašeho zařízení.
          Pro přesné měření použijte kalibrovaný měřič.
        </p>
      </div>
    </div>
  );
}
