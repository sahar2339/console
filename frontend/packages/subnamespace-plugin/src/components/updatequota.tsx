import * as React from 'react';
import * as _ from 'lodash';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import {
  ListPage,
  Table,
  TableData,
  RowFunctionArgs
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
import { UpdatequotaModel } from '../models';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(UpdatequotaModel), ...common];


const tableColumnClasses = [
  classNames('col-l-5', 'col-l-6'),
  classNames('col-l-5', 'col-l-6'),
  classNames('col-l-5', 'col-l-6'),
  classNames('col-l-5', 'col-l-6'),
  classNames('col-l-5', 'col-l-6'),
  classNames('col-l-5', 'col-l-6'),
  classNames('col-l-2', 'hidden-xs'),
  Kebab.columnClass,
];

const UpdatequotaTableHeader = () => {
  return [
    {
      title: 'From Namespace',
      sortField: 'spec.sourcens',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'To Namespace',
      sortField: 'spec.destns',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: 'Description',
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'Status',
      sortField: 'status.phase',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: 'Message',
      sortField: 'status.reason',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: 'Resources',
      sortField: 'status.resourcequota.hard',
      props: { className: tableColumnClasses[5] },
    },
    {
      title: 'Created',
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[6] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[7] },
    },
  ];
};
UpdatequotaTableHeader.displayName = 'UpdatequotaTableHeader';

const UpdatequotaTableRow: React.FC<RowFunctionArgs<K8sResourceKind>> = ({ obj }) => {
  return (
    <>
      <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.spec.sourcens} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.spec.destns} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[2], 'co-break-word')}>
        {obj.metadata.annotations ? obj.metadata.annotations['dana.hns.io/description'] : ''}
      </TableData>
      <TableData className={classNames(tableColumnClasses[3], 'co-break-word')}>
        <Status status={obj.status?.phase} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[4], 'co-break-word')}>
        <Status status={obj.status?.reason} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[5], 'co-break-word')}>
        {obj.spec?.resourcequota?.hard?.cpu != "0" && <span><label>CPU : </label><Status status={obj.spec?.resourcequota?.hard?.cpu} /><br></br></span>}
        {obj.spec?.resourcequota?.hard?.memory != "0" && <span><label>Memory : </label><Status status={obj.spec?.resourcequota?.hard?.memory} /><br></br></span>}
        {obj.spec?.resourcequota?.hard?.["basic.storageclass.storage.k8s.io/requests.storage"] != "0" && <span><label>Storage : </label><Status status={obj.spec?.resourcequota?.hard?.["basic.storageclass.storage.k8s.io/requests.storage"]} /><br></br></span>}
        {obj.spec?.resourcequota?.hard?.pods != "0" && <span><label>Pods : </label><Status status={obj.spec?.resourcequota?.hard?.pods} /><br></br></span>}
        {obj.spec?.resourcequota?.hard?.["requests.nvidia.com/gpu"] != "0" && <span><label>GPU : </label><Status status={obj.spec?.resourcequota?.hard?.["requests.nvidia.com/gpu"]} /><br></br></span>}
      </TableData>
      <TableData className={classNames(tableColumnClasses[6], 'co-break-word')}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[7]}>
        <ResourceKebab
          actions={menuActions}
          kind={referenceForModel(UpdatequotaModel)}
          resource={obj}
        />
      </TableData>
    </>
  );
};



export const UpdatequotaList: React.SFC = React.memo((props) => {
  return (
    <Table
      {...props}
      aria-label={UpdatequotaModel.labelPlural}
      Header={UpdatequotaTableHeader}
      Row={UpdatequotaTableRow}
      // customData={snsFather}
      virtualize
    />
  );
});
UpdatequotaList.displayName = 'UpdatequotaList';

export const UpdatequotaPage: React.FC<UpdatequotaPageProps> = (props) => {
  const createProps = {
    to: `${resourcePathFromModel(
      UpdatequotaModel,
      null,
      _.get(props, 'namespace', 'default'),
    )}/~new/form`,
    // to: `/k8s/ns/${props.namespace}/${referenceForModel(UpdatequotaModel)}/~new/form`
  };

  return (
    <ListPage
      {..._.omit(props, 'mock')}
      title="Update Quota"
      kind={referenceForModel(UpdatequotaModel)}
      ListComponent={UpdatequotaList}
      canCreate
      createProps={createProps}
      createButtonText="Create Update Quota"
    />
  );
};

export type UpdatequotaPageProps = {
  namespace?: string;
  name: string;
};
