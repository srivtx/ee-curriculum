'use client';

import * as React from 'react';
import { Play, RotateCcw, AlertCircle, Loader2, Cpu, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── yosys types (from @yowasp/yosys/lib/api.d.ts) ─────────────────────────
type YosysTree = { [name: string]: YosysTree | string | Uint8Array };
type YosysRun = (
  args?: string[],
  files?: YosysTree,
  options?: {
    stdin?: (() => Uint8Array | null) | null;
    stdout?: ((bytes: Uint8Array | null) => void) | null;
    stderr?: ((bytes: Uint8Array | null) => void) | null;
    decodeASCII?: boolean;
    synchronously?: boolean;
  },
) => Promise<YosysTree>;

const DEFAULT_COUNTER = `// 4-bit synchronous up-counter with synchronous reset.
// Classic Phase 4 Module 4 example — try toggling reset and watching count.
module counter(
    input  wire clk,
    input  wire rst,
    output reg [3:0] count
);
    always @(posedge clk) begin
        if (rst)        count <= 4'b0000;
        else            count <= count + 1'b1;
    end
endmodule

// Tiny testbench (ignored by yosys synth but kept for reference).
module tb;
    reg clk = 0;
    reg rst = 1;
    wire [3:0] count;
    counter dut(.clk(clk), .rst(rst), .count(count));
    initial begin
        #10  rst = 0;
        #200 $display("count=%0d", count);
        $finish;
    end
    always #5 clk = ~clk;
endmodule
`;

interface SynthResult {
  log: string;
  netlistJson: any | null;
  stats: {
    cells: number;
    wires: number;
    ports: number;
    cellTypes: { type: string; count: number }[];
    modules: string[];
    inputs: string[];
    outputs: string[];
  } | null;
}

export interface VerilogPlaygroundProps {
  /** Initial Verilog source shown in the editor. */
  initialCode?: string;
}

type RunState = 'idle' | 'loading' | 'running' | 'done' | 'error';

export function VerilogPlayground({ initialCode = DEFAULT_COUNTER }: VerilogPlaygroundProps) {
  const [code, setCode] = React.useState<string>(initialCode);
  const [state, setState] = React.useState<RunState>('idle');
  const [result, setResult] = React.useState<SynthResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCode(initialCode);
    setState('idle');
    setResult(null);
    setError(null);
  }, [initialCode]);

  async function handleRun() {
    setState('loading');
    setError(null);
    setResult(null);
    let log = '';
    try {
      // Lazy-load yosys — 12 MB WASM, only fetched when the user actually
      // clicks Run. Cached on subsequent runs.
      const yosysModule: any = await import('@yowasp/yosys');
      const runYosys: YosysRun = yosysModule.runYosys ?? yosysModule.default?.runYosys;
      if (typeof runYosys !== 'function') {
        throw new Error('@yowasp/yosys did not export runYosys');
      }
      setState('running');

      // Strip any testbench modules — yosys synth on `tb` would fail because
      // it has no outputs. Synthesize only modules with explicit outputs.
      // We pass top.v and ask yosys to synth the `counter` module (or the
      // first module encountered). User code can override with `// TOP=name`.
      const topMatch = code.match(/\/\/\s*TOP\s*=\s*(\w+)/);
      const topName = topMatch?.[1] ?? guessTopModule(code) ?? 'counter';

      const args = [
        '-q',                       // quiet: only emit explicit log lines
        '-p', `synth -json top.json -top ${topName}`,
        'top.v',
      ];
      const files: YosysTree = { 'top.v': code };
      const outputs = await runYosys(args, files, {
        stdout: (b) => { if (b) log += new TextDecoder().decode(b); },
        stderr: (b) => { if (b) log += new TextDecoder().decode(b); },
        decodeASCII: true,
      });

      // Read out the synthesized JSON
      let netlistJson: any = null;
      const topJson = outputs['top.json'];
      if (topJson instanceof Uint8Array) {
        try {
          netlistJson = JSON.parse(new TextDecoder().decode(topJson));
        } catch {
          /* malformed */
        }
      } else if (typeof topJson === 'string') {
        try { netlistJson = JSON.parse(topJson); } catch { /* malformed */ }
      }

      const stats = netlistJson ? summarizeNetlist(netlistJson, topName) : null;
      setResult({ log, netlistJson, stats });
      setState('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`${msg}\n\n--- yosys output so far ---\n${log}`);
      setState('error');
    }
  }

  function handleReset() {
    setCode(initialCode);
    setState('idle');
    setResult(null);
    setError(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.substring(0, start) + '  ' + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }

  const isBusy = state === 'loading' || state === 'running';

  return (
    <div className="overflow-hidden rounded-lg border border-ee-red/30 bg-background">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-ee-red/8 px-3 py-2">
        <Cpu className="h-4 w-4 text-ee-red" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-ee-red">
          Verilog Playground
        </span>
        <span className="text-[10px] text-muted-foreground">
          (@yowasp/yosys · real Yosys in WASM · ~12 MB on first run)
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={isBusy}
            className="h-7 gap-1 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isBusy}
            className="h-7 gap-1 bg-ee-red px-3 text-xs font-semibold text-white hover:bg-ee-red/90"
          >
            {state === 'loading' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading Yosys…
              </>
            ) : state === 'running' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Synthesizing…
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Synthesize
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
        {/* Editor */}
        <div className="relative border-b border-border/40 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/15 px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <FileCode className="h-3 w-3" aria-hidden />
            counter.v
          </div>
          <div className="flex items-stretch">
            <div
              aria-hidden
              className="ee-mono select-none bg-muted/30 px-2 py-2 text-right text-[11px] leading-[1.55] text-muted-foreground/60"
            >
              {code.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="ee-code-editor flex-1 resize-y bg-background px-3 py-2 text-foreground outline-none"
              style={{ minHeight: '320px' }}
              aria-label="Verilog source editor"
            />
          </div>
        </div>

        {/* Output */}
        <div className="bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
            <span className="ee-mono text-[10px] uppercase tracking-wider text-zinc-400">
              Yosys Output
            </span>
            <span className="text-[10px] text-zinc-500">
              {state === 'done' && result?.stats
                ? `${result.stats.cells} cells · ${result.stats.modules.length} module(s)`
                : '—'}
            </span>
          </div>
          <div className="ee-scroll max-h-[420px] overflow-y-auto">
            {state === 'idle' && (
              <div className="px-3 py-4 text-[11px] text-zinc-500">
                Press <span className="text-zinc-300">Synthesize</span> to run
                Yosys on your Verilog. First run downloads ~12 MB of WASM —
                subsequent runs are fast.
              </div>
            )}
            {state === 'error' && (
              <div className="flex items-start gap-2 px-3 py-2 text-[11px] text-red-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <pre className="ee-mono whitespace-pre-wrap">{error}</pre>
              </div>
            )}
            {state === 'done' && result && (
              <>
                {result.stats && (
                  <div className="border-b border-zinc-800 px-3 py-2.5">
                    <div className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-400">
                      Synthesis summary
                    </div>
                    <div className="mb-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <div>
                        <span className="text-zinc-500">Top module:</span>{' '}
                        <span className="ee-mono text-zinc-200">{result.stats.modules[0] ?? '—'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Total cells:</span>{' '}
                        <span className="ee-mono text-zinc-200">{result.stats.cells}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Inputs:</span>{' '}
                        <span className="ee-mono text-zinc-200">{result.stats.inputs.join(', ') || '—'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Outputs:</span>{' '}
                        <span className="ee-mono text-zinc-200">{result.stats.outputs.join(', ') || '—'}</span>
                      </div>
                    </div>
                    {result.stats.cellTypes.length > 0 && (
                      <>
                        <div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-400">
                          Cell breakdown
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {result.stats.cellTypes.map((c) => (
                            <span
                              key={c.type}
                              className="ee-mono rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-300"
                            >
                              {c.type} ×{c.count}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {result.log && (
                  <pre className="ee-mono whitespace-pre-wrap px-3 py-2 text-[11px] leading-relaxed text-zinc-200">
                    {result.log}
                  </pre>
                )}
                {result.netlistJson && (
                  <details className="border-t border-zinc-800">
                    <summary className="cursor-pointer px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-400 hover:text-zinc-200">
                      Raw netlist JSON ({Object.keys(result.netlistJson.modules ?? {}).length} modules)
                    </summary>
                    <pre className="ee-mono max-h-72 overflow-auto whitespace-pre-wrap px-3 py-2 text-[10px] leading-relaxed text-zinc-400">
                      {JSON.stringify(result.netlistJson, null, 2)}
                    </pre>
                  </details>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border/40 bg-muted/15 px-3 py-2 text-[10px] text-muted-foreground">
        <span className="font-medium text-foreground/70">Note:</span> This
        playground runs real Yosys synthesis in your browser via WebAssembly.
        Visual schematic + waveform simulation (digitaljs) is a TODO — for now,
        use the JSON netlist to inspect the synthesized gates.
      </div>

      <span className="sr-only" aria-live="polite">
        {state === 'loading' && 'Loading Yosys WebAssembly module'}
        {state === 'running' && 'Synthesizing Verilog'}
        {state === 'done' && 'Synthesis complete'}
        {state === 'error' && 'Synthesis failed'}
      </span>
    </div>
  );
}

/** Try to guess the "main" module name (one that's not a testbench). */
function guessTopModule(src: string): string | null {
  const modules = Array.from(src.matchAll(/module\s+(\w+)\s*\(/g)).map((m) => m[1]);
  if (modules.length === 0) return null;
  // Prefer a module whose name doesn't start with `tb` and has an `output` port.
  const nonTb = modules.filter((m) => !/^tb/i.test(m));
  return nonTb[0] ?? modules[0];
}

function summarizeNetlist(netlist: any, topName: string) {
  const modules: Record<string, any> = netlist.modules ?? {};
  const top = modules[topName] ?? Object.values(modules)[0];
  if (!top) return null;
  const cells: Record<string, any> = top.cells ?? {};
  const ports: Record<string, any> = top.ports ?? {};
  const wires: Record<string, any> = top.wires ?? {};

  const cellTypeMap = new Map<string, number>();
  for (const c of Object.values(cells)) {
    const t = (c as any).type ?? 'unknown';
    cellTypeMap.set(t, (cellTypeMap.get(t) ?? 0) + 1);
  }
  const cellTypes = Array.from(cellTypeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const inputs: string[] = [];
  const outputs: string[] = [];
  for (const [name, p] of Object.entries(ports)) {
    const dir = (p as any).direction;
    if (dir === 'input') inputs.push(name);
    else if (dir === 'output') outputs.push(name);
  }

  return {
    cells: Object.keys(cells).length,
    wires: Object.keys(wires).length,
    ports: Object.keys(ports).length,
    cellTypes,
    modules: Object.keys(modules),
    inputs,
    outputs,
  };
}
