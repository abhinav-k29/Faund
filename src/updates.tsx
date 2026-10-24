import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "./ui";

export function AppUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <aside className="storage-recovery" role="status">
      <p>
        A new version of Wilsee is ready. Finish saving your discovery before
        updating.
      </p>
      <Button onClick={() => updateServiceWorker(true)}>Update Wilsee</Button>
      <button className="text-link" onClick={() => setNeedRefresh(false)}>
        Later
      </button>
    </aside>
  );
}
