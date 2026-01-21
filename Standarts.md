///////////////////////API CLIENT Y LLAMADAS///////////////////////////////
Regla 1
👉 El ApiClient NO conoce React

Regla 2
👉 Los archivos *.api.ts solo hacen requests

Regla 3
👉 React Query es la única fuente de estado remoto

Regla 4
👉 Los componentes no usan fetch ni api directamente