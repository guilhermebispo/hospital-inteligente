/* Descrição:
 * Atualiza a constraint da tabela de usuários para
 * permitir apenas os perfis ADMIN, MEDICO e PACIENTE.
 *
 * Autor: Codex
 * Data: 23/10/2025
 */

ALTER TABLE public.tb_usuario
    DROP CONSTRAINT IF EXISTS tb_usuario_perfil_check;

UPDATE public.tb_usuario
SET perfil = 'PACIENTE'
WHERE perfil = 'USER';

ALTER TABLE public.tb_usuario
    ADD CONSTRAINT tb_usuario_perfil_check
    CHECK (perfil IN ('ADMIN', 'MEDICO', 'PACIENTE'));
