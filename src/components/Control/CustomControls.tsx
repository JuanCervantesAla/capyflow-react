import { ControlCard } from "../UI/ControlCard";
import { ControlButton } from "../UI/ControlButton";
import { IconZoomIn, IconZoomOut } from "@tabler/icons-react";
import { useTheme } from "../../theme/themeContext";
import { useReactFlow, useStore } from "@xyflow/react";

export function CustomControls() {
  const { theme } = useTheme();
  const { zoomIn, zoomOut, setViewport } = useReactFlow();
  const zoom = useStore((state) => state.transform[2]);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViewport({ zoom: Number(e.target.value) });
  };

  return (
    <div
  style={{
    position: "absolute",
    left: 10,
    top: 260,
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.md,
    alignItems: "center",
  }}
>
  <ControlCard
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      padding: 16,
    }}
  >
    <ControlButton
      icon={<IconZoomIn size={18} />}
      onClick={zoomIn}
      tooltip="Zoom In"
    />

    {/* CONTENEDOR ROTADO */}
    <div
  style={{
    width: 40,
    height: 140,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transform: "rotate(-90deg)",
    transformOrigin: "center",
  }}
>
  <input
    type="range"
    min={0.5}
    max={2}
    step={0.01}
    value={zoom}
    onChange={handleZoomChange}
    style={{
      WebkitAppearance: "none",
      appearance: "none",
      width: 140,
      height: 6,
      background: "transparent",
      cursor: "pointer",
    }}
  />
</div>

    <ControlButton
      icon={<IconZoomOut size={18} />}
      onClick={zoomOut}
      tooltip="Zoom Out"
    />
  </ControlCard>

  {/* <span style={{ color: theme.colors.text.accent, fontSize: 12 }}>
    {Math.round(zoom * 100)}%
  </span> */}

  <style>{`
    /* TRACK */
    input[type="range"]::-webkit-slider-runnable-track {
      width: 120px;
      height: 6px;
      background: #000;
      border-radius: 3px;
    }

    /* THUMB (Chrome | Edge) */
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
      border: 2px solid #000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: 0.2s;
      margin-top: -6px;
    }

    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }

    /* FIREFOX */
    input[type="range"]::-moz-range-track {
      width: 120px;
      height: 6px;
      background: #000;
      border-radius: 3px;
    }

    input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
      border: 2px solid #000;
      transition: 0.2s;
    }

    input[type="range"]::-moz-range-thumb:hover {
      transform: scale(1.2);
    }
  `}</style>
</div>

  );
}