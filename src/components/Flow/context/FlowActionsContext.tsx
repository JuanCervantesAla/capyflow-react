import { createContext, useContext } from "react";
import type { NodeData, FlowNode } from "../types/NodeTypes";

interface FlowActions {
  addNode: (data: Partial<NodeData>, type?: string, onNodeAdded?: (node: FlowNode) => void) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
}

export const FlowActionsContext = createContext<FlowActions>({
  addNode: () => {},
  deleteNode: () => {},
  duplicateNode: () => {},
});

export const useFlowActions = () => useContext(FlowActionsContext);