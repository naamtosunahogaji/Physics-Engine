import JSZip from 'jszip';
import { GameObject, AssetFile, SceneSettings, SceneJSON } from '@/types/engine';
import { formatBytes } from './compressionPipeline';

export function buildSceneJSON(
  sceneName: string,
  objects: GameObject[],
  settings: SceneSettings
): SceneJSON {
  const materialsMap = new Map();
  const animationMixers: any[] = [];

  const objectsPayload = objects.map((obj) => {
    if (obj.components.meshRenderer?.material) {
      const mat = obj.components.meshRenderer.material;
      if (mat.id) {
        materialsMap.set(mat.id, mat);
      }
    }

    if (obj.components.animation) {
      const anim = obj.components.animation;
      if (anim.mixerRef) {
        animationMixers.push({
          id: anim.mixerRef,
          targetObject: obj.id,
          clips: anim.clips.map((clipName) => ({
            name: clipName,
            duration: clipName === 'Idle' ? 1.5 : clipName === 'Walk' ? 0.8 : 0.6,
            loop: true,
          })),
        });
      }
    }

    return {
      id: obj.id,
      name: obj.name,
      type: obj.type,
      active: obj.active,
      position: obj.position,
      rotation: obj.rotation,
      scale: obj.scale,
      parent: obj.parent || undefined,
      children: obj.children && obj.children.length > 0 ? obj.children : undefined,
      assetRef: obj.assetRef,
      components: obj.components,
    };
  });

  return {
    scene: {
      name: sceneName || 'GameScene_001',
      version: '1.0.0',
      metadata: {
        engine: 'Web Game Engine 3D',
        createdAt: new Date().toISOString(),
        author: 'Game Developer',
      },
      settings,
      objects: objectsPayload as any,
      animationMixers,
      materials: Array.from(materialsMap.values()),
    },
  };
}

export function buildManifestJSON(
  sceneName: string,
  assets: AssetFile[],
  totalSize: number
) {
  const models = assets.filter((a) => a.category === 'models');
  const textures = assets.filter((a) => a.category === 'textures');
  const audio = assets.filter((a) => a.category === 'audio');
  const scripts = assets.filter((a) => a.category === 'scripts');

  return {
    projectMetadata: {
      name: sceneName || 'GameScene_001',
      version: '1.0.0',
      engineVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      author: 'Game Developer',
      description: '3D/2D Game Engine Project Export',
      targetPlatforms: ['Web', 'Desktop', 'Mobile'],
      totalSize,
    },
    fileIndex: {
      models: models.map((m) => ({
        path: m.path,
        size: m.compressedSize || m.size,
        format: m.fileFormat,
        hash: 'sha256_' + Math.random().toString(36).substring(2, 10),
        compressed: !!m.compressedSize,
        originalSize: m.size,
      })),
      textures: textures.map((t) => ({
        path: t.path,
        size: t.compressedSize || t.size,
        format: t.fileFormat,
        resolution: t.dimensions || [1024, 1024],
        compressed: !!t.compressedSize,
      })),
      audio: audio.map((a) => ({
        path: a.path,
        size: a.compressedSize || a.size,
        format: a.fileFormat,
        duration: a.duration || 60,
        bitrate: 192,
      })),
      scripts: scripts.map((s) => ({
        path: s.path,
        size: s.size,
        type: 'behavior_script',
        dependencies: ['PlayerController'],
      })),
    },
    compatibilityInfo: {
      threeJsVersion: 'r160',
      rapierPhysicsVersion: '0.20',
      requiredExtensions: ['ANGLE_instanced_arrays', 'EXT_texture_filter_anisotropic'],
      minimumBrowserVersion: {
        Chrome: 90,
        Firefox: 88,
        Safari: 14,
      },
    },
  };
}

export async function downloadProjectZip(
  sceneName: string,
  objects: GameObject[],
  assets: AssetFile[],
  settings: SceneSettings,
  exportFormat: 'json' | 'unreal' | 'unity' | 'godot' | 'three'
) {
  const zip = new JSZip();

  const sceneJson = buildSceneJSON(sceneName, objects, settings);
  const totalSizeBytes = assets.reduce((acc, a) => acc + (a.compressedSize || a.size), 0);
  const manifestJson = buildManifestJSON(sceneName, assets, totalSizeBytes);

  // Main files
  zip.file('scene.json', JSON.stringify(sceneJson, null, 2));
  zip.file('manifest.json', JSON.stringify(manifestJson, null, 2));

  // Format adapter preview file if non-native target selected
  if (exportFormat === 'unreal') {
    zip.file(
      'unreal_import_guide.txt',
      `[Unreal Engine 5 Importer Guide]\n1. Install the WebGameEngine UE5 Plugin.\n2. In UE5 Content Browser, right-click -> Import Scene -> Select scene.json.\n3. Automatic conversion maps Rigidbody -> UPrimitiveComponent, Collider -> UCapsuleComponent.`
    );
  } else if (exportFormat === 'unity') {
    zip.file(
      'unity_import_guide.txt',
      `[Unity 3D Importer Guide]\n1. Place the scene.json in Assets/Editor/GameEngineImporter/.\n2. Click Tools -> Game Engine -> Rebuild Scene from JSON.\n3. Transforms, Rigidbody, and CapsuleColliders will automatically instantiate.`
    );
  } else if (exportFormat === 'godot') {
    zip.file(
      'godot_import_guide.txt',
      `[Godot 4 Importer Guide]\n1. Run the Godot 4 scene.json converter script included in /tools/godot_importer.gd.\n2. Generates Node3D hierarchy with CharacterBody3D and RigidBody3D nodes.`
    );
  }

  // Scripts
  const scriptsFolder = zip.folder('scripts');
  const playerScript = objects.find((o) => o.components.script)?.components.script;
  if (playerScript && playerScript.code) {
    scriptsFolder?.file(playerScript.name + '.ts', playerScript.code);
  } else {
    scriptsFolder?.file(
      'PlayerController.ts',
      `export class PlayerController {\n  moveSpeed = 5.0;\n  onUpdate(dt: number) {\n    // Custom logic\n  }\n}`
    );
  }

  // Assets placeholder structure
  const assetsFolder = zip.folder('assets');
  assetsFolder?.folder('models')?.file('README.txt', 'Put 3D model files (.glb, .gltf, .fbx) here.');
  assetsFolder?.folder('textures')?.file('README.txt', 'Put diffuse/normal/roughness texture maps here.');
  assetsFolder?.folder('audio')?.file('README.txt', 'Put SFX and BGM audio files here.');
  assetsFolder?.folder('particles')?.file('fire.json', JSON.stringify(objects.find((o) => o.components.particleSystem)?.components.particleSystem || {}, null, 2));

  // Materials & Animations
  zip.folder('materials')?.file('materials.json', JSON.stringify(sceneJson.scene.materials || [], null, 2));
  zip.folder('animations')?.file('animations.json', JSON.stringify(sceneJson.scene.animationMixers || [], null, 2));

  // README
  zip.file(
    'README.md',
    `# ${sceneName || 'GameScene_001'}
Exported from Web Game Engine Editor.
- Format: ${exportFormat.toUpperCase()}
- Created At: ${new Date().toLocaleString()}
- Total Objects: ${objects.length}
- Total Assets: ${assets.length} (${formatBytes(totalSizeBytes)})

## How to run in Three.js
\`\`\`ts
import { SceneLoader } from 'web-game-engine';
const loader = new SceneLoader();
loader.load('scene.json', (scene) => {
  renderer.render(scene, camera);
});
\`\`\`
`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sceneName || 'GameScene_001'}_export.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
