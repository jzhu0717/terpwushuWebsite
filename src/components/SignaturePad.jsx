import { useRef, useEffect } from "react";

export default function SignaturePad({ onChange, height = 160 }) {
    const canvasRef = useRef(null);
    const drawingRef = useRef(false);
    const hasDrawnRef = useRef(false);
    const lastPointRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ratio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        const ctx = canvas.getContext("2d");
        ctx.scale(ratio, ratio);
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#111";
    }, []);

    const getPoint = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches?.[0];
        const clientX = touch ? touch.clientX : e.clientX;
        const clientY = touch ? touch.clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startStroke = (e) => {
        e.preventDefault();
        drawingRef.current = true;
        lastPointRef.current = getPoint(e);
    };

    const moveStroke = (e) => {
        if (!drawingRef.current) return;
        e.preventDefault();
        const point = getPoint(e);
        const ctx = canvasRef.current.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        lastPointRef.current = point;
        hasDrawnRef.current = true;
    };

    const endStroke = () => {
        if (!drawingRef.current) return;
        drawingRef.current = false;
        if (hasDrawnRef.current) {
            onChange(canvasRef.current.toDataURL("image/png"));
        }
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawnRef.current = false;
        onChange(null);
    };

    return (
        <div className="flex flex-col gap-2">
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#444" }}>Sign Here:</span>
            <canvas
                ref={canvasRef}
                style={{
                    width: "100%",
                    height: `${height}px`,
                    border: "1px solid #999",
                    borderRadius: "4px",
                    background: "#fff",
                    touchAction: "none",
                    cursor: "crosshair",
                }}
                onMouseDown={startStroke}
                onMouseMove={moveStroke}
                onMouseUp={endStroke}
                onMouseLeave={endStroke}
                onTouchStart={startStroke}
                onTouchMove={moveStroke}
                onTouchEnd={endStroke}
            />
            <button
                type="button"
                onClick={handleClear}
                className="self-start text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition-all"
            >
                CLEAR
            </button>
        </div>
    );
}
