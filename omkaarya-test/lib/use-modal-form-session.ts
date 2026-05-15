"use client";

import { useModalFormGuard } from "@/lib/use-modal-form-guard";
import { usePostSaveSuccess } from "@/lib/use-post-save-success";

export type UseModalFormSessionOptions = {
  isDirty: boolean;
  onClose: () => void;
};

/** Post-save countdown + unsaved close guard for list-page modals. */
export function useModalFormSession({ isDirty, onClose }: UseModalFormSessionOptions) {
  const postSave = usePostSaveSuccess();
  const modalGuard = useModalFormGuard({
    isDirty,
    enabled: !postSave.isLocked,
    onForceClose: onClose,
  });

  const completeSuccess = (message: string, onComplete: () => void) => {
    modalGuard.markClean();
    postSave.triggerSuccess({ message, onComplete });
  };

  return {
    postSave,
    modalGuard,
    completeSuccess,
    requestClose: modalGuard.requestClose,
  };
}
