'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Box,
  Zap,
  Activity,
  FileCode,
  Film,
  Sparkles,
  Sun,
  Camera as CameraIcon,
  RotateCcw,
  Plus,
  Play,
  Square,
  ChevronDown,
  ChevronRight,
  Trash2,
  Lock,
  Link2,
} from 'lucide-react';
import { GameObject, GameObjectComponents, Vector3Tuple } from '@/types/engine';

interface InspectorPanelProps {
  selectedObject: GameObject | null;
  onUpdateGameObject: (updated: GameObject) => void;
  onOpenScriptEditor: (scriptCode: string) => void;
  onDeleteObject: (id: string) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedObject,
  onUpdateGameObject,
  onOpenScriptEditor,
  onDeleteObject,
}) => {
  const [showAddComponentMenu, setShowAddComponentMenu] = useState(false);
  const [aspectLocked, setAspectLocked] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    transform: true,
    meshRenderer: true,
    rigidbody: true,
    collider: true,
    script: true,
    animation: true,
    particleSystem: true,
    light: true,
    camera: true,
  });

  if (!selectedObject) {
    return (
      <aside className="w-80 bg-[#1a1f3a] border-l border-[#27272a] flex flex-col h-full text-zinc-400 select-none p-6 items-center justify-center text-center">
        <Sliders size={32} className="text-zinc-600 mb-2 stroke-1" />
        <span className="text-xs font-medium text-zinc-300">No Object Selected</span>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
          Select an object in the 3D Viewport or Scene Hierarchy to inspect and modify components.
        </p>
      </aside>
    );
  }

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTransformChange = (
    field: 'position' | 'rotation' | 'scale',
    index: number,
    value: number
  ) => {
    const current = [...selectedObject.components.transform[field]] as Vector3Tuple;
    current[index] = value;

    if (field === 'scale' && aspectLocked) {
      const prevVal = selectedObject.components.transform.scale[index] || 1;
      const ratio = value / prevVal;
      current[0] = Math.round(selectedObject.components.transform.scale[0] * ratio * 100) / 100;
      current[1] = Math.round(selectedObject.components.transform.scale[1] * ratio * 100) / 100;
      current[2] = Math.round(selectedObject.components.transform.scale[2] * ratio * 100) / 100;
    }

    const updatedComponents: GameObjectComponents = {
      ...selectedObject.components,
      transform: {
        ...selectedObject.components.transform,
        [field]: current,
      },
    };

    onUpdateGameObject({
      ...selectedObject,
      [field]: current,
      components: updatedComponents,
    });
  };

  const handleResetTransform = (field: 'position' | 'rotation' | 'scale') => {
    const defaultValue: Vector3Tuple = field === 'scale' ? [1, 1, 1] : [0, 0, 0];
    const updatedComponents: GameObjectComponents = {
      ...selectedObject.components,
      transform: {
        ...selectedObject.components.transform,
        [field]: defaultValue,
      },
    };

    onUpdateGameObject({
      ...selectedObject,
      [field]: defaultValue,
      components: updatedComponents,
    });
  };

  const handleAddComponent = (componentType: keyof GameObjectComponents) => {
    setShowAddComponentMenu(false);
    const components = { ...selectedObject.components };

    if (componentType === 'rigidbody' && !components.rigidbody) {
      components.rigidbody = {
        type: 'dynamic',
        mass: 10,
        drag: 0.1,
        angularDrag: 0.05,
        useGravity: true,
        isKinematic: false,
        freezePosition: [false, false, false],
        freezeRotation: [false, false, false],
      };
    } else if (componentType === 'collider' && !components.collider) {
      components.collider = {
        type: 'box',
        size: [1, 1, 1],
        center: [0, 0, 0],
        isTrigger: false,
        physicsMaterial: { friction: 0.5, restitution: 0.2 },
      };
    } else if (componentType === 'script' && !components.script) {
      components.script = {
        name: 'NewBehaviour',
        path: '/scripts/NewBehaviour.ts',
        enabled: true,
        parameters: { speed: 5 },
      };
    }

    onUpdateGameObject({ ...selectedObject, components });
  };

  return (
    <aside className="w-80 bg-[#1a1f3a] border-l border-[#27272a] flex flex-col h-full text-zinc-300 select-none relative z-10">
      {/* Inspector Header */}
      <div className="p-3 border-b border-[#27272a] flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Inspector
        </h3>
        <button
          onClick={() => onDeleteObject(selectedObject.id)}
          className="p-1 rounded hover:bg-red-950/60 text-red-400 transition"
          title="Delete Object"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Selected Object Header Data */}
      <div className="p-3 border-b border-[#27272a] bg-[#0a0e27] space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedObject.active !== false}
            onChange={(e) => onUpdateGameObject({ ...selectedObject, active: e.target.checked })}
            className="rounded border-[#27272a] text-indigo-600 focus:ring-0 cursor-pointer"
          />
          <input
            type="text"
            value={selectedObject.name}
            onChange={(e) => onUpdateGameObject({ ...selectedObject, name: e.target.value })}
            className="flex-1 bg-[#1a1f3a] border border-[#27272a] rounded px-2 py-1 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>Type: {selectedObject.type}</span>
          <span className="truncate max-w-[120px]">ID: {selectedObject.id.substring(0, 8)}...</span>
        </div>
      </div>

      {/* Accordion Components List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {/* TRANSFORM COMPONENT */}
        <div className="border border-[#27272a] rounded-lg bg-[#0a0e27] overflow-hidden">
          <button
            onClick={() => toggleSection('transform')}
            className="w-full p-2 bg-[#1a1f3a] flex items-center justify-between text-xs font-medium text-zinc-200 border-b border-[#27272a]"
          >
            <div className="flex items-center space-x-1.5">
              <Box size={14} className="text-indigo-400" />
              <span className="font-semibold text-[11px] tracking-wide">TRANSFORM</span>
            </div>
            {expandedSections.transform ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {expandedSections.transform && (
            <div className="p-2.5 space-y-2 text-xs">
              {/* Position */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Position</span>
                  <button
                    onClick={() => handleResetTransform('position')}
                    className="p-0.5 hover:text-white"
                    title="Reset Position"
                  >
                    <RotateCcw size={11} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                    <div key={axis} className="flex items-center bg-[#1a1f3a] border border-[#27272a] rounded overflow-hidden">
                      <span className="bg-red-950/80 text-red-400 font-bold px-1.5 py-1 text-[10px]">
                        {axis}
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedObject.components.transform.position[i]}
                        onChange={(e) =>
                          handleTransformChange('position', i, parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-transparent px-1 py-0.5 text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rotation */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Rotation (Degrees)</span>
                  <button
                    onClick={() => handleResetTransform('rotation')}
                    className="p-0.5 hover:text-white"
                    title="Reset Rotation"
                  >
                    <RotateCcw size={11} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                    <div key={axis} className="flex items-center bg-[#1a1f3a] border border-[#27272a] rounded overflow-hidden">
                      <span className="bg-emerald-950/80 text-emerald-400 font-bold px-1.5 py-1 text-[10px]">
                        {axis}
                      </span>
                      <input
                        type="number"
                        step="1"
                        value={selectedObject.components.transform.rotation[i]}
                        onChange={(e) =>
                          handleTransformChange('rotation', i, parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-transparent px-1 py-0.5 text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Scale */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <div className="flex items-center space-x-1">
                    <span>Scale</span>
                    <button
                      onClick={() => setAspectLocked(!aspectLocked)}
                      className={`p-0.5 rounded ${
                        aspectLocked ? 'text-indigo-400 font-bold' : 'text-zinc-600'
                      }`}
                      title="Lock Aspect Ratio"
                    >
                      <Link2 size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleResetTransform('scale')}
                    className="p-0.5 hover:text-white"
                    title="Reset Scale"
                  >
                    <RotateCcw size={11} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                    <div key={axis} className="flex items-center bg-[#1a1f3a] border border-[#27272a] rounded overflow-hidden">
                      <span className="bg-sky-950/80 text-sky-400 font-bold px-1.5 py-1 text-[10px]">
                        {axis}
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedObject.components.transform.scale[i]}
                        onChange={(e) =>
                          handleTransformChange('scale', i, parseFloat(e.target.value) || 1)
                        }
                        className="w-full bg-transparent px-1 py-0.5 text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MESH RENDERER COMPONENT */}
        {selectedObject.components.meshRenderer && (
          <div className="border border-[#27272a] rounded-lg bg-[#0a0e27] overflow-hidden">
            <button
              onClick={() => toggleSection('meshRenderer')}
              className="w-full p-2 bg-[#1a1f3a] flex items-center justify-between text-xs font-medium text-zinc-200 border-b border-[#27272a]"
            >
              <div className="flex items-center space-x-1.5">
                <Box size={14} className="text-emerald-400" />
                <span className="font-semibold text-[11px] tracking-wide">MESH RENDERER</span>
              </div>
              {expandedSections.meshRenderer ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {expandedSections.meshRenderer && (
              <div className="p-2.5 space-y-2 text-xs">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedObject.components.meshRenderer.material.color}
                      onChange={(e) => {
                        const mr = selectedObject.components.meshRenderer!;
                        onUpdateGameObject({
                          ...selectedObject,
                          components: {
                            ...selectedObject.components,
                            meshRenderer: {
                              ...mr,
                              material: { ...mr.material, color: e.target.value },
                            },
                          },
                        });
                      }}
                      className="w-8 h-7 bg-transparent cursor-pointer rounded overflow-hidden"
                    />
                    <input
                      type="text"
                      value={selectedObject.components.meshRenderer.material.color}
                      onChange={(e) => {
                        const mr = selectedObject.components.meshRenderer!;
                        onUpdateGameObject({
                          ...selectedObject,
                          components: {
                            ...selectedObject.components,
                            meshRenderer: {
                              ...mr,
                              material: { ...mr.material, color: e.target.value },
                            },
                          },
                        });
                      }}
                      className="flex-1 bg-[#1a1f3a] border border-[#27272a] rounded px-2 py-1 text-xs text-zinc-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Roughness</span>
                    <span>{selectedObject.components.meshRenderer.material.roughness}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={selectedObject.components.meshRenderer.material.roughness}
                    onChange={(e) => {
                      const mr = selectedObject.components.meshRenderer!;
                      onUpdateGameObject({
                        ...selectedObject,
                        components: {
                          ...selectedObject.components,
                          meshRenderer: {
                            ...mr,
                            material: { ...mr.material, roughness: parseFloat(e.target.value) },
                          },
                        },
                      });
                    }}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* RIGIDBODY / PHYSICS COMPONENT */}
        {selectedObject.components.rigidbody && (
          <div className="border border-[#27272a] rounded-lg bg-[#0a0e27] overflow-hidden">
            <button
              onClick={() => toggleSection('rigidbody')}
              className="w-full p-2 bg-[#1a1f3a] flex items-center justify-between text-xs font-medium text-zinc-200 border-b border-[#27272a]"
            >
              <div className="flex items-center space-x-1.5">
                <Zap size={14} className="text-amber-400" />
                <span className="font-semibold text-[11px] tracking-wide">RIGIDBODY (PHYSICS)</span>
              </div>
              {expandedSections.rigidbody ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {expandedSections.rigidbody && (
              <div className="p-2.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Body Type</span>
                  <select
                    value={selectedObject.components.rigidbody.type}
                    onChange={(e) => {
                      const rb = selectedObject.components.rigidbody!;
                      onUpdateGameObject({
                        ...selectedObject,
                        components: {
                          ...selectedObject.components,
                          rigidbody: { ...rb, type: e.target.value as any },
                        },
                      });
                    }}
                    className="bg-[#1a1f3a] border border-[#27272a] rounded px-2 py-1 text-xs text-zinc-200"
                  >
                    <option value="dynamic">Dynamic</option>
                    <option value="static">Static</option>
                    <option value="kinematic">Kinematic</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Mass (kg)</span>
                  <input
                    type="number"
                    value={selectedObject.components.rigidbody.mass}
                    onChange={(e) => {
                      const rb = selectedObject.components.rigidbody!;
                      onUpdateGameObject({
                        ...selectedObject,
                        components: {
                          ...selectedObject.components,
                          rigidbody: { ...rb, mass: parseFloat(e.target.value) || 0 },
                        },
                      });
                    }}
                    className="w-20 bg-[#1a1f3a] border border-[#27272a] rounded px-2 py-1 text-xs text-zinc-200"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Use Gravity</span>
                  <input
                    type="checkbox"
                    checked={selectedObject.components.rigidbody.useGravity}
                    onChange={(e) => {
                      const rb = selectedObject.components.rigidbody!;
                      onUpdateGameObject({
                        ...selectedObject,
                        components: {
                          ...selectedObject.components,
                          rigidbody: { ...rb, useGravity: e.target.checked },
                        },
                      });
                    }}
                    className="rounded border-[#27272a] text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCRIPT COMPONENT */}
        {selectedObject.components.script && (
          <div className="border border-[#27272a] rounded-lg bg-[#0a0e27] overflow-hidden">
            <button
              onClick={() => toggleSection('script')}
              className="w-full p-2 bg-[#1a1f3a] flex items-center justify-between text-xs font-medium text-zinc-200 border-b border-[#27272a]"
            >
              <div className="flex items-center space-x-1.5">
                <FileCode size={14} className="text-cyan-400" />
                <span className="font-semibold text-[11px] tracking-wide">
                  SCRIPT ({selectedObject.components.script.name})
                </span>
              </div>
              {expandedSections.script ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {expandedSections.script && (
              <div className="p-2.5 space-y-2 text-xs">
                <button
                  onClick={() =>
                    onOpenScriptEditor(
                      selectedObject.components.script?.code || '// PlayerController.ts'
                    )
                  }
                  className="w-full py-1.5 bg-[#6366f1] hover:bg-indigo-500 text-white rounded text-xs font-medium transition shadow-sm"
                >
                  Edit Script Code
                </button>

                {Object.entries(selectedObject.components.script.parameters).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-mono">{key}</span>
                    <input
                      type="number"
                      value={val as number}
                      onChange={(e) => {
                        const scr = selectedObject.components.script!;
                        onUpdateGameObject({
                          ...selectedObject,
                          components: {
                            ...selectedObject.components,
                            script: {
                              ...scr,
                              parameters: {
                                ...scr.parameters,
                                [key]: parseFloat(e.target.value) || 0,
                              },
                            },
                          },
                        });
                      }}
                      className="w-20 bg-[#1a1f3a] border border-[#27272a] rounded px-2 py-0.5 text-xs text-zinc-200 font-mono"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD COMPONENT BUTTON */}
        <div className="relative pt-2">
          <button
            onClick={() => setShowAddComponentMenu(!showAddComponentMenu)}
            className="w-full py-2 bg-[#2a2a3a] hover:bg-[#3a3a4a] border border-[#3a3a4a] rounded-lg text-xs font-medium text-zinc-200 flex items-center justify-center space-x-1.5 transition"
          >
            <Plus size={14} />
            <span>Add Component</span>
          </button>

          {showAddComponentMenu && (
            <div className="absolute left-0 right-0 bottom-10 z-50 bg-[#1a1f3a] border border-[#27272a] rounded-md shadow-2xl py-1 text-xs text-zinc-200">
              <button
                onClick={() => handleAddComponent('rigidbody')}
                className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
              >
                <Zap size={13} className="text-amber-400" />
                <span>Rigidbody (Physics)</span>
              </button>
              <button
                onClick={() => handleAddComponent('collider')}
                className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
              >
                <Activity size={13} className="text-emerald-400" />
                <span>Collider</span>
              </button>
              <button
                onClick={() => handleAddComponent('script')}
                className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
              >
                <FileCode size={13} className="text-cyan-400" />
                <span>Behavior Script</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
