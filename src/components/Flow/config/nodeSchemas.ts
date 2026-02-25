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

  'switch': {
    type: 'switch',
    displayName: 'Switch',
    description: 'Enrutamiento multi-camino basado en valor',
    category: 'logic',
    parameters: [
      {
        name: 'Input Value',
        key: 'inputValue',
        type: 'json',
        required: true,
        placeholder: '{{ $json.status }}',
        description: 'Valor a evaluar contra los casos',
      },
      {
        name: 'Cases',
        key: 'cases',
        type: 'json',
        required: true,
        placeholder: JSON.stringify([
          { value: 'success', output: 'case_success' },
          { value: 'pending', output: 'case_pending' },
          { value: 'error', output: 'case_error' }
        ], null, 2),
        description: 'Array de casos {value, output}',
      },
      {
        name: 'Mode',
        key: 'mode',
        type: 'select',
        required: true,
        defaultValue: 'equals',
        options: ['equals', 'contains'],
        description: 'Modo de comparación',
      },
      {
        name: 'Default Case',
        key: 'defaultCase',
        type: 'string',
        required: false,
        placeholder: 'default',
        description: 'Salida por defecto si no hay match',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputValue) return 'Input Value es requerido';
      if (!params.cases || !Array.isArray(params.cases)) {
        return 'Cases debe ser un array';
      }
      if (params.cases.length === 0) {
        return 'Debe definir al menos un caso';
      }
      for (const c of params.cases) {
        if (!c.value || !c.output) {
          return 'Cada caso debe tener value y output';
        }
      }
      return null;
    },
  },

  'error-handler': {
    type: 'error-handler',
    displayName: 'Error Handler',
    description: 'Manejo de errores con reintentos y fallback',
    category: 'logic',
    parameters: [
      {
        name: 'Input Data',
        key: 'inputData',
        type: 'json',
        required: true,
        placeholder: '{{ $json }}',
        description: 'Datos a verificar por errores',
      },
      {
        name: 'Max Retries',
        key: 'maxRetries',
        type: 'number',
        required: false,
        defaultValue: 3,
        description: 'Número máximo de reintentos',
      },
      {
        name: 'Retry Delay (ms)',
        key: 'retryDelay',
        type: 'number',
        required: false,
        defaultValue: 1000,
        description: 'Tiempo entre reintentos en milisegundos',
      },
      {
        name: 'Fallback Mode',
        key: 'fallbackMode',
        type: 'select',
        required: true,
        defaultValue: 'ignore',
        options: ['ignore', 'default', 'stop'],
        description: 'Estrategia cuando se agotan reintentos',
      },
      {
        name: 'Default Value',
        key: 'defaultValue',
        type: 'json',
        required: false,
        placeholder: '{}',
        description: 'Valor por defecto (fallbackMode=default)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputData) return 'Input Data es requerido';
      if (!params.fallbackMode) return 'Fallback Mode es requerido';
      if (params.fallbackMode === 'default' && !params.defaultValue) {
        return 'Default Value es requerido cuando fallbackMode=default';
      }
      if (params.maxRetries && params.maxRetries < 0) {
        return 'Max Retries debe ser >= 0';
      }
      if (params.retryDelay && params.retryDelay < 0) {
        return 'Retry Delay debe ser >= 0';
      }
      return null;
    },
  },

  'stop': {
    type: 'stop',
    displayName: 'Stop',
    description: 'Detiene el flujo condicionalmente',
    category: 'logic',
    parameters: [
      {
        name: 'Condition',
        key: 'condition',
        type: 'select',
        required: true,
        defaultValue: 'always',
        options: ['always', 'if-true', 'if-false', 'if-error'],
        description: 'Condición para detener el flujo',
      },
      {
        name: 'Input Value',
        key: 'inputValue',
        type: 'json',
        required: false,
        placeholder: '{{ $json }}',
        description: 'Valor a evaluar (excepto always/if-error)',
      },
      {
        name: 'Stop Message',
        key: 'stopMessage',
        type: 'string',
        required: false,
        placeholder: 'Workflow stopped',
        description: 'Mensaje al detener',
      },
      {
        name: 'Stop Code',
        key: 'stopCode',
        type: 'select',
        required: true,
        defaultValue: 'success',
        options: ['success', 'error'],
        description: 'Código de salida',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.condition) return 'Condition es requerida';
      if ((params.condition === 'if-true' || params.condition === 'if-false') && !params.inputValue) {
        return 'Input Value es requerido para if-true/if-false';
      }
      if (!params.stopCode) return 'Stop Code es requerido';
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

  'gemini': {
    type: 'gemini',
    displayName: 'Gemini',
    description: 'Interactúa con Google Gemini para generar texto, análisis y respuestas inteligentes',
    category: 'ai',
    parameters: [
      {
        name: 'Prompt',
        key: 'prompt',
        type: 'textarea',
        required: true,
        placeholder: 'Escribe tu prompt aquí... Usa {{variable}} para interpolar valores',
        description: 'El prompt o pregunta para el modelo Gemini',
      },
      {
        name: 'API Key',
        key: 'apiKey',
        type: 'string',
        required: false,
        placeholder: 'Deja vacío para usar tu API key guardada',
        description: 'API Key de Google Gemini (opcional si ya configuraste una en tu perfil)',
      },
      {
        name: 'Temperature',
        key: 'temperature',
        type: 'number',
        required: false,
        defaultValue: 0.7,
        placeholder: '0.7',
        description: 'Creatividad de las respuestas (0 = determinístico, 2 = muy creativo)',
      },
      {
        name: 'Max Tokens',
        key: 'maxTokens',
        type: 'number',
        required: false,
        defaultValue: 1024,
        placeholder: '1024',
        description: 'Máximo número de tokens en la respuesta (1-8192)',
      },
      {
        name: 'System Prompt',
        key: 'systemPrompt',
        type: 'textarea',
        required: false,
        placeholder: 'Eres un asistente experto en...',
        description: 'Instrucciones del sistema para definir el comportamiento del modelo (opcional)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.prompt || params.prompt.trim() === '') {
        return 'El prompt es requerido';
      }
      if (params.temperature !== undefined && (params.temperature < 0 || params.temperature > 2)) {
        return 'Temperature debe estar entre 0 y 2';
      }
      if (params.maxTokens !== undefined && (params.maxTokens < 1 || params.maxTokens > 8192)) {
        return 'Max Tokens debe estar entre 1 y 8192';
      }
      return null;
    },
  },

  'gpt': {
    type: 'gpt',
    displayName: 'GPT',
    description: 'Usa OpenAI GPT-4 para generación de texto, reasoning y tareas complejas',
    category: 'ai',
    parameters: [
      {
        name: 'Prompt',
        key: 'prompt',
        type: 'textarea',
        required: true,
        placeholder: 'Escribe tu prompt aquí... Usa {{variable}} para interpolar valores',
        description: 'El prompt o pregunta para el modelo GPT',
      },
      {
        name: 'API Key',
        key: 'apiKey',
        type: 'string',
        required: true,
        placeholder: 'sk-...',
        description: 'API Key de OpenAI (obtén una en https://platform.openai.com)',
      },
      {
        name: 'Model',
        key: 'model',
        type: 'select',
        required: false,
        defaultValue: 'gpt-4o-mini',
        options: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        description: 'Modelo de GPT a utilizar',
      },
      {
        name: 'Temperature',
        key: 'temperature',
        type: 'number',
        required: false,
        defaultValue: 0.7,
        placeholder: '0.7',
        description: 'Creatividad de las respuestas (0 = determinístico, 2 = muy creativo)',
      },
      {
        name: 'Max Tokens',
        key: 'maxTokens',
        type: 'number',
        required: false,
        defaultValue: 1024,
        placeholder: '1024',
        description: 'Máximo número de tokens en la respuesta (1-16384)',
      },
      {
        name: 'System Prompt',
        key: 'systemPrompt',
        type: 'textarea',
        required: false,
        placeholder: 'You are a helpful assistant...',
        description: 'Instrucciones del sistema para definir el comportamiento del modelo (opcional)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.prompt || params.prompt.trim() === '') {
        return 'El prompt es requerido';
      }
      if (!params.apiKey || params.apiKey.trim() === '') {
        return 'La API Key de OpenAI es requerida';
      }
      if (params.temperature !== undefined && (params.temperature < 0 || params.temperature > 2)) {
        return 'Temperature debe estar entre 0 y 2';
      }
      if (params.maxTokens !== undefined && (params.maxTokens < 1 || params.maxTokens > 16384)) {
        return 'Max Tokens debe estar entre 1 y 16384';
      }
      return null;
    },
  },

  'claude': {
    type: 'claude',
    displayName: 'Claude',
    description: 'Anthropic Claude para análisis profundo, escritura y tareas de razonamiento',
    category: 'ai',
    parameters: [
      {
        name: 'Prompt',
        key: 'prompt',
        type: 'textarea',
        required: true,
        placeholder: 'Escribe tu prompt aquí... Usa {{variable}} para interpolar valores',
        description: 'El prompt o pregunta para el modelo Claude',
      },
      {
        name: 'API Key',
        key: 'apiKey',
        type: 'string',
        required: true,
        placeholder: 'sk-ant-...',
        description: 'API Key de Anthropic (obtén una en https://console.anthropic.com)',
      },
      {
        name: 'Model',
        key: 'model',
        type: 'select',
        required: false,
        defaultValue: 'claude-3-5-sonnet-20241022',
        options: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
        description: 'Modelo de Claude a utilizar',
      },
      {
        name: 'Temperature',
        key: 'temperature',
        type: 'number',
        required: false,
        defaultValue: 0.7,
        placeholder: '0.7',
        description: 'Creatividad de las respuestas (0 = determinístico, 1 = muy creativo)',
      },
      {
        name: 'Max Tokens',
        key: 'maxTokens',
        type: 'number',
        required: false,
        defaultValue: 1024,
        placeholder: '1024',
        description: 'Máximo número de tokens en la respuesta (1-8192)',
      },
      {
        name: 'System Prompt',
        key: 'systemPrompt',
        type: 'textarea',
        required: false,
        placeholder: 'You are a helpful assistant...',
        description: 'Instrucciones del sistema para definir el comportamiento del modelo (opcional)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.prompt || params.prompt.trim() === '') {
        return 'El prompt es requerido';
      }
      if (!params.apiKey || params.apiKey.trim() === '') {
        return 'La API Key de Anthropic es requerida';
      }
      if (params.temperature !== undefined && (params.temperature < 0 || params.temperature > 1)) {
        return 'Temperature debe estar entre 0 y 1 para Claude';
      }
      if (params.maxTokens !== undefined && (params.maxTokens < 1 || params.maxTokens > 8192)) {
        return 'Max Tokens debe estar entre 1 y 8192';
      }
      return null;
    },
  },

  'filter': {
    type: 'filter',
    displayName: 'Filter',
    description: 'Filtra arrays según condiciones específicas',
    category: 'data',
    parameters: [
      {
        name: 'Input Data',
        key: 'inputData',
        type: 'json',
        required: true,
        placeholder: '[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]',
        description: 'Array de datos a filtrar',
      },
      {
        name: 'Mode',
        key: 'mode',
        type: 'select',
        required: true,
        defaultValue: 'keep',
        options: ['keep', 'remove'],
        description: 'Mantener o remover elementos que coincidan',
      },
      {
        name: 'Field',
        key: 'field',
        type: 'string',
        required: false,
        placeholder: 'age',
        description: 'Campo a evaluar (dejar vacío para evaluar el elemento completo)',
      },
      {
        name: 'Operator',
        key: 'operator',
        type: 'select',
        required: true,
        defaultValue: 'equals',
        options: ['equals', 'notEquals', 'contains', 'startsWith', 'endsWith', 'greaterThan', 'lessThan', 'greaterOrEqual', 'lessOrEqual', 'isEmpty', 'isNotEmpty'],
        description: 'Operador de comparación',
      },
      {
        name: 'Value',
        key: 'value',
        type: 'string',
        required: false,
        placeholder: '25',
        description: 'Valor con el que comparar',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputData) {
        return 'Input Data es requerido';
      }
      if (!params.operator) {
        return 'Operator es requerido';
      }
      return null;
    },
  },

  'split': {
    type: 'split',
    displayName: 'Split',
    description: 'Divide arrays en elementos o lotes individuales',
    category: 'data',
    parameters: [
      {
        name: 'Input Data',
        key: 'inputData',
        type: 'json',
        required: true,
        placeholder: '[1, 2, 3, 4, 5]',
        description: 'Array de datos a dividir',
      },
      {
        name: 'Mode',
        key: 'mode',
        type: 'select',
        required: true,
        defaultValue: 'items',
        options: ['items', 'batches', 'field'],
        description: 'Tipo de división: items (individual), batches (lotes), field (extraer campo)',
      },
      {
        name: 'Batch Size',
        key: 'batchSize',
        type: 'number',
        required: false,
        defaultValue: 1,
        placeholder: '1',
        description: 'Tamaño de cada lote (solo para mode=batches)',
      },
      {
        name: 'Field',
        key: 'field',
        type: 'string',
        required: false,
        placeholder: 'id',
        description: 'Campo a extraer de cada elemento (solo para mode=field)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputData) {
        return 'Input Data es requerido';
      }
      if (!params.mode) {
        return 'Mode es requerido';
      }
      if (params.mode === 'batches' && (!params.batchSize || params.batchSize < 1)) {
        return 'Batch Size debe ser al menos 1 para mode=batches';
      }
      if (params.mode === 'field' && !params.field) {
        return 'Field es requerido para mode=field';
      }
      return null;
    },
  },

  'merge': {
    type: 'merge',
    displayName: 'Merge',
    description: 'Combina múltiples entradas en una salida unificada',
    category: 'data',
    parameters: [
      {
        name: 'Input 1',
        key: 'input1',
        type: 'json',
        required: true,
        placeholder: '[1, 2, 3]',
        description: 'Primera entrada a combinar',
      },
      {
        name: 'Input 2',
        key: 'input2',
        type: 'json',
        required: true,
        placeholder: '[4, 5, 6]',
        description: 'Segunda entrada a combinar',
      },
      {
        name: 'Mode',
        key: 'mode',
        type: 'select',
        required: true,
        defaultValue: 'append',
        options: ['append', 'combine', 'merge'],
        description: 'Tipo de combinación: append (unir arrays), combine (objeto con entradas), merge (fusionar objetos)',
      },
      {
        name: 'Input 3',
        key: 'input3',
        type: 'json',
        required: false,
        placeholder: '[7, 8, 9]',
        description: 'Tercera entrada (opcional)',
      },
      {
        name: 'Input 4',
        key: 'input4',
        type: 'json',
        required: false,
        placeholder: '[10, 11, 12]',
        description: 'Cuarta entrada (opcional)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.input1) {
        return 'Input 1 es requerido';
      }
      if (!params.input2) {
        return 'Input 2 es requerido';
      }
      if (!params.mode) {
        return 'Mode es requerido';
      }
      return null;
    },
  },

  'function': {
    type: 'function',
    displayName: 'Function',
    description: 'Ejecuta código JavaScript personalizado para transformaciones complejas',
    category: 'data',
    parameters: [
      {
        name: 'Input Data',
        key: 'inputData',
        type: 'json',
        required: false,
        placeholder: '{"key": "value"}',
        description: 'Datos de entrada (accesibles como "input" en el código)',
      },
      {
        name: 'JavaScript Code',
        key: 'code',
        type: 'textarea',
        required: true,
        defaultValue: 'return input;',
        placeholder: '// Transforma los datos\nreturn input.map(x => x * 2);',
        description: 'Código JavaScript. Usa "input" para los datos de entrada, "context" para el contexto del flow. Debe retornar un valor.',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.code || params.code.trim() === '') {
        return 'El código JavaScript es requerido';
      }
      return null;
    },
  },

  'sort': {
    type: 'sort',
    displayName: 'Sort',
    description: 'Ordena arrays por campo o valor (ascendente/descendente)',
    category: 'data',
    parameters: [
      {
        name: 'Input Array',
        key: 'inputData',
        type: 'json',
        required: true,
        placeholder: '[{"name":"Ana","age":25},{"name":"Bob","age":30}]',
        description: 'Array a ordenar',
      },
      {
        name: 'Field',
        key: 'field',
        type: 'string',
        required: false,
        placeholder: 'age',
        description: 'Campo por el cual ordenar (opcional para arrays primitivos)',
      },
      {
        name: 'Order',
        key: 'order',
        type: 'select',
        required: true,
        options: [
          { value: 'asc', label: 'Ascendente' },
          { value: 'desc', label: 'Descendente' },
        ],
        defaultValue: 'asc',
        description: 'Orden de clasificación',
      },
      {
        name: 'Type',
        key: 'type',
        type: 'select',
        required: true,
        options: [
          { value: 'string', label: 'String' },
          { value: 'number', label: 'Number' },
          { value: 'date', label: 'Date' },
        ],
        defaultValue: 'string',
        description: 'Tipo de dato para comparación',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputData) {
        return 'Input Array es requerido';
      }
      if (!params.order) {
        return 'Order es requerido';
      }
      return null;
    },
  },

  'csv-parser': {
    type: 'csv-parser',
    displayName: 'CSV Parser',
    description: 'Convierte entre CSV y JSON (parse/stringify)',
    category: 'data',
    parameters: [
      {
        name: 'Input Data',
        key: 'inputData',
        type: 'textarea',
        required: true,
        placeholder: 'name,age\nAna,25\nBob,30',
        description: 'CSV string (modo parse) o JSON array (modo stringify)',
      },
      {
        name: 'Mode',
        key: 'mode',
        type: 'select',
        required: true,
        options: [
          { value: 'parse', label: 'Parse (CSV → JSON)' },
          { value: 'stringify', label: 'Stringify (JSON → CSV)' },
        ],
        defaultValue: 'parse',
        description: 'Modo de conversión',
      },
      {
        name: 'Delimiter',
        key: 'delimiter',
        type: 'string',
        required: false,
        defaultValue: ',',
        placeholder: ',',
        description: 'Delimitador de columnas (por defecto: coma)',
      },
      {
        name: 'Has Header',
        key: 'hasHeader',
        type: 'boolean',
        required: false,
        defaultValue: true,
        description: 'La primera fila contiene nombres de columnas',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputData) {
        return 'Input Data es requerido';
      }
      if (!params.mode) {
        return 'Mode es requerido';
      }
      return null;
    },
  },

  'regex-extract': {
    type: 'regex-extract',
    displayName: 'Regex Extract',
    description: 'Extrae datos usando expresiones regulares',
    category: 'data',
    parameters: [
      {
        name: 'Input Text',
        key: 'inputData',
        type: 'textarea',
        required: true,
        placeholder: 'Email: test@example.com, Phone: 555-1234',
        description: 'Texto donde buscar coincidencias',
      },
      {
        name: 'Pattern',
        key: 'pattern',
        type: 'string',
        required: true,
        placeholder: '\\d{3}-\\d{4}',
        description: 'Expresión regular (sin delimitadores)',
      },
      {
        name: 'Mode',
        key: 'mode',
        type: 'select',
        required: true,
        options: [
          { value: 'first', label: 'First Match' },
          { value: 'all', label: 'All Matches' },
          { value: 'groups', label: 'Capture Groups' },
        ],
        defaultValue: 'first',
        description: 'Modo de extracción',
      },
      {
        name: 'Flags',
        key: 'flags',
        type: 'string',
        required: false,
        placeholder: 'i',
        description: 'Flags: i (case-insensitive), m (multiline), s (dotall)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputData) {
        return 'Input Text es requerido';
      }
      if (!params.pattern || params.pattern.trim() === '') {
        return 'Pattern es requerido';
      }
      return null;
    },
  },

  'email': {
    type: 'email',
    displayName: 'Email',
    description: 'Envía emails mediante SMTP',
    category: 'integration',
    parameters: [
      {
        name: 'To',
        key: 'to',
        type: 'string',
        required: true,
        placeholder: 'recipient@example.com',
        description: 'Destinatario(s) - separar múltiples con coma',
      },
      {
        name: 'Subject',
        key: 'subject',
        type: 'string',
        required: true,
        placeholder: 'Asunto del email',
        description: 'Asunto del mensaje',
      },
      {
        name: 'Body',
        key: 'body',
        type: 'textarea',
        required: true,
        placeholder: 'Contenido del mensaje...',
        description: 'Cuerpo del email en texto plano',
      },
      {
        name: 'From',
        key: 'from',
        type: 'string',
        required: true,
        placeholder: 'sender@example.com',
        description: 'Dirección del remitente',
      },
      {
        name: 'SMTP Host',
        key: 'smtpHost',
        type: 'string',
        required: true,
        placeholder: 'smtp.gmail.com',
        description: 'Servidor SMTP',
      },
      {
        name: 'SMTP Port',
        key: 'smtpPort',
        type: 'number',
        required: false,
        defaultValue: 587,
        description: 'Puerto SMTP (587 para TLS, 465 para SSL)',
      },
      {
        name: 'SMTP User',
        key: 'smtpUser',
        type: 'string',
        required: true,
        placeholder: 'usuario@example.com',
        description: 'Usuario para autenticación SMTP',
      },
      {
        name: 'SMTP Password',
        key: 'smtpPassword',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        description: 'Contraseña SMTP',
      },
      {
        name: 'CC',
        key: 'cc',
        type: 'string',
        required: false,
        placeholder: 'cc@example.com',
        description: 'Copia (CC) - separar múltiples con coma',
      },
      {
        name: 'BCC',
        key: 'bcc',
        type: 'string',
        required: false,
        placeholder: 'bcc@example.com',
        description: 'Copia oculta (BCC) - separar múltiples con coma',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.to || params.to.trim() === '') {
        return 'To es requerido';
      }
      if (!params.subject || params.subject.trim() === '') {
        return 'Subject es requerido';
      }
      if (!params.body || params.body.trim() === '') {
        return 'Body es requerido';
      }
      if (!params.from || params.from.trim() === '') {
        return 'From es requerido';
      }
      if (!params.smtpHost || params.smtpHost.trim() === '') {
        return 'SMTP Host es requerido';
      }
      if (!params.smtpUser || params.smtpUser.trim() === '') {
        return 'SMTP User es requerido';
      }
      if (!params.smtpPassword || params.smtpPassword.trim() === '') {
        return 'SMTP Password es requerido';
      }
      return null;
    },
  },

  'telegram': {
    type: 'telegram',
    displayName: 'Telegram',
    description: 'Envía mensajes mediante Telegram Bot API',
    category: 'integration',
    parameters: [
      {
        name: 'Bot Token',
        key: 'botToken',
        type: 'password',
        required: true,
        placeholder: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
        description: 'Token del bot de Telegram (@BotFather)',
      },
      {
        name: 'Chat ID',
        key: 'chatId',
        type: 'string',
        required: true,
        placeholder: '123456789',
        description: 'ID del chat o canal (usar @userinfobot)',
      },
      {
        name: 'Message',
        key: 'message',
        type: 'textarea',
        required: true,
        placeholder: 'Tu mensaje aquí...',
        description: 'Mensaje a enviar',
      },
      {
        name: 'Parse Mode',
        key: 'parseMode',
        type: 'select',
        required: false,
        defaultValue: '',
        options: [
          { value: '', label: 'Sin formato' },
          { value: 'Markdown', label: 'Markdown' },
          { value: 'HTML', label: 'HTML' },
        ],
        description: 'Formato del mensaje',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.botToken || params.botToken.trim() === '') {
        return 'Bot Token es requerido';
      }
      if (!params.chatId || params.chatId.trim() === '') {
        return 'Chat ID es requerido';
      }
      if (!params.message || params.message.trim() === '') {
        return 'Message es requerido';
      }
      return null;
    },
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