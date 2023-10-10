import * as React from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import { ClipboardCheckIcon } from '@patternfly/react-icons';
import {ExternalLink } from '@console/internal/components/utils';

// import HealthBody from '@console/shared/src/components/dashboard/status-card/HealthBody';
// import { Status } from '@console/shared';
import { SnsDashboardContext } from './sns-dashboard-context';
// import DetailItem from '@console/shared/src/components/dashboard/details-card/DetailItem';
// import DetailsBody from '@console/shared/src/components/dashboard/details-card/DetailsBody';
import { SubnamespaceModel } from '../../models';
import { referenceForModel } from '@console/internal/module/k8s';
import { Link } from 'react-router-dom';
import { ResourceIcon } from '@console/internal/components/utils';
// import * as models from '../../models';
// import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
// import { FirehoseResource } from '@console/internal/components/utils/index';
// import { K8sResourceKind, referenceForModel } from '@console/internal/module/k8s';

export const altoUrl = () => {
  let link = location.href
  let env = link.split('/')[2].split('.')[2]
  let subnamespace = link.split('/')[7]
  let base = new URL("https://alto/optimizationTree/tree?")
  let params = new URLSearchParams({"env": env, "namespace": subnamespace, "selected": subnamespace})
  return (base+""+params)
}


export const StatusCard: React.FC = () => {
  const { obj } = React.useContext(SnsDashboardContext);
  // console.log(obj)
  // const snsResource: FirehoseResource = {
  //   kind: referenceForModel(models.SubnamespaceModel),
  //   namespaced: false,
  //   isList: false,
  //   prop: 'subnamespace',
  //   name: 'zuriel'
  // };
  // const [snsdata, loaded] = useK8sWatchResource<K8sResourceKind>(snsResource);
  // if (loaded){
  //   // console.log(snsdata)
  //   var x = snsdata?.metadata?.name
  //   // console.log(x)
  // }
  // console.log(obj.status?.total)
  if (!obj.status?.namespaces) {
    return (
      <Card data-test-id="status-card">
        <CardHeader>
          <CardTitle>Subnamespace Childrens</CardTitle>
        </CardHeader>
        <CardBody>
          <br></br>

        <p className="help-block"><ClipboardCheckIcon color="var(--pf-global--primary-color--100)" aria-hidden="true" /> For more information about the  utilization of this subnamespace <ExternalLink href={altoUrl()} text="visit Alto"></ExternalLink></p>

        <div className="co-m-pane__body">This subnamespace doesn't have any child subnamespaces</div>
       </CardBody>
      </Card>
    );
  }
  return (
    <Card  data-test-id="status-card">
      <CardHeader>
        <CardTitle>Subnamespace Childrens</CardTitle>
      </CardHeader>
      <CardBody>
        <br></br>
        
      <p className="help-block"><ClipboardCheckIcon color="var(--pf-global--primary-color--100)" aria-hidden="true" /> For more information about the  utilization of this subnamespace and its childrens <ExternalLink href={altoUrl()} text="visit Alto"></ExternalLink></p>
        <div className="co-m-pane__body">
          <SnsChildernsTable father={obj.metadata.name} snsChildrens={obj.status?.namespaces} />
        </div>
      </CardBody>
    </Card>
  );
};

export const SnsChildernsTable: React.FC<SnsChildernsTableProps> = ({ father, snsChildrens }) => (
  <>
    <div className="co-m-table-grid co-m-table-grid--bordered">
      <div className="row co-m-table-grid__head">
        <div className="col-lg-3 col-md-3 col-sm-5 col-xs-7">Name</div>
        <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">CPU</div>
        <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">Memory</div>
        <div className="col-lg-2 hidden-md hidden-sm hidden-xs">GPU</div>
        <div className="col-lg-2 hidden-md hidden-sm hidden-xs">Storage</div>
        <div className="col-lg-1 hidden-md hidden-sm hidden-xs">Pods</div>
      </div>
      <div className="co-m-table-grid__body">
        {snsChildrens.map((ns: any) => (
          <NamespaceRow namespace={ns} father={father} />
        ))}
      </div>
    </div>
  </>
);

export const NamespaceRow: React.FC<NamespaceRowProps> = ({ father, namespace }) => {
  return (
    <div className="row">
      <div className="col-lg-3 col-md-3 col-sm-5 col-xs-7">
        <SnsLink sns={namespace} father={father} />
      </div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs co-truncate co-nowrap co-select-to-copy">
        {namespace.resourcequota.hard?.cpu || '-'}
      </div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs co-truncate co-nowrap co-select-to-copy">
        {namespace.resourcequota.hard?.memory || '-'}
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs co-truncate co-nowrap co-select-to-copy">
        {namespace.resourcequota.hard?.['requests.nvidia.com/gpu'] || '-'}
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs co-truncate co-nowrap co-select-to-copy">
        {namespace.resourcequota.hard?.['basic.storageclass.storage.k8s.io/requests.storage'] ||
          '-'}
      </div>
      <div className="col-lg-1 hidden-md hidden-sm hidden-xs co-truncate co-nowrap co-select-to-copy">
        {namespace.resourcequota.hard?.pods || '-'}
      </div>
    </div>
  );
};

export const SnsLink: React.FC<SnsLinkProps> = ({ father, sns }) => (
  <span className="co-resource-item co-resource-item--inline">
    <ResourceIcon kind="Subnamespace" />
    <Link to={`/k8s/ns/${father}/${referenceForModel(SubnamespaceModel)}/${sns.namespace}`}>
      {sns.namespace}
    </Link>
  </span>
);
SnsLink.displayName = 'SnsLink';

type SnsLinkProps = {
  father: string;
  sns: any;
};

type NamespaceRowProps = {
  father: string;
  namespace: any;
};

type SnsChildernsTableProps = {
  father: string;
  snsChildrens: nsSpec[];
};

export type nsSpec = {
  name: string;
  resourcequota?: {
    hard?: ResourceList;
  };
};

export type ResourceList = {
  [resourceName: string]: string;
};