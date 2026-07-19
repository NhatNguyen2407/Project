import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Upload, Layers, Save, Info, Box, Palette, Wand2, Trash2, ChevronUp, ChevronDown, Loader2, Image as ImageIcon, Send, Bookmark, Grid, Type, Plus, Undo, Redo, Eraser, Scissors, FlipHorizontal, ZoomIn, ZoomOut, Maximize2, Square, Columns } from 'lucide-react';
import { Stage, Layer, Image as KonvaImage, Group, Rect, Text, Line, Transformer, Circle } from 'react-konva';
import useImage from 'use-image';
import { SEO } from '../components/common_components/SEO';

// ---------------------------------------------------------
// 1. CÁC COMPONENT & DỮ LIỆU PHỤ TRỢ (Full 100%)
// ---------------------------------------------------------
const ProductBase = ({ src, colorHex }) => {
  const [image] = useImage(src, 'anonymous');
  return image ? (
    <Group>
      <KonvaImage image={image} width={600} height={600} />
      {colorHex && <Rect width={600} height={600} fill={colorHex} globalCompositeOperation="source-atop" listening={false} />}
    </Group>
  ) : null;
};

const ProductOverlay = ({ src }) => {
  const [image] = useImage(src, 'anonymous');
  return image ? <KonvaImage image={image} width={600} height={600} listening={false} opacity={0.8} /> : null;
};

const ProductSeam = ({ src, visible }) => {
  const [image] = useImage(src, 'anonymous');
  if (!visible || !image) return null;
  return <KonvaImage image={image} width={600} height={600} listening={false} opacity={0.9} />;
};

const DraggableImage = ({ imageProps, isSelected, onSelect, onChange }) => {
  const [img] = useImage(imageProps.src, 'anonymous');
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) { trRef.current.nodes([shapeRef.current]); trRef.current.getLayer().batchDraw(); }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        onClick={onSelect} onTap={onSelect} ref={shapeRef} image={img} {...imageProps}
        scaleX={imageProps.isFlipped ? -1 : 1} offsetX={imageProps.isFlipped ? imageProps.width : 0} draggable
        onDragEnd={(e) => onChange({ ...imageProps, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX(); const scaleY = node.scaleY();
          node.scaleX(imageProps.isFlipped ? -1 : 1); node.scaleY(1);
          onChange({
            ...imageProps, x: node.x(), y: node.y(),
            width: Math.max(5, node.width() * Math.abs(scaleX)), height: Math.max(5, node.height() * Math.abs(scaleY)), rotation: node.rotation(),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)} />}
    </React.Fragment>
  );
};

const DraggableText = ({ textProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  
  useEffect(() => {
    if (isSelected && trRef.current) { trRef.current.nodes([shapeRef.current]); trRef.current.getLayer().batchDraw(); }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Text
        onClick={onSelect} onTap={onSelect} ref={shapeRef} {...textProps} draggable
        onDragEnd={(e) => onChange({ ...textProps, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current; const scaleX = node.scaleX();
          node.scaleX(1); node.scaleY(1);
          onChange({
            ...textProps, x: node.x(), y: node.y(),
            fontSize: Math.max(10, node.fontSize() * Math.abs(scaleX)), rotation: node.rotation(),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']} boundBoxFunc={(oldBox, newBox) => (newBox.width < 10 ? oldBox : newBox)} />}
    </React.Fragment>
  );
};

const CanvasGrid = ({ size, mode }) => {
  if (mode === 'off') return null;

  const center = size / 2;
  const mutedPurple = "rgba(139,114,190,0.4)"; 
  const boldPurple = "#8B72BE"; 

  return (
    <Group listening={false}>
      {(mode === 'crosshair' || mode === 'grid') && (
        <>
          <Line points={[center, 0, center, size]} stroke={boldPurple} strokeWidth={2} dash={[8, 4]} />
          <Line points={[0, center, size, center]} stroke={boldPurple} strokeWidth={2} dash={[8, 4]} />
          <Circle x={center} y={center} radius={5} fill={boldPurple} />
        </>
      )}
      {mode === 'grid' && (
        <>
          {Array.from({ length: 11 }).map((_, i) => {
            const pos = (size / 10) * i;
            if (pos === center) return null; 
            return (
              <React.Fragment key={`grid-${i}`}>
                <Line points={[pos, 0, pos, size]} stroke={mutedPurple} strokeWidth={1} />
                <Line points={[0, pos, size, pos]} stroke={mutedPurple} strokeWidth={1} />
              </React.Fragment>
            );
          })}
        </>
      )}
      {mode === 'thirds' && (
        <>
          <Line points={[size / 3, 0, size / 3, size]} stroke={boldPurple} strokeWidth={2} dash={[5, 5]} />
          <Line points={[(size / 3) * 2, 0, (size / 3) * 2, size]} stroke={boldPurple} strokeWidth={2} dash={[5, 5]} />
          <Line points={[0, size / 3, size, size / 3]} stroke={boldPurple} strokeWidth={2} dash={[5, 5]} />
          <Line points={[0, (size / 3) * 2, size, (size / 3) * 2]} stroke={boldPurple} strokeWidth={2} dash={[5, 5]} />
        </>
      )}
    </Group>
  );
};

const MOCKUP_TEMPLATES = [
  {
    id: 'blank_canvas', name: 'Blank Canvas (Freeform)',
    baseSrc: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%23ffffff' stroke='%23cccccc' stroke-width='4'/%3E%3C/svg%3E",
    seamSrc: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect x='20' y='20' width='560' height='560' fill='none' stroke='%23FF3366' stroke-width='4' stroke-dasharray='12 8'/%3E%3C/svg%3E",
    overlaySrc: null, 
  },
  {
    id: 'round_plushie', name: 'Round Plushie (10cm)',
    baseSrc: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Ccircle cx='300' cy='300' r='250' fill='%23f0f0f0' stroke='%23cccccc' stroke-width='5'/%3E%3C/svg%3E", 
    seamSrc: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Ccircle cx='300' cy='300' r='230' fill='none' stroke='%23FF3366' stroke-width='4' stroke-dasharray='12 8'/%3E%3C/svg%3E",
    overlaySrc: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cdefs%3E%3Cmask id='hole'%3E%3Crect width='600' height='600' fill='white'/%3E%3Ccircle cx='300' cy='300' r='245' fill='black'/%3E%3C/mask%3E%3C/defs%3E%3Crect width='600' height='600' fill='%23130F1D' mask='url(%23hole)'/%3E%3Ccircle cx='300' cy='300' r='245' fill='none' stroke='rgba(0,0,0,0.5)' stroke-width='20'/%3E%3C/svg%3E", 
  },
  {
    id: 'star_keychain', name: 'Star Keychain',
    baseSrc: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cpolygon points='300,50 375,200 550,225 425,350 450,500 300,425 150,500 175,350 50,225 225,200' fill='%23f0f0f0' stroke='%23cccccc' stroke-width='5' stroke-linejoin='round'/%3E%3C/svg%3E",
    seamSrc: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cpolygon points='300,75 365,205 510,225 405,330 425,460 300,395 175,460 195,330 90,225 235,205' fill='none' stroke='%23FF3366' stroke-width='4' stroke-dasharray='12 8' stroke-linejoin='round'/%3E%3C/svg%3E",
    overlaySrc: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cdefs%3E%3Cmask id='starhole'%3E%3Crect width='600' height='600' fill='white'/%3E%3Cpolygon points='300,50 375,200 550,225 425,350 450,500 300,425 150,500 175,350 50,225 225,200' fill='black'/%3E%3C/mask%3E%3C/defs%3E%3Crect width='600' height='600' fill='%23130F1D' mask='url(%23starhole)'/%3E%3Cpolygon points='300,50 375,200 550,225 425,350 450,500 300,425 150,500 175,350 50,225 225,200' fill='none' stroke='rgba(0,0,0,0.4)' stroke-width='15' stroke-linejoin='round'/%3E%3C/svg%3E",
  }
];

const FABRIC_PALETTE = [
  { name: 'Cotton Candy', hex: '#FFC8DD', cmyk: 'C0-M20-Y0-K0' },
  { name: 'Baby Blue', hex: '#A2D2FF', cmyk: 'C40-M10-Y0-K0' },
  { name: 'Mint Dream', hex: '#BDE0FE', cmyk: 'C25-M0-Y0-K0' },
  { name: 'Sunny Lemon', hex: '#FFED66', cmyk: 'C0-M0-Y60-K0' },
  { name: 'Soft Peach', hex: '#FFC09F', cmyk: 'C0-M30-Y30-K0' },
  { name: 'Lavender Haze', hex: '#CDB4DB', cmyk: 'C20-M30-Y0-K0' },
  { name: 'Forest Green', hex: '#606C38', cmyk: 'C50-M30-Y80-K30' },
  { name: 'Deep Espresso', hex: '#283618', cmyk: 'C60-M40-Y80-K60' }
];

const ACCESSORY_LIBRARY = [
  { id: 'acc_1', name: 'Cool Glasses', src: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png' },
  { id: 'acc_2', name: 'Cute Bowtie', src: 'https://cdn-icons-png.flaticon.com/512/2884/2884561.png' },
  { id: 'acc_3', name: 'Blush Cheeks', src: 'https://cdn-icons-png.flaticon.com/512/1792/1792131.png' },
  { id: 'acc_4', name: 'Star', src: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png' }
];

// ---------------------------------------------------------
// 2. COMPONENT CHÍNH
// ---------------------------------------------------------
export function PrototypeGeneratorPage() {
  const [history, setHistory] = useState([{ views: { front: [], back: [] }, color: null }]);
  const [historyStep, setHistoryStep] = useState(0);

  const [currentView, setCurrentView] = useState('front'); 
  const [layoutMode, setLayoutMode] = useState('single'); 
  
  const [zoomState, setZoomState] = useState({ front: 1, back: 1 });
  const [posState, setPosState] = useState({ front: { x: 0, y: 0 }, back: { x: 0, y: 0 } });

  const layersData = history[historyStep].views[currentView] || [];
  const selectedColor = history[historyStep].color;

  const [selectedId, setSelectedId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(MOCKUP_TEMPLATES[1]); 
  const [activeTab, setActiveTab] = useState('base'); 
  
  const [isExporting, setIsExporting] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  
  const [gridMode, setGridMode] = useState('off'); 
  const [showSeam, setShowSeam] = useState(true); 
  
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');

  const [canvasDimensions, setCanvasDimensions] = useState({ width: 600, scale: 1 });
  const CANVAS_VIRTUAL_SIZE = 600; 
  
  const stageRefFront = useRef(null);
  const stageRefBack = useRef(null);
  const containerRef = useRef(null); 
  const navigate = useNavigate();

  const handleUpdate = (newLayersForActiveView, newColor) => {
    const nextHistory = history.slice(0, historyStep + 1);
    const currentStepData = history[historyStep];
    const newViews = { ...currentStepData.views, [currentView]: newLayersForActiveView };
    nextHistory.push({ views: newViews, color: newColor });
    setHistory(nextHistory);
    setHistoryStep(nextHistory.length - 1);
  };

  const handleUndo = () => { if (historyStep > 0) { setHistoryStep(historyStep - 1); setSelectedId(null); } };
  const handleRedo = () => { if (historyStep < history.length - 1) { setHistoryStep(historyStep + 1); setSelectedId(null); } };
  const handleClearAll = () => {
    if (window.confirm("Clear all designs on both Front and Back views?")) {
      const nextHistory = history.slice(0, historyStep + 1);
      nextHistory.push({ views: { front: [], back: [] }, color: null });
      setHistory(nextHistory);
      setHistoryStep(nextHistory.length - 1);
      setSelectedId(null);
    }
  };

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      let containerWidth = containerRef.current.offsetWidth - 32; 
      if (layoutMode === 'split' && window.innerWidth >= 1024) {
        containerWidth = (containerWidth / 2) - 16; 
      }
      const targetWidth = Math.min(containerWidth, 600);
      setCanvasDimensions({ width: targetWidth, scale: targetWidth / CANVAS_VIRTUAL_SIZE });
    }
  }, [layoutMode]);

  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize); 
    return () => window.removeEventListener('resize', updateSize);
  }, [updateSize]);

  const handleZoom = (direction) => {
    const scaleBy = 1.2;
    const currentZoom = zoomState[currentView];
    let newZoom = direction === 1 ? currentZoom * scaleBy : currentZoom / scaleBy;
    newZoom = Math.max(1, Math.min(newZoom, 4));
    if (newZoom === currentZoom) return;

    const stage = currentView === 'front' ? stageRefFront.current : stageRefBack.current;
    if(!stage) return;
    
    const oldScale = stage.scaleX();
    const centerX = canvasDimensions.width / 2;
    const centerY = canvasDimensions.width / 2;
    const mousePointTo = { x: (centerX - stage.x()) / oldScale, y: (centerY - stage.y()) / oldScale };
    const newAbsScale = canvasDimensions.scale * newZoom;
    
    setPosState({ ...posState, [currentView]: { x: centerX - mousePointTo.x * newAbsScale, y: centerY - mousePointTo.y * newAbsScale }});
    setZoomState({ ...zoomState, [currentView]: newZoom });
  };

  const handleZoomIn = () => handleZoom(1);
  const handleZoomOut = () => handleZoom(-1);

  const handleWheel = (e, viewName) => {
    e.evt.preventDefault();
    if(viewName !== currentView) setCurrentView(viewName); 

    const scaleBy = 1.1;
    const stage = viewName === 'front' ? stageRefFront.current : stageRefBack.current;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const oldScale = stage.scaleX();
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    
    const currentZoom = zoomState[viewName];
    let newZoom = e.evt.deltaY < 0 ? currentZoom * scaleBy : currentZoom / scaleBy;
    newZoom = Math.max(1, Math.min(newZoom, 4));

    if (newZoom === currentZoom) return;

    const newAbsScale = canvasDimensions.scale * newZoom;
    setPosState({ ...posState, [viewName]: { x: pointer.x - mousePointTo.x * newAbsScale, y: pointer.y - mousePointTo.y * newAbsScale } });
    setZoomState({ ...zoomState, [viewName]: newZoom });
  };

  const toggleGridMode = () => {
    const modes = ['off', 'crosshair', 'grid', 'thirds'];
    const nextIndex = (modes.indexOf(gridMode) + 1) % modes.length;
    setGridMode(modes[nextIndex]);
  };

  const getGridLabel = () => {
    if (gridMode === 'crosshair') return 'Grid: Cross';
    if (gridMode === 'grid') return 'Grid: Full';
    if (gridMode === 'thirds') return 'Grid: 3x3';
    return 'Grid: OFF';
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Max 2MB per image.");
    const reader = new FileReader();
    reader.onload = (event) => {
      const newLayer = { id: `img_${Date.now()}`, type: 'image', src: event.target.result, x: CANVAS_VIRTUAL_SIZE / 2 - 100, y: CANVAS_VIRTUAL_SIZE / 2 - 100, width: 200, height: 200, rotation: 0, isFlipped: false };
      handleUpdate([...layersData, newLayer], selectedColor);
      setSelectedId(newLayer.id); setActiveTab('design');
    };
    reader.readAsDataURL(file);
  };

  const handleAddAccessory = (src) => {
    const newLayer = { id: `img_${Date.now()}`, type: 'image', src: src, x: CANVAS_VIRTUAL_SIZE / 2 - 50, y: CANVAS_VIRTUAL_SIZE / 2 - 50, width: 100, height: 100, rotation: 0, isFlipped: false };
    handleUpdate([...layersData, newLayer], selectedColor); setSelectedId(newLayer.id); 
  };

  const handleAddText = () => {
    if (!textInput.trim()) return;
    const newLayer = { id: `txt_${Date.now()}`, type: 'text', text: textInput, fill: textColor, fontSize: 40, fontFamily: 'Arial', fontStyle: 'bold', x: CANVAS_VIRTUAL_SIZE / 2 - 50, y: CANVAS_VIRTUAL_SIZE / 2 - 20, rotation: 0 };
    handleUpdate([...layersData, newLayer], selectedColor); setSelectedId(newLayer.id); setTextInput('');
  };

  const deleteLayer = (id) => { handleUpdate(layersData.filter(layer => layer.id !== id), selectedColor); if (selectedId === id) setSelectedId(null); };
  const toggleFlip = (id) => { handleUpdate(layersData.map(layer => layer.id === id ? { ...layer, isFlipped: !layer.isFlipped } : layer), selectedColor); };
  const moveLayerUp = (index) => { if (index === layersData.length - 1) return; const newLayers = [...layersData]; const temp = newLayers[index]; newLayers[index] = newLayers[index + 1]; newLayers[index + 1] = temp; handleUpdate(newLayers, selectedColor); };
  const moveLayerDown = (index) => { if (index === 0) return; const newLayers = [...layersData]; const temp = newLayers[index]; newLayers[index] = newLayers[index - 1]; newLayers[index - 1] = temp; handleUpdate(newLayers, selectedColor); };

  const captureCanvas = async () => {
    setSelectedId(null); setGridMode('off'); setShowSeam(false);
    
    const captureStage = (stageRefObj) => {
      return new Promise((resolve) => {
        if (!stageRefObj.current) return resolve(null);
        const stage = stageRefObj.current;
        const oldScaleX = stage.scaleX(); const oldPos = stage.position();
        stage.scale({ x: canvasDimensions.scale, y: canvasDimensions.scale });
        stage.position({ x: 0, y: 0 });
        stage.batchDraw();
        const dataURL = stage.toDataURL({ pixelRatio: 2 / canvasDimensions.scale }); 
        stage.scale({ x: oldScaleX, y: oldScaleX });
        stage.position(oldPos);
        stage.batchDraw();
        resolve(dataURL);
      });
    };

    await new Promise(r => setTimeout(r, 150));

    if (layoutMode === 'single') {
      const activeRef = currentView === 'front' ? stageRefFront : stageRefBack;
      return await captureStage(activeRef);
    } 
    else {
      const urlFront = await captureStage(stageRefFront);
      const urlBack = await captureStage(stageRefBack);
      if (!urlFront || !urlBack) return null;

      const canvas = document.createElement('canvas');
      canvas.width = 2400; 
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');
      
      const img1 = new Image(); img1.src = urlFront;
      const img2 = new Image(); img2.src = urlBack;
      await Promise.all([
        new Promise(res => { img1.onload = res; }),
        new Promise(res => { img2.onload = res; })
      ]);
      ctx.drawImage(img1, 0, 0, 1200, 1200);
      ctx.drawImage(img2, 1200, 0, 1200, 1200);
      return canvas.toDataURL('image/png');
    }
  };

  const handleDownloadImage = async () => {
    setIsExporting(true); setShowSaveMenu(false);
    const dataURL = await captureCanvas();
    if (dataURL) {
      const link = document.createElement('a');
      link.download = `Dioxyzine_${selectedTemplate.name}_${layoutMode === 'split' ? 'FullView' : currentView}.png`;
      link.href = dataURL; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
    setIsExporting(false); setShowSeam(true);
  };

  const handleSaveDraft = () => {
    try {
      const draft = { template: selectedTemplate, historyItem: history[historyStep] };
      localStorage.setItem('dioxyzine_draft', JSON.stringify(draft));
      alert("Draft saved successfully!");
    } catch (e) {
      alert("Failed to save draft.");
    }
    setShowSaveMenu(false);
  };

  const handleProceedToInquiry = async () => {
    setIsExporting(true); setShowSaveMenu(false);
    const dataURL = await captureCanvas();
    if (dataURL) {
      navigate('/inquiry', {
        state: { 
          passedProduct: `Custom ${selectedTemplate.name} ${layoutMode === 'split' ? '(Front + Back)' : `(${currentView} view)`}`, 
          prototypeImage: dataURL,
          passedColorName: selectedColor ? selectedColor.name : 'Default White',
          passedCmyk: selectedColor ? selectedColor.cmyk : 'N/A'
        }
      });
    }
    setIsExporting(false); setShowSeam(true);
  };

  const renderCanvasView = (viewName) => {
    const isFocused = currentView === viewName;
    const vZoom = zoomState[viewName];
    const vPos = posState[viewName];
    const vLayers = history[historyStep].views[viewName] || [];
    const vRef = viewName === 'front' ? stageRefFront : stageRefBack;

    const checkDeselectLocal = (e) => {
      setCurrentView(viewName); 
      if (e.target === e.target.getStage() || e.target.attrs.image?.src === selectedTemplate.baseSrc) setSelectedId(null);
    };

    return (
      <div 
        key={viewName}
        onClick={() => setCurrentView(viewName)}
        className={`bg-white/5 border transition-all shadow-md overflow-hidden flex items-center justify-center shrink-0 ${vZoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''} ${isFocused && layoutMode === 'split' ? 'border-[var(--primary)] shadow-[0_0_15px_rgba(139,114,190,0.3)]' : 'border-border'}`} 
        style={{ width: canvasDimensions.width, height: canvasDimensions.width, borderRadius: '1rem' }}
      >
        <Stage 
          width={canvasDimensions.width} height={canvasDimensions.width} 
          scaleX={canvasDimensions.scale * vZoom} scaleY={canvasDimensions.scale * vZoom} 
          x={vPos.x} y={vPos.y} 
          draggable={vZoom > 1} 
          onDragEnd={(e) => { if (e.target === e.target.getStage()) setPosState({ ...posState, [viewName]: { x: e.target.x(), y: e.target.y() }}); }}
          onWheel={(e) => handleWheel(e, viewName)} 
          onMouseDown={checkDeselectLocal} onTouchStart={checkDeselectLocal} ref={vRef}
        >
          <Layer>
            <ProductBase src={selectedTemplate.baseSrc} colorHex={selectedColor?.hex} />
            <ProductSeam src={selectedTemplate.seamSrc} visible={showSeam} />
            {vLayers.map((layer, i) => {
              if (layer.type === 'text') {
                return <DraggableText key={layer.id} textProps={layer} isSelected={layer.id === selectedId && isFocused} onSelect={() => { setSelectedId(layer.id); setCurrentView(viewName); }} onChange={(newAttrs) => { const newL = vLayers.slice(); newL[i] = newAttrs; handleUpdate(newL, selectedColor); }} />;
              }
              return <DraggableImage key={layer.id} imageProps={layer} isSelected={layer.id === selectedId && isFocused} onSelect={() => { setSelectedId(layer.id); setCurrentView(viewName); }} onChange={(newAttrs) => { const newL = vLayers.slice(); newL[i] = newAttrs; handleUpdate(newL, selectedColor); }} />;
            })}
            <ProductOverlay src={selectedTemplate.overlaySrc} />
            <CanvasGrid size={CANVAS_VIRTUAL_SIZE} mode={gridMode} />
          </Layer>
        </Stage>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative z-10">
      <SEO title="2D Prototype Generator | Dioxyzine Frog" description="Design your custom plushie prototype instantly." />

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-heading text-foreground flex items-center gap-3"><Layers className="w-10 h-10 text-[var(--primary)]" /> 2D Prototype Generator</h1>
            <p className="text-muted-foreground mt-2 font-medium">Upload your designs, add accessories, and visualize your custom plushie before production.</p>
          </div>
          
          <div className="flex gap-4 items-center bg-card p-2 rounded-2xl border border-border shrink-0 shadow-sm">
            <div className="flex gap-1 bg-muted p-1 rounded-xl">
              <button onClick={() => { setCurrentView('front'); setSelectedId(null); }} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer ${currentView === 'front' ? 'bg-[var(--primary)] text-white' : 'text-muted-foreground hover:text-foreground'}`}>Front</button>
              <button onClick={() => { setCurrentView('back'); setSelectedId(null); }} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer ${currentView === 'back' ? 'bg-[var(--primary)] text-white' : 'text-muted-foreground hover:text-foreground'}`}>Back</button>
            </div>
            <div className="w-[1px] h-6 bg-border"></div>
            <div className="flex gap-1 bg-muted p-1 rounded-xl">
              <button onClick={() => setLayoutMode('single')} className={`p-2 rounded-lg transition-colors cursor-pointer ${layoutMode === 'single' ? 'bg-[var(--primary)] text-white' : 'text-muted-foreground hover:text-foreground'}`} title="Single View"><Square className="w-4 h-4" /></button>
              <button onClick={() => setLayoutMode('split')} className={`p-2 rounded-lg transition-colors cursor-pointer ${layoutMode === 'split' ? 'bg-[var(--primary)] text-white' : 'text-muted-foreground hover:text-foreground'}`} title="Split View"><Columns className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="w-full lg:w-80 xl:w-96 shrink-0 bg-card border border-border rounded-2xl flex flex-col h-[75vh] shadow-sm overflow-visible">
            
            <div className="flex border-b border-border bg-muted rounded-t-2xl">
              <button onClick={() => setActiveTab('base')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 transition-colors cursor-pointer rounded-tl-2xl ${activeTab === 'base' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-card' : 'text-muted-foreground hover:text-foreground'}`}><Box className="w-5 h-5" /> Base</button>
              <button onClick={() => setActiveTab('design')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${activeTab === 'design' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-card' : 'text-muted-foreground hover:text-foreground'}`}><Palette className="w-5 h-5" /> Design</button>
              <button onClick={() => setActiveTab('accessories')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 transition-colors cursor-pointer rounded-tr-2xl ${activeTab === 'accessories' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-card' : 'text-muted-foreground hover:text-foreground'}`}><Wand2 className="w-5 h-5" /> Extras</button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'base' && (
                <div className="animate-in fade-in duration-300">
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-4 block">Select Base Shape</label>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {MOCKUP_TEMPLATES.map(template => (
                      <button key={template.id} onClick={() => setSelectedTemplate(template)} className={`p-4 text-xs font-bold rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-2 ${selectedTemplate.id === template.id ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] shadow-sm' : 'bg-muted border-border text-muted-foreground hover:border-gray-400'}`}>
                        <Box className="w-6 h-6" /> <span className="text-center">{template.name}</span>
                      </button>
                    ))}
                  </div>
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-4 block flex justify-between">
                    <span>Fabric Color</span> <span className="text-[var(--primary)]">{selectedColor?.cmyk || ''}</span>
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    <button onClick={() => handleUpdate(layersData, null)} className={`group flex flex-col items-center gap-1 cursor-pointer p-2 rounded-xl border transition-all ${!selectedColor ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-transparent hover:bg-muted'}`} title="Default White"><div className="w-8 h-8 rounded-full border border-gray-400 shadow-sm group-hover:scale-110 transition-transform bg-[#f0f0f0]" /><span className="text-[10px] text-muted-foreground font-semibold truncate w-16 text-center">White</span></button>
                    {FABRIC_PALETTE.map((color) => (
                      <button key={color.name} onClick={() => handleUpdate(layersData, color)} className={`group flex flex-col items-center gap-1 cursor-pointer p-2 rounded-xl border transition-all ${selectedColor?.name === color.name ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-transparent hover:bg-muted'}`} title={`${color.name} - ${color.cmyk}`}><div className="w-8 h-8 rounded-full border border-border shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: color.hex }} /><span className="text-[10px] text-muted-foreground font-semibold truncate w-16 text-center">{color.name}</span></button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'design' && (
                <div className="animate-in fade-in duration-300 flex flex-col h-full">
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-4 block">Upload Design Patterns <span className="text-[var(--primary)] capitalize">({currentView})</span></label>
                  <label className="block p-4 bg-muted border-2 border-dashed border-[var(--primary)]/50 rounded-xl text-center text-foreground cursor-pointer hover:bg-[var(--primary)]/5 transition-colors shrink-0">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" /><span className="text-sm font-bold block mb-1">Select an Image</span>
                    <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageUpload} />
                  </label>
                  
                  <div className="mt-4 shrink-0 bg-muted p-4 rounded-xl border border-border">
                     <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3 block flex items-center gap-2"><Type className="w-4 h-4"/> Add Custom Text</label>
                     <div className="flex gap-2">
                        <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="E.g. Dioxyzine..." className="flex-1 w-full min-w-0 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]" />
                        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-background border border-border shrink-0" />
                        <button onClick={handleAddText} className="p-2 bg-[var(--primary)] text-white rounded-lg hover:scale-105 transition-transform cursor-pointer"><Plus className="w-5 h-5" /></button>
                     </div>
                  </div>

                  {layersData.length > 0 && (
                    <div className="mt-6 flex-1 flex flex-col min-h-0">
                      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Layers - {currentView} ({layersData.length})</span>
                      </div>
                      <div className="overflow-y-auto space-y-2 pr-1">
                        {[...layersData].reverse().map((layer, reversedIndex) => {
                          const actualIndex = layersData.length - 1 - reversedIndex;
                          return (
                            <div key={layer.id} className={`flex items-center justify-between p-2.5 bg-muted border rounded-xl transition-colors ${selectedId === layer.id ? 'border-[var(--primary)] shadow-sm' : 'border-border'}`}>
                              <div className="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden" onClick={() => setSelectedId(layer.id)}>
                                <div className="w-8 h-8 bg-background rounded-lg border border-border p-1 flex items-center justify-center shrink-0">
                                  {layer.type === 'text' ? <Type className="w-4 h-4 text-muted-foreground" /> : <img src={layer.src} alt="layer" className="max-w-full max-h-full object-contain" />}
                                </div>
                                <span className={`text-xs font-bold truncate ${selectedId === layer.id ? 'text-[var(--primary)]' : 'text-foreground'}`}>
                                  {layer.type === 'text' ? `Text: "${layer.text}"` : `Layer ${actualIndex + 1}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {layer.type === 'image' && <button onClick={() => toggleFlip(layer.id)} className="p-1.5 mr-1 text-blue-500 cursor-pointer hover:bg-blue-500/10 rounded-lg transition-colors" title="Flip Horizontal"><FlipHorizontal className="w-4 h-4" /></button>}
                                <div className="flex flex-col bg-card rounded-md border border-border">
                                  <button onClick={() => moveLayerUp(actualIndex)} disabled={actualIndex === layersData.length - 1} className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                  <div className="h-[1px] w-full bg-border"></div>
                                  <button onClick={() => moveLayerDown(actualIndex)} disabled={actualIndex === 0} className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                </div>
                                <button onClick={() => deleteLayer(layer.id)} className="p-2 text-red-500 cursor-pointer hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'accessories' && (
                <div className="animate-in fade-in duration-300 flex flex-col h-full">
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-4 block">Add Accessories ({currentView})</label>
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
                    {ACCESSORY_LIBRARY.map((acc) => (
                      <button key={acc.id} onClick={() => handleAddAccessory(acc.src)} className="p-4 bg-muted border border-border rounded-xl flex flex-col items-center gap-3 hover:border-[var(--primary)] transition-all group cursor-pointer shadow-sm">
                        <div className="w-12 h-12 flex items-center justify-center"><img src={acc.src} alt={acc.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" /></div>
                        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">{acc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-muted shrink-0 relative rounded-b-2xl">
              {showSaveMenu && (
                <div className="absolute bottom-full left-6 right-6 mb-3 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2">
                  <button onClick={handleDownloadImage} className="w-full flex items-center gap-3 p-4 text-left text-foreground hover:bg-muted border-b border-border transition-colors cursor-pointer">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><ImageIcon className="w-5 h-5" /></div>
                    <div><p className="font-bold text-sm">Save as Image</p><p className="text-[10px] text-muted-foreground font-medium">Download a .PNG copy</p></div>
                  </button>
                  <button onClick={handleSaveDraft} className="w-full flex items-center gap-3 p-4 text-left text-foreground hover:bg-muted border-b border-border transition-colors cursor-pointer">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Bookmark className="w-5 h-5" /></div>
                    <div><p className="font-bold text-sm">Save Draft</p><p className="text-[10px] text-muted-foreground font-medium">Save progress to browser</p></div>
                  </button>
                  <button onClick={handleProceedToInquiry} className="w-full flex items-center gap-3 p-4 text-left text-foreground hover:bg-[var(--primary)]/10 transition-colors cursor-pointer">
                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]"><Send className="w-5 h-5" /></div>
                    <div><p className="font-bold text-sm">Submit Inquiry</p><p className="text-[10px] text-muted-foreground font-medium">Proceed to quote</p></div>
                  </button>
                </div>
              )}
              <button onClick={() => setShowSaveMenu(!showSaveMenu)} disabled={isExporting} className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md transition-all cursor-pointer ${showSaveMenu ? 'bg-muted border border-[var(--primary)] text-foreground' : 'bg-[var(--primary)] text-white hover:scale-[1.02]'}`}>
                {isExporting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Save className="w-5 h-5" /> Actions & Save</>}
              </button>
            </div>
          </div>

          {/* CỘT CANVAS & VIEWPORT */}
          <div ref={containerRef} className="flex-1 bg-secondary border border-border rounded-2xl overflow-hidden shadow-md relative flex flex-col min-h-[420px] lg:min-h-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
            
            <div className="p-4 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/80 backdrop-blur-md">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border text-[10px] md:text-xs font-mono font-bold text-muted-foreground">
                <Info className="w-4 h-4" /> <span className="capitalize">{selectedTemplate.name} - {layoutMode === 'split' ? 'Front & Back' : currentView}</span>
              </div>
              
              <div className="flex items-center gap-1.5 bg-background px-2 py-1.5 rounded-lg border border-border">
                <button onClick={handleUndo} disabled={historyStep === 0} className="p-1 text-muted-foreground hover:text-[var(--primary)] disabled:opacity-30 cursor-pointer" title="Undo"><Undo className="w-4 h-4" /></button>
                <button onClick={handleRedo} disabled={historyStep === history.length - 1} className="p-1 text-muted-foreground hover:text-[var(--primary)] disabled:opacity-30 cursor-pointer" title="Redo"><Redo className="w-4 h-4" /></button>
                <div className="w-[1px] h-4 bg-border mx-1"></div>
                <button onClick={handleClearAll} className="p-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all cursor-pointer" title="Clear All Layers"><Eraser className="w-4 h-4" /></button>
                <div className="w-[1px] h-4 bg-border mx-1"></div>
                
                <button onClick={handleZoomOut} disabled={zoomState[currentView] <= 0.6} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"><ZoomOut className="w-4 h-4" /></button>
                <span className="text-[10px] font-mono text-[var(--primary)] w-10 text-center select-none font-bold bg-[var(--primary)]/10 py-0.5 rounded">{Math.round(zoomState[currentView] * 100)}%</span>
                <button onClick={handleZoomIn} disabled={zoomState[currentView] >= 4} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={() => { setZoomState({...zoomState, [currentView]: 1}); setPosState({...posState, [currentView]: {x:0, y:0}}) }} className={`p-1 rounded-md transition-colors cursor-pointer ${zoomState[currentView] !== 1 ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-muted-foreground hover:text-foreground'}`}><Maximize2 className="w-4 h-4" /></button>
                <div className="w-[1px] h-4 bg-border mx-1"></div>
                <button onClick={() => setShowSeam(!showSeam)} className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold transition-colors cursor-pointer ${showSeam ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]' : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`}><Scissors className="w-3 h-3" /> <span className="hidden xl:inline">Seam</span></button>
                <button onClick={toggleGridMode} className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold transition-colors cursor-pointer ${gridMode !== 'off' ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]' : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`} title="Toggle Grid"><Grid className="w-3 h-3" /> <span className="hidden xl:inline">{getGridLabel()}</span></button>
              </div>
            </div>

            <div className={`flex-1 flex flex-col lg:flex-row items-center justify-center p-4 gap-4 overflow-hidden ${layoutMode === 'split' ? 'items-start pt-8' : ''}`}>
               {layoutMode === 'single' ? (
                 renderCanvasView(currentView)
               ) : (
                 <>
                   <div className="flex flex-col items-center gap-2">
                     <span className={`text-xs font-bold uppercase tracking-wider ${currentView === 'front' ? 'text-[var(--primary)]' : 'text-muted-foreground'}`}>Front Side</span>
                     {renderCanvasView('front')}
                   </div>
                   <div className="flex flex-col items-center gap-2">
                     <span className={`text-xs font-bold uppercase tracking-wider ${currentView === 'back' ? 'text-[var(--primary)]' : 'text-muted-foreground'}`}>Back Side</span>
                     {renderCanvasView('back')}
                   </div>
                 </>
               )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}