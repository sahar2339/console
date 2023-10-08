import { K8sResourceKind } from '@console/internal/module/k8s';

type State = {
  operand: string;
  destns: string;
  sourcens: string;
  cpu: string;
  gpu: string;
  pods: string;
  memoryValue: string;
  memoryUnit: string;
  storageUnit: string;
  storageValue: string;
  progress: boolean;
  error: string;
  description: string;
  payload: K8sResourceKind;
};

export const defaultState = {
  operand: '',
  destns: '',
  sourcens: '',
  cpu: '0',
  gpu: '0',
  pods: '0',
  memoryValue: '0',
  memoryUnit: 'Gi',
  storageValue: '0',
  storageUnit: 'Gi',
  progress: false,
  description: '',
  error: '',
  payload: {},
};

type Action =
  | { type: 'setOperand'; operand: string }
  | { type: 'setDestns'; destns: string }
  | { type: 'setSourcens'; sourcens: string }
  | { type: 'setCpu'; cpu: string }
  | { type: 'setGpu'; gpu: string }
  | { type: 'setPods'; pods: string }
  | { type: 'setProgress' }
  | { type: 'unsetProgress' }
  | { type: 'setError'; message: string }
  | { type: 'setPayload'; payload: {} }
  | { type: 'setMemoryUnit'; memoryUnit: string }
  | { type: 'setMemoryValue'; memoryValue: string }
  | { type: 'setStorageUnit'; storageUnit: string }
  | { type: 'setStorageValue'; storageValue: string }
  | { type: 'setDescription'; description: string };

export const commonReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'setOperand':
      return Object.assign({}, state, { operand: action.operand });
    case 'setDestns':
      return Object.assign({}, state, { destns: action.destns });
    case 'setSourcens':
      return Object.assign({}, state, { sourcens: action.sourcens });
    case 'setCpu':
      return Object.assign({}, state, { cpu: action.cpu });
    case 'setGpu':
      return Object.assign({}, state, { gpu: action.gpu });
    case 'setPods':
      return Object.assign({}, state, { pods: action.pods });
    case 'setProgress':
      return Object.assign({}, state, { progress: true });
    case 'unsetProgress':
      return Object.assign({}, state, { progress: false });
    case 'setError':
      return Object.assign({}, state, { error: action.message });
    case 'setMemoryUnit':
      return Object.assign({}, state, { memoryUnit: action.memoryUnit });
    case 'setMemoryValue':
      return Object.assign({}, state, { memoryValue: action.memoryValue });
    case 'setStorageUnit':
      return Object.assign({}, state, { storageUnit: action.storageUnit });
    case 'setStorageValue':
      return Object.assign({}, state, { storageValue: action.storageValue });
    case 'setPayload':
      return Object.assign({}, state, { payload: action.payload });
    case 'setDescription':
      return Object.assign({}, state, { description: action.description });

    default:
      return defaultState;
  }
};
