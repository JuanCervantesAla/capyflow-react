# 🎯 Tipos de Nodos para AI Workflow

Estructura completa de nodos para construir workflows con capacidades de IA y automatización.

---

## 🚀 1. Nodos Trigger (Inicio del Workflow)

Estos nodos inician la ejecución del workflow.

| Nodo | Descripción | Icono Sugerido |
|------|-------------|----------------|
| **Manual Trigger** | Ejecuta el workflow manualmente con un botón | `IconPlayerPlay` |
| **Schedule Trigger** | Ejecuta en intervalos de tiempo (cron) | `IconClock` |
| **Webhook Trigger** | Se activa con peticiones HTTP externas | `IconWebhook` |
| **File Upload Trigger** | Se activa al subir archivos | `IconUpload` |
| **API Trigger** | Escucha eventos de APIs externas | `IconApi` |
| **Email Trigger** | Se activa al recibir emails | `IconMail` |

---

## 🤖 2. Nodos de IA y LLM

El corazón de tu sistema AI-powered.

### **Modelos de Lenguaje**
| Nodo | Descripción | Icono |
|------|-------------|-------|
| **GPT Node** | OpenAI GPT-4, GPT-4o, o1 | `IconBrain` |
| **Claude Node** | Anthropic Claude (Sonnet, Opus) | `IconRobot` |
| **Gemini Node** | Google Gemini Pro | `IconSparkles` |
| **Local LLM Node** | Ollama, LM Studio (modelos locales) | `IconCpu` |
| **Custom AI Node** | Conecta a tu propio modelo | `IconWand` |

### **IA Especializada**
| Nodo | Descripción | Icono |
|------|-------------|-------|
| **Image Generation** | DALL-E, Midjourney, Stable Diffusion | `IconPhoto` |
| **Image Analysis** | Vision AI para analizar imágenes | `IconEye` |
| **Text-to-Speech** | Convierte texto a audio | `IconVolume` |
| **Speech-to-Text** | Transcribe audio a texto | `IconMicrophone` |
| **Sentiment Analysis** | Analiza emociones en texto | `IconMoodHappy` |
| **Text Summarizer** | Resumen automático de textos | `IconFileText` |
| **Translation** | Traducción multiidioma | `IconLanguage` |
| **Code Generator** | Genera código desde descripción | `IconCode` |

### **RAG y Conocimiento**
| Nodo | Descripción | Icono |
|------|-------------|-------|
| **Vector Store** | Almacena embeddings (Pinecone, Chroma) | `IconDatabase` |
| **Document Loader** | Carga PDFs, docs, CSVs | `IconFileUpload` |
| **Text Splitter** | Divide texto en chunks | `IconCut` |
| **Embeddings** | Genera embeddings de texto | `IconDna` |
| **Retriever** | Busca en vectores similares | `IconSearch` |

---

## 🔧 3. Nodos de Procesamiento de Datos

Manipulan y transforman datos entre nodos.

| Nodo | Descripción | Icono |
|------|-------------|-------|
| **Function Node** | JavaScript/Python personalizado | `IconCode` |
| **Transform Data** | Mapea, filtra, agrupa datos | `IconTransform` |
| **Merge Data** | Combina salidas de múltiples nodos | `IconGitMerge` |
| **Split Data** | Divide arrays en elementos individuales | `IconGitBranch` |
| **Filter** | Filtra datos por condición | `IconFilter` |
| **Sort** | Ordena arrays de datos | `IconArrowsSort` |
| **JSON Parser** | Parsea y manipula JSON | `IconBraces` |
| **CSV Parser** | Lee y escribe CSV | `IconTable` |
| **Regex Extract** | Extrae datos con expresiones regulares | `IconRegex` |

---

## 🎯 4. Nodos de Lógica y Control

Controlan el flujo de ejecución.

| Nodo | Descripción | Icono |
|------|-------------|-------|
| **Condition (IF)** | Bifurca según condición | `IconGitBranch` |
| **Switch** | Múltiples caminos según valor | `IconSwitch` |
| **Loop** | Itera sobre arrays | `IconRepeat` |
| **Delay** | Pausa la ejecución X segundos | `IconClockPause` |
| **Stop** | Detiene el workflow | `IconPlayerStop` |
| **Error Handler** | Maneja errores y retry | `IconAlertTriangle` |
| **Wait for Event** | Espera input externo | `IconHandStop` |

---

## 📤 5. Nodos de Input/Output

Entrada y salida de datos del workflow.

### **Input**
| Nodo | Descripción | Icono |
|------|-------------|-------|
| **Text Input** | Campo de texto manual | `IconTextSize` |
| **Form Input** | Formulario con múltiples campos | `IconForms` |
| **File Input** | Sube archivos | `IconFileUpload` |
| **Variable** | Define variables globales | `IconVariable` |

### **Output**
| Nodo | Descripción | Icono |
|------|-------------|-------|
| **Display** | Muestra resultado en pantalla | `IconEye` |
| **Download** | Descarga archivo generado | `IconDownload` |
| **Email** | Envía email con resultado | `IconMail` |
| **Notification** | Push notification | `IconBell` |
| **Save to DB** | Guarda en base de datos | `IconDatabase` |
| **Webhook Response** | Responde a webhook | `IconWebhook` |

---

## 🔌 6. Nodos de Integración

Conectan con servicios externos.

### **Productividad**
| Nodo | Descripción | Icono |
|------|-------------|-------|
| **Google Drive** | Lee/escribe archivos en Drive | `IconBrandGoogle` |
| **Notion** | Gestiona bases de datos Notion | `IconBrandNotion` |
| **Slack** | Envía mensajes a Slack | `IconBrandSlack` |
| **Discord** | Envía mensajes a Discord | `IconBrandDiscord` |
| **GitHub** | Interactúa con repos | `IconBrandGithub` |
| **Airtable** | CRUD en tablas Airtable | `IconTable` |

### **Comunicación**
| Nodo | Descripción | Icono |
|------|-------------|-------|
| **Gmail** | Lee/envía emails | `IconMail` |
| **Telegram** | Bot de Telegram | `IconBrandTelegram` |
| **WhatsApp** | Mensajes WhatsApp Business | `IconBrandWhatsapp` |
| **SMS** | Envía SMS (Twilio) | `IconMessage` |

### **Web & APIs**
| Nodo | Descripción | Icono |
|------|-------------|-------|
| **HTTP Request** | Petición HTTP personalizada | `IconWorld` |
| **GraphQL** | Consultas GraphQL | `IconBrandGraphql` |
| **REST API** | API REST genérica | `IconApi` |
| **Web Scraper** | Extrae datos de webs | `IconWorldDownload` |
| **Browser Automation** | Puppeteer/Playwright | `IconBrowser` |

### **Bases de Datos**
| Nodo | Descripción | Icono |
|------|-------------|-------|
| **PostgreSQL** | Consultas SQL | `IconDatabase` |
| **MongoDB** | NoSQL queries | `IconBrandMongodb` |
| **Redis** | Cache y queue | `IconServer` |
| **Supabase** | Backend as a Service | `IconBrandSupabase` |

---

## 🎨 7. Nodos Especiales

Funcionalidades avanzadas.

| Nodo | Descripción | Icono |
|------|-------------|-------|
| **AI Agent** | Agente autónomo con tools | `IconRobotFace` |
| **Multi-Agent System** | Orquesta múltiples agentes | `IconUsers` |
| **Human in the Loop** | Aprobación manual | `IconUserCheck` |
| **A/B Test** | Prueba variantes | `IconTestPipe` |
| **Cache** | Cachea resultados | `IconCloudDataConnection` |
| **Queue** | Cola de tareas | `IconStack` |
| **Parallel Execution** | Ejecuta en paralelo | `IconArrowsSplit` |
| **Sub-Workflow** | Ejecuta otro workflow | `IconGitFork` |
| **Comment** | Nota para documentar | `IconNote` |

---

## 📊 8. Nodos de Análisis y Monitoring

Observabilidad del workflow.

| Nodo | Descripción | Icono |
|------|-------------|-------|
| **Logger** | Registra eventos | `IconFileText` |
| **Metrics** | Métricas de performance | `IconChartBar` |
| **Debug** | Inspecciona datos en tiempo real | `IconBug` |
| **Validation** | Valida schema de datos | `IconShieldCheck` |

---

## 🎯 Workflows de Ejemplo

### **Ejemplo 1: Generador de Contenido con IA**
```
Manual Trigger → Text Input → GPT Node → Translation → Save to DB → Notification
```

### **Ejemplo 2: Procesador de Imágenes**
```
File Upload → Image Analysis → Condition → [SI: Image Generation | NO: Stop] → Download
```

### **Ejemplo 3: Chatbot con RAG**
```
Webhook Trigger → Document Loader → Text Splitter → Embeddings → Vector Store
                                                                        ↓
User Query → Retriever → GPT Node (with context) → Webhook Response
```

### **Ejemplo 4: Automatización con Aprobación**
```
Schedule → Web Scraper → Data Transform → Human in Loop → [Approved: Email | Rejected: Stop]
```

### **Ejemplo 5: Multi-Agent Research**
```
Manual → AI Agent (Researcher) → AI Agent (Analyzer) → AI Agent (Writer) → PDF Generator → Email
```

---

## 🔥 Prioridad de Implementación

### **Fase 1 - MVP (Esencial)**
1. Manual Trigger
2. GPT Node / Claude Node
3. Text Input / Display
4. Condition
5. HTTP Request
6. Function Node (JavaScript)

### **Fase 2 - Core Features**
7. Image Generation
8. File Upload / Document Loader
9. Vector Store + Embeddings
10. Loop / Split Data
11. Email / Webhook
12. Error Handler

### **Fase 3 - Advanced**
13. AI Agent
14. Web Scraper
15. Browser Automation
16. Multi-Agent System
17. Cache / Queue
18. Parallel Execution

### **Fase 4 - Integraciones**
19. Google Drive, Notion, Slack
20. PostgreSQL, MongoDB
21. GitHub, Airtable
22. Más LLMs (Gemini, Local)

---

## 💡 Tips de Diseño

### **Categorías Visuales**
Agrupa nodos por color para mejor UX:
- 🟣 **Triggers**: Violet (`#7C3AED`)
- 🔵 **AI/LLM**: Cyan (`#06B6D4`)
- 🟢 **Data**: Green (`#10B981`)
- 🟠 **Logic**: Amber (`#F59E0B`)
- 🔴 **Output**: Magenta (`#EC4899`)
- ⚪ **Integration**: Gray (`#6B7280`)

### **Estados de Nodo**
- **Idle**: Borde gris
- **Running**: Borde cyan animado
- **Success**: Borde verde con checkmark
- **Error**: Borde rojo con X
- **Waiting**: Borde amber pulsante

### **Conexiones**
- **Data Flow**: Línea sólida `#A78BFA`
- **Conditional**: Línea punteada `#F59E0B`
- **Error Path**: Línea roja `#EF4444`
- **Active**: Animación de flujo

---

## 🚀 Próximos Pasos

1. **Define tu MVP**: Empieza con 6-8 nodos core
2. **Crea templates**: Workflows predefinidos para casos comunes
3. **Marketplace**: Permite a usuarios compartir workflows
4. **Versioning**: Control de versiones de workflows
5. **Collaboration**: Edición colaborativa en tiempo real