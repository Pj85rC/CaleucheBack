--creación de dbCaleuche
CREATE DATABASE dbCaleuche

--permite listar las db creadas
\l

--Conectando a la dbcaleuche
\c dbcaleuche

CREATE TABLE festivals (
  id SERIAL PRIMARY KEY,
  name varchar(50) UNIQUE,
  description text,
  location varchar(100),
  photoURL varchar(256),
  date date,
  created_at timestamp,
  updated_at timestamp
);

--visualizar detalles de tabla
\d festivals

--se visualiza la tabla festivals
SELECT * FROM festivals;


CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username varchar(50) UNIQUE NOT NULL,
  password varchar(256) NOT NULL,
  email varchar(256) UNIQUE NOT NULL,
  role varchar(50),
  photoURL varchar(256),
  created_at timestamp,
  updated_at timestamp
);

--visualizar detalles de tabla
\d users

SELECT * FROM users;

--Permite visualizar las tablas creadas
\dt 

CREATE TABLE
  artists (
    id SERIAL PRIMARY KEY,
    name varchar(100) UNIQUE NOT NULL,
    created_at timestamp,
    updated_at timestamp
  );    

  --visualizar detalles de tabla
\d artists

CREATE TABLE
  lineup (
    id SERIAL PRIMARY KEY,
    festival_id integer NOT NULL,
    artist_id integer NOT NULL,
    created_at timestamp,
    updated_at timestamp,
    year integer NOT NULL,
    FOREIGN KEY (festival_id) REFERENCES festivals (id),
    FOREIGN KEY (artist_id) REFERENCES artists (id)
  );

  --visualizar detalles de tabla
\d lineup

CREATE TABLE
  favourites (
    user_id integer,
    festival_id integer,
    created_at timestamp,
    PRIMARY KEY (user_id, festival_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (festival_id) REFERENCES festivals (id)
  );

--visualizar detalles de tabla
\d favourites

CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name varchar(50) NOT NULL UNIQUE
);


CREATE TABLE artist_genre (
    artist_id integer NOT NULL,
    genre_id integer NOT NULL,
    PRIMARY KEY (artist_id, genre_id),
    FOREIGN KEY (artist_id) REFERENCES artists (id),
    FOREIGN KEY (genre_id) REFERENCES genres (id)
);

--puedo ver todas las tablas creadas
\dt+

CREATE TABLE artist_links (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(256) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists (id)
);


SELECT column_name FROM information_schema.columns WHERE table_name = 'users';

--para ver los tipos de datos creados de tabla x en este caso users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

--para eliminar tablas cuando tienen comprometidas connexiones con foreign ej:
DROP TABLE users CASCADE;



