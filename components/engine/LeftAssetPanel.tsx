'use client';

import React, { useState } from 'react';
import {
  Box,
  Image as ImageIcon,
  Music,
  Sparkles,
  FileCode,
  Search,
  UploadCloud,
  File,
  Eye,
  Trash2,
  Copy,
  Zap,
  Info,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { AssetFile } from '@/types/engine';
import { formatBytes } from '@/lib/engine/compressionPipeline';

interface LeftAssetPanelProps {
  assets: AssetFile[];
  onSelectAssetForPreview: (asset: AssetFile) => void;
  onImportAssetFiles: (files: FileList) => void;
  onDeleteAsset: (assetId: string) => void;
  onOpenCompressionModal: () => void;
}

export const LeftAssetPanel: React.FC<LeftAssetPanelProps> = ({
  assets,
  onSelectAssetForPreview,
  onImportAssetFiles,
  onDeleteAsset,
  onOpenCompressionModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; asset: AssetFile } | null>(
    null
  );

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    models: true,
    textures: true,
    audio: true,
    particles: true,
    scripts: true,
  });

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImportAssetFiles(e.dataTransfer.files);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'models':
        return <Box size={14} className="text-indigo-400" />;
      case 'textures':
        return <ImageIcon size={14} className="text-emerald-400" />;
      case 'audio':
        return <Music size={14} className="text-amber-400" />;
      case 'particles':
        return <Sparkles size={14} className="text-purple-400" />;
      case 'scripts':
        return <FileCode size={14} className="text-cyan-400" />;
      default:
        return <File size={14} className="text-zinc-400" />;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, asset: AssetFile) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, asset });
  };

  return (
    <aside
      className="w-60 bg-[#1a1f3a] border-r border-[#27272a] flex flex-col h-full text-zinc-300 select-none relative z-10"
      onClick={() => setContextMenu(null)}
    >
      {/* Header */}
      <div className="p-3 border-b border-[#27272a] flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Assets
        </h3>
        <button
          onClick={onOpenCompressionModal}
          className="p-1 rounded bg-[#2a2a3a] hover:bg-[#3a3a4a] text-indigo-300 text-[11px] font-medium border border-[#3a3a4a] flex items-center space-x-1"
          title="Automated Compression Pipeline"
        >
          <Zap size={12} className="text-amber-400" />
          <span>Compress</span>
        </button>
      </div>

      {/* Search Bar & Category Filter */}
      <div className="p-2 space-y-2 border-b border-[#27272a]">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-600" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0e27] border border-[#27272a] rounded pl-8 pr-2 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px] custom-scrollbar">
          {['all', 'models', 'textures', 'audio', 'particles', 'scripts'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded capitalize whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#6366f1] text-white font-medium'
                  : 'bg-[#0a0e27] text-zinc-400 hover:text-zinc-200 border border-[#27272a]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`m-2 p-2.5 border border-dashed rounded flex flex-col items-center justify-center text-center transition cursor-pointer ${
          isDraggingOver
            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
            : 'border-[#27272a] bg-[#0a0e27]/50 hover:border-indigo-500/50 hover:bg-[#2a2a3a]/30'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".glb,.gltf,.fbx,.obj,.usdz,.png,.jpg,.jpeg,.svg,.mp3,.wav,.ogg,.json,.ts"
          onChange={(e) => e.target.files && onImportAssetFiles(e.target.files)}
          className="hidden"
          id="file-upload-input"
        />
        <label htmlFor="file-upload-input" className="cursor-pointer w-full flex flex-col items-center">
          <UploadCloud size={18} className="text-indigo-400 mb-1" />
          <span className="text-xs font-medium text-zinc-200">Drag & Drop Assets</span>
          <span className="text-[10px] text-zinc-500 mt-0.5">.glb, .fbx, .png, .mp3, .json</span>
        </label>
      </div>

      {/* Assets Tree / Folder List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar text-xs">
        {selectedCategory === 'all' ? (
          (['models', 'textures', 'audio', 'particles', 'scripts'] as const).map((category) => {
            const categoryAssets = filteredAssets.filter((a) => a.category === category);
            if (categoryAssets.length === 0 && searchQuery) return null;

            return (
              <div key={category} className="mb-2">
                <button
                  onClick={() => toggleFolder(category)}
                  className="w-full flex items-center justify-between p-1.5 rounded hover:bg-[#2a2a3a] text-xs text-zinc-300 font-medium tracking-wide uppercase"
                >
                  <div className="flex items-center space-x-1.5">
                    {expandedFolders[category] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {getCategoryIcon(category)}
                    <span className="capitalize">{category}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    {categoryAssets.length}
                  </span>
                </button>

                {expandedFolders[category] && (
                  <div className="pl-4 mt-1 space-y-1">
                    {categoryAssets.map((asset) => (
                      <div
                        key={asset.id}
                        onContextMenu={(e) => handleContextMenu(e, asset)}
                        onClick={() => onSelectAssetForPreview(asset)}
                        className="group flex items-center justify-between p-1.5 rounded hover:bg-[#2a2a3a] cursor-pointer text-xs transition"
                      >
                        <div className="flex items-center space-x-2 min-w-0 pr-1">
                          {getCategoryIcon(asset.category)}
                          <span className="truncate text-zinc-300 group-hover:text-white font-mono text-[11px]">
                            {asset.name}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          {asset.optimized && (
                            <span className="text-[9px] bg-green-500/20 text-green-400 px-1 rounded font-mono">
                              GPU
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {formatBytes(asset.compressedSize || asset.size)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="space-y-1">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onContextMenu={(e) => handleContextMenu(e, asset)}
                onClick={() => onSelectAssetForPreview(asset)}
                className="group flex items-center justify-between p-1.5 rounded hover:bg-[#2a2a3a] cursor-pointer text-xs transition"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  {getCategoryIcon(asset.category)}
                  <span className="truncate text-zinc-300 group-hover:text-white font-mono text-[11px]">
                    {asset.name}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formatBytes(asset.compressedSize || asset.size)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pipeline Status Box Footer */}
      <div className="mt-auto p-3 bg-[#0a0e27] border-t border-[#27272a]">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
          <span>Pipeline Status</span>
          <span className="text-green-500 font-bold">Optimal</span>
        </div>
        <div className="w-full bg-[#1a1f3a] h-1 rounded-full overflow-hidden">
          <div className="bg-[#6366f1] w-full h-full"></div>
        </div>
        <p className="text-[9px] mt-2 text-zinc-500 uppercase tracking-tighter">
          {assets.length} assets auto-compressed
        </p>
      </div>

      {/* Right Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-[#1a1f3a] border border-[#27272a] rounded-md shadow-2xl py-1 w-44 text-xs text-zinc-200"
        >
          <button
            onClick={() => onSelectAssetForPreview(contextMenu.asset)}
            className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
          >
            <Eye size={13} />
            <span>Preview Asset</span>
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.asset.path);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2"
          >
            <Copy size={13} />
            <span>Copy Path</span>
          </button>
          <button
            onClick={onOpenCompressionModal}
            className="w-full text-left px-3 py-1.5 hover:bg-[#6366f1] hover:text-white flex items-center space-x-2 text-amber-300"
          >
            <Zap size={13} />
            <span>Run Optimizer</span>
          </button>
          <div className="my-1 border-t border-[#27272a]" />
          <button
            onClick={() => {
              onDeleteAsset(contextMenu.asset.id);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center space-x-2 text-red-400"
          >
            <Trash2 size={13} />
            <span>Delete Asset</span>
          </button>
        </div>
      )}
    </aside>
  );
};
