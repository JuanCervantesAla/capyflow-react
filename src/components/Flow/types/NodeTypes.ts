export type NodeStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
  | "disabled"
  | "queued";

/* ---------------------- PARAMETROS DEL NODO ---------------------- */

export type NodeParameterType =
  | "string"
  | "number"
  | "boolean"
  | "select"
  | "json"
  | "code"
  | "password"
  | "file"
  | "any";

export interface NodeParameter {
  id: string;                 // ID único para editor
  name: string;               // Nombre visible
  type: NodeParameterType;    // Tipo del param
  value: any;                 // Valor actual
  required?: boolean;         // Es obligatorio?
  options?: string[];         // Para selects
  placeholder?: string;       // UX
  description?: string;       // Ayuda al usuario
}


/* ---------------------- INPUTS / OUTPUTS ---------------------- */

export interface NodeIO {
  id: string;                 // id único
  name: string;               // mostrado en UI
  type?: string;              // "json" | "text" | "binary"
  required?: boolean;
  description?: string;
}


/* ---------------------- DATA DEL NODO ---------------------- */

export interface NodeData {
  /* ------- IDENTIDAD ------- */
  label: string;
  subtitle?: string;
  icon?: string;               // nombre del icono

  /* ------- APARIENCIA ------- */
  color?: string;              // color del nodo
  category?: string;           // "AI", "HTTP", "Logic", etc
  description?: string;

  /* ------- CONFIG DEL USUARIO ------- */
  parameters?: NodeParameter[];
  inputs?: NodeIO[];
  outputs?: NodeIO[];

  /* ------- ESTADO DE EJECUCIÓN ------- */
  status?: NodeStatus;
  lastRun?: string;            // timestamp
  errorMessage?: string;       // motivo del error
  executionTimeMs?: number;

  /* ------- CONTROL ------- */
  disabled?: boolean;
  retryOnFail?: boolean;
  retries?: number;

  /* ------- METADATA VARIADA ------- */
  version?: string;
  createdAt?: string;
  updatedAt?: string;

  /* ------- FLEXIBILIDAD ------- */
  [key: string]: any;
}


/* ---------------------- NODO COMPLETO ---------------------- */

export interface FlowNode {
  id: string;                       // ID reactflow/XYFlow
  type: string;                     // "httpRequest" | "aiChat" | "math" | etc
  position: { x: number; y: number };
  data: NodeData;                   // toda la info del nodo

  width?: number;                   // útil para UI
  height?: number;
}
