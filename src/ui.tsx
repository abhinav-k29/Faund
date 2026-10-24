import React, { useEffect, useRef, useId } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  secondary?: boolean;
}) {
  return (
    <button
      type={type}
      className={`button ${secondary ? "secondary" : ""}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
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
  useEffect(() => setError(false), [id]);
  const credit = imageSources[id];
  return error ? (
    <div
      className={"photo placeholder " + className}
      role="img"
      aria-label={`${species[id]?.name || "Species"} photograph unavailable`}
    >
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
          ? `${credit.author} · ${credit.license} · Wikimedia Commons`
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
            Resized and recompressed for Wilsee.
            {i === 5
              ? " Reference image depicts Eucalyptus globulus subsp. maidenii; it is not an identification of a captured tree."
              : ""}
          </p>
        </article>
      ))}
      <p className="footnote">
        Outfit and Fraunces fonts use the SIL Open Font License. Companion and
        habitat illustrations are original SVG artwork created for this Wilsee.
      </p>
    </>
  );
}
export function Logo() {
  return (
    <Link className="logo" to={config.homePath}>
      <span>
        <img
          src="/brand/wilsee-original/logo-2f0837113f.png"
          alt=""
          width="44"
          height="44"
        />
      </span>
      {config.name}
      {!config.showcase && <i>PROTOTYPE</i>}
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
  const loc = useLocation();
  return (
    <header className="page-heading">
      {back && (
        <button
          className="icon-button back"
          onClick={() =>
            window.history.state?.idx > 0
              ? n(-1)
              : n(
                  /^\/(card|character)/.test(loc.pathname)
                    ? "/collection"
                    : "/home",
                )
          }
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
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (
          e.target === ref.current &&
          r &&
          (e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom)
        )
          onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
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
  Number.isNaN(Date.parse(d))
    ? "Date not recorded"
    : new Date(d.length === 10 ? `${d}T12:00:00+10:00` : d).toLocaleDateString(
        "en-AU",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Australia/Sydney",
        },
      );
export async function readPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (!file.size)
    throw new Error("This file is empty. Choose a valid photograph.");
  if (file.type === "image/svg+xml")
    throw new Error(
      "Choose a photograph in JPEG, PNG, WebP or another supported raster image format.",
    );
  if (file.size > 15 * 1024 * 1024)
    throw new Error("Choose a photo smaller than 15 MB.");
  const url = URL.createObjectURL(file);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const img = new Image();
  try {
    img.src = url;
    await Promise.race([
      img.decode().catch(() => {
        throw new Error(
          "This image could not be read. Try a JPEG, PNG or WebP photograph.",
        );
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                "Image processing took too long. Try a smaller photograph.",
              ),
            ),
          10000,
        );
      }),
    ]);
    if (
      !img.naturalWidth ||
      !img.naturalHeight ||
      img.naturalWidth * img.naturalHeight > 80000000
    )
      throw new Error("Choose a photograph smaller than 80 megapixels.");
    const c = document.createElement("canvas");
    const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    c.width = img.width * scale;
    c.height = img.height * scale;
    const ctx = c.getContext("2d");
    if (!ctx)
      throw new Error(
        "Image processing is unavailable in this browser. Try a field-guide image.",
      );
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.78);
  } finally {
    if (timer) clearTimeout(timer);
    img.src = "";
    URL.revokeObjectURL(url);
  }
}
