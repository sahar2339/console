import { K8sResourceKind } from '@console/internal/module/k8s';

type State = {
  currentns: string;
  tons: string;
  progress: boolean;
  error: string;
  payload: K8sResourceKind;
};

export const defaultState = {
  currentns: '',
  tons: '',
  progress: false,
  error: '',
  payload: {},
};

type Action =
  | { type: 'setCurrentns'; currentns: string }
  | { type: 'setTons'; tons: string }
  | { type: 'setProgress' }
  | { type: 'unsetProgress' }
  | { type: 'setError'; message: string }
  | { type: 'setPayload'; payload: {} };

export const commonReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'setCurrentns':
      return Object.assign({}, state, { currentns: action.currentns });
    case 'setTons':
      return Object.assign({}, state, { tons: action.tons });
    case 'setProgress':
      return Object.assign({}, state, { progress: true });
    case 'unsetProgress':
      return Object.assign({}, state, { progress: false });
    case 'setError':
      return Object.assign({}, state, { error: action.message });
    case 'setPayload':
      return Object.assign({}, state, { payload: action.payload });
    default:
      return defaultState;
  }
};
