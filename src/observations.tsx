import { config } from "./config";
import { ChevronRight, FlaskConical, Leaf, RefreshCw } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "./context";
import { species } from "./data";
import { ResearchPermissionPanel } from "./research-permission";
import {
  Observation,
  authorisedObservations,
  canResearchAccess,
  deleteObservation,
} from "./store";
import { Button, Heading, Modal, Photo, Pill, dateLabel } from "./ui";
const identificationLabel = (value: string) =>
  config.showcase && value === "User-confirmed demo identification"
    ? "Manual identification · unverified"
    : value;
const reviewLabel = (value: string) =>
  config.showcase && value === "Demo reviewed" ? "Details checked" : value;
export function ObservationDetails({
  o,
  research = false,
  onClose,
}: {
  o: Observation;
  research?: boolean;
  onClose: () => void;
}) {
  const { state, setState, toast } = useApp();
  const [notes, setNotes] = useState(o.reviewNotes);
  const [correction, setCorrection] = useState(o.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const s = o.speciesId === null ? null : species[o.speciesId];
  const consent = state.consents.find((c) => c.id === o.consentId);
  const task = state.tasks.find((t) => t.id === o.taskId);
  if (research && !canResearchAccess(o, state))
    return (
      <Modal title="Research permission required" onClose={onClose}>
        <p>
          This private observation is unavailable in the research workspace.
        </p>
      </Modal>
    );
  return (
    <Modal title={s?.name || "Mystery Discovery"} onClose={onClose}>
      {research && o.sensitive ? (
        <div className="notice">
          Photograph withheld for this sensitive observation.
        </div>
      ) : o.photo ? (
        <img
          className="detail-photo"
          src={o.photo}
          alt="Observation photograph"
        />
      ) : s ? (
        <Photo id={s.id} className="detail-photo" />
      ) : null}
      <Pill>{reviewLabel(o.review)}</Pill>
      {!!o.missingFields?.length && (
        <p className="notice">
          Some metadata was not recorded in this older observation. Missing
          values are labelled and left blank in exports.
        </p>
      )}
      <p className="latin">{s?.latin || o.provisional}</p>
      <dl className="metadata">
        {[
          ["Record ID", o.id],
          [
            "Contributor",
            config.showcase ? "Your local journal" : o.contributor,
          ],
          ["Observed", new Date(o.observedAt).toLocaleString("en-AU")],
          [
            "Created",
            o.createdAt
              ? new Date(o.createdAt).toLocaleString("en-AU")
              : "Not recorded",
          ],
          [
            "Location",
            o.sensitive && research ? "Restricted location" : o.location,
          ],
          [
            "Coordinates",
            o.sensitive && research
              ? "Withheld"
              : o.coordinates
                ? `${o.coordinates.lat.toFixed(5)}, ${o.coordinates.lon.toFixed(5)} · private`
                : "Not collected",
          ],
          [
            "Uncertainty",
            o.missingFields?.includes("uncertainty")
              ? "Not recorded"
              : o.uncertainty + " m",
          ],
          ["Method", o.method],
          [
            "Effort",
            o.missingFields?.includes("duration")
              ? "Not recorded"
              : o.duration + " minutes",
          ],
          [
            "Individuals",
            o.missingFields?.includes("individuals")
              ? "Not recorded"
              : o.individuals,
          ],
          ["Habitat", o.habitat],
          ["Activity", o.activity || "Not recorded"],
          ["Weather", o.weather || "Not recorded"],
          ["Identification", identificationLabel(o.identification)],
          ["Task", task?.title || "Casual observation"],
          [
            "Project",
            state.projects.find(
              (p) => p.id === (o.projectId || task?.projectId),
            )?.title || "General observation dataset",
          ],
          [
            "Site",
            o.sensitive && research
              ? "Restricted"
              : state.sites.find((s) => s.id === o.siteId)?.name ||
                "Unsaved site",
          ],
          [
            "Consent",
            consent
              ? `v${consent.version} · ${dateLabel(consent.timestamp)}${consent.withdrawnAt ? " · withdrawn" : ""}`
              : "No linked consent",
          ],
          ["Provenance", o.provenance],
          ["Record type", o.recordType],
          [
            "Notes",
            research && o.sensitive
              ? "Withheld for restricted record"
              : o.notes || "None",
          ],
        ].map(([a, b]) => (
          <React.Fragment key={a}>
            <dt>{a}</dt>
            <dd>{b}</dd>
          </React.Fragment>
        ))}
      </dl>
      {!research && <ResearchPermissionPanel observation={o} />}
      {research ? (
        <>
          <label>
            {config.showcase ? "Review notes" : "Internal demo review notes"}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <div className="button-row">
            {(config.showcase
              ? ["Details checked", "Needs clarification", "Unverified"]
              : ["Demo reviewed", "Needs clarification", "Awaiting review"]
            ).map((status) => (
              <Button
                key={status}
                secondary
                onClick={() => {
                  setState((s) => ({
                    ...s,
                    observations: s.observations.map((x) =>
                      x.id === o.id
                        ? { ...x, review: status, reviewNotes: notes }
                        : x,
                    ),
                  }));
                  toast(
                    config.showcase
                      ? "Review notes saved locally. Identification remains unverified."
                      : "Local demo review saved. No expert verification asserted.",
                  );
                  onClose();
                }}
              >
                {status}
              </Button>
            ))}
          </div>
          <Button secondary onClick={() => setConfirmDelete(true)}>
            Delete Local Record
          </Button>
          <p className="footnote">
            Review is simulated. Marking a record reviewed does not
            independently verify identification.
          </p>
        </>
      ) : (
        <>
          <label>
            Correct your observation notes
            <textarea
              value={correction}
              maxLength={4000}
              onChange={(e) => setCorrection(e.target.value)}
            />
          </label>
          <Button
            secondary
            onClick={() => {
              setState((s) => ({
                ...s,
                observations: s.observations.map((x) =>
                  x.id === o.id
                    ? {
                        ...x,
                        notes: correction.slice(0, 4000),
                        review: canResearchAccess(x, s)
                          ? "Awaiting review"
                          : "Not submitted",
                      }
                    : x,
                ),
              }));
              toast("Correction saved; review reset.");
              onClose();
            }}
          >
            Save Correction
          </Button>
          <Button secondary onClick={() => setConfirmDelete(true)}>
            Delete Local Record
          </Button>
        </>
      )}
      {confirmDelete && (
        <section className="permission-review">
          <h3>Delete this local observation?</h3>
          <p>
            This removes its photograph and research submission. If it is your
            last record of this species, its companion leaves your world. Earned
            task history and Explorer XP are retained.
          </p>
          <Button
            onClick={() => {
              setState((s) => deleteObservation(s, o.id));
              toast("Local observation deleted.");
              onClose();
            }}
          >
            Confirm Delete Local Record
          </Button>
          <Button secondary onClick={() => setConfirmDelete(false)}>
            Keep Observation
          </Button>
        </section>
      )}
      <p className="footnote">
        {config.showcase
          ? "Kept on this browser. No external submission or scientific verification."
          : "Local demonstration · no external transmission or scientific verification."}
      </p>
    </Modal>
  );
}
export function Contributions() {
  const { state } = useApp();
  const loc = useLocation();
  const [selected, setSelected] = useState(
    new URLSearchParams(loc.search).get("record") || "",
  );
  const [limit, setLimit] = useState(50);
  const o = state.observations.find((o) => o.id === selected);
  return (
    <>
      <Heading
        eyebrow="YOUR CURIOSITY, IN CONTEXT"
        title="My Contributions"
        sub="From a moment outside to a structured observation."
        back
      />
      <div className="stat-grid">
        <div>
          <strong>{state.observations.length}</strong>
          <span>observations</span>
        </div>
        <div>
          <strong>
            {
              new Set(state.observations.map((o) => o.siteId).filter(Boolean))
                .size
            }
          </strong>
          <span>sites documented</span>
        </div>
        <div>
          <strong>
            {
              new Set(state.observations.map((o) => o.taskId).filter(Boolean))
                .size
            }
          </strong>
          <span>research tasks</span>
        </div>
      </div>
      <div className="notice">
        <FlaskConical />
        <p>
          {config.showcase
            ? "Your observations stay private. Starting journal entries are fictional learning records; no records are sent to researchers."
            : `${authorisedObservations(state).length} explicitly permitted records appear in the local research demonstration. Your other observations stay in your private journal. No scientific validation or external transmission is implied.`}
        </p>
      </div>
      <div className="observations-list">
        {[...state.observations]
          .sort((a, b) => b.observedAt.localeCompare(a.observedAt))
          .slice(0, limit)
          .map((o) => (
            <button
              className="observation-row"
              key={o.id}
              onClick={() => setSelected(o.id)}
            >
              {o.photo ? (
                <img src={o.photo} className="photo" alt="Observation" />
              ) : o.speciesId !== null ? (
                <Photo id={o.speciesId} />
              ) : (
                <span className="mystery">
                  <Leaf />
                </span>
              )}
              <div>
                <h3>
                  {o.speciesId === null
                    ? "Mystery Discovery"
                    : species[o.speciesId].name}
                </h3>
                <p>
                  {dateLabel(o.observedAt)} ·{" "}
                  {o.sensitive ? "Restricted site" : o.location}
                </p>
                <small>
                  {identificationLabel(o.identification)} ·{" "}
                  {o.research?.status === "illustrative"
                    ? "Learning record · " + o.review
                    : o.research?.status === "submitted"
                      ? reviewLabel(o.review)
                      : o.research?.status === "withdrawn"
                        ? "Research permission withdrawn"
                        : "Private · not submitted"}
                </small>
              </div>
              <ChevronRight size={18} />
            </button>
          ))}
      </div>
      {state.observations.length > limit && (
        <div className="load-more">
          <p>
            Showing {limit} of {state.observations.length} private observations.
          </p>
          <Button secondary onClick={() => setLimit((n) => n + 50)}>
            Show 50 More Observations
          </Button>
        </div>
      )}
      {!state.observations.length && (
        <div className="empty">
          <FlaskConical />
          <h2>Your first observation matters.</h2>
          <p>Record a discovery to see its journey here.</p>
          <Link className="button" to="/scan">
            Discover Something New
          </Link>
        </div>
      )}
      <div className="info-card">
        <Leaf />
        <div>
          <h3>How your observations could help</h3>
          <p>
            Structured records can support distribution studies, seasonal
            monitoring and repeated habitat observations when methods and
            quality are appropriate. Counts alone do not demonstrate
            conservation outcomes.
          </p>
        </div>
      </div>
      <Link className="inline-card" to="/sites">
        <RefreshCw /> Observe Again <ChevronRight />
      </Link>
      {o && <ObservationDetails o={o} onClose={() => setSelected("")} />}
    </>
  );
}
