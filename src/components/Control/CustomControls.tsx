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
    <ControlCard>
      <ControlButton
        icon={<IconZoomIn size={20} strokeWidth={2.5} />}
        onClick={zoomIn}
        tooltip="Zoom In"
      />

      <ControlButton
        icon={<IconZoomOut size={20} strokeWidth={2.5} />}
        onClick={zoomOut}
        tooltip="Zoom Out"
      />

      <div
        style={{
          width: "100%",
          height: 2,
          background: theme.colors.ink,
          margin: "4px 0",
          opacity: 0.15,
        }}
      />

      <ControlButton
        icon={<IconFocus size={20} strokeWidth={2.5} />}
        onClick={fitView}
        tooltip="Fit View"
      />

      <ControlButton
        icon={<IconReload size={20} strokeWidth={2.5} />}
        onClick={reset}
        tooltip="Reset View"
      />
    </ControlCard>
  );
});