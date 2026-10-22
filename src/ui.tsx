import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, X } from "lucide-react";
import { config } from "./config";
import { species } from "./data";
import imageSources from "./image-sources.json";
export function Button({
  children,
  onClick,
  secondary = false,
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      className={`button ${secondary ? "secondary" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
export function Pill({
  children,
  lavender = false,
}: {
  children: React.ReactNode;
  lavender?: boolean;
}) {
  return (
    <span className={`pill ${lavender ? "lavender" : ""}`}>{children}</span>
  );
}
export function Photo({
  id,
  className = "",
}: {
  id: number;
  className?: string;
}) {
  const [error, setError] = React.useState(false);
  const credit = imageSources[id];
  return error ? (
    <div className={"photo placeholder " + className}>
      <Leaf />
      <span>Species image unavailable</span>
    </div>
  ) : (
    <img
      className={"photo " + className}
      src={`/images/${id}.jpg`}
      style={{ objectPosition: id === 0 ? "50% 18%" : "50% 50%" }}
      alt={species[id].name}
      title={
        credit
          ? `${credit.author} Â· ${credit.license} Â· Wikimedia Commons`
          : undefined
      }
      onError={() => setError(true)}
    />
  );
}
export function Credits() {
  return (
    <>
      <Heading
        title="Nature, through their lens."
        eyebrow="PHOTOGRAPHY & SOURCES"
        sub="With thanks to the photographers who make open learning possible."
        back
      />
      {imageSources.map((r, i) => (
        <article className="credit-card" key={r.file}>
          <Photo id={i} />
          <h3>{species[i].name}</h3>
          <p>{r.author}</p>
          <a
            className="text-link"
            href={r.licenseUrl}
            target="_blank"
            rel="noreferrer"
          >
            {r.license}
          </a>
          <br />
          <a
            className="text-link"
            href={r.source}
            target="_blank"
            rel="noreferrer"
          >
            Original image & attribution
          </a>
          <p className="footnote">
            Resized and recompressed for this prototype.
            {i === 5
              ? " Reference image depicts Eucalyptus globulus subsp. maidenii; it is not an identification of a captured tree."
              : ""}
          </p>
        </article>
      ))}
      <p className="footnote">
        Outfit and Fraunces fonts use the SIL Open Font License. Companion and
        habitat illustrations are original SVG artwork created for this
        prototype.
      </p>
    </>
  );
}
export function Logo() {
  return (
    <Link className="logo" to="/home">
      <span>
        <img src="/icon.svg" alt="" width="32" height="32" />
      </span>
      {config.name}
      <i>PROTOTYPE</i>
    </Link>
  );
}
export function Heading({
  eyebrow,
  title,
  sub,
  back = false,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  back?: boolean;
}) {
  const n = useNavigate();
  return (
    <header className="page-heading">
      {back && (
        <button
          className="icon-button back"
          onClick={() => n(-1)}
          aria-label="Go back"
        >
          <ArrowLeft />
        </button>
      )}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </header>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => {
      ref.current?.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          autoFocus
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export const localTime = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
export const dateLabel = (d: string) =>
  new Date(d).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export async function readPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 15 * 1024 * 1024)
    throw new Error("Choose a photo smaller than 15 MB.");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement("canvas");
    const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    c.width = img.width * scale;
    c.height = img.height * scale;
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.78);
  } finally {
    URL.revokeObjectURL(url);
  }
}
