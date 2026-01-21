import { memo } from "react";
import { ControlCard } from "../UI/ControlCard";
import { ControlButton } from "../UI/ControlButton";
import { IconZoomIn, IconZoomOut, IconFocus, IconReload } from "@tabler/icons-react";
import { useTheme } from "../../theme/ThemeContext";

interface CustomControlsProps {
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  reset: () => void;
}

export const CustomControls = memo(function CustomControls({ 
  zoomIn, 
  zoomOut, 
  fitView, 
  reset 
}: CustomControlsProps) {
  const { theme } = useTheme();

  return (
    <ControlCard
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: 12,
      }}
    >
      <ControlButton
        icon={<IconZoomIn size={18} />}
        onClick={zoomIn}
        tooltip="Zoom In"
      />

      <ControlButton
        icon={<IconZoomOut size={18} />}
        onClick={zoomOut}
        tooltip="Zoom Out"
      />

      <div
        style={{
          width: "100%",
          height: 1,
          background: theme.colors.border.primary,
          margin: "4px 0",
        }}
      />

      <ControlButton
        icon={<IconFocus size={18} />}
        onClick={fitView}
        tooltip="Fit View"
      />

      <ControlButton
        icon={<IconReload size={18} />}
        onClick={reset}
        tooltip="Reset View"
      />
    </ControlCard>
  );
});