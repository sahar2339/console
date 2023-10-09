import * as React from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import { BlueInfoCircleIcon } from '@console/shared';
import { SnsDashboardContext } from './sns-dashboard-context';
import "./dashboard.css"

export const DetailsCard: React.FC = () => {
  const { obj } = React.useContext(SnsDashboardContext);
  if (!obj.status?.total.free
    ) {
    return (
      <Card data-test-id="details-card">
        <CardHeader>
          <CardTitle>Allocatable Resources</CardTitle>
        </CardHeader>
        <CardBody>
           
        <div className="co-m-pane__body">This subnamespace does not have resources of its own because it is a descendant of a Resource Pool.</div>
        <span className='helpblock'>
        <BlueInfoCircleIcon/>  <p className="help-block"> Being a descendant of a Resource Pool means  that this subnamespace shares its resources with the other subnamespaces in the same Resource Pool.</p>
        </span>
        </CardBody>
      </Card>
    );
  }
  return (
    <Card data-test-id="details-card">
      <CardHeader>
        <CardTitle>Allocatable Resources</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="co-m-pane__body">
          <SnsChildernsTable snsFree={obj.status?.total.free} />
        </div>
        <span className='helpblock'>           
        <BlueInfoCircleIcon/> <p className="help-block"> This shows the resources that you can allocate to children subnamespaces.<br></br> This <b>DOES NOT</b> show the amount of resources requested or utilized by the current Subnamespace and its children.</p>
</span>
      </CardBody>
    </Card>
  );
};

export const SnsChildernsTable: React.FC<SnsChildernsTableProps> = ({ snsFree }) => (
  <>
    <div className="co-m-table-grid co-m-table-grid--bordered">
      <div className="row co-m-table-grid__head">
        <div className="col-lg-2 col-md-2 col-sm-3 col-xs-5">CPU</div>
        <div className="col-lg-2 col-md-2 col-sm-3 col-xs-5">Memory</div>
        <div className="col-lg-2 col-md-2 col-sm-3 col-xs-5">GPU</div>
        <div className="col-lg-2 col-md-2 col-sm-3 col-xs-5">Storage</div>
        <div className="col-lg-2 col-md-2 col-sm-3 col-xs-5">Pods</div>
      </div>
      <div className="co-m-table-grid__body">
        <div className="row">
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">
            {snsFree.cpu || '-'}
          </div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">
            {snsFree.memory || '-'}
          </div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">
            {snsFree['requests.nvidia.com/gpu'] || '-'}
          </div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">
            {snsFree['basic.storageclass.storage.k8s.io/requests.storage'] || '-'}
          </div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">
            {snsFree.pods || '-'}
          </div>
        </div>
      </div>
    </div>
  </>
);

type SnsChildernsTableProps = {
  snsFree: any;
};
