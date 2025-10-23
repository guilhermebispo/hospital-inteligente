/* Descrição:
 * Adicionar usuário inicial do sistema (seed);
 *
 * Senha: 123456
 *
 * Autor: Matheus Lima
 * Data: 26/08/2025
 */

INSERT INTO public.tb_usuario (id, nome, email, senha, perfil, data_criacao)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Administrador Hospital',
    'admin@hospital.com',
    '$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW',
    'ADMIN',
    NOW()
);
