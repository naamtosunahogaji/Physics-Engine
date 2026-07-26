'use client';

import React, { useState } from 'react';
import { TopToolbar } from '@/components/engine/TopToolbar';
import { LeftAssetPanel } from '@/components/engine/LeftAssetPanel';
import { SceneHierarchy } from '@/components/engine/SceneHierarchy';
import { CenterViewport } from '@/components/engine/CenterViewport';
import { InspectorPanel } from '@/components/engine/InspectorPanel';
import { AssetPreviewModal } from '@/components/engine/AssetPreviewModal';
import { CompressionPipelineModal } from '@/components/engine/CompressionPipelineModal';
import { ExportModal } from '@/components/engine/ExportModal';
import { SettingsModal } from '@/components/engine/SettingsModal';
import { ScriptEditorModal } from '@/components/engine/ScriptEditorModal';

import {
  initialGameObjects,
  initialAssetFiles,
  initialSceneSettings,
} from '@/lib/engine/defaultScene';
import {
  GameObject,
  AssetFile,
  SceneSettings,
  PlayState,
  EngineLayoutState,
} from '@/types/engine';

export default function EnginePage() {
  // Layout window toggles
  const [layout, setLayout] = useState<EngineLayoutState>({
    showLeftPanel: true,
    showHierarchyPanel: true,
    showInspectorPanel: true,
    isFullscreen: false,
  });

  // Scene state
  const [sceneName, setSceneName] = useState('GameScene_001');
  const [objects, setObjects] = useState<GameObject[]>(initialGameObjects);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>('uuid-player-group');
  const [assets, setAssets] = useState<AssetFile[]>(initialAssetFiles);
  const [sceneSettings, setSceneSettings] = useState<SceneSettings>(initialSceneSettings);

  // Play / Simulation State
  const [playState, setPlayState] = useState<PlayState>('stopped');
  const [snapshotObjects, setSnapshotObjects] = useState<GameObject[] | null>(null);

  // Modal Dialogs
  const [previewAsset, setPreviewAsset] = useState<AssetFile | null>(null);
  const [isCompressionOpen, setIsCompressionOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScriptEditorOpen, setIsScriptEditorOpen] = useState(false);
  const [currentScriptCode, setCurrentScriptCode] = useState('');

  // Selected Object Reference
  const selectedObject = objects.find((o) => o.id === selectedObjectId) || null;

  // Toggle Layout Panel
  const handleToggleLayout = (panel: keyof EngineLayoutState) => {
    setLayout((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const handlePresetLayout = (mode: 'default' | 'viewport' | 'minimal') => {
    if (mode === 'viewport') {
      setLayout({
        showLeftPanel: false,
        showHierarchyPanel: false,
        showInspectorPanel: false,
        isFullscreen: true,
      });
    } else {
      setLayout({
        showLeftPanel: true,
        showHierarchyPanel: true,
        showInspectorPanel: true,
        isFullscreen: false,
      });
    }
  };

  // Play Engine Handlers
  const handlePlay = () => {
    if (playState === 'stopped') {
      setSnapshotObjects(JSON.parse(JSON.stringify(objects)));
    }
    setPlayState('playing');
  };

  const handlePause = () => {
    setPlayState('paused');
  };

  const handleStop = () => {
    if (snapshotObjects) {
      setObjects(snapshotObjects);
      setSnapshotObjects(null);
    }
    setPlayState('stopped');
  };

  // Primitive Add Object Handler
  const handleAddPrimitive = (
    type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'group' | 'light' | 'camera' | 'particle'
  ) => {
    const count = objects.length + 1;
    const newId = `uuid-${type}-${Date.now()}`;

    let newObj: GameObject;

    if (type === 'group') {
      newObj = {
        id: newId,
        name: `Group_${count}`,
        type: 'Group',
        active: true,
        visible: true,
        locked: false,
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        components: {
          transform: { position: [0, 1, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        },
      };
    } else if (type === 'light') {
      newObj = {
        id: newId,
        name: `Light_Point_${count}`,
        type: 'Light',
        active: true,
        visible: true,
        locked: false,
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        components: {
          transform: { position: [0, 5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
          light: {
            lightType: 'point',
            color: '#f59e0b',
            intensity: 2.0,
            castShadow: true,
          },
        },
      };
    } else if (type === 'particle') {
      newObj = {
        id: newId,
        name: `Particles_${count}`,
        type: 'ParticleEmitter',
        active: true,
        visible: true,
        locked: false,
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        components: {
          transform: { position: [0, 1, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
          particleSystem: {
            maxParticles: 300,
            emissionRate: 30,
            lifetime: [1, 2],
            speed: [1, 3],
            size: [0.2, 0.5],
            color: { startColor: '#38bdf8', endColor: '#6366f1', colorOverLifetime: true },
            forces: { gravity: [0, 1, 0], damping: 0.1 },
            blending: 'additive',
          },
        },
      };
    } else {
      newObj = {
        id: newId,
        name: `${type.toUpperCase()}_Mesh_${count}`,
        type: 'Mesh',
        active: true,
        visible: true,
        locked: false,
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        components: {
          transform: { position: [0, 1, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
          meshRenderer: {
            geometryType: type as any,
            material: {
              id: `mat_${newId}`,
              name: 'DefaultMaterial',
              type: 'standard',
              color: '#818cf8',
              metallic: 0.2,
              roughness: 0.5,
              emissive: '#000000',
              emissiveIntensity: 0,
            },
            castShadow: true,
            receiveShadow: true,
          },
          rigidbody: {
            type: 'dynamic',
            mass: 10,
            drag: 0.1,
            angularDrag: 0.05,
            useGravity: true,
            isKinematic: false,
            freezePosition: [false, false, false],
            freezeRotation: [false, false, false],
          },
          collider: {
            type: type === 'sphere' ? 'sphere' : type === 'cylinder' ? 'cylinder' : 'box',
            size: [1, 1, 1],
            center: [0, 0, 0],
            isTrigger: false,
            physicsMaterial: { friction: 0.5, restitution: 0.2 },
          },
        },
      };
    }

    setObjects((prev) => [...prev, newObj]);
    setSelectedObjectId(newId);
  };

  // Object Modification Handlers
  const handleUpdateGameObject = (updatedObj: GameObject) => {
    setObjects((prev) => prev.map((o) => (o.id === updatedObj.id ? updatedObj : o)));
  };

  const handleDeleteObject = (id: string) => {
    setObjects((prev) => prev.filter((o) => o.id !== id));
    if (selectedObjectId === id) setSelectedObjectId(null);
  };

  const handleDuplicateObject = (id: string) => {
    const target = objects.find((o) => o.id === id);
    if (!target) return;

    const dupId = `uuid-${Date.now()}`;
    const dup: GameObject = JSON.parse(JSON.stringify(target));
    dup.id = dupId;
    dup.name = `${target.name}_Copy`;
    dup.position = [target.position[0] + 1, target.position[1], target.position[2]];
    dup.components.transform.position = dup.position;

    setObjects((prev) => [...prev, dup]);
    setSelectedObjectId(dupId);
  };

  const handleToggleVisibility = (id: string) => {
    setObjects((prev) =>
      prev.map((o) => (o.id === id ? { ...o, visible: o.visible === false ? true : false } : o))
    );
  };

  const handleToggleLock = (id: string) => {
    setObjects((prev) =>
      prev.map((o) => (o.id === id ? { ...o, locked: !o.locked } : o))
    );
  };

  // Import Asset Files Handler
  const handleImportAssetFiles = (fileList: FileList) => {
    const newAssets: AssetFile[] = Array.from(fileList).map((f) => {
      let category: AssetFile['category'] = 'models';
      const name = f.name.toLowerCase();
      if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) {
        category = 'textures';
      } else if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg')) {
        category = 'audio';
      } else if (name.endsWith('.json')) {
        category = 'particles';
      } else if (name.endsWith('.ts') || name.endsWith('.js')) {
        category = 'scripts';
      }

      return {
        id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        path: `assets/${category}/${f.name}`,
        category,
        fileFormat: f.name.split('.').pop()?.toUpperCase() || 'BINARY',
        size: f.size,
      };
    });

    setAssets((prev) => [...prev, ...newAssets]);
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
  };

  return (
    <div className="w-screen h-screen bg-[#0a0e27] text-zinc-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Header Toolbar */}
      <TopToolbar
        playState={playState}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onAddObject={() => handleAddPrimitive('box')}
        onSave={() => alert('Project saved to local session state!')}
        onImport={() => {
          document.getElementById('file-upload-input')?.click();
        }}
        onExport={() => setIsExportOpen(true)}
        onDelete={() => selectedObjectId && handleDeleteObject(selectedObjectId)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCompression={() => setIsCompressionOpen(true)}
        selectedObjectId={selectedObjectId}
        isSelectedVisible={selectedObject ? selectedObject.visible !== false : true}
        onToggleVisibility={() => selectedObjectId && handleToggleVisibility(selectedObjectId)}
        isSelectedLocked={selectedObject ? !!selectedObject.locked : false}
        onToggleLock={() => selectedObjectId && handleToggleLock(selectedObjectId)}
        layout={layout}
        onToggleLayout={handleToggleLayout}
        sceneSettings={sceneSettings}
        onUpdateSceneSettings={(updated) => setSceneSettings({ ...sceneSettings, ...updated })}
        onPresetLayout={handlePresetLayout}
      />

      {/* Main Studio Editor Workspace Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Left Asset Manager */}
        {layout.showLeftPanel && (
          <LeftAssetPanel
            assets={assets}
            onSelectAssetForPreview={(asset) => setPreviewAsset(asset)}
            onImportAssetFiles={handleImportAssetFiles}
            onDeleteAsset={handleDeleteAsset}
            onOpenCompressionModal={() => setIsCompressionOpen(true)}
          />
        )}

        {/* Center Column: Viewport & Collapsible Hierarchy */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Interactive 3D Viewport */}
          <div className="flex-1 relative">
            <CenterViewport
              objects={objects}
              selectedObjectId={selectedObjectId}
              onSelectObject={(id) => setSelectedObjectId(id)}
              onUpdateTransform={(id, pos, rot, scale) => {
                const target = objects.find((o) => o.id === id);
                if (target) {
                  handleUpdateGameObject({
                    ...target,
                    position: pos,
                    rotation: rot,
                    scale: scale,
                    components: {
                      ...target.components,
                      transform: { position: pos, rotation: rot, scale: scale },
                    },
                  });
                }
              }}
              playState={playState}
              sceneSettings={sceneSettings}
              onAddPrimitive={handleAddPrimitive}
              onToggleFullViewport={() =>
                handlePresetLayout(layout.showLeftPanel ? 'viewport' : 'default')
              }
              isFullViewport={!layout.showLeftPanel && !layout.showInspectorPanel}
            />
          </div>

          {/* Collapsible Bottom-Left Hierarchy Window */}
          {layout.showHierarchyPanel && (
            <div className="h-56">
              <SceneHierarchy
                objects={objects}
                selectedObjectId={selectedObjectId}
                onSelectObject={(id) => setSelectedObjectId(id)}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onAddPrimitive={handleAddPrimitive}
                onDeleteObject={handleDeleteObject}
                onDuplicateObject={handleDuplicateObject}
              />
            </div>
          )}
        </div>

        {/* Collapsible Right Inspector Panel */}
        {layout.showInspectorPanel && (
          <InspectorPanel
            selectedObject={selectedObject}
            onUpdateGameObject={handleUpdateGameObject}
            onOpenScriptEditor={(code) => {
              setCurrentScriptCode(code);
              setIsScriptEditorOpen(true);
            }}
            onDeleteObject={handleDeleteObject}
          />
        )}
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-6 bg-[#0a0e27] border-t border-[#27272a] flex items-center px-3 justify-between text-[10px] text-zinc-500 select-none z-30">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-zinc-400 font-mono">Engine Ready</span>
          </span>
          <span className="font-mono">Scene: {sceneName}</span>
          <span className="font-mono hidden sm:inline">Objects: {objects.length}</span>
          <span className="font-mono hidden md:inline">Assets: {assets.length}</span>
        </div>
        <div className="flex items-center space-x-4 font-mono">
          <span>WebGL2 / Three.js</span>
          <span className="text-indigo-400">FPS: 60</span>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {previewAsset && (
        <AssetPreviewModal
          asset={previewAsset}
          onClose={() => setPreviewAsset(null)}
          onOpenOptimizer={() => setIsCompressionOpen(true)}
        />
      )}

      {isCompressionOpen && (
        <CompressionPipelineModal
          isOpen={isCompressionOpen}
          onClose={() => setIsCompressionOpen(false)}
          assets={assets}
          sceneData={{
            scene: {
              name: sceneName,
              version: '1.0.0',
              metadata: { engine: 'GameEngine', createdAt: new Date().toISOString(), author: 'Dev' },
              settings: sceneSettings,
              objects: objects as any,
            },
          }}
          onUpdateAssets={(updated) => setAssets(updated)}
        />
      )}

      {isExportOpen && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          objects={objects}
          assets={assets}
          sceneSettings={sceneSettings}
          sceneName={sceneName}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={sceneSettings}
          onUpdateSettings={(updated) => setSceneSettings(updated)}
        />
      )}

      {isScriptEditorOpen && (
        <ScriptEditorModal
          isOpen={isScriptEditorOpen}
          onClose={() => setIsScriptEditorOpen(false)}
          scriptCode={currentScriptCode}
          onSaveScript={(newCode) => {
            if (selectedObject && selectedObject.components.script) {
              handleUpdateGameObject({
                ...selectedObject,
                components: {
                  ...selectedObject.components,
                  script: {
                    ...selectedObject.components.script,
                    code: newCode,
                  },
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}
