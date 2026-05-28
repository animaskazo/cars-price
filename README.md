# PreciosAutos MVP - Valuador de Mercado de Vehículos (Chile)

Este es un Mínimo Producto Viable (MVP) premium construido con **React** y **Vite** para integrarse de forma fluida y segura con la API de consulta de precios de autos en Chile.

La aplicación incluye un dashboard ejecutivo moderno en modo oscuro con efectos de Glassmorphism, gráficos interactivos de fluctuación mensual y un explorador completo de cobertura de mercado por tramos de kilometraje.

---

## 🛠️ Requisitos e Instalación

Para ejecutar la aplicación localmente en tu sistema, asegúrate de tener instalado [Node.js](https://nodejs.org/).

1. **Instalar Dependencias:**
   Ejecuta el siguiente comando en la raíz del proyecto para instalar todos los paquetes base y librerías de interfaz (`chart.js`, `lucide-react`, etc.):
   ```bash
   npm install
   ```

2. **Configurar el Archivo de Entorno:**
   Para mayor seguridad y flexibilidad de integración, las credenciales se cargan mediante variables del sistema. Abre el archivo `.env` en la raíz del proyecto:
   ```env
   VITE_API_BASE_URL=https://api-precioautos.nucolab.cl
   VITE_API_KEY=tu_api_key_aqui
   ```
   Reemplaza `tu_api_key_aqui` por tu clave de API pública autorizada. Puedes apuntar `VITE_API_BASE_URL` a `http://localhost:8000` si estás ejecutando y probando la API en un entorno local.

---

## 🚀 Ejecutar la Aplicación

Para iniciar el servidor de desarrollo ultrarrápido de Vite en tu máquina:

```bash
npm run dev
```

Una vez que compile, abre la URL que se indica en la terminal (usualmente `http://localhost:5173`) en tu navegador web.

---

## 📋 Funcionalidades Integradas

1. **Calculadora de Valor de Mercado:**
   - **Formulario Inteligente:** Los selectores de marca y modelo son dependientes y se pueblan directamente de la API (`/catalog`).
   - **Formateador Dinámico:** A medida que ingresas el kilometraje, se aplica el separador de miles es-CL ("50.000 km").
   - **Precio Estimado:** Destacado en tipografía grande con el formato oficial CLP.
   - **Indicador de Confianza:** Alertas dinámicas de confianza. Si la muestra es reducida (`confidence: low`), la app alerta al usuario para tratar el valor como referencial.
   - **Medidor de Rango de Mercado:** Barra interactiva que muestra dónde se sitúa la tasación estimada en comparación con los valores mínimo (`low`) y máximo (`high`) de mercado observados.

2. **Explorador de Cobertura y Segmentos:**
   - Permite consultar las agrupaciones de mercado completas por marca y rango de años usando `/segments`.
   - Renders dinámicos en una cuadrícula donde se destacan los volúmenes de muestras ("Muestra Óptima", "Cobertura Media", "Muestra Escasa") para orientar la búsqueda.

3. **Gráficos de Tendencias:**
   - Renderiza un gráfico de línea interactivo usando **Chart.js** alimentado por la serie histórica mensual (`/market-price/monthly-average`).
   - Muestra las curvas de precio promedio vs precio mediana, e incluye tooltips dinámicos con los tamaños de muestra del mes para total transparencia de los datos.

4. **Consola de Diagnóstico (Settings Drawer):**
   - Haz clic en el botón de engranaje superior para comprobar los parámetros actuales de la app y correr un diagnóstico en vivo de la conexión con el servidor.

---

## 💻 Tecnologías Utilizadas

- **Frontend core:** React 19 + JavaScript (ES6+).
- **Herramienta de empaquetado:** Vite.
- **Gráficos interactivos:** Chart.js & React-Chartjs-2.
- **Diseño estético:** Vanilla CSS3 con sistema de variables HSL y Glassmorphism.
- **Iconografía premium:** Lucide React.
