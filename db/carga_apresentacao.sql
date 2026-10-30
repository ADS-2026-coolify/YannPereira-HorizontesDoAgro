-- =============================================================================
--  Horizontes do Agro - carga de dados para apresentacao
-- =============================================================================
--
--  COMO USAR
--    psql -U postgres -d sifeo_db -f carga_apresentacao.sql
--    (ou abra e execute o arquivo inteiro no pgAdmin / DBeaver)
--
--  PRE-REQUISITO
--    A aplicacao precisa ter subido pelo menos uma vez, para que o Hibernate
--    (ddl-auto=update) tenha criado as tabelas. O script avisa se faltar alguma.
--
--  ACESSO CRIADO
--    e-mail: demo@horizontesdoagro.com.br
--    senha : Demo@2026
--    Se esse e-mail ja existir, a senha atual e preservada e os dados sao
--    apenas religados a ele.
--
--  AJUSTE DE SCHEMA
--    O script remove a constraint UNIQUE(nome) de tipo_atividade, se existir.
--    Ela e resquicio de uma versao antiga da entidade (o ddl-auto=update nao
--    derruba constraints) e impede que duas propriedades tenham o mesmo tipo
--    de atividade, o que o proprio sistema precisa permitir.
--
--  PODE RODAR QUANTAS VEZES QUISER
--    Antes de inserir, o script apaga as propriedades de demonstracao deste
--    usuario e tudo que depende delas. Ensaie a apresentacao, rode de novo e
--    a base volta ao estado inicial. Nenhum dado de outro usuario e tocado.
--
--  DATAS SAO RELATIVAS A HOJE
--    Clima, atividades e documentos sao gerados a partir de CURRENT_DATE, entao
--    a base nunca parece velha, independentemente do dia da apresentacao.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    -- ----------------------------- configuracao -----------------------------
    c_email        text := 'yann@horizontesdoagro.com.br';
    c_senha        text := 'yann@2026';
    c_dias_clima_1 int  := 120;   -- historico climatico da propriedade 1
    c_dias_clima_2 int  := 45;    -- historico climatico da propriedade 2

    -- ----------------------------- estado interno ---------------------------
    v_usuario  int;
    v_s1       int;               -- Sitio Boa Esperanca
    v_s2       int;               -- Fazenda Santa Luzia
    v_sitios   int[];
    v_tipo_col text;              -- tipo da coluna documento.arquivo (bytea | oid)
    v_dia      date;
    v_seed     int;
    v_tempo    text;
    v_mm       numeric;
    d          int;
    v_faltando text;
    v_login    text;
    r          record;
    v_conflito text;

    -- arquivos de demonstracao (gerados junto com este script)
    b64_pdf text := 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA1OTUgODQyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA1IDAgUiA+PiA+PiAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAyMDcgPj4Kc3RyZWFtCkJUIC9GMSAxNiBUZiA2MCA3NjAgVGQgMTggVEwKKEhvcml6b250ZXMgZG8gQWdybykgVGogVCoKKCkgVGogVCoKKERvY3VtZW50byBkZSBkZW1vbnN0cmFjYW8uKSBUaiBUKgooQ29udGV1ZG8gZmljdGljaW8sIGdlcmFkbyBwYXJhIGEpIFRqIFQqCihhcHJlc2VudGFjYW8gZG8gVHJhYmFsaG8gZGUpIFRqIFQqCihDb25jbHVzYW8gZGUgQ3Vyc28uKSBUaiBUKgpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDEgMDAwMDAgbiAKMDAwMDAwMDQ5OSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDYgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjU2OQolJUVPRgo=';
    b64_png text := 'iVBORw0KGgoAAAANSUhEUgAAAUAAAADICAIAAAAWZq/8AAACcElEQVR4nO3bMQnAQBREwS8vBtLHwEFkRPZ5SHM8GBgB27xy534vIGqOLwB+EzCECRjCBAxhAoYwAUOYgCFMwBAmYAgTMIQJGMIEDGEChrBZ3wNECRjCBAxhAoYwAUOYgCFMwBAmYAgTMIQJGMIEDGEChjABQ5iAIcydEMIEDGEChjABQ5iAIUzAECZgCBMwhAkYwgQMYQKGMAFDmIAhTMAQ5k4IYQKGMAFDmIAhTMAQJmAIEzCECRjCBAxhAoYwAUOYgCFMwBAmYAhzJ4QwAUOYgCFMwBAmYAgTMIQJGMIEDGEChjABQ5iAIUzAECZgCBMwhLkTQpiAIUzAECZgCBMwhAkYwgQMYQKGMAFDmIAhTMAQJmAIEzCECRjC3AkhTMAQJmAIEzCECRjCBAxhAoYwAUOYgCFMwBAmYAgTMIQJGMIEDGHuhBAmYAgTMIQJGMIEDGEChjABQ5iAIUzAECZgCBMwhAkYwgQMYQKGMHdCCBMwhAkYwgQMYQKGMAFDmIAhTMAQJmAIEzCECRjCBAxhAoYwAUOYOyGECRjCBAxhAoYwAUOYgCFMwBAmYAgTMIQJGMIEDGEChjABQ5iAIcydEMIEDGEChjABQ5iAIUzAECZgCBMwhAkYwgQMYQKGMAFDmIAhTMAQ5k4IYQKGMAFDmIAhTMAQJmAIEzCECRjCBAxhAoYwAUOYgCFMwBAmYAhzJ4QwAUOYgCFMwBAmYAgTMIQJGMIEDGEChjABQ5iAIUzAECZgCBMwhLkTQpiAIUzAECZgCBMwhAkYwgQMYQKGMAFDmIAhTMAQJmAIEzCECRjC3AkhTMAQJmAIEzCEbb+EN2gQue6KAAAAAElFTkSuQmCC';
    b64_csv text := 'ZGF0YTtkZXNjcmljYW87cXVhbnRpZGFkZTt1bmlkYWRlO3ZhbG9yDQoyMDI2LTAzLTExO1VyZWlhIDQ1JTs0MDtTQUNPUzs3MjAwLDAwDQoyMDI2LTA0LTAyO1NlbWVudGUgZGUgbWlsaG87MTg7U0FDT1M7OTQ1MCwwMA0KMjAyNi0wNS0yMDtPbGVvIGRpZXNlbCBTMTA7NjAwO0xJVFJPUzs0MzgwLDAwDQo=';

BEGIN
    -- ------------------------------------------------------------------ 0. guarda
    SELECT string_agg(x.tabela, ', ') INTO v_faltando
    FROM unnest(ARRAY['usuario','sitio','setor','equipamento','funcionario','insumo',
                      'tipo_atividade','historico_atividade','clima','categoria','documento']) AS x(tabela)
    WHERE to_regclass(x.tabela) IS NULL;

    IF v_faltando IS NOT NULL THEN
        RAISE EXCEPTION 'Tabelas ausentes: %. Suba a aplicacao uma vez para o Hibernate criar o schema e rode o script de novo.', v_faltando;
    END IF;

    SELECT atttypid::regtype::text INTO v_tipo_col
    FROM pg_attribute
    WHERE attrelid = 'documento'::regclass AND attname = 'arquivo' AND NOT attisdropped;

    RAISE NOTICE 'Coluna documento.arquivo e do tipo %', v_tipo_col;

    -- ---------------------------------------------- 0.1 constraint UNIQUE orfa
    -- A entidade TipoAtividade ja teve "nome" como unique = true. Isso foi
    -- removido do codigo, mas o ddl-auto=update NUNCA derruba constraints, entao
    -- o UNIQUE(nome) continua no banco de quem rodou a versao antiga.
    -- Ele contradiz o modelo atual: cada propriedade tem os proprios tipos, e
    -- duas propriedades podem ter "Plantio". Com a constraint no lugar, o proprio
    -- sistema quebra ao cadastrar um tipo que ja existe em outra propriedade.
    FOR r IN
        SELECT c.conname
        FROM pg_constraint c
        WHERE c.conrelid = 'tipo_atividade'::regclass
          AND c.contype = 'u'
          AND (SELECT array_agg(a.attname::text ORDER BY a.attname)
                 FROM unnest(c.conkey) AS k
                 JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k)
              = ARRAY['nome']
    LOOP
        EXECUTE format('ALTER TABLE tipo_atividade DROP CONSTRAINT %I', r.conname);
        RAISE NOTICE 'Removida a constraint orfa %  (UNIQUE(nome) nao existe mais na entidade TipoAtividade)', r.conname;
    END LOOP;

    -- indice unico solto, sem constraint associada
    FOR r IN
        SELECT i.indexrelid::regclass::text AS idx
        FROM pg_index i
        WHERE i.indrelid = 'tipo_atividade'::regclass
          AND i.indisunique AND NOT i.indisprimary
          AND NOT EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = i.indexrelid)
          AND (SELECT array_agg(a.attname::text ORDER BY a.attname)
                 FROM unnest(i.indkey) AS k
                 JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k)
              = ARRAY['nome']
    LOOP
        EXECUTE format('DROP INDEX %s', r.idx);
        RAISE NOTICE 'Removido o indice unico orfao % em tipo_atividade(nome)', r.idx;
    END LOOP;

    -- ------------------------------------- 0.2 colisao com dados ja existentes
    -- funcionario.cpf e funcionario.email sao UNIQUE em todo o banco, entao um
    -- cadastro seu com o mesmo valor faria o script falhar no meio da carga
    SELECT string_agg(x.valor, ', ') INTO v_conflito
    FROM unnest(ARRAY['31860472508','65902713480','20487351690','53719048241',
                      '81630529702','14372865937','92541603851','36015927461']) AS x(valor)
    WHERE EXISTS (SELECT 1 FROM funcionario f WHERE f.cpf = x.valor);

    IF v_conflito IS NOT NULL THEN
        RAISE EXCEPTION 'Ja existem funcionarios com os CPFs % neste banco. Apague esses registros ou troque os CPFs no bloco 6 do script (precisam ter digito verificador valido).', v_conflito;
    END IF;

    SELECT string_agg(x.valor, ', ') INTO v_conflito
    FROM unnest(ARRAY['joao.ferreira@boaesperanca.com.br','maria.souza@boaesperanca.com.br',
                      'carlos.lima@boaesperanca.com.br','ana.rodrigues@boaesperanca.com.br',
                      'sebastiao.pinto@boaesperanca.com.br','rodrigo.dias@boaesperanca.com.br',
                      'fernanda.nunes@santaluzia.com.br','marcos.teixeira@santaluzia.com.br']) AS x(valor)
    WHERE EXISTS (SELECT 1 FROM funcionario f WHERE f.email = x.valor);

    IF v_conflito IS NOT NULL THEN
        RAISE EXCEPTION 'Ja existem funcionarios com os e-mails % neste banco. Apague esses registros ou troque os e-mails no bloco 6 do script.', v_conflito;
    END IF;

    -- ------------------------------------------------------------------ 1. usuario
    SELECT id INTO v_usuario FROM usuario WHERE email = c_email;

    IF v_usuario IS NULL THEN
        -- nome_usuario e cpf tambem sao UNIQUE: avisa de forma clara em vez de
        -- estourar uma violacao de constraint crua
        IF EXISTS (SELECT 1 FROM usuario WHERE cpf = '47251890305') THEN
            RAISE EXCEPTION 'Ja existe outro usuario com o CPF 47251890305. Edite o CPF no bloco de configuracao deste script (precisa ser um CPF valido) e rode de novo.';
        END IF;

        v_login := 'demo';
        WHILE EXISTS (SELECT 1 FROM usuario WHERE nome_usuario = v_login) LOOP
            v_login := 'demo' || floor(random() * 1000)::int;
        END LOOP;

        INSERT INTO usuario (nome_usuario, cpf, nome_completo, email, senha)
        VALUES (v_login, '47251890305', 'Produtor de Demonstracao', c_email,
                crypt(c_senha, gen_salt('bf', 10)))
        RETURNING id INTO v_usuario;
        RAISE NOTICE 'Usuario criado: % / % (login interno: %)', c_email, c_senha, v_login;
    ELSE
        RAISE NOTICE 'Usuario % ja existia - senha atual preservada', c_email;
    END IF;

    -- ------------------------------------------------------------------ 2. limpeza
    SELECT array_agg(id) INTO v_sitios FROM sitio WHERE usuario_id = v_usuario;

    IF v_sitios IS NOT NULL THEN
        -- large objects orfaos, quando a coluna arquivo e oid
        IF v_tipo_col = 'oid' THEN
            PERFORM lo_unlink(arquivo)
            FROM documento
            WHERE sitio_id = ANY(v_sitios) AND arquivo IS NOT NULL;
        END IF;

        DELETE FROM documento           WHERE sitio_id = ANY(v_sitios);
        DELETE FROM historico_atividade WHERE sitio_id = ANY(v_sitios);
        DELETE FROM clima               WHERE sitio_id = ANY(v_sitios);
        DELETE FROM setor               WHERE sitio_id = ANY(v_sitios);
        DELETE FROM equipamento         WHERE sitio_id = ANY(v_sitios);
        DELETE FROM insumo              WHERE sitio_id = ANY(v_sitios);
        DELETE FROM funcionario         WHERE sitio_id = ANY(v_sitios);
        DELETE FROM tipo_atividade      WHERE sitio_id = ANY(v_sitios);
        DELETE FROM sitio               WHERE id = ANY(v_sitios);
        RAISE NOTICE 'Dados anteriores da demonstracao removidos';
    END IF;

    -- ------------------------------------------------------------------ 3. propriedades
    INSERT INTO sitio (usuario_id, nome, cep, endereco, cnpj, municipio, uf) VALUES
      (v_usuario, 'Sitio Boa Esperanca', '17500-000', 'Rodovia SP-294, km 442, zona rural',
       '12834057000175', 'Marilia', 'SP')
    RETURNING id INTO v_s1;

    INSERT INTO sitio (usuario_id, nome, cep, endereco, cnpj, municipio, uf) VALUES
      (v_usuario, 'Fazenda Santa Luzia', '19800-000', 'Estrada Municipal ASS-030, km 12',
       '47301962000144', 'Assis', 'SP')
    RETURNING id INTO v_s2;

    -- ------------------------------------------------------------------ 4. setores
    INSERT INTO setor (sitio_id, nome, hectares, plantio, observacoes, status, data_encerramento) VALUES
      (v_s1, 'Talhao Norte',   18.5, 'Cafe arabica',  'Area de encosta, colheita manual nas bordas.', 'ATIVO',      NULL),
      (v_s1, 'Talhao Sul',     24.0, 'Milho',         'Solo corrigido em 2025, boa resposta a adubacao.', 'ATIVO',   NULL),
      (v_s1, 'Talhao Leste',   31.2, 'Soja',          'Maior area da propriedade, totalmente mecanizada.', 'ATIVO',  NULL),
      (v_s1, 'Horta Central',   2.4, 'Hortalicas',    'Producao para consumo interno e feira da cidade.', 'EM_PREPARO', NULL),
      (v_s1, 'Talhao Velho',    9.8, 'Pastagem',      'Area encerrada para recuperacao do solo.', 'ENCERRADO', CURRENT_DATE - 95),
      (v_s2, 'Gleba A',        40.0, 'Cana-de-acucar','Arrendada para usina da regiao.', 'ATIVO', NULL),
      (v_s2, 'Gleba B',        15.6, 'Milho',         'Segunda safra, plantio direto.', 'ATIVO', NULL);

    -- ------------------------------------------------------------------ 5. equipamentos
    INSERT INTO equipamento (sitio_id, nome, tipo, marca_modelo, ano_fabricacao, status, descricao, data_aquisicao, data_venda) VALUES
      (v_s1, 'Trator John Deere 5078E', 'Trator',        'John Deere 5078E',      2019, 'ATIVO',      'Trator principal, usado no preparo e no transporte interno.', CURRENT_DATE - 1450, NULL),
      (v_s1, 'Colheitadeira New Holland','Colheitadeira','New Holland TC5.30',    2021, 'ATIVO',      'Utilizada na colheita de milho e soja.',                       CURRENT_DATE -  980, NULL),
      (v_s1, 'Pulverizador Jacto',      'Pulverizador',  'Jacto Advance 2000',    2018, 'MANUTENCAO', 'Parado para troca de bicos e revisao da bomba.',               CURRENT_DATE - 1700, NULL),
      (v_s1, 'Grade Aradora',           'Implemento',    'Baldan CRI 20',         2017, 'ATIVO',      'Implemento de preparo de solo.',                               CURRENT_DATE - 2100, NULL),
      (v_s1, 'Caminhonete Hilux',       'Veiculo',       'Toyota Hilux SR 4x4',   2020, 'ATIVO',      'Deslocamento entre talhoes e transporte leve.',                CURRENT_DATE - 1200, NULL),
      (v_s1, 'Trator Massey 275',       'Trator',        'Massey Ferguson 275',   2005, 'VENDIDO',    'Vendido apos a compra do John Deere.',                         CURRENT_DATE - 3600, CURRENT_DATE - 320),
      (v_s2, 'Trator Valtra A750',      'Trator',        'Valtra A750',           2022, 'ATIVO',      'Trator da Fazenda Santa Luzia.',                               CURRENT_DATE -  700, NULL),
      (v_s2, 'Distribuidor de Calcario','Implemento',    'Ipacol DC 6000',        2019, 'ATIVO',      'Usado na correcao de solo das glebas.',                        CURRENT_DATE - 1100, NULL);

    -- ------------------------------------------------------------------ 6. funcionarios
    INSERT INTO funcionario (sitio_id, nome_completo, cpf, data_nascimento, telefone, email, cargo, data_admissao, status) VALUES
      (v_s1, 'Joao Batista Ferreira',   '31860472508', DATE '1978-04-12', '14991234567', 'joao.ferreira@boaesperanca.com.br',  'Encarregado de campo', CURRENT_DATE - 2200, 'ATIVO'),
      (v_s1, 'Maria Aparecida Souza',   '65902713480', DATE '1985-09-30', '14992345678', 'maria.souza@boaesperanca.com.br',    'Tratorista',           CURRENT_DATE - 1500, 'ATIVO'),
      (v_s1, 'Carlos Eduardo Lima',     '20487351690', DATE '1992-01-17', '14993456789', 'carlos.lima@boaesperanca.com.br',    'Operador de maquinas', CURRENT_DATE -  800, 'ATIVO'),
      (v_s1, 'Ana Paula Rodrigues',     '53719048241', DATE '1990-06-05', '14994567890', 'ana.rodrigues@boaesperanca.com.br',  'Auxiliar administrativo', CURRENT_DATE - 620, 'ATIVO'),
      (v_s1, 'Sebastiao Alves Pinto',   '81630529702', DATE '1969-11-23', '14995678901', 'sebastiao.pinto@boaesperanca.com.br','Trabalhador rural',    CURRENT_DATE - 2900, 'ATIVO'),
      (v_s1, 'Rodrigo Martins Dias',    '14372865937', DATE '1995-03-08', '14996789012', 'rodrigo.dias@boaesperanca.com.br',   'Trabalhador rural',    CURRENT_DATE - 1100, 'INATIVO'),
      (v_s2, 'Fernanda Ribeiro Nunes',  '92541603851', DATE '1988-07-19', '18991112233', 'fernanda.nunes@santaluzia.com.br',   'Administradora',       CURRENT_DATE - 1300, 'ATIVO'),
      (v_s2, 'Marcos Vinicius Teixeira','36015927461', DATE '1993-12-02', '18992223344', 'marcos.teixeira@santaluzia.com.br',  'Tratorista',           CURRENT_DATE -  450, 'ATIVO');

    -- ------------------------------------------------------------------ 7. insumos
    INSERT INTO insumo (sitio_id, nome, descricao, quantidade_estoque, categoria, unidade_medida, fornecedor) VALUES
      (v_s1, 'Ureia 45%',              'Fertilizante nitrogenado de cobertura.',          120.0, 'FERTILIZANTE', 'SACOS',   'Agro Insumos Marilia'),
      (v_s1, 'Superfosfato Simples',   'Fonte de fosforo para plantio.',                   80.0, 'FERTILIZANTE', 'SACOS',   'Agro Insumos Marilia'),
      (v_s1, 'Semente de Milho AG1051','Hibrido de ciclo precoce.',                        45.0, 'SEMENTE',      'SACOS',   'Sementes Vale Verde'),
      (v_s1, 'Semente de Soja BRS 232','Cultivar adaptada a regiao.',                      60.0, 'SEMENTE',      'SACOS',   'Sementes Vale Verde'),
      (v_s1, 'Glifosato 480',          'Herbicida sistemico nao seletivo.',               240.0, 'DEFENSIVO',    'LITROS',  'Defensivos Centro-Oeste'),
      (v_s1, 'Oleo Diesel S10',        'Combustivel do maquinario, tanque da sede.',     1800.0, 'OUTRO',        'LITROS',  'Posto Rodoviario Marilia'),
      (v_s1, 'Calcario Dolomitico',    'Correcao de acidez do solo.',                      32.0, 'OUTRO',        'KG',      'Mineracao Serra Azul'),
      (v_s1, 'Fungicida Azoxistrobina','Controle preventivo de ferrugem.',                 55.0, 'DEFENSIVO',    'LITROS',  'Defensivos Centro-Oeste'),
      (v_s2, 'Ureia 45%',              'Estoque da Fazenda Santa Luzia.',                  70.0, 'FERTILIZANTE', 'SACOS',   'Cooperativa de Assis'),
      (v_s2, 'Oleo Diesel S10',        'Combustivel do maquinario.',                      900.0, 'OUTRO',        'LITROS',  'Posto Assis');

    -- ------------------------------------------------------------------ 8. tipos de atividade
    INSERT INTO tipo_atividade (sitio_id, nome) VALUES
      (v_s1, 'Plantio'), (v_s1, 'Colheita'), (v_s1, 'Adubacao'),
      (v_s1, 'Pulverizacao'), (v_s1, 'Manutencao de Equipamento'), (v_s1, 'Irrigacao'),
      (v_s2, 'Plantio'), (v_s2, 'Colheita'), (v_s2, 'Adubacao');

    -- ------------------------------------------------------------------ 9. atividades
    INSERT INTO historico_atividade (sitio_id, setor_id, tipo_atividade_id, responsavel_id, equipamento_id, descricao, status, data_atividade)
    SELECT v_s1,
           (SELECT id FROM setor          WHERE sitio_id = v_s1 AND nome = a.setor),
           (SELECT id FROM tipo_atividade WHERE sitio_id = v_s1 AND nome = a.tipo),
           (SELECT id FROM funcionario    WHERE sitio_id = v_s1 AND nome_completo = a.resp),
           (SELECT id FROM equipamento    WHERE sitio_id = v_s1 AND nome = a.equip),
           a.descricao, a.status, (CURRENT_DATE - a.dias) + a.hora
    FROM (VALUES
      ('Talhao Leste','Plantio',     'Maria Aparecida Souza','Trator John Deere 5078E',    'Plantio de soja na area mecanizada, espacamento de 45 cm.',           'CONCLUIDA',   142, TIME '07:00'),
      ('Talhao Sul',  'Plantio',     'Carlos Eduardo Lima',  'Trator John Deere 5078E',    'Plantio de milho de primeira safra.',                                 'CONCLUIDA',   128, TIME '06:40'),
      ('Talhao Leste','Adubacao',    'Joao Batista Ferreira','Trator John Deere 5078E',    'Adubacao de cobertura com ureia, 180 kg por hectare.',                'CONCLUIDA',   110, TIME '08:15'),
      ('Talhao Norte','Adubacao',    'Sebastiao Alves Pinto', NULL,                        'Adubacao manual das linhas de cafe nas bordas da encosta.',           'CONCLUIDA',    96, TIME '07:30'),
      ('Talhao Sul',  'Pulverizacao','Carlos Eduardo Lima',  'Pulverizador Jacto',         'Aplicacao de herbicida pos-emergente.',                               'CONCLUIDA',    84, TIME '05:50'),
      ('Talhao Leste','Pulverizacao','Carlos Eduardo Lima',  'Pulverizador Jacto',         'Controle preventivo de ferrugem asiatica.',                           'CONCLUIDA',    70, TIME '06:10'),
      ('Talhao Sul',  'Colheita',    'Maria Aparecida Souza','Colheitadeira New Holland',  'Colheita de milho, umidade media de 16%.',                            'CONCLUIDA',    52, TIME '07:20'),
      ('Talhao Leste','Colheita',    'Maria Aparecida Souza','Colheitadeira New Holland',  'Colheita de soja, produtividade acima do esperado.',                  'CONCLUIDA',    38, TIME '06:30'),
      ('Talhao Norte','Colheita',    'Sebastiao Alves Pinto', NULL,                        'Inicio da colheita do cafe nas quadras mais maduras.',                'EM_ANDAMENTO', 12, TIME '07:00'),
      ('Horta Central','Irrigacao',  'Ana Paula Rodrigues',   NULL,                        'Ajuste do sistema de irrigacao por gotejamento.',                     'EM_ANDAMENTO',  5, TIME '09:00'),
      ('Talhao Sul',  'Manutencao de Equipamento','Joao Batista Ferreira','Pulverizador Jacto','Troca de bicos e revisao da bomba do pulverizador.',             'EM_ANDAMENTO',  3, TIME '13:30'),
      ('Talhao Leste','Adubacao',    'Joao Batista Ferreira','Trator John Deere 5078E',    'Adubacao de correcao programada para a proxima janela de plantio.',   'AGENDADA',     -4, TIME '07:00'),
      ('Talhao Norte','Pulverizacao','Carlos Eduardo Lima',  'Pulverizador Jacto',         'Pulverizacao preventiva no cafezal.',                                 'AGENDADA',     -9, TIME '06:00'),
      ('Horta Central','Plantio',    'Ana Paula Rodrigues',   NULL,                        'Plantio de hortalicas no canteiro novo.',                             'AGENDADA',    -16, TIME '08:00'),
      ('Talhao Sul',  'Irrigacao',   'Sebastiao Alves Pinto', NULL,                        'Irrigacao suspensa por causa das chuvas do periodo.',                 'CANCELADA',    27, TIME '10:00'),
      ('Talhao Leste','Manutencao de Equipamento','Maria Aparecida Souza','Grade Aradora', 'Manutencao cancelada, implemento sem uso previsto.',                  'CANCELADA',    45, TIME '14:00')
    ) AS a(setor, tipo, resp, equip, descricao, status, dias, hora);

    INSERT INTO historico_atividade (sitio_id, setor_id, tipo_atividade_id, responsavel_id, equipamento_id, descricao, status, data_atividade)
    SELECT v_s2,
           (SELECT id FROM setor          WHERE sitio_id = v_s2 AND nome = a.setor),
           (SELECT id FROM tipo_atividade WHERE sitio_id = v_s2 AND nome = a.tipo),
           (SELECT id FROM funcionario    WHERE sitio_id = v_s2 AND nome_completo = a.resp),
           (SELECT id FROM equipamento    WHERE sitio_id = v_s2 AND nome = a.equip),
           a.descricao, a.status, (CURRENT_DATE - a.dias) + a.hora
    FROM (VALUES
      ('Gleba A','Adubacao','Marcos Vinicius Teixeira','Distribuidor de Calcario','Aplicacao de calcario na gleba arrendada.', 'CONCLUIDA',    60, TIME '07:00'),
      ('Gleba B','Plantio', 'Marcos Vinicius Teixeira','Trator Valtra A750',      'Plantio direto de milho segunda safra.',    'EM_ANDAMENTO',  6, TIME '06:30'),
      ('Gleba B','Colheita','Fernanda Ribeiro Nunes',   NULL,                     'Colheita prevista para o fim do ciclo.',    'AGENDADA',    -25, TIME '07:00')
    ) AS a(setor, tipo, resp, equip, descricao, status, dias, hora);

    -- ------------------------------------------------------------------ 10. clima
    FOR d IN 0..c_dias_clima_1 LOOP
        v_dia  := CURRENT_DATE - d;
        v_seed := (extract(doy FROM v_dia)::int * 37 + d * 13 + 7) % 100;

        IF    v_seed < 44 THEN v_tempo := 'ENSOLARADO'; v_mm := 0;
        ELSIF v_seed < 69 THEN v_tempo := 'NUBLADO';    v_mm := 0;
        ELSIF v_seed < 92 THEN v_tempo := 'CHUVOSO';    v_mm := 4 + (v_seed % 34);
        ELSE                   v_tempo := 'TEMPESTADE'; v_mm := 40 + (v_seed % 46);
        END IF;

        INSERT INTO clima (sitio_id, tempo, descricao, milimetros, data_hora)
        VALUES (v_s1, v_tempo,
                CASE v_tempo
                  WHEN 'ENSOLARADO' THEN 'Ceu limpo, sem registro de precipitacao.'
                  WHEN 'NUBLADO'    THEN 'Nebulosidade durante o dia, sem chuva.'
                  WHEN 'CHUVOSO'    THEN 'Chuva distribuida ao longo do dia.'
                  ELSE                   'Temporal com vento forte, atencao as lavouras.'
                END,
                v_mm, v_dia + TIME '07:30');
    END LOOP;

    FOR d IN 0..c_dias_clima_2 LOOP
        v_dia  := CURRENT_DATE - d;
        v_seed := (extract(doy FROM v_dia)::int * 29 + d * 17 + 3) % 100;

        IF    v_seed < 50 THEN v_tempo := 'ENSOLARADO'; v_mm := 0;
        ELSIF v_seed < 74 THEN v_tempo := 'NUBLADO';    v_mm := 0;
        ELSIF v_seed < 95 THEN v_tempo := 'CHUVOSO';    v_mm := 3 + (v_seed % 28);
        ELSE                   v_tempo := 'TEMPESTADE'; v_mm := 38 + (v_seed % 40);
        END IF;

        INSERT INTO clima (sitio_id, tempo, descricao, milimetros, data_hora)
        VALUES (v_s2, v_tempo, 'Registro diario da Fazenda Santa Luzia.', v_mm, v_dia + TIME '08:00');
    END LOOP;

    -- ------------------------------------------------------------------ 11. categorias (globais)
    INSERT INTO categoria (nome, descricao)
    SELECT c.nome, c.descricao
    FROM (VALUES
      ('Nota Fiscal',        'Notas fiscais de compra e de venda.'),
      ('Recibo',             'Recibos de pagamento e de servicos avulsos.'),
      ('Contrato',           'Contratos de arrendamento, prestacao de servico e trabalho.'),
      ('Laudo Tecnico',      'Laudos agronomicos e analises de solo.'),
      ('Boleto',             'Boletos e comprovantes de pagamento.'),
      ('Manutencao',         'Ordens de servico e comprovantes de manutencao.'),
      ('Certificado',        'Certificados, licencas e documentos regulatorios.')
    ) AS c(nome, descricao)
    WHERE NOT EXISTS (SELECT 1 FROM categoria x WHERE x.nome = c.nome);

    -- ------------------------------------------------------------------ 12. documentos
    -- regra do sistema: no maximo UM vinculo por documento
    INSERT INTO documento (sitio_id, categoria_id, equipamento_id, setor_id, insumo_id, funcionario_id, atividade_id,
                           nome, descricao, data_adicionado, nome_arquivo, tipo_arquivo, receita_despesa, valor)
    SELECT v_s1,
           (SELECT id FROM categoria WHERE nome = t.categoria ORDER BY id LIMIT 1),
           (SELECT id FROM equipamento WHERE sitio_id = v_s1 AND nome = t.equip),
           (SELECT id FROM setor       WHERE sitio_id = v_s1 AND nome = t.setor),
           (SELECT id FROM insumo      WHERE sitio_id = v_s1 AND nome = t.insumo),
           (SELECT id FROM funcionario WHERE sitio_id = v_s1 AND nome_completo = t.func),
           (SELECT id FROM historico_atividade WHERE sitio_id = v_s1 AND descricao = t.ativ),
           t.nome, t.descricao, CURRENT_DATE - t.dias, t.arquivo, t.tipo, t.receita, t.valor
    FROM (VALUES
      -- vinculo: EQUIPAMENTO
      ('Nota Fiscal - Trator John Deere 5078E','Nota fiscal de aquisicao do trator principal.','Nota Fiscal',
       'Trator John Deere 5078E',NULL,NULL,NULL,NULL,'nf-trator-john-deere.pdf','application/pdf',false,289000.00,1450),
      ('OS - Revisao do Pulverizador','Ordem de servico da revisao da bomba e troca de bicos.','Manutencao',
       'Pulverizador Jacto',NULL,NULL,NULL,NULL,'os-revisao-pulverizador.pdf','application/pdf',false,3850.00,4),
      ('Recibo - Venda do Massey 275','Recibo da venda do trator antigo.','Recibo',
       'Trator Massey 275',NULL,NULL,NULL,NULL,'recibo-venda-massey.pdf','application/pdf',true,42000.00,320),
      ('Seguro da Colheitadeira','Apolice anual da colheitadeira New Holland.','Certificado',
       'Colheitadeira New Holland',NULL,NULL,NULL,NULL,'apolice-colheitadeira.pdf','application/pdf',false,7600.00,180),
      -- vinculo: SETOR
      ('Analise de Solo - Talhao Leste','Laudo de fertilidade e recomendacao de calagem.','Laudo Tecnico',
       NULL,'Talhao Leste',NULL,NULL,NULL,'analise-solo-talhao-leste.pdf','application/pdf',false,890.00,150),
      ('Foto do Talhao Norte','Registro visual do cafezal antes da colheita.','Laudo Tecnico',
       NULL,'Talhao Norte',NULL,NULL,NULL,'foto-talhao-norte.png','image/png',false,0.00,20),
      ('Contrato de Arrendamento - Talhao Velho','Contrato encerrado junto com a area.','Contrato',
       NULL,'Talhao Velho',NULL,NULL,NULL,'contrato-arrendamento.pdf','application/pdf',true,18000.00,400),
      -- vinculo: INSUMO
      ('Nota Fiscal - Ureia 45%','Compra de 120 sacos de ureia para cobertura.','Nota Fiscal',
       NULL,NULL,'Ureia 45%',NULL,NULL,'nf-ureia.pdf','application/pdf',false,21600.00,115),
      ('Nota Fiscal - Semente de Milho','Compra de sementes para a primeira safra.','Nota Fiscal',
       NULL,NULL,'Semente de Milho AG1051',NULL,NULL,'nf-semente-milho.pdf','application/pdf',false,23625.00,132),
      ('Planilha de Consumo de Insumos','Controle auxiliar de consumo exportado do sistema.','Recibo',
       NULL,NULL,'Oleo Diesel S10',NULL,NULL,'consumo-insumos.csv','text/csv',false,4380.00,45),
      -- vinculo: FUNCIONARIO
      ('Contrato de Trabalho - Joao Batista','Contrato do encarregado de campo.','Contrato',
       NULL,NULL,NULL,'Joao Batista Ferreira',NULL,'contrato-joao-batista.pdf','application/pdf',false,0.00,2200),
      ('Recibo de Pagamento - Maria Aparecida','Recibo do pagamento do mes corrente.','Recibo',
       NULL,NULL,NULL,'Maria Aparecida Souza',NULL,'recibo-maria-aparecida.pdf','application/pdf',false,3200.00,8),
      ('Rescisao - Rodrigo Martins','Termo de rescisao do contrato de trabalho.','Contrato',
       NULL,NULL,NULL,'Rodrigo Martins Dias',NULL,'rescisao-rodrigo.pdf','application/pdf',false,6400.00,60),
      -- vinculo: ATIVIDADE
      ('Comprovante - Colheita de Soja','Ticket de pesagem da carga entregue a cooperativa.','Recibo',
       NULL,NULL,NULL,NULL,'Colheita de soja, produtividade acima do esperado.','ticket-pesagem-soja.pdf','application/pdf',true,164500.00,37),
      ('Comprovante - Colheita de Milho','Nota de venda do milho colhido no Talhao Sul.','Nota Fiscal',
       NULL,NULL,NULL,NULL,'Colheita de milho, umidade media de 16%.','nf-venda-milho.pdf','application/pdf',true,98200.00,50),
      -- sem vinculo: documento geral da propriedade
      ('CCIR - Certificado de Cadastro do Imovel','Documento obrigatorio do imovel rural.','Certificado',
       NULL,NULL,NULL,NULL,NULL,'ccir-boa-esperanca.pdf','application/pdf',false,0.00,220),
      ('Boleto - Energia Eletrica','Conta de energia da sede e do sistema de irrigacao.','Boleto',
       NULL,NULL,NULL,NULL,NULL,'boleto-energia.pdf','application/pdf',false,2740.00,10),
      ('Boleto - ITR 2026','Imposto sobre a Propriedade Territorial Rural.','Boleto',
       NULL,NULL,NULL,NULL,NULL,'boleto-itr.pdf','application/pdf',false,1980.00,75)
    ) AS t(nome, descricao, categoria, equip, setor, insumo, func, ativ, arquivo, tipo, receita, valor, dias);

    INSERT INTO documento (sitio_id, categoria_id, equipamento_id, setor_id, insumo_id, funcionario_id, atividade_id,
                           nome, descricao, data_adicionado, nome_arquivo, tipo_arquivo, receita_despesa, valor)
    SELECT v_s2,
           (SELECT id FROM categoria WHERE nome = t.categoria ORDER BY id LIMIT 1),
           (SELECT id FROM equipamento WHERE sitio_id = v_s2 AND nome = t.equip),
           (SELECT id FROM setor       WHERE sitio_id = v_s2 AND nome = t.setor),
           NULL, NULL, NULL,
           t.nome, t.descricao, CURRENT_DATE - t.dias, t.arquivo, t.tipo, t.receita, t.valor
    FROM (VALUES
      ('Contrato de Arrendamento - Gleba A','Contrato com a usina da regiao.','Contrato',
       NULL,'Gleba A','contrato-gleba-a.pdf','application/pdf',true,240000.00,300),
      ('Nota Fiscal - Trator Valtra A750','Aquisicao do trator da Santa Luzia.','Nota Fiscal',
       'Trator Valtra A750',NULL,'nf-valtra.pdf','application/pdf',false,198000.00,700),
      ('Analise de Solo - Gleba B','Laudo de fertilidade da gleba de milho.','Laudo Tecnico',
       NULL,'Gleba B','analise-solo-gleba-b.pdf','application/pdf',false,760.00,90),
      ('CCIR - Santa Luzia','Certificado de cadastro do imovel rural.','Certificado',
       NULL,NULL,'ccir-santa-luzia.pdf','application/pdf',false,0.00,210)
    ) AS t(nome, descricao, categoria, equip, setor, arquivo, tipo, receita, valor, dias);

    -- ------------------------------------------------------------------ 13. conteudo dos arquivos
    -- a coluna arquivo pode ser bytea ou oid, conforme a versao do Hibernate
    IF v_tipo_col = 'oid' THEN
        EXECUTE 'UPDATE documento SET arquivo = lo_from_bytea(0, decode($1, ''base64''))
                  WHERE sitio_id = ANY($2) AND tipo_arquivo = $3'
          USING b64_pdf, ARRAY[v_s1, v_s2], 'application/pdf';
        EXECUTE 'UPDATE documento SET arquivo = lo_from_bytea(0, decode($1, ''base64''))
                  WHERE sitio_id = ANY($2) AND tipo_arquivo = $3'
          USING b64_png, ARRAY[v_s1, v_s2], 'image/png';
        EXECUTE 'UPDATE documento SET arquivo = lo_from_bytea(0, decode($1, ''base64''))
                  WHERE sitio_id = ANY($2) AND tipo_arquivo = $3'
          USING b64_csv, ARRAY[v_s1, v_s2], 'text/csv';
    ELSE
        EXECUTE 'UPDATE documento SET arquivo = decode($1, ''base64'')
                  WHERE sitio_id = ANY($2) AND tipo_arquivo = $3'
          USING b64_pdf, ARRAY[v_s1, v_s2], 'application/pdf';
        EXECUTE 'UPDATE documento SET arquivo = decode($1, ''base64'')
                  WHERE sitio_id = ANY($2) AND tipo_arquivo = $3'
          USING b64_png, ARRAY[v_s1, v_s2], 'image/png';
        EXECUTE 'UPDATE documento SET arquivo = decode($1, ''base64'')
                  WHERE sitio_id = ANY($2) AND tipo_arquivo = $3'
          USING b64_csv, ARRAY[v_s1, v_s2], 'text/csv';
    END IF;

    -- ------------------------------------------------------------------ 14. resumo
    RAISE NOTICE '--------------------------------------------------';
    RAISE NOTICE 'Carga concluida para % (id %)', c_email, v_usuario;
    RAISE NOTICE 'Propriedades ........ % (id %) e % (id %)',
        'Sitio Boa Esperanca', v_s1, 'Fazenda Santa Luzia', v_s2;
    RAISE NOTICE 'Setores ............. %', (SELECT count(*) FROM setor               WHERE sitio_id IN (v_s1, v_s2));
    RAISE NOTICE 'Equipamentos ........ %', (SELECT count(*) FROM equipamento         WHERE sitio_id IN (v_s1, v_s2));
    RAISE NOTICE 'Funcionarios ........ %', (SELECT count(*) FROM funcionario         WHERE sitio_id IN (v_s1, v_s2));
    RAISE NOTICE 'Insumos ............. %', (SELECT count(*) FROM insumo              WHERE sitio_id IN (v_s1, v_s2));
    RAISE NOTICE 'Tipos de atividade .. %', (SELECT count(*) FROM tipo_atividade      WHERE sitio_id IN (v_s1, v_s2));
    RAISE NOTICE 'Atividades .......... %', (SELECT count(*) FROM historico_atividade WHERE sitio_id IN (v_s1, v_s2));
    RAISE NOTICE 'Registros de clima .. %', (SELECT count(*) FROM clima               WHERE sitio_id IN (v_s1, v_s2));
    RAISE NOTICE 'Documentos .......... %', (SELECT count(*) FROM documento           WHERE sitio_id IN (v_s1, v_s2));
    RAISE NOTICE 'Chuva no mes atual .. % mm (Boa Esperanca)',
        (SELECT COALESCE(sum(milimetros), 0) FROM clima
          WHERE sitio_id = v_s1 AND date_trunc('month', data_hora) = date_trunc('month', CURRENT_DATE));
    RAISE NOTICE '--------------------------------------------------';
END
$$;
