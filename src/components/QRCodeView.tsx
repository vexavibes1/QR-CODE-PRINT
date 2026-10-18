import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  label?: string;
}

export function QRCodeView({
  value,
  size = 200,
  className = '',
  darkColor = '#0f172a',
  lightColor = '#ffffff',
  label,
}: QRCodeViewProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2, // render sharp @2x
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setDataUrl(url);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        setError('QR কোড তৈরি করা যায়নি');
      });
  }, [value, size, darkColor, lightColor]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 rounded-lg p-4 text-xs text-rose-600 ${className}`}>
        <span>{error}</span>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-slate-100 rounded-lg animate-pulse ${className}`}
      >
        <span className="text-xs text-slate-400">QR লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img
        src={dataUrl}
        alt={label || 'QR Code'}
        width={size}
        height={size}
        className="rounded-lg shadow-sm border border-slate-200 bg-white p-2"
      />
      {label && <p className="mt-2 text-xs font-medium text-slate-600 text-center">{label}</p>}
    </div>
  );
}
