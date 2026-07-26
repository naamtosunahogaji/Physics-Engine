'use client';

import React, { useState } from 'react';
import { X, Zap, CheckCircle2, RefreshCw, BarChart2, ShieldCheck, ArrowRight } from 'lucide-react';
import { AssetFile, CompressionSettings, CompressionReport, SceneJSON } from '@/types/engine';
import { runCompressionPipeline, formatBytes } from '@/lib/engine/compressionPipeline';

interface CompressionPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: AssetFile[];
  sceneData: SceneJSON;
  onUpdateAssets: (updated: AssetFile[]) => void;
}

export const CompressionPipelineModal: React.FC<CompressionPipelineModalProps> = ({
  isOpen,
  onClose,
  assets,
  sceneData,
  onUpdateAssets,
}) => {
  const [settings, setSettings] = useState<CompressionSettings>({
    compressMeshes: true,
    quantizeVertices: true,
    compressTextures: true,
    textureMaxResolution: 1024,
    compressAudio: true,
    audioTargetBitrate: 128,
    embedSmallFiles: true,
    smallFileThresholdKb: 1024,
    gzipJson: true,
  });

  const [report, setReport] = useState<CompressionReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunPipeline = () => {
    setIsRunning(true);

    setTimeout(() => {
      const { compressedAssets, report: newReport } = runCompressionPipeline(assets, sceneData, settings);
      setReport(newReport);
      onUpdateAssets(compressedAssets);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1f3a] border border-[#27272a] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl text-zinc-200">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between bg-[#121520]">
          <div className="flex items-center space-x-2">
            <Zap size={18} className="text-amber-400 fill-amber-400/20" />
            <span className="font-semibold text-sm text-white">Automated Asset Compression Pipeline</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#2a2a3a] rounded text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Mesh Settings */}
            <div className="bg-[#0a0e27] p-3.5 rounded-lg border border-[#27272a] space-y-2">
              <span className="font-semibold text-indigo-300 block text-[11px] tracking-wider uppercase">
                3D Geometry Optimization
              </span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.compressMeshes}
                  onChange={(e) => setSettings({ ...settings, compressMeshes: e.target.checked })}
                  className="rounded text-[#6366f1] focus:ring-0"
                />
                <span>Draco / Meshopt Quantization</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.quantizeVertices}
                  onChange={(e) => setSettings({ ...settings, quantizeVertices: e.target.checked })}
                  className="rounded text-[#6366f1] focus:ring-0"
                />
                <span>Normal & UV Vector Packing</span>
              </label>
            </div>

            {/* Texture Settings */}
            <div className="bg-[#0a0e27] p-3.5 rounded-lg border border-[#27272a] space-y-2">
              <span className="font-semibold text-emerald-300 block text-[11px] tracking-wider uppercase">
                GPU Texture Compression
              </span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.compressTextures}
                  onChange={(e) => setSettings({ ...settings, compressTextures: e.target.checked })}
                  className="rounded text-[#6366f1] focus:ring-0"
                />
                <span>Basis Universal / KTX2 GPU Transcode</span>
              </label>
              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-400">Max Texture Resolution</span>
                <select
                  value={settings.textureMaxResolution}
                  onChange={(e) => setSettings({ ...settings, textureMaxResolution: Number(e.target.value) })}
                  className="bg-[#121520] border border-[#27272a] rounded px-2 py-0.5 text-xs text-zinc-200"
                >
                  <option value={2048}>2048 x 2048</option>
                  <option value={1024}>1024 x 1024</option>
                  <option value={512}>512 x 512</option>
                </select>
              </div>
            </div>
          </div>

          {/* Benchmark Results Display */}
          {report && (
            <div className="bg-gradient-to-r from-emerald-950/40 via-indigo-950/40 to-purple-950/40 border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-emerald-800/40 pb-2">
                <span className="font-semibold text-emerald-300 flex items-center space-x-1">
                  <ShieldCheck size={16} />
                  <span>Compression Pipeline Benchmark Report</span>
                </span>
                <span className="text-zinc-400 font-mono">Executed in {report.executionTimeMs} ms</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#0a0e27] p-2.5 rounded-lg border border-[#27272a]">
                  <span className="text-[10px] text-zinc-400 block">Original Project Size</span>
                  <span className="text-sm font-bold font-mono text-zinc-300">{formatBytes(report.originalTotalBytes)}</span>
                </div>
                <div className="bg-[#0a0e27] p-2.5 rounded-lg border border-[#27272a]">
                  <span className="text-[10px] text-zinc-400 block">Optimized Project Size</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">{formatBytes(report.compressedTotalBytes)}</span>
                </div>
                <div className="bg-[#0a0e27] p-2.5 rounded-lg border border-[#27272a]">
                  <span className="text-[10px] text-zinc-400 block">Total Reduction</span>
                  <span className="text-sm font-bold font-mono text-amber-400">-{report.compressionRatioPercent}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Asset List Preview */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-300 block">Asset Breakdown</span>
            <div className="bg-[#0a0e27] border border-[#27272a] rounded-lg overflow-hidden max-h-40 overflow-y-auto text-xs">
              {assets.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2 border-b border-[#27272a] last:border-0">
                  <span className="font-mono text-zinc-200">{a.name}</span>
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <span className="text-zinc-500 line-through">{formatBytes(a.size)}</span>
                    <ArrowRight size={12} className="text-zinc-600" />
                    <span className="text-emerald-400 font-bold">{formatBytes(a.compressedSize || a.size)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#121520] flex items-center justify-between">
          <button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 rounded bg-[#6366f1] hover:bg-indigo-500 text-white font-medium text-xs transition shadow-lg disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRunning ? 'animate-spin' : ''} />
            <span>{isRunning ? 'Optimizing Assets...' : 'Run Automated Pipeline'}</span>
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded bg-[#2a2a3a] hover:bg-[#3a3a4a] text-zinc-200 text-xs font-medium transition">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
