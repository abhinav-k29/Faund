import { config } from "./config";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Layers,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "./context";
import { Observation, exampleSites } from "./store";
import { species } from "./data";
import { Button, Heading, Modal, Photo, Pill, dateLabel } from "./ui";
import { ObservationDetails } from "./observations";
type Pin = {
  key: string;
  lat: number;
  lon: number;
  records: Observation[];
  label: string;
};
function category(o: Observation) {
  return o.speciesId === null ? "Unidentified" : species[o.speciesId].category;
}
const observationTime = (o: Observation) =>
  new Date(o.observedAt).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Australia/Sydney",
    timeZoneName: "short",
  });
function periodFor(o: Observation) {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Australia/Sydney",
  });
  const date = o.observedAt.slice(0, 10);
  if (date === today) return "Today";
  const week = new Date(today + "T12:00:00");
  week.setDate(week.getDate() - ((week.getDay() + 6) % 7));
  if (date >= week.toLocaleDateString("en-CA") && date <= today)
    return "This Week";
  return date.slice(0, 7) === today.slice(0, 7)
    ? "Earlier This Month"
    : "Earlier Field Notes";
}
export function DiscoveryMap() {
  const { state, setState, setDraft } = useApp();
  const n = useNavigate();
  const [params] = useSearchParams();
  const focus = params.get("focus") || "";
  const mission = state.tasks.find(
    (t) => t.id === params.get("task") && t.status === "Published",
  );
  const [view, setView] = useState("Map");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState(focus);
  const [detail, setDetail] = useState("");
  const [tiles, setTiles] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [more, setMore] = useState(false);
  const [limit, setLimit] = useState(50);
  const [visitLimit, setVisitLimit] = useState(20);
  useEffect(() => setLimit(50), [search, cat, from, to]);
  useEffect(() => setVisitLimit(20), [selected]);
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const rows = useMemo(
    () =>
      state.observations.filter(
        (o) =>
          (cat === "All" ||
            (cat === "Other"
              ? !["Birds", "Plants", "Insects"].includes(category(o))
              : category(o) === cat)) &&
          (!search ||
            (o.speciesId === null
              ? "Mystery Discovery"
              : species[o.speciesId].name
            )
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (!from || o.observedAt.slice(0, 10) >= from) &&
          (!to || o.observedAt.slice(0, 10) <= to),
      ),
    [state.observations, cat, search, from, to],
  );
  const pins = useMemo(() => {
    const grouped = new Map<string, Pin>();
    for (const o of rows) {
      if (o.sensitive) continue;
      const site = state.sites.find((s) => s.id === o.siteId);
      const c = o.coordinates || site?.coordinates;
      if (!c || !Number.isFinite(c.lat) || !Number.isFinite(c.lon)) continue;
      const key = o.siteId || `${c.lat.toFixed(4)},${c.lon.toFixed(4)}`;
      const pin = grouped.get(key) || {
        key,
        lat: c.lat,
        lon: c.lon,
        records: [],
        label: site?.name || o.location,
      };
      pin.records.push(o);
      grouped.set(key, pin);
    }
    return [...grouped.values()];
  }, [rows, state.sites]);
  const restricted = rows.some((o) => o.sensitive);
  const visibleRows = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.observedAt.localeCompare(a.observedAt))
        .slice(0, limit),
    [rows, limit],
  );
  const chosen = pins.find((p) => p.key === selected);
  const observation = state.observations.find((o) => o.id === detail);
  const focusSite =
    state.sites.find(
      (s) =>
        s.id === focus &&
        (pins.some((p) => p.key === s.id) ||
          exampleSites.some((e) => e.id === s.id)),
    ) || exampleSites.find((s) => s.id === focus);
  useEffect(() => {
    if (focus) {
      setSelected(focus);
      setView("Map");
    }
  }, [focus, params.get("task")]);
  useEffect(() => {
    if (view !== "Map" || !host.current) return;
    const m = L.map(host.current, {
      center: [-33.884, 151.17],
      zoom: 12,
      scrollWheelZoom: false,
      zoomAnimation: false,
      markerZoomAnimation: false,
      fadeAnimation: false,
      zoomControl: false,
      maxZoom: 18,
      minZoom: 9,
    });
    map.current = m;
    L.control.zoom({ position: "topright" }).addTo(m);
    L.imageOverlay(
      "/sydney-map.svg",
      [
        [-34.03, 150.98],
        [-33.79, 151.3],
      ],
      { opacity: 1, attribution: "Local schematic · not for navigation" },
    ).addTo(m);
    const timer = setTimeout(() => m.invalidateSize(), 120);
    return () => {
      clearTimeout(timer);
      m.stop();
      m.remove();
      map.current = null;
    };
  }, [view]);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const group = L.layerGroup().addTo(m);
    for (const p of pins) {
      const c = category(p.records[0]);
      const icon = L.divIcon({
        className:
          "discovery-pin " +
          (c === "Insects"
            ? "insect-pin"
            : c === "Plants"
              ? "plant-pin"
              : c === "Birds"
                ? "bird-pin"
                : "other-pin") +
          (p.key === focus ? " focused-pin" : ""),
        html: `<span><b>${p.records.length > 1 ? p.records.length : c === "Birds" ? "B" : c === "Plants" ? "P" : c === "Insects" ? "I" : "?"}</b></span>`,
        iconSize: [38, 44],
        iconAnchor: [19, 40],
      });
      const marker = L.marker([p.lat, p.lon], {
        icon,
        keyboard: true,
        title: p.label + " · " + p.records.length + " observations",
      }).addTo(group);
      const tooltip = document.createElement("span");
      tooltip.textContent = p.label;
      marker.bindTooltip(tooltip);
      marker.on("click", () => setSelected(p.key));
    }
    if (pins.length)
      m.fitBounds(L.latLngBounds(pins.map((p) => L.latLng(p.lat, p.lon))), {
        padding: [38, 45],
        maxZoom: 13,
        animate: false,
      });
    return () => {
      group.remove();
    };
  }, [pins, view, focus]);
  useEffect(() => {
    const m = map.current;
    if (!m || !focusSite?.coordinates) return;
    const { lat, lon } = focusSite.coordinates;
    const area = L.circle([lat, lon], {
      radius: Math.max(120, focusSite.uncertainty),
      color: "#627d43",
      fillColor: "#d2f078",
      fillOpacity: 0.3,
      weight: 2,
    }).addTo(m);
    m.setView([lat, lon], 14, { animate: false });
    return () => {
      area.remove();
    };
  }, [focusSite, view, pins]);
  useEffect(() => {
    const m = map.current;
    if (!m || !tiles || restricted) return;
    setTileError(false);
    const layer = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    ).addTo(m);
    layer.on("tileerror", () => setTileError(true));
    return () => {
      layer.remove();
    };
  }, [tiles, restricted, view]);
  const observeAgain = (o: Observation) => {
    setDraft({ siteId: o.siteId, taskId: o.taskId });
    n("/scan");
  };
  return (
    <>
      <Heading
        eyebrow="YOUR PRIVATE FIELD NOTES"
        title="My Discovery Map"
        sub="Every discovery has a place and a story."
      />
      <div className="map-privacy">
        <Lock size={14} /> Only your observations. Never shown in Community.
      </div>
      {focusSite && (
        <section className="map-focus-panel" aria-label="Task destination">
          <Pill>{mission ? "RECOMMENDED SURVEY AREA" : "SELECTED AREA"}</Pill>
          <h2>{focusSite.name}</h2>
          <p>
            {focusSite.location} · {focusSite.habitat}
          </p>
          {mission && (
            <p>
              <b>{mission.title}</b>
              <br />
              {mission.safety}
            </p>
          )}
          <small>
            Example public area · map focus only. Check access on arrival; no
            live directions or route guidance.
          </small>
          <Button
            onClick={() => {
              if (!state.sites.some((s) => s.id === focusSite.id))
                setState((s) => ({
                  ...s,
                  sites: [...s.sites, { ...focusSite }],
                }));
              setDraft({ taskId: mission?.id, siteId: focusSite.id });
              n("/scan");
            }}
          >
            Start {mission ? "Task" : "Observation"} Here{" "}
            <ArrowRight size={16} />
          </Button>
        </section>
      )}
      {focus && !focusSite && (
        <p className="notice">
          This destination has no available location. Choose a recorded site
          below or return to Tasks.
        </p>
      )}
      <div className="tabs map-tabs">
        {["Map", "List"].map((v) => (
          <button
            key={v}
            className={view === v ? "selected" : ""}
            aria-pressed={view === v}
            onClick={() => setView(v)}
          >
            {v === "Map" ? <MapPin size={17} /> : <BookOpen size={17} />} {v}
          </button>
        ))}
      </div>
      <label className="search">
        <Search size={18} />
        <input
          aria-label="Search mapped observations"
          placeholder="Find a species…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="map-filter-toggle"
          aria-label="Show map date filters"
          onClick={() => setMore(!more)}
        >
          <SlidersHorizontal size={19} />
        </button>
      </label>
      <div className="chips">
        {["All", "Birds", "Plants", "Insects", "Other"].map((c) => (
          <button
            key={c}
            className={c === cat ? "selected" : ""}
            aria-pressed={c === cat}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {more && (
        <div className="form-two map-dates">
          <label>
            From date
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            To date
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
      )}
      <div className="map-summary">
        <span>
          <b>{rows.length}</b> observations · <b>{pins.length}</b> mapped places
        </span>
        <Pill>PRIVATE</Pill>
      </div>
      {view === "Map" ? (
        <>
          <div
            className="personal-map"
            ref={host}
            role="region"
            aria-label="Interactive private observation map"
          />
          <p className="map-caption">
            Geographic pins · simplified Sydney schematic. Pan, pinch or use + /
            −. Letter markers: B birds, P plants, I insects; numbers group
            repeat visits.
          </p>
          <button
            className="text-link"
            disabled={restricted}
            onClick={() => setTiles(!tiles)}
          >
            <Layers size={15} />
            {tiles ? "Use offline schematic" : "Load street tiles · internet"}
          </button>
          {restricted && (
            <p className="footnote">
              External street tiles are disabled while sensitive records are in
              view.
            </p>
          )}
          {tiles && (
            <p className="footnote">
              OpenStreetMap receives tile requests for the viewed area. No
              observation records are sent.{" "}
              {tileError
                ? "Tiles are unavailable; the local schematic remains visible."
                : ""}
            </p>
          )}
          {rows.length > pins.reduce((a, p) => a + p.records.length, 0) && (
            <p className="notice">
              Some locations are sensitive or have no recorded coordinates.
              Their records remain in List; no location is invented.
            </p>
          )}
          <div className="map-place-list">
            {pins.slice(0, limit).map((p) => (
              <button
                key={p.key}
                onClick={() => {
                  setSelected(p.key);
                  map.current?.panTo([p.lat, p.lon], { animate: false });
                }}
              >
                <MapPin size={16} />
                <span>{p.label}</span>
                <small>
                  {new Set(p.records.map((o) => o.observedAt)).size} visits
                </small>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
          {pins.length > limit && (
            <div className="load-more">
              <p>
                {limit} of {pins.length} mapped places shown. All pins remain on
                the map.
              </p>
              <Button secondary onClick={() => setLimit((value) => value + 50)}>
                Show 50 More Places
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="map-observation-list">
          {["Today", "This Week", "Earlier This Month", "Earlier Field Notes"]
            .filter((period) =>
              visibleRows.some((o) => periodFor(o) === period),
            )
            .map((period) => (
              <section key={period}>
                <h3 className="list-date">{period}</h3>
                {visibleRows
                  .filter((o) => periodFor(o) === period)
                  .sort((a, b) => b.observedAt.localeCompare(a.observedAt))
                  .map((o) => (
                    <button
                      className="observation-row"
                      key={o.id}
                      onClick={() => setDetail(o.id)}
                    >
                      {o.photo && !o.sensitive ? (
                        <img
                          className="photo"
                          src={o.photo}
                          alt="Your recorded organism"
                        />
                      ) : o.speciesId !== null ? (
                        <Photo id={o.speciesId} />
                      ) : (
                        <span className="mystery">
                          <MapPin />
                        </span>
                      )}
                      <div>
                        <h3>
                          {o.speciesId === null
                            ? "Mystery Discovery"
                            : species[o.speciesId].name}
                        </h3>
                        <p>
                          {o.sensitive
                            ? "Sensitive location withheld"
                            : state.sites.find((s) => s.id === o.siteId)
                                ?.name || o.location}
                        </p>
                        <small>
                          {dateLabel(o.observedAt.slice(0, 10))} ·{" "}
                          {observationTime(o)}
                          <br />
                          {o.review}
                          {o.sensitive
                            ? " · restricted"
                            : ` · ± ${o.uncertainty} m`}
                        </small>
                        {o.taskId && (
                          <span className="map-task-tag">
                            {state.tasks.find((t) => t.id === o.taskId)
                              ?.title || "Linked task"}
                          </span>
                        )}
                      </div>
                      <ChevronRight size={17} />
                    </button>
                  ))}
              </section>
            ))}
        </div>
      )}
      {view === "List" && rows.length > limit && (
        <div className="load-more">
          <p>
            Showing {limit} of {rows.length} matching observations.
          </p>
          <Button secondary onClick={() => setLimit((n) => n + 50)}>
            Show 50 More Observations
          </Button>
        </div>
      )}
      {!rows.length && (
        <div className="empty">
          <MapPin />
          <h2>A little world, waiting to be mapped.</h2>
          <p>Save your first observation, or try a different filter.</p>
          <Link to="/scan" className="button">
            Discover Something New <ArrowRight size={17} />
          </Link>
        </div>
      )}
      <Link className="inline-card" to="/sites">
        <RefreshCw /> Observe Again · visit timelines <ChevronRight />
      </Link>
      <p className="footnote">
        Starting journal pins are fictional learning records at public areas.
        This map is private to your local browser.
      </p>
      {chosen && (
        <Modal title={chosen.label} onClose={() => setSelected("")}>
          <Pill>
            {new Set(chosen.records.map((o) => o.observedAt)).size} visits ·
            private place
          </Pill>
          {mission && focus === chosen.key && (
            <div className="notice">
              <MapPin size={18} />
              <p>
                <b>{mission.title}</b>
                <br />
                Recommended survey area. Close this sheet to see the highlighted
                area and start your task. No turn-by-turn navigation.
              </p>
            </div>
          )}
          {[...chosen.records]
            .sort((a, b) => b.observedAt.localeCompare(a.observedAt))
            .slice(0, visitLimit)
            .map((o) => (
              <article className="map-selected-record" key={o.id}>
                {o.photo ? (
                  <img
                    className="photo"
                    src={o.photo}
                    alt="Your recorded organism"
                  />
                ) : (
                  o.speciesId !== null && <Photo id={o.speciesId} />
                )}
                <div>
                  <span className="eyebrow">
                    {o.provenance.includes("Seeded")
                      ? config.showcase
                        ? "LEARNING RECORD · FICTIONAL"
                        : "FICTIONAL DEMO OBSERVATION"
                      : "LOCAL OBSERVATION"}
                  </span>
                  <h3>
                    {o.speciesId === null
                      ? "Mystery Discovery"
                      : species[o.speciesId].name}
                  </h3>
                  <p className="latin">
                    {o.speciesId === null
                      ? o.provisional
                      : species[o.speciesId].latin}
                  </p>
                  <p>
                    {dateLabel(o.observedAt.slice(0, 10))} ·{" "}
                    {observationTime(o)}
                    <br />
                    {o.location} · {o.habitat}
                    <br />
                    {o.identification}
                    <br />
                    {o.review} · ± {o.uncertainty} m
                  </p>
                  {o.taskId && (
                    <p className="map-task-context">
                      <b>
                        {state.tasks.find((t) => t.id === o.taskId)?.title ||
                          "Linked task"}
                      </b>
                      <br />
                      {state.projects.find((p) => p.id === o.projectId)?.title}
                    </p>
                  )}
                  {o.notes && <p className="map-note">{o.notes}</p>}
                  <small>Record {o.id}</small>
                  <div className="button-row">
                    <Button
                      secondary
                      onClick={() => {
                        setSelected("");
                        setDetail(o.id);
                      }}
                    >
                      View Observation
                    </Button>
                    {o.speciesId !== null && (
                      <Link
                        className="button secondary"
                        to={"/card/" + o.speciesId}
                      >
                        View Species Card
                      </Link>
                    )}
                  </div>
                  <button className="text-link" onClick={() => observeAgain(o)}>
                    Observe Again <RefreshCw size={15} />
                  </button>
                </div>
              </article>
            ))}
          {chosen.records.length > visitLimit && (
            <Button secondary onClick={() => setVisitLimit((n) => n + 20)}>
              Show 20 More Visits
            </Button>
          )}
          <Link
            className="inline-card"
            to={"/sites?site=" + encodeURIComponent(chosen.key)}
          >
            <RefreshCw /> View Site Timeline <ArrowRight />
          </Link>
        </Modal>
      )}
      {observation && (
        <ObservationDetails o={observation} onClose={() => setDetail("")} />
      )}
    </>
  );
}
