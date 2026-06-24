import { useState, useRef, useCallback } from 'react';
import { Upload, X, Check } from 'lucide-react';

interface ImageUploaderProps {
  onImageCropped: (base64: string) => void;
  currentImage?: string;
}

export default function ImageUploader({ onImageCropped, currentImage }: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(currentImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      processImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const processImage = useCallback((imageSrc: string) => {
    setIsProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置canvas大小为200x200
      const size = 200;
      canvas.width = size;
      canvas.height = size;

      // 计算裁剪区域（假设头部在图片上方1/3处）
      const sourceSize = Math.min(img.width, img.height * 0.6);
      const sourceX = (img.width - sourceSize) / 2;
      const sourceY = img.height * 0.05; // 从顶部5%开始

      // 绘制圆形裁剪
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      // 绘制图片
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceSize, sourceSize * 0.8,
        0, 0, size, size
      );

      // 转换为base64
      const croppedBase64 = canvas.toDataURL('image/png');
      setCroppedImage(croppedBase64);
      onImageCropped(croppedBase64);
      setIsProcessing(false);
    };
    img.src = imageSrc;
  }, [onImageCropped]);

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setCroppedImage(null);
    onImageCropped('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="hidden" />

      {croppedImage ? (
        <div className="relative">
          <img
            src={croppedImage}
            alt="头像"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#E8734A]"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-[#E8734A] transition-colors"
        >
          <Upload size={24} className="text-gray-400" />
          <span className="text-xs text-gray-500 mt-1">上传照片</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-[#E8734A] border-t-transparent rounded-full animate-spin" />
          处理中...
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        上传照片后将自动截取头部作为Q版头像
      </p>
    </div>
  );
}
