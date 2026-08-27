import { createFileRoute } from "@tanstack/react-router";

import { QuizFunnel } from "@/components/quiz/QuizFunnel";

const TITLE = "Auxílio Maternidade — Hedilma Almeida Advogada";
const DESCRIPTION =
  "Descubra em 2 minutos se você tem direito ao Auxílio Maternidade do INSS. Análise gratuita com especialistas em Direito Previdenciário.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <QuizFunnel />;
}
