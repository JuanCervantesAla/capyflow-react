import { useEffect, useContext } from "react";
import { useReactFlow } from "@xyflow/react";
import { FlowContext } from "../context/FlowContext";

export function FlowInternals() {
  const reactFlow = useReactFlow();
  const { registerCenterHandler } = useContext(FlowContext);

  useEffect(() => {
    registerCenterHandler((nodeId: string) => {
      reactFlow.fitView({
        nodes: [{ id: nodeId }],
        padding: 0.5,
        duration: 600,
        maxZoom: 1.2,
      });
    });
  }, [reactFlow, registerCenterHandler]);

  return null;
}
