import { useState, useRef, useCallback } from 'react';
import { Upload, X, RotateCw, ZoomIn, ZoomOut, Move, Wand2 } from 'lucide-react';

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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }, []);

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
        const outSize = 240;
        canvas.width = outSize;
        canvas.height = outSize;
        ctx.clearRect(0, 0, outSize, outSize);

        const headR = 72;
        const headCx = outSize / 2;
        const headCy = headR + 8;

        ctx.save();
        ctx.beginPath();
        ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
        ctx.clip();

        ctx.translate(headCx + position.x, headCy + position.y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);
        const drawW = headR * 2;
        const drawH = (img.height / img.width) * drawW;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        const bodyTop = headCy + headR - 12;
        const bodyCx = headCx;

        ctx.fillStyle = '#FFE4D0';
        ctx.beginPath();
        ctx.moveTo(bodyCx - 30, bodyTop + 8);
        ctx.quadraticCurveTo(bodyCx - 36, bodyTop + 40, bodyCx - 28, bodyTop + 62);
        ctx.lineTo(bodyCx + 28, bodyTop + 62);
        ctx.quadraticCurveTo(bodyCx + 36, bodyTop + 40, bodyCx + 30, bodyTop + 8);
        ctx.quadraticCurveTo(bodyCx, bodyTop - 4, bodyCx - 30, bodyTop + 8);
        ctx.fill();

        ctx.fillStyle = '#E8734A';
        ctx.beginPath();
        ctx.moveTo(bodyCx - 28, bodyTop + 18);
        ctx.quadraticCurveTo(bodyCx - 34, bodyTop + 40, bodyCx - 26, bodyTop + 62);
        ctx.lineTo(bodyCx + 26, bodyTop + 62);
        ctx.quadraticCurveTo(bodyCx + 34, bodyTop + 40, bodyCx + 28, bodyTop + 18);
        ctx.quadraticCurveTo(bodyCx, bodyTop + 10, bodyCx - 28, bodyTop + 18);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bodyCx - 10, bodyTop + 16);
        ctx.quadraticCurveTo(bodyCx, bodyTop + 24, bodyCx + 10, bodyTop + 16);
        ctx.stroke();

        ctx.fillStyle = '#FFE4D0';
        ctx.beginPath();
        ctx.ellipse(bodyCx - 34, bodyTop + 38, 8, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(bodyCx + 34, bodyTop + 38, 8, 6, 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
        ctx.stroke();

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
          className={`w-full max-w-xs aspect-square rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-colors ${
            isDragging
              ? 'border-[#E8734A] bg-orange-50'
              : 'border-gray-200 bg-white hover:border-[#E8734A]'
          }`}
        >
          <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
            <Upload size={24} className={isDragging ? 'text-[#E8734A]' : 'text-gray-400'} />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">拖拽或点击上传照片</p>
          <p className="text-xs text-gray-400">支持 JPG、PNG 格式</p>
        </div>
      )}

      {/* 裁剪调整区域 */}
      {selectedImage && !croppedImage && (
        <div className="w-full max-w-sm">
          {/* 预览区域 */}
          <div
            ref={previewRef}
            className={`relative mx-auto mb-4 overflow-hidden border-2 border-[#E8734A] touch-none select-none ${
              cropShape === 'chibi' ? 'w-40 h-48 rounded-[40%]' : 'w-40 h-40 rounded-full'
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
                cropShape === 'chibi' ? 'w-24 h-24 rounded-full mt-[-16px]' : 'w-28 h-28 rounded-full'
              }`} />
            </div>
          </div>

          {/* 裁剪形状选择 */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setCropShape('circle')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                cropShape === 'circle'
                  ? 'bg-[#E8734A] text-white'
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
                  ? 'bg-[#E8734A] text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              <Wand2 size={14} />
              Q版大头
            </button>
          </div>

          {/* 调整控件 */}
          <div className="space-y-3 bg-white rounded-xl p-4 border border-gray-50">
            <div className="flex items-center gap-3">
              <ZoomOut size={14} className="text-gray-400" />
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 h-1"
                style={{ accentColor: '#E8734A' }}
              />
              <ZoomIn size={14} className="text-gray-400" />
            </div>

            <div className="flex items-center gap-3">
              <RotateCw size={14} className="text-gray-400" />
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="flex-1 h-1"
                style={{ accentColor: '#E8734A' }}
              />
              <span className="text-[10px] text-gray-400 w-8 text-right">{rotation}°</span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
              <Move size={12} />
              <span>拖动照片调整位置</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              重置
            </button>
            <button
              type="button"
              onClick={cropImage}
              disabled={isProcessing}
              className="flex-1 py-2.5 bg-[#E8734A] text-white rounded-xl text-sm font-medium hover:bg-[#D4633A] transition-colors disabled:opacity-50"
            >
              {isProcessing ? '处理中...' : '确认裁剪'}
            </button>
          </div>
        </div>
      )}

      {/* 裁剪结果预览 */}
      {croppedImage && (
        <div className="flex flex-col items-center gap-3 animate-fadeIn">
          <div className="relative">
            <div className="rounded-xl overflow-hidden border-2 border-[#E8734A]">
              <img
                src={croppedImage}
                alt="Q版头像"
                className="w-32 h-32 object-cover"
                style={{ borderRadius: cropShape === 'chibi' ? '10px' : '50%' }}
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              <X size={12} />
            </button>
          </div>
          <p className="text-xs text-green-600 font-medium">
            {cropShape === 'chibi' ? 'Q版大头制作完成' : '头像裁剪完成'}
          </p>
          <button
            type="button"
            onClick={() => setCroppedImage(null)}
            className="text-xs text-[#E8734A] hover:underline"
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
