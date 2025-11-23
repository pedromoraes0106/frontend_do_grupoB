CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS filmes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  sinopse TEXT,
  genero VARCHAR(100),
  duracao_min INTEGER,
  lancamento DATE,
  nota_media NUMERIC(4,2) DEFAULT 0,
  em_cartaz BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS atores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  nascimento DATE,
  biografia TEXT,
  nacionalidade VARCHAR(100),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS filmes_atores (
  filme_id UUID NOT NULL,
  ator_id UUID NOT NULL,
  papel VARCHAR(255),
  ordem_credito INTEGER,
  PRIMARY KEY (filme_id, ator_id),
  FOREIGN KEY (filme_id) REFERENCES filmes(id) ON DELETE CASCADE,
  FOREIGN KEY (ator_id) REFERENCES atores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filme_id UUID NOT NULL,
  nome_avaliador VARCHAR(255),
  nota INTEGER CHECK (nota >= 0 AND nota <= 10),
  comentario TEXT,
  recomendado BOOLEAN DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  FOREIGN KEY (filme_id) REFERENCES filmes(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION update_filme_nota_media()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE filmes
  SET nota_media = (
    SELECT COALESCE(AVG(nota), 0)
    FROM avaliacoes
    WHERE filme_id = NEW.filme_id AND deleted_at IS NULL
  ),
  updated_at = now()
  WHERE id = NEW.filme_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_filmes_nota_media
AFTER INSERT OR UPDATE OR DELETE ON avaliacoes
FOR EACH ROW
EXECUTE PROCEDURE update_filme_nota_media();

CREATE INDEX IF NOT EXISTS idx_filmes_deleted_at ON filmes (deleted_at);

CREATE INDEX IF NOT EXISTS idx_atores_deleted_at ON atores (deleted_at);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_deleted_at ON avaliacoes (deleted_at);

INSERT INTO filmes (titulo, genero, duracao_min, lancamento, em_cartaz)

VALUES
  ('A Origem', 'Ficção Científica', 148, '2010-07-16', false),
  ('Interestelar', 'Drama', 169, '2014-11-07', false);

INSERT INTO atores (nome, nascimento, nacionalidade)

VALUES
  ('Leonardo DiCaprio', '1974-11-11', 'Estados Unidos'),
  ('Matthew McConaughey', '1969-11-04', 'Estados Unidos');

INSERT INTO filmes_atores (filme_id, ator_id, papel, ordem_credito)

SELECT f.id, a.id,
       CASE WHEN f.titulo = 'A Origem' THEN 'Protagonista'
            ELSE 'Piloto Cooper' END,
       1
FROM filmes f, atores a

WHERE (f.titulo = 'A Origem' AND a.nome = 'Leonardo DiCaprio')
   OR (f.titulo = 'Interestelar' AND a.nome = 'Matthew McConaughey');

INSERT INTO avaliacoes (filme_id, nome_avaliador, nota, comentario, recomendado)

SELECT f.id, 'Lucas Sigoli', 9, 'Excelente filme!', true

FROM filmes f WHERE f.titulo = 'A Origem';
