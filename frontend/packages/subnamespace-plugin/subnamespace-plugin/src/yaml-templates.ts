import { Map as ImmutableMap } from 'immutable';
import { SubnamespaceModel } from './models';

export const yamlTemplates = ImmutableMap().setIn(
  [SubnamespaceModel, 'default'],
  `
apiVersion: ${SubnamespaceModel.apiGroup}/${SubnamespaceModel.apiVersion}
kind: ${SubnamespaceModel.kind}
metadata:
  name: example
  namespace: default
  labels:
    "dana.hns.io/resourcepool" : "false"
spec:
  resourcequota: 
    hard: 
      cpu: 0
      memory: 0Gi
      "basic.storageclass.storage.k8s.io/requests.storage": 0Gi
      pods: 0
      "requests.nvidia.com/gpu": 0
`,
);
