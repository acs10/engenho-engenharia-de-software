"use client";

import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { STEPS } from "@/modules/domain/curriculum";
import { useStudy } from "@/modules/study/StudyProvider";

const LETTERS = "ABCD";

/** Questionário da etapa: corrige na hora e explica o porquê. Pode refazer à vontade. */
export const Quiz = observer(function Quiz({ index }: { index: number }) {
  const store = useStudy();
  const answers = store.project?.quiz[index] ?? [];
  const score = store.quizScore(index);
  return (
    <div className="card">
      {STEPS[index].quiz.map((q, qi) => {
        const chosen = answers[qi];
        const answered = chosen !== undefined && chosen !== null;
        return (
          <div className="question" key={q.question}>
            <h3>
              {qi + 1}. {q.question}
            </h3>
            <div className="options" role="radiogroup" aria-label={`Pergunta ${qi + 1}`}>
              {q.options.map((o, oi) => {
                const cls = answered && oi === chosen ? (oi === q.answer ? "correct" : "wrong") : "";
                return (
                  <button key={o} role="radio" aria-checked={oi === chosen} className={`option ${cls}`} onClick={() => store.answerQuiz(index, qi, oi)}>
                    <i>{cls === "correct" ? <Icon name="check" size={12} /> : cls === "wrong" ? <Icon name="x" size={12} /> : LETTERS[oi]}</i>
                    {o}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className="explanation">
                <b>{chosen === q.answer ? "Isso mesmo! " : "Quase. "}</b>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
      <div className="quiz-score">
        <span>
          Você acertou <b>{score.correct}</b> de {score.total}. {score.correct === score.total ? "Questionário completo!" : "Clique em outra alternativa para tentar de novo."}
        </span>
        {score.correct === score.total && <span className="badge badge-green">✓ Aprovado</span>}
      </div>
    </div>
  );
});
