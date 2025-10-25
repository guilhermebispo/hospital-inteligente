/* Description:
 * Creates doctors table and seeds initial data.
 */

CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    crm VARCHAR(30) NOT NULL UNIQUE,
    specialty VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.doctors IS 'Registered doctors';
COMMENT ON COLUMN public.doctors.crm IS 'Medical license number';

INSERT INTO public.doctors (id, name, email, crm, specialty)
VALUES
    ('6a6d8dd8-3111-4f3b-b2c1-0c1f2030c001', 'Dra. Paula Andrade', 'paula.andrade@hospital.com', 'CRM-SP 123456', 'Cardiologia'),
    ('6a6d8dd8-3111-4f3b-b2c1-0c1f2030c002', 'Dr. Marcos Toledo', 'marcos.toledo@hospital.com', 'CRM-RJ 654321', 'Oncologia'),
    ('6a6d8dd8-3111-4f3b-b2c1-0c1f2030c003', 'Dra. Luiza Moraes', 'luiza.moraes@hospital.com', 'CRM-MG 112233', 'Pediatria')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (id, name, email, password, role, created_at)
VALUES
    ('7b6d8dd8-3111-4f3b-b2c1-0c1f2030d001', 'Dra. Paula Andrade', 'paula.andrade@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'DOCTOR', NOW()),
    ('7b6d8dd8-3111-4f3b-b2c1-0c1f2030d002', 'Dr. Marcos Toledo', 'marcos.toledo@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'DOCTOR', NOW()),
    ('7b6d8dd8-3111-4f3b-b2c1-0c1f2030d003', 'Dra. Luiza Moraes', 'luiza.moraes@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'DOCTOR', NOW())
ON CONFLICT (email) DO NOTHING;
