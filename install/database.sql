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