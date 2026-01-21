import { memo } from "react";

export const Rightbar = memo(function Rightbar({
  node,
  open,
  onClose,
}) {
  return (
    <aside
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 320,
        height: "100%",
        background: "#111",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 200ms ease",
        pointerEvents: open ? "auto" : "none", // 🔥 CLAVE
        zIndex: 20,
      }}
    >
      {/* contenido */}
    </aside>
  );
});
