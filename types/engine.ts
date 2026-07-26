export type Vector3Tuple = [number, number, number];

export type ObjectType = 'Group' | 'Mesh' | 'Light' | 'Camera' | 'ParticleEmitter' | 'Empty';

export interface TransformComponent {
  position: Vector3Tuple;
  rotation: Vector3Tuple; // in degrees or radians
  scale: Vector3Tuple;
}

export interface MaterialData {
  id?: string;
  name?: string;
  type: 'standard' | 'metallic' | 'unlit' | 'phong';
  color: string;
  metallic: number;
  roughness: number;
  emissive: string;
  emissiveIntensity: number;
  map?: string;
  normalMap?: string;
  roughnessMap?: string;
  metallicMap?: string;
}

export interface MeshRendererComponent {
  assetPath?: string;
  geometryType?: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'plane' | 'custom';
  material: MaterialData;
  castShadow: boolean;
  receiveShadow: boolean;
}

export interface RigidbodyComponent {
  type: 'dynamic' | 'static' | 'kinematic';
  mass: number;
  drag: number;
  angularDrag: number;
  useGravity: boolean;
  isKinematic: boolean;
  freezePosition: [boolean, boolean, boolean];
  freezeRotation: [boolean, boolean, boolean];
}

export interface PhysicsMaterial {
  friction: number;
  restitution: number;
  density?: number;
}

export interface ColliderComponent {
  type: 'box' | 'sphere' | 'capsule' | 'cylinder';
  radius?: number;
  height?: number;
  size?: Vector3Tuple;
  center: Vector3Tuple;
  isTrigger: boolean;
  physicsMaterial: PhysicsMaterial;
}

export interface ScriptParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  value: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
}

export interface ScriptComponent {
  name: string;
  path: string;
  enabled: boolean;
  code?: string;
  parameters: Record<string, number | string | boolean>;
  events?: string[];
}

export interface AnimationClipData {
  name: string;
  duration: number;
  loop: boolean;
  fps?: number;
}

export interface AnimationComponent {
  mixerRef?: string;
  clips: string[];
  currentClip: string;
  autoPlay: boolean;
  transitionSpeed?: number;
  isPlaying?: boolean;
}

export interface ParticleSystemComponent {
  maxParticles: number;
  emissionRate: number;
  lifetime: [number, number];
  speed: [number, number];
  size: [number, number];
  color: {
    startColor: string;
    endColor: string;
    colorOverLifetime: boolean;
  };
  forces: {
    gravity: Vector3Tuple;
    damping: number;
  };
  texture?: string;
  blending: 'additive' | 'normal';
}

export interface LightComponent {
  lightType: 'directional' | 'point' | 'spot' | 'ambient';
  color: string;
  intensity: number;
  distance?: number;
  castShadow: boolean;
  shadowMapSize?: number;
  shadowBias?: number;
}

export interface CameraComponent {
  fov: number;
  near: number;
  far: number;
  isMain: boolean;
  orthographic: boolean;
}

export interface GameObjectComponents {
  transform: TransformComponent;
  meshRenderer?: MeshRendererComponent;
  rigidbody?: RigidbodyComponent;
  collider?: ColliderComponent;
  script?: ScriptComponent;
  animation?: AnimationComponent;
  particleSystem?: ParticleSystemComponent;
  light?: LightComponent;
  camera?: CameraComponent;
}

export interface GameObject {
  id: string;
  name: string;
  type: ObjectType;
  active: boolean;
  visible?: boolean;
  locked?: boolean;
  parent?: string | null;
  children?: string[];
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
  assetRef?: string;
  components: GameObjectComponents;
}

export interface AssetMetadataParsed {
  meshes?: {
    name: string;
    type: string;
    vertexCount?: number;
    triangleCount?: number;
    bonesCount?: number;
    hasMaterial?: boolean;
    description?: string;
  }[];
  animations?: {
    name: string;
    duration: number;
    loop: boolean;
    fps?: number;
    type?: string;
    description?: string;
  }[];
  materials?: {
    name: string;
    maps?: string[];
    hasPBR?: boolean;
  }[];
  boundingBox?: {
    min: Vector3Tuple;
    max: Vector3Tuple;
    size: Vector3Tuple;
  };
  aiAnalysis?: {
    objectType: string;
    inferredPurpose: string;
    confidence: number;
    suggestedComponents: string[];
    recommendations: string[];
  };
}

export interface AssetFile {
  id: string;
  name: string;
  path: string;
  category: 'models' | 'textures' | 'audio' | 'particles' | 'scripts';
  fileFormat: string;
  size: number;
  compressedSize?: number;
  dimensions?: [number, number];
  duration?: number;
  dataUrl?: string; // object URL or base64 data
  metadata?: AssetMetadataParsed;
  optimized?: boolean;
}

export interface SceneSettings {
  gravity: Vector3Tuple;
  fogColor: string;
  fogDistance: number;
  ambientLight: {
    color: string;
    intensity: number;
  };
  fpsLimit: number; // 0 for unlimited, 15, 30, 60, 120
  animateInEditor: boolean;
  renderQuality: 'high' | 'medium' | 'low';
}

export interface SceneJSON {
  scene: {
    name: string;
    version: string;
    metadata: {
      engine: string;
      createdAt: string;
      author: string;
    };
    settings: SceneSettings;
    objects: GameObject[];
    animationMixers?: any[];
    materials?: MaterialData[];
  };
}

export type TransformGizmoMode = 'translate' | 'rotate' | 'scale' | 'none';

export type PlayState = 'stopped' | 'playing' | 'paused';

export interface EngineLayoutState {
  showLeftPanel: boolean;
  showHierarchyPanel: boolean;
  showInspectorPanel: boolean;
  isFullscreen: boolean;
}

export interface CompressionSettings {
  compressMeshes: boolean;
  quantizeVertices: boolean;
  compressTextures: boolean;
  textureMaxResolution: number; // e.g. 1024 or 2048
  compressAudio: boolean;
  audioTargetBitrate: number; // e.g. 128
  embedSmallFiles: boolean;
  smallFileThresholdKb: number; // e.g. 1024
  gzipJson: boolean;
}

export interface CompressionReport {
  originalTotalBytes: number;
  compressedTotalBytes: number;
  savedBytes: number;
  compressionRatioPercent: number;
  meshSavingsPercent: number;
  textureSavingsPercent: number;
  executionTimeMs: number;
}
