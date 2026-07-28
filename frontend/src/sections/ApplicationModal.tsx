import { X } from "lucide-react";
import { useEffect } from "react";
import { ApplicationForm } from "./ApplicationForm";

type ApplicationModalProps = {
  positionId: string;
  onClose: () => void;
};

export function ApplicationModal({
  positionId,
  onClose,
}: ApplicationModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="application-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Candidatura"
    >
      <button
        className="modal-backdrop"
        type="button"
        aria-label="Chiudi candidatura"
        onClick={onClose}
      />
      <div className="application-panel">
        <button
          className="modal-close icon-button"
          type="button"
          onClick={onClose}
          aria-label="Chiudi candidatura"
        >
          <X aria-hidden="true" />
        </button>
        <div className="application-scroll">
          <ApplicationForm selectedPositionId={positionId} />
        </div>
      </div>
    </div>
  );
}
