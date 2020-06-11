

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;



SET default_tablespace = '';

SET default_table_access_method = heap;



CREATE TABLE public.Act_Diarias (
    ID_act character varying(6) NOT NULL,
    nombre_pro character varying(50) NOT NULL,
    act_realizada character varying(60) NOT NULL,
    fecha_act timestamp without time zone NOT NULL,
    cant_tiempo_act timestamp without time zone NOT NULL,
    Historia_Usuario_ID_historia smallint NOT NULL
);


ALTER TABLE public.Act_Diarias OWNER TO postgres;



CREATE TABLE public.CLIENTE (
    USERNAME character varying(25) NOT NULL,
    ID_cliente integer NOT NULL
);


ALTER TABLE public.CLIENTE OWNER TO postgres;



CREATE TABLE public.CONTROLHABXEMP (
    EMPLEADOS_USERNAME character varying(25) NOT NULL,
    Control_Hab_ID_hab character varying(6) NOT NULL
);


ALTER TABLE public.CONTROLHABXEMP OWNER TO postgres;



CREATE TABLE public.Control_Hab (
    ID_hab character varying(6) NOT NULL,
    nombre_hab character varying(50) NOT NULL,
    DESCRIPCION text
);


ALTER TABLE public.Control_Hab OWNER TO postgres;



CREATE TABLE public.EMPLEADOS (
    USERNAME character varying(25) NOT NULL,
    ID_emp integer NOT NULL,
    fecha_contratacion timestamp without time zone NOT NULL,
    Puesto_Trabajo_ID_puesto character varying(6) NOT NULL,
    Equipos_ID_equipo character varying(6),
    SALARIO numeric(8,2) NOT NULL
);


ALTER TABLE public.EMPLEADOS OWNER TO postgres;



CREATE TABLE public.EMPXACT (
    EMPLEADOS_USERNAME character varying(25) NOT NULL,
    Act_Diarias_ID_act character varying(6) NOT NULL
);


ALTER TABLE public.EMPXACT OWNER TO postgres;



CREATE TABLE public.EQUIPOS (
    ID_equipo character varying(6) NOT NULL
);


ALTER TABLE public.EQUIPOS OWNER TO postgres;



CREATE TABLE public.Historia_Usuario (
    ID_historia smallint NOT NULL,
    nombre_historia character varying(30) NOT NULL,
    PRIORIDAD character varying(10) NOT NULL,
    DESCRIPCION text,
    Cliente_ID_cliente integer NOT NULL,
    Proyecto_Aprobado_ID_proyecto smallint NOT NULL,
    Equipos_ID_equipo character varying(6) NOT NULL
);


ALTER TABLE public.Historia_Usuario OWNER TO postgres;

__
__ TOC entry 210 (class 1259 OID 16544)
__ Name: Historial_Puestos; Type: TABLE; Schema: proy; Owner: postgres
__

CREATE TABLE public.Historial_Puestos (
    fecha_asignacion timestamp without time zone NOT NULL,
    fecha_resignacion timestamp without time zone NOT NULL,
    Empleados_ID_emp integer NOT NULL
);


ALTER TABLE public.Historial_Puestos OWNER TO postgres;



CREATE TABLE public.MODULO (
    ID_modulo character varying(6) NOT NULL,
    nombre_modulo character varying(20) NOT NULL,
    ACCESO smallint NOT NULL
);


ALTER TABLE public.MODULO OWNER TO postgres;



CREATE TABLE public.PRIVILEGIOS (
    ID_priv smallint NOT NULL,
    nombre_priv character varying(25) NOT NULL,
    Modulo_ID_modulo character varying(6)
);


ALTER TABLE public.PRIVILEGIOS OWNER TO postgres;



CREATE TABLE public.PUESTOXHISTPUESTOS (
    Puesto_Trabajo_ID_puesto character varying(6) NOT NULL,
    Historial_Puestos_ID_emp integer NOT NULL
);


ALTER TABLE public.PUESTOXHISTPUESTOS OWNER TO postgres;



CREATE TABLE public.Proyecto_Aprobado (
    ID_proyecto smallint NOT NULL,
    pseudo_nombre character varying(20) NOT NULL,
    estado_proyecto character varying(15) NOT NULL,
    fecha_creacion timestamp without time zone NOT NULL,
    fecha_asignacion timestamp without time zone NOT NULL,
    fecha_entrega timestamp without time zone NOT NULL,
    repositorio_github character varying(200) NOT NULL,
    TRELLO character varying(200) NOT NULL,
    Equipos_ID_equipo character varying(6)
);


ALTER TABLE public.Proyecto_Aprobado OWNER TO postgres;



CREATE TABLE public.Puesto_Trabajo (
    ID_puesto character varying(6) NOT NULL,
    nombre_puesto character varying(50) NOT NULL
);


ALTER TABLE public.Puesto_Trabajo OWNER TO postgres;



CREATE TABLE public.ROL (
    ID_rol smallint NOT NULL,
    nombre_rol character varying(20) NOT NULL,
    fecha_creacion timestamp without time zone NOT NULL,
    USUARIO_USERNAME character varying(25) NOT NULL
);


ALTER TABLE public.ROL OWNER TO postgres;



CREATE TABLE public.ROLXPRIV (
    Rol_ID_rol smallint NOT NULL,
    Privilegios_ID_priv smallint NOT NULL
);


ALTER TABLE public.ROLXPRIV OWNER TO postgres;



CREATE TABLE public.Solicitud_Proyecto (
    ID_solicitud smallint NOT NULL,
    nombre_pro character varying(50) NOT NULL,
    DESCRIPCION text NOT NULL,
    estado_solicitud character varying(10) NOT NULL,
    Cliente_ID_cliente integer,
    Proyecto_Aprobado_ID_proyecto smallint NOT NULL
);


ALTER TABLE public.Solicitud_Proyecto OWNER TO postgres;



CREATE TABLE public.TELEFONOS (
    numero_tel integer NOT NULL,
    USUARIO_USERNAME character varying(25) NOT NULL
);


ALTER TABLE public.TELEFONOS OWNER TO postgres;



CREATE TABLE public.USUARIO (
    USERNAME character varying(25) NOT NULL,
    PASSWORD character varying(25) NOT NULL,
    NOMBRE character varying(25) NOT NULL,
    APELLIDO character varying(25) NOT NULL,
    fecha_nacimiento timestamp without time zone NOT NULL,
    EMAIL character varying(70) NOT NULL,
    direc_pais character varying(50) NOT NULL,
    direc_ciudad character varying(50) NOT NULL,
    direc_calle character varying(70) NOT NULL,
    TIPO character varying(10) NOT NULL
);


ALTER TABLE public.USUARIO OWNER TO postgres;





ALTER TABLE ONLY public.Act_Diarias
    ADD CONSTRAINT Act_Diarias_PK PRIMARY KEY (ID_act);




ALTER TABLE ONLY public.CLIENTE
    ADD CONSTRAINT CLIENTE_PK PRIMARY KEY (USERNAME);




ALTER TABLE ONLY public.CONTROLHABXEMP
    ADD CONSTRAINT CONTROLHABXEMP_PK PRIMARY KEY (Control_Hab_ID_hab, EMPLEADOS_USERNAME);



ALTER TABLE ONLY public.Control_Hab
    ADD CONSTRAINT Control_Hab_PK PRIMARY KEY (ID_hab);




ALTER TABLE ONLY public.EMPLEADOS
    ADD CONSTRAINT EMPLEADOS_PK PRIMARY KEY (USERNAME);



ALTER TABLE ONLY public.EMPXACT
    ADD CONSTRAINT EMPXACT_PK PRIMARY KEY (EMPLEADOS_USERNAME, Act_Diarias_ID_act);




ALTER TABLE ONLY public.EQUIPOS
    ADD CONSTRAINT EQUIPOS_PK PRIMARY KEY (ID_equipo);




ALTER TABLE ONLY public.Historia_Usuario
    ADD CONSTRAINT Historia_Usuario_PK PRIMARY KEY (ID_historia);




ALTER TABLE ONLY public.Historial_Puestos
    ADD CONSTRAINT Historial_Puestos_PK PRIMARY KEY (Empleados_ID_emp);




ALTER TABLE ONLY public.MODULO
    ADD CONSTRAINT MODULO_PK PRIMARY KEY (ID_modulo);




ALTER TABLE ONLY public.PRIVILEGIOS
    ADD CONSTRAINT PRIVILEGIOS_PK PRIMARY KEY (ID_priv);




ALTER TABLE ONLY public.PUESTOXHISTPUESTOS
    ADD CONSTRAINT PUESTOXHISTPUESTOS_PK PRIMARY KEY (Puesto_Trabajo_ID_puesto, Historial_Puestos_ID_emp);




ALTER TABLE ONLY public.Proyecto_Aprobado
    ADD CONSTRAINT Proyecto_Aprobado_PK PRIMARY KEY (ID_proyecto);




ALTER TABLE ONLY public.Puesto_Trabajo
    ADD CONSTRAINT Puesto_Trabajo_PK PRIMARY KEY (ID_puesto);




ALTER TABLE ONLY public.ROLXPRIV
    ADD CONSTRAINT ROLXPRIV_PK PRIMARY KEY (Privilegios_ID_priv, Rol_ID_rol);




ALTER TABLE ONLY public.ROL
    ADD CONSTRAINT ROL_PK PRIMARY KEY (ID_rol);




ALTER TABLE ONLY public.Solicitud_Proyecto
    ADD CONSTRAINT Solicitud_Proyecto_PK PRIMARY KEY (ID_solicitud);




ALTER TABLE ONLY public.TELEFONOS
    ADD CONSTRAINT TELEFONOS_PK PRIMARY KEY (USUARIO_USERNAME);




ALTER TABLE ONLY public.USUARIO
    ADD CONSTRAINT USUARIO_PK PRIMARY KEY (USERNAME);




CREATE UNIQUE INDEX CLIENTE_PKV100000 ON public.CLIENTE USING btree (ID_cliente);




CREATE UNIQUE INDEX EMPLEADOS_PKV100000 ON public.EMPLEADOS USING btree (ID_emp);




CREATE UNIQUE INDEX Solicitud_Proyecto__IDX00000 ON public.Solicitud_Proyecto USING btree (Proyecto_Aprobado_ID_proyecto);




