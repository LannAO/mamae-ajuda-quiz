-- 1) Remove the permissive UPDATE policy (any visitor could modify any recent lead)
DROP POLICY IF EXISTS "Visitante pode atualizar progresso do lead" ON public.leads;

-- 2) Revoke direct UPDATE from public roles; updates now go through a controlled function
REVOKE UPDATE ON public.leads FROM anon, authenticated;

-- 3) Explicitly deny SELECT for public roles (leads contain personal data: nome, whatsapp, respostas)
CREATE POLICY "Somente administradores podem ler leads"
ON public.leads
FOR SELECT
TO anon, authenticated
USING (false);

-- 4) Controlled progress update: only non-sensitive flag/answer fields can be changed,
--    and only for recent leads. The lead id is an unguessable UUID known only to the visitor's own session.
CREATE OR REPLACE FUNCTION public.atualizar_progresso_lead(
  p_id uuid,
  p_completou boolean DEFAULT NULL,
  p_clicou boolean DEFAULT NULL,
  p_respostas jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_id IS NULL THEN
    RAISE EXCEPTION 'id obrigatorio';
  END IF;

  UPDATE public.leads
  SET
    completou_quiz   = COALESCE(p_completou, completou_quiz),
    clicou_whatsapp  = COALESCE(p_clicou, clicou_whatsapp),
    respostas        = COALESCE(p_respostas, respostas)
  WHERE id = p_id
    AND created_at > now() - interval '2 hours';
END;
$$;

REVOKE ALL ON FUNCTION public.atualizar_progresso_lead(uuid, boolean, boolean, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.atualizar_progresso_lead(uuid, boolean, boolean, jsonb) TO anon, authenticated;