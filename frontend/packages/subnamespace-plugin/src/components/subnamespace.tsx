import * as React from 'react';
import * as _ from 'lodash';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import {
  DetailsPage,
  ListPage,
  Table,
  TableData,
  RowFunctionArgs,
} from '@console/internal/components/factory';

//import { ClusterResourceQuotasPage } from '@console/internal/components/cluster-resource-quota';
import Dashboard from '@console/shared/src/components/dashboard/Dashboard';
// import DashboardGrid from '@console/shared/src/components/dashboard/DashboardGrid';
//import { UtilizationCard } from './dashboards/utilization-card';
import { DetailsCard } from './dashboards/details-card';


import {StatusCard} from './dashboards/status-card'
import { SnsDashboardContext } from './dashboards/sns-dashboard-context';
// import { useRefWidth } from '@console/internal/components/utils/ref-width-hook';
import { Grid, GridItem } from '@patternfly/react-core';
// import { useK8sWatchResource, WatchK8sResource } from '@console/internal/components/utils/k8s-watch-hook';
// import { Route } from 'react-router-dom';

// import { CreateUpdateQuotaPage } from '../components/create-updatequota';
// import { CreateMigrationHierarchyPage } from '../components/create-migrationhierarchy';
// import { DetailsForKind } from '@console/internal/components/default-resource';
import {
  Kebab,
  ResourceKebab,
  ResourceLink,
  // ResourceSummary,
  // SectionHeading,
  navFactory,
  Timestamp,
  resourcePathFromModel,
} from '@console/internal/components/utils';
import { K8sResourceKind, referenceForModel } from '@console/internal/module/k8s';
import { SubnamespaceModel } from '../models';

import { ClusterResourceQuotaModel, ResourceQuotaModel } from '@console/internal/models';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(ClusterResourceQuotaModel), ...common];

const tableColumnClasses = [
  classNames('col-l-5', 'col-l-6'),
  classNames('col-l-5', 'col-l-6'),
  classNames('col-l-5', 'col-l-6'),
  classNames('col-l-5', 'col-l-6'),
  classNames('col-l-5', 'col-l-6'),
  classNames('col-l-2', 'hidden-xs'),
  Kebab.columnClass,
];

const mapCardsToGrid = (
  cards: GridDashboardCard[] = [],
  keyPrefix: string,
  ignoreCardSpan: boolean = false,
): React.ReactNode[] =>
  cards.map(({ Card }, index) => (
    // eslint-disable-next-line react/no-array-index-key
    <GridItem key={`${keyPrefix}-${index}`} span={ignoreCardSpan ? 12 : 12}>
      <Card />
    </GridItem>
  ));

const SubnamespaceTableHeader = () => {
  return [
    {
      title: 'Name',
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'Type',
      // sortField: "",
      // transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: 'Quota',
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'Namespace',
      sortField: 'metadata.namespace',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: 'Parent',
      props: { className: tableColumnClasses[4] },
    },
    {
      title: 'Created',
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[6] },
    },
  ];
};
SubnamespaceTableHeader.displayName = 'SubnamespaceTableHeader';


const SubnamespaceTableRow: React.FC<RowFunctionArgs<K8sResourceKind>> = ({ obj }) => {
  const display = obj.metadata?.annotations?.['openshift.io/display-name'];
  const project = obj.metadata.namespace;
  const father = display ? display.split('/')[display.split('/').indexOf(project) - 1] : 'null';

  return (
    <>
      <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
        <ResourceLink
          kind={referenceForModel(SubnamespaceModel)}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
        />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        {obj.metadata.labels['dana.hns.io/resourcepool'] === 'true'
          ? 'Resource Pool'
          : 'Subnamespace'}
      </TableData>
      <TableData className={classNames(tableColumnClasses[2], 'co-break-word')}>
        {obj.metadata?.annotations?.["dana.hns.io/is-rq"] == "False" && obj.metadata.labels['dana.hns.io/resourcepool'] != 'true' &&
          <ResourceLink
            kind={referenceForModel(ClusterResourceQuotaModel)}
            name={obj.metadata.name}
          />
        }
        {obj.metadata?.annotations?.["dana.hns.io/is-rq"] == "True" && obj.metadata.labels['dana.hns.io/resourcepool'] != 'true' &&
          <ResourceLink
            kind={referenceForModel(ResourceQuotaModel)}
            namespace={obj.metadata.name}
            name={obj.metadata.name}
          />
        }
        {obj.metadata.labels['dana.hns.io/resourcepool'] === 'true' &&
          <ResourceLink
            kind={referenceForModel(ClusterResourceQuotaModel)}
            name={obj.metadata.annotations["dana.hns.io/crq-pointer"]}
          />
        }
      </TableData>
      <TableData className={classNames(tableColumnClasses[3], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[4], 'co-break-word')}>
        <ResourceLink
          kind={referenceForModel(SubnamespaceModel)}
          name={obj.metadata.namespace}
          namespace={father}
        />
      </TableData>
      <TableData className={classNames(tableColumnClasses[5], 'co-break-word')}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebab
          actions={menuActions}
          kind={referenceForModel(SubnamespaceModel)}
          resource={obj}
        />
      </TableData>
    </>
  );
};


// const SubnamespaceDetails: React.FC<SubnamespaceDetailsProps> = ({ obj }) => {
//   // const { obj, current } = item;
//   return (
//     <div className="co-m-pane__body">
//        <SectionHeading text="Subnamespace Details" />
//        <div className="row">
//          <div className="col-sm-6">
//            <ResourceSummary resource={obj}></ResourceSummary>
//          </div>
//        </div>
//      </div>
//   );
// };

export const getSnsFatherName = (snsFatherName: K8sResourceKind[]): string =>
  snsFatherName[0]?.metadata?.namespace;

// export const snsFatherName = <K8sResourceKind>: string => {
//   console.log(props)
//   return props
// };

export const SubnamespaceList: React.FC = React.memo((props) => {
  return (
    <Table
      {...props}
      aria-label={SubnamespaceModel.labelPlural}
      Header={SubnamespaceTableHeader}
      Row={SubnamespaceTableRow}
      // customData={snsFather}
      virtualize
    />
  );
});
SubnamespaceList.displayName = 'SubnamespaceList';

export const SubnamespacePage: React.FC<SubnamespacePageProps> = (props) => {
  const createProps = {
    // to: '/k8s/cluster/subnamespace/~new/form',
    // to: `/k8s/ns/${props.namespace}/${referenceForModel(SubnamespaceModel)}/~new/form`,
    to: `${resourcePathFromModel(
      SubnamespaceModel,
      null,
      _.get(props, 'namespace', 'default'),
    )}/~new/form`,
  };

  return (
    <ListPage
      {..._.omit(props, 'mock')}
      title="Subnamespaces"
      kind={referenceForModel(SubnamespaceModel)}
      ListComponent={SubnamespaceList}
      canCreate
      createProps={createProps}
      createButtonText="Create Subnamespace"
      customData={''}
    />
  );
};

const mainCards = [{Card: DetailsCard}];
const rightCards = [{ Card: StatusCard }];



const SnsDashboard: React.FC<SubnamespaceDetailsProps> = ({ obj }) => {
  const context = {
    obj,
  };
  const mainGridCards = React.useMemo(() => mapCardsToGrid(mainCards, 'left'), []);
  const rightGridCards = React.useMemo(() => mapCardsToGrid(rightCards, 'right'), []);

  return (
    <SnsDashboardContext.Provider value={context}>
      <Dashboard>
        <div>
          <Grid className="co-dashboard-grid">
            {/* <GridItem lg={1} md={1} sm={1}>
              <Grid className="co-dashboard-grid">{leftGridCards}</Grid>
            </GridItem> */}
            <GridItem lg={6} md={6} sm={6}>
              <Grid className="co-dashboard-grid">{mainGridCards}</Grid>
            </GridItem>
            <GridItem lg={6} md={6} sm={6}>
              <Grid className="co-dashboard-grid">{rightGridCards}</Grid>
            </GridItem>
          </Grid>
        </div>

        {/* <DashboardGrid mainCards={mainCards} leftCards={leftCards} rightCards={rightCards} /> */}
      </Dashboard>
    </SnsDashboardContext.Provider>
  );
};

// const snsFather = k8sGet(
//   NamespaceModel,
//   namespace,
// ).then((nsFather: K8sResourceKind) => {
//   var display = nsFather.metadata?.annotations['openshift.io/display-name']
//   var project = obj.metadata.namespace
//   var father = display.split('/')[display.split('/').indexOf(project)-1]
//   return father
// })

const pages = [
  // navFactory.details(SubnamespaceDetails),
  {
    href: '',
    name: 'Overview',
    component: SnsDashboard,
  },
  navFactory.editYaml()

];

export const snsType = (props): string => {
  return props.metadata?.labels['dana.hns.io/resourcepool'] === 'true'
    ? 'Resource Pool'
    : 'Subnamespace';
};

export const SubnamespaceDetailsPage = (props) => {
  console.log(props)
  return (
    <DetailsPage
      {...props}
      getResourceStatus={snsType}
      kind={referenceForModel(SubnamespaceModel)}
      menuActions={menuActions}
      pages={pages}
    />
  );
};
SubnamespaceDetailsPage.displayName = 'SubnamespaceDetailsPage';

// export const snsFatherName = (props): string => {
//   return props.metadata.namespace
// };

export type SubnamespaceDetailsProps = {
  obj: K8sResourceKind;
};

export type SubnamespacePageProps = {
  namespace?: string;
  name: string;
};

export type SubnamespaceDetailsPageProps = {
  match: any;
};

export type GridDashboardCard = {
  Card: React.ComponentType<any>;
};
