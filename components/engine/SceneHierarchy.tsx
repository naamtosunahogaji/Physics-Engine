'use client';

import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  Box,
  Sun,
  Camera as CameraIcon,
  Sparkles,
  Folder,
  Circle,
  Cylinder,
} from 'lucide-react';
import { GameObject } from '@/types/engine';

interface SceneHierarchyProps {
  objects: GameObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onAddPrimitive: (type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'group' | 'light' | 'camera' | 'particle') => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
}

export const SceneHierarchy: React.FC<SceneHierarchyProps> = ({
  objects,
  selectedObjectId,
  onSelectObject,
  onToggleVisibility,
  onToggleLock,
  onAddPrimitive,
  onDeleteObject,
  onDuplicateObject,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; objectId: string } | null>(
    null
  );

  const toggleGroupCollapse = (id: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getObjectIcon = (obj: GameObject) => {
    if (obj.type === 'Group') return <Folder size={13} className="text-amber-400" />;
    if (obj.type === 'Light') return <Sun size={13} className="text-yellow-400" />;
    if (obj.type === 'Camera') return <CameraIcon size={13} className="text-sky-400" />;
    if (obj.type === 'ParticleEmitter') return <Sparkles size={13} className="text-pink-400" />;

    const geo = obj.components.meshRenderer?.geometryType;
    if (geo === 'sphere') return <Circle size={13} className="text-emerald-400" />;
    if (geo === 'cylinder') return <Cylinder size={13} className="text-orange-400" />;
    return <Box size={13} className="text-indigo-400" />;
  };

  // Separate root objects and child objects
  const rootObjects = objects.filter((o) => !o.parent);

  const renderTreeItem = (obj: GameObject, level = 0) => {
    const isSelected = selectedObjectId === obj.id;
    const children = objects.filter((o) => o.parent === obj.id);
    const hasChildren = children.length > 0;
    const isCollapsed = !!collapsedGroups[obj.id];

    return (
      <div key={obj.id} className="select-none">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject(obj.id);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelectObject(obj.id);
            setContextMenu({ x: e.clientX, y: e.clientY, objectId: obj.id });
          }}
          style={{ paddingLeft: `${level * 14 + 6}px` }}
          className={`group flex items-center justify-between py-1 pr-2 rounded text-xs cursor-pointer transition border border-transparent ${
            isSelected
              ? 'bg-indigo-500/20 text-indigo-300 font-medium border-l-2 border-indigo-500'
              : 'hover:bg-[#2a2a3a] text-zinc-300'
          }`}
        >
          <div className="flex items-center space-x-1.5 min-w-0 pr-1">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGroupCollapse(obj.id);
                }}
                className="p-0.5 hover:text-white"
              >
                {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
              </button>
            ) : (
              <span className="w-3.5" />
            )}

            {getObjectIcon(obj)}
            <span className="truncate font-mono text-[11px]">{obj.name}</span>
          </div>

          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(obj.id);
              }}
              className={`p-0.5 rounded transition ${
                obj.visible !== false
                  ? 'hover:text-white text-zinc-400'
                  : 'text-amber-400 font-bold'
              }`}
              title={obj.visible !== false ? 'Hide' : 'Show'}
            >
              {obj.visible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock(obj.id);
              }}
              className={`p-0.5 rounded transition ${
                obj.locked ? 'text-amber-400' : 'hover:text-white text-zinc-500'
              }`}
              title={obj.locked ? 'Unlock' : 'Lock'}
            >
              {obj.locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="mt-0.5 space-y-0.5">
            {children.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="h-full bg-[#1a1f3a] border-r border-[#27272a] flex flex-col text-zinc-300 select-none relative z-10"
      onClick={() => {
        setContextMenu(null);
        setShowAddMenu(false);
      }}
    >
      {/* Hierarchy Header */}
      <div className="p-3 border-b border-[#27272a] flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Scene Hierarchy
        </h3>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAddMenu(!showAddMenu);
            }}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#6366f1] hover:bg-indigo-500 text-white text-[11px] font-medium transition"
          >
            <Plus size={12} />
            <span>Add</span>
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-7 z-50 bg-[#1a1f3a] border border-[#27272a] rounded-md shadow-2xl py-1 w-40 text-xs text-zinc-200">
              <button
                onClick={() => onAddPrimitive('box')}
                className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
              >
                <Box size={13} className="text-indigo-400" />
                <span>Cube Mesh</span>
              </button>
              <button
                onClick={() => onAddPrimitive('sphere')}
                className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
              >
                <Circle size={13} className="text-emerald-400" />
                <span>Sphere Mesh</span>
              </button>
              <button
                onClick={() => onAddPrimitive('cylinder')}
                className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
              >
                <Cylinder size={13} className="text-orange-400" />
                <span>Cylinder Mesh</span>
              </button>
              <button
                onClick={() => onAddPrimitive('group')}
                className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
              >
                <Folder size={13} className="text-amber-400" />
                <span>Empty Group</span>
              </button>
              <button
                onClick={() => onAddPrimitive('light')}
                className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
              >
                <Sun size={13} className="text-yellow-400" />
                <span>Light Source</span>
              </button>
              <button
                onClick={() => onAddPrimitive('particle')}
                className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
              >
                <Sparkles size={13} className="text-pink-400" />
                <span>Particle Emitter</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hierarchy Tree List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
        {rootObjects.map((obj) => renderTreeItem(obj))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-[#1a1f3a] border border-[#27272a] rounded-md shadow-2xl py-1 w-44 text-xs text-zinc-200"
        >
          <button
            onClick={() => {
              onDuplicateObject(contextMenu.objectId);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
          >
            <Copy size={13} />
            <span>Duplicate</span>
          </button>
          <button
            onClick={() => {
              onDeleteObject(contextMenu.objectId);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center space-x-2 text-red-400"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};
