# 📊 Configuración del Backend con Google Sheets

## ✅ Pasos Completados

1. ✅ Archivo JSON de credenciales descargado
2. ✅ Google Sheet creado con las pestañas necesarias
3. ✅ Código del backend implementado
4. ✅ API routes creadas
5. ✅ Servicio de datos actualizado

## 🔧 Pasos Pendientes

### 1. Mover el archivo de credenciales

Mueve el archivo `tokyo-guild-479900-h2-15cb5c052826.json` a la carpeta del proyecto:

```bash
# Desde la carpeta del proyecto
mv ~/Downloads/tokyo-guild-479900-h2-15cb5c052826.json ./google-credentials.json
```

O hazlo manualmente:
- Arrastra el archivo desde Downloads a `/Users/ulisesfleitas/finance_dashboard/`
- Renómbralo como `google-credentials.json`

### 2. Compartir el Google Sheet con la cuenta de servicio

1. Abre el archivo `google-credentials.json`
2. Busca el campo `client_email` (algo como `nombre@proyecto.iam.gserviceaccount.com`)
3. Copia ese email
4. Abre tu Google Sheet
5. Haz clic en "Compartir"
6. Pega el email de la cuenta de servicio
7. Dale permisos de **Editor**
8. Haz clic en "Enviar"

### 3. Obtener el ID del Google Sheet

1. Abre tu Google Sheet
2. Mira la URL, se verá así:
   ```
   https://docs.google.com/spreadsheets/d/AQUI_ESTA_EL_ID/edit
   ```
3. Copia el ID (la parte entre `/d/` y `/edit`)

### 4. Crear el archivo .env.local

Crea un archivo llamado `.env.local` en la raíz del proyecto con este contenido:

```env
GOOGLE_SHEET_ID=PEGA_AQUI_EL_ID_DE_TU_SHEET
GOOGLE_CREDENTIALS_PATH=./google-credentials.json
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Reemplaza `PEGA_AQUI_EL_ID_DE_TU_SHEET` con el ID que copiaste en el paso 3.

### 5. Verificar la estructura del Google Sheet

Asegúrate de que tu Google Sheet tenga estas pestañas con estas columnas (la primera fila debe tener los nombres de las columnas):

**Pestaña "Transacciones":**
| ID | Fecha | Tipo | Categoría | Monto | Cuenta | Cuenta Destino | Detalle |
|----|-------|------|-----------|-------|--------|----------------|---------|

**Pestaña "Cuentas":**
| ID | Nombre | Tipo | Balance Inicial | Balance Actual |
|----|--------|------|-----------------|----------------|

**Pestaña "Categorías_Ingresos":**
| Categoría |
|-----------|

**Pestaña "Categorías_Gastos":**
| Categoría |
|-----------|

### 6. Instalar dependencias (si es necesario)

```bash
npm install
```

### 7. Inicializar las cuentas y categorías predefinidas

Ejecuta este comando para poblar tu Google Sheet con las cuentas y categorías iniciales:

```bash
npx tsx src/lib/initializeSheets.ts
```

### 8. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 9. Verificar que todo funciona

1. Abre http://localhost:3000
2. Verifica que puedas ver las cuentas
3. Intenta agregar una transacción
4. Revisa tu Google Sheet para confirmar que los datos se guardaron

## 🎯 Estructura de Archivos Creados

```
finance_dashboard/
├── google-credentials.json          # ⚠️ NO SUBIR A GIT
├── .env.local                       # ⚠️ NO SUBIR A GIT
├── src/
│   ├── lib/
│   │   ├── googleSheetsService.ts   # Servicio de Google Sheets
│   │   ├── dataService.ts           # Servicio de datos (actualizado)
│   │   ├── initializeSheets.ts      # Script de inicialización
│   │   └── types.ts                 # Tipos existentes
│   └── app/
│       └── api/
│           ├── transactions/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── accounts/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── categories/
│           │   └── route.ts
│           └── summary/
│               └── route.ts
```

## 🔒 Seguridad

Los siguientes archivos están protegidos en `.gitignore`:
- `google-credentials.json`
- `.env.local`
- `.env*`

**¡NUNCA subas estos archivos a Git!**

## ❓ Solución de Problemas

### Error: "GOOGLE_SHEET_ID no está configurado"
- Verifica que el archivo `.env.local` existe
- Verifica que la variable `GOOGLE_SHEET_ID` está definida
- Reinicia el servidor de desarrollo

### Error: "Hoja no encontrada"
- Verifica que los nombres de las pestañas sean exactos (con tildes y mayúsculas)
- Los nombres deben ser: `Transacciones`, `Cuentas`, `Categorías_Ingresos`, `Categorías_Gastos`

### Error de permisos
- Verifica que compartiste el Sheet con el email de la cuenta de servicio
- Verifica que le diste permisos de Editor (no solo Viewer)

### Los datos no se guardan
- Verifica que las columnas en el Sheet tengan los nombres exactos
- Revisa la consola del navegador para ver errores
- Revisa la consola del servidor para ver errores del backend

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación estará conectada a Google Sheets y podrás:
- ✅ Agregar, editar y eliminar transacciones
- ✅ Gestionar cuentas
- ✅ Gestionar categorías
- ✅ Ver resúmenes financieros
- ✅ Los datos se sincronizan automáticamente con Google Sheets
- ✅ Puedes editar el Sheet manualmente y los cambios se reflejarán en la app
