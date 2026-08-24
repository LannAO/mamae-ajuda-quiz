CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  respostas JSONB NOT NULL DEFAULT '{}'::jsonb,
  branch TEXT NOT NULL DEFAULT 'principal',
  completou_quiz BOOLEAN NOT NULL DEFAULT false,
  clicou_whatsapp BOOLEAN NOT NULL DEFAULT false,
  protocolo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT, UPDATE ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer visitante pode criar lead"
  ON public.leads FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(nome) BETWEEN 2 AND 120 AND char_length(whatsapp) BETWEEN 8 AND 25);

CREATE POLICY "Visitante pode atualizar progresso do lead"
  ON public.leads FOR UPDATE TO anon, authenticated
  USING (created_at > now() - interval '2 hours')
  WITH CHECK (created_at > now() - interval '2 hours');