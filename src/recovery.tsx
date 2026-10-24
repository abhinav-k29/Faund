import React, { useState } from "react";
import { config } from "./config";
import { useApp, draftKey } from "./context";
import { emptyState } from "./store";
import { Button, Modal } from "./ui";
export class RouteBoundary extends React.Component<
  { children: React.ReactNode; resetKey: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(
    previous: Readonly<{ children: React.ReactNode; resetKey: string }>,
  ) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey)
      this.setState({ failed: false });
  }
  render() {
    return this.state.failed ? (
      <main className="route-error">
        <h1>This little trail needs a refresh.</h1>
        <p>
          The screen could not be loaded. Your saved journal remains in this
          browser.
        </p>
        <Button onClick={() => window.location.reload()}>
          Reload this screen
        </Button>
        <a className="text-link" href="/home">
          Return Home
        </a>
      </main>
    ) : (
      this.props.children
    );
  }
}
export function StorageRecovery() {
  const { state } = useApp();
  const [confirm, setConfirm] = useState(false);
  if (!state.recoveryRequired) return null;
  return (
    <section className="storage-recovery" role="alert">
      <h2>Your saved journal needs recovery</h2>
      <p>
        Wilsee could not read the saved data. The original browser data is
        preserved and new saving is paused. Download it before choosing a fresh
        start.
      </p>
      <Button
        secondary
        onClick={() => {
          const raw = localStorage.getItem(config.storageKey) || "";
          const url = URL.createObjectURL(
            new Blob([raw], { type: "application/json" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = "wilsee-private-recovery.json";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}
      >
        Download Private Recovery Data
      </Button>
      <Button secondary onClick={() => setConfirm(true)}>
        Start a Fresh Explorer
      </Button>
      {confirm && (
        <Modal
          title="Replace unreadable local data?"
          onClose={() => setConfirm(false)}
        >
          <p>
            This deletes the unreadable journal from this browser. Download your
            private recovery data first if you want to retain it.
          </p>
          <Button
            onClick={() => {
              sessionStorage.removeItem(draftKey);
              localStorage.setItem(
                config.storageKey,
                JSON.stringify(emptyState("fresh")),
              );
              window.location.assign("/");
            }}
          >
            Reset Local Data
          </Button>
          <Button secondary onClick={() => setConfirm(false)}>
            Cancel
          </Button>
        </Modal>
      )}
    </section>
  );
}
