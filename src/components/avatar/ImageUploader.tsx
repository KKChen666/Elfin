import { useState, useRef, useCallback } from 'react';
import { Upload, X, RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageUploaderProps {
  onImageCropped: (base64: string) => void;
  currentImage?: string;
}

export default function ImageUploader({ onImageCropped, currentImage }: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(currentImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
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

  const cropImage = useCallback(() => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 200;
      canvas.width = size;
      canvas.height = size;

      // 清除画布
      ctx.clearRect(0, 0, size, size);

      // 创建圆形裁剪路径
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      // 应用变换
      ctx.save();
      ctx.translate(size / 2 + position.x, size / 2 + position.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      // 绘制图片（居中）
      const drawWidth = size;
      const drawHeight = (img.height / img.width) * size;
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      ctx.restore();

      // 转换为base64
      const croppedBase64 = canvas.toDataURL('image/png');
      setCroppedImage(croppedBase64);
      onImageCropped(croppedBase64);
      setIsProcessing(false);
    };
    img.src = selectedImage;
  }, [selectedImage, position, scale, rotation, onImageCropped]);

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
          className={`w-48 h-48 rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all ${
            isDragging 
              ? 'border-[#E8734A] bg-orange-50 scale-105' 
              : 'border-gray-300 bg-gray-50 hover:border-[#E8734A] hover:bg-orange-50'
          }`}
        >
          <Upload size={40} className={isDragging ? 'text-[#E8734A]' : 'text-gray-400'} />
          <p className="text-sm text-gray-500 mt-2">拖拽或点击上传</p>
          <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式</p>
        </div>
      )}

      {/* 裁剪调整区域 */}
      {selectedImage && !croppedImage && (
        <div className="w-full max-w-sm">
          {/* 预览区域 */}
          <div 
            ref={previewRef}
            className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[#E8734A] shadow-lg"
          >
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <img
                src={selectedImage}
                alt="原图"
                className="max-w-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  transition: 'transform 0.1s ease-out'
                }}
              />
            </div>
            {/* 圆形遮罩 */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]" />
          </div>

          {/* 调整控件 */}
          <div className="space-y-3 bg-white rounded-xl p-4 shadow-sm">
            {/* 缩放 */}
            <div className="flex items-center gap-3">
              <ZoomOut size={16} className="text-gray-500" />
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 accent-[#E8734A]"
              />
              <ZoomIn size={16} className="text-gray-500" />
            </div>

            {/* 旋转 */}
            <div className="flex items-center gap-3">
              <RotateCw size={16} className="text-gray-500" />
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="flex-1 accent-[#E8734A]"
              />
              <span className="text-xs text-gray-500 w-8">{rotation}°</span>
            </div>

            {/* 位置调整提示 */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Move size={14} />
              <span>拖动图片调整位置</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 px-4 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              重置
            </button>
            <button
              type="button"
              onClick={cropImage}
              disabled={isProcessing}
              className="flex-1 py-2.5 bg-[#E8734A] text-white rounded-xl font-medium hover:bg-[#D4633A] transition-colors disabled:opacity-50"
            >
              {isProcessing ? '处理中...' : '确认裁剪'}
            </button>
          </div>
        </div>
      )}

      {/* 裁剪结果预览 */}
      {croppedImage && (
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#E8734A] shadow-lg">
              <img
                src={croppedImage}
                alt="Q版头像"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-sm text-green-600 font-medium">头像裁剪完成</p>
          <button
            type="button"
            onClick={() => {
              setCroppedImage(null);
              // 保留selectedImage以便重新调整
            }}
            className="text-sm text-[#E8734A] hover:underline"
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
