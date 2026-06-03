# Guía de Instalación del Proyecto - Feria de Proyectos

¡Hola! Sigue estos pasos para ejecutar el sistema en tu laptop.

## 1. Requisitos Previos
* **Node.js**: Instalado (versión 18 o superior).
* **PostgreSQL**: Instalado y corriendo.
* **Gestor de DB**: DBeaver (o el que prefieras).

## 2. Configuración de la Base de Datos
1. Abre tu gestor de base de datos y crea una nueva base de datos vacía (ej: `feria_db`).
2. Haz clic derecho sobre tu nueva base de datos -> **Herramientas (Tools)** -> **Restaurar (Restore)**.
3. Selecciona el archivo SQL que viene en esta carpeta (ej: `feria_db_backup.sql`).
4. Ejecuta la restauración para cargar las tablas y los datos.

## 3. Configuración del Código
### Paso A: Variables de Entorno
1. Ve a la carpeta `backend/`.
2. Abre el archivo `.env` con un bloc de notas o VS Code.
3. Modifica la línea `DATABASE_URL` con tus propias credenciales:
   ```env
   DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:PUERTO/NOMBRE_DB?schema=public"
   ```
   *Ejemplo: `postgresql://postgres:1234@localhost:5432/feria_db?schema=public`*

### Paso B: Instalación de Dependencias
Abre una terminal en la carpeta principal del proyecto y ejecuta:
```bash
# Instalar dependencias del Frontend en la carpeta secure-fair-Frontend
npm install 

# Ir a la carpeta del Backend e instalar sus dependencias en la carpeta backend
cd backend
npm install

# Generar el cliente de la base de datos (Prisma) en la carpeta backend
npx prisma generate
```

## 4. Ejecución del Proyecto
Necesitas abrir **dos terminales**:

**Terminal 1 (Backend):**
```bash
cd backend
node index.js
```
*(Deberías ver un mensaje diciendo que el servidor corre en el puerto 8000)*

**Terminal 2 (Frontend):**
```bash
# En la carpeta principal
npm start
```
*(Se abrirá tu navegador en http://localhost:3000)*

---
**Nota:** Si al registrarte o editar proyectos ves que no se guardan cambios, verifica que la terminal del Backend no tenga errores de conexión.
