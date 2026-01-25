import type { Drawing } from "@/components/HandwritingPad";

export interface HandwritingScore {
  score: number; // 0-100
  feedback: string;
  accuracy: number; // IoU value 0-1
}

/**
 * Chuẩn hoá drawing về kích thước và vị trí chuẩn
 */
function normalizeDrawing(drawing: Drawing, targetWidth: number = 256, targetHeight: number = 256): Drawing {
  if (drawing.length === 0) return [];

  // Tìm bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  for (const stroke of drawing) {
    for (const point of stroke) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }

  const currentWidth = maxX - minX;
  const currentHeight = maxY - minY;
  
  if (currentWidth === 0 || currentHeight === 0) return drawing;

  // Tính scale để fit vào target size (giữ tỷ lệ)
  const scale = Math.min(targetWidth * 0.8 / currentWidth, targetHeight * 0.8 / currentHeight);
  
  // Tính offset để center
  const scaledWidth = currentWidth * scale;
  const scaledHeight = currentHeight * scale;
  const offsetX = (targetWidth - scaledWidth) / 2 - minX * scale;
  const offsetY = (targetHeight - scaledHeight) / 2 - minY * scale;

  // Apply transformation
  return drawing.map(stroke => 
    stroke.map(point => ({
      x: point.x * scale + offsetX,
      y: point.y * scale + offsetY,
      t: point.t
    }))
  );
}

/**
 * Render drawing lên canvas để tạo bitmap
 */
function renderDrawingToBitmap(drawing: Drawing, width: number, height: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Clear background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  // Draw strokes
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const stroke of drawing) {
    if (stroke.length < 2) continue;
    
    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i].x, stroke[i].y);
    }
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, width, height);
}

/**
 * Render template text lên canvas để tạo bitmap
 */
function renderTemplateToBitmap(text: string, width: number, height: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Clear background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  // Draw template text
  const fontSize = Math.min(width, height) * 0.6;
  ctx.font = `${fontSize}px system-ui, -apple-system, "Noto Sans KR", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';
  ctx.fillText(text, width / 2, height / 2);

  return ctx.getImageData(0, 0, width, height);
}

/**
 * Tính IoU (Intersection over Union) giữa 2 bitmap
 */
function calculateIoU(userBitmap: ImageData, templateBitmap: ImageData): number {
  const { data: userData } = userBitmap;
  const { data: templateData } = templateBitmap;
  
  if (userData.length !== templateData.length) return 0;

  let intersection = 0;
  let union = 0;

  // Threshold để coi pixel là "ink" (không phải white)
  const threshold = 240; // pixels có giá trị R/G/B < 240 được coi là ink

  for (let i = 0; i < userData.length; i += 4) {
    // Lấy giá trị grayscale (chỉ cần R channel vì đen trắng)
    const userInk = userData[i] < threshold;
    const templateInk = templateData[i] < threshold;

    if (userInk && templateInk) {
      intersection++;
    }
    if (userInk || templateInk) {
      union++;
    }
  }

  return union === 0 ? 0 : intersection / union;
}

/**
 * Tính feedback dựa trên IoU và đặc điểm drawing
 */
function generateFeedback(iou: number, drawing: Drawing, templateText: string): string {
  const strokeCount = drawing.length;
  
  if (iou >= 0.7) {
    return "Xuất sắc! Chữ viết rất chính xác. 🎉";
  } else if (iou >= 0.5) {
    return "Tốt! Hình dạng chữ đã khá chính xác. ✨";
  } else if (iou >= 0.3) {
    if (strokeCount === 0) {
      return "Hãy thử viết chữ trên canvas nhé! 📝";
    } else if (strokeCount < 3) {
      return "Cần thêm một số nét để hoàn thiện chữ. ✍️";
    }
    return "Khá tốt, nhưng cần điều chỉnh hình dạng chữ một chút. 💪";
  } else if (iou >= 0.1) {
    return "Cần luyện tập thêm để chữ viết chính xác hơn. 📚";
  } else {
    if (strokeCount === 0) {
      return `Hãy thử viết chữ "${templateText}" trên canvas! 🖊️`;
    }
    return "Hãy thử viết lại theo mẫu chữ. Chú ý hình dạng và vị trí các nét. 🎯";
  }
}

/**
 * Hàm chính: chấm điểm handwriting
 */
export function scoreHandwriting(
  drawing: Drawing, 
  templateText: string,
  canvasWidth: number = 320,
  canvasHeight: number = 320
): HandwritingScore {
  const bitmapSize = 256;
  
  try {
    // 1. Chuẩn hoá drawing
    const normalizedDrawing = normalizeDrawing(drawing, bitmapSize, bitmapSize);
    
    // 2. Render both to bitmap
    const userBitmap = renderDrawingToBitmap(normalizedDrawing, bitmapSize, bitmapSize);
    const templateBitmap = renderTemplateToBitmap(templateText, bitmapSize, bitmapSize);
    
    // 3. Tính IoU
    const iou = calculateIoU(userBitmap, templateBitmap);
    
    // 4. Convert IoU to score 0-100
    // Áp dụng curve để score dễ đạt hơn cho người mới học
    let score = Math.round(Math.pow(iou, 0.7) * 100);
    score = Math.max(0, Math.min(100, score));
    
    // 5. Generate feedback
    const feedback = generateFeedback(iou, drawing, templateText);
    
    return {
      score,
      feedback,
      accuracy: iou
    };
  } catch (error) {
    console.error("Error scoring handwriting:", error);
    return {
      score: 0,
      feedback: "Đã xảy ra lỗi khi chấm điểm. Vui lòng thử lại! ⚠️",
      accuracy: 0
    };
  }
}