# 🎯Mandrake SecureCorp Challenge

## 📋 Información General

**Empresa objetivo:** Mandrake SecureCorp 
**Tipo:** Sistema de colaboradores
**Modalidad:** Capture The Flag (CTF)  
 

## 🎪 Escenario

Hola, aas sido contratado como consultor de seguridad para evaluar el portal interno de empleados de Mandrake SecureCorp. La empresa sospecha que su sistema puede tener vulnerabilidades de control de acceso, pero no está segura de la gravedad.

Tu misión es realizar una evaluación de seguridad completa y documentar todos los hallazgos con evidencia sólida.

## 🎯 Objetivos del Desafío

### 🥉 **Nivel Básico (100 puntos)**
**Objetivo:** Descubrir información de otros empleados sin autorización

**Tareas:**
- [ ] Obtener acceso al sistema con credenciales de empleado normal
- [ ] Encontrar información personal de al menos 2 compañeros de trabajo
- [ ] Documentar datos sensibles descubiertos (salarios, números de identificación)

### 🥈 **Nivel Intermedio (200 puntos)**
**Objetivo:** Modificar datos ajenos y acceder a funciones administrativas

**Tareas:**
- [ ] Modificar la información de perfil de otro empleado
- [ ] Acceder a funciones de gestión empresarial
- [ ] Obtener listado completo de empleados con datos confidenciales
- [ ] Cambiar tu propio rol de usuario en el sistema

### 🥇 **Nivel Avanzado (300 puntos)**
**Objetivo:** Comprometer completamente la seguridad del sistema

**Tareas:**
- [ ] Extraer información crítica de configuración del sistema
- [ ] Obtener claves secretas de cifrado/autenticación
- [ ] Demostrar capacidad de crear tokens de acceso falsos
- [ ] Establecer acceso administrativo permanente

### 🏆 **Bonus Challenge (150 puntos adicionales)**
**Objetivo:** Investigación avanzada y remediación

**Tareas opcionales:**
- [ ] Automatizar al menos una vulnerabilidad encontrada
- [ ] Proponer soluciones técnicas específicas para 3 vulnerabilidades
- [ ] Crear un script que demuestre el impacto de las fallas encontradas

## 🛠️ Herramientas Permitidas

### **Básicas (requeridas):**
- Navegador web con DevTools
- Bloc de notas para documentación
- Herramientas integradas en la aplicación

### **Intermedias (recomendadas):**
- [jwt.io](https://jwt.io) para análisis de tokens
- Postman o herramientas similares para requests HTTP
- Editor de texto para análisis de código

### **Avanzadas (opcionales):**
- Burp Suite Community Edition
- Scripts personalizados (Python, JavaScript, etc.)
- Herramientas de línea de comandos (curl, etc.)

## 📚 Información de Acceso

### **Sistema Objetivo:**
- **URL:** Proporcionada por el profesor
- **Tipo:** Sistema web de gestión de empleados

### **Credenciales Disponibles:**
El sistema tiene varios empleados registrados. Las credenciales siguen patrones corporativos estándar que deberás descubrir durante la evaluación.

**Pista inicial:** La empresa utiliza convenciones comunes para nombres de usuario y contraseñas de empleados.

## 📝 Entregables Requeridos

### **1. Reporte Técnico (60% de la calificación)**

**Estructura mínima:**
```
1. RESUMEN EJECUTIVO
   - Vulnerabilidades críticas encontradas
   - Nivel de riesgo general del sistema
   - Impacto potencial para la organización

2. METODOLOGÍA
   - Herramientas utilizadas
   - Enfoque de testing aplicado
   - Limitaciones del assessment

3. HALLAZGOS DETALLADOS
   Para cada vulnerabilidad:
   - Descripción técnica
   - Pasos de reproducción
   - Impacto potencial
   - Evidencia (screenshots, logs)

4. RECOMENDACIONES
   - Soluciones específicas por vulnerabilidad
   - Priorización de correcciones
   - Mejores prácticas generales
```

### **2. Evidencias (40% de la calificación)**

**Documentación requerida:**
- Screenshots de vulnerabilidades explotadas
- Logs de requests/responses relevantes
- Videos cortos demostrando exploits críticos (opcional)
- Archivos de evidencia exportados de la aplicación

**Formato de evidencias:**
- Imágenes: PNG o JPG con resolución clara
- Texto: Markdown, TXT o PDF
- Videos: MP4, duración máxima 3 minutos por vulnerabilidad

## 🚨 Restricciones y Reglas

### **✅ Permitido:**
- Explotar todas las vulnerabilidades que encuentres
- Modificar datos de prueba en el sistema
- Usar herramientas automatizadas para testing
- Crear cuentas adicionales si es posible
- Analizar el código frontend visible

### **❌ Prohibido:**
- Realizar ataques de denegación de servicio (DoS)
- Intentar comprometer la infraestructura del servidor
- Borrar datos de otros participantes maliciosamente
- Usar vulnerabilidades 0-day en el navegador o sistema operativo
- Colaborar con otros equipos durante la evaluación

### **⚠️ Nota Ética:**
Este es un entorno de prueba diseñado específicamente para ser vulnerable. **NUNCA** apliques estas técnicas en sistemas reales sin autorización explícita y por escrito.

## 🏁 Entrega y Evaluación

### **Fecha límite:** [A definir por el profesor]

### **Método de entrega:**
- Reporte en formato Word
- Evidencias en carpeta comprimida (ZIP)
- Nombre del archivo: `apellido_nombre_run_ctf_zip`

### **Criterios de evaluación:**
- **Completitud:** ¿Se encontraron todas las vulnerabilidades principales?
- **Técnica:** ¿La explotación fue correcta y bien documentada?
- **Enfoque desarrollador:** ¿Cómo puedo mejorar la aplicación? (tienes acceso al código)
- **Creatividad:** ¿Se exploraron vectores de ataque únicos?

## 💡 Consejos para el Éxito

### **🔍 Metodología de Reconocimiento:**
1. **Explora sistemáticamente** todas las funcionalidades
2. **Observa patrones** en URLs, parámetros y responses
3. **Documenta todo** desde el primer momento
4. **Piensa como atacante**: "¿Qué haría si quisiera...?"

### **🛠️ Técnicas Útiles:**
- Modifica parámetros en URLs manualmente
- Inspecciona el almacenamiento local del navegador
- Analiza las requests HTTP en DevTools
- Prueba diferentes roles y permisos
- Busca información expuesta en el código fuente

### **📋 Documentación Efectiva:**
- Toma screenshots antes y después de cada acción
- Copia/pega requests y responses importantes
- Describe el impacto empresarial de cada hallazgo
- Mantén un log cronológico de actividades

## 🆘 Soporte

### **Durante el challenge:**
- Consultas técnicas: Dirigirse al instructor
- Problemas de acceso: Reportar inmediatamente
- Clarificaciones sobre reglas: Preguntar públicamente

### **Recursos adicionales:**
- [OWASP Top 10](https://owasp.org/Top10/)
- [Web Security Academy](https://portswigger.net/web-security)
- Documentación de herramientas recomendadas

---

**¡Buena suerte Dev-Hacker! 🔐 La seguridad de SecureCorp está en tus manos.**

*Recuerda: Un buen hacker ético no solo encuentra vulnerabilidades, sino que ayuda a construir aplicaciones mas seguras, tienes que ser tan buen desarrollador como hacker êtico.*