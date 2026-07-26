'use client';

import React, { useEffect, useState } from 'react';
import { X, Box, Sparkles, CheckCircle2, Cpu, FileText, Zap } from 'lucide-react';
import { AssetFile } from '@/types/engine';
import { formatBytes } from '@/lib/engine/compressionPipeline';

interface AssetPreviewModalProps {
  asset: AssetFile | null;
  onClose: () => void;
  onOpenOptimizer: () => void;
}

export const AssetPreviewModal: React.FC<AssetPreviewModalProps> = ({
  asset,
  onClose,
  onOpenOptimizer,
}) => {
  const [fetchedAiAnalysis, setFetchedAiAnalysis] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const aiAnalysis = asset?.metadata?.aiAnalysis || fetchedAiAnalysis;

  useEffect(() => {
    if (!asset || asset.metadata?.aiAnalysis) return;

    let isMounted = true;
    const analyze = async () => {
      try {
        setLoadingAi(true);
        const res = await fetch('/api/gemini/analyze-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: asset.name,
            fileFormat: asset.fileFormat,
            fileSize: asset.size,
            category: asset.category,
          }),
        });
        const data = await res.json();
        if (isMounted) setFetchedAiAnalysis(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoadingAi(false);
      }
    };

    analyze();
    return () => {
      isMounted = false;
    };
  }, [asset]);

  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1f3a] border border-[#27272a] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl text-zinc-200">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between bg-[#121520]">
          <div className="flex items-center space-x-2">
            <Box size={18} className="text-[#6366f1]" />
            <span className="font-semibold text-sm text-white">{asset.name}</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              {asset.fileFormat}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#2a2a3a] rounded text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* 3D / Asset Graphic Preview Box */}
          <div className="h-44 bg-[#0a0e27] border border-[#27272a] rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mb-2 animate-pulse">
              <Box size={32} className="text-[#6366f1]" />
            </div>
            <span className="text-xs text-zinc-300 font-mono">Interactive 3D Preview Active</span>
            <span className="text-[10px] text-zinc-500">File Size: {formatBytes(asset.compressedSize || asset.size)}</span>
          </div>

          {/* Technical Metadata Specs */}
          {asset.metadata && (
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#0a0e27] p-3 rounded-lg border border-[#27272a]">
              <div>
                <span className="text-zinc-400 text-[11px] block">Meshes / Geometry</span>
                <span className="font-mono text-zinc-200 font-medium">
                  {asset.metadata.meshes?.[0]?.vertexCount
                    ? `${asset.metadata.meshes[0].vertexCount.toLocaleString()} Vertices`
                    : 'Standard Geometry'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 text-[11px] block">Animations Included</span>
                <span className="font-mono text-zinc-200 font-medium">
                  {asset.metadata.animations
                    ? asset.metadata.animations.map((a) => a.name).join(', ')
                    : 'None'}
                </span>
              </div>
            </div>
          )}

          {/* AI Metadata Analysis Section */}
          <div className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-300 font-medium text-xs">
              <Sparkles size={16} className="text-amber-400 animate-spin" />
              <span>AI Asset Analysis & Engine Suggestions</span>
            </div>

            {loadingAi ? (
              <div className="text-xs text-zinc-400 animate-pulse">Analyzing asset geometry with Gemini AI...</div>
            ) : aiAnalysis ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>
                    Inferred Type: <strong className="text-white">{aiAnalysis.objectType}</strong>
                  </span>
                  <span className="text-[10px] bg-emerald-950/50 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/50">
                    {Math.round((aiAnalysis.confidence || 0.95) * 100)}% Confidence
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Recommended Components:</span>
                  <div className="flex flex-wrap gap-1">
                    {aiAnalysis.suggestedComponents?.map((c: string) => (
                      <span key={c} className="bg-[#2a2a3a] text-indigo-300 px-2 py-0.5 rounded border border-[#27272a] text-[11px]">
                        + {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#121520] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenOptimizer();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#6366f1] hover:bg-indigo-500 text-white font-medium text-xs transition"
          >
            <Zap size={14} className="text-amber-400" />
            <span>Optimize Asset</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#2a2a3a] hover:bg-[#3a3a4a] text-zinc-200 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
