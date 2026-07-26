import { GameObject, AssetFile, SceneSettings } from '@/types/engine';

export const initialSceneSettings: SceneSettings = {
  gravity: [0, -9.81, 0],
  fogColor: '#0a0e27',
  fogDistance: 80,
  ambientLight: {
    color: '#ffffff',
    intensity: 0.5,
  },
  fpsLimit: 60,
  animateInEditor: true,
  renderQuality: 'high',
};

export const initialGameObjects: GameObject[] = [
  {
    id: 'uuid-camera-main',
    name: 'Main Camera',
    type: 'Camera',
    active: true,
    visible: true,
    locked: false,
    position: [0, 6, 12],
    rotation: [-20, 0, 0],
    scale: [1, 1, 1],
    components: {
      transform: {
        position: [0, 6, 12],
        rotation: [-20, 0, 0],
        scale: [1, 1, 1],
      },
      camera: {
        fov: 60,
        near: 0.1,
        far: 1000,
        isMain: true,
        orthographic: false,
      },
    },
  },
  {
    id: 'uuid-light-sun',
    name: 'Sun_Light',
    type: 'Light',
    active: true,
    visible: true,
    locked: false,
    position: [10, 20, 10],
    rotation: [-45, 30, 0],
    scale: [1, 1, 1],
    components: {
      transform: {
        position: [10, 20, 10],
        rotation: [-45, 30, 0],
        scale: [1, 1, 1],
      },
      light: {
        lightType: 'directional',
        color: '#ffffff',
        intensity: 1.2,
        castShadow: true,
        shadowMapSize: 2048,
        shadowBias: 0.0001,
      },
    },
  },
  {
    id: 'uuid-player-group',
    name: 'Player',
    type: 'Group',
    active: true,
    visible: true,
    locked: false,
    position: [0, 1, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    children: ['uuid-player-body', 'uuid-player-head'],
    components: {
      transform: {
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      rigidbody: {
        type: 'dynamic',
        mass: 70,
        drag: 0.1,
        angularDrag: 0.05,
        useGravity: true,
        isKinematic: false,
        freezePosition: [false, false, false],
        freezeRotation: [true, false, true],
      },
      collider: {
        type: 'capsule',
        radius: 0.5,
        height: 1.8,
        center: [0, 0.9, 0],
        isTrigger: false,
        physicsMaterial: {
          friction: 0.4,
          restitution: 0.0,
          density: 1.0,
        },
      },
      script: {
        name: 'PlayerController',
        path: '/scripts/PlayerController.ts',
        enabled: true,
        code: `// PlayerController.ts
export class PlayerController {
  moveSpeed = 5.0;
  jumpForce = 6.0;
  jumpCooldown = 0.2;

  onUpdate(dt: number, input: any, transform: any, rigidbody: any) {
    let dx = 0, dz = 0;
    if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) dz -= 1;
    if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) dz += 1;
    if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) dx -= 1;
    if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) dx += 1;

    if (dx !== 0 || dz !== 0) {
      const len = Math.sqrt(dx*dx + dz*dz);
      dx = (dx / len) * this.moveSpeed * dt;
      dz = (dz / len) * this.moveSpeed * dt;
      transform.position[0] += dx;
      transform.position[2] += dz;
    }

    if (input.isKeyDown('Space') && transform.position[1] <= 1.01) {
      rigidbody.velocity = [0, this.jumpForce, 0];
    }
  }
}`,
        parameters: {
          moveSpeed: 5.0,
          jumpForce: 6.0,
          jumpCooldown: 0.2,
        },
        events: ['onStart', 'onUpdate', 'onPhysicsUpdate', 'onTriggerEnter'],
      },
    },
  },
  {
    id: 'uuid-player-body',
    name: 'Player_Body',
    type: 'Mesh',
    active: true,
    visible: true,
    locked: false,
    parent: 'uuid-player-group',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    assetRef: 'model_player_body.glb',
    components: {
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      meshRenderer: {
        geometryType: 'capsule',
        material: {
          id: 'mat_player',
          name: 'PlayerMaterial',
          type: 'standard',
          color: '#6366f1',
          metallic: 0.2,
          roughness: 0.4,
          emissive: '#000000',
          emissiveIntensity: 0.0,
        },
        castShadow: true,
        receiveShadow: true,
      },
      animation: {
        mixerRef: 'mixer_player_001',
        clips: ['Idle', 'Walk', 'Run', 'Jump'],
        currentClip: 'Idle',
        autoPlay: true,
        transitionSpeed: 0.3,
        isPlaying: true,
      },
    },
  },
  {
    id: 'uuid-player-head',
    name: 'Player_Visor',
    type: 'Mesh',
    active: true,
    visible: true,
    locked: false,
    parent: 'uuid-player-group',
    position: [0, 0.6, 0.25],
    rotation: [0, 0, 0],
    scale: [0.5, 0.3, 0.4],
    components: {
      transform: {
        position: [0, 0.6, 0.25],
        rotation: [0, 0, 0],
        scale: [0.5, 0.3, 0.4],
      },
      meshRenderer: {
        geometryType: 'box',
        material: {
          id: 'mat_visor',
          name: 'VisorMaterial',
          type: 'metallic',
          color: '#38bdf8',
          metallic: 0.9,
          roughness: 0.1,
          emissive: '#0284c7',
          emissiveIntensity: 0.4,
        },
        castShadow: true,
        receiveShadow: true,
      },
    },
  },
  {
    id: 'uuid-terrain-ground',
    name: 'Terrain_Ground',
    type: 'Mesh',
    active: true,
    visible: true,
    locked: true,
    position: [0, 0, 0],
    rotation: [-90, 0, 0],
    scale: [30, 30, 1],
    components: {
      transform: {
        position: [0, 0, 0],
        rotation: [-90, 0, 0],
        scale: [30, 30, 1],
      },
      meshRenderer: {
        geometryType: 'plane',
        material: {
          id: 'mat_ground',
          name: 'GroundGridMat',
          type: 'standard',
          color: '#1e293b',
          metallic: 0.1,
          roughness: 0.8,
          emissive: '#0f172a',
          emissiveIntensity: 0.1,
        },
        castShadow: false,
        receiveShadow: true,
      },
      rigidbody: {
        type: 'static',
        mass: 0,
        drag: 0,
        angularDrag: 0,
        useGravity: false,
        isKinematic: true,
        freezePosition: [true, true, true],
        freezeRotation: [true, true, true],
      },
      collider: {
        type: 'box',
        size: [30, 0.1, 30],
        center: [0, -0.05, 0],
        isTrigger: false,
        physicsMaterial: {
          friction: 0.6,
          restitution: 0.1,
        },
      },
    },
  },
  {
    id: 'uuid-particle-fire',
    name: 'FireParticles',
    type: 'ParticleEmitter',
    active: true,
    visible: true,
    locked: false,
    position: [4, 0.2, -3],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    components: {
      transform: {
        position: [4, 0.2, -3],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      particleSystem: {
        maxParticles: 500,
        emissionRate: 40,
        lifetime: [0.8, 1.8],
        speed: [1.5, 3.5],
        size: [0.15, 0.45],
        color: {
          startColor: '#fbbf24',
          endColor: '#ef4444',
          colorOverLifetime: true,
        },
        forces: {
          gravity: [0, 2.5, 0],
          damping: 0.05,
        },
        blending: 'additive',
      },
    },
  },
  {
    id: 'uuid-prop-cube',
    name: 'Obstacle_Cube',
    type: 'Mesh',
    active: true,
    visible: true,
    locked: false,
    position: [-3, 1, -2],
    rotation: [0, 25, 0],
    scale: [2, 2, 2],
    components: {
      transform: {
        position: [-3, 1, -2],
        rotation: [0, 25, 0],
        scale: [2, 2, 2],
      },
      meshRenderer: {
        geometryType: 'box',
        material: {
          id: 'mat_cube',
          name: 'OrangeGlow',
          type: 'standard',
          color: '#f97316',
          metallic: 0.3,
          roughness: 0.5,
          emissive: '#c2410c',
          emissiveIntensity: 0.2,
        },
        castShadow: true,
        receiveShadow: true,
      },
      rigidbody: {
        type: 'dynamic',
        mass: 15,
        drag: 0.1,
        angularDrag: 0.05,
        useGravity: true,
        isKinematic: false,
        freezePosition: [false, false, false],
        freezeRotation: [false, false, false],
      },
      collider: {
        type: 'box',
        size: [2, 2, 2],
        center: [0, 0, 0],
        isTrigger: false,
        physicsMaterial: {
          friction: 0.5,
          restitution: 0.3,
        },
      },
    },
  },
  {
    id: 'uuid-prop-sphere',
    name: 'Energy_Sphere',
    type: 'Mesh',
    active: true,
    visible: true,
    locked: false,
    position: [3, 1.5, 2],
    rotation: [0, 0, 0],
    scale: [1.5, 1.5, 1.5],
    components: {
      transform: {
        position: [3, 1.5, 2],
        rotation: [0, 0, 0],
        scale: [1.5, 1.5, 1.5],
      },
      meshRenderer: {
        geometryType: 'sphere',
        material: {
          id: 'mat_sphere',
          name: 'EmeraldEnergy',
          type: 'metallic',
          color: '#10b981',
          metallic: 0.8,
          roughness: 0.2,
          emissive: '#059669',
          emissiveIntensity: 0.5,
        },
        castShadow: true,
        receiveShadow: true,
      },
      rigidbody: {
        type: 'dynamic',
        mass: 10,
        drag: 0.05,
        angularDrag: 0.02,
        useGravity: true,
        isKinematic: false,
        freezePosition: [false, false, false],
        freezeRotation: [false, false, false],
      },
      collider: {
        type: 'sphere',
        radius: 0.75,
        center: [0, 0, 0],
        isTrigger: false,
        physicsMaterial: {
          friction: 0.2,
          restitution: 0.8,
        },
      },
    },
  },
];

export const initialAssetFiles: AssetFile[] = [
  {
    id: 'asset-player-glb',
    name: 'character_player.glb',
    path: 'assets/models/character_player.glb',
    category: 'models',
    fileFormat: 'glTF-Binary',
    size: 5242880, // 5.2 MB
    compressedSize: 1677721, // ~1.67 MB after optimization
    metadata: {
      meshes: [
        {
          name: 'Armature_Main',
          type: 'skeleton',
          bonesCount: 42,
          description: 'Humanoid skeletal armature with 42 bones',
        },
        {
          name: 'PlayerBody_Mesh',
          type: 'mesh',
          vertexCount: 15240,
          triangleCount: 5080,
          hasMaterial: true,
        },
      ],
      animations: [
        {
          name: 'Idle',
          duration: 1.5,
          loop: true,
          fps: 30,
          type: 'loop',
          description: 'Stance idle with subtle breathing motion',
        },
        {
          name: 'Walk',
          duration: 0.8,
          loop: true,
          fps: 30,
          type: 'locomotion',
          description: 'Forward stride walking motion loop',
        },
        {
          name: 'Run',
          duration: 0.6,
          loop: true,
          fps: 60,
          type: 'locomotion',
          description: 'High velocity running loop',
        },
        {
          name: 'Jump',
          duration: 0.4,
          loop: false,
          fps: 30,
          type: 'action',
          description: 'Vertical leap push-off frame',
        },
      ],
      materials: [
        {
          name: 'PlayerSuitMat',
          maps: ['diffuse', 'normal', 'roughness'],
          hasPBR: true,
        },
      ],
      boundingBox: {
        min: [-0.5, 0, -0.2],
        max: [0.5, 2.1, 0.2],
        size: [1.0, 2.1, 0.4],
      },
      aiAnalysis: {
        objectType: 'Playable Character',
        inferredPurpose: 'Main player avatar or controllable entity',
        confidence: 0.98,
        suggestedComponents: [
          'Rigidbody',
          'CapsuleCollider',
          'PlayerControllerScript',
          'AnimationMixer',
        ],
        recommendations: [
          'Attach capsule collider (height: 2.1m, radius: 0.5m)',
          'Lock X/Z rotations on Rigidbody to prevent tipping',
          'Map WASD keys to PlayerController input system',
        ],
      },
    },
  },
  {
    id: 'asset-terrain-glb',
    name: 'terrain_chunk_01.glb',
    path: 'assets/models/terrain_chunk_01.glb',
    category: 'models',
    fileFormat: 'glTF-Binary',
    size: 8388608, // 8.4 MB
    compressedSize: 2516582,
    metadata: {
      meshes: [
        {
          name: 'TerrainMesh',
          type: 'mesh',
          vertexCount: 45000,
          triangleCount: 15000,
          hasMaterial: true,
        },
      ],
      boundingBox: {
        min: [-15, -1, -15],
        max: [15, 0, 15],
        size: [30, 1, 30],
      },
      aiAnalysis: {
        objectType: 'Environment Terrain',
        inferredPurpose: 'Static ground collision or world base',
        confidence: 0.95,
        suggestedComponents: ['Static Rigidbody', 'Box Collider / Mesh Collider'],
        recommendations: ['Mark as static object', 'Enable receive shadows only'],
      },
    },
  },
  {
    id: 'asset-tree-obj',
    name: 'pine_tree.obj',
    path: 'assets/models/pine_tree.obj',
    category: 'models',
    fileFormat: 'Wavefront OBJ',
    size: 2097152,
    compressedSize: 734003,
  },
  {
    id: 'asset-diffuse-png',
    name: 'player_skin_diffuse.png',
    path: 'assets/textures/player_skin_diffuse.png',
    category: 'textures',
    fileFormat: 'PNG (2048x2048)',
    size: 3145728,
    compressedSize: 838860,
    dimensions: [2048, 2048],
  },
  {
    id: 'asset-normal-jpg',
    name: 'ground_normal.jpg',
    path: 'assets/textures/ground_normal.jpg',
    category: 'textures',
    fileFormat: 'JPEG (1024x1024)',
    size: 1048576,
    compressedSize: 314572,
    dimensions: [1024, 1024],
  },
  {
    id: 'asset-jump-mp3',
    name: 'jump_sfx.mp3',
    path: 'assets/audio/sfx/jump_sfx.mp3',
    category: 'audio',
    fileFormat: 'MP3 Audio (44.1kHz)',
    size: 153600,
    duration: 0.8,
  },
  {
    id: 'asset-bgm-ogg',
    name: 'cyberpunk_theme.ogg',
    path: 'assets/audio/music/cyberpunk_theme.ogg',
    category: 'audio',
    fileFormat: 'OGG Vorbis (192kbps)',
    size: 4194304,
    duration: 142.5,
  },
  {
    id: 'asset-fire-json',
    name: 'fire_particles.json',
    path: 'assets/particles/fire_particles.json',
    category: 'particles',
    fileFormat: 'JSON Particle System',
    size: 4096,
  },
  {
    id: 'asset-script-player',
    name: 'PlayerController.ts',
    path: 'scripts/PlayerController.ts',
    category: 'scripts',
    fileFormat: 'TypeScript Script',
    size: 12288,
  },
];
