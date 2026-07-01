import { useState, useRef, useCallback } from 'react';
import { Upload, X, ArrowClockwise, MagnifyingGlassPlus, MagnifyingGlassMinus, ArrowsOutCardinal, MagicWand } from '@phosphor-icons/react';

interface ImageUploaderProps {
  onImageCropped: (base64: string) => void;
  currentImage?: string;
}

type CropShape = 'circle' | 'chibi';

export default function ImageUploader({ onImageCropped, currentImage }: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(currentImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropShape, setCropShape] = useState<CropShape>('circle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      setPosition({ x: 0, y: 0 });
      setScale(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  }, [processFile]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!selectedImage) return;
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [selectedImage, position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [dragStart]);

  const handlePointerUp = useCallback(() => {
    setDragStart(null);
  }, []);

  const cropImage = useCallback(() => {
    if (!selectedImage) return;

    setIsProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (cropShape === 'chibi') {
        // Companion 风格 Q版 - 160x160（与 AvatarPreview 一致）
        const S = 160;
        canvas.width = S;
        canvas.height = S;
        ctx.clearRect(0, 0, S, S);

        const HCX = 80, HCY = 62, HR = 40, BT = 100;
        const skin = '#F5CBA7';
        const cloth = '#202123';
        const STROKE = '#6B4C3B';
        const SW = 2.5;

        // 背景
        ctx.fillStyle = '#F5F5F7';
        ctx.fillRect(0, 0, S, S);

        // 圆形裁剪
        ctx.save();
        ctx.beginPath();
        ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
        ctx.clip();

        // 脖子
        ctx.fillStyle = skin;
        ctx.strokeStyle = STROKE;
        ctx.lineWidth = SW;
        ctx.beginPath();
        ctx.roundRect(HCX - 5, BT - 6, 10, 10, 3);
        ctx.fill();
        ctx.stroke();

        // 身体
        ctx.fillStyle = cloth;
        ctx.beginPath();
        ctx.moveTo(HCX - 22, BT + 2);
        ctx.quadraticCurveTo(HCX - 22, BT - 6, HCX, BT - 6);
        ctx.quadraticCurveTo(HCX + 22, BT - 6, HCX + 22, BT + 2);
        ctx.lineTo(HCX + 26, BT + 36);
        ctx.quadraticCurveTo(HCX + 26, BT + 42, HCX, BT + 42);
        ctx.quadraticCurveTo(HCX - 26, BT + 42, HCX - 26, BT + 36);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = STROKE;
        ctx.lineWidth = SW;
        ctx.stroke();

        // 袖子 + 手
        ctx.fillStyle = cloth;
        ctx.beginPath(); ctx.ellipse(HCX - 24, BT + 6, 8, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(HCX + 24, BT + 6, 8, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = skin;
        ctx.beginPath(); ctx.arc(HCX - 30, BT + 10, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(HCX + 30, BT + 10, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // 领口
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(HCX - 10, BT - 4);
        ctx.quadraticCurveTo(HCX, BT + 4, HCX + 10, BT - 4);
        ctx.stroke();

        // 腿
        ctx.fillStyle = skin;
        ctx.strokeStyle = STROKE;
        ctx.lineWidth = SW;
        ctx.beginPath(); ctx.roundRect(HCX - 12, BT + 38, 10, 16, 5); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.roundRect(HCX + 2, BT + 38, 10, 16, 5); ctx.fill(); ctx.stroke();

        // 鞋
        ctx.fillStyle = '#5C4033';
        ctx.beginPath(); ctx.ellipse(HCX - 7, BT + 56, 8, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(HCX + 7, BT + 56, 8, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // 头像（照片圆形裁剪叠在头部位置）
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.arc(HCX, HCY, HR - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.translate(HCX + position.x, HCY + position.y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);
        const dW = HR * 2;
        const dH = (img.height / img.width) * dW;
        ctx.drawImage(img, -dW / 2, -dH / 2, dW, dH);
        ctx.restore();

      } else {
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, size, size);

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        ctx.save();
        ctx.translate(size / 2 + position.x, size / 2 + position.y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);
        const drawWidth = size;
        const drawHeight = (img.height / img.width) * size;
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();
      }

      const croppedBase64 = canvas.toDataURL('image/png');
      setCroppedImage(croppedBase64);
      onImageCropped(croppedBase64);
      setIsProcessing(false);
    };
    img.src = selectedImage;
  }, [selectedImage, position, scale, rotation, cropShape, onImageCropped]);

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setCroppedImage(null);
    setPosition({ x: 0, y: 0 });
    setScale(1);
    setRotation(0);
    onImageCropped('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setScale(1);
    setRotation(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="hidden" />

      {/* 上传区域 */}
      {!selectedImage && !croppedImage && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full aspect-[4/3] max-w-xs mx-auto rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all duration-200 ${
            isDragging
              ? 'border-[#202123] bg-[#f7f7f8] scale-[1.01]'
              : 'border-gray-200 bg-white active:border-[#202123]'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
            <Upload size={22} className={isDragging ? 'text-[#202123]' : 'text-gray-300'} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-0.5">点击或拖拽上传照片</p>
          <p className="text-[11px] text-gray-300">JPG / PNG</p>
        </div>
      )}

      {/* 裁剪调整区域 */}
      {selectedImage && !croppedImage && (
        <div className="w-full max-w-sm">
          {/* 预览区域 */}
          <div
            ref={previewRef}
            className={`relative mx-auto mb-4 overflow-hidden border-2 border-[#202123] touch-none select-none ${
              cropShape === 'chibi' ? 'w-36 h-40 rounded-2xl' : 'w-36 h-36 rounded-full'
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <img
                src={selectedImage}
                alt="原图"
                className="max-w-none pointer-events-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  transition: dragStart ? 'none' : 'transform 0.15s ease-out'
                }}
              />
            </div>
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.06)]" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`border-2 border-dashed border-white/30 ${
                cropShape === 'chibi' ? 'w-20 h-20 rounded-full mt-[-12px]' : 'w-28 h-28 rounded-full'
              }`} />
            </div>
          </div>

          {/* 裁剪形状选择 */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setCropShape('circle')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                cropShape === 'circle'
                  ? 'bg-[#202123] text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 ${
                cropShape === 'circle' ? 'border-white' : 'border-gray-400'
              }`} />
              圆形头像
            </button>
            <button
              onClick={() => setCropShape('chibi')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                cropShape === 'chibi'
                  ? 'bg-[#202123] text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              <MagicWand size={14} />
              Q版大头
            </button>
          </div>

          {/* 调整控件 */}
          <div className="space-y-3 bg-white rounded-xl p-4 border border-gray-50">
            <div className="flex items-center gap-3">
              <MagnifyingGlassMinus size={14} className="text-gray-400" />
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 h-1"
                style={{ accentColor: '#202123' }}
              />
              <MagnifyingGlassPlus size={14} className="text-gray-400" />
            </div>

            <div className="flex items-center gap-3">
              <ArrowClockwise size={14} className="text-gray-400" />
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="flex-1 h-1"
                style={{ accentColor: '#202123' }}
              />
              <span className="text-[10px] text-gray-400 w-8 text-right">{rotation}°</span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
              <ArrowsOutCardinal size={12} />
              <span>拖动照片调整位置</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-gray-500 text-xs font-medium active:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="py-2 px-3 bg-white border border-gray-200 rounded-xl text-gray-500 text-xs font-medium active:bg-gray-50 transition-colors"
            >
              重置
            </button>
            <button
              type="button"
              onClick={cropImage}
              disabled={isProcessing}
              className="flex-1 py-2 bg-[#202123] text-white rounded-xl text-xs font-semibold active:bg-[#111827] transition-colors disabled:opacity-50"
            >
              {isProcessing ? '处理中...' : '确认裁剪'}
            </button>
          </div>
        </div>
      )}

      {/* 裁剪结果预览 */}
      {croppedImage && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className={`overflow-hidden border-2 border-[#202123] ${
              cropShape === 'chibi' ? 'w-28 h-32 rounded-xl' : 'w-28 h-28 rounded-full'
            }`}
              style={{ boxShadow: '0 4px 16px rgba(0,102,204,0.15)' }}
            >
              <img src={croppedImage} alt="头像" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              <X size={10} />
            </button>
          </div>
          <p className="text-[11px] text-green-600 font-medium">
            {cropShape === 'chibi' ? 'Q版大头完成' : '头像已裁剪'}
          </p>
          <button
            type="button"
            onClick={() => setCroppedImage(null)}
            className="text-[11px] text-[#202123] active:underline"
          >
            重新调整
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

