# Manual de usuario

## Sistema de Gestión de Activos TI — CIPRIJAL

Este manual describe el uso general del sistema de gestión de activos TI. El sistema cuenta con dos perfiles de acceso: **Administrador TI** y **Usuario final**.

---

## 1. Inicio de sesión

1. Abrir la aplicación en el navegador.
2. Capturar el correo electrónico asignado.
3. Capturar la contraseña correspondiente.
4. Seleccionar **Iniciar sesión**.

El sistema valida que la cuenta esté activa y que las credenciales sean correctas. Después del acceso, las opciones disponibles dependen del rol del usuario.

---

## 2. Perfil Administrador TI

El Administrador TI dispone de funciones para gestionar usuarios, ubicaciones, tipos de activo, activos, asignaciones, devoluciones, incidencias, mantenimiento, gastos, reportes e información técnica.

### 2.1 Dashboard

El panel principal muestra indicadores generales del inventario y alertas operativas. Desde esta vista se puede consultar el estado general de los activos y acceder a los módulos principales.

### 2.2 Gestión de usuarios

Para crear un usuario:

1. Entrar al módulo **Usuarios**.
2. Seleccionar **Nuevo usuario**.
3. Capturar nombre, apellido y correo electrónico.
4. Elegir el rol correspondiente: **Administrador TI** o **Usuario Final**.
5. Capturar, cuando aplique, puesto, teléfono, modalidad y ubicación.
6. Definir una contraseña temporal.
7. Seleccionar **Crear usuario**.

El sistema permite también editar información, activar o desactivar usuarios y restablecer contraseñas.

### 2.3 Ubicaciones y tipos de activo

El administrador puede crear y mantener los catálogos utilizados por el inventario.

- **Ubicaciones:** permiten identificar la sede o localidad donde se encuentra un activo o usuario.
- **Tipos de activo:** permiten clasificar equipos como computadoras, monitores, dispositivos de red u otras categorías requeridas por la empresa.

### 2.4 Registro de activos

Para registrar un activo:

1. Entrar al módulo **Activos**.
2. Seleccionar **Nuevo activo**.
3. Capturar los datos obligatorios y complementarios disponibles.
4. Seleccionar el tipo de activo y la ubicación correspondiente.
5. Guardar el registro.

Entre los datos que puede almacenar el sistema se encuentran código interno, nombre, número de serie, marca, modelo, estado, ubicación, proveedor, precio de compra, garantía e identificadores internos.

### 2.5 Consulta y edición de activos

Desde el listado de activos es posible aplicar filtros y abrir el detalle de un equipo. En la vista de detalle se concentra información como:

- datos generales;
- asignación actual;
- historial de asignaciones;
- incidencias;
- mantenimiento;
- gastos;
- información técnica;
- credenciales, cuando el rol y los permisos lo permiten.

### 2.6 Asignación de equipos

Para asignar un activo a un usuario:

1. Entrar al módulo **Asignaciones**.
2. Seleccionar **Nueva asignación**.
3. Elegir un activo disponible.
4. Seleccionar al usuario que recibirá el equipo.
5. Capturar ubicación de entrega, accesorios y notas, cuando corresponda.
6. Capturar la firma de recepción.
7. Confirmar la asignación.

Al finalizar, el sistema actualiza el estado del activo y conserva el registro histórico de la asignación.

### 2.7 Responsiva de entrega

Después de una asignación se puede consultar la responsiva correspondiente. Esta contiene los datos principales del activo, usuario, responsable de TI, fecha, accesorios, notas y firma registrada.

### 2.8 Devolución de equipos

Para registrar una devolución:

1. Localizar la asignación activa.
2. Seleccionar la opción de devolución.
3. Capturar la información solicitada.
4. Registrar la firma de devolución.
5. Confirmar el movimiento.

Al completar el proceso, la asignación queda cerrada y el activo vuelve a quedar disponible según el flujo operativo definido.

### 2.9 Responsiva de devolución

El sistema genera una responsiva de devolución con los datos del movimiento, fecha, activo, usuario, responsable de recepción y firma correspondiente.

### 2.10 Incidencias

El módulo de incidencias permite registrar y dar seguimiento a fallas relacionadas con un activo. El administrador puede consultar la incidencia, modificar su estado, prioridad y registrar información de resolución.

### 2.11 Mantenimiento

En el detalle de un activo se pueden registrar órdenes de mantenimiento preventivo, correctivo o relacionadas con garantía. Las órdenes permiten conservar antecedentes de trabajos realizados, estado, prioridad, fechas, resultado y costo cuando corresponda.

### 2.12 Gastos por activo

El administrador puede registrar gastos asociados a un activo, como reparaciones, refacciones, accesorios u otros conceptos. Esta información forma parte del historial del equipo.

### 2.13 Información técnica del activo

Cuando se requiera, el Administrador TI puede registrar información técnica como:

- hostname;
- dirección IP;
- IP pública;
- direcciones MAC;
- sistema operativo;
- versión de Office;
- firmware;
- número de modelo;
- número de orden;
- notas técnicas.

### 2.14 Credenciales del activo

Las credenciales asociadas a equipos se administran en una sección restringida al rol Administrador TI. Esta información no se muestra al usuario final ni se incluye en reportes o responsivas destinados a otros usuarios.

### 2.15 Reportes y exportaciones

El módulo de reportes permite consultar información consolidada del inventario. Los listados de activos y asignaciones también pueden exportarse en formato CSV respetando los filtros aplicados.

### 2.16 Detalle por ubicación

El administrador puede consultar una ubicación específica para revisar los usuarios, activos, incidencias y mantenimientos relacionados con esa localidad.

---

## 3. Perfil Usuario final

El Usuario final dispone de un portal restringido para consultar únicamente la información relacionada con sus propios equipos y movimientos.

### 3.1 Mis activos

Desde **Mis activos**, el usuario puede consultar los equipos que tiene asignados y acceder a la información permitida de cada uno.

### 3.2 Responsivas

El usuario puede consultar las responsivas correspondientes a sus asignaciones y devoluciones cuando estén disponibles.

### 3.3 Reportar una falla

Para reportar una incidencia:

1. Entrar a **Mis activos**.
2. Seleccionar el equipo correspondiente.
3. Elegir la opción para reportar una falla.
4. Capturar el título y la descripción del problema.
5. Enviar el reporte.

La incidencia queda registrada para seguimiento por parte del personal de TI.

---

## 4. Cierre de sesión

Al finalizar el uso del sistema, se recomienda cerrar la sesión desde la opción correspondiente del menú de usuario, especialmente cuando se utilice un equipo compartido.

---

## 5. Consideraciones de seguridad

- No compartir contraseñas personales.
- No almacenar credenciales reales en documentos públicos o capturas de pantalla.
- Utilizar cuentas de demostración exclusivamente para evaluación o pruebas.
- Las funciones administrativas deben utilizarse únicamente por personal autorizado.
- La información de credenciales técnicas de activos está restringida al rol Administrador TI.

---

## 6. Soporte

En caso de dudas operativas, errores de acceso o problemas con los datos registrados, el usuario debe contactar al personal responsable del área de Soporte TI.
