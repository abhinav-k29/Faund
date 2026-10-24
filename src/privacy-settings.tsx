import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, MapPin, ArrowUpRight } from "lucide-react";
import { useApp, draftKey } from "./context";
import { emptyState, returningState, repository } from "./store";
import { config } from "./config";
import { Button, Modal } from "./ui";

export function PrivacySettings() {
  const { state, setState, setDraft, toast } = useApp();
  const [action, setAction] = useState<"restore" | "clear" | null>(null);
  return (
    <>
      <div className="section-title">
        <h2>Privacy & settings</h2>
        <ShieldCheck size={20} />
      </div>
      <div className="settings">
        <p>
          <Lock size={17} /> Your collection, photographs and history stay in
          this browser.
        </p>
        <p>
          <MapPin size={17} /> Camera and location are used only when you choose
          them. No background tracking.
        </p>
        <p>
          <ShieldCheck size={17} /> Community Worlds contain characters and
          scenery. They cannot access observations.
        </p>
      </div>
      <details>
        <summary>About your journal and research data</summary>
        <p>
          Your starting journal and the community gardens are curated fictional
          stories. Their species identifications are unverified; they are not
          evidence of real occurrences, expert reviews or completed research.
        </p>
        <p>
          New photographs use manual identification. No AI service is connected.
          Photos are resized and re-encoded to remove source metadata. Sensitive
          locations stay off the map and out of research downloads.
        </p>
        <p>
          No data is sent to researchers. A real research contribution would
          require a separate informed agreement and permission for each
          observation. Opening Wilsee does not record consent.
        </p>
        <p>
          Data is stored on this device and is not encrypted or synced. Clearing
          browser data removes your journal. Wilsee has no analytics; optional
          online map tiles disclose the viewed area to their provider.
        </p>
      </details>
      <Link className="inline-card" to={config.researchPath}>
        Research projects & task builder <ArrowUpRight size={18} />
      </Link>
      <Link className="text-link" to="/credits">
        Photography credits & licences <ArrowUpRight size={15} />
      </Link>
      <div className="section-title">
        <h2>Your local journal</h2>
      </div>
      <Button
        secondary
        onClick={() => {
          const a = document.createElement("a");
          const url = URL.createObjectURL(
            new Blob([JSON.stringify(state, null, 2)], {
              type: "application/json",
            }),
          );
          a.href = url;
          a.download = "wilsee-private-journal.json";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}
      >
        Download My Private Journal
      </Button>
      <Button secondary onClick={() => setAction("restore")}>
        Restore Starting Journal
      </Button>
      <Button secondary onClick={() => setAction("clear")}>
        Clear My Local Data
      </Button>
      {action && (
        <Modal
          title={
            action === "restore"
              ? "Restore the starting journal?"
              : "Clear your local data?"
          }
          onClose={() => setAction(null)}
        >
          <p>
            This replaces your saved discoveries, photographs and progress in
            this browser. Download your private journal first if you want to
            keep it.
          </p>
          <Button
            onClick={() => {
              try {
                const next =
                  action === "restore"
                    ? returningState()
                    : { ...emptyState("fresh"), showcaseVersion: 1 };
                repository.save(next);
                try {
                  sessionStorage.removeItem(draftKey);
                } catch {
                  /* Storage can be disabled. */
                }
                setState(next);
                setDraft({});
                setAction(null);
                toast("Your journal has been updated.");
              } catch {
                toast(
                  "The journal could not be changed. Recover your saved data first.",
                );
              }
            }}
          >
            {action === "restore"
              ? "Restore Journal"
              : "Confirm Clear Local Data"}
          </Button>
          <Button secondary onClick={() => setAction(null)}>
            Keep My Journal
          </Button>
        </Modal>
      )}
    </>
  );
}
