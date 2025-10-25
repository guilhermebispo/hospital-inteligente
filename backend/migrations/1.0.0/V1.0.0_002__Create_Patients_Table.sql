/* Description:
 * Creates the patients table to support patient management.
 *
 * Author: Guilherme Bispo
 * Date: 24/10/2025
 */

CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    document VARCHAR(20) NOT NULL UNIQUE,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('FEMALE','MALE','OTHER')),
    phone VARCHAR(20),
    notes TEXT,
    user_id UUID UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_patients_user FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE SET NULL
);

COMMENT ON TABLE public.patients IS 'Registered patients';
COMMENT ON COLUMN public.patients.id IS 'Patient identifier (UUID)';
COMMENT ON COLUMN public.patients.name IS 'Patient full name';
COMMENT ON COLUMN public.patients.email IS 'Contact e-mail';
COMMENT ON COLUMN public.patients.document IS 'Unique document (e.g. CPF)';
COMMENT ON COLUMN public.patients.birth_date IS 'Birth date';
COMMENT ON COLUMN public.patients.gender IS 'Gender code';
COMMENT ON COLUMN public.patients.phone IS 'Contact phone';
COMMENT ON COLUMN public.patients.notes IS 'Observations';
COMMENT ON COLUMN public.patients.created_at IS 'Creation timestamp';
COMMENT ON COLUMN public.patients.user_id IS 'Linked user identifier when the patient has portal access';

/* Seed data for local testing */
INSERT INTO public.patients (id, name, email, document, birth_date, gender, phone, notes)
VALUES
    ('8a6d8dd8-1111-4f3b-b2c1-0c1f2030a001', 'Ana Bezerra', 'ana.bezerra@hospital.com', '111.222.333-44', '1988-04-12', 'FEMALE', '(11) 98888-1111', 'Diabética tipo 2.'),
    ('8a6d8dd8-1111-4f3b-b2c1-0c1f2030a002', 'Bruno Silva', 'bruno.silva@hospital.com', '222.333.444-55', '1992-07-23', 'MALE', '(11) 97777-2222', 'Atleta amador.'),
    ('8a6d8dd8-1111-4f3b-b2c1-0c1f2030a003', 'Carla Nogueira', 'carla.nogueira@hospital.com', '333.444.555-66', '1975-11-05', 'FEMALE', '(21) 96666-3333', 'Hipertensa controlada.'),
    ('8a6d8dd8-1111-4f3b-b2c1-0c1f2030a004', 'Daniel Costa', 'daniel.costa@hospital.com', '444.555.666-77', '1980-01-19', 'MALE', '(31) 95555-4444', NULL),
    ('8a6d8dd8-1111-4f3b-b2c1-0c1f2030a005', 'Eduarda Castro', 'eduarda.castro@hospital.com', '555.666.777-88', '1999-09-30', 'FEMALE', '(41) 94444-5555', 'Gestante - 24 semanas.'),
    ('8a6d8dd8-1111-4f3b-b2c1-0c1f2030a006', 'Felipe Ramos', 'felipe.ramos@hospital.com', '666.777.888-99', '1965-03-03', 'MALE', '(51) 93333-6666', 'Pós-operatório cardíaco.'),
    ('8a6d8dd8-1111-4f3b-b2c1-0c1f2030a007', 'Gabriela Lima', 'gabriela.lima@hospital.com', '777.888.999-00', '2002-12-11', 'FEMALE', '(61) 92222-7777', NULL),
    ('8a6d8dd8-1111-4f3b-b2c1-0c1f2030a008', 'Henrique Rocha', 'henrique.rocha@hospital.com', '888.999.000-11', '1995-05-08', 'MALE', '(71) 91111-8888', 'Alergia a penicilina.'),
    ('8a6d8dd8-1111-4f3b-b2c1-0c1f2030a009', 'Isabela Torres', 'isabela.torres@hospital.com', '999.000.111-22', '1984-06-18', 'FEMALE', '(85) 90000-9999', NULL),
    ('8a6d8dd8-1111-4f3b-b2c1-0c1f2030a010', 'João Pedro Amaral', 'joao.amaral@hospital.com', '000.111.222-33', '1978-02-25', 'MALE', '(91) 98888-0000', 'Acompanhamento oncológico.');

INSERT INTO public.users (id, name, email, password, role, created_at)
VALUES
    ('9b6d8dd8-2111-4f3b-b2c1-0c1f2030b001', 'Ana Bezerra', 'ana.bezerra@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'PATIENT', NOW()),
    ('9b6d8dd8-2111-4f3b-b2c1-0c1f2030b002', 'Bruno Silva', 'bruno.silva@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'PATIENT', NOW()),
    ('9b6d8dd8-2111-4f3b-b2c1-0c1f2030b003', 'Carla Nogueira', 'carla.nogueira@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'PATIENT', NOW()),
    ('9b6d8dd8-2111-4f3b-b2c1-0c1f2030b004', 'Daniel Costa', 'daniel.costa@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'PATIENT', NOW()),
    ('9b6d8dd8-2111-4f3b-b2c1-0c1f2030b005', 'Eduarda Castro', 'eduarda.castro@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'PATIENT', NOW()),
    ('9b6d8dd8-2111-4f3b-b2c1-0c1f2030b006', 'Felipe Ramos', 'felipe.ramos@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'PATIENT', NOW()),
    ('9b6d8dd8-2111-4f3b-b2c1-0c1f2030b007', 'Gabriela Lima', 'gabriela.lima@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'PATIENT', NOW()),
    ('9b6d8dd8-2111-4f3b-b2c1-0c1f2030b008', 'Henrique Rocha', 'henrique.rocha@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'PATIENT', NOW()),
    ('9b6d8dd8-2111-4f3b-b2c1-0c1f2030b009', 'Isabela Torres', 'isabela.torres@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'PATIENT', NOW()),
    ('9b6d8dd8-2111-4f3b-b2c1-0c1f2030b010', 'João Pedro Amaral', 'joao.amaral@hospital.com', '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW', 'PATIENT', NOW())
ON CONFLICT (email) DO NOTHING;
