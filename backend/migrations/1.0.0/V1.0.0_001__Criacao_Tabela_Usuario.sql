/* Descrição:
 * Criação da tabela de Usuários;
 *
 * Autor: Matheus Lima
 * Data: 24/08/2025
 */

-- Tabela
DROP TABLE IF EXISTS public.tb_usuario CASCADE;

CREATE TABLE public.tb_usuario (
    id UUID NOT NULL,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(120) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(10) NOT NULL CHECK (perfil IN ('ADMIN','USER')),
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    CONSTRAINT uk_usuario_email UNIQUE (email)
);

-- Comentários
COMMENT ON TABLE public.tb_usuario IS 'Tabela de usuários do sistema';
COMMENT ON COLUMN public.tb_usuario.id IS 'Chave única do usuário (UUID)';
COMMENT ON COLUMN public.tb_usuario.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN public.tb_usuario.email IS 'E-mail do usuário (único)';
COMMENT ON COLUMN public.tb_usuario.senha IS 'Senha criptografada do usuário';
COMMENT ON COLUMN public.tb_usuario.perfil IS 'Código do perfil do usuário (ADMIN ou USER)';
COMMENT ON COLUMN public.tb_usuario.data_criacao IS 'Data de criação do registro';

-- Permissões
ALTER TABLE public.tb_usuario OWNER TO hospital_user;
GRANT ALL ON TABLE public.tb_usuario TO hospital_user;
