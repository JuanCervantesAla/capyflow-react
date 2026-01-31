export type NodeParameterType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'select'
  | 'textarea'
  | 'json'
  | 'http-method'
  | 'http-headers'
  | 'key-value';

export interface NodeParameterSchema {
  name: string;
  key: string;
  type: NodeParameterType;
  required?: boolean;
  defaultValue?: any;
  placeholder?: string;
  description?: string;
  options?: string[];
  validation?: (value: any) => string | null;
}

export interface NodeTypeSchema {
  type: string;
  displayName: string;
  description: string;
  category: string;
  parameters: NodeParameterSchema[];
  validateBeforeExecute?: (params: Record<string, any>) => string | null;
}

export const NODE_SCHEMAS: Record<string, NodeTypeSchema> = {
  'manual-trigger': {
    type: 'manual-trigger',
    displayName: 'Manual Trigger',
    description: 'Inicia el flow manualmente',
    category: 'triggers',
    parameters: [],
  },

  'set-data': {
    type: 'set-data',
    displayName: 'Set Data',
    description: 'Define datos estáticos o variables',
    category: 'data',
    parameters: [
      {
        name: 'Values',
        key: 'values',
        type: 'key-value',
        required: true,
        description: 'Pares clave-valor que se establecerán en la salida',
        defaultValue: {},
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.values || typeof params.values !== 'object') {
        return 'El parámetro "values" debe ser un objeto';
      }
      if (Object.keys(params.values).length === 0) {
        return 'Debes definir al menos un valor';
      }
      return null;
    },
  },

  'http-request': {
    type: 'http-request',
    displayName: 'HTTP Request',
    description: 'Realiza una petición HTTP',
    category: 'actions',
    parameters: [
      {
        name: 'URL',
        key: 'url',
        type: 'string',
        required: true,
        placeholder: 'https://api.example.com/endpoint',
        description: 'URL completa del endpoint',
        validation: (value) => {
          if (!value) return 'La URL es requerida';
          try {
            new URL(value);
            return null;
          } catch {
            return 'URL inválida';
          }
        },
      },
      {
        name: 'Method',
        key: 'method',
        type: 'http-method',
        required: true,
        defaultValue: 'GET',
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        description: 'Método HTTP',
      },
      {
        name: 'Headers',
        key: 'headers',
        type: 'http-headers',
        required: false,
        defaultValue: {},
        description: 'Headers personalizados',
      },
      {
        name: 'Body',
        key: 'body',
        type: 'json',
        required: false,
        placeholder: '{\n  "key": "value"\n}',
        description: 'Cuerpo de la petición (JSON)',
      },
      {
        name: 'Timeout (ms)',
        key: 'timeout',
        type: 'number',
        required: false,
        defaultValue: 30000,
        description: 'Timeout de la petición en milisegundos',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.url) return 'La URL es requerida';
      if (!params.method) return 'El método HTTP es requerido';
      
      if (params.body && typeof params.body === 'string') {
        try {
          JSON.parse(params.body);
        } catch {
          return 'El body debe ser un JSON válido';
        }
      }
      return null;
    },
  },

  'log': {
    type: 'log',
    displayName: 'Log',
    description: 'Registra información en la consola',
    category: 'utils',
    parameters: [
      {
        name: 'Message',
        key: 'message',
        type: 'string',
        required: true,
        placeholder: 'Mensaje a registrar...',
        description: 'Mensaje que se mostrará en el log',
      },
      {
        name: 'Level',
        key: 'level',
        type: 'select',
        required: false,
        defaultValue: 'info',
        options: ['debug', 'info', 'warn', 'error'],
        description: 'Nivel de log',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.message || params.message.trim() === '') {
        return 'El mensaje es requerido';
      }
      return null;
    },
  },

  'if-condition': {
    type: 'if-condition',
    displayName: 'If Condition',
    description: 'Ejecuta ramas basadas en una condición',
    category: 'logic',
    parameters: [
      {
        name: 'Field',
        key: 'field',
        type: 'string',
        required: true,
        placeholder: 'data.status',
        description: 'Campo a evaluar (usar notación de punto)',
      },
      {
        name: 'Operator',
        key: 'operator',
        type: 'select',
        required: true,
        defaultValue: '==',
        options: ['==', '!=', '>', '<', '>=', '<=', 'contains', 'exists'],
        description: 'Operador de comparación',
      },
      {
        name: 'Value',
        key: 'value',
        type: 'string',
        required: false,
        placeholder: 'Valor a comparar',
        description: 'Valor con el que comparar',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.field) return 'El campo es requerido';
      if (!params.operator) return 'El operador es requerido';
      if (params.operator !== 'exists' && !params.value) {
        return 'El valor es requerido para este operador';
      }
      return null;
    },
  },

  'transform-data': {
    type: 'transform-data',
    displayName: 'Transform Data',
    description: 'Transforma datos usando expresiones',
    category: 'data',
    parameters: [
      {
        name: 'Transformations',
        key: 'transformations',
        type: 'key-value',
        required: true,
        description: 'Mapeo de campos: nuevo_campo -> expresión',
        defaultValue: {},
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.transformations || typeof params.transformations !== 'object') {
        return 'Las transformaciones deben ser un objeto';
      }
      if (Object.keys(params.transformations).length === 0) {
        return 'Debes definir al menos una transformación';
      }
      return null;
    },
  },

  'json-parser': {
    type: 'json-parser',
    displayName: 'JSON Parser',
    description: 'Parsea texto JSON a objeto',
    category: 'data',
    parameters: [
      {
        name: 'JSON String',
        key: 'jsonString',
        type: 'textarea',
        required: true,
        placeholder: '{"key": "value"}',
        description: 'Cadena JSON a parsear',
      },
      {
        name: 'Extract Path',
        key: 'extractPath',
        type: 'string',
        required: false,
        placeholder: 'data.items[0]',
        description: 'Ruta específica a extraer (opcional)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.jsonString) return 'El JSON string es requerido';
      try {
        JSON.parse(params.jsonString);
        return null;
      } catch {
        return 'JSON inválido';
      }
    },
  },

  'webhook-trigger': {
    type: 'webhook-trigger',
    displayName: 'Webhook Trigger',
    description: 'Inicia el flow mediante webhook',
    category: 'triggers',
    parameters: [
      {
        name: 'Webhook ID',
        key: 'webhookId',
        type: 'string',
        required: false,
        description: 'ID del webhook (se genera automáticamente)',
      },
    ],
  },
};

export function getNodeSchema(nodeType: string): NodeTypeSchema | null {
  return NODE_SCHEMAS[nodeType] || null;
}

export function validateNodeParameters(
  nodeType: string,
  parameters: Record<string, any>
): string | null {
  const schema = getNodeSchema(nodeType);
  if (!schema) return `Tipo de nodo desconocido: ${nodeType}`;

  for (const param of schema.parameters) {
    if (param.required && (parameters[param.key] === undefined || parameters[param.key] === null || parameters[param.key] === '')) {
      return `El parámetro "${param.name}" es requerido`;
    }

    if (param.validation && parameters[param.key] !== undefined) {
      const error = param.validation(parameters[param.key]);
      if (error) return error;
    }
  }

  if (schema.validateBeforeExecute) {
    return schema.validateBeforeExecute(parameters);
  }

  return null;
}

export function getDefaultNodeParameters(nodeType: string): Record<string, any> {
  const schema = getNodeSchema(nodeType);
  if (!schema) return {};

  const defaults: Record<string, any> = {};
  for (const param of schema.parameters) {
    if (param.defaultValue !== undefined) {
      defaults[param.key] = param.defaultValue;
    }
  }
  return defaults;
}