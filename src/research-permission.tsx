import { useState } from "react";
import { ShieldCheck, Lock, FlaskConical, Check } from "lucide-react";
import { useApp } from "./context";
import {
  Observation,
  researchScope,
  submitResearch,
  withdrawResearch,
  canResearchAccess,
} from "./store";
import { Button, Pill } from "./ui";
export function ResearchPermissionPanel({
  observation: o,
}: {
  observation: Observation;
}) {
  const { state, setState, toast } = useApp();
  const [review, setReview] = useState(false);
  const [agree, setAgree] = useState(false);
  const [withdraw, setWithdraw] = useState(false);
  const submitted = canResearchAccess(o, state);
  return (
    <section
      className="research-permission-panel"
      aria-label="Observation research permission"
    >
      <div className="section-title">
        <h3>
          {submitted
            ? "Research submission receipt"
            : o.research?.status === "withdrawn"
              ? "Research permission withdrawn"
              : "Private observation"}
        </h3>
        {submitted ? <FlaskConical size={19} /> : <Lock size={19} />}
      </div>
      <Pill>
        {submitted
          ? "SUBMITTED · LOCAL DEMO"
          : o.research?.status === "withdrawn"
            ? "WITHDRAWN · JOURNAL RETAINED"
            : "PRIVATE · NOT IN RESEARCH VIEW"}
      </Pill>
      {o.research?.receiptId && (
        <dl className="metadata">
          <dt>Receipt</dt>
          <dd>{o.research.receiptId}</dd>
          <dt>Permission</dt>
          <dd>
            Agreement v{o.research.agreementVersion} ·{" "}
            {o.research.submittedAt
              ? new Date(o.research.submittedAt).toLocaleString("en-AU", {
                  timeZone: "Australia/Sydney",
                })
              : "Legacy permission"}
          </dd>
          {o.research.withdrawnAt && (
            <>
              <dt>Withdrawn</dt>
              <dd>
                {new Date(o.research.withdrawnAt).toLocaleString("en-AU", {
                  timeZone: "Australia/Sydney",
                })}
              </dd>
            </>
          )}
        </dl>
      )}
      <p>
        {submitted
          ? "This explicitly permitted observation is visible in this browser’s research demonstration. No research organisation received it."
          : "Your journal, card, companion and task progress are available without submitting this observation."}
      </p>
      {!submitted && !review && (
        <Button secondary onClick={() => setReview(true)}>
          Review Research Submission <ShieldCheck size={17} />
        </Button>
      )}
      {review && !submitted && (
        <div className="permission-review">
          <h3>Choose what this record contributes</h3>
          <p>{researchScope}</p>
          <p>
            Researcher identity and access are simulated in this local
            prototype. No data leaves this browser. You can withdraw this
            record’s permission here without deleting your journal entry.
          </p>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              I authorise this observation for the local biodiversity research
              demonstration.
            </span>
          </label>
          <Button
            disabled={!agree}
            onClick={() => {
              setState((s) => submitResearch(s, o.id));
              setReview(false);
              setAgree(false);
              toast(
                "Research permission recorded. Local submission receipt created.",
              );
            }}
          >
            Submit to Research Demo <Check size={17} />
          </Button>
          <Button
            secondary
            onClick={() => {
              setReview(false);
              setAgree(false);
            }}
          >
            Keep Private
          </Button>
        </div>
      )}
      {submitted && !withdraw && (
        <button className="text-link" onClick={() => setWithdraw(true)}>
          Withdraw This Research Permission
        </button>
      )}
      {withdraw && submitted && (
        <div className="permission-review">
          <p>
            Remove this record from the local research workspace? Your private
            observation and companion progress stay in your journal.
          </p>
          <Button
            secondary
            onClick={() => {
              setState((s) => withdrawResearch(s, o.id));
              setWithdraw(false);
              toast(
                "Research permission withdrawn. Private observation retained.",
              );
            }}
          >
            Confirm Permission Withdrawal
          </Button>
          <button className="text-link" onClick={() => setWithdraw(false)}>
            Cancel
          </button>
        </div>
      )}
    </section>
  );
}
