# 00_AI_PROJECT_CONTEXT - YOGA WELLNESS KITCHEN PLATFORM

## Propósito

Contexto raíz para humanos y agentes de IA.
Ningún documento activo debe contradecir este archivo.

## 1. Verdad del producto

La plataforma es una **aplicación single-tenant para un negocio de yoga y bienestar**.
No es un marketplace multi-instructor ni una franquicia multi-sucursal en MVP.

El producto tiene 3 superficies principales:

1. Sitio público comercial
   - landing,
   - exploración de clases,
   - membresías,
   - paquetes,
   - wellness kitchen / extras,
   - checkout,
   - registro/login cliente.

2. Panel administrativo interno
   - usado por el administrador del negocio,
   - gestiona clases, horarios, precios, productos, leads, ventas y clientes,
   - configura contenido público básico.

3. Área privada de cliente
   - reservas,
   - historial,
   - membresías,
   - perfil,
   - cancelaciones o reprogramaciones según reglas.

## 2. Roles reales del sistema

Solo existen 3 tipos de usuario en MVP:

### `root`
- superusuario técnico invisible;
- acceso total;
- usado para soporte, mantenimiento y control avanzado.

### `admin`
- administrador del negocio;
- accede al panel interno;
- publica clases, horarios, planes, paquetes y productos wellness;
- gestiona leads, ventas y clientes.

### `customer`
- cliente final;
- reserva clases;
- compra clases individuales;
- compra paquetes;
- se suscribe a membresías;
- compra extras o productos wellness kitchen;
- consulta su historial y su perfil.

Regla no negociable:
- **No existe rol de instructor autenticado en MVP.**
- Los instructores pueden existir como contenido/entidad de negocio, pero no como usuario con dashboard propio.

## 3. Alcance MVP

Sí entra:
- sitio público,
- catálogo de clases,
- detalle de clase,
- reservas,
- checkout,
- dashboard de cliente,
- dashboard admin,
- leads,
- ventas,
- membresías,
- paquetes,
- wellness kitchen,
- mock data centralizada,
- i18n preparada para es/en.

No entra:
- dashboard de instructor,
- marketplace de instructores,
- multi-sucursal real,
- contabilidad/facturación avanzada,
- app móvil nativa.

## 4. Backend truth

La plataforma usará **Appwrite** como backend principal.

Servicios previstos:
- Auth
- Databases
- Storage
- Functions

Control de acceso:
- usuarios internos mediante Appwrite Auth + labels,
- separación por `root`, `admin`, `customer`,
- operaciones sensibles por Functions,
- escritura pública sensible evitada desde el frontend directo.

## 5. Internacionalización

Aunque el producto inicial se mostrará en español, el proyecto debe nacer con i18n ordenada y escalable.

Idiomas previstos:
- `es`
- `en`

## 6. Mock data

Durante la fase inicial se podrá usar mock data, pero:
- toda la mock data debe vivir en una carpeta central,
- la UI debe consumirla como si fuera respuesta del backend,
- no debe haber arrays hardcoded dentro de componentes.
