/* Description:
 * Creates the users table and inserts default records.
 *
 * Author: Guilherme Bispo
 * Date: 23/10/2025
 */

DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.tb_usuario CASCADE;

CREATE TABLE public.users (
    id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(120) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('ADMIN','DOCTOR','PATIENT')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

COMMENT ON TABLE public.users IS 'Application users table';
COMMENT ON COLUMN public.users.id IS 'User identifier (UUID)';
COMMENT ON COLUMN public.users.name IS 'Full user name';
COMMENT ON COLUMN public.users.email IS 'Unique user e-mail';
COMMENT ON COLUMN public.users.password IS 'User hashed password';
COMMENT ON COLUMN public.users.role IS 'User role';
COMMENT ON COLUMN public.users.created_at IS 'Creation timestamp';

ALTER TABLE public.users OWNER TO CURRENT_USER;

/* Seed data
 * Password: 123456
 */
INSERT INTO public.users (id, name, email, password, role, created_at)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Hospital Administrator',
        'admin@hospital.com',
        '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW',
        'ADMIN',
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Doctor Sample',
        'doctor@hospital.com',
        '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW',
        'DOCTOR',
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Patient Sample',
        'patient@hospital.com',
        '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW',
        'PATIENT',
        NOW()
    )
ON CONFLICT (email) DO NOTHING;
