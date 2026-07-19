import React, { useRef, useEffect } from 'react';
import { Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';

export function DraggableImage({ imageProps, isSelected, onSelect, onChange }) {
  // Biến đường link URL thành đối tượng Image của trình duyệt
  const [img] = useImage(imageProps.src, 'anonymous');
  const shapeRef = useRef();
  const trRef = useRef();

  // Bật cái khung bao quanh (Transformer) khi ảnh được chọn
  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        image={img}
        {...imageProps}
        draggable
        onDragEnd={(e) => {
          // Lưu lại tọa độ mới khi thả chuột ra
          onChange({
            ...imageProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset tỷ lệ scale về 1 và lưu thẳng vào Width/Height để dễ quản lý
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            ...imageProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Giới hạn không cho thu nhỏ ảnh quá đà (nhỏ hơn 5px)
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
}