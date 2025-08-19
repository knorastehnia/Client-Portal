DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS files CASCADE;


CREATE TABLE admins (
	id SERIAL PRIMARY KEY,
	subdomain TEXT NOT NULL,
	email TEXT NOT NULL,
	pw_hash TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

	UNIQUE (email),
	UNIQUE (subdomain)
);

CREATE TABLE clients (
	id SERIAL PRIMARY KEY,
	admin_id INTEGER NOT NULL REFERENCES admins(id),
	email TEXT NOT NULL,
	full_name TEXT NOT NULL,
	pw_hash TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

	UNIQUE (admin_id, email)
);

CREATE TABLE projects (
	id SERIAL PRIMARY KEY,
	admin_id INTEGER NOT NULL REFERENCES admins(id),
	client_id INTEGER REFERENCES clients(id),
	title TEXT NOT NULL,
	current_status TEXT NOT NULL DEFAULT 'In Progress'
		CHECK (current_status IN ('Cancelled', 'Paused', 'In Progress', 'Completed')), 
	sort_index INTEGER,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION set_updated_at()
	RETURNS TRIGGER AS $$
	BEGIN
		NEW.updated_at = NOW();
		RETURN NEW;
	END;
	$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_updated_at
	BEFORE UPDATE ON projects
	FOR EACH ROW
	EXECUTE FUNCTION set_updated_at();

CREATE TABLE files (
	id SERIAL PRIMARY KEY,
	admin_id INTEGER NOT NULL REFERENCES admins(id),
	project_id INTEGER NOT NULL REFERENCES projects(id),
	file_name TEXT,
	file_type TEXT,
	file_url TEXT,
	size_bytes INTEGER,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
