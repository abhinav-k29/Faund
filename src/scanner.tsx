import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  ImagePlus,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BeePanel } from "./bee-panel";
import { useApp } from "./context";
import { species } from "./data";
import { ScanAnalysis } from "./scan-analysis";
import { Button, Heading, Modal, Photo, Pill, readPhoto } from "./ui";
export function Scanner() {
  const { draft, setDraft, toast } = useApp();
  const n = useNavigate();
  const [camera, setCamera] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState<number | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const alive = useRef(true);
  const uploadSequence = useRef(0);
  const cameraSequence = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      cameraSequence.current++;
      stream.current?.getTracks().forEach((t) => t.stop());
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  async function start() {
    const request = ++cameraSequence.current;
    setBusy(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error(
          "Live camera needs HTTPS and browser permission. Upload a photo or choose a demo sample.",
        );
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (!alive.current || request !== cameraSequence.current) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = s;
      setCamera(true);
      setTimeout(() => {
        if (video.current) video.current.srcObject = s;
      }, 0);
    } catch (e) {
      if (!alive.current || request !== cameraSequence.current) return;
      setError(
        e instanceof Error
          ? e.message
          : "Camera unavailable. Try a photo or demo sample.",
      );
    } finally {
      if (alive.current && request === cameraSequence.current) setBusy(false);
    }
  }
  function capture() {
    if (!video.current) return;
    const c = document.createElement("canvas");
    if (!video.current.videoWidth) {
      setError("Camera is still starting. Try again in a moment.");
      return;
    }
    const scale = Math.min(
      1,
      1200 / Math.max(video.current.videoWidth, video.current.videoHeight),
    );
    c.width = video.current.videoWidth * scale;
    c.height = video.current.videoHeight * scale;
    c.getContext("2d")!.drawImage(video.current, 0, 0, c.width, c.height);
    setDraft((d) => ({
      ...d,
      photo: c.toDataURL("image/jpeg", 0.75),
      provenance: "User photo · simulated identification",
    }));
    stream.current?.getTracks().forEach((t) => t.stop());
    setCamera(false);
    toast("Photo captured. Choose an example identification below.");
  }
  function analyse(id: number) {
    if (scanning !== null) return;
    if (timer.current) clearTimeout(timer.current);
    uploadSequence.current++;
    cameraSequence.current++;
    setBusy(false);
    stream.current?.getTracks().forEach((t) => t.stop());
    setCamera(false);
    setScanning(id);
    setDraft((d) => ({
      ...d,
      uncertain: false,
      provenance: d.photo
        ? "User photo · simulated identification"
        : "Demo sample identification",
    }));
    timer.current = setTimeout(() => n("/identify/" + id), 2200);
  }
  return (
    <div className="scanner-page">
      <Heading
        eyebrow="LOOK A LITTLE CLOSER"
        title="Discover a little wild."
        sub="Photograph an organism, or try a curated sample."
        back
      />
      <div
        className="camera-view immersive-camera"
        style={
          {
            "--scan-image": `url("${draft.photo || "/images/3.jpg"}")`,
          } as React.CSSProperties
        }
      >
        {camera ? (
          <video ref={video} autoPlay playsInline muted />
        ) : draft.photo ? (
          <img src={draft.photo} alt="Your locally captured organism" />
        ) : (
          <>
            <Photo id={3} />
            <div className="camera-shade" />
          </>
        )}
        <div className="viewfinder" />
        <span className="camera-label">
          <span className="live-dot" />
          {camera
            ? "CAMERA PREVIEW"
            : draft.photo
              ? "YOUR PHOTO · LOCAL ONLY"
              : "DEMO PREVIEW · BLUE-BANDED BEE"}
        </span>
        <div className="camera-instructions">
          {draft.photo
            ? "Photo captured. No AI identification performed."
            : "A little patience. A little wonder."}
        </div>
        {!camera && !draft.photo && (
          <button className="bee-scan-start" onClick={() => analyse(3)}>
            Analyse Bee Sample · Demo <ArrowRight size={15} />
          </button>
        )}
      </div>
      {error && (
        <div className="notice" role="status">
          {error}
        </div>
      )}
      <div className="camera-controls">
        <label
          className="icon-button upload"
          aria-label="Choose or take a photo"
        >
          <ImagePlus />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              const sequence = ++uploadSequence.current;
              const input = e.currentTarget;
              if (f)
                try {
                  const photo = await readPhoto(f);
                  if (!alive.current || sequence !== uploadSequence.current)
                    return;
                  cameraSequence.current++;
                  setBusy(false);
                  stream.current?.getTracks().forEach((t) => t.stop());
                  setCamera(false);
                  setDraft((d) => ({
                    ...d,
                    photo,
                    provenance: "User photo · simulated identification",
                  }));
                  toast("Photo saved locally. Choose a demo identification.");
                  setError("");
                } catch (e) {
                  if (alive.current && sequence === uploadSequence.current)
                    setError(
                      e instanceof Error
                        ? e.message
                        : "This image could not be read. Try another photograph.",
                    );
                } finally {
                  input.value = "";
                }
            }}
          />
        </label>
        <button
          className="shutter"
          disabled={busy}
          onClick={camera ? capture : start}
          aria-label={camera ? "Capture photo" : "Enable camera"}
        >
          <Camera size={27} />
        </button>
        <button
          className="icon-button"
          aria-label="Clear photo"
          onClick={() => {
            uploadSequence.current++;
            cameraSequence.current++;
            setBusy(false);
            stream.current?.getTracks().forEach((t) => t.stop());
            setCamera(false);
            setDraft((d) => ({ ...d, photo: undefined }));
            setError("");
          }}
        >
          <RefreshCw />
        </button>
      </div>
      {!camera && !draft.photo && (
        <BeePanel
          onConfirm={() => analyse(3)}
          onUncertain={() => {
            setDraft((d) => ({
              ...d,
              uncertain: true,
              provenance: "Demo sample identification",
            }));
            n("/record/3");
          }}
        />
      )}
      {draft.photo && (
        <div className="notice">
          <p>
            Your photograph stays attached throughout this journey. Select an
            explicit demo example below, or keep the identification unconfirmed
            on the result screen.
          </p>
        </div>
      )}
      <div className="section-title">
        <h2>Try a sample discovery</h2>
        <Pill>DEMO</Pill>
      </div>
      <p className="muted">
        No identification model is connected. Select an example to experience
        the discovery journey.
      </p>
      <div className="sample-grid">
        {species.map((s) => (
          <button aria-label={s.name} key={s.id} onClick={() => analyse(s.id)}>
            <Photo id={s.id} />
            <span>{s.name}</span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
      <p className="footnote">
        Observe safely. Keep your distance, leave nests alone, and stay on
        public paths.
      </p>
      {scanning !== null && (
        <ScanAnalysis
          id={scanning}
          photo={draft.photo}
          onCancel={() => {
            if (timer.current) clearTimeout(timer.current);
            setScanning(null);
          }}
        />
      )}
    </div>
  );
}
export function Identify() {
  const { id } = useParams();
  const s = species[Number(id)] || species[0];
  const n = useNavigate();
  const { draft, setDraft } = useApp();
  const [matches, setMatches] = useState(false);
  if (!species[Number(id)]) return <Navigate to="/scan" replace />;
  return (
    <>
      <Heading
        eyebrow="DEMO IDENTIFICATION"
        title="Well, look what you found."
        back
      />
      <div className="result-photo" data-species={s.id}>
        {draft.photo ? (
          <img
            className="photo"
            src={draft.photo}
            alt="Your photo · selected example has not classified this image"
          />
        ) : (
          <Photo id={s.id} />
        )}
        <Pill>Possible Match Found</Pill>
      </div>
      <p className="eyebrow top-space">SUGGESTED IDENTIFICATION</p>
      <h1>{s.name}</h1>
      <p className="latin">{s.latin}</p>
      <Pill>{s.category}</Pill>
      <p>
        Take a closer look at the colours and markings. This is a selected demo
        suggestion, not an AI result or expert verification.
      </p>
      {s.id === 3 && (
        <div className="identification-features">
          <h3>What stands out?</h3>
          <p>
            Blue or blue-green abdominal bands. A hairy thorax and two pairs of
            wings.
          </p>
          <small>
            Several Amegilla species look similar. These example features alone
            cannot confirm A. cingulata.
          </small>
        </div>
      )}
      {draft.photo && (
        <div className="notice">
          Your photo will be saved with the selected example identification. It
          has not been classified.
        </div>
      )}
      <Button
        onClick={() => {
          setDraft((d) => ({ ...d, uncertain: false }));
          n("/record/" + s.id);
        }}
      >
        Looks Right <Check size={19} />
      </Button>
      <Button secondary onClick={() => setMatches(true)}>
        Compare Similar Species
      </Button>
      <button
        className="text-button"
        onClick={() => {
          setDraft((d) => ({ ...d, uncertain: true }));
          n("/record/" + s.id);
        }}
      >
        Not Sure · save a mystery discovery
      </button>
      {matches && (
        <Modal
          title="Choose a demo alternative"
          onClose={() => setMatches(false)}
        >
          <p>These are selectable examples, not ranked visual matches.</p>
          {species
            .filter((x) => x.id !== s.id)
            .map((x) => (
              <button
                className="match-row"
                key={x.id}
                onClick={() => {
                  setMatches(false);
                  n("/identify/" + x.id);
                }}
              >
                <Photo id={x.id} />
                <div>
                  <h3>{x.name}</h3>
                  <p>{x.latin}</p>
                </div>
                <ChevronRight />
              </button>
            ))}
        </Modal>
      )}
    </>
  );
}
