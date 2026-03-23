import { fetchNodeSchemas } from '../../../api/NodeTypes/nodeTypes.api';

export type NodeParameterType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'select'
  | 'textarea'
  | 'json'
  | 'http-method'
  | 'http-headers'
  | 'key-value'
  | 'password';

export interface NodeParameterSchema {
  name: string;
  key: string;
  type: NodeParameterType;
  required?: boolean;
  defaultValue?: any;
  placeholder?: string;
  description?: string;
  options?: string[] | Array<{ value: string; label: string }>;
  validation?: (value: any) => string | null;
  advanced?: boolean; // If true, only show in advanced mode
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
    description: 'Starts the flow manually. Optional CSV input is available in Advanced mode.',
    category: 'triggers',
    parameters: [
      {
        name: 'CSV Content',
        key: 'csvContent',
        type: 'textarea',
        required: false,
        advanced: true,
        placeholder: 'Upload an Excel/CSV file or paste CSV data here...',
        description: 'Optional CSV data to feed into a CSV Parser node. You can upload an .xls/.xlsx/.csv file from the editor or paste CSV text manually.',
      },
    ],
  },

  'set-data': {
    type: 'set-data',
    displayName: 'Set Data',
    description: 'Defines static data or variables',
    category: 'data',
    parameters: [
      {
        name: 'Values',
        key: 'values',
        type: 'key-value',
        required: true,
        description: 'Key-value pairs to be set in the output',
        defaultValue: {},
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.values || typeof params.values !== 'object') {
        return 'The "values" parameter must be an object';
      }
      if (Object.keys(params.values).length === 0) {
        return 'You must define at least one value';
      }
      return null;
    },
  },

  'http-request': {
    type: 'http-request',
    displayName: 'HTTP Request',
    description: 'Makes HTTP requests to external APIs with automatic retry',
    category: 'actions',
    parameters: [
      {
        name: 'URL',
        key: 'url',
        type: 'string',
        required: true,
        placeholder: 'https://api.example.com/users/{{userId}}',
        description: 'Endpoint URL. Use {{variable}} to interpolate values',
        advanced: false, // BASIC
      },
      {
        name: 'Method',
        key: 'method',
        type: 'select',
        required: true,
        defaultValue: 'GET',
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        description: 'HTTP method',
        advanced: false, // BASIC
      },
      {
        name: 'Headers',
        key: 'headers',
        type: 'key-value',
        required: false,
        defaultValue: {},
        description: 'HTTP headers (Authorization, Content-Type, etc)',
        advanced: true, // ADVANCED
      },
      {
        name: 'Body',
        key: 'body',
        type: 'json',
        required: false,
        defaultValue: {},
        placeholder: '{\n  "email": "{{email}}",\n  "name": "{{name}}"\n}',
        description: 'JSON body for POST/PUT/PATCH',
        advanced: true, // ADVANCED
      },
      {
        name: 'Timeout (ms)',
        key: 'timeout',
        type: 'number',
        required: false,
        defaultValue: 30000,
        description: 'Request timeout in milliseconds',
        advanced: true, // ADVANCED
      },
      {
        name: 'Max Retries',
        key: 'maxRetries',
        type: 'number',
        required: false,
        defaultValue: 0,
        placeholder: '0',
        description: 'Number of retries on failure (0 = no retry, max: 10)',
      },
      {
        name: 'Retry Delay (ms)',
        key: 'retryDelay',
        type: 'number',
        required: false,
        defaultValue: 1000,
        placeholder: '1000',
        description: 'Initial delay between retries in ms (increases exponentially)',
      },
      {
        name: 'Backoff Multiplier',
        key: 'backoffMultiplier',
        type: 'number',
        required: false,
        defaultValue: 2.0,
        placeholder: '2.0',
        description: 'Multiplier for exponential backoff (1.0 = constant, 2.0 = doubles each time)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.url) return 'URL is required';
      if (!params.method) return 'HTTP method is required';
      
      if (params.body && typeof params.body === 'string') {
        try {
          JSON.parse(params.body);
        } catch {
          return 'Body must be valid JSON';
        }
      }

      if (params.maxRetries && (params.maxRetries < 0 || params.maxRetries > 10)) {
        return 'Max Retries must be between 0 and 10';
      }

      if (params.retryDelay && params.retryDelay < 100) {
        return 'Retry Delay must be at least 100ms';
      }

      if (params.backoffMultiplier && (params.backoffMultiplier < 1.0 || params.backoffMultiplier > 5.0)) {
        return 'Backoff Multiplier must be between 1.0 and 5.0';
      }

      return null;
    },
  },

  'log': {
    type: 'log',
    displayName: 'Log',
    description: 'Logs information to the console',
    category: 'utils',
    parameters: [
      {
        name: 'Message',
        key: 'message',
        type: 'string',
        required: true,
        placeholder: 'Message to log...',
        description: 'Message to display in the log',
      },
      {
        name: 'Level',
        key: 'level',
        type: 'select',
        required: false,
        defaultValue: 'info',
        options: ['debug', 'info', 'warn', 'error'],
        description: 'Log level',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.message || params.message.trim() === '') {
        return 'Message is required';
      }
      return null;
    },
  },

  'if-condition': {
    type: 'if-condition',
    displayName: 'If Condition',
    description: 'Executes branches based on a condition',
    category: 'logic',
    parameters: [
      {
        name: 'Field',
        key: 'field',
        type: 'string',
        required: true,
        placeholder: 'data.status',
        description: 'Field to evaluate (use dot notation)',
      },
      {
        name: 'Operator',
        key: 'operator',
        type: 'select',
        required: true,
        defaultValue: '==',
        options: ['==', '!=', '>', '<', '>=', '<=', 'contains', 'exists'],
        description: 'Comparison operator',
      },
      {
        name: 'Value',
        key: 'value',
        type: 'string',
        required: false,
        placeholder: 'Value to compare',
        description: 'Value to compare with',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.field) return 'Field is required';
      if (!params.operator) return 'Operator is required';
      if (params.operator !== 'exists' && !params.value) {
        return 'Value is required for this operator';
      }
      return null;
    },
  },

  'switch': {
    type: 'switch',
    displayName: 'Switch',
    description: 'Multi-path routing based on value',
    category: 'logic',
    parameters: [
      {
        name: 'Input Value',
        key: 'inputValue',
        type: 'json',
        required: true,
        placeholder: '{{ $json.status }}',
        description: 'Value to evaluate against cases',
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
        description: 'Array of cases {value, output}',
      },
      {
        name: 'Mode',
        key: 'mode',
        type: 'select',
        required: true,
        defaultValue: 'equals',
        options: ['equals', 'contains'],
        description: 'Comparison mode',
      },
      {
        name: 'Default Case',
        key: 'defaultCase',
        type: 'string',
        required: false,
        placeholder: 'default',
        description: 'Default output if no match',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputValue) return 'Input Value is required';
      if (!params.cases || !Array.isArray(params.cases)) {
        return 'Cases must be an array';
      }
      if (params.cases.length === 0) {
        return 'Must define at least one case';
      }
      for (const c of params.cases) {
        if (!c.value || !c.output) {
          return 'Each case must have value and output';
        }
      }
      return null;
    },
  },

  'error-handler': {
    type: 'error-handler',
    displayName: 'Error Handler',
    description: 'Error handling with retries and fallback',
    category: 'logic',
    parameters: [
      {
        name: 'Input Data',
        key: 'inputData',
        type: 'json',
        required: true,
        placeholder: '{{ $json }}',
        description: 'Data to check for errors',
      },
      {
        name: 'Max Retries',
        key: 'maxRetries',
        type: 'number',
        required: false,
        defaultValue: 3,
        description: 'Maximum number of retries',
      },
      {
        name: 'Retry Delay (ms)',
        key: 'retryDelay',
        type: 'number',
        required: false,
        defaultValue: 1000,
        description: 'Time between retries in milliseconds',
      },
      {
        name: 'Fallback Mode',
        key: 'fallbackMode',
        type: 'select',
        required: true,
        defaultValue: 'ignore',
        options: ['ignore', 'default', 'stop'],
        description: 'Strategy when retries are exhausted',
      },
      {
        name: 'Default Value',
        key: 'defaultValue',
        type: 'json',
        required: false,
        placeholder: '{}',
        description: 'Default value (fallbackMode=default)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputData) return 'Input Data is required';
      if (!params.fallbackMode) return 'Fallback Mode is required';
      if (params.fallbackMode === 'default' && !params.defaultValue) {
        return 'Default Value is required when fallbackMode=default';
      }
      if (params.maxRetries && params.maxRetries < 0) {
        return 'Max Retries must be >= 0';
      }
      if (params.retryDelay && params.retryDelay < 0) {
        return 'Retry Delay must be >= 0';
      }
      return null;
    },
  },

  'stop': {
    type: 'stop',
    displayName: 'Stop',
    description: 'Stops the flow conditionally',
    category: 'logic',
    parameters: [
      {
        name: 'Condition',
        key: 'condition',
        type: 'select',
        required: true,
        defaultValue: 'always',
        options: ['always', 'if-true', 'if-false', 'if-error'],
        description: 'Condition to stop the flow',
      },
      {
        name: 'Input Value',
        key: 'inputValue',
        type: 'json',
        required: false,
        placeholder: '{{ $json }}',
        description: 'Value to evaluate (except always/if-error)',
      },
      {
        name: 'Stop Message',
        key: 'stopMessage',
        type: 'string',
        required: false,
        placeholder: 'Workflow stopped',
        description: 'Message when stopping',
      },
      {
        name: 'Stop Code',
        key: 'stopCode',
        type: 'select',
        required: true,
        defaultValue: 'success',
        options: ['success', 'error'],
        description: 'Exit code',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.condition) return 'Condition is required';
      if ((params.condition === 'if-true' || params.condition === 'if-false') && !params.inputValue) {
        return 'Input Value is required for if-true/if-false';
      }
      if (!params.stopCode) return 'Stop Code is required';
      return null;
    },
  },

  'transform-data': {
    type: 'transform-data',
    displayName: 'Transform Data',
    description: 'Extracts, renames, and transforms data fields',
    category: 'data',
    parameters: [
      {
        name: 'Transformations',
        key: 'transformations',
        type: 'json',
        required: true,
        description: 'Array of transformations to apply',
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
        return 'Transformations must be an array';
      }
      if (params.transformations.length === 0) {
        return 'You must define at least one transformation';
      }
      // Validate each transformation
      for (const t of params.transformations) {
        if (!t.source || !t.target || !t.operation) {
          return 'Each transformation must have source, target, and operation';
        }
        const validOps = ['extract', 'rename', 'default', 'calculate', 'concat'];
        if (!validOps.includes(t.operation)) {
          return `Invalid operation: ${t.operation}. Must be one of: ${validOps.join(', ')}`;
        }
      }
      return null;
    },
  },

  'loop': {
    type: 'loop',
    displayName: 'Loop/ForEach',
    description: 'Iterates over an array and applies operations',
    category: 'control',
    parameters: [
      {
        name: 'Array Source',
        key: 'arraySource',
        type: 'string',
        required: true,
        placeholder: 'body.users',
        description: 'Path to the array in context (e.g., body.users, items)',
      },
      {
        name: 'Operation',
        key: 'operation',
        type: 'select',
        required: true,
        defaultValue: 'forEach',
        options: ['forEach', 'map', 'filter'],
        description: 'Type of operation to perform',
      },
      {
        name: 'Map Expression',
        key: 'mapExpression',
        type: 'string',
        required: false,
        placeholder: '{{item.name}}',
        description: 'For "map": expression to apply to each item (use {{item}} and {{index}})',
      },
      {
        name: 'Filter Expression',
        key: 'filterExpr',
        type: 'string',
        required: false,
        placeholder: '{{item.age}} > 18',
        description: 'For "filter": condition that each item must meet',
      },
      {
        name: 'Item Variable',
        key: 'itemVariable',
        type: 'string',
        required: false,
        defaultValue: 'item',
        placeholder: 'item',
        description: 'Variable name for each item (default: item)',
      },
      {
        name: 'Index Variable',
        key: 'indexVariable',
        type: 'string',
        required: false,
        defaultValue: 'index',
        placeholder: 'index',
        description: 'Variable name for the index (default: index)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.arraySource || params.arraySource.trim() === '') {
        return 'Array source is required';
      }
      if (params.operation === 'map' && (!params.mapExpression || params.mapExpression.trim() === '')) {
        return 'Map expression is required for "map" operation';
      }
      if (params.operation === 'filter' && (!params.filterExpr || params.filterExpr.trim() === '')) {
        return 'Filter expression is required for "filter" operation';
      }
      return null;
    },
  },

  'delay': {
    type: 'delay',
    displayName: 'Delay/Wait',
    description: 'Pauses execution for a specified time',
    category: 'control',
    parameters: [
      {
        name: 'Duration (ms)',
        key: 'duration',
        type: 'number',
        required: true,
        defaultValue: 1000,
        placeholder: '1000',
        description: 'Wait time in milliseconds (min: 100ms, max: 300000ms = 5min)',
      },
      {
        name: 'Reason',
        key: 'reason',
        type: 'string',
        required: false,
        placeholder: 'Wait for API rate limit reset',
        description: 'Optional description of delay reason (for logging)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.duration || params.duration <= 0) {
        return 'Duration must be greater than 0ms';
      }
      if (params.duration > 300000) {
        return 'Maximum duration is 300000ms (5 minutes)';
      }
      if (params.duration < 100) {
        return 'Minimum duration is 100ms';
      }
      return null;
    },
  },

  'json-parser': {
    type: 'json-parser',
    displayName: 'JSON Parser',
    description: 'Parses JSON text to object',
    category: 'data',
    parameters: [
      {
        name: 'JSON String',
        key: 'jsonString',
        type: 'textarea',
        required: true,
        placeholder: '{"key": "value"}',
        description: 'JSON string to parse',
      },
      {
        name: 'Extract Path',
        key: 'extractPath',
        type: 'string',
        required: false,
        placeholder: 'data.items[0]',
        description: 'Specific path to extract (optional)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.jsonString) return 'JSON string is required';
      try {
        JSON.parse(params.jsonString);
        return null;
      } catch {
        return 'Invalid JSON';
      }
    },
  },

  'webhook-trigger': {
    type: 'webhook-trigger',
    displayName: 'Webhook Trigger',
    description: 'Receives external HTTP requests to start the flow',
    category: 'triggers',
    parameters: [
      {
        name: 'Validation Enabled',
        key: 'validationEnabled',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Enable webhook signature validation',
      },
      {
        name: 'Secret',
        key: 'secret',
        type: 'string',
        required: false,
        placeholder: 'webhook-secret-key',
        description: 'Secret for webhook signature validation (optional)',
      },
    ],
  },

  'telegram-trigger': {
    type: 'telegram-trigger',
    displayName: 'Telegram Trigger',
    description: 'Starts the flow when your Telegram bot receives a message or file',
    category: 'triggers',
    parameters: [],
  },

  'cron-trigger': {
    type: 'cron-trigger',
    displayName: 'Cron Trigger',
    description: 'Automatically starts the flow on a fixed time interval',
    category: 'triggers',
    parameters: [
      {
        name: 'Interval (minutes)',
        key: 'intervalMinutes',
        type: 'number',
        required: true,
        defaultValue: 60,
        placeholder: '60',
        description: 'How often this flow should run (in minutes). Minimum: 1.',
      },
    ],
  },

  // Single AI node powered by Groq (backed by the 'groq' node type).

  'groq': {
    type: 'groq',
    displayName: 'AI',
    description: 'Single AI node powered by Groq LLMs (OpenAI-compatible)',
    category: 'ai',
    parameters: [
      {
        name: 'Prompt',
        key: 'prompt',
        type: 'textarea',
        required: true,
        placeholder: 'Write your prompt here... Use {{variable}} to interpolate values',
        description: 'The prompt or question for the AI model',
        advanced: false, // BASIC
      },
      {
        name: 'API Key',
        key: 'apiKey',
        type: 'string',
        required: false,
        placeholder: 'sk-... (optional, uses GROQ_API_KEY from the server if empty)',
        description: 'Optional per-node API Key. If empty, the server will use GROQ_API_KEY environment variable if available.',
        advanced: false, // BASIC
      },
      {
        name: 'Model',
        key: 'model',
        type: 'select',
        required: false,
        defaultValue: 'llama-3.3-70b-versatile',
        options: [
          'llama-3.3-70b-versatile',
          'llama-3.1-70b-versatile',
          'llama-3.1-8b-instant',
          'llama-3.2-1b-preview',
        ],
        description: 'Groq model to use (OpenAI-compatible)',
        advanced: true, // ADVANCED
      },
      {
        name: 'Temperature',
        key: 'temperature',
        type: 'number',
        required: false,
        defaultValue: 0.7,
        placeholder: '0.7',
        description: 'Response creativity (0 = deterministic, 2 = very creative)',
        advanced: true, // ADVANCED
      },
      {
        name: 'Max Tokens',
        key: 'maxTokens',
        type: 'number',
        required: false,
        defaultValue: 1024,
        placeholder: '1024',
        description: 'Maximum number of tokens in response (1-16384)',
        advanced: true, // ADVANCED
      },
      {
        name: 'System Prompt',
        key: 'systemPrompt',
        type: 'textarea',
        required: false,
        placeholder: 'You are a helpful assistant...',
        description: 'System instructions to define model behavior (optional)',
        advanced: true, // ADVANCED
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.prompt || params.prompt.trim() === '') {
        return 'Prompt is required';
      }
      if (params.temperature !== undefined && (params.temperature < 0 || params.temperature > 2)) {
        return 'Temperature must be between 0 and 2';
      }
      if (params.maxTokens !== undefined && (params.maxTokens < 1 || params.maxTokens > 16384)) {
        return 'Max Tokens must be between 1 and 16384';
      }
      return null;
    },
  },

  'filter': {
    type: 'filter',
    displayName: 'Filter',
    description: 'Filters arrays based on specific conditions',
    category: 'data',
    parameters: [
      {
        name: 'Input Data',
        key: 'inputData',
        type: 'json',
        required: true,
        placeholder: '[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]',
        description: 'Data array to filter',
      },
      {
        name: 'Mode',
        key: 'mode',
        type: 'select',
        required: true,
        defaultValue: 'keep',
        options: ['keep', 'remove'],
        description: 'Keep or remove matching elements',
      },
      {
        name: 'Field',
        key: 'field',
        type: 'string',
        required: false,
        placeholder: 'age',
        description: 'Field to evaluate (leave empty to evaluate the entire element)',
      },
      {
        name: 'Operator',
        key: 'operator',
        type: 'select',
        required: true,
        defaultValue: 'equals',
        options: ['equals', 'notEquals', 'contains', 'startsWith', 'endsWith', 'greaterThan', 'lessThan', 'greaterOrEqual', 'lessOrEqual', 'isEmpty', 'isNotEmpty'],
        description: 'Comparison operator',
      },
      {
        name: 'Value',
        key: 'value',
        type: 'string',
        required: false,
        placeholder: '25',
        description: 'Value to compare with',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputData) {
        return 'Input Data is required';
      }
      if (!params.operator) {
        return 'Operator is required';
      }
      return null;
    },
  },

  'split': {
    type: 'split',
    displayName: 'Split',
    description: 'Splits arrays into individual items or batches',
    category: 'data',
    parameters: [
      {
        name: 'Input Data',
        key: 'inputData',
        type: 'json',
        required: true,
        placeholder: '[1, 2, 3, 4, 5]',
        description: 'Data array to split',
      },
      {
        name: 'Mode',
        key: 'mode',
        type: 'select',
        required: true,
        defaultValue: 'items',
        options: ['items', 'batches', 'field'],
        description: 'Split type: items (individual), batches (batches), field (extract field)',
      },
      {
        name: 'Batch Size',
        key: 'batchSize',
        type: 'number',
        required: false,
        defaultValue: 1,
        placeholder: '1',
        description: 'Size of each batch (only for mode=batches)',
      },
      {
        name: 'Field',
        key: 'field',
        type: 'string',
        required: false,
        placeholder: 'id',
        description: 'Field to extract from each element (only for mode=field)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputData) {
        return 'Input Data is required';
      }
      if (!params.mode) {
        return 'Mode is required';
      }
      if (params.mode === 'batches' && (!params.batchSize || params.batchSize < 1)) {
        return 'Batch Size must be at least 1 for mode=batches';
      }
      if (params.mode === 'field' && !params.field) {
        return 'Field is required for mode=field';
      }
      return null;
    },
  },

  'merge': {
    type: 'merge',
    displayName: 'Merge',
    description: 'Combines multiple inputs into a unified output',
    category: 'data',
    parameters: [
      {
        name: 'Input 1',
        key: 'input1',
        type: 'json',
        required: true,
        placeholder: '[1, 2, 3]',
        description: 'First input to combine',
      },
      {
        name: 'Input 2',
        key: 'input2',
        type: 'json',
        required: true,
        placeholder: '[4, 5, 6]',
        description: 'Second input to combine',
      },
      {
        name: 'Mode',
        key: 'mode',
        type: 'select',
        required: true,
        defaultValue: 'append',
        options: ['append', 'combine', 'merge'],
        description: 'Combination type: append (join arrays), combine (object with inputs), merge (merge objects)',
      },
      {
        name: 'Input 3',
        key: 'input3',
        type: 'json',
        required: false,
        placeholder: '[7, 8, 9]',
        description: 'Third input (optional)',
      },
      {
        name: 'Input 4',
        key: 'input4',
        type: 'json',
        required: false,
        placeholder: '[10, 11, 12]',
        description: 'Fourth input (optional)',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.input1) {
        return 'Input 1 is required';
      }
      if (!params.input2) {
        return 'Input 2 is required';
      }
      if (!params.mode) {
        return 'Mode is required';
      }
      return null;
    },
  },

  'function': {
    type: 'function',
    displayName: 'Function',
    description: 'Executes custom JavaScript code for complex transformations',
    category: 'data',
    parameters: [
      {
        name: 'Input Data',
        key: 'inputData',
        type: 'json',
        required: false,
        placeholder: '{"key": "value"}',
        description: 'Input data (accessible as "input" in the code)',
      },
      {
        name: 'JavaScript Code',
        key: 'code',
        type: 'textarea',
        required: true,
        defaultValue: 'return input;',
        placeholder: '// Transform the data\nreturn input.map(x => x * 2);',
        description: 'JavaScript code. Use "input" for input data, "context" for flow context. Must return a value.',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.code || params.code.trim() === '') {
        return 'JavaScript code is required';
      }
      return null;
    },
  },

  'sort': {
    type: 'sort',
    displayName: 'Sort',
    description: 'Sorts arrays by field or value (ascending/descending)',
    category: 'data',
    parameters: [
      {
        name: 'Input Array',
        key: 'inputData',
        type: 'json',
        required: true,
        placeholder: '[{"name":"Ana","age":25},{"name":"Bob","age":30}]',
        description: 'Array to sort',
      },
      {
        name: 'Field',
        key: 'field',
        type: 'string',
        required: false,
        placeholder: 'age',
        description: 'Field to sort by (optional for primitive arrays)',
      },
      {
        name: 'Order',
        key: 'order',
        type: 'select',
        required: true,
        options: [
          { value: 'asc', label: 'Ascending' },
          { value: 'desc', label: 'Descending' },
        ],
        defaultValue: 'asc',
        description: 'Sort order',
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
        description: 'Data type for comparison',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputData) {
        return 'Input Array is required';
      }
      if (!params.order) {
        return 'Order is required';
      }
      return null;
    },
  },

  'csv-parser': {
    type: 'csv-parser',
    displayName: 'CSV Parser',
    description: 'Converts between CSV and JSON (parse/stringify)',
    category: 'data',
    parameters: [
      {
        name: 'Input Data',
        key: 'inputData',
        type: 'textarea',
        required: true,
        placeholder: 'name,age\nAna,25\nBob,30',
        description: 'CSV string (parse mode) or JSON array (stringify mode)',
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
        description: 'Conversion mode',
      },
      {
        name: 'Delimiter',
        key: 'delimiter',
        type: 'string',
        required: false,
        defaultValue: ',',
        placeholder: ',',
        description: 'Column delimiter (default: comma)',
      },
      {
        name: 'Has Header',
        key: 'hasHeader',
        type: 'boolean',
        required: false,
        defaultValue: true,
        description: 'First row contains column names',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.inputData) {
        return 'Input Data is required';
      }
      if (!params.mode) {
        return 'Mode is required';
      }
      return null;
    },
  },

  'regex-extract': {
    type: 'regex-extract',
    displayName: 'Regex Extract',
    description: 'Extracts data using regular expressions',
    category: 'data',
    parameters: [
      {
        name: 'Input Text',
        key: 'inputData',
        type: 'textarea',
        required: true,
        placeholder: 'Email: test@example.com, Phone: 555-1234',
        description: 'Text to search for matches',
      },
      {
        name: 'Pattern',
        key: 'pattern',
        type: 'string',
        required: true,
        placeholder: '\\d{3}-\\d{4}',
        description: 'Regular expression (without delimiters)',
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
        description: 'Extraction mode',
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
        return 'Input Text is required';
      }
      if (!params.pattern || params.pattern.trim() === '') {
        return 'Pattern is required';
      }
      return null;
    },
  },

  'email': {
    type: 'email',
    displayName: 'Email',
    description: 'Simple email node (SendGrid API by default)',
    category: 'integration',
    parameters: [
      {
        name: 'Provider',
        key: 'provider',
        type: 'select',
        required: false,
        defaultValue: 'sendgrid-api',
        options: [
          { value: 'sendgrid-api', label: 'SendGrid API' },
          { value: 'smtp', label: 'SMTP (advanced)' },
        ],
        description: 'Delivery provider. Use SendGrid API for simple setup.',
      },
      {
        name: 'To',
        key: 'to',
        type: 'string',
        required: true,
        placeholder: 'recipient@example.com',
        description: 'Recipient(s) - separate multiple with comma',
      },
      {
        name: 'Subject',
        key: 'subject',
        type: 'string',
        required: true,
        placeholder: 'Email subject',
        description: 'Message subject',
      },
      {
        name: 'Body',
        key: 'body',
        type: 'textarea',
        required: true,
        placeholder: 'Message content...',
        description: 'Email body in plain text',
      },
      {
        name: 'From',
        key: 'from',
        type: 'string',
        required: false,
        placeholder: 'sender@example.com (optional if SENDGRID_SENDER_EMAIL is configured)',
        description: 'Sender address. Optional in SendGrid mode if env sender is configured.',
      },
      {
        name: 'From Name',
        key: 'fromName',
        type: 'string',
        required: false,
        placeholder: 'CapyFlow Demo',
        description: 'Optional sender display name',
      },
      {
        name: 'SendGrid API Token',
        key: 'sendgridApiToken',
        type: 'password',
        required: false,
        placeholder: 'Paste token here or use SENDGRID_API_KEY env var',
        description: 'Required only when provider = sendgrid-api (unless configured in backend env)',
        advanced: true,
      },
      {
        name: 'SendGrid Data Residency',
        key: 'sendgridDataResidency',
        type: 'select',
        required: false,
        defaultValue: '',
        options: [
          { value: '', label: 'Global (default)' },
          { value: 'eu', label: 'EU' },
        ],
        description: 'Set to EU only when using an EU-pinned SendGrid subuser.',
        advanced: true,
      },
      {
        name: 'SMTP Host',
        key: 'smtpHost',
        type: 'string',
        required: false,
        placeholder: 'smtp.gmail.com',
        description: 'SMTP server (required only when provider = smtp)',
        advanced: true,
      },
      {
        name: 'SMTP Port',
        key: 'smtpPort',
        type: 'number',
        required: false,
        defaultValue: 587,
        description: 'SMTP port (587 for TLS, 465 for SSL)',
        advanced: true,
      },
      {
        name: 'SMTP User',
        key: 'smtpUser',
        type: 'string',
        required: false,
        placeholder: 'user@example.com',
        description: 'User for SMTP authentication (provider = smtp)',
        advanced: true,
      },
      {
        name: 'SMTP Password',
        key: 'smtpPassword',
        type: 'password',
        required: false,
        placeholder: '••••••••',
        description: 'SMTP password (provider = smtp)',
        advanced: true,
      },
      {
        name: 'CC',
        key: 'cc',
        type: 'string',
        required: false,
        placeholder: 'cc@example.com',
        description: 'Copy (CC) - separate multiple with comma',
      },
      {
        name: 'BCC',
        key: 'bcc',
        type: 'string',
        required: false,
        placeholder: 'bcc@example.com',
        description: 'Blind copy (BCC) - separate multiple with comma',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.to || params.to.trim() === '') {
        return 'To is required';
      }
      if (!params.subject || params.subject.trim() === '') {
        return 'Subject is required';
      }
      if (!params.body || params.body.trim() === '') {
        return 'Body is required';
      }
      const provider = (params.provider || 'sendgrid-api').toString().trim().toLowerCase();
      if (provider === 'smtp') {
        if (!params.from || params.from.trim() === '') {
          return 'From is required when provider is SMTP';
        }
        if (!params.smtpHost || params.smtpHost.trim() === '') {
          return 'SMTP Host is required when provider is SMTP';
        }
        if (!params.smtpUser || params.smtpUser.trim() === '') {
          return 'SMTP User is required when provider is SMTP';
        }
        if (!params.smtpPassword || params.smtpPassword.trim() === '') {
          return 'SMTP Password is required when provider is SMTP';
        }
      }

      if (provider === 'sendgrid-api') {
        // In SendGrid mode, `from` can come from SENDGRID_SENDER_EMAIL env var.
        // Token can come from node params or backend env var SENDGRID_API_KEY.
        // We do not force it in UI to allow secure server-side configuration.
      }

      return null;
    },
  },

  'telegram': {
    type: 'telegram',
    displayName: 'Telegram',
    description: 'Sends messages via Telegram Bot API',
    category: 'integration',
    parameters: [
      {
        name: 'Chat ID',
        key: 'chatId',
        type: 'string',
        required: false,
        placeholder: '123456789 (leave empty to use default chat)',
        description: 'Chat or channel ID (optional if a default chat is configured)',
      },
      {
        name: 'Message',
        key: 'message',
        type: 'textarea',
        required: true,
        placeholder: 'Your message here...',
        description: 'Message to send',
      },
      {
        name: 'Parse Mode',
        key: 'parseMode',
        type: 'select',
        required: false,
        defaultValue: '',
        options: [
          { value: '', label: 'Plain text' },
          { value: 'Markdown', label: 'Markdown' },
          { value: 'HTML', label: 'HTML' },
        ],
        description: 'Message format',
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.message || params.message.trim() === '') {
        return 'Message is required';
      }
      return null;
    },
  },

  'database': {
    type: 'database',
    displayName: 'Database',
    description: 'Execute SQL queries on PostgreSQL, MySQL, or SQLite databases',
    category: 'integration',
    parameters: [
      {
        name: 'Driver',
        key: 'driver',
        type: 'select',
        required: true,
        defaultValue: 'postgres',
        options: ['postgres', 'mysql', 'sqlite3'],
        description: 'Database driver to use',
        advanced: false, // BASIC
      },
      {
        name: 'Connection URL',
        key: 'connectionUrl',
        type: 'string',
        required: true,
        placeholder: 'postgres://user:pass@localhost:5432/dbname?sslmode=disable',
        description: 'Database connection URL/DSN',
        advanced: false, // BASIC
      },
      {
        name: 'Query',
        key: 'query',
        type: 'textarea',
        required: true,
        placeholder: 'SELECT * FROM users WHERE id = {{userId}}',
        description: 'SQL query to execute (use {{variable}} for interpolation)',
        advanced: false, // BASIC
      },
      {
        name: 'Timeout (ms)',
        key: 'timeout',
        type: 'number',
        required: false,
        defaultValue: 30000,
        placeholder: '30000',
        description: 'Query timeout in milliseconds',
        advanced: true, // ADVANCED
      },
      {
        name: 'Max Retries',
        key: 'maxRetries',
        type: 'number',
        required: false,
        defaultValue: 0,
        placeholder: '0',
        description: 'Maximum number of retries on failure',
        advanced: true, // ADVANCED
      },
      {
        name: 'Retry Delay (ms)',
        key: 'retryDelay',
        type: 'number',
        required: false,
        defaultValue: 1000,
        placeholder: '1000',
        description: 'Delay between retries in milliseconds',
        advanced: true, // ADVANCED
      },
      {
        name: 'Query Parameters',
        key: 'queryParams',
        type: 'key-value',
        required: false,
        defaultValue: {},
        description: 'Named parameters for parameterized queries',
        advanced: true, // ADVANCED
      },
      {
        name: 'Return Metadata',
        key: 'returnMetadata',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Include query metadata in response',
        advanced: true, // ADVANCED
      },
    ],
    validateBeforeExecute: (params) => {
      if (!params.driver) {
        return 'Driver is required';
      }
      if (!params.connectionUrl || params.connectionUrl.trim() === '') {
        return 'Connection URL is required';
      }
      if (!params.query || params.query.trim() === '') {
        return 'Query is required';
      }
      return null;
    },
  },
};

let runtimeNodeSchemas: Record<string, NodeTypeSchema> = NODE_SCHEMAS;

let backendSchemasLoaded = false;

export function getNodeSchema(nodeType: string): NodeTypeSchema | null {
  return runtimeNodeSchemas[nodeType] || null;
}

export function validateNodeParameters(
  nodeType: string,
  parameters: Record<string, any>
): string | null {
  const schema = getNodeSchema(nodeType);
  if (!schema) return `Unknown node type: ${nodeType}`;

  for (const param of schema.parameters) {
    if (param.required && (parameters[param.key] === undefined || parameters[param.key] === null || parameters[param.key] === '')) {
      return `The parameter "${param.name}" is required`;
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

/**
 * Filters parameters by mode (basic or advanced)
 */
export function getFilteredParameters(
  nodeType: string,
  mode: 'basic' | 'advanced'
): NodeParameterSchema[] {
  const schema = getNodeSchema(nodeType);
  if (!schema) return [];

  if (mode === 'basic') {
    // Only return non-advanced parameters
    return schema.parameters.filter(param => !param.advanced);
  }

  // Advanced mode: return all
  return schema.parameters;
}

/**
 * Counts how many advanced parameters a node has
 */
export function countAdvancedParameters(nodeType: string): number {
  const schema = getNodeSchema(nodeType);
  if (!schema) return 0;

  return schema.parameters.filter(param => param.advanced === true).length;
}

/**
 * Checks if a node has advanced parameters
 */
export function hasAdvancedParameters(nodeType: string): boolean {
  return countAdvancedParameters(nodeType) > 0;
}

function toNodeParameterType(rawType: string): NodeParameterType {
  switch ((rawType || '').toLowerCase()) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'json';
    case 'object':
      return 'key-value';
    default:
      return 'string';
  }
}

function toLabelFromKey(key: string): string {
  if (!key) return key;
  const withSpaces = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function mergeSchemasWithBackend(
  localSchemas: Record<string, NodeTypeSchema>,
  backendSchemas: Record<string, any>
): Record<string, NodeTypeSchema> {
  const merged: Record<string, NodeTypeSchema> = {};

  for (const [nodeType, localSchema] of Object.entries(localSchemas)) {
    const backendSchema = backendSchemas[nodeType];
    const localParameters = localSchema.parameters || [];

    if (!backendSchema) {
      merged[nodeType] = localSchema;
      continue;
    }

    const backendParams: Record<string, any> = backendSchema.parameters || {};
    const localParamsByKey = new Map(localParameters.map((p) => [p.key, p]));

    const updatedParams: NodeParameterSchema[] = localParameters.map((param) => {
      const backendParam = backendParams[param.key];
      if (!backendParam) return param;

      const options = Array.isArray(backendParam.enum)
        ? backendParam.enum.map((value: unknown) => String(value))
        : param.options;

      return {
        ...param,
        required: backendParam.required ?? param.required,
        defaultValue: backendParam.default ?? param.defaultValue,
        description: backendParam.description || param.description,
        advanced: backendParam.advanced ?? param.advanced,
        options,
      };
    });

    for (const [key, backendParam] of Object.entries<any>(backendParams)) {
      if (localParamsByKey.has(key)) continue;

      const options = Array.isArray(backendParam.enum)
        ? backendParam.enum.map((value: unknown) => String(value))
        : undefined;

      updatedParams.push({
        name: toLabelFromKey(key),
        key,
        type: toNodeParameterType(backendParam.type),
        required: backendParam.required,
        defaultValue: backendParam.default,
        description: backendParam.description,
        advanced: backendParam.advanced,
        options,
      });
    }

    merged[nodeType] = {
      ...localSchema,
      parameters: updatedParams,
    };
  }

  for (const [nodeType, backendSchema] of Object.entries<any>(backendSchemas)) {
    if (merged[nodeType]) continue;

    const backendParams: Record<string, any> = backendSchema?.parameters || {};
    const requiredSet = new Set<string>(Array.isArray(backendSchema?.required) ? backendSchema.required : []);

    const generatedParams: NodeParameterSchema[] = Object.entries<any>(backendParams).map(([key, backendParam]) => {
      const options = Array.isArray(backendParam?.enum)
        ? backendParam.enum.map((value: unknown) => String(value))
        : undefined;

      return {
        name: toLabelFromKey(key),
        key,
        type: toNodeParameterType(backendParam?.type),
        required: backendParam?.required ?? requiredSet.has(key),
        defaultValue: backendParam?.default,
        description: backendParam?.description,
        advanced: backendParam?.advanced,
        options,
      };
    });

    merged[nodeType] = {
      type: nodeType,
      displayName: toLabelFromKey(nodeType),
      category: 'data',
      description: `Auto-synced backend node type: ${nodeType}`,
      parameters: generatedParams,
    };
  }

  return merged;
}

export async function syncNodeSchemasFromBackend(
  mode: 'basic' | 'advanced' = 'advanced'
): Promise<boolean> {
  try {
    const backendSchemas = await fetchNodeSchemas(mode);
    runtimeNodeSchemas = mergeSchemasWithBackend(NODE_SCHEMAS, backendSchemas);
    backendSchemasLoaded = true;
    return true;
  } catch {
    if (!backendSchemasLoaded) {
      runtimeNodeSchemas = NODE_SCHEMAS;
    }
    return false;
  }
}