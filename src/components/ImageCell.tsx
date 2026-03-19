import { useState, useRef, useCallback } from "react";

interface ImageCellProps {
  imageUrl?: string;
  onChangeUrl: (url: string) => void;
  onClickImage: (url: string) => void;
  readOnly?: boolean;
}

function readFileAsDataUrl(file: File, maxWidth = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageCell({ imageUrl, onChangeUrl, onClickImage, readOnly }: ImageCellProps) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChangeUrl(dataUrl);
    } catch {
      alert("画像の読み込みに失敗しました");
    }
  }, [onChangeUrl]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }, [handleFile]);

  if (imageUrl) {
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <img
          src={imageUrl}
          alt=""
          onClick={() => onClickImage(imageUrl)}
          onDrop={!readOnly ? onDrop : undefined}
          onDragOver={!readOnly ? onDragOver : undefined}
          onDragLeave={() => setDragging(false)}
          style={{
            width: 160, height: 100, objectFit: "contain", borderRadius: 4,
            cursor: "zoom-in", border: dragging ? "2px solid #3b82f6" : "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        />
        {!readOnly && (
          <button
            onClick={() => onChangeUrl("")}
            style={{
              position: "absolute", top: -4, right: -4,
              width: 14, height: 14, borderRadius: "50%",
              border: "none", background: "#ef4444", color: "#fff",
              fontSize: 9, cursor: "pointer", lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            title="画像を削除"
          >×</button>
        )}
      </div>
    );
  }

  if (readOnly) {
    return <span style={{ color: "#cbd5e1", fontSize: 11 }}>-</span>;
  }

  return (
    <>
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        style={{
          width: 160, height: 100, borderRadius: 4, cursor: "pointer",
          border: dragging ? "2px solid #3b82f6" : "1px dashed #cbd5e1",
          background: dragging ? "#eff6ff" : "#f8fafc",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#94a3b8", fontSize: dragging ? 11 : 16,
          transition: "all 0.15s",
        }}
        title="画像をドラッグ＆ドロップ、またはクリックして選択"
      >
        {dragging ? "↓" : "+"}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: "none" }}
      />
    </>
  );
}
