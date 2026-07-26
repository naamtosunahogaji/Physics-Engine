'use client';

import React from 'react';
import { X, Settings, Gauge, Sun } from 'lucide-react';
import { SceneSettings } from '@/types/engine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SceneSettings;
  onUpdateSettings: (updated: SceneSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121633] border border-[#2b335c] rounded-xl w-full max-w-md overflow-hidden shadow-2xl text-zinc-200">
        {/* Header */}
        <div className="p-4 border-b border-[#2b335c] flex items-center justify-between bg-[#161b3d]">
          <div className="flex items-center space-x-2">
            <Settings size={18} className="text-indigo-400" />
            <span className="font-semibold text-sm text-white">Project & Scene Settings</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#2b335c] rounded text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Physics Gravity */}
          <div>
            <label className="text-zinc-400 block mb-1">Physics Gravity Vector [Y]</label>
            <input
              type="number"
              step="0.5"
              value={settings.gravity[1]}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  gravity: [0, parseFloat(e.target.value) || -9.81, 0],
                })
              }
              className="w-full bg-[#161b3d] border border-[#2b335c] rounded px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Target FPS */}
          <div>
            <label className="text-zinc-400 block mb-1">Engine Frame Rate Cap</label>
            <select
              value={settings.fpsLimit}
              onChange={(e) => onUpdateSettings({ ...settings, fpsLimit: Number(e.target.value) })}
              className="w-full bg-[#161b3d] border border-[#2b335c] rounded px-3 py-1.5 text-zinc-100 focus:outline-none"
            >
              <option value={60}>60 FPS (Default)</option>
              <option value={120}>120 FPS (High Refresh)</option>
              <option value={30}>30 FPS (Power Saver)</option>
              <option value={15}>15 FPS (Low End)</option>
              <option value={0}>Unlimited</option>
            </select>
          </div>

          {/* Fog Color */}
          <div>
            <label className="text-zinc-400 block mb-1">Scene Fog & Background Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.fogColor}
                onChange={(e) => onUpdateSettings({ ...settings, fogColor: e.target.value })}
                className="w-10 h-8 rounded bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={settings.fogColor}
                onChange={(e) => onUpdateSettings({ ...settings, fogColor: e.target.value })}
                className="flex-1 bg-[#161b3d] border border-[#2b335c] rounded px-3 py-1.5 font-mono text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2b335c] bg-[#161b3d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
