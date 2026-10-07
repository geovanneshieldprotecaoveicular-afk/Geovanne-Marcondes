-- =====================================================================================
--  GEOVANNE MARCONDES · SHIELD PROTEÇÃO VEICULAR · SCRIPT 01 · BANCO COMPLETO
--
--  >>> CONFIRA O PROJETO ANTES DE RODAR: este script é SÓ do app do GEOVANNE (SHIELD). <<<
--  >>> O endereço do SQL Editor tem que ser o do projeto do Geovanne, não de outro app.   <<<
--
--  · Pode rodar mais de uma vez: usa "if not exists", "create or replace" e "drop policy if exists".
--  · Não apaga nenhum dado.
--  · Rode ANTES de subir o código no GitHub (o app procura tabelas que precisam existir).
--  · No SQL Editor, selecione TUDO (Ctrl+A) antes de clicar em Run: "Run selected" roda só o trecho marcado.
--  · Todas as tabelas e funções começam com "sh_" para nunca colidir com outro app.
-- =====================================================================================

-- ---------- 1. Perfis: quem entra no app --------------------------------------------------

create table if not exists public.sh_perfis (
  id      uuid primary key references auth.users(id) on delete cascade,
  email   text,
  nome    text not null default '',
  role    text not null default 'func' check (role in ('admin', 'func')),
  criado  timestamptz not null default now()
);
alter table public.sh_perfis enable row level security;

-- admin = o Geovanne (tudo). func = sem acesso (fica esperando liberação).
create or replace function public.sh_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.sh_perfis p where p.id = auth.uid() and p.role = 'admin');
$$;
grant execute on function public.sh_is_admin() to anon, authenticated;

-- Todo usuário novo ganha um perfil. O PRIMEIRO usuário criado vira admin; os seguintes, func.
create or replace function public.sh_novo_usuario()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.sh_perfis (id, email, role)
  values (new.id, new.email, case when exists (select 1 from public.sh_perfis where role = 'admin') then 'func' else 'admin' end)
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists sh_on_auth_user_created on auth.users;
create trigger sh_on_auth_user_created
  after insert on auth.users
  for each row execute function public.sh_novo_usuario();

-- Quem já existia antes deste script também ganha perfil (o mais antigo vira admin se ainda não houver um).
insert into public.sh_perfis (id, email, role)
select u.id, u.email,
       case when not exists (select 1 from public.sh_perfis where role = 'admin')
             and u.id = (select id from auth.users order by created_at asc limit 1)
            then 'admin' else 'func' end
from auth.users u
where not exists (select 1 from public.sh_perfis p where p.id = u.id);

drop policy if exists "sh perfil le" on public.sh_perfis;
create policy "sh perfil le" on public.sh_perfis for select to authenticated
  using (id = auth.uid() or public.sh_is_admin());
drop policy if exists "sh perfil admin altera" on public.sh_perfis;
create policy "sh perfil admin altera" on public.sh_perfis for update to authenticated
  using (public.sh_is_admin()) with check (public.sh_is_admin());

-- ---------- 2. Ajustes (uma linha só) ------------------------------------------------------
-- Guarda SÓ o que o Geovanne mudou: textos do catálogo, fotos de cada espaço, WhatsApp, mensagens.
-- O resto vem dos padrões do código (src/padroes.js).

create table if not exists public.sh_config (
  id          integer primary key default 1 check (id = 1),
  dados       jsonb not null default '{}'::jsonb,
  atualizado  timestamptz
);
insert into public.sh_config (id, dados) values (1, '{}'::jsonb) on conflict (id) do nothing;

-- ---------- 3. Clientes (cada adesão é um veículo protegido) -------------------------------

create table if not exists public.sh_clientes (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  whatsapp       text not null default '',
  cidade         text not null default '',
  tipo           text not null default 'carro' check (tipo in ('carro', 'moto', 'caminhao')),
  placa          text not null default '',
  modelo         text not null default '',
  plano          text not null default '',              -- Black · Gold · Exclusive (vazio = não informado)
  data_adesao    date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  valor          numeric(12,2) not null default 0,      -- quanto o Geovanne ganhou nesta adesão (bruto)
  recebido       boolean not null default false,
  recebido_em    date,
  data_receber   date,                                  -- quando deve cair (passou disso = atrasado)
  situacao       text not null default 'ativo' check (situacao in ('ativo', 'cancelado')),
  cancelado_em   date,
  avisado_em     timestamptz,                           -- mandou a mensagem de boas-vindas
  cotacao_id     uuid,
  obs            text not null default '',
  criado         timestamptz not null default now(),
  atualizado     timestamptz,
  excluida       timestamptz                            -- lixeira: nada some sem o botão "Apagar de vez"
);
create index if not exists sh_clientes_data_idx on public.sh_clientes (data_adesao);
create index if not exists sh_clientes_visivel_idx on public.sh_clientes (excluida);

-- ---------- 4. Outros ganhos (recorrente, bônus, premiação…) -------------------------------
-- O recorrente ainda não tem regra definida: por enquanto é lançado aqui, à mão.

create table if not exists public.sh_ganhos (
  id          uuid primary key default gen_random_uuid(),
  data        date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  tipo        text not null default 'outro' check (tipo in ('recorrente', 'bonus', 'premiacao', 'outro')),
  descricao   text not null default '',
  valor       numeric(12,2) not null default 0,
  recebido    boolean not null default true,
  criado      timestamptz not null default now(),
  atualizado  timestamptz,
  excluida    timestamptz
);
create index if not exists sh_ganhos_data_idx on public.sh_ganhos (data);

-- ---------- 5. Cotações vindas do catálogo (só texto, quase não ocupa espaço) --------------

create table if not exists public.sh_cotacoes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  whatsapp    text not null default '',
  cidade      text not null default '',
  veiculos    jsonb not null default '[]'::jsonb,       -- [{tipo, placa}]
  respostas   jsonb not null default '[]'::jsonb,       -- [{rotulo, resposta}] das perguntas do formulário
  status      text not null default 'novo' check (status in ('novo', 'contato', 'fechou', 'nao_fechou')),
  cliente_id  uuid,
  criado      timestamptz not null default now(),
  atualizado  timestamptz,
  excluida    timestamptz
);
create index if not exists sh_cotacoes_data_idx on public.sh_cotacoes (criado);

-- ---------- 6. Contagem de acessos (sem nome, telefone, IP ou localização) ------------------

create table if not exists public.sh_visitas (
  id          uuid primary key default gen_random_uuid(),
  visitor     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists sh_visitas_data_idx on public.sh_visitas (created_at);

-- ---------- 7. Regras de acesso (RLS) ------------------------------------------------------

alter table public.sh_config   enable row level security;
alter table public.sh_clientes enable row level security;
alter table public.sh_ganhos   enable row level security;
alter table public.sh_cotacoes enable row level security;
alter table public.sh_visitas  enable row level security;   -- sem política: ninguém lê nem escreve direto

-- ajustes: todo mundo lê (são os textos e as fotos do catálogo); só o Geovanne altera
drop policy if exists "sh config le" on public.sh_config;
create policy "sh config le" on public.sh_config for select to anon, authenticated using (true);
drop policy if exists "sh config admin" on public.sh_config;
create policy "sh config admin" on public.sh_config for all to authenticated
  using (public.sh_is_admin()) with check (public.sh_is_admin());

-- clientes, ganhos e cotações: só o Geovanne (o público só ENVIA cotação, pela função abaixo)
do $$
declare t text;
begin
  foreach t in array array['sh_clientes', 'sh_ganhos', 'sh_cotacoes'] loop
    execute format('drop policy if exists "sh admin tudo" on public.%I', t);
    execute format('create policy "sh admin tudo" on public.%I for all to authenticated using (public.sh_is_admin()) with check (public.sh_is_admin())', t);
  end loop;
end $$;

-- ---------- 8. Catálogo público: gravar a cotação (o visitante não lê nada, só envia) -------

create or replace function public.sh_registrar_cotacao(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_nome  text  := left(trim(coalesce(p->>'nome', '')), 120);
  v_fone  text  := left(regexp_replace(coalesce(p->>'whatsapp', ''), '\D', '', 'g'), 15);
  v_veic  jsonb := coalesce(p->'veiculos', '[]'::jsonb);
  v_resp  jsonb := coalesce(p->'respostas', '[]'::jsonb);
begin
  if length(v_nome) < 2 then return; end if;
  if jsonb_typeof(v_veic) <> 'array' or jsonb_array_length(v_veic) > 10 then v_veic := '[]'::jsonb; end if;
  if jsonb_typeof(v_resp) <> 'array' or jsonb_array_length(v_resp) > 40 or length(v_resp::text) > 8000 then v_resp := '[]'::jsonb; end if;
  -- a mesma pessoa tocando duas vezes em "enviar" não vira dois pedidos
  if v_fone <> '' and exists (select 1 from public.sh_cotacoes c
                               where c.whatsapp = v_fone and c.criado > now() - interval '3 minutes') then
    return;
  end if;
  insert into public.sh_cotacoes (nome, whatsapp, cidade, veiculos, respostas)
  values (v_nome, v_fone, left(trim(coalesce(p->>'cidade', '')), 80), v_veic, v_resp);
end; $$;
grant execute on function public.sh_registrar_cotacao(jsonb) to anon, authenticated;

-- ---------- 9. Acessos ao catálogo ---------------------------------------------------------

create or replace function public.sh_log_visit(p_visitor text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_visitor is null or length(p_visitor) < 6 or length(p_visitor) > 64 then return; end if;
  -- a mesma pessoa só conta de novo depois de 30 minutos (atualizar a página não infla o número)
  if exists (select 1 from public.sh_visitas v
              where v.visitor = p_visitor and v.created_at > now() - interval '30 minutes') then
    return;
  end if;
  insert into public.sh_visitas (visitor) values (p_visitor);
end;
$$;
grant execute on function public.sh_log_visit(text) to anon, authenticated;

-- Totais e série dos últimos 14 dias, no horário de Brasília (o banco roda em UTC). Só o Geovanne.
create or replace function public.sh_stats()
returns json language plpgsql stable security definer set search_path = public as $$
declare
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  r json;
begin
  if not public.sh_is_admin() then raise exception 'sem permissao'; end if;
  select json_build_object(
    'hoje',  (select count(*) from public.sh_visitas where (created_at at time zone 'America/Sao_Paulo')::date = hoje),
    'd7',    (select count(*) from public.sh_visitas where (created_at at time zone 'America/Sao_Paulo')::date > hoje - 7),
    'd30',   (select count(*) from public.sh_visitas where (created_at at time zone 'America/Sao_Paulo')::date > hoje - 30),
    'total', (select count(*) from public.sh_visitas),
    'porDia', (
      select coalesce(json_agg(json_build_object('dia', to_char(d, 'YYYY-MM-DD'), 'n', coalesce(c.n, 0)) order by d), '[]'::json)
      from generate_series(hoje - 13, hoje, interval '1 day') as d
      left join (
        select (created_at at time zone 'America/Sao_Paulo')::date as dia, count(*) as n
        from public.sh_visitas group by 1
      ) c on c.dia = d::date
    )
  ) into r;
  return r;
end;
$$;
grant execute on function public.sh_stats() to authenticated;

-- ---------- 10. Fotos (Storage) ------------------------------------------------------------

-- Bucket público (as fotos do catálogo precisam abrir sem login). Só imagens, até 5 MB cada.
-- As fotos que o Geovanne sobe pelo app vão na pasta "catalogo/".
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('geovanne', 'geovanne', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lista dos arquivos e tamanhos, para o medidor de espaço e a limpeza de arquivos sem uso (só o Geovanne).
create or replace function public.sh_storage_list()
returns table (nome text, tamanho bigint, criado timestamptz)
language plpgsql stable security definer set search_path = public, storage as $$
begin
  if not public.sh_is_admin() then raise exception 'sem permissao'; end if;
  return query
    select o.name::text, coalesce((o.metadata ->> 'size')::bigint, 0), o.created_at
    from storage.objects o
    where o.bucket_id = 'geovanne';
end;
$$;
grant execute on function public.sh_storage_list() to authenticated;

-- Permissões do Storage. Em alguns projetos a tabela storage.objects não pertence ao usuário do SQL Editor;
-- por isso cada política está num bloco que NÃO derruba o resto do script se falhar.
do $$
begin
  begin
    execute 'drop policy if exists "geovanne envia arquivo" on storage.objects';
    execute 'create policy "geovanne envia arquivo" on storage.objects for insert to authenticated '
         || 'with check (bucket_id = ''geovanne'' and public.sh_is_admin())';
    raise notice 'OK: permissao de ENVIAR arquivo criada.';
  exception when others then
    raise notice 'ATENCAO: crie a permissao de ENVIAR pelo painel (Storage > Policies). Motivo: %', sqlerrm;
  end;
  begin
    execute 'drop policy if exists "geovanne apaga arquivo" on storage.objects';
    execute 'create policy "geovanne apaga arquivo" on storage.objects for delete to authenticated '
         || 'using (bucket_id = ''geovanne'' and public.sh_is_admin())';
    raise notice 'OK: permissao de APAGAR arquivo criada.';
  exception when others then
    raise notice 'ATENCAO: crie a permissao de APAGAR pelo painel: Storage > Policies > geovanne > New policy > For full customization > DELETE > authenticated > USING bucket_id = ''geovanne''. Motivo: %', sqlerrm;
  end;
  begin
    execute 'drop policy if exists "geovanne le arquivo" on storage.objects';
    execute 'create policy "geovanne le arquivo" on storage.objects for select to anon, authenticated '
         || 'using (bucket_id = ''geovanne'')';
    raise notice 'OK: permissao de LER arquivo criada.';
  exception when others then
    raise notice 'ATENCAO: crie a permissao de LER pelo painel. Motivo: %', sqlerrm;
  end;
end $$;

-- ---------- 11. Conferência (tem que aparecer 3 linhas de política e o bucket "geovanne") ----

select policyname, cmd from pg_policies
 where schemaname = 'storage' and tablename = 'objects' and policyname like 'geovanne %'
 order by policyname;

select id, name, public, file_size_limit from storage.buckets where id = 'geovanne';
