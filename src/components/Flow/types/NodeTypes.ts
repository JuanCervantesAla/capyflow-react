export type NodeStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
  | "disabled"
  | "queued";


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
  id: string;                 
  name: string;               
  type: NodeParameterType;    
  value: any;                 
  required?: boolean;         
  options?: string[];         
  placeholder?: string;       
  description?: string;       
}



export interface NodeIO {
  id: string;                 
  name: string;               
  type?: string;              
  required?: boolean;
  description?: string;
}



export interface NodeData {
    label: string;
  subtitle?: string;
  icon?: string;                   color?: string;              
  category?: string;           
  description?: string;

    parameters?: NodeParameter[];
  inputs?: NodeIO[];
  outputs?: NodeIO[];

    status?: NodeStatus;
  lastRun?: string;            
  errorMessage?: string;       
  executionTimeMs?: number;

    disabled?: boolean;
  retryOnFail?: boolean;
  retries?: number;

    version?: string;
  createdAt?: string;
  updatedAt?: string;

    [key: string]: any;
}



export interface FlowNode {
  id: string;                       
  type: string;                     
  position: { x: number; y: number };
  data: NodeData;                     width?: number;                   
  height?: number;
}
