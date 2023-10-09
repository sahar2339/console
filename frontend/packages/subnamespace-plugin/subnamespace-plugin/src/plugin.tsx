import * as models from './models';
import {
  Plugin,
  ModelDefinition,
  ModelFeatureFlag,
  ResourceListPage,
  ResourceDetailsPage,
  RoutePage,
  HorizontalNavTab,
} from '@console/plugin-sdk';

// import { YAMLTemplate } from '@console/dynamic-plugin-sdk';

// TODO(vojtech): internal code needed by plugins should be moved to console-shared package
// import { PodModel } from '@console/internal/models';f
import { referenceForModel } from '@console/internal/module/k8s';

// import { yamlTemplates } from './yaml-templates';
//
type ConsumedExtensions =
  | ModelDefinition
  | ModelFeatureFlag
  | ResourceListPage
  | ResourceDetailsPage
  // | YAMLTemplate
  | RoutePage
  | HorizontalNavTab;

// const TEST_MODEL_FLAG = 'TEST_MODEL';

const plugin: Plugin<ConsumedExtensions> = [
  {
    type: 'ModelDefinition',
    properties: {
      models: [models.SubnamespaceModel],
    },
  },
  {
    type: 'FeatureFlag/Model',
    properties: {
      model: models.SubnamespaceModel,
      flag: 'SUBNAMESPACE',
    },
  },
  {
    type: 'ModelDefinition',
    properties: {
      models: [models.UpdatequotaModel],
    },
  },
  {
    type: 'FeatureFlag/Model',
    properties: {
      model: models.UpdatequotaModel,
      flag: 'UPDATEQUOTA',
    },
  },
  {
    type: 'ModelDefinition',
    properties: {
      models: [models.MigrationHierarchyModel],
    },
  },
  {
    type: 'FeatureFlag/Model',
    properties: {
      model: models.MigrationHierarchyModel,
      flag: 'MIGRATIONHIERARCHY',
    },
  },
  // {
  //   type: 'NavItem/ResourceNS',
  //   properties: {
  //     section: 'Wallets',
  //     componentProps: {
  //       name: models.SubnamespaceModel.labelPlural,
  //       resource: referenceForModel(models.SubnamespaceModel),
  //     },
  //   },
  // },
  // {
  //   type: 'NavItem/ResourceNS',
  //   properties: {
  //     section: 'Wallets',
  //     componentProps: {
  //       name: models.UpdatequotaModel.label,
  //       resource: referenceForModel(models.UpdatequotaModel),
  //     },
  //   },
  // },
  {
    type: 'Page/Resource/List',
    properties: {
      model: models.SubnamespaceModel,
      loader: () =>
        import('./components/subnamespace' /* webpackChunkName: "demo" */).then(
          (m) => m.SubnamespacePage,
        ),
    },
  },
  {
    type: 'Page/Resource/Details',
    properties: {
      model: models.SubnamespaceModel,
      loader: () =>
        import('./components/subnamespace' /* webpackChunkName: "demo" */).then(
          (m) => m.SubnamespaceDetailsPage,
        ),
    },
  },
  // {
  //   type: 'YAMLTemplate',
  //   properties: {
  //     model: models.SubnamespaceModel,
  //     template: yamlTemplates.getIn([models.SubnamespaceModel, 'default']),
  //   },
  // },
  {
    type: 'Page/Route',
    properties: {
      exact: true,
      path: `/k8s/ns/:ns/${referenceForModel(models.SubnamespaceModel)}/~new/form`,
      // render: () =>
      //   import('./components/subnamespace-form' /* webpackChunkName: "subnamespace-form" */).then(
      //     (m) => m.CreateSNSForm,
      //   ),
      loader: () =>
        import('./components/create-sns' /* webpackChunkName: "create-obc" */).then(
          (m) => m.CreateSNSPage,
        ),
    },
  },
  {
    type: 'Page/Resource/List',
    properties: {
      model: models.UpdatequotaModel,
      loader: () =>
        import('./components/updatequota' /* webpackChunkName: "updatequota" */).then(
          (m) => m.UpdatequotaPage,
        ),
    },
  },
  {
    type: 'Page/Resource/List',
    properties: {
      model: models.MigrationHierarchyModel,
      loader: () =>
        import('./components/migrationhierarchy' /* webpackChunkName: "updatequota" */).then(
          (m) => m.MigrationHierarchyPage,
        ),
    },
  },
  // {
  //   type: 'console.yaml-template',
  //   properties: {
  //     model: models.UpdatequotaModel,
  //     template: yamlTemplates.getIn([models.UpdatequotaModel, 'default']),
  //   },
  // },
  {
    type: 'Page/Route',
    properties: {
      exact: true,
      path: `/k8s/ns/:ns/${referenceForModel(models.UpdatequotaModel)}/~new/form`,
      loader: () =>
        import(
          './components/create-updatequota' /* webpackChunkName: "create-update-quota" */
        ).then((m) => m.CreateUpdateQuotaPage),
    },
  },
  {
    type: 'Page/Route',
    properties: {
      exact: true,
      path: `/k8s/cluster/${referenceForModel(models.MigrationHierarchyModel)}/~new/form`,
      loader: () =>
        import(
          './components/create-MH' /* webpackChunkName: "create-update-quota" */
        ).then((m) => m.CreateMigrationHierarchyPage),
    },
  },
];

export default plugin;
