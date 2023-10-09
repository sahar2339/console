import * as React from 'react';
import { K8sResourceKind } from '@console/internal/module/k8s';

export const SnsDashboardContext = React.createContext<SnsDashboardContext>({});

type SnsDashboardContext = {
  obj?: K8sResourceKind;
};
