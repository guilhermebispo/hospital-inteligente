/* Descrição:
 * Inclui o perfil MÉDICO na restrição da tabela de usuários.
 *
 * Autor: Codex
 * Data: 23/10/2025
 */

ALTER TABLE public.tb_usuario
    DROP CONSTRAINT IF EXISTS tb_usuario_perfil_check;

ALTER TABLE public.tb_usuario
    ADD CONSTRAINT tb_usuario_perfil_check
    CHECK (perfil IN ('ADMIN', 'USER', 'MEDICO'));
