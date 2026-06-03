--
-- PostgreSQL database dump
--

\restrict yJrjQAUwgTeTJBcnQPECLExSZ0mXBfftrLAmgPaM5MGPnPAoMEw929e7ccGG88e

-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

-- Started on 2026-05-13 02:39:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 233 (class 1259 OID 18360)
-- Name: Checkin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Checkin" (
    id integer NOT NULL,
    slot_reg_id integer NOT NULL,
    checked_in_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    checked_by_user_id integer NOT NULL
);


ALTER TABLE public."Checkin" OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 18359)
-- Name: Checkin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Checkin_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Checkin_id_seq" OWNER TO postgres;

--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 232
-- Name: Checkin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Checkin_id_seq" OWNED BY public."Checkin".id;


--
-- TOC entry 235 (class 1259 OID 18368)
-- Name: Enrollment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Enrollment" (
    id integer NOT NULL,
    period_id integer NOT NULL,
    project_id integer NOT NULL,
    student_user_id integer NOT NULL,
    accepted_rules boolean DEFAULT false NOT NULL,
    receipt_signature text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Enrollment" OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 18367)
-- Name: Enrollment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Enrollment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Enrollment_id_seq" OWNER TO postgres;

--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 234
-- Name: Enrollment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Enrollment_id_seq" OWNED BY public."Enrollment".id;


--
-- TOC entry 223 (class 1259 OID 18311)
-- Name: FairPeriod; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FairPeriod" (
    id integer NOT NULL,
    name text NOT NULL,
    starts_at timestamp(3) without time zone NOT NULL,
    ends_at timestamp(3) without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public."FairPeriod" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 18310)
-- Name: FairPeriod_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."FairPeriod_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FairPeriod_id_seq" OWNER TO postgres;

--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 222
-- Name: FairPeriod_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."FairPeriod_id_seq" OWNED BY public."FairPeriod".id;


--
-- TOC entry 221 (class 1259 OID 18301)
-- Name: Organization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Organization" (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Organization" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 18300)
-- Name: Organization_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Organization_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Organization_id_seq" OWNER TO postgres;

--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 220
-- Name: Organization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Organization_id_seq" OWNED BY public."Organization".id;


--
-- TOC entry 225 (class 1259 OID 18321)
-- Name: Project; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Project" (
    id integer NOT NULL,
    org_id integer NOT NULL,
    period_id integer NOT NULL,
    name text NOT NULL,
    description text,
    rules_text text,
    capacity integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    accredited_hours integer,
    duration text,
    location text
);


ALTER TABLE public."Project" OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 18379)
-- Name: ProjectCode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProjectCode" (
    id integer NOT NULL,
    project_id integer NOT NULL,
    code_hash text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    issued_by integer NOT NULL,
    used_by_student_id integer,
    used_at timestamp(3) without time zone
);


ALTER TABLE public."ProjectCode" OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 18378)
-- Name: ProjectCode_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ProjectCode_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProjectCode_id_seq" OWNER TO postgres;

--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 236
-- Name: ProjectCode_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ProjectCode_id_seq" OWNED BY public."ProjectCode".id;


--
-- TOC entry 226 (class 1259 OID 18330)
-- Name: ProjectSocioUser; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProjectSocioUser" (
    project_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public."ProjectSocioUser" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 18320)
-- Name: Project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Project_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Project_id_seq" OWNER TO postgres;

--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 224
-- Name: Project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Project_id_seq" OWNED BY public."Project".id;


--
-- TOC entry 231 (class 1259 OID 18352)
-- Name: SlotRegistration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SlotRegistration" (
    id integer NOT NULL,
    slot_id integer NOT NULL,
    student_user_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SlotRegistration" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 18351)
-- Name: SlotRegistration_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SlotRegistration_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SlotRegistration_id_seq" OWNER TO postgres;

--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 230
-- Name: SlotRegistration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SlotRegistration_id_seq" OWNED BY public."SlotRegistration".id;


--
-- TOC entry 227 (class 1259 OID 18335)
-- Name: Student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Student" (
    user_id integer NOT NULL,
    matricula text NOT NULL,
    full_name text NOT NULL,
    phone text,
    apellidos text,
    carrera text,
    correo_personal text,
    hora_registro text
);


ALTER TABLE public."Student" OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 18343)
-- Name: TimeSlot; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TimeSlot" (
    id integer NOT NULL,
    period_id integer NOT NULL,
    starts_at timestamp(3) without time zone NOT NULL,
    ends_at timestamp(3) without time zone NOT NULL,
    capacity integer NOT NULL,
    location text NOT NULL
);


ALTER TABLE public."TimeSlot" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 18342)
-- Name: TimeSlot_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TimeSlot_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TimeSlot_id_seq" OWNER TO postgres;

--
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 228
-- Name: TimeSlot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TimeSlot_id_seq" OWNED BY public."TimeSlot".id;


--
-- TOC entry 219 (class 1259 OID 18290)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    username text,
    password_hash text NOT NULL,
    role text NOT NULL,
    org_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 18289)
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 218
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- TOC entry 217 (class 1259 OID 18280)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 4808 (class 2604 OID 18363)
-- Name: Checkin id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Checkin" ALTER COLUMN id SET DEFAULT nextval('public."Checkin_id_seq"'::regclass);


--
-- TOC entry 4810 (class 2604 OID 18371)
-- Name: Enrollment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enrollment" ALTER COLUMN id SET DEFAULT nextval('public."Enrollment_id_seq"'::regclass);


--
-- TOC entry 4801 (class 2604 OID 18314)
-- Name: FairPeriod id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FairPeriod" ALTER COLUMN id SET DEFAULT nextval('public."FairPeriod_id_seq"'::regclass);


--
-- TOC entry 4799 (class 2604 OID 18304)
-- Name: Organization id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Organization" ALTER COLUMN id SET DEFAULT nextval('public."Organization_id_seq"'::regclass);


--
-- TOC entry 4803 (class 2604 OID 18324)
-- Name: Project id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project" ALTER COLUMN id SET DEFAULT nextval('public."Project_id_seq"'::regclass);


--
-- TOC entry 4813 (class 2604 OID 18382)
-- Name: ProjectCode id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectCode" ALTER COLUMN id SET DEFAULT nextval('public."ProjectCode_id_seq"'::regclass);


--
-- TOC entry 4806 (class 2604 OID 18355)
-- Name: SlotRegistration id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SlotRegistration" ALTER COLUMN id SET DEFAULT nextval('public."SlotRegistration_id_seq"'::regclass);


--
-- TOC entry 4805 (class 2604 OID 18346)
-- Name: TimeSlot id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TimeSlot" ALTER COLUMN id SET DEFAULT nextval('public."TimeSlot_id_seq"'::regclass);


--
-- TOC entry 4796 (class 2604 OID 18293)
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- TOC entry 5020 (class 0 OID 18360)
-- Dependencies: 233
-- Data for Name: Checkin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Checkin" (id, slot_reg_id, checked_in_at, checked_by_user_id) FROM stdin;
\.


--
-- TOC entry 5022 (class 0 OID 18368)
-- Dependencies: 235
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Enrollment" (id, period_id, project_id, student_user_id, accepted_rules, receipt_signature, created_at) FROM stdin;
177	4	9	52	f	\N	2026-05-13 07:39:40.743
1	4	23	0	f	\N	2026-05-13 02:51:22.052
2	5	32	1	f	\N	2026-05-13 02:51:22.055
3	6	11	2	f	\N	2026-05-13 02:51:22.057
4	3	62	3	f	\N	2026-05-13 02:51:22.059
5	4	36	4	f	\N	2026-05-13 02:51:22.06
6	5	29	5	f	\N	2026-05-13 02:51:22.061
7	6	37	6	f	\N	2026-05-13 02:51:22.063
8	3	14	7	f	\N	2026-05-13 02:51:22.064
9	4	48	8	f	\N	2026-05-13 02:51:22.065
10	5	50	9	f	\N	2026-05-13 02:51:22.066
11	6	67	10	f	\N	2026-05-13 02:51:22.067
12	3	32	11	f	\N	2026-05-13 02:51:22.072
13	4	40	12	f	\N	2026-05-13 02:51:22.073
14	5	51	13	f	\N	2026-05-13 02:51:22.074
15	6	56	14	f	\N	2026-05-13 02:51:22.075
16	3	35	15	f	\N	2026-05-13 02:51:22.075
17	4	30	16	f	\N	2026-05-13 02:51:22.076
18	5	55	17	f	\N	2026-05-13 02:51:22.077
19	6	64	18	f	\N	2026-05-13 02:51:22.079
20	3	49	19	f	\N	2026-05-13 02:51:22.08
21	4	6	20	f	\N	2026-05-13 02:51:22.081
22	5	47	21	f	\N	2026-05-13 02:51:22.082
23	6	39	22	f	\N	2026-05-13 02:51:22.084
24	3	67	23	f	\N	2026-05-13 02:51:22.085
25	4	29	24	f	\N	2026-05-13 02:51:22.086
26	5	55	25	f	\N	2026-05-13 02:51:22.087
27	6	69	26	f	\N	2026-05-13 02:51:22.088
28	3	10	27	f	\N	2026-05-13 02:51:22.089
29	4	27	28	f	\N	2026-05-13 02:51:22.09
30	5	46	29	f	\N	2026-05-13 02:51:22.09
31	6	21	30	f	\N	2026-05-13 02:51:22.091
32	3	35	31	f	\N	2026-05-13 02:51:22.092
33	4	69	32	f	\N	2026-05-13 02:51:22.093
34	5	22	33	f	\N	2026-05-13 02:51:22.094
35	6	38	34	f	\N	2026-05-13 02:51:22.095
36	3	67	35	f	\N	2026-05-13 02:51:22.096
37	4	36	36	f	\N	2026-05-13 02:51:22.097
38	5	44	37	f	\N	2026-05-13 02:51:22.099
39	6	28	38	f	\N	2026-05-13 02:51:22.099
40	3	24	39	f	\N	2026-05-13 02:51:22.1
41	4	53	40	f	\N	2026-05-13 02:51:22.101
42	5	70	41	f	\N	2026-05-13 02:51:22.102
43	6	30	42	f	\N	2026-05-13 02:51:22.104
44	3	57	43	f	\N	2026-05-13 02:51:22.105
45	4	13	44	f	\N	2026-05-13 02:51:22.106
46	5	3	45	f	\N	2026-05-13 02:51:22.108
47	6	2	46	f	\N	2026-05-13 02:51:22.11
48	3	14	47	f	\N	2026-05-13 02:51:22.112
49	4	44	48	f	\N	2026-05-13 02:51:22.114
50	5	35	49	f	\N	2026-05-13 02:51:22.116
51	6	55	50	f	\N	2026-05-13 02:51:22.118
52	3	62	51	f	\N	2026-05-13 02:51:22.12
53	4	22	52	f	\N	2026-05-13 02:51:22.121
54	5	13	53	f	\N	2026-05-13 02:51:22.122
55	6	17	54	f	\N	2026-05-13 02:51:22.123
56	3	44	55	f	\N	2026-05-13 02:51:22.125
57	4	4	56	f	\N	2026-05-13 02:51:22.126
58	5	68	57	f	\N	2026-05-13 02:51:22.127
59	6	70	58	f	\N	2026-05-13 02:51:22.129
60	3	17	59	f	\N	2026-05-13 02:51:22.13
61	4	59	60	f	\N	2026-05-13 02:51:22.132
62	5	33	61	f	\N	2026-05-13 02:51:22.134
63	6	34	62	f	\N	2026-05-13 02:51:22.136
64	3	71	63	f	\N	2026-05-13 02:51:22.138
65	4	47	64	f	\N	2026-05-13 02:51:22.14
66	5	57	65	f	\N	2026-05-13 02:51:22.141
67	6	58	66	f	\N	2026-05-13 02:51:22.142
68	3	57	67	f	\N	2026-05-13 02:51:22.144
69	4	15	68	f	\N	2026-05-13 02:51:22.145
70	5	21	69	f	\N	2026-05-13 02:51:22.147
71	6	20	70	f	\N	2026-05-13 02:51:22.148
72	3	38	71	f	\N	2026-05-13 02:51:22.15
73	4	14	72	f	\N	2026-05-13 02:51:22.152
74	5	42	73	f	\N	2026-05-13 02:51:22.153
75	6	46	74	f	\N	2026-05-13 02:51:22.155
76	3	72	75	f	\N	2026-05-13 02:51:22.157
77	4	4	76	f	\N	2026-05-13 02:51:22.158
78	5	26	77	f	\N	2026-05-13 02:51:22.16
79	6	2	78	f	\N	2026-05-13 02:51:22.161
80	3	41	79	f	\N	2026-05-13 02:51:22.163
81	4	71	80	f	\N	2026-05-13 02:51:22.164
82	5	24	81	f	\N	2026-05-13 02:51:22.165
83	6	64	82	f	\N	2026-05-13 02:51:22.166
84	3	59	83	f	\N	2026-05-13 02:51:22.168
85	4	59	84	f	\N	2026-05-13 02:51:22.169
86	5	2	85	f	\N	2026-05-13 02:51:22.17
87	6	25	86	f	\N	2026-05-13 02:51:22.171
88	3	44	87	f	\N	2026-05-13 02:51:22.172
89	4	41	88	f	\N	2026-05-13 02:51:22.173
90	5	44	89	f	\N	2026-05-13 02:51:22.175
91	6	21	90	f	\N	2026-05-13 02:51:22.176
92	3	32	91	f	\N	2026-05-13 02:51:22.178
93	4	32	92	f	\N	2026-05-13 02:51:22.18
94	5	18	93	f	\N	2026-05-13 02:51:22.181
95	6	52	94	f	\N	2026-05-13 02:51:22.182
96	3	27	95	f	\N	2026-05-13 02:51:22.184
97	4	27	96	f	\N	2026-05-13 02:51:22.186
98	5	52	97	f	\N	2026-05-13 02:51:22.188
99	6	35	98	f	\N	2026-05-13 02:51:22.189
100	3	26	99	f	\N	2026-05-13 02:51:22.19
101	4	18	100	f	\N	2026-05-13 02:51:22.191
102	5	19	149	f	\N	2026-05-13 02:51:22.192
103	6	19	152	f	\N	2026-05-13 02:51:22.192
104	3	32	15	f	\N	2026-05-13 04:27:11.426
120	3	32	31	f	\N	2026-05-13 04:27:11.468
136	3	32	49	f	\N	2026-05-13 04:27:11.505
146	5	28	61	f	\N	2026-05-13 04:27:11.526
176	3	32	98	f	\N	2026-05-13 04:27:11.576
\.


--
-- TOC entry 5010 (class 0 OID 18311)
-- Dependencies: 223
-- Data for Name: FairPeriod; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FairPeriod" (id, name, starts_at, ends_at, is_active) FROM stdin;
1	Periodo por Defecto 2026	2026-05-13 02:50:48.94	2026-11-13 02:50:48.94	t
2	Periodo por Defecto 2026	2026-05-13 02:51:21.242	2026-11-13 02:51:21.242	t
3	Invierno	2025-12-01 00:00:00	2026-02-28 00:00:00	t
4	Verano	2026-06-01 00:00:00	2026-08-31 00:00:00	t
5	Ago-Dic	2025-08-01 00:00:00	2025-12-31 00:00:00	t
6	Ene-Jul	2026-01-01 00:00:00	2026-07-31 00:00:00	t
\.


--
-- TOC entry 5008 (class 0 OID 18301)
-- Dependencies: 221
-- Data for Name: Organization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Organization" (id, name, created_at) FROM stdin;
0	Centro de Autonomía Personal y Social (CAPYS A.C.)	2026-05-13 02:50:49.077
1	CEPI (Comunidad Educativa y Psicopedagógica Integral)	2026-05-13 02:50:49.097
2	Clinica Mexicana de Autismo y Alteraciones del Desarrollo A.C.	2026-05-13 02:50:49.1
3	Escuela Primaria de Tiempo Completo Somalia	2026-05-13 02:50:49.102
4	Escuela Primaria Niger	2026-05-13 02:50:49.103
5	Florecer Casa Hogar A.C	2026-05-13 02:50:49.105
6	Planta Física CCM	2026-05-13 02:50:49.107
7	Prevención del Delito, Policía de Proximidad de la Comisaría de El Salto	2026-05-13 02:50:49.108
8	Tus buenas noticias IAP	2026-05-13 02:50:49.11
9	Ampre	2026-05-13 02:50:49.111
10	Asociación Mexicana de la Enfermedad de Huntington I.A.P.	2026-05-13 02:50:49.113
13	Casa de Estudios, Investigación y promoción del Buen vivir Pjoxante A.C.	2026-05-13 02:50:49.114
14	Centro de Estudios para el Desarrollo Rural (CESDER)	2026-05-13 02:50:49.116
15	Centros de Integración Juvenil, Tlalpan 	2026-05-13 02:50:49.118
16	Coordinación General del Subsistema de Educación Comunitaria "PILARES"	2026-05-13 02:50:49.119
17	De Aprendices Para Aprendices (DAPA)	2026-05-13 02:50:49.12
19	Distrito Tlalpan\n	2026-05-13 02:50:49.122
20	Escuela Primaria Estado de San Luis Potosí	2026-05-13 02:50:49.123
21	Escuela Primaria Ucrania	2026-05-13 02:50:49.125
22	Pilares San Marcos	2026-05-13 02:50:49.126
23	Promoción y Acción Comunitaria I.A.P	2026-05-13 02:50:49.128
24	Tecnológico de Monterrey	2026-05-13 02:50:49.129
25	Unidos somos iguales	2026-05-13 02:50:49.131
26	Asociación Mexicana de Parkinson, A.C.	2026-05-13 02:50:49.133
27	Asociación para Leer Escuchar Escribir y Recrear A.C. (iBbY México)	2026-05-13 02:50:49.134
28	Campamentos Tecnológico de Monterrey , CCM	2026-05-13 02:50:49.136
29	Compostec	2026-05-13 02:50:49.137
30	Conectadas, Mujeres por Más Mujeres, A.C.	2026-05-13 02:50:49.138
31	Contagiando Voluntad	2026-05-13 02:50:49.139
32	Deportivo Tolentino	2026-05-13 02:50:49.141
33	Dianui AC	2026-05-13 02:50:49.143
34	Domus Music	2026-05-13 02:50:49.144
35	Fucam, A.C	2026-05-13 02:50:49.146
36	Fundación Bull and Bear 	2026-05-13 02:50:49.147
37	Fundación Espera la Primavera A.C.	2026-05-13 02:50:49.149
38	Fundación Renacimiento de Apoyo a la Infancia que Labora, Estudia y Supera IAP	2026-05-13 02:50:49.151
39	Fundación Sue Aguayo A.C	2026-05-13 02:50:49.152
40	Instituto Mexicano del Seguro Social	2026-05-13 02:50:49.153
41	México sin sordera A.C.	2026-05-13 02:50:49.154
42	Prepanet	2026-05-13 02:50:49.156
43	Red para la Restauración Integral y Familiar A.C (RIFAC) 	2026-05-13 02:50:49.158
44	Tecnológico de Monterrey & Departamento Geoespacial del MIT	2026-05-13 02:50:49.16
45	Un Techo para mi país México\n	2026-05-13 02:50:49.161
46	Una Mirada Rett A.C.	2026-05-13 02:50:49.163
47	Vive Planeta	2026-05-13 02:50:49.164
\.


--
-- TOC entry 5012 (class 0 OID 18321)
-- Dependencies: 225
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Project" (id, org_id, period_id, name, description, rules_text, capacity, is_active, accredited_hours, duration, location) FROM stdin;
10	8	5	Speak Up: transformando la ciudad con buenas noticias	asd	\N	14	t	60	3 semanas	jeje
11	9	6	Reto Maiasa	\N	\N	15	t	100	5 semanas	\N
13	10	4	¿Quieres divertirte creando medios de difusión (videos, carteles, flyers, documental), para dar a conocer la organización  y su causa?	\N	\N	10	t	100	5 semanas	\N
14	0	5	¡Diseños de comunicación colectiva!	\N	\N	10	t	100	5 semanas	\N
15	0	6	Proyecto: Bachillerato integral comunitario	\N	\N	11	t	100	5 semanas	\N
21	15	4	Prevención de adicciones y salud mental	\N	\N	14	t	100	5 semanas	\N
22	16	5	Educación comunitaria	\N	\N	12	t	100	5 semanas	\N
23	17	6	¡Mejora tu Inglés, compartiendo lo que Sabes!	\N	\N	15	t	100	5 semanas	\N
24	17	3	¡Viaja a otros mundos en estas vacaciones con nuestros retos lectores!	\N	\N	12	t	100	5 semanas	\N
26	0	5	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (Meditación y Mindfulness)	\N	\N	11	t	100	5 semanas	\N
27	19	6	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (RITMOS LATINOS)\n	\N	\N	15	t	100	5 semanas	\N
28	19	3	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (INGLÉS)\n	\N	\N	13	t	100	5 semanas	\N
35	19	6	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (CAPACITACIÓN TECNOLÓGICA)\n	\N	\N	13	t	100	5 semanas	\N
30	19	5	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (INGLÉS AMSA)\n	\N	\N	14	t	100	5 semanas	\N
31	19	6	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (YOGA)\n	\N	\N	12	t	100	5 semanas	\N
33	19	4	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (INGLÉS)\n	\N	\N	13	t	100	5 semanas	\N
37	21	4	Taller de matemáticas.	\N	\N	12	t	100	5 semanas	\N
29	19	4	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (Fútbol)\n	\N	\N	15	t	100	5 semanas	\N
6	4	5	Educación de calidad para la comunidad	\N	\N	10	t	60	3 semanas	\N
34	19	5	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (RITMOS LATINOS)	\N	\N	15	t	100	5 semanas	\N
36	20	3	¡Mejoramos la educación con tu ayuda!	\N	\N	14	t	100	5 semanas	\N
38	21	5	Aprender a apoyar, taller de lectura y escritura y taller de Matemáticas.	\N	\N	13	t	100	5 semanas	\N
39	21	6	Aprender a apoyar	\N	\N	12	t	100	5 semanas	\N
40	22	3	Educación en comunidad	\N	\N	14	t	100	5 semanas	\N
41	23	4	Semillas del cambio	\N	\N	12	t	100	5 semanas	\N
42	24	5	Biotecnología	\N	\N	13	t	100	5 semanas	\N
44	9	3	Lideres del "Reto Maiasa"	\N	\N	12	t	200	5 semanas	\N
45	9	4	Persona Integrada, Sociedad Inclusiva	\N	\N	12	t	200	5 semanas	\N
47	27	6	Aventuras palabrescas en la biblioteca	\N	\N	13	t	200	5 semanas	\N
48	27	3	Verano palabresco en la biblioteca, Xochimilco	\N	\N	10	t	200	5 semanas	\N
49	28	4	Campamentos Tecnológico de Monterrey 	\N	\N	12	t	0	Campus CCM	\N
50	29	5	Compostec	\N	\N	11	t	200	5 semanas	\N
52	31	3	Contagiando Voluntad	\N	\N	13	t	200	5 semanas	\N
55	34	6	Los Rockstars del Pueblo	\N	\N	14	t	200	5 semanas	\N
56	35	3	-\tConstruyendo soluciones para FUCAM	\N	\N	14	t	200	5 semanas	\N
57	36	4	Bull & Bear y el Poder de Leer	\N	\N	11	t	200	5 semanas	\N
58	37	5	Ecos de Primavera	\N	\N	10	t	200	5 semanas	\N
59	37	6	Sombras de Primavera 	\N	\N	11	t	200	5 semanas	\N
61	38	4	Mi Renacimiento, ejerciendo mis derechos	\N	\N	12	t	200	5 semanas	\N
63	39	6	Tu éxito financiero.	\N	\N	15	t	200	5 semanas	\N
64	40	3	Incorporación de Personas Trabajadoras Independientes y Personas Trabajadoras del Hogar	\N	\N	14	t	200	5 semanas	\N
65	41	4	Voces de impacto: Historias que conectan. 	\N	\N	14	t	200	5 semanas	\N
66	41	5	Conectando con el sonido. 	\N	\N	11	t	200	5 semanas	\N
67	6	6	Campus sostenible	\N	\N	14	t	200	5 semanas	\N
68	42	3	Tutor Prepanet	\N	\N	10	t	200	5 semanas	\N
69	43	4	Inspira Comunicaciones 	\N	\N	10	t	200	5 semanas	\N
71	45	6	Juventudes en acción para superar la pobreza 	\N	\N	10	t	200	5 semanas	\N
72	46	3	Construyendo una Rett de apoyo para las infancias	\N	\N	14	t	200	5 semanas	\N
73	47	4	Cambiando el mundo desde tu trinchera	\N	\N	13	t	200	5 semanas	\N
0	0	3	Vida Independiente para personas con discapacidad intelectual	\N	\N	14	t	60	3 semanas	\N
1	0	4	Vida plena e inclusiva: Empoderando capacidades	\N	\N	10	t	60	3 semanas	\N
5	3	4	Organizando un nuevo ciclo escolar 2025-2026	\N	\N	14	t	60	3 semanas	\N
2	0	5	Vida plena e inclusiva: Transición a la vida adulta	\N	\N	15	t	60	3 semanas	\N
3	1	6	Manejo de redes y apoyo en la inclusión de personas con discapacidad	\N	\N	12	t	60	3 semanas	\N
16	0	3	Sonidos que unen: Acercando la música a las comunidades	\N	\N	15	t	100	5 semanas	\N
17	0	4	¡Haz comunidad! (Marketing digital)	\N	\N	15	t	100	5 semanas	\N
18	0	5	"Manos a la Obra: Transformando Comunidades"	\N	\N	12	t	100	5 semanas	\N
19	13	6	Cartografías: editorial comunitaria	\N	\N	12	t	100	5 semanas	\N
9	7	4	Cultura de paz como restitución rumana	\N	\N	12	t	60	3 semanas	\N
8	6	3	Comer en un lugar limpio, es comer bien.	\N	\N	11	t	60	3 semanas	\N
60	37	3	Primavera en el Aula	\N	\N	14	t	200	5 semanas	\N
62	39	5	El éxito también es tuyo; Podcast y capsulas de desarrollo personal	\N	\N	13	t	200	5 semanas	\N
70	44	5	Patrones Hermosos Tec de Monterrey by Departamento Geoespacial del MIT	\N	\N	14	t	200	5 semanas	\N
75	0	3	Vida Independiente para personas con discapacidad intelectual	Contribuir a la calidad de los servicios que CAPYS proporciona a las personas con discapacidad. 	\N	10	t	60	3 semanas hasta 60 hrs	CAPYS VALLE: \r\nPilares 310, Col. Del Valle, Alcaldía Benito Juárez, C.P. 03100 CDMX \r\nCAPYS SUR:\r\nCamino a Santa Teresa #890 Torre 2, Dpto 101, Magdalena Contreras. 
76	0	4	Vida plena e inclusiva: Empoderando capacidades	Fomentar la inclusión y autodeterminación de personas con discapacidad intelectual.	\N	10	t	60	3 semanas hasta 60 hrs	 Instituto Tlalpan: \r\nCuitláhuac #15, Colonia Toriello Guerra Frente al parque Cuauhtémoc\r\nPuerta 1
77	0	5	Vida plena e inclusiva: Transición a la vida adulta	Fomentar la inclusión y autodeterminación de personas con discapacidad intelectual.	\N	4	t	60	3 semanas hasta 60 hrs	Construyendo Puentes UIC\r\nAv. Insurgentes Sur, Calz. de Tlalpan 4303, Sta Úrsula Xitla,\r\n14420 Ciudad de México, CDMX
78	1	6	Manejo de redes y apoyo en la inclusión de personas con discapacidad	Sensibilización a la población respecto a este sector educativo.	\N	5	t	60	3 semanas hasta 60 hrs	Mimosa 33, Olivar de los Padres, Álvaro Obregón, 01780, CDMX
79	2	3	Intervención psicoeducacional a niños, adolescentes y adultos con trastorno del  espectro autista.	Las personas con TEA necesitan sus terapias de forma continua para lograr sus objetivos.	\N	5	t	60	3 semanas hasta 60 hrs	Van Dick 66 colonia santamaria nonoalco alcaldia Benito Juarez CDMX
80	3	4	Organizando un nuevo ciclo escolar 2025-2026	Iniciar un nuevo ciclo escolar, preparando los materiales que  se emplearán al reanudar las clases.	\N	7	t	60	3 semanas hasta 60 hrs	Fortín 46, Unidad Habitacional Narciso Mendoza, Villa Coapa
81	3	5	Educación de calidad para la comunidad	Que los alumnos de primaria tengan un acercamiento a la educación integral.	\N	20	t	60	3 semanas hasta 60 hrs	El Torreón s/n Mz 7 Col. Villacoapa Alcaldía Tlalpan tel. 5551604564
82	5	6	Promoción de hábitos educativos y saludables en niños, niñas y adolescentes en situación de vulnerabilidad.	Fomentar hábitos de estudio, de orden y cultura de buentrato.	\N	10	t	60	3 semanas hasta 60 hrs	Pablo Veronés 89, Col. Alfonso XIII, Alvaro Obregón C.P 01460
83	6	3	Comer en un lugar limpio, es comer bien.	Concientizar, promover y  fomentar espacios limpios y de sana convivencia.	\N	30	t	60	3 semanas hasta 60 hrs	CCM
84	7	4	Cultura de paz como restitución rumana	Restitución Humana	\N	60	t	60	3 semanas hasta 60 hrs	Zoom
85	8	5	Speak Up: transformando la ciudad con buenas noticias	Lla reducción de la fatiga de información causada por noticias sensacionalistas.	\N	10	t	60	3 semanas hasta 60 hrs	Meet/Zoom  884 0068 5610
86	9	6	Reto Maiasa	Fomentar inclusión y autoconocimiento en jóvenes para una vida más consciente e interdependiente.	\N	100	t	100	5 semanas hasta 100 hrs	Online y Ampre (Ahuacan 8, Cantera Puente de Piedra, Tlalpan, 14040 Ciudad de México, CDMX)
87	10	3	¡Ven! Te invitamos a colaborar en el área administrativa y contable, para su sistematización.¿Te animas?	Fortalecimiento organizacional mediante la sistematización administrativa y contable.	\N	6	t	100	5 semanas hasta 100 hrs	CUAUHTEMOC 97, COL. TORIELLO GUERRA, TLALPAN, C.P. 14050 CDMX
7	5	6	Promoción de hábitos educativos y saludables en niños, niñas y adolescentes en situación de vulnerabilidad.	\N	\N	14	t	60	3 semanas	\N
74	3	5	Vida Independiente para personas con discapacidad intelectual	\N	\N	15	t	\N	\N	\N
4	2	3	Intervención psicoeducacional a niños, adolescentes y adultos con trastorno del  espectro autista.	\N	\N	11	t	60	3 semanas	\N
12	10	3	¡Ven! Te invitamos a colaborar en el área administrativa y contable, para su sistematización.¿Te animas?	\N	\N	13	t	100	5 semanas	\N
20	14	3	Ayuda a promover un Centro Educativo para el Desarrollo Rural en la Sierra Norte de Puebla	\N	\N	15	t	100	5 semanas	\N
25	0	4	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (TEJIDO)	\N	\N	11	t	100	5 semanas	\N
32	19	3	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (CAPACITACIÓN TECNOLÓGICA)\n	\N	\N	13	t	100	5 semanas	\N
43	25	6	Programa de inclusión:  Verano de Rol	\N	\N	12	t	100	5 semanas	\N
46	26	5	La unión y continuidad nos mueven hacia la meta.	\N	\N	15	t	200	5 semanas	\N
51	30	6	Conectadas: Estrategia de fundraising y fortalecimiento institucional por la igualdad de género en el ecosistema digital	\N	\N	13	t	200	5 semanas	\N
53	32	4	Apoyo a la ciudadanía por medio de cursos gratuitos.	\N	\N	11	t	200	5 semanas	\N
54	33	5	Programas de DiANUi : Distintivo L ( Lactancia), Distintivo Verde ( Huertos y Cocina) , DiANUi TeVe, Inicio Seguro, DiANUi 911, Dianui Educación Continua ( DEC)	\N	\N	15	t	200	5 semanas	\N
88	10	4	¿Quieres divertirte creando medios de difusión (videos, carteles, flyers, documental), para dar a conocer la organización  y su causa?	Que el alumno use su creatividad para elaborar contenido de impacto para sensibilizar a la sociedad.	\N	6	t	100	5 semanas hasta 100 hrs	cuauhtemoc 97 col. Toriello Guerra, Tlalpan c.p. 14050
89	13	5	¡Diseños de comunicación colectiva!	Crear materiales de comunicación con base en un diseño comunitario y creativo.	\N	15	t	100	5 semanas hasta 100 hrs	Pitágoras 567, Narvarte, CDMX
90	13	6	Proyecto: Bachillerato integral comunitario	Planear, diseñar y promover vinculaciones  para un proyecto de bachillerato integral comunitario.	\N	10	t	100	5 semanas hasta 100 hrs	Pitágoras #567 Col. Narvarte, CDMX
91	13	3	Sonidos que unen: Acercando la música a las comunidades	Fortalecer el vínculo con la población, promoviendo la cultura y el acceso a experiencias musicales.	\N	10	t	100	5 semanas hasta 100 hrs	Pitágoras #567, col. Narvarte, CDMX
92	13	4	¡Haz comunidad! (Marketing digital)	Colaborar en la difusión de procesos colectivos.	\N	20	t	100	5 semanas hasta 100 hrs	Pitagoras 567, Narvarte, CDMX
93	13	5	"Manos a la Obra: Transformando Comunidades"	Fomentar el desarrollo e implementación de proyectos que mejoren su calidad de vida. 	\N	10	t	100	5 semanas hasta 100 hrs	Pitágoras 567, Narvarte, CDMX
94	13	6	Cartografías: editorial comunitaria	Difundir publicaciones críticas de corte social y creativo para socializar temas de interés.	\N	10	t	100	5 semanas hasta 100 hrs	Pitágoras 567, col. Narvarte, CDMX
95	14	3	Ayuda a promover un Centro Educativo para el Desarrollo Rural en la Sierra Norte de Puebla	Fortalecer vínculos comunitarios para construir colectivamente una vida digna.	\N	8	t	100	5 semanas hasta 100 hrs	Tec de Monterrey CCM
96	15	4	Prevención de adicciones y salud mental	Elaboración de Contenido Audiovisual para redes sociales . 	\N	5	t	100	5 semanas hasta 100 hrs	Viad. Tlalpan, San Buenaventura, Tlalpan, 14629
97	16	5	Educación comunitaria	Reducir el rezago educativo.	\N	20	t	100	5 semanas hasta 100 hrs	Camino a la Ciénega S/N, Barrio 18, C.P. 16034, Alcaldía Xochimilco. 
98	17	6	¡Mejora tu Inglés, compartiendo lo que Sabes!	Ayudar a aprender los temas de inglés que se les dificulten y/o interesen de acuerdo a su nivel.	\N	10	t	100	5 semanas hasta 100 hrs	En línea
99	17	3	¡Viaja a otros mundos en estas vacaciones con nuestros retos lectores!	Ayudar a mejorar su hábito de lectura, logrando que lean 2 libros durante el mes de julio.	\N	10	t	100	5 semanas hasta 100 hrs	En línea
100	19	4	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (TEJIDO)	Fortalecer y generar vínuclos entre la comunidad vecinal.	\N	3	t	100	5 semanas hasta 100 hrs	(TENTATIVO)\r\nCasa del adulto mayor\r\nCarcamo, Canal de Miramontes esquina, Tlalpan, Ciudad de México, CDMX
101	19	5	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (Meditación y Mindfulness)	Fortalecer y generar vínuclos entre la comunidad vecinal.\r\n	\N	3	t	100	5 semanas hasta 100 hrs	(TENTATIVO) Parque el trébol\r\nClub Deportivo Atlas 35, Coapa, Villa Lázaro Cárdenas, Tlalpan, 14370 Ciudad de México, CDMX
102	19	6	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (RITMOS LATINOS)	Fortalecer y generar vínuclos entre la comunidad vecinal.\r\n	\N	3	t	100	5 semanas hasta 100 hrs	(TENTATIVO)\r\nCasa del adulto mayor\r\nCarcamo, Canal de Miramontes esquina, Tlalpan, Ciudad de México, CDMX\r\n
103	19	3	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (INGLÉS)	Fortalecer y generar vínuclos entre la comunidad vecinal.\r\n	\N	3	t	100	5 semanas hasta 100 hrs	"(TENTATIVO)\r\nCasa del adulto mayor\r\nCarcamo, Canal de Miramontes esquina, Tlalpan, Ciudad de México, CDM"\r\n
104	19	4	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (Fútbol)	Fortalecer y generar vínuclos entre la comunidad vecinal.\r\n	\N	3	t	100	5 semanas hasta 100 hrs	(TENTATIVO) Explanada Martin Torres Padilla\r\nCalle 4 & Pte. 1 Esquina Pte. 1, Amsa, Tlalpan, 14380 Ciudad de México, CDMX\r\n
105	19	5	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (INGLÉS AMSA)	Fortalecer y generar vínuclos entre la comunidad vecinal.\r\n	\N	3	t	100	5 semanas hasta 100 hrs	(TENTATIVO) Centro Comunitario AMSA\r\nCentral Sur n, Coapa, Amsa, Tlalpan, 14380 Ciudad de México, CDMX\r\n
106	19	6	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (YOGA)	Fortalecer y generar vínuclos entre la comunidad vecinal.\r\n	\N	3	t	100	5 semanas hasta 100 hrs	(TENTATIVO) Explanada Martín Torres Padilla\r\nCalle 4 & Pte. 1 Esquina Pte. 1, Amsa, Tlalpan, 14380 Ciudad de México, CDMX
107	19	3	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (CAPACITACIÓN TECNOLÓGICA)	Fortalecer y generar vínuclos entre la comunidad vecinal.\r\n	\N	3	t	100	5 semanas hasta 100 hrs	(TENTATIVO) Mesas sobre camellón de Av. Transmisones, casi frente a Parroquia María Inmaculada\r\nCoapa, Arboledas del Sur, Tlalpan, 14376 Ciudad de México, CDMX
108	19	4	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (INGLÉS)	Fortalecer y generar vínuclos entre la comunidad vecinal.\r\n	\N	3	t	100	5 semanas hasta 100 hrs	(TENTATIVO) Módulo Deportivo San Nicolás Tolentino\r\nHacienda San Nicolás Tolentino s/n, Coapa, Prado Coapa, Tlalpan, 14357 Ciudad de México, CDMX\r\n
109	19	5	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (RITMOS LATINOS)	Fortalecer y generar vínuclos entre la comunidad vecinal.\r\n	\N	3	t	100	5 semanas hasta 100 hrs	(TENTATIVO) Módulo Deportivo San Nicolás Tolentino\r\nHacienda San Nicolás Tolentino s/n, Coapa, Prado Coapa, Tlalpan, 14357 Ciudad de México, CDMX
110	19	6	Talleres vecinales - Programa Tejiendo Comunidad y Cuidando Nuestros Espacios Verdes (CAPACITACIÓN TECNOLÓGICA)	Fortalecer y generar vínuclos entre la comunidad vecinal.\r\n	\N	3	t	100	5 semanas hasta 100 hrs	(TENTATIVO) Plaza Roja del Camellón en Av. Transmisones\r\nCoapa, Villa Lázaro Cárdenas, Tlalpan, 14370 Ciudad de México, CDMX
111	3	3	¡Mejoramos la educación con tu ayuda!	Fortalecimiento de la labor docente.	\N	10	t	100	5 semanas hasta 100 hrs	ACUEDUCTO Y SAN JUAN BOSCO 39 SAN LORENZO HUIPULCO TLALPAN CDMX
112	3	4	Taller de matemáticas.	Adquirir habilidades para la resolución de operaciones básicas y problemas matemáticos.	\N	30	t	100	5 semanas hasta 100 hrs	ND. 62 DE AV. ACOXPA 63 NARCISO MENDOZA-VILLA COAPA, SUPER MANZANA 6 TLLALPAN, C.P. 14390.
113	3	5	Aprender a apoyar, taller de lectura y escritura y taller de Matemáticas.	Adquirir conocimiento, información y comprensión sobre diferentes temas. 	\N	30	t	100	5 semanas hasta 100 hrs	AND. 62 DE AV. ACOXPA N°63, NARCISO MENDOZA- VILLA COAPA, SUPER MANZANA 6, TLALPAN, C.P. 14390.
114	3	6	Aprender a apoyar	Escoge un momento y lugar apropiados para ofrecer apoyo.	\N	30	t	100	5 semanas hasta 100 hrs	AND. 62 DE AV. ACOXPA 63 NARCISO MENDOZA-VILLA COAPA, SUPER MANZANA 6 TLLALPAN, C.P. 14390.
115	22	3	Educación en comunidad	Disminuir el rezago educativo, las violencias y desigualdades.	\N	10	t	100	5 semanas hasta 100 hrs	Calle Olmos 135 Ampliación San Marcos Nte. 16038. Alcaldía Xochimilco.
116	23	4	Semillas del cambio	Contribuir al bienestar integral de los niños y adolescentes, mediante actividades solidarias.	\N	14	t	100	5 semanas hasta 100 hrs	Gral Lucio Blanco 32, Col. Revolución, Venustiano Carranza
117	24	5	Biotecnología	Llevar a cabo un programa de divulgación e investigación científica para el desarrollo social.	\N	20	t	100	5 semanas hasta 100 hrs	Edificio CIEE del TEC Campus Ciudad de México o a convenir con las y los estudiantes
118	25	6	Programa de inclusión:  Verano de Rol	Un cambio estructural de la sociedad desde el impacto que se genera con la inclusión.	\N	30	t	100	5 semanas hasta 100 hrs	Zona sur y poniente de la cdmx
119	9	3	Lideres del "Reto Maiasa"	Fomentar inclusión y autoconocimiento en jóvenes para una vida más consciente e interdependiente.	\N	10	t	200	5 semanas hasta 200 hrs	Online y Ampre (Ahuacan 8, Cantera Puente de Piedra, Tlalpan, 14040 Ciudad de México, CDMX)
120	9	4	Persona Integrada, Sociedad Inclusiva	Fomentar inclusión, independencia y participación social en personas con discapacidad.	\N	35	t	200	5 semanas hasta 200 hrs	Ahuacan 8, Cantera Puente de Piedra, Tlalpan, 14040 Ciudad de México, CDMX
121	10	5	La unión y continuidad nos mueven hacia la meta.	La consolidación, certeza y utilización adecuada de lo implementado y sus adecuaciones.	\N	10	t	200	5 semanas hasta 200 hrs	Avenida Emiliano Zapata 115, Colonia Portales, Ciudad de México
122	27	6	Aventuras palabrescas en la biblioteca	Favorecer el acceso de las infancias y adolescencias a materiales de lectura de calidad.	\N	15	t	200	5 semanas hasta 200 hrs	Mixcoac: Goya 54, Insurgentes Mixcoac, Benito Juárez, 03920 Ciudad de México, CDMX\r\nRoma-Condesa: Orizaba 37, Roma Nte., Cuauhtémoc, 06700 Ciudad de México, CDMX
123	27	3	Verano palabresco en la biblioteca, Xochimilco	Favorecer el acceso de las infancias y adolescencias a materiales de lectura de calidad.	\N	10	t	200	5 semanas hasta 200 hrs	Bunko Xochimilco:\r\nHorario: miércoles a domingo de 10 a 18 horas\r\nGustavo Díaz Ordaz 35, Pueblo San Gregorio Atlapulco, Xochimilco; 16600 Ciudad de México, CDMX
124	28	4	Campamentos Tecnológico de Monterrey	Implementar actividades planeadas para ayudar a niñas, niños y adolescentes en su formación integral para prevenir la obesidad infantil 	\N	45	t	2005	Campus CCM	PSP | Proyecto Solidario Presencial
125	29	5	Compostec	Darle a los alumnos del TEC una conciencia de consumo responsable.	\N	35	t	200	5 semanas hasta 200 hrs	Tecnológico de Monterrey 
126	30	6	Conectadas: Estrategia de fundraising y fortalecimiento institucional por la igualdad de género en el ecosistema digital	Fortalecer a Conectadas con estrategia institucional y financiera para impacto en igualdad de género.	\N	10	t	200	5 semanas hasta 200 hrs	En línea
127	31	3	Contagiando Voluntad	Mejorar la vida de personas vulnerables con acciones solidarias que fomenten dignidad e impacto.	\N	50	t	200	5 semanas hasta 200 hrs	Whatsapp y solo una vez durante todo el servicio en Parque México 
128	32	4	Apoyo a la ciudadanía por medio de cursos gratuitos.	Que los alumnos compartan sus conocimientos a la ciudadanía por medio de cursos gratuitos.	\N	15	t	200	5 semanas hasta 200 hrs	Hacienda San Nicolás Tolentino s/n, Coapa, Prado Coapa, Tlalpan, 14357 Ciudad de México, CDMX.
129	33	5	Programas de DiANUi : Distintivo L ( Lactancia), Distintivo Verde ( Huertos y Cocina) , DiANUi TeVe, Inicio Seguro, DiANUi 911, Dianui Educación Continua ( DEC)	Educación en Hábitos Saludables basados en las Guías Alimentarias 2023.	\N	30	t	200	5 semanas hasta 200 hrs	Virtual y visitas ocasionales a escuelas y casas hogar 
130	34	6	Los Rockstars del Pueblo	Empoderar a niños de comunidades vulnerables mediante la música e impartición de talleres.	\N	20	t	200	5 semanas hasta 200 hrs	Lázaro Cárdenas 118, San José Texopa, Texcoco
131	35	3	-\tConstruyendo soluciones para FUCAM	Observar, aprender y crear propuestas de mejora.	\N	2	t	200	5 semanas hasta 200 hrs	-\tAv. El Bordo 100, Coapa, Ejido Viejo de Sta. Úrsula Coapa, Coyoacán, CDMX (https://goo.gl/maps/gK2xuRdBZu66purk6)
132	36	4	Bull & Bear y el Poder de Leer	Crear un círculo de lectura con actividades lúdicas y creativas para infancias y juventudes.	\N	20	t	200	5 semanas hasta 200 hrs	Modalidad  virtual 
133	37	5	Ecos de Primavera	Visibilizar las necesidades de infantes en situación de vulnerabilidad y generar redes de apoyo.	\N	4	t	200	5 semanas hasta 200 hrs	En línea
134	37	6	Sombras de Primavera	Generar consciencia social, empatía y comunidad con poblaciones vulnerables. 	\N	5	t	200	5 semanas hasta 200 hrs	AV. UNIVERSIDAD 1861 2do y 3er PISO, Coyoacán, 04318 CDMX
135	37	3	Primavera en el Aula	Generar consciencia social, empatía y comunidad con poblaciones vulnerables. 	\N	7	t	200	5 semanas hasta 200 hrs	Cjon. del Río 33, Santa Catarina, Coyoacán, 04010 Ciudad de México, CDMX
136	38	4	Mi Renacimiento, ejerciendo mis derechos	Contribuir al desarrollo integral de la población mediante la restitución de sus derechos.	\N	15	t	200	5 semanas hasta 200 hrs	Callejón de Ecuador # 6, Col. Centro, CP 06200, Alcaldía Cuauhtémoc
137	39	5	El éxito también es tuyo; Podcast y capsulas de desarrollo personal	Nuestros usuarios obtendrán herramientas y estrategias para alcanzar el éxito.	\N	15	t	200	5 semanas hasta 200 hrs	AVENIDA PATOS 79 CHIMALHUACAN ESTADO DE MÉXICO 
138	39	6	Tu éxito financiero.	Formar emprendedores con las herramientas para triunfar en sus proyectos.	\N	10	t	200	5 semanas hasta 200 hrs	CDMX,ESTADO DE MÉXICO/HIBRÍDO
139	40	3	Incorporación de Personas Trabajadoras Independientes y Personas Trabajadoras del Hogar	Incrementar el conocimiento de la población, difundiendo los esquemas de seguridad social.	\N	20	t	200	5 semanas hasta 200 hrs	No aplica
140	41	4	Voces de impacto: Historias que conectan.	Contribuir a formar profesionales preparados para servir a las personas con esta discapacidad.	\N	5	t	200	5 semanas hasta 200 hrs	Zacatecas 155 Oficina 302, Col. Roma Norte., Alcaldía  Cuauhtémoc C.P. 06700, Ciudad de México.         
141	41	5	Conectando con el sonido.	Formar profesionales estén preparados para servir a las personas con discapacidad auditiva.	\N	10	t	200	5 semanas hasta 200 hrs	Zacatecas 155 Oficina 302, Col. Roma Norte., Alcaldía  Cuauhtémoc C.P. 06700, Ciudad de México.         
142	6	6	Campus sostenible	Identificar por medio de indicadores, ser un 10% más sostenibles en rubro de agua, y residuos.	\N	3	t	200	5 semanas hasta 200 hrs	CCM
143	42	3	Tutor Prepanet	Impulsar el desarrollo humano, social, cultural y económico, por medio de un proceso de educación.\r\n	\N	80	t	200	5 semanas hasta 200 hrs	desde cualquier lugar con apoyo de una computadora
144	43	4	Inspira Comunicaciones	Elaboración de campañas, contenido audiovisual, reactivación de redes sociales y dinámicas grupales.	\N	10	t	200	5 semanas hasta 200 hrs	Arbolillo 99. Colonia: Las Hadas Coapa. Alcaldía Tlalpan. cp: 14390 
145	24	5	Patrones Hermosos Tec de Monterrey by Departamento Geoespacial del MIT	Impactar a niñas en edades de 13 a 17 años en su decisión de estudiar una carrera STEM.	\N	55	t	200	5 semanas hasta 200 hrs	Tec de Monterrey, Campus Ciudad de México
146	45	6	Juventudes en acción para superar la pobreza	Contribuir a superar la pobreza en México a partir de la formación de juventudes .	\N	50	t	200	5 semanas hasta 200 hrs	Oficina de TECHO: https://maps.app.goo.gl/md3i1XnRhkn47D4L7\r\nComunidades de TECHO: https://www.google.com/maps/d/edit?mid=1V92yeJYEsOMpd4pt5pAqVjmUV7Pq_e8&usp=sharing
147	46	3	Construyendo una Rett de apoyo para las infancias	Impulsar una red de apoyo que posibilite el desarrollo de infancias.	\N	15	t	200	5 semanas hasta 200 hrs	CDA. Emiliano Zapata 75 , col. Portales Norte , alcaldía Benito Juárez
148	47	4	Cambiando el mundo desde tu trinchera	Que las y los alumnos participen activamente en soluciones de problemáticas socioambientales. 	\N	10	t	200	5 semanas hasta 200 hrs	No aplica. 
\.


--
-- TOC entry 5024 (class 0 OID 18379)
-- Dependencies: 237
-- Data for Name: ProjectCode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProjectCode" (id, project_id, code_hash, expires_at, issued_by, used_by_student_id, used_at) FROM stdin;
1	19	42e32696ac0804d3ca0ed922d690ec3be35b3d9d50ba89741059afdc72cde711	2026-05-12 02:35:07.279	153	\N	\N
2	19	e67622f5f7f34c16d97bc62e5d0f44a367e96dd83b404d63ba77ad14c431b1a5	2026-05-12 02:35:11.492	153	\N	\N
3	19	6547c3f7fde258efa1646250a5ffbdfc036c7f9582c86918349cd31cf6d11c3d	2026-05-12 02:35:12.223	153	149	2026-05-12 02:33:18.624
4	10	8787f792dd040f7e18a086e675b535fecc8d8249d600e5f7f2ed8df099369a48	2026-05-12 02:40:32.819	153	\N	\N
5	19	75498f4de6d564023d731dea77acb43cb8d31af9dc73c62ed774a9b1de89f764	2026-05-12 06:06:03.673	153	152	2026-05-12 06:04:10.156
6	9	b5eb123a1af8adb36bc9efe11f4477512350058e5b8c129f18e20e883eac5c75	2026-05-13 08:39:36.89	129	52	2026-05-13 07:39:40.668
\.


--
-- TOC entry 5013 (class 0 OID 18330)
-- Dependencies: 226
-- Data for Name: ProjectSocioUser; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProjectSocioUser" (project_id, user_id) FROM stdin;
\.


--
-- TOC entry 5018 (class 0 OID 18352)
-- Dependencies: 231
-- Data for Name: SlotRegistration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SlotRegistration" (id, slot_id, student_user_id, created_at) FROM stdin;
\.


--
-- TOC entry 5014 (class 0 OID 18335)
-- Dependencies: 227
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Student" (user_id, matricula, full_name, phone, apellidos, carrera, correo_personal, hora_registro) FROM stdin;
8	A0753120	Isabella Rodríguez	1991970903		Licenciatura en Inteligencia de Negocios	user_8@example.com	00:00:00
5	A0097113	Andrés González	3390564432		Licenciatura en Emprendimiento e Innovación	user_5@example.com	00:00:00
10	A0922729	Carlos González	3564231942		Arquitectura	user_10@example.com	00:00:00
13	A0243807	Andrés García	9331435186		Licenciatura en Estrategia y Transformación de Negocios	user_13@example.com	00:00:00
15	A0387294	Javier Martínez	1830931603		Ingeniería en Transformación Digital de Negocios	user_15@example.com	00:00:00
17	A0647149	Ana López	7048921589		Ingeniería en Innovación y Desarrollo	user_17@example.com	00:00:00
18	A0683769	Mateo Martínez	6457034313		Arquitectura	user_18@example.com	00:00:00
20	A0377400	Pedro García	1002964801		Ingeniería en Desarrollo Sustentable	user_20@example.com	00:00:00
21	A0027930	Diego Rodríguez	9025237267		Ingeniería Mecatrónica	user_21@example.com	00:00:00
23	A0463652	Luis Torres	2931385217		Licenciatura en Economía	user_23@example.com	00:00:00
25	A0793903	Ricardo Ramírez	1018951773		Licenciatura en Gobierno y Transformación Pública	user_25@example.com	00:00:00
26	A0560182	Lucía Ramírez	6874325773		Licenciatura en Diseño	user_26@example.com	00:00:00
28	A0790830	Camila Ramírez	2960894120		Licenciatura en Derecho	user_28@example.com	00:00:00
31	A0578603	Ana López	6011375124		Ingeniería en Innovación y Desarrollo	user_31@example.com	00:00:00
33	A0516618	Mateo Pérez	6118937770		Médico Cirujano Odontólogo	user_33@example.com	00:00:00
34	A0822309	Javier Ramírez	9205758865		Ingeniería Química	user_34@example.com	00:00:00
36	A0196482	Isabella Rodríguez	8249004642		Ingeniería en Biosistemas Agroalimentarios	user_36@example.com	00:00:00
40	A0661414	Sofía García	8374600512		Ingeniería en Nanotecnología y Materiales	user_40@example.com	00:00:00
41	A0198553	Juan González	5787698688		Ingeniería Mecatrónica	user_41@example.com	00:00:00
43	A0410137	Luis López	8029636238		Licenciatura en Nutrición y Bienestar Integral	user_43@example.com	00:00:00
44	A0914989	Fernando Hernández	8531731774		Ingeniería Civil	user_44@example.com	00:00:00
46	A0313074	Juan López	7734915182		Licenciatura en Economía	user_46@example.com	00:00:00
48	A0895685	Ana Ramírez	9091936079		Ingeniería en Física Industrial	user_48@example.com	00:00:00
51	A0963568	María Torres	9909226668		Arquitectura	user_51@example.com	00:00:00
52	A0415166	Carlos Sánchez	1921212090		Licenciatura en Desarrollo de Talento y Cultura Organizacional	user_52@example.com	00:00:00
56	A0016595	Gabriela González	9718274225		Licenciatura en Finanzas	user_56@example.com	00:00:00
58	A0073476	Fernando Martínez	4874023116		Licenciatura en Tecnología y Producción Musical	user_58@example.com	00:00:00
61	A0521839	Javier García	9069319083		Médico Cirujano	user_61@example.com	00:00:00
63	A0922969	Pedro Rodríguez	4404771813		Licenciatura en Biociencias	user_63@example.com	00:00:00
64	A0765079	Gabriela Martínez	5768987812		Licenciatura en Tecnología y Producción Musical	user_64@example.com	00:00:00
66	A0458598	Javier Hernández	4141905729		Médico Cirujano Odontólogo	user_66@example.com	00:00:00
68	A0171998	Juan Torres	4914512329		Licenciatura en Emprendimiento e Innovación	user_68@example.com	00:00:00
70	A0155110	Elena González	5873199445		Licenciatura en Contaduría Pública y Finanzas	user_70@example.com	00:00:00
71	A0427784	Sofía González	5823480073		Ingeniería en Innovación y Desarrollo	user_71@example.com	00:00:00
76	A0937584	María González	1877482236		Licenciatura en Psicología Clínica y de la Salud	user_76@example.com	00:00:00
79	A0272918	Carlos Torres	2832521893		Licenciatura en Economía	user_79@example.com	00:00:00
72	A01174557	Diego Martínez	9613315737		Ingieneria en cagarla	aawokgfe@gmail.com	10:30:00
80	A0293327	Sofía Torres	5957384467		Ingeniería Mecánica	user_80@example.com	00:00:00
82	A0681103	Mateo Martínez	5385662603		Licenciatura en Nutrición y Bienestar Integral	user_82@example.com	00:00:00
84	A0071453	Sofía González	5744002266		Licenciatura en Negocios Internacionales	user_84@example.com	00:00:00
85	A0994219	Victoria Pérez	5770234878		Licenciatura en Derecho	user_85@example.com	00:00:00
87	A0816930	Lucía Ramírez	5441040226		Licenciatura en Biociencias	user_87@example.com	00:00:00
90	A0676123	Camila González	3751988164		Ingeniería en Biotecnología	user_90@example.com	00:00:00
92	A0928501	Carlos Torres	5600657267		Licenciatura en Psicología Clínica y de la Salud	user_92@example.com	00:00:00
94	A0677230	Isabella Hernández	7438988984		Ingeniería en Tecnologías Computacionales	user_94@example.com	00:00:00
96	A0631953	Camila García	8670705778		Licenciatura en Humanidades Digitales e Inteligencia Artificial	user_96@example.com	00:00:00
97	A0521810	Valentina Torres	4562259808		Ingeniería Mecánica	user_97@example.com	00:00:00
147	A00000147	Pedro Martínez	\N			user_147@example.com	
77	A0434178	Juan Torres	1265979528		Ingeniería Civil	user_77@example.com	00:00:00
0	A0078054	Fernando García	2932492407		Licenciatura en Economía	user_0@example.com	00:00:00
100	A0365525	Elena Sánchez	9317584428			user_100@example.com	00:00:00
99	A01174557_99	Fernando Sánchez	9613315737		IDM	oiejfwe@gmail.com	07:00:00
152	A01174595	wepofkwef	9613315739		IDM	OIJQEFOIJEF@waos.com	10:30:00
54	A0562938	Valentina Torres	3206632532		Ingeniería en Inteligencia Artificial y Ciencia de Datos	user_54@example.com	00:00:00
3	A0456978	Victoria Sánchez	5335212446		Licenciatura en Emprendimiento e Innovación	user_3@example.com	00:00:00
55	A0943970	Fernando Martínez	1043855084		Ingeniería en Biosistemas Agroalimentarios	user_55@example.com	00:00:00
57	A0098045	Luis Hernández	8889829246		Ingeniería en Innovación y Desarrollo	user_57@example.com	00:00:00
59	A0247988	Andrés García	4421801611		Licenciatura en Desarrollo de Talento y Cultura Organizacional	user_59@example.com	00:00:00
62	A0087209	Andrés Ramírez	9998986074		Licenciatura en Psicología Clínica y de la Salud	user_62@example.com	00:00:00
65	A0883275	Camila González	6288397056		Ingeniería en Tecnologías Computacionales	user_65@example.com	00:00:00
67	A0237714	Victoria Sánchez	7388878025		Ingeniería en Física Industrial	user_67@example.com	00:00:00
69	A0042730	Elena Ramírez	2359953099		Ingeniería en Electrónica y Semiconductores	user_69@example.com	00:00:00
95	A0032507	Fernando García	6290063380		Ingeniería en Desarrollo Sustentable	user_95@example.com	00:00:00
98	A0971880	Isabella Sánchez	9060057872		Licenciatura en Humanidades Digitales e Inteligencia Artificial	user_98@example.com	00:00:00
148	A01849874	Isabella Sánchez	9613315758		Ciencia de que me mato	user_148@example.com	10:30:00
149	A01174559	ejemplonuevo	9613315737		IDM	ejemplo1@gmail.com	08:30:00
150	A01174550	solovinanueva flores	9613315739		Ciencia de que me mato	djenfewwq@gmail.com	08:30:00
151	A01174593	Juan	9613315739		Ciencia de que me mato	fewiojfew@gmail.com	10:00:00
154	A00394129	Eduardo villanueva	9612338980	villanueva	mdm	asdmgasdgm@gmail.com	7:00 AM
156	A00000000	Djdjsjsk Djdjsjsj	9613238970	Djdjsjsj	Jfjdsj	fjdjdjsjs@gmail.con	7:00 AM
2	A0817751	Pedro Sánchez	7122902095		Licenciatura en Mercadotecnia	user_2@example.com	00:00:00
14	A0088660	Mateo Rodríguez	8761290110		Ingeniería en Física Industrial	user_14@example.com	00:00:00
16	A0868020	Elena Martínez	8015349507		Licenciatura en Mercadotecnia	user_16@example.com	00:00:00
19	A0972582	Elena Pérez	8302122309		Médico Cirujano	user_19@example.com	00:00:00
89	A0693388	María Martínez	5896520200		Licenciatura en Relaciones Internacionales	user_89@example.com	00:00:00
6	A0116227	Carlos Sánchez	4769869131		Licenciatura en Desarrollo de Talento y Cultura Organizacional	user_6@example.com	00:00:00
9	A0289339	Elena Rodríguez	7375223529		Licenciatura en Gobierno y Transformación Pública	user_9@example.com	00:00:00
12	A0523657	Mateo González	6670020649		Licenciatura en Mercadotecnia	user_12@example.com	00:00:00
50	A0032519	Victoria Torres	3633413456		Licenciatura en Inteligencia de Negocios	user_50@example.com	00:00:00
22	A0301959	Diego Sánchez	2762926726		Ingeniería Mecatrónica	user_22@example.com	00:00:00
24	A0714605	Mateo Hernández	5379703963		Ingeniería en Nanotecnología y Materiales	user_24@example.com	00:00:00
27	A0551374	Lucía Pérez	5828827708		Ingeniería en Nanotecnología y Materiales	user_27@example.com	00:00:00
29	A0140885	Valentina Hernández	1367128610		Licenciatura en Comunicación y Producción Digital	user_29@example.com	00:00:00
32	A0507807	María Ramírez	7967885095		Ingeniería Química	user_32@example.com	00:00:00
35	A0709774	Lucía Pérez	8076230800		Ingeniería en Inteligencia Artificial y Ciencia de Datos	user_35@example.com	00:00:00
37	A0190586	Gabriela Ramírez	6821644118		Ingeniería en Biotecnología	user_37@example.com	00:00:00
39	A0401237	Luis Rodríguez	1459847763		Ingeniería en Innovación y Desarrollo	user_39@example.com	00:00:00
42	A0197827	Luis Hernández	3996393594		Licenciatura en Innovación y Transformación Educativa	user_42@example.com	00:00:00
45	A0186067	Victoria Torres	7637202820		Ingeniería Industrial y de Sistemas	user_45@example.com	00:00:00
47	A0228045	Elena Hernández	3494870040		Ingeniería en Robótica y Sistemas Inteligentes	user_47@example.com	00:00:00
73	A0538356	Elena Martínez	8099184364		Licenciatura en Derecho	user_73@example.com	00:00:00
75	A0704359	María García	1896420926		Ingeniería en Innovación y Desarrollo	user_75@example.com	00:00:00
78	A0836029	María Rodríguez	2117326745		Ingeniería Biomédica	user_78@example.com	00:00:00
81	A0446210	Pedro Sánchez	1916839311		Ingeniería Biomédica	user_81@example.com	00:00:00
83	A0078116	Andrés Pérez	3076271882		Licenciatura en Negocios Internacionales	user_83@example.com	00:00:00
86	A0223717	Pedro Torres	3514858584		Licenciatura en Negocios Internacionales	user_86@example.com	00:00:00
88	A0784421	Diego Ramírez	7632168251		Ingeniería en Nanotecnología y Materiales	user_88@example.com	00:00:00
91	A0763992	Sofía Martínez	2856874592		Ingeniería en Innovación y Desarrollo	user_91@example.com	00:00:00
4	A0471484	Pedro Hernández	9506409436		Ingeniería en Transformación Digital de Negocios	user_4@example.com	00:00:00
11	A0925178	Sofía Martínez	5149037290		Licenciatura en Comunicación y Producción Digital	user_11@example.com	00:00:00
7	A01659873	Valentina  Martínez	3725109007	Martínez	Ingeniería en Nanotecnología y Materiales	user_7@example.com	00:00:00
53	A0774497	Fernando Rodríguez	5539240556		Licenciatura en Finanzas	user_53@example.com	00:00:00
1	A0016232	Isabella García	7336015959		Ingeniería Mecatrónica	user_1@example.com	00:00:00
93	A0341922	Lucía Ramírez	7897033622		Ingeniería en Alimentos	user_93@example.com	00:00:00
30	A0793076	Andrés Ramírez	6717421330		Médico Cirujano Odontólogo	user_30@example.com	00:00:00
38	A0764615	Andrés Pérez	3016468828		Licenciatura en Letras y Emprendimiento Editorial	user_38@example.com	00:00:00
49	A0215424	Carlos Hernández	5739926987		Ingeniería en Física Industrial	user_49@example.com	00:00:00
60	A0116555	Ricardo García	8898180194		Licenciatura en Estrategia y Transformación de Negocios	user_60@example.com	00:00:00
74	A0879208	Lucía Sánchez	5813723749		Licenciatura en Psicología Clínica y de la Salud	user_74@example.com	00:00:00
158	A10000000	Jose Fjdjsj	9611111111	Fjdjsj	Djdj	fjfjdjs@gmail.com	9:00 AM
\.


--
-- TOC entry 5016 (class 0 OID 18343)
-- Dependencies: 229
-- Data for Name: TimeSlot; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TimeSlot" (id, period_id, starts_at, ends_at, capacity, location) FROM stdin;
\.


--
-- TOC entry 5006 (class 0 OID 18290)
-- Dependencies: 219
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, username, password_hash, role, org_id, is_active, created_at) FROM stdin;
3	user_3@example.com	user3@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.183
4	user_4@example.com	user4@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.184
5	user_5@example.com	user5@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.186
6	user_6@example.com	user6@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.187
7	user_7@example.com	user7@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.189
8	user_8@example.com	user8@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.191
9	user_9@example.com	user9@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.192
10	user_10@example.com	user10@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.194
11	user_11@example.com	user11@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.195
12	user_12@example.com	user12@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.196
13	user_13@example.com	user13@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.198
14	user_14@example.com	user14@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.2
15	user_15@example.com	user15@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.201
16	user_16@example.com	user16@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.202
17	user_17@example.com	user17@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.203
18	user_18@example.com	user18@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.205
20	user_20@example.com	user20@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.207
21	user_21@example.com	user21@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.209
22	user_22@example.com	user22@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.211
23	user_23@example.com	user23@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.213
24	user_24@example.com	user24@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.215
25	user_25@example.com	user25@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.216
26	user_26@example.com	user26@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.218
27	user_27@example.com	user27@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.219
28	user_28@example.com	user28@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.22
29	user_29@example.com	user29@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.221
30	user_30@example.com	user30@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.223
31	user_31@example.com	user31@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.225
32	user_32@example.com	user32@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.227
33	user_33@example.com	user33@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.228
34	user_34@example.com	user34@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.23
35	user_35@example.com	user35@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.231
36	user_36@example.com	user36@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.233
37	user_37@example.com	user37@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.234
38	user_38@example.com	user38@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.236
39	user_39@example.com	user39@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.237
40	user_40@example.com	user40@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.238
41	user_41@example.com	user41@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.24
42	user_42@example.com	user42@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.241
43	user_43@example.com	user43@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.242
44	user_44@example.com	user44@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.243
45	user_45@example.com	user45@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.244
47	user_47@example.com	user47@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.247
48	user_48@example.com	user48@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.249
49	user_49@example.com	user49@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.25
50	user_50@example.com	user50@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.251
51	user_51@example.com	user51@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.252
52	user_52@example.com	user52@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.254
53	user_53@example.com	user53@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.256
54	user_54@example.com	user54@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.258
55	user_55@example.com	user55@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.259
56	user_56@example.com	user56@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.26
57	user_57@example.com	user57@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.261
58	user_58@example.com	user58@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.262
59	user_59@example.com	user59@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.263
60	user_60@example.com	user60@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.265
61	user_61@example.com	user61@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.266
62	user_62@example.com	user62@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.268
63	user_63@example.com	user63@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.269
64	user_64@example.com	user64@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.271
65	user_65@example.com	user65@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.272
66	user_66@example.com	user66@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.274
67	user_67@example.com	user67@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.275
68	user_68@example.com	user68@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.276
69	user_69@example.com	user69@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.277
70	user_70@example.com	user70@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.278
71	user_71@example.com	user71@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.279
149	ejemplo1@gmail.com	ejemplonuevo	feow02i3efkmDWI?	student	\N	t	2026-05-13 02:50:49.168
150	djenfewwq@gmail.com	nuevo2	efoijqwwc2iojrfoimeFm?	student	\N	t	2026-05-13 02:50:49.176
153	becario@gmail.com	becario	pass1	becario	\N	t	2026-05-13 02:50:49.178
1	user_1@example.com	user1@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.181
2	user_2@example.com	user2@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.182
75	user_75@example.com	user75@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.283
76	user_76@example.com	user76@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.284
77	user_77@example.com	user77@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.285
78	user_78@example.com	user78@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.286
79	user_79@example.com	user79@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.287
80	user_80@example.com	user80@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.288
81	user_81@example.com	user81@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.29
82	user_82@example.com	user82@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.291
83	user_83@example.com	user83@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.292
84	user_84@example.com	user84@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.293
85	user_85@example.com	user85@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.294
86	user_86@example.com	user86@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.295
87	user_87@example.com	user87@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.297
88	user_88@example.com	user88@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.298
89	user_89@example.com	user89@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.3
90	user_90@example.com	user90@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.301
91	user_91@example.com	user91@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.302
92	user_92@example.com	user92@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.303
94	user_94@example.com	user94@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.305
95	user_95@example.com	user95@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.306
96	user_96@example.com	user96@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.307
97	user_97@example.com	user97@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.309
98	user_98@example.com	user98@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.31
99	oiejfwe@gmail.com	user99@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.319
100	user_100@example.com	user100@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.311
102	contacto_102@osf.com	osf_user_102	default_pass	socio	35	t	2026-05-13 02:50:49.315
103	contacto_103@osf.com	osf_user_103	default_pass	socio	5	t	2026-05-13 02:50:49.316
104	contacto_104@osf.com	osf_user_104	default_pass	socio	8	t	2026-05-13 02:50:49.317
105	contacto_105@osf.com	osf_user_105	default_pass	socio	21	t	2026-05-13 02:50:49.318
106	contacto_106@osf.com	osf_user_106	default_pass	socio	13	t	2026-05-13 02:50:49.32
107	contacto_107@osf.com	osf_user_107	default_pass	socio	15	t	2026-05-13 02:50:49.321
108	contacto_108@osf.com	osf_user_108	default_pass	socio	10	t	2026-05-13 02:50:49.322
109	contacto_109@osf.com	osf_user_109	default_pass	socio	7	t	2026-05-13 02:50:49.324
110	contacto_110@osf.com	osf_user_110	default_pass	socio	7	t	2026-05-13 02:50:49.325
111	contacto_111@osf.com	osf_user_111	default_pass	socio	46	t	2026-05-13 02:50:49.325
112	contacto_112@osf.com	osf_user_112	default_pass	socio	42	t	2026-05-13 02:50:49.326
113	contacto_113@osf.com	osf_user_113	default_pass	socio	21	t	2026-05-13 02:50:49.327
114	contacto_114@osf.com	osf_user_114	default_pass	socio	29	t	2026-05-13 02:50:49.328
115	contacto_115@osf.com	osf_user_115	default_pass	socio	22	t	2026-05-13 02:50:49.33
116	contacto_116@osf.com	osf_user_116	default_pass	socio	13	t	2026-05-13 02:50:49.331
117	contacto_117@osf.com	osf_user_117	default_pass	socio	27	t	2026-05-13 02:50:49.332
118	contacto_118@osf.com	osf_user_118	default_pass	socio	45	t	2026-05-13 02:50:49.333
119	contacto_119@osf.com	osf_user_119	default_pass	socio	45	t	2026-05-13 02:50:49.334
121	contacto_121@osf.com	osf_user_121	default_pass	socio	4	t	2026-05-13 02:50:49.336
122	contacto_122@osf.com	osf_user_122	default_pass	socio	35	t	2026-05-13 02:50:49.338
123	contacto_123@osf.com	osf_user_123	default_pass	socio	43	t	2026-05-13 02:50:49.341
124	contacto_124@osf.com	osf_user_124	default_pass	socio	37	t	2026-05-13 02:50:49.343
125	contacto_125@osf.com	osf_user_125	default_pass	socio	37	t	2026-05-13 02:50:49.344
126	contacto_126@osf.com	osf_user_126	default_pass	socio	34	t	2026-05-13 02:50:49.345
127	contacto_127@osf.com	osf_user_127	default_pass	socio	2	t	2026-05-13 02:50:49.347
128	contacto_128@osf.com	osf_user_128	default_pass	socio	13	t	2026-05-13 02:50:49.348
129	contacto_129@osf.com	osf_user_129	default_pass	socio	7	t	2026-05-13 02:50:49.349
130	contacto_130@osf.com	osf_user_130	default_pass	socio	2	t	2026-05-13 02:50:49.35
131	contacto_131@osf.com	osf_user_131	default_pass	socio	28	t	2026-05-13 02:50:49.351
132	contacto_132@osf.com	osf_user_132	default_pass	socio	8	t	2026-05-13 02:50:49.352
133	contacto_133@osf.com	osf_user_133	default_pass	socio	2	t	2026-05-13 02:50:49.353
134	contacto_134@osf.com	osf_user_134	default_pass	socio	2	t	2026-05-13 02:50:49.354
135	contacto_135@osf.com	osf_user_135	default_pass	socio	40	t	2026-05-13 02:50:49.356
136	contacto_136@osf.com	osf_user_136	default_pass	socio	17	t	2026-05-13 02:50:49.357
137	contacto_137@osf.com	osf_user_137	default_pass	socio	15	t	2026-05-13 02:50:49.357
138	contacto_138@osf.com	osf_user_138	default_pass	socio	3	t	2026-05-13 02:50:49.358
139	contacto_139@osf.com	osf_user_139	default_pass	socio	27	t	2026-05-13 02:50:49.359
140	contacto_140@osf.com	osf_user_140	default_pass	socio	30	t	2026-05-13 02:50:49.36
141	contacto_141@osf.com	osf_user_141	default_pass	socio	43	t	2026-05-13 02:50:49.361
142	contacto_142@osf.com	osf_user_142	default_pass	socio	36	t	2026-05-13 02:50:49.362
143	contacto_143@osf.com	osf_user_143	default_pass	socio	3	t	2026-05-13 02:50:49.363
144	contacto_144@osf.com	osf_user_144	default_pass	socio	34	t	2026-05-13 02:50:49.365
145	contacto_145@osf.com	osf_user_145	default_pass	socio	25	t	2026-05-13 02:50:49.366
147	user_147@example.com	prueba 12	fewoijjf=?#4im3R	student	\N	t	2026-05-13 02:50:49.369
101	contacto_101@osf.com	osf_user_101	default_pass	socio	17	t	2026-05-13 02:50:49.312
74	user_74@example.com	user74@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.282
0	user_0@example.com	user0@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.175
19	user_19@example.com	user19@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.206
46	user_46@example.com	user46@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.246
72	aawokgfe@gmail.com	user72@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.368
73	user_73@example.com	user73@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.28
93	user_93@example.com	user93@example.com	default_pass	student	\N	t	2026-05-13 02:50:49.304
148	user_148@example.com	fewoijfoijwefoij	password_dummy	student	\N	t	2026-05-13 02:50:49.37
151	fewiojfew@gmail.com	ejemplo nuevo 2	efoijefn#"oir9fmM	student	\N	t	2026-05-13 02:50:49.371
152	OIJQEFOIJEF@waos.com	ejemplo nuevo nuevo	feoiwjfek94uM?	student	\N	t	2026-05-13 02:50:49.173
146	admin@securefair.com	admin	pass1	admin	\N	t	2026-05-13 02:50:49.367
154	lalitotaquitoo@example.com	lalitotaquitoo	JOSESITO1234.	student	\N	t	2026-05-13 04:57:45.513
156	Eduaddooo@example.com	Eduaddooo	symqek-hyghyC-jecku3	student	\N	t	2026-05-13 04:58:34.496
120	contacto_120@osf.com	osf_user_120	default_pass	socio	36	t	2026-05-13 02:50:49.335
158	Jose123@example.com	Jose123	symqek-hyghyC-jecku3	student	\N	t	2026-05-13 07:32:36.713
\.


--
-- TOC entry 5004 (class 0 OID 18280)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0abb64cd-2c8b-4e16-8f8e-34d9105036b6	30dff01140bb0878945845af2e02a65d2896a805a7efffe3d293682b664f51d5	2026-05-12 20:50:48.70651-06	20260513025048_init_with_org	\N	\N	2026-05-12 20:50:48.63606-06	1
\.


--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 232
-- Name: Checkin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Checkin_id_seq"', 1, false);


--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 234
-- Name: Enrollment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Enrollment_id_seq"', 177, true);


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 222
-- Name: FairPeriod_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."FairPeriod_id_seq"', 6, true);


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 220
-- Name: Organization_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Organization_id_seq"', 47, true);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 236
-- Name: ProjectCode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProjectCode_id_seq"', 6, true);


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 224
-- Name: Project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Project_id_seq"', 148, true);


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 230
-- Name: SlotRegistration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SlotRegistration_id_seq"', 1, false);


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 228
-- Name: TimeSlot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TimeSlot_id_seq"', 1, false);


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 218
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 159, true);


--
-- TOC entry 4836 (class 2606 OID 18366)
-- Name: Checkin Checkin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Checkin"
    ADD CONSTRAINT "Checkin_pkey" PRIMARY KEY (id);


--
-- TOC entry 4838 (class 2606 OID 18377)
-- Name: Enrollment Enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY (id);


--
-- TOC entry 4823 (class 2606 OID 18319)
-- Name: FairPeriod FairPeriod_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FairPeriod"
    ADD CONSTRAINT "FairPeriod_pkey" PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 18309)
-- Name: Organization Organization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_pkey" PRIMARY KEY (id);


--
-- TOC entry 4841 (class 2606 OID 18386)
-- Name: ProjectCode ProjectCode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectCode"
    ADD CONSTRAINT "ProjectCode_pkey" PRIMARY KEY (id);


--
-- TOC entry 4827 (class 2606 OID 18334)
-- Name: ProjectSocioUser ProjectSocioUser_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectSocioUser"
    ADD CONSTRAINT "ProjectSocioUser_pkey" PRIMARY KEY (project_id, user_id);


--
-- TOC entry 4825 (class 2606 OID 18329)
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- TOC entry 4834 (class 2606 OID 18358)
-- Name: SlotRegistration SlotRegistration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SlotRegistration"
    ADD CONSTRAINT "SlotRegistration_pkey" PRIMARY KEY (id);


--
-- TOC entry 4830 (class 2606 OID 18341)
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (user_id);


--
-- TOC entry 4832 (class 2606 OID 18350)
-- Name: TimeSlot TimeSlot_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TimeSlot"
    ADD CONSTRAINT "TimeSlot_pkey" PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 18299)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 4815 (class 2606 OID 18288)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4839 (class 1259 OID 18391)
-- Name: ProjectCode_code_hash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProjectCode_code_hash_key" ON public."ProjectCode" USING btree (code_hash);


--
-- TOC entry 4828 (class 1259 OID 18389)
-- Name: Student_matricula_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Student_matricula_key" ON public."Student" USING btree (matricula);


--
-- TOC entry 4816 (class 1259 OID 18387)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 4819 (class 1259 OID 18388)
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- TOC entry 4851 (class 2606 OID 18442)
-- Name: Checkin Checkin_checked_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Checkin"
    ADD CONSTRAINT "Checkin_checked_by_user_id_fkey" FOREIGN KEY (checked_by_user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4852 (class 2606 OID 18437)
-- Name: Checkin Checkin_slot_reg_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Checkin"
    ADD CONSTRAINT "Checkin_slot_reg_id_fkey" FOREIGN KEY (slot_reg_id) REFERENCES public."SlotRegistration"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4853 (class 2606 OID 18447)
-- Name: Enrollment Enrollment_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_period_id_fkey" FOREIGN KEY (period_id) REFERENCES public."FairPeriod"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4854 (class 2606 OID 18452)
-- Name: Enrollment Enrollment_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4855 (class 2606 OID 18457)
-- Name: Enrollment Enrollment_student_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_student_user_id_fkey" FOREIGN KEY (student_user_id) REFERENCES public."Student"(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4856 (class 2606 OID 18467)
-- Name: ProjectCode ProjectCode_issued_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectCode"
    ADD CONSTRAINT "ProjectCode_issued_by_fkey" FOREIGN KEY (issued_by) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4857 (class 2606 OID 18462)
-- Name: ProjectCode ProjectCode_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectCode"
    ADD CONSTRAINT "ProjectCode_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4858 (class 2606 OID 18472)
-- Name: ProjectCode ProjectCode_used_by_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectCode"
    ADD CONSTRAINT "ProjectCode_used_by_student_id_fkey" FOREIGN KEY (used_by_student_id) REFERENCES public."Student"(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4845 (class 2606 OID 18407)
-- Name: ProjectSocioUser ProjectSocioUser_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectSocioUser"
    ADD CONSTRAINT "ProjectSocioUser_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4846 (class 2606 OID 18412)
-- Name: ProjectSocioUser ProjectSocioUser_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectSocioUser"
    ADD CONSTRAINT "ProjectSocioUser_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4843 (class 2606 OID 18397)
-- Name: Project Project_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4844 (class 2606 OID 18402)
-- Name: Project Project_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_period_id_fkey" FOREIGN KEY (period_id) REFERENCES public."FairPeriod"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4849 (class 2606 OID 18427)
-- Name: SlotRegistration SlotRegistration_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SlotRegistration"
    ADD CONSTRAINT "SlotRegistration_slot_id_fkey" FOREIGN KEY (slot_id) REFERENCES public."TimeSlot"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4850 (class 2606 OID 18432)
-- Name: SlotRegistration SlotRegistration_student_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SlotRegistration"
    ADD CONSTRAINT "SlotRegistration_student_user_id_fkey" FOREIGN KEY (student_user_id) REFERENCES public."Student"(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4847 (class 2606 OID 18417)
-- Name: Student Student_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4848 (class 2606 OID 18422)
-- Name: TimeSlot TimeSlot_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TimeSlot"
    ADD CONSTRAINT "TimeSlot_period_id_fkey" FOREIGN KEY (period_id) REFERENCES public."FairPeriod"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4842 (class 2606 OID 18392)
-- Name: User User_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2026-05-13 02:39:43

--
-- PostgreSQL database dump complete
--

\unrestrict yJrjQAUwgTeTJBcnQPECLExSZ0mXBfftrLAmgPaM5MGPnPAoMEw929e7ccGG88e

