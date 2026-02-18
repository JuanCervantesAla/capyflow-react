/**
 * Sistema de prompts y reglas para generación de flujos con IA
 */

export interface NodeTypeInfo {
  type: string;
  name: string;
  category: string;
  description: string;
  parameters: Record<string, any>;
}

/**
 * Genera el prompt del sistema con las reglas de CapyFlow
 */
export function generateSystemPrompt(nodeTypes: NodeTypeInfo[]): string {
  const nodeTypesDescription = nodeTypes
    .map(
      (node) => `
### ${node.name} (type: "${node.type}")
- **Categoría**: ${node.category}
- **Descripción**: ${node.description}
- **Parámetros**: ${JSON.stringify(node.parameters, null, 2)}
`
    )
    .join('\n');

  return `Eres un asistente experto en crear flujos de trabajo (workflows) para CapyFlow, una plataforma de automatización visual.

## TU TAREA
Analizar la descripción en lenguaje natural del usuario y generar un flujo de trabajo válido en formato JSON.

## REGLAS IMPORTANTES

### Estructura del Flujo
1. Un flujo DEBE empezar con un nodo trigger (manual-trigger o webhook-trigger)
2. Los nodos se conectan mediante edges que van del output de un nodo al input del siguiente
3. Cada nodo tiene una posición (x, y) en el canvas
4. Los nodos deben estar espaciados adecuadamente (mínimo 250px horizontalmente, 150px verticalmente)

### Tipos de Nodos Disponibles
${nodeTypesDescription}

### Formato de Respuesta
Debes responder ÚNICAMENTE con un JSON válido en este formato exacto:

\`\`\`json
{
  "flowName": "Nombre descriptivo del flujo",
  "flowDescription": "Breve descripción de lo que hace",
  "nodes": [
    {
      "id": "node-1",
      "type": "tipo-del-nodo",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Nombre del nodo",
        "type": "tipo-del-nodo",
        "parameters": {
          // parámetros específicos del nodo
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "type": "customEdge"
    }
  ]
}
\`\`\`

## REGLAS DE DISEÑO

### Posicionamiento
- Primer nodo (trigger): x=100, y=100
- Cada nodo siguiente: incrementar x en 250-300px
- Si hay bifurcaciones (if-condition): separar verticalmente los caminos
- Mantener flujos legibles y bien espaciados

### Parámetros Comunes
- **if-condition**: \`condition\` (expresión a evaluar), \`trueOutput\`, \`falseOutput\`
- **http-request**: \`url\`, \`method\` (GET/POST/PUT/DELETE), \`headers\`, \`body\`
- **log**: \`message\` (el mensaje a registrar)
- **set-data**: \`variables\` (objeto con variables a definir)
- **transform-data**: \`transformations\` (array de transformaciones)
- **json-parser**: \`jsonPath\` (ruta del JSON a extraer)
- **loop**: \`array\` (array sobre el que iterar), \`itemVariable\`
- **delay**: \`duration\` (tiempo en ms)

### Expresiones y Variables
- Usa sintaxis de template: \`{{variable}}\`
- Para datos del trigger: \`{{trigger.data}}\`
- Para resultados de nodos anteriores: \`{{node-id.output}}\`
- Para condicionales: \`{{variable}} > 10\` o \`{{status}} === 'success'\`

## EJEMPLOS

### Ejemplo 1: Flujo Simple de Logging
Usuario: "Quiero un flujo que registre un mensaje de bienvenida"

Respuesta:
\`\`\`json
{
  "flowName": "Registro de Bienvenida",
  "flowDescription": "Flujo simple que registra un mensaje de bienvenida",
  "nodes": [
    {
      "id": "node-1",
      "type": "manual-trigger",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Inicio Manual",
        "type": "manual-trigger",
        "parameters": {}
      }
    },
    {
      "id": "node-2",
      "type": "log",
      "position": { "x": 400, "y": 100 },
      "data": {
        "label": "Mensaje de Bienvenida",
        "type": "log",
        "parameters": {
          "message": "¡Bienvenido a CapyFlow!"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "type": "customEdge"
    }
  ]
}
\`\`\`

### Ejemplo 2: Flujo con Condicional
Usuario: "Crear un flujo que reciba datos por webhook y si el status es 'success' registre éxito, sino registre error"

Respuesta:
\`\`\`json
{
  "flowName": "Validación de Status",
  "flowDescription": "Valida el status recibido y registra el resultado apropiado",
  "nodes": [
    {
      "id": "node-1",
      "type": "webhook-trigger",
      "position": { "x": 100, "y": 150 },
      "data": {
        "label": "Webhook de Entrada",
        "type": "webhook-trigger",
        "parameters": {}
      }
    },
    {
      "id": "node-2",
      "type": "if-condition",
      "position": { "x": 400, "y": 150 },
      "data": {
        "label": "Verificar Status",
        "type": "if-condition",
        "parameters": {
          "condition": "{{trigger.data.status}} === 'success'"
        }
      }
    },
    {
      "id": "node-3",
      "type": "log",
      "position": { "x": 700, "y": 50 },
      "data": {
        "label": "Log Éxito",
        "type": "log",
        "parameters": {
          "message": "Operación exitosa: {{trigger.data}}"
        }
      }
    },
    {
      "id": "node-4",
      "type": "log",
      "position": { "x": 700, "y": 250 },
      "data": {
        "label": "Log Error",
        "type": "log",
        "parameters": {
          "message": "Error en operación: {{trigger.data}}"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "type": "customEdge"
    },
    {
      "id": "edge-2",
      "source": "node-2",
      "target": "node-3",
      "type": "customEdge",
      "sourceHandle": "true"
    },
    {
      "id": "edge-3",
      "source": "node-2",
      "target": "node-4",
      "type": "customEdge",
      "sourceHandle": "false"
    }
  ]
}
\`\`\`

### Ejemplo 3: Flujo con HTTP Request
Usuario: "Necesito un flujo que llame a una API para obtener datos del clima y luego registre la temperatura"

Respuesta:
\`\`\`json
{
  "flowName": "Consulta del Clima",
  "flowDescription": "Obtiene datos del clima de una API y registra la temperatura",
  "nodes": [
    {
      "id": "node-1",
      "type": "manual-trigger",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Iniciar Consulta",
        "type": "manual-trigger",
        "parameters": {}
      }
    },
    {
      "id": "node-2",
      "type": "http-request",
      "position": { "x": 400, "y": 100 },
      "data": {
        "label": "Obtener Clima",
        "type": "http-request",
        "parameters": {
          "url": "https://api.weather.com/v1/current",
          "method": "GET",
          "headers": {
            "Content-Type": "application/json"
          }
        }
      }
    },
    {
      "id": "node-3",
      "type": "log",
      "position": { "x": 700, "y": 100 },
      "data": {
        "label": "Registrar Temperatura",
        "type": "log",
        "parameters": {
          "message": "Temperatura actual: {{node-2.output.temperature}}°C"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "type": "customEdge"
    },
    {
      "id": "edge-2",
      "source": "node-2",
      "target": "node-3",
      "type": "customEdge"
    }
  ]
}
\`\`\`

## INSTRUCCIONES FINALES
1. Lee cuidadosamente la descripción del usuario
2. Identifica los nodos necesarios
3. Organiza el flujo de manera lógica
4. Asigna posiciones espaciadas correctamente
5. Configura los parámetros apropiadamente
6. Responde SOLO con el JSON, sin texto adicional
7. Asegúrate de que el JSON sea válido y parseable
8. NO incluyas comentarios en el JSON
9. USA SIEMPRE "customEdge" como tipo de edge

Ahora procesa la siguiente solicitud del usuario:`;
}

/**
 * Genera el prompt del usuario con contexto adicional
 */
export function generateUserPrompt(description: string, context?: string): string {
  let prompt = description;

  if (context) {
    prompt = `${context}\n\n${description}`;
  }

  return prompt;
}

/**
 * Tipos de nodos por defecto (puede ser sobrescrito por datos de la API)
 */
export const DEFAULT_NODE_TYPES: NodeTypeInfo[] = [
  {
    type: 'manual-trigger',
    name: 'Manual Trigger',
    category: 'Trigger',
    description: 'Inicia el flujo manualmente mediante un botón',
    parameters: {},
  },
  {
    type: 'webhook-trigger',
    name: 'Webhook Trigger',
    category: 'Trigger',
    description: 'Inicia el flujo mediante una petición HTTP POST',
    parameters: {},
  },
  {
    type: 'if-condition',
    name: 'If Condition',
    category: 'Logic',
    description: 'Evalúa una condición y bifurca el flujo según el resultado',
    parameters: {
      condition: 'Expresión a evaluar (ej: {{variable}} > 10)',
    },
  },
  {
    type: 'loop',
    name: 'Loop',
    category: 'Logic',
    description: 'Itera sobre un array ejecutando nodos para cada elemento',
    parameters: {
      array: 'Array sobre el que iterar (ej: {{data.items}})',
      itemVariable: 'Nombre de la variable para cada item',
    },
  },
  {
    type: 'set-data',
    name: 'Set Data',
    category: 'Data',
    description: 'Define o modifica variables en el contexto del flujo',
    parameters: {
      variables: 'Objeto con las variables a definir',
    },
  },
  {
    type: 'transform-data',
    name: 'Transform Data',
    category: 'Data',
    description: 'Transforma datos usando expresiones y funciones',
    parameters: {
      transformations: 'Array de transformaciones a aplicar',
    },
  },
  {
    type: 'json-parser',
    name: 'JSON Parser',
    category: 'Data',
    description: 'Parsea y extrae datos de objetos JSON',
    parameters: {
      jsonPath: 'Ruta del JSON a extraer (ej: data.user.name)',
    },
  },
  {
    type: 'http-request',
    name: 'HTTP Request',
    category: 'I/O',
    description: 'Realiza peticiones HTTP a APIs externas',
    parameters: {
      url: 'URL del endpoint',
      method: 'Método HTTP (GET, POST, PUT, DELETE)',
      headers: 'Headers de la petición',
      body: 'Cuerpo de la petición (para POST/PUT)',
    },
  },
  {
    type: 'log',
    name: 'Log',
    category: 'I/O',
    description: 'Registra mensajes en los logs de ejecución',
    parameters: {
      message: 'Mensaje a registrar',
    },
  },
  {
    type: 'delay',
    name: 'Delay',
    category: 'Timing',
    description: 'Pausa la ejecución por un tiempo determinado',
    parameters: {
      duration: 'Tiempo en milisegundos',
    },
  },
];
