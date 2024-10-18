CREATE TABLE public.users (
	username varchar(255) NOT NULL,
	fullname varchar NULL,
	tasksapitoken varchar(24) NULL,
	created timestamptz NULL DEFAULT now(),
	last_login timestamptz NULL,
	email varchar(512) NULL,
	salt varchar(512) NULL,
	hashed_password varchar(512) NULL,
	"privileges" _varchar NULL DEFAULT '{otoUser}'::character varying[],
	active_privileges _varchar NULL DEFAULT '{otoUser}'::character varying[],
	roles _varchar NULL DEFAULT '{user}'::character varying[],
	active_role varchar(55) NULL DEFAULT 'user'::character varying,
	default_password_changed bool NULL,
	CONSTRAINT users_pk PRIMARY KEY (username)
);

CREATE TABLE public.nmap_scan_results (
    ipaddress varchar(15) NOT NULL,
    state varchar(50) NULL,
    hostname varchar(255) NULL,
    mac varchar(48) NULL,
    intervals _jsonb NULL,
    CONSTRAINT nmap_scan_results_pk PRIMARY KEY (ipaddress)
);

CREATE TABLE public.known_hosts (
    mac varchar(48) NOT NULL,
    ipaddress varchar(255) NULL,
    friendly_name varchar(100) NULL,
    notes varchar(255) NULL,
    CONSTRAINT known_hosts_pk PRIMARY KEY (mac)
);
CREATE INDEX known_hosts_ipaddress_idx ON public.known_hosts USING btree (ipaddress);

CREATE TABLE public.nmap_scan_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    scan_time varchar(24) NULL,
    unknown_hosts _varchar NULL,
    CONSTRAINT nmap_scan_logs_pk PRIMARY KEY (id)
);