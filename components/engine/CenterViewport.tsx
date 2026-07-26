'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Move,
  RotateCw,
  Maximize,
  Grid,
  Eye,
  Camera,
  Focus,
  Play,
  RotateCcw,
  Plus,
  Maximize2,
} from 'lucide-react';
import {
  GameObject,
  TransformGizmoMode,
  PlayState,
  SceneSettings,
} from '@/types/engine';

interface CenterViewportProps {
  objects: GameObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
  playState: PlayState;
  sceneSettings: SceneSettings;
  onAddPrimitive: (type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'group' | 'light' | 'camera' | 'particle') => void;
  onToggleFullViewport: () => void;
  isFullViewport: boolean;
}

export const CenterViewport: React.FC<CenterViewportProps> = ({
  objects,
  selectedObjectId,
  onSelectObject,
  onUpdateTransform,
  playState,
  sceneSettings,
  onAddPrimitive,
  onToggleFullViewport,
  isFullViewport,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gizmoMode, setGizmoMode] = useState<TransformGizmoMode>('translate');
  const [showGrid, setShowGrid] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isOrthographic, setIsOrthographic] = useState(false);
  const [actualFps, setActualFps] = useState(60);
  const [viewportContextMenu, setViewportContextMenu] = useState<{ x: number; y: number } | null>(
    null
  );

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(null);
  const meshMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const particlesMapRef = useRef<Map<string, { system: THREE.Points; particlesData: any[] }>>(new Map());
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const selectedOutlineRef = useRef<THREE.BoxHelper | null>(null);

  // Active play physics state map
  const physicsVelocityMapRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const inputKeysRef = useRef<Set<string>>(new Set());

  // Handle WASD / Arrow Key listener for Play mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      inputKeysRef.current.add(e.code);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      inputKeysRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Focus Selected Object Function (Shortcut: F)
  const handleFocusSelected = React.useCallback(() => {
    if (!selectedObjectId || !cameraRef.current) return;
    const mesh = meshMapRef.current.get(selectedObjectId);
    if (mesh) {
      const pos = mesh.position;
      cameraRef.current.position.set(pos.x + 3, pos.y + 4, pos.z + 5);
      cameraRef.current.lookAt(pos.x, pos.y, pos.z);
    }
  }, [selectedObjectId]);

  // Keyboard shortcut handler (W, E, R, F, Ctrl+G)
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'w' || e.key === 'W') setGizmoMode('translate');
      if (e.key === 'e' || e.key === 'E') setGizmoMode('rotate');
      if (e.key === 'r' || e.key === 'R') setGizmoMode('scale');
      if (e.key === 'f' || e.key === 'F') handleFocusSelected();
      if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        setShowGrid((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [selectedObjectId, handleFocusSelected]);

  // Main Three.js Initialization
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneSettings.fogColor || '#0a0e27');
    scene.fog = new THREE.FogExp2(sceneSettings.fogColor || '#0a0e27', 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 8, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Grid Helper
    const gridHelper = new THREE.GridHelper(40, 40, 0x6366f1, 0x27273a);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Orbit Mouse Control State
    let isMouseDown = false;
    let mouseButton = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      mouseButton = e.button;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || !cameraRef.current) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (mouseButton === 0 || mouseButton === 2) {
        // Orbit rotate
        const speed = 0.005;
        const radius = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        let theta = Math.atan2(camera.position.x, camera.position.z);
        let phi = Math.acos(camera.position.y / radius);

        theta -= dx * speed;
        phi -= dy * speed;
        phi = Math.max(0.05, Math.min(Math.PI - 0.05, phi));

        camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = radius * Math.cos(phi);
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(0, 0, 0);
      } else if (mouseButton === 1) {
        // Pan
        const speed = 0.015;
        camera.position.x -= dx * speed;
        camera.position.y += dy * speed;
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!cameraRef.current) return;
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      cameraRef.current.position.multiplyScalar(factor);
    };

    const domCanvas = canvasRef.current;
    domCanvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domCanvas.addEventListener('wheel', handleWheel, { passive: true });

    // Handle Resize
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w === 0 || h === 0) return;

      if ('aspect' in cameraRef.current) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
      }
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      domCanvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domCanvas.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, [sceneSettings.fogColor]);

  // Update Three.js Objects when `objects` prop changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old meshes
    meshMapRef.current.forEach((obj) => scene.remove(obj));
    meshMapRef.current.clear();
    particlesMapRef.current.forEach((p) => scene.remove(p.system));
    particlesMapRef.current.clear();

    // Re-create lights & objects
    objects.forEach((obj) => {
      if (obj.visible === false) return;

      if (obj.type === 'Light' && obj.components.light) {
        const lightComp = obj.components.light;
        let light: THREE.Light;
        if (lightComp.lightType === 'directional') {
          const dirLight = new THREE.DirectionalLight(lightComp.color, lightComp.intensity);
          dirLight.castShadow = lightComp.castShadow;
          if (dirLight.shadow) {
            dirLight.shadow.mapSize.width = lightComp.shadowMapSize || 2048;
            dirLight.shadow.mapSize.height = lightComp.shadowMapSize || 2048;
            dirLight.shadow.bias = lightComp.shadowBias || 0.0001;
          }
          light = dirLight;
        } else {
          light = new THREE.AmbientLight(lightComp.color, lightComp.intensity);
        }
        light.position.set(...obj.position);
        scene.add(light);
        meshMapRef.current.set(obj.id, light);
      } else if (obj.type === 'ParticleEmitter' && obj.components.particleSystem) {
        const ps = obj.components.particleSystem;
        const particleCount = ps.maxParticles || 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const particlesData: any[] = [];

        const startColor = new THREE.Color(ps.color.startColor);
        const endColor = new THREE.Color(ps.color.endColor);

        for (let i = 0; i < particleCount; i++) {
          const px = (Math.random() - 0.5) * 1.5 + obj.position[0];
          const py = Math.random() * 2 + obj.position[1];
          const pz = (Math.random() - 0.5) * 1.5 + obj.position[2];

          positions[i * 3] = px;
          positions[i * 3 + 1] = py;
          positions[i * 3 + 2] = pz;

          colors[i * 3] = startColor.r;
          colors[i * 3 + 1] = startColor.g;
          colors[i * 3 + 2] = startColor.b;

          particlesData.push({
            position: new THREE.Vector3(px, py, pz),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * ps.speed[0],
              Math.random() * ps.speed[1] + 1,
              (Math.random() - 0.5) * ps.speed[0]
            ),
            life: Math.random() * ps.lifetime[1],
            maxLife: ps.lifetime[1],
          });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
          size: ps.size[1] || 0.3,
          vertexColors: true,
          blending: ps.blending === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending,
          transparent: true,
          depthWrite: false,
        });

        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);
        particlesMapRef.current.set(obj.id, { system: particleSystem, particlesData });
      } else if (obj.components.meshRenderer) {
        const mr = obj.components.meshRenderer;
        let geometry: THREE.BufferGeometry;

        if (mr.geometryType === 'sphere') {
          geometry = new THREE.SphereGeometry(0.8, 32, 32);
        } else if (mr.geometryType === 'cylinder') {
          geometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
        } else if (mr.geometryType === 'plane') {
          geometry = new THREE.PlaneGeometry(1, 1);
        } else if (mr.geometryType === 'capsule') {
          geometry = new THREE.CapsuleGeometry(0.5, 1, 16, 32);
        } else {
          geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        const mat = mr.material;
        const material = new THREE.MeshStandardMaterial({
          color: mat.color || '#6366f1',
          roughness: mat.roughness ?? 0.5,
          metalness: mat.metallic ?? 0.2,
          emissive: mat.emissive || '#000000',
          emissiveIntensity: mat.emissiveIntensity || 0,
          wireframe: isWireframe,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...obj.position);
        mesh.rotation.set(
          THREE.MathUtils.degToRad(obj.rotation[0]),
          THREE.MathUtils.degToRad(obj.rotation[1]),
          THREE.MathUtils.degToRad(obj.rotation[2])
        );
        mesh.scale.set(...obj.scale);
        mesh.castShadow = mr.castShadow;
        mesh.receiveShadow = mr.receiveShadow;
        mesh.userData = { id: obj.id };

        scene.add(mesh);
        meshMapRef.current.set(obj.id, mesh);
      }
    });
  }, [objects, isWireframe]);

  // Handle Selected Object Outline Box
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (selectedOutlineRef.current) {
      scene.remove(selectedOutlineRef.current);
      selectedOutlineRef.current = null;
    }

    if (selectedObjectId) {
      const selectedMesh = meshMapRef.current.get(selectedObjectId);
      if (selectedMesh) {
        const outline = new THREE.BoxHelper(selectedMesh, 0x6366f1);
        scene.add(outline);
        selectedOutlineRef.current = outline;
      }
    }
  }, [selectedObjectId, objects]);

  // Main Render & Simulation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const renderLoop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // FPS Counter calculation
      frameCount++;
      if (currentTime - fpsTimer >= 1000) {
        setActualFps(frameCount);
        frameCount = 0;
        fpsTimer = currentTime;
      }

      // Particle Systems update loop
      particlesMapRef.current.forEach(({ system, particlesData }) => {
        const positions = system.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particlesData.length; i++) {
          const p = particlesData[i];
          p.position.addScaledVector(p.velocity, delta);
          p.life += delta;

          if (p.life >= p.maxLife) {
            p.position.set(
              (Math.random() - 0.5) * 1.5 + 4,
              Math.random() * 0.2,
              (Math.random() - 0.5) * 1.5 - 3
            );
            p.life = 0;
          }

          positions[i * 3] = p.position.x;
          positions[i * 3 + 1] = p.position.y;
          positions[i * 3 + 2] = p.position.z;
        }
        system.geometry.attributes.position.needsUpdate = true;
      });

      // Simulation in Play Mode
      if (playState === 'playing') {
        const playerObj = objects.find((o) => o.id === 'uuid-player-group');
        if (playerObj) {
          const mesh = meshMapRef.current.get(playerObj.id);
          if (mesh) {
            const dt = Math.min(delta, 0.05);
            let dx = 0;
            let dz = 0;

            if (inputKeysRef.current.has('KeyW') || inputKeysRef.current.has('ArrowUp')) dz -= 5 * dt;
            if (inputKeysRef.current.has('KeyS') || inputKeysRef.current.has('ArrowDown')) dz += 5 * dt;
            if (inputKeysRef.current.has('KeyA') || inputKeysRef.current.has('ArrowLeft')) dx -= 5 * dt;
            if (inputKeysRef.current.has('KeyD') || inputKeysRef.current.has('ArrowRight')) dx += 5 * dt;

            mesh.position.x += dx;
            mesh.position.z += dz;

            // Simple Jump Physics
            let velY = physicsVelocityMapRef.current.get(playerObj.id)?.y || 0;
            if (inputKeysRef.current.has('Space') && mesh.position.y <= 1.05) {
              velY = 7.0;
            } else if (mesh.position.y > 1.0) {
              velY += sceneSettings.gravity[1] * dt;
            }

            mesh.position.y += velY * dt;
            if (mesh.position.y < 1.0) {
              mesh.position.y = 1.0;
              velY = 0;
            }

            physicsVelocityMapRef.current.set(playerObj.id, new THREE.Vector3(0, velY, 0));
          }
        }
      }

      // Update selected outline position
      if (selectedOutlineRef.current) {
        selectedOutlineRef.current.update();
      }

      // Render Three.js Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [playState, objects, sceneSettings]);

  // Click Raycaster for Object Selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    if (intersects.length > 0) {
      for (const hit of intersects) {
        if (hit.object.userData && hit.object.userData.id) {
          onSelectObject(hit.object.userData.id);
          return;
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full bg-[#0a0d24] relative overflow-hidden flex flex-col select-none"
      onClick={() => setViewportContextMenu(null)}
    >
      {/* Top Viewport Gizmo Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-1 bg-[#1a1f3a]/90 backdrop-blur-md border border-[#27272a] p-1 rounded-lg shadow-xl text-xs">
        {/* Transform Tools */}
        <button
          onClick={() => setGizmoMode('translate')}
          className={`p-1.5 rounded transition ${
            gizmoMode === 'translate'
              ? 'bg-[#6366f1] text-white'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#2a2a3a]'
          }`}
          title="Move Tool (W)"
        >
          <Move size={15} />
        </button>
        <button
          onClick={() => setGizmoMode('rotate')}
          className={`p-1.5 rounded transition ${
            gizmoMode === 'rotate'
              ? 'bg-[#6366f1] text-white'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#2a2a3a]'
          }`}
          title="Rotate Tool (E)"
        >
          <RotateCw size={15} />
        </button>
        <button
          onClick={() => setGizmoMode('scale')}
          className={`p-1.5 rounded transition ${
            gizmoMode === 'scale'
              ? 'bg-[#6366f1] text-white'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#2a2a3a]'
          }`}
          title="Scale Tool (R)"
        >
          <Maximize size={15} />
        </button>

        <div className="h-4 w-px bg-[#27272a] mx-1" />

        {/* View Toggles */}
        <button
          onClick={() => {
            setShowGrid(!showGrid);
            if (gridHelperRef.current) gridHelperRef.current.visible = !showGrid;
          }}
          className={`p-1.5 rounded transition ${
            showGrid ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:text-zinc-200'
          }`}
          title="Toggle Grid (Ctrl+G)"
        >
          <Grid size={15} />
        </button>

        <button
          onClick={() => setIsWireframe(!isWireframe)}
          className={`p-1.5 rounded transition ${
            isWireframe ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:text-zinc-200'
          }`}
          title="Toggle Wireframe View"
        >
          <Eye size={15} />
        </button>

        <button
          onClick={() => setIsOrthographic(!isOrthographic)}
          className={`p-1.5 rounded transition ${
            isOrthographic ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:text-zinc-200'
          }`}
          title="Perspective / Orthographic View"
        >
          <Camera size={15} />
        </button>

        {selectedObjectId && (
          <button
            onClick={handleFocusSelected}
            className="p-1.5 rounded text-amber-400 hover:bg-[#2a2a3a] transition"
            title="Focus Camera on Selected Object (F)"
          >
            <Focus size={15} />
          </button>
        )}
      </div>

      {/* Top Right Viewport Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
        <button
          onClick={onToggleFullViewport}
          className="p-1.5 rounded-lg bg-[#1a1f3a]/90 backdrop-blur-md border border-[#27272a] text-zinc-300 hover:text-white hover:bg-[#6366f1] transition shadow-xl"
          title={isFullViewport ? 'Exit Full Viewport' : 'Maximize 3D Viewport'}
        >
          <Maximize2 size={15} />
        </button>

        {/* FPS Indicator Badge */}
        <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#27272a] px-2.5 py-1 rounded-lg shadow-xl text-[11px] font-mono flex items-center space-x-1.5 text-zinc-300">
          <span
            className={`w-2 h-2 rounded-full ${
              actualFps >= 50 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{actualFps} FPS</span>
        </div>
      </div>

      {/* Center 3D Three.js Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setViewportContextMenu({ x: e.clientX, y: e.clientY });
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Viewport Overlay Controls Guide */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none text-[11px] text-zinc-400 bg-[#0a0e27]/80 backdrop-blur-md border border-[#27272a] px-3 py-1.5 rounded-lg flex items-center space-x-3 shadow-lg">
        <span>Mouse Drag: Orbit Camera</span>
        <span>Scroll: Zoom</span>
        <span>WASD: Move Character in Play Mode</span>
      </div>

      {/* Right Click Viewport Context Menu */}
      {viewportContextMenu && (
        <div
          style={{ top: viewportContextMenu.y, left: viewportContextMenu.x }}
          className="fixed z-50 bg-[#1a1f3a] border border-[#27272a] rounded-md shadow-2xl py-1 w-44 text-xs text-zinc-200"
        >
          <button
            onClick={() => onAddPrimitive('box')}
            className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
          >
            <Plus size={13} />
            <span>Add Cube</span>
          </button>
          <button
            onClick={() => onAddPrimitive('sphere')}
            className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
          >
            <Plus size={13} />
            <span>Add Sphere</span>
          </button>
          <button
            onClick={() => onAddPrimitive('light')}
            className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
          >
            <Plus size={13} />
            <span>Add Light Source</span>
          </button>
        </div>
      )}
    </div>
  );
};
