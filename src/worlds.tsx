import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Heart,
  Leaf,
  Lock,
  Sparkles,
  Target,
  TreePine,
} from "lucide-react";
import { useApp } from "./context";
import { BiomeId, characterProgress, feedCharacter, speciesIds, biomeFor } from "./store";
import { Creature, Landscape } from "./Art";
import { species } from "./data";
import { Button, Heading, Modal, Pill } from "./ui";
import { Scene } from "./scene";
import { communityWorlds } from "./community-data";
export { biomeFor } from "./store";
const biomes: [BiomeId, string, string][] = [
  ["meadow", "Meadow", "Flowers & little wings"],
  ["woodland", "Woodland", "A canopy of curiosity"],
  ["wetland", "Misty Grove", "Still water, soft wonder"],
];
function CharacterControls({ id }: { id: number }) {
  const { state, setState, toast } = useApp();
  const p = characterProgress(state, id);
  const unlocked = speciesIds(state).includes(id);
  return (
    <>
      <div className="character-growth">
        <div className="progress-label">
          <span>
            Stage {p.stage} of 3 · Level {p.level}
          </span>
          <b>{p.growth}/300 Growth XP</b>
        </div>
        <div className="progress">
          <span style={{ width: p.growth / 3 + "%" }} />
        </div>
        <p>
          <Sparkles size={14} /> {state.game.availableGrowthXP} Growth XP
          available
        </p>
      </div>
      <Button
        disabled={
          !unlocked || state.game.availableGrowthXP < 10 || p.growth >= 300
        }
        onClick={() => {
          setState((s) => feedCharacter(s, id));
          toast("A little care. A little growth. +10 Growth XP");
        }}
      >
        Feed +10 Growth XP <Leaf size={17} />
      </Button>
      <Button
        secondary
        disabled={!unlocked}
        onClick={() => {
          setState((s) => ({
            ...s,
            game: { ...s.game, activeCompanionId: id },
          }));
          toast(`${species[id].pet} is your active companion.`);
        }}
      >
        {state.game.activeCompanionId === id ? (
          <>
            <Check size={17} /> Your Companion
          </>
        ) : (
          "Set as Companion"
        )}
      </Button>
      <p className="footnote">
        Growth XP is a fictional game resource. Feeding never reduces lifetime
        Explorer XP or changes scientific records, identification or review
        status.
      </p>
    </>
  );
}
export function CharacterPage() {
  const { id } = useParams();
  const n = useNavigate();
  const { state, setState } = useApp();
  const character = species[Number(id)];
  const [preview, setPreview] = useState<number | null>(null);
  useEffect(() => setPreview(null), [id]);
  if (!character) return <Navigate to="/collection" />;
  const p = characterProgress(state, character.id);
  const unlocked = speciesIds(state).includes(character.id);
  const stage = preview || p.stage;
  return (
    <>
      <Heading
        eyebrow={
          unlocked ? "YOUR ORIGINAL COMPANION" : "FICTIONAL COMPANION · PREVIEW"
        }
        title={character.pet}
        sub={character.type}
        back
      />
      <label className="character-switcher">
        Choose companion
        <select
          value={character.id}
          onChange={(e) => n("/character/" + e.target.value)}
        >
          {species
            .filter(
              (s) => speciesIds(state).includes(s.id) || s.id === character.id,
            )
            .map((s) => (
              <option value={s.id} key={s.id}>
                {s.pet}
              </option>
            ))}
        </select>
      </label>
      <Scene
        characters={[{ id: character.id, stage }]}
        mode="character"
        interaction={p.growth}
      />
      <div className="viewer-controls">
        <span>
          {preview
            ? "Preview stage · growth is unchanged"
            : "Your current evolution stage"}
        </span>
        <div className="chips">
          {[1, 2, 3].map((v) => (
            <button
              key={v}
              className={stage === v ? "selected" : ""}
              onClick={() => setPreview(v)}
              aria-label={"Preview evolution stage " + v}
            >
              Stage {v}
            </button>
          ))}
          <button
            onClick={() => setPreview(null)}
            aria-label="Show current stage"
          >
            Current
          </button>
        </div>
      </div>
      {!unlocked && (
        <div className="notice">
          <Lock size={18} />
          <p>
            This is a character preview. Discover its real species to unlock it
            in your own collection.
          </p>
        </div>
      )}
      <CharacterControls id={character.id} />
      <div className="info-card">
        <Sparkles />
        <div>
          <h3>
            {character.id === 3
              ? "Pollen Pulse"
              : character.id === 0
                ? "Blossom Boost"
                : "Wild Growth"}
          </h3>
          <p>
            A fictional ability inspired by the character’s ecological theme.
            Curious, collectible, and entirely make-believe.
          </p>
        </div>
      </div>
      <Link
        className="inline-card"
        to={"/card/" + character.id + "?side=character"}
      >
        <BookOpen /> Open Two-Sided Card <ChevronRight />
      </Link>
      <Button
        secondary
        disabled={!unlocked}
        onClick={() => {
          setState((s) => ({
            ...s,
            ecosystem: [...new Set([...s.ecosystem, character.id])],
            game: { ...s.game, selectedBiome: biomeFor(character.id) },
          }));
          n("/explore");
        }}
      >
        Visit in My World <TreePine size={18} />
      </Button>
      <Link className="text-link" to="/collection">
        Back to Collection <ArrowRight size={16} />
      </Link>
    </>
  );
}
export function ExploreWorlds() {
  const { state, setState } = useApp();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<number | null>(null);
  const tab = params.get("tab") === "community" ? "Community" : "My World";
  const ids = speciesIds(state);
  const available = (b: BiomeId) =>
    b === "meadow" || ids.some((id) => biomeFor(id) === b) || ids.length >= 3;
  const biome = available(state.game.selectedBiome)
    ? state.game.selectedBiome
    : "meadow";
  const chars = state.ecosystem
    .filter((id) => ids.includes(id) && biomeFor(id) === biome)
    .map((id) => ({ id, stage: characterProgress(state, id).stage }));
  return (
    <>
      <Heading
        eyebrow="YOUR DISCOVERIES, BROUGHT TO LIFE"
        title="Explore Worlds"
        sub="Little discoveries. Living adventures."
      />
      <div className="tabs">
        {["My World", "Community"].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() =>
              setParams(t === "Community" ? { tab: "community" } : {})
            }
          >
            {t === "My World" ? <TreePine size={17} /> : <Sparkles size={17} />}{" "}
            {t}
          </button>
        ))}
      </div>
      {tab === "Community" ? (
        <>
          <div className="section-title">
            <h2>Community Worlds</h2>
            <Pill>FICTIONAL EXAMPLES</Pill>
          </div>
          <p>
            See the little worlds other explorers could grow. Curated mock
            profiles demonstrate opt-in sharing of game assets only.
          </p>
          <div className="community-gallery">
            {communityWorlds.map((world) => (
              <Link
                className="community-card"
                data-biome={world.biome}
                key={world.id}
                to={"/community/" + world.id}
              >
                <div className="community-art">
                  <Landscape>
                    {world.characters.map((c, i) => (
                      <Creature
                        key={c.id}
                        kind={c.id}
                        stage={c.stage}
                        className={"gallery-character gallery-character-" + i}
                      />
                    ))}
                  </Landscape>
                  <Pill>PUBLIC GAME PREVIEW</Pill>
                </div>
                <div className="community-copy">
                  <span className="eyebrow">
                    {world.username} · MOCK PROFILE
                  </span>
                  <h2>{world.name}</h2>
                  <p>
                    {world.characters.map((c) => species[c.id].pet).join(" · ")}
                  </p>
                  <span className="community-view">
                    View World <ArrowRight size={16} />
                    <small>
                      <Heart size={12} /> {world.appreciations}
                    </small>
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="notice">
            <Lock size={18} />
            <p>
              Only fictional worlds and characters appear here. Your observation
              pins, photographs, locations, collection history and research
              records are never included.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="biome-selector" aria-label="Choose a biome">
            {biomes.map(([id, name, sub]) => (
              <button
                key={id}
                disabled={!available(id)}
                className={id === biome ? "selected" : ""}
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    game: { ...s.game, selectedBiome: id },
                  }))
                }
              >
                <span>
                  {id === "meadow" ? (
                    <Leaf size={19} />
                  ) : (
                    <TreePine size={19} />
                  )}
                </span>
                <strong>{name} <span className="biome-count">{state.ecosystem.filter((c) => ids.includes(c) && biomeFor(c) === id).length}</span></strong>
                <small>
                  {available(id) ? sub : "Discover more life to unlock"}
                </small>
                {!available(id) && <Lock size={12} />}
              </button>
            ))}
          </div>
          <Scene
            mode="world"
            biome={biome}
            characters={chars}
            onSelect={setSelected}
          />
          <div className="ecosystem-caption">
            <Pill lavender>{biomes.find((b) => b[0] === biome)?.[1]}</Pill>
            <h2>
              {chars.length
                ? "A little world you helped grow."
                : "A fresh beginning. Room for wonder."}
            </h2>
            <p>
              {chars.length} companions at home · {state.game.availableGrowthXP}{" "}
              Growth XP available
            </p>
          </div>
          {chars.length > 0 && (
            <div className="world-meet-buttons">
              {chars.map((c) => (
                <button key={c.id} onClick={() => setSelected(c.id)}>
                  <Creature kind={c.id} stage={c.stage} />
                  <span>Meet {species[c.id].pet}</span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          )}
          {chars.length === 0 && (
            <p className="notice">
              Discover{" "}
              {biome === "meadow"
                ? "a plant or pollinator"
                : biome === "woodland"
                  ? "a bird"
                  : "Tasmanian Blue Gum"}{" "}
              and add its companion from the two-sided card. No real-world
              travel is needed for demo samples.
            </p>
          )}
          <div className="info-card">
            <Leaf />
            <div>
              <h3>
                {biome === "meadow"
                  ? "Flowering plants + pollinators"
                  : biome === "woodland"
                    ? "Trees + shelter"
                    : "Water + habitat"}
              </h3>
              <p>
                {biome === "meadow"
                  ? "Many flowering plants depend on animal visitors to move pollen between flowers."
                  : biome === "woodland"
                    ? "Tree canopies, shrubs and the ground layer provide different places to shelter and feed."
                    : "Water availability shapes the plants and animals that can live in a place."}{" "}
                The fictional diorama is not an ecosystem-health model.
              </p>
            </div>
          </div>
        </>
      )}
      <Link className="inline-card" to="/tasks">
        <Target /> Tasks & Research Missions <ChevronRight />
      </Link>
      <Link className="text-link" to="/field-guide">
        <BookOpen size={17} /> Explore the Field Guide <ArrowRight size={15} />
      </Link>
      {selected !== null && (
        <Modal title={species[selected].pet} onClose={() => setSelected(null)}>
          <div className="selected-character">
            <Creature
              kind={selected}
              stage={characterProgress(state, selected).stage}
            />
            <Pill lavender>{species[selected].type}</Pill>
          </div>
          <CharacterControls id={selected} />
          <Link to={"/character/" + selected} className="button secondary">
            Inspect in 3D <ArrowRight size={17} />
          </Link>
          <Link
            to={"/card/" + selected + "?side=character"}
            className="text-link"
          >
            View Card <BookOpen size={16} />
          </Link>
        </Modal>
      )}
    </>
  );
}
export function CommunityViewer() {
  const { id } = useParams();
  const { state, setState, toast } = useApp();
  const world = communityWorlds.find((w) => w.id === id);
  const [selected, setSelected] = useState<number | null>(null);
  if (!world) return <Navigate to="/explore?tab=community" />;
  const appreciated = state.game.appreciations.includes(world.id);
  return (
    <>
      <Heading
        eyebrow={world.username + " · FICTIONAL MOCK PROFILE"}
        title={world.name}
        sub="Community world · public game assets only"
        back
      />
      <Scene
        mode="world"
        biome={world.biome}
        characters={world.characters}
        onSelect={setSelected}
      />
      <p>{world.description}</p>
      <Button
        secondary
        onClick={() => {
          setState((s) => ({
            ...s,
            game: {
              ...s.game,
              appreciations: s.game.appreciations.includes(world.id)
                ? s.game.appreciations.filter((x) => x !== world.id)
                : [...s.game.appreciations, world.id],
            },
          }));
          toast(
            appreciated
              ? "Appreciation removed."
              : "A little appreciation, saved locally.",
          );
        }}
      >
        <Heart size={18} fill={appreciated ? "currentColor" : "none"} />{" "}
        {appreciated ? "Appreciated" : "Appreciate this world"} ·{" "}
        {world.appreciations + (appreciated ? 1 : 0)}
      </Button>
      <div className="world-meet-buttons">
        {world.characters.map((c) => (
          <button key={c.id} onClick={() => setSelected(c.id)}>
            <Creature kind={c.id} stage={c.stage} />
            <span>Meet {species[c.id].pet}</span>
            <ChevronRight size={15} />
          </button>
        ))}
      </div>
      <div className="notice">
        <Lock size={18} />
        <p>
          This public preview is built only from curated fictional characters
          and decorations. It has no access to observation photographs,
          coordinates, dates, consent or research records.
        </p>
      </div>
      <Link to="/explore?tab=community" className="text-link">
        Back to Community <ArrowRight size={16} />
      </Link>
      {selected !== null && (
        <Modal
          title={species[selected].pet + " · fictional guest"}
          onClose={() => setSelected(null)}
        >
          <div className="selected-character">
            <Creature
              kind={selected}
              stage={world.characters.find((c) => c.id === selected)?.stage}
            />
            <Pill lavender>{species[selected].type}</Pill>
          </div>
          <p>
            A fictional companion displayed in {world.username}’s example world.
            Viewing it does not unlock it in your collection or change any
            observation record.
          </p>
          <Button secondary onClick={() => setSelected(null)}>
            Return to World
          </Button>
        </Modal>
      )}
    </>
  );
}
