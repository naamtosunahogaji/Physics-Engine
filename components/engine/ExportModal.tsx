'use client';

import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle2, Copy } from 'lucide-react';
import { GameObject, AssetFile, SceneSettings } from '@/types/engine';
import { downloadProjectZip, buildSceneJSON } from '@/lib/engine/exportEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  objects: GameObject[];
  assets: AssetFile[];
  sceneSettings: SceneSettings;
  sceneName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  objects,
  assets,
  sceneSettings,
  sceneName,
}) => {
  const [exportFormat, setExportFormat] = useState<'json' | 'unreal' | 'unity' | 'godot' | 'three'>(
    'json'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      await downloadProjectZip(sceneName, objects, assets, sceneSettings, exportFormat);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const handleCopyJson = () => {
    const sceneJson = buildSceneJSON(sceneName, objects, sceneSettings);
    navigator.clipboard.writeText(JSON.stringify(sceneJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121633] border border-[#2b335c] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl text-zinc-200">
        {/* Header */}
        <div className="p-4 border-b border-[#2b335c] flex items-center justify-between bg-[#161b3d]">
          <div className="flex items-center space-x-2">
            <Download size={18} className="text-indigo-400" />
            <span className="font-semibold text-sm text-white">Export Game Project</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#2b335c] rounded text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-zinc-400 block mb-1">Project Target Format</label>
            <div className="space-y-1.5">
              {[
                { id: 'json', label: 'JSON + Assets (Native Engine Bundle)' },
                { id: 'unreal', label: 'Unreal Engine 5 Scene Package' },
                { id: 'unity', label: 'Unity 3D Project Package' },
                { id: 'godot', label: 'Godot 4 Engine Scene' },
                { id: 'three', label: 'Three.js Raw Standalone App' },
              ].map((fmt) => (
                <label
                  key={fmt.id}
                  onClick={() => setExportFormat(fmt.id as any)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                    exportFormat === fmt.id
                      ? 'bg-indigo-950/80 border-indigo-500 text-white font-medium'
                      : 'bg-[#161b3d] border-[#2b335c] text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  <span>{fmt.label}</span>
                  {exportFormat === fmt.id && <CheckCircle2 size={16} className="text-indigo-400" />}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2b335c] bg-[#161b3d] flex items-center justify-between">
          <button
            onClick={handleCopyJson}
            className="flex items-center space-x-1 px-3 py-2 rounded bg-[#2b335c] hover:bg-[#3b457c] text-zinc-200 font-medium text-xs transition"
          >
            <Copy size={14} />
            <span>{copiedJson ? 'Copied JSON!' : 'Copy Scene JSON'}</span>
          </button>
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-lg disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isExporting ? 'Generating Package...' : 'Download Project ZIP'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
