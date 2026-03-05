export const STAGES = {
  IMPORT: 'IMPORT',
  SPLIT: 'SPLIT',
  SCAN: 'SCAN',
  REVIEW: 'REVIEW',
  FINDINGS: 'FINDINGS'
};

const ALLOWED = {
  IMPORT: ['SPLIT'],
  SPLIT: ['SCAN', 'IMPORT'],
  SCAN: ['REVIEW', 'IMPORT'],
  REVIEW: ['FINDINGS', 'IMPORT'],
  FINDINGS: ['IMPORT']
};

export function createFlowMachine() {
  const listeners = new Set();
  let state = {
    stage: STAGES.IMPORT,
    uploadedFiles: [],
    docs: [],
    queue: [],
    splitProgress: 0,
    scan: {
      docIndex: -1,
      pageIndex: 0,
      progress: 0,
      fastMode: false,
      openState: 'closed',
      extractionSummary: []
    },
    review: {
      progress: 0,
      currentRule: 'Idle',
      logs: []
    },
    findings: {
      selectedDocId: null,
      selectedFindingId: null,
      sortBy: 'severity-desc'
    },
    toast: null,
    runToken: 0
  };

  function emit() {
    listeners.forEach((listener) => listener(state));
  }

  return {
    getState() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    transition(nextStage) {
      if (!ALLOWED[state.stage].includes(nextStage)) return false;
      state = { ...state, stage: nextStage };
      emit();
      return true;
    },
    patch(patch) {
      state = { ...state, ...patch };
      emit();
    },
    update(updater) {
      state = updater(state);
      emit();
    },
    notify(message, tone = 'info') {
      state = {
        ...state,
        toast: { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, message, tone }
      };
      emit();
    },
    clearToast(toastId) {
      if (!state.toast || state.toast.id !== toastId) return;
      state = { ...state, toast: null };
      emit();
    },
    bumpRunToken() {
      state = { ...state, runToken: state.runToken + 1 };
      emit();
      return state.runToken;
    }
  };
}
