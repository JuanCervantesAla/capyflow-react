import type { FlowNode } from "./NodeTypes";
import type { Edge } from "@xyflow/react";

export interface Flow {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  nodes?: FlowNode[];
  edges?: Edge[];
}