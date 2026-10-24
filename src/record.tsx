import { ArrowRight, LocateFixed, MapPin, ShieldCheck } from "lucide-react";
import React, { useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { config } from "./config";
import { useApp } from "./context";
import { species } from "./data";
import {
  Observation,
  activeConsent,
  recordDiscovery,
  repository,
  submissionPermission,
  uid,
} from "./store";
import { Button, Heading, Photo, Pill, localTime } from "./ui";
export function Record() {
  const { id } = useParams();
  const s = species[Number(id)] || species[0];
  const { state, setState, draft, setDraft, toast } = useApp();
  const n = useNavigate();
  const task = state.tasks.find((t) => t.id === draft.taskId);
  const site = state.sites.find((x) => x.id === draft.siteId);
  const [location, setLocation] = useState(
    site?.location || (draft.photo ? "" : "Sydney · example area"),
  );
  const [siteName, setSiteName] = useState(site?.name || "");
  const [siteId, setSiteId] = useState(site?.id || "");
  const [coordinates, setCoordinates] = useState<
    | {
        lat: number;
        lon: number;
      }
    | undefined
  >(site?.coordinates);
  const [uncertainty, setUncertainty] = useState(site?.uncertainty || 1000);
  const [locError, setLocError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [provenance] = useState(
    draft.photo
      ? "User photo · simulated identification"
      : "Demo sample identification",
  );
  const [observedAt, setObservedAt] = useState(localTime());
  const [category, setCategory] = useState(s.category);
  const savingRef = useRef(false);
  if (!species[Number(id)]) return <Navigate to="/scan" replace />;
  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    let complete = false;
    try {
      const current = repository.load();
      const consent = activeConsent(current);
      if (!consent) {
        n("/consent");
        return;
      }
      const f = new FormData(e.currentTarget);
      const knownSite =
        current.sites.find((x) => x.id === siteId) ||
        current.sites.find(
          (x) =>
            x.name.trim().toLowerCase() === siteName.trim().toLowerCase() &&
            x.location.trim().toLowerCase() === location.trim().toLowerCase(),
        );
      const newSiteId = knownSite?.id || (siteName.trim() ? uid() : "");
      const when = new Date(observedAt);
      const offset = -when.getTimezoneOffset();
      const timestamp = `${observedAt}:00${offset >= 0 ? "+" : "-"}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0")}:${String(Math.abs(offset) % 60).padStart(2, "0")}`;
      const obs: Observation = {
        id: uid(),
        contributor: config.participantId,
        speciesId: draft.uncertain ? null : s.id,
        provisional: draft.uncertain ? category : "",
        observedAt: timestamp,
        createdAt: new Date().toISOString(),
        location: location.trim(),
        coordinates,
        uncertainty,
        photo: draft.photo,
        identification: draft.uncertain
          ? "Identification unconfirmed"
          : "User-confirmed demo identification",
        review:
          f.get("researchPermission") === "on"
            ? "Awaiting review"
            : "Not submitted",
        reviewNotes: "",
        method: String(f.get("method")),
        notes: String(f.get("notes") || "").trim(),
        taskId: task?.id || "",
        projectId: task?.projectId || "",
        siteId: newSiteId,
        consentId: consent.id,
        sensitive: f.get("sensitive") === "on",
        provenance,
        recordType: "HumanObservation",
        individuals: Number(f.get("individuals")),
        duration: Number(f.get("duration")),
        habitat: String(f.get("habitat")),
        activity: String(f.get("activity") || ""),
        weather: String(f.get("weather") || ""),
        research: { status: "private" },
      };
      if (f.get("researchPermission") === "on")
        obs.research = submissionPermission(obs, current);
      const result = recordDiscovery(current, obs);
      const next = {
        ...result.state,
        sites:
          result.created && siteName.trim() && !knownSite
            ? [
                ...current.sites,
                {
                  id: newSiteId,
                  name: siteName.trim(),
                  location: obs.location,
                  uncertainty,
                  habitat: obs.habitat,
                  coordinates: obs.coordinates,
                },
              ]
            : current.sites,
      };
      repository.save(next);
      complete = true;
      setState(next);
      setDraft({});
      if (!result.created) {
        toast(
          "This field event is already saved. No duplicate record or XP was added.",
        );
        n("/contributions?record=" + result.observation.id);
      } else if (draft.uncertain) {
        toast("Unconfirmed discovery saved privately.");
        n("/contributions");
      } else if (current.observations.some((o) => o.speciesId === s.id)) {
        toast("Another sighting saved. +20 Explorer XP");
        n("/card/" + s.id);
      } else n("/unlock/" + s.id);
    } catch (error) {
      setError(
        error instanceof DOMException && error.name === "QuotaExceededError"
          ? "Browser storage is full. Try a smaller photo or delete an older record."
          : error instanceof Error
            ? error.message
            : "This observation could not be saved. Please try again.",
      );
    } finally {
      if (!complete) {
        savingRef.current = false;
        setSaving(false);
      }
    }
  }

  return (
    <>
      <Heading
        eyebrow={task ? "RESEARCH TASK · " + task.title : "YOUR OBSERVATION"}
        title="Record Your Discovery"
        sub="A little detail can make a discovery more useful."
        back
      />
      <div className="record-species">
        {draft.photo ? (
          <img className="photo" src={draft.photo} alt="Your observation" />
        ) : (
          <Photo id={s.id} />
        )}
        <div>
          <h3>{draft.uncertain ? "Mystery Discovery" : s.name}</h3>
          <p>
            {draft.uncertain ? "Every discovery starts somewhere." : s.latin}
          </p>
          <Pill>
            {draft.uncertain ? "Unconfirmed" : "User-confirmed · demo"}
          </Pill>
        </div>
      </div>
      <form onSubmit={save} className="form">
        {draft.uncertain && (
          <label>
            General category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {[
                "Birds",
                "Plants",
                "Insects",
                "Mammals",
                "Fungi",
                "Unknown organism",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          Date and time
          <input
            type="datetime-local"
            required
            value={observedAt}
            max={localTime()}
            onChange={(e) => setObservedAt(e.target.value)}
          />
        </label>
        <label>
          Record provenance
          <input value={provenance} readOnly />
        </label>
        <div className="section-title">
          <h3>Where did you observe it?</h3>
          <MapPin size={18} />
        </div>
        <p className="muted">
          Location helps study species distribution. Nothing is tracked in the
          background. Coordinates stay out of exports.
        </p>
        {state.sites.length > 0 && (
          <label>
            Previously saved site
            <select
              value={siteId}
              onChange={(e) => {
                setSiteId(e.target.value);
                const selected = state.sites.find(
                  (s) => s.id === e.target.value,
                );
                if (selected) {
                  setLocation(selected.location);
                  setUncertainty(selected.uncertainty);
                  setSiteName(selected.name);
                  setCoordinates(selected.coordinates);
                }
              }}
            >
              <option value="">New or unsaved site</option>
              {state.sites.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Location description
          <input
            required
            maxLength={200}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Broad area or public park"
          />
        </label>
        <div className="form-two">
          <label>
            Location uncertainty (m)
            <input
              type="number"
              required
              min="1"
              value={uncertainty}
              onChange={(e) => setUncertainty(Number(e.target.value))}
            />
          </label>
          <label>
            Save site as (optional)
            <input
              value={siteName}
              disabled={!!siteId}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. Street tree"
            />
          </label>
        </div>
        <button
          type="button"
          className="text-link"
          onClick={() => {
            if (!navigator.geolocation) {
              setLocError(
                "Device location unavailable. Enter a manual area above.",
              );
              return;
            }
            setLocError("Requesting device location…");
            navigator.geolocation.getCurrentPosition(
              (p) => {
                setCoordinates({
                  lat: p.coords.latitude,
                  lon: p.coords.longitude,
                });
                setUncertainty(Math.ceil(p.coords.accuracy));
                setLocError(
                  "Device location attached privately. Broad description stays editable.",
                );
              },
              () =>
                setLocError("Location unavailable. Enter a manual area above."),
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
            );
          }}
        >
          <LocateFixed size={17} /> Use device location once
        </button>
        {locError && (
          <p className="muted" role="status">
            {locError}
          </p>
        )}
        <label>
          Observation notes
          {task?.id === "tree" ? " · foliage / flowering required" : ""}
          <textarea
            name="notes"
            maxLength={4000}
            rows={3}
            required={task?.id === "tree" || task?.requiresNotes}
            placeholder="What did you notice? Avoid personal information."
          />
        </label>
        <details open={!!task}>
          <summary>
            Research details {task ? "· task protocol" : "· optional context"}
          </summary>
          <div className="form-two">
            <label>
              Individuals observed
              <input
                type="number"
                name="individuals"
                min="1"
                max="100000"
                defaultValue="1"
                required
              />
            </label>
            <label>
              Duration (minutes)
              <input
                name="duration"
                type="number"
                min={task?.duration || 0}
                defaultValue={task?.duration || 0}
                required
              />
            </label>
          </div>
          <label>
            Habitat
            <select name="habitat">
              {[
                "Urban green space",
                "Garden",
                "Woodland",
                "Wetland",
                "Grassland",
                "Coastal habitat",
                "Not recorded",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Method
            <select name="method">
              <option>Visual observation</option>
              <option>Photo observation</option>
              <option>Timed stationary survey</option>
            </select>
          </label>
          <label>
            Activity
            <input name="activity" placeholder="e.g. feeding, flowering" />
          </label>
          <label>
            Weather
            <input name="weather" placeholder="e.g. clear, light wind" />
          </label>
        </details>
        <label className="checkbox">
          <input type="checkbox" name="sensitive" />
          <span>Restrict this location further (sensitive observation).</span>
        </label>
        <details className="research-save-choice">
          <summary>Research contribution · your choice</summary>
          <p>
            Saving your journal does not submit it to researchers. If you choose
            to contribute, this observation’s photo, identification, date/time,
            location and uncertainty, survey effort, habitat and notes become
            available in this browser’s research demonstration. Sensitive
            locations and photos remain restricted; collections and game
            profiles are excluded. No data leaves this browser.
          </p>
          <label className="checkbox">
            <input type="checkbox" name="researchPermission" />
            <span>
              I authorise this observation for the local biodiversity research
              demonstration.
            </span>
          </label>
        </details>
        <div className="notice">
          <ShieldCheck size={20} />
          <p>
            Save to your private journal. Research contribution is a separate
            choice above, or later in My Contributions. Nothing is sent outside
            this browser.
          </p>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          Save Observation <ArrowRight size={19} />
        </Button>
      </form>
    </>
  );
}
