import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Leaf, Search, Sparkles } from "lucide-react";
import { species } from "./data";
import { Button, Modal, Pill } from "./ui";

export function BeePanel({
  onConfirm,
  onUncertain,
}: {
  onConfirm: () => void;
  onUncertain: () => void;
}) {
  const [compare, setCompare] = useState(false);
  const bee = species[3];
  return (
    <section className="bee-field-panel" aria-label="Bee demo field entry">
      <div className="section-mini">
        <span>FIELD ENTRY · NO. 004</span>
        <Sparkles size={16} />
      </div>
      <h2>{bee.name}</h2>
      <p className="latin">{bee.latin}</p>
      <div className="bee-entry-tags">
        <Pill>INSECT / POLLINATOR</Pill>
        <Pill lavender>DEMO SUGGESTION · UNVERIFIED</Pill>
      </div>
      <h3>Look for these details</h3>
      <ul className="bee-markers">
        <li>Blue or blue-green bands across the abdomen</li>
        <li>A hairy thorax and two pairs of wings</li>
        <li>
          A flower visitor: several <i>Amegilla</i> species look similar
        </li>
      </ul>
      <dl className="metadata">
        <dt>Habitat</dt>
        <dd>{bee.habitat}</dd>
        <dt>Ecological role</dt>
        <dd>{bee.role} · nectar & pollen</dd>
      </dl>
      <p className="bee-fact">
        <Leaf size={17} />
        <span>{bee.fact}</span>
      </p>
      <div className="bee-research-note">
        <span className="eyebrow">A SMALL VISIT. A USEFUL RECORD.</span>
        <p>
          Pollinator Watch links flower-visitor notes to a named site, date and
          survey effort. Repeat visits add context; sightings alone do not
          establish abundance.
        </p>
        <Link to="/tasks">
          Explore research missions <ArrowRight size={13} />
        </Link>
      </div>
      <button
        className="text-link bee-compare"
        onClick={() => setCompare(true)}
      >
        <Search size={15} /> Compare similar species
      </button>
      <div className="button-row">
        <Button onClick={onConfirm}>
          Looks Right · Demo <Check size={16} />
        </Button>
        <Button secondary onClick={onUncertain}>
          Not Sure
        </Button>
      </div>
      <Link className="bee-companion-link" to="/card/3">
        Blue-banded Bee card <span>↔ Bumbloom</span>
        <ArrowRight size={15} />
      </Link>
      <p className="footnote">
        Curated sample information. No image classification or confidence score.
        Save an unconfirmed record whenever unsure.
      </p>
      {compare && (
        <Modal
          title="A closer look at blue-banded bees"
          onClose={() => setCompare(false)}
        >
          <Pill>COMPARISON GUIDE · NO RANKED MATCHES</Pill>
          <h3>
            Similar <i>Amegilla</i> species
          </h3>
          <p>
            Blue bands are a useful clue, but they do not confirm{" "}
            <i>A. cingulata</i>. Several blue-banded bee species look similar.
            This prototype does not distinguish them from your image.
          </p>
          <dl className="metadata">
            <dt>Compare</dt>
            <dd>Band colour, body markings and wing details</dd>
            <dt>Keep uncertain</dt>
            <dd>
              Use an unconfirmed insect record when species-level detail is
              unclear.
            </dd>
            <dt>Demo example</dt>
            <dd>
              Blue-banded Bee · <i>Amegilla cingulata</i>
            </dd>
          </dl>
          <a
            className="text-link"
            href={bee.source}
            target="_blank"
            rel="noreferrer"
          >
            Read the blue-banded bee guide <ArrowRight size={15} />
          </a>
          <Button
            onClick={() => {
              setCompare(false);
              onConfirm();
            }}
          >
            Continue with Demo Example
          </Button>
          <Button
            secondary
            onClick={() => {
              setCompare(false);
              onUncertain();
            }}
          >
            Not Sure · Keep Unconfirmed
          </Button>
        </Modal>
      )}
    </section>
  );
}
