import { K8sKind } from '@console/internal/module/k8s';

export const SubnamespaceModel: K8sKind = {
  label: 'Subnamespace',
  apiGroup: 'dana.hns.io',
  apiVersion: 'v1',
  plural: 'subnamespaces',
  abbr: 'SNS',
  namespaced: true,
  kind: 'Subnamespace',
  id: 'subnamespace',
  labelPlural: 'Subnamespaces',
  crd: true,
};

export const UpdatequotaModel: K8sKind = {
  label: 'Update Quota',
  apiGroup: 'dana.hns.io',
  apiVersion: 'v1',
  plural: 'updatequota',
  abbr: 'UPQ',
  namespaced: true,
  kind: 'Updatequota',
  id: 'updatequota',
  labelPlural: 'Updatequota',
  crd: true,
};

export const MigrationHierarchyModel: K8sKind = {
  label: 'Migration Hierarchy',
  apiGroup: 'dana.hns.io',
  apiVersion: 'v1',
  plural: 'migrationhierarchies',
  abbr: 'MH',
  namespaced: false,
  kind: 'MigrationHierarchy',
  id: 'migrationhierarchy',
  labelPlural: 'Migrationhierarchy',
  crd: true,
};
