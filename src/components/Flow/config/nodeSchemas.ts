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
    description: 'Realiza peticiones HTTP a APIs externas con retry automático',
    category: 'actions',
    parameters: [
      {
        name: 'URL',
        key: 'url',
        type: 'string',
        required: true,
        placeholder: 'https://api.example.com/users/{{userId}}',
        description: 'URL del endpoint. Usa {{variable}} para interpolar valores',
      },
      {
        name: 'Method',
        key: 'method',
        type: 'select',
        required: true,
        defaultValue: 'GET',
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        description: 'Método HTTP',
      },
      {
        name: 'Headers',
        key: 'headers',
        type: 'keyvalue',
        required: false,
        defaultValue: {},
        description: 'Headers HTTP (Authorization, Content-Type, etc)',
      },
      {
        name: 'Body',
        key: 'body',
        type: 'json',
        required: false,
        defaultValue: {},
        placeholder: '{\n  "email": "{{email}}",\n  "name": "{{nombre}}"\n}',
        description: 'Cuerpo JSON para POST/PUT/PATCH',
      },
      {
        name: 'Timeout (ms)',
        key: 'timeout',
        type: 'number',
        required: false,
        defaultValue: 30000,
        description: 'Timeout de la petición en milisegundos',
      },
      {
        name: 'Max Retries',
        key: 'maxRetries',
        type: 'number',
        required: false,
        defaultValue: 0,
        placeholder: '0',
        description: 'Número de reintentos en caso de fallo (0 = sin retry, máx: 10)',
      },
      {
        name: 'Retry Delay (ms)',
        key: 'retryDelay',
        type: 'number',
        required: false,
        defaultValue: 1000,
        placeholder: '1000',
        description: 'Delay inicial entre reintentos en ms (se incrementa exponencialmente)',
      },
      {
        name: 'Backoff Multiplier',
        key: 'backoffMultiplier',
        type: 'number',
        required: false,
        defaultValue: 2.0,
        placeholder: '2.0',
        description: 'Multiplicador para backoff exponencial (1.0 = constante, 2.0 = duplica cada vez)',
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

      if (params.maxRetries && (params.maxRetries < 0 || params.maxRetries > 10)) {
        return 'Max Retries debe estar entre 0 y 10';
      }

      if (params.retryDelay && params.retryDelay < 100) {
        return 'Retry Delay debe ser al menos 100ms';
      }

      if (params.backoffMultiplier && (params.backoffMultiplier < 1.0 || params.backoffMultiplier > 5.0)) {
        return 'Backoff Multiplier debe estar entre 1.0 y 5.0';
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
    description: 'Extrae, renombra y transforma campos de datos',
    category: 'data',
    parameters: [
      {
        name: 'Transformations',
        key: 'transformations',
        type: 'json',
        required: true,
        description: 'Array de transformaciones a aplicar',
        placeholder: JSON.stringify([
          {
            source: "body.name",
            target: "userName",
            operation: "extract"
          },
          {
            source: "body.email",
            target: "userEmail",
            operation: "extract"
          },
          {
            source: "body.id",
            target: "userId",
            operation: "extract"
          }
        ], null, 2),
        defaultValue: [],
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.transformations || !Array.isArray(params.transformations)) {
        return 'Las transformaciones deben ser un array';
      }
      if (params.transformations.length === 0) {
        return 'Debes definir al menos una transformación';
      }
      // Validar cada transformación
      for (const t of params.transformations) {
        if (!t.source || !t.target || !t.operation) {
          return 'Cada transformación debe tener source, target y operation';
        }
        const validOps = ['extract', 'rename', 'default', 'calculate', 'concat'];
        if (!validOps.includes(t.operation)) {
          return `Operación inválida: ${t.operation}. Debe ser una de: ${validOps.join(', ')}`;
        }
      }
      return null;
    },
  },

  'loop': {
    type: 'loop',
    displayName: 'Loop/ForEach',
    description: 'Itera sobre un array y aplica operaciones',
    category: 'control',
    parameters: [
      {
        name: 'Array Source',
        key: 'arraySource',
        type: 'string',
        required: true,
        placeholder: 'body.users',
        description: 'Path al array en el contexto (ej: body.users, items)',
      },
      {
        name: 'Operation',
        key: 'operation',
        type: 'select',
        required: true,
        defaultValue: 'forEach',
        options: ['forEach', 'map', 'filter'],
        description: 'Tipo de operación a realizar',
      },
      {
        name: 'Map Expression',
        key: 'mapExpression',
        type: 'string',
        required: false,
        placeholder: '{{item.name}}',
        description: 'Para "map": expresión a aplicar a cada item (usa {{item}} y {{index}})',
      },
      {
        name: 'Filter Expression',
        key: 'filterExpr',
        type: 'string',
        required: false,
        placeholder: '{{item.age}} > 18',
        description: 'Para "filter": condición que debe cumplir cada item',
      },
      {
        name: 'Item Variable',
        key: 'itemVariable',
        type: 'string',
        required: false,
        defaultValue: 'item',
        placeholder: 'item',
        description: 'Nombre de la variable para cada item (default: item)',
      },
      {
        name: 'Index Variable',
        key: 'indexVariable',
        type: 'string',
        required: false,
        defaultValue: 'index',
        placeholder: 'index',
        description: 'Nombre de la variable para el índice (default: index)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.arraySource || params.arraySource.trim() === '') {
        return 'El array source es requerido';
      }
      if (params.operation === 'map' && (!params.mapExpression || params.mapExpression.trim() === '')) {
        return 'La expresión map es requerida para la operación "map"';
      }
      if (params.operation === 'filter' && (!params.filterExpr || params.filterExpr.trim() === '')) {
        return 'La expresión filter es requerida para la operación "filter"';
      }
      return null;
    },
  },

  'delay': {
    type: 'delay',
    displayName: 'Delay/Wait',
    description: 'Pausa la ejecución por un tiempo determinado',
    category: 'control',
    parameters: [
      {
        name: 'Duration (ms)',
        key: 'duration',
        type: 'number',
        required: true,
        defaultValue: 1000,
        placeholder: '1000',
        description: 'Tiempo de espera en milisegundos (min: 100ms, max: 300000ms = 5min)',
      },
      {
        name: 'Reason',
        key: 'reason',
        type: 'string',
        required: false,
        placeholder: 'Wait for API rate limit reset',
        description: 'Descripción opcional del motivo del delay (para logging)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.duration || params.duration <= 0) {
        return 'La duración debe ser mayor a 0ms';
      }
      if (params.duration > 300000) {
        return 'La duración máxima es 300000ms (5 minutos)';
      }
      if (params.duration < 100) {
        return 'La duración mínima es 100ms';
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
    description: 'Recibe peticiones HTTP externas para iniciar el flow',
    category: 'triggers',
    parameters: [
      {
        name: 'Validation Enabled',
        key: 'validationEnabled',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Habilitar validación de firma del webhook',
      },
      {
        name: 'Secret',
        key: 'secret',
        type: 'string',
        required: false,
        placeholder: 'webhook-secret-key',
        description: 'Secret para validar firma del webhook (opcional)',
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