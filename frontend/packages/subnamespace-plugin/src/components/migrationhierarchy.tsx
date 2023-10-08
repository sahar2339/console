import * as React from 'react';
import * as _ from 'lodash';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import {
  ListPage,
  Table,
  TableData,
  RowFunctionArgs,
} from '@console/internal/components/factory';
import { Status } from '@console/shared';
import {
  Kebab,
  ResourceKebab,
  ResourceLink,
  Timestamp,
  resourcePathFromModel,
} from '@console/internal/components/utils';
import { K8sResourceKind, referenceForModel } from '@console/internal/module/k8s';
import { MigrationHierarchyModel, SubnamespaceModel } from '../models';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(MigrationHierarchyModel), ...common];


const tableColumnClasses = [
  classNames('col-lg-4', 'col-md-4', 'col-sm-5', 'col-xs-6'),
  classNames('col-lg-4', 'col-md-4', 'col-sm-5', 'col-xs-6'),
  classNames('col-lg-4', 'col-md-4', 'col-sm-5', 'col-xs-6'),
  classNames('col-lg-4', 'col-md-4', 'col-sm-5', 'col-xs-6'),
  Kebab.columnClass,
];

const MigrationHierarchyHeader = () => {
  return [
    {
      title: 'Subnamespace',
      sortField: 'spec.currentns',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'To ',
      sortField: 'spec.tons',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: 'Status',
      sortField: 'status.phase',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'Created',
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[4] },
    },
  ];
};
MigrationHierarchyHeader.displayName = 'MigrationHierarchyHeader';

const MigrationHierarchyRow: React.FC<RowFunctionArgs<K8sResourceKind>> = ({ obj }) => {
    console.log(obj);
  return (
    <>
      <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
        <ResourceLink             
        kind={referenceForModel(SubnamespaceModel)}
            name={obj.spec?.currentns} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.spec?.tons} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[2], 'co-break-word')}>     
        <Status status={obj.status?.phase} />
        </TableData>
      <TableData className={classNames(tableColumnClasses[3], 'co-break-word')}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <ResourceKebab
          actions={menuActions}
          kind={referenceForModel(MigrationHierarchyModel)}
          resource={obj}
        />
      </TableData>
    </>
  );
};



export const MigrationHierarchyList: React.SFC = React.memo((props) => {
  return (
    <Table
      {...props}
      aria-label={MigrationHierarchyModel.labelPlural}
      Header={MigrationHierarchyHeader}
      Row={MigrationHierarchyRow}
      // customData={snsFather}
      virtualize
    />
  );
});
MigrationHierarchyList.displayName = 'MigrationHierarchyList';

export const MigrationHierarchyPage: React.FC<MigrationHierarchyProps> = (props) => {
  const createProps = {
    to: `${resourcePathFromModel(
      MigrationHierarchyModel,
    )}/~new/form`,
    // to: `/k8s/ns/${props.namespace}/${referenceForModel(UpdatequotaModel)}/~new/form`
  };

  return (
    <ListPage
      {..._.omit(props, 'mock')}
      title="Migrate Hierarchy"
      kind={referenceForModel(MigrationHierarchyModel)}
      ListComponent={MigrationHierarchyList}
      canCreate
      createProps={createProps}
      createButtonText="Create MigrateHierarchy"
    />
  );
};

export type MigrationHierarchyProps = {
  name: string;
  namespace: string;
};
