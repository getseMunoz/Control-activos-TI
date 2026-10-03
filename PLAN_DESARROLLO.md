# PLAN DE DESARROLLO EJECUTADO
## Sistema de Gestión de Activos TI — CIPRIJAL

---

## 1. CONTEXTO

El desarrollo del sistema se realizó como parte de una residencia profesional en el área de Soporte TI de CIPRIJAL. El proyecto fue desarrollado principalmente por una residente, con revisión de necesidades y retroalimentación del personal responsable del área.

El objetivo del trabajo fue construir y documentar una versión funcional del sistema para el control de activos de TI. El despliegue en infraestructura productiva no formó parte del alcance de la residente.

---

## 2. METODOLOGÍA DE TRABAJO

Se utilizó Scrum de manera adaptada al contexto de una residencia individual. No se reprodujo una estructura completa de equipo Scrum; se conservaron los elementos útiles para organizar el trabajo:

- priorización de necesidades;
- desarrollo incremental;
- trabajo por sprints;
- revisión de cada avance;
- corrección de problemas detectados;
- incorporación progresiva de nuevas necesidades;
- validación funcional y técnica;
- documentación del producto final.

Cada incremento se integró con lo desarrollado previamente y se comprobó dentro del flujo general del sistema.

---

## 3. DESARROLLO POR SPRINTS

### Sprint 1. Requerimientos y estructura inicial

Se realizó el levantamiento de necesidades, el análisis de la información disponible y el diseño inicial de la base de datos. Se definieron los roles, entidades principales, relaciones y reglas necesarias para controlar activos, usuarios y ubicaciones.

### Sprint 2. Base del sistema y acceso

Se preparó la estructura del proyecto web y se trabajó en autenticación, sesiones, usuarios, catálogos base y control de acceso por rol. Durante las pruebas se revisaron las validaciones de sesión y autorización para separar correctamente las funciones del Administrador TI y del Usuario Final.

### Sprint 3. Inventario de activos

Se desarrolló el registro de activos con información general, número de serie, tipo, marca, modelo, ubicación, estado y datos de compra. También se incorporaron consulta, edición, filtros y baja lógica para conservar el historial.

### Sprint 4. Asignaciones y entrega

Se desarrolló el flujo para relacionar un activo disponible con un usuario, registrar accesorios y observaciones, capturar la firma de entrega y generar la responsiva correspondiente.

### Sprint 5. Devoluciones e historial

Se incorporó el registro de devolución, la firma correspondiente y la responsiva de devolución. Los movimientos quedaron relacionados con el historial del activo para conservar evidencia tanto de la entrega como del retorno.

### Sprint 6. Incidencias, mantenimiento y gastos

Se integraron funciones para registrar fallas, dar seguimiento a incidencias, administrar órdenes de mantenimiento y asociar gastos a cada activo.

### Sprint 7. Consultas, reportes y funciones complementarias

Se completaron el dashboard, reportes, exportaciones CSV y portal de Usuario Final. También se incorporaron la consulta por ubicación, la información técnica por activo y el apartado de credenciales restringido al Administrador TI.

### Sprint 8. Pruebas y documentación

Se realizaron pruebas funcionales y validaciones técnicas del proyecto. Se documentaron evidencias de Prisma, TypeScript, ESLint, compilación, historial de commits, manual de usuario y documentación técnica del sistema.

---

## 4. CRITERIOS UTILIZADOS PARA DAR POR CONCLUIDO EL DESARROLLO

El alcance de la residencia se consideró concluido al contar con:

- autenticación funcional;
- separación de permisos por rol;
- administración de usuarios y catálogos;
- inventario de activos;
- asignaciones y devoluciones;
- firmas y responsivas;
- historial por activo;
- incidencias;
- mantenimiento;
- gastos;
- dashboard y reportes;
- exportaciones CSV;
- portal de Usuario Final;
- información por ubicación;
- información técnica y credenciales restringidas;
- pruebas funcionales;
- validaciones de Prisma, TypeScript, ESLint y compilación;
- documentación técnica;
- manual de usuario;
- código fuente conservado en el repositorio.

---

## 5. CONTROL DE VERSIONES UTILIZADO

El repositorio utiliza la rama principal:

```
main → Rama principal del proyecto. Contiene la versión funcional y documentada del sistema.
```

Durante el desarrollo se utilizaron mensajes descriptivos para identificar los cambios. Algunos emplearon prefijos como `feat:`, `docs:` o `chore:`, mientras que otros se registraron mediante mensajes directos en español.

Ejemplos reales del historial:

```
agregar dashboard general
implementar incidencias por activo
feat: agregar firma digital en asignaciones
docs: actualizar documentacion tecnica
agregar informacion tecnica de activos
```

---

## 6. VALIDACIONES TÉCNICAS

Para comprobar la integridad técnica del proyecto se utilizaron las herramientas disponibles en el repositorio:

- Prisma para validación del esquema y acceso a datos.
- TypeScript para revisión de tipos.
- ESLint para análisis estático.
- Prettier para consistencia de formato.
- Compilación de producción para verificar que el proyecto construyera correctamente.
- Git para conservar el historial de cambios.

Las pruebas realizadas durante la residencia se complementaron con pruebas manuales de los principales flujos funcionales.

---

## 7. ALCANCE NO CORRESPONDIENTE A LA RESIDENTE

Las siguientes actividades no formaron parte del alcance de la residencia:

- contratación o administración de infraestructura productiva;
- despliegue definitivo en servidores de CIPRIJAL;
- contratación de dominio;
- configuración de HTTPS productivo;
- contratación o administración de una base de datos en la nube;
- políticas operativas de respaldo;
- monitoreo de producción;
- migración de información real de la empresa;
- decisión de entrada en operación oficial.

Estas actividades, en caso de realizarse, corresponden a una decisión posterior de CIPRIJAL.

---

## 8. RESULTADO DEL PLAN

El plan de desarrollo concluyó con una versión funcional, validada y documentada del Sistema de Gestión de Activos TI. El código fuente, la documentación técnica y el manual de usuario permiten que personal autorizado de CIPRIJAL pueda revisar el producto y decidir posteriormente su forma de adopción u operación.
