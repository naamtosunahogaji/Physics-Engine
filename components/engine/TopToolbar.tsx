'use client';

import React from 'react';
import {
  Play,
  Pause,
  Square,
  Plus,
  Save,
  Upload,
  Download,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  LayoutGrid,
  Zap,
  Gauge,
  Film,
} from 'lucide-react';
import { PlayState, EngineLayoutState, SceneSettings } from '@/types/engine';

interface TopToolbarProps {
  playState: PlayState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onAddObject: () => void;
  onSave: () => void;
  onImport: () => void;
  onExport: () => void;
  onDelete: () => void;
  onOpenSettings: () => void;
  onOpenCompression: () => void;
  selectedObjectId: string | null;
  isSelectedVisible: boolean;
  onToggleVisibility: () => void;
  isSelectedLocked: boolean;
  onToggleLock: () => void;
  layout: EngineLayoutState;
  onToggleLayout: (panel: keyof EngineLayoutState) => void;
  sceneSettings: SceneSettings;
  onUpdateSceneSettings: (settings: Partial<SceneSettings>) => void;
  onPresetLayout: (mode: 'default' | 'viewport' | 'minimal') => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  playState,
  onPlay,
  onPause,
  onStop,
  onAddObject,
  onSave,
  onImport,
  onExport,
  onDelete,
  onOpenSettings,
  onOpenCompression,
  selectedObjectId,
  isSelectedVisible,
  onToggleVisibility,
  isSelectedLocked,
  onToggleLock,
  layout,
  onToggleLayout,
  sceneSettings,
  onUpdateSceneSettings,
  onPresetLayout,
}) => {
  return (
    <header className="h-12 bg-[#1a1f3a] border-b border-[#27272a] flex items-center justify-between px-4 text-zinc-300 select-none z-30 shadow-md">
      {/* Left: Engine Logo & Primary Actions */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 pr-3 border-r border-[#27272a]">
          <div className="w-7 h-7 rounded-md bg-[#6366f1] flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-indigo-500/20">
            3D
          </div>
          <span className="font-semibold text-sm tracking-wide text-zinc-100 hidden sm:inline">
            GameEngine<span className="text-indigo-400 font-light">Studio</span>
          </span>
        </div>

        {/* Panel Collapse Controls */}
        <div className="flex items-center space-x-1 bg-[#0a0e27] p-1 rounded-md border border-[#27272a]">
          <button
            onClick={() => onToggleLayout('showLeftPanel')}
            className={`p-1.5 rounded transition ${
              layout.showLeftPanel
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-zinc-400 hover:bg-[#2a2a3a] hover:text-zinc-200'
            }`}
            title={layout.showLeftPanel ? 'Collapse Asset Manager' : 'Expand Asset Manager'}
          >
            {layout.showLeftPanel ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>
          <button
            onClick={() => onToggleLayout('showHierarchyPanel')}
            className={`p-1.5 rounded transition ${
              layout.showHierarchyPanel
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-zinc-400 hover:bg-[#2a2a3a] hover:text-zinc-200'
            }`}
            title={layout.showHierarchyPanel ? 'Collapse Scene Hierarchy' : 'Expand Scene Hierarchy'}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onToggleLayout('showInspectorPanel')}
            className={`p-1.5 rounded transition ${
              layout.showInspectorPanel
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-zinc-400 hover:bg-[#2a2a3a] hover:text-zinc-200'
            }`}
            title={layout.showInspectorPanel ? 'Collapse Inspector' : 'Expand Inspector'}
          >
            {layout.showInspectorPanel ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 pl-1">
          <button
            onClick={onAddObject}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#6366f1] hover:bg-indigo-500 text-white text-xs font-medium transition shadow-lg shadow-indigo-500/20"
            title="Add New Primitive Object or Light"
          >
            <Plus size={14} />
            <span className="hidden md:inline">Add</span>
          </button>

          <button
            onClick={onImport}
            className="px-2.5 py-1 text-xs bg-[#2a2a3a] hover:bg-[#3a3a4a] text-zinc-200 rounded border border-[#3a3a4a] transition flex items-center space-x-1"
            title="Import Asset (.glb, .fbx, .png, .mp3)"
          >
            <Upload size={14} />
            <span className="hidden lg:inline">Import</span>
          </button>

          <button
            onClick={onSave}
            className="p-1.5 rounded hover:bg-[#2a2a3a] text-zinc-300 transition"
            title="Save Project (Ctrl+S)"
          >
            <Save size={16} />
          </button>

          <button
            onClick={onExport}
            className="px-2.5 py-1 text-xs bg-[#2a2a3a] hover:bg-[#3a3a4a] text-zinc-200 rounded border border-[#3a3a4a] transition flex items-center space-x-1"
            title="Export Project (Ctrl+E)"
          >
            <Download size={14} />
            <span className="hidden lg:inline">Export</span>
          </button>

          {selectedObjectId && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition-colors"
              title="Delete Selected Object (Delete)"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Center: Play Engine Simulation & Controls */}
      <div className="flex items-center space-x-2 bg-[#0a0e27] border border-[#27272a] px-2 py-1 rounded-md">
        {playState === 'stopped' ? (
          <button
            onClick={onPlay}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#6366f1] hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition"
            title="Play Game Simulation (Space)"
          >
            <Play size={13} className="fill-current" />
            <span>Play</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className={`p-1.5 rounded transition ${
              playState === 'paused'
                ? 'bg-amber-600 text-white'
                : 'hover:bg-[#2a2a3a] text-amber-400'
            }`}
            title="Pause Simulation"
          >
            <Pause size={14} className="fill-current" />
          </button>
        )}

        {playState !== 'stopped' && (
          <button
            onClick={onStop}
            className="p-1.5 rounded hover:bg-red-950/60 text-red-400 transition"
            title="Stop Simulation & Reset Scene"
          >
            <Square size={13} className="fill-current" />
          </button>
        )}

        {/* Frame Rate Control */}
        <div className="h-4 w-px bg-[#27272a] mx-1" />
        <div className="flex items-center space-x-1 text-xs text-zinc-400" title="Frame Rate Control">
          <Gauge size={13} className="text-indigo-400" />
          <select
            value={sceneSettings.fpsLimit}
            onChange={(e) => onUpdateSceneSettings({ fpsLimit: Number(e.target.value) })}
            className="bg-[#1a1f3a] text-zinc-200 text-xs px-1.5 py-0.5 rounded border border-[#27272a] focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value={60}>60 FPS</option>
            <option value={30}>30 FPS</option>
            <option value={120}>120 FPS</option>
            <option value={15}>15 FPS</option>
            <option value={0}>Unlimited</option>
          </select>
        </div>

        {/* Editor Animation Toggle */}
        <button
          onClick={() => onUpdateSceneSettings({ animateInEditor: !sceneSettings.animateInEditor })}
          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[11px] transition ${
            sceneSettings.animateInEditor
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Toggle Animation playback in Editor"
        >
          <Film size={12} />
          <span className="hidden lg:inline">Anim</span>
        </button>
      </div>

      {/* Right: Quick Tools, Compression & Fullscreen */}
      <div className="flex items-center space-x-1.5">
        {selectedObjectId && (
          <>
            <button
              onClick={onToggleVisibility}
              className={`p-1.5 rounded transition ${
                isSelectedVisible
                  ? 'hover:bg-[#2a2a3a] text-zinc-300'
                  : 'bg-zinc-800/80 text-amber-400'
              }`}
              title={isSelectedVisible ? 'Hide Object (V)' : 'Show Object (V)'}
            >
              {isSelectedVisible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button
              onClick={onToggleLock}
              className={`p-1.5 rounded transition ${
                isSelectedLocked
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                  : 'hover:bg-[#2a2a3a] text-zinc-300'
              }`}
              title={isSelectedLocked ? 'Unlock Object' : 'Lock Object'}
            >
              {isSelectedLocked ? <Lock size={15} /> : <Unlock size={15} />}
            </button>
          </>
        )}

        <button
          onClick={onOpenCompression}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#2a2a3a] hover:bg-[#3a3a4a] text-indigo-300 border border-[#3a3a4a] text-xs font-medium transition"
          title="Automated Asset Compression Pipeline"
        >
          <Zap size={14} className="text-amber-400 fill-amber-400/20" />
          <span className="hidden xl:inline">Pipeline</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded hover:bg-[#2a2a3a] text-zinc-300 transition"
          title="Project Settings"
        >
          <Settings size={16} />
        </button>

        <button
          onClick={() => onPresetLayout(layout.showLeftPanel ? 'viewport' : 'default')}
          className={`p-1.5 rounded transition ${
            !layout.showLeftPanel && !layout.showInspectorPanel
              ? 'bg-[#6366f1] text-white'
              : 'hover:bg-[#2a2a3a] text-zinc-300'
          }`}
          title="Toggle Full Viewport Mode"
        >
          {layout.isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </header>
  );
};
