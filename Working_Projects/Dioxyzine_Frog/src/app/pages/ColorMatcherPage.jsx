import React, { useState, useRef } from 'react';
import { Upload, Droplet, Palette, ArrowRight, Loader2 } from 'lucide-react';
import { SEO } from '../components/common_components/SEO';
import { useNavigate } from 'react-router';

// KHO MÀU GIỮ NGUYÊN
const FABRIC_PALETTE = [
  { name: 'Cotton Candy', hex: '#FFC8DD', cmyk: 'C0-M20-Y0-K0' }, { name: 'Baby Blue', hex: '#A2D2FF', cmyk: 'C40-M10-Y0-K0' }, { name: 'Mint Dream', hex: '#BDE0FE', cmyk: 'C25-M0-Y0-K0' }, { name: 'Sunny Lemon', hex: '#FFED66', cmyk: 'C0-M0-Y60-K0' }, { name: 'Soft Peach', hex: '#FFC09F', cmyk: 'C0-M30-Y30-K0' }, { name: 'Lavender Haze', hex: '#CDB4DB', cmyk: 'C20-M30-Y0-K0' }, { name: 'Forest Green', hex: '#606C38', cmyk: 'C50-M30-Y80-K30' }, { name: 'Deep Espresso', hex: '#283618', cmyk: 'C60-M40-Y80-K60' }, { name: 'Classic Red', hex: '#D92121', cmyk: 'C0-M90-Y80-K0' }, { name: 'Pure White', hex: '#FFFFFF', cmyk: 'C0-M0-Y0-K0' }, { name: 'Midnight Black', hex: '#111111', cmyk: 'C75-M68-Y67-K90' }
];

const hexToRgb = (hex) => { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null; };
const findClosestFabricColor = (r, g, b) => { let minDistance = Infinity; let closestColor = null; FABRIC_PALETTE.forEach(fabric => { const rgb = hexToRgb(fabric.hex); if (!rgb) return; const distance = Math.sqrt((r - rgb.r) ** 2 + (g - rgb.g) ** 2 + (b - rgb.b) ** 2); if (distance < minDistance) { minDistance = distance; closestColor = fabric; } }); return closestColor; };

export function ColorMatcherPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setIsProcessing(true); setExtractedColors([]);
    const reader = new FileReader(); reader.onload = (event) => { setSelectedImage(event.target.result); extractColors(event.target.result); }; reader.readAsDataURL(file);
  };

  const extractColors = (imageSrc) => {
    const img = new Image(); img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current; const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = 150; canvas.height = 150 * (img.height / img.width); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data; const colorMap = {};
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i]; const g = imageData[i + 1]; const b = imageData[i + 2]; const a = imageData[i + 3];
        if (a < 128) continue;
        const step = 32; const rQ = Math.round(r / step) * step; const gQ = Math.round(g / step) * step; const bQ = Math.round(b / step) * step; const key = `${rQ},${gQ},${bQ}`;
        if (!colorMap[key]) colorMap[key] = { count: 0, r: rQ, g: gQ, b: bQ };
        colorMap[key].count++;
      }
      const topColors = Object.values(colorMap).sort((a, b) => b.count - a.count).slice(0, 5).map(c => {
          const closestFabric = findClosestFabricColor(c.r, c.g, c.b);
          return { originalRgb: `rgb(${c.r}, ${c.g}, ${c.b})`, hex: `#${c.r.toString(16).padStart(2,'0')}${c.g.toString(16).padStart(2,'0')}${c.b.toString(16).padStart(2,'0')}`, fabricMatch: closestFabric };
        });
      setTimeout(() => { setExtractedColors(topColors); setIsProcessing(false); }, 800);
    };
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative z-10">
      <SEO title="Color Palette Matcher | Dioxyzine Frog" description="Extract dominant colors from your design and match them with our fabric swatches." />
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-heading mb-4 flex items-center justify-center gap-3">
            <Droplet className="w-10 h-10 text-[var(--primary)]" /> AI Color Matcher
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
            Upload your 2D design. Our AI will extract the dominant colors and match them perfectly with our real-world CMYK fabric swatches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* CỘT TẢI ẢNH */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md text-center">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center justify-center gap-2">
              <Upload className="w-5 h-5 text-[var(--primary)]" /> Upload Design
            </h2>

            {!selectedImage ? (
              <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-[var(--primary)]/5 hover:border-[var(--primary)] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Palette className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="mb-2 text-sm text-muted-foreground font-medium"><span className="font-bold text-[var(--primary)]">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (MAX. 5MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            ) : (
              <div className="relative w-full h-80 bg-muted border border-border rounded-xl overflow-hidden group shadow-inner">
                <img src={selectedImage} alt="Uploaded Design" className="w-full h-full object-contain p-4" />
                <label className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white font-bold bg-[var(--primary)] px-4 py-2 rounded-lg shadow-md">Upload New Image</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            )}
          </div>

          {/* CỘT KẾT QUẢ TRÍCH XUẤT */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md min-h-[420px]">
            <h2 className="text-xl font-bold text-foreground mb-6 border-b border-border pb-4">Extracted Fabric Palette</h2>

            {isProcessing ? (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--primary)]">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="font-mono text-sm font-bold text-muted-foreground">Scanning pixels & matching CMYK...</p>
              </div>
            ) : extractedColors.length > 0 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                {extractedColors.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 bg-muted p-3 rounded-xl border border-border shadow-sm">
                    
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="w-12 h-12 rounded-full shadow-inner border border-border" style={{ backgroundColor: item.originalRgb }}></div>
                      <span className="text-[10px] text-muted-foreground font-mono font-bold">Original</span>
                    </div>

                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />

                    <div className="flex-1 flex items-center gap-4 p-2 bg-card rounded-lg border border-[var(--primary)]/30 shadow-sm">
                      <div className="w-12 h-12 rounded-lg shadow-sm border border-border" style={{ backgroundColor: item.fabricMatch.hex }}></div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.fabricMatch.name}</p>
                        <div className="flex gap-2 text-xs mt-1">
                          <span className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded font-mono font-bold">
                            {item.fabricMatch.cmyk}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}

                <button onClick={() => navigate('/tools/prototype-generator')} className="w-full mt-6 py-4 bg-background border border-[var(--primary)] text-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer">
                  <Palette className="w-5 h-5" /> Proceed to Prototype Generator
                </button>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                <Droplet className="w-12 h-12 mb-4 opacity-30" />
                <p className="font-medium">Upload a design to see the magic happen.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}