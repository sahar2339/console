import * as React from 'react';
import { Card, CardHeader, CardTitle } from '@patternfly/react-core';
import UtilizationBody from '@console/shared/src/components/dashboard/utilization-card/UtilizationBody';
import { getName } from '@console/shared';
import ConsumerPopover from '@console/shared/src/components/dashboard/utilization-card/TopConsumerPopover';
import { PopoverPosition } from '@patternfly/react-core';
import { ByteDataTypes } from '@console/shared/src/graph-helper/data-utils';
import { humanizeBinaryBytes, humanizeCpuCores } from '@console/internal/components/utils';
import { SnsDashboardContext } from './sns-dashboard-context';

import { PodModel } from '@console/internal/models';


enum LIMIT_STATE {
    ERROR = 'ERROR',
    WARN = 'WARN',
    OK = 'OK',
  }

type TopConsumerPopoverProp = {
    current: string;
    max?: string;
    limit?: string;
    available?: string;
    requested?: string;
    total?: string;
    limitState?: LIMIT_STATE;
    requestedState?: LIMIT_STATE;
  };
// import {
// getUtilizationQueries,
// ProjectQueries,
// getTopConsumerQueries,
// } from '@console/shared/src/promql/project-dashboard';
import { PrometheusUtilizationItem } from '@console/internal/components/dashboard/dashboards-page/cluster-dashboard/utilization-card';

export const UtilizationCard: React.FC = () => {
  const { obj } = React.useContext(SnsDashboardContext);
  const snsObj = obj;
  const projectName = getName(snsObj);
  // const queries = React.useMemo(() => getUtilizationQueries(projectName), [projectName]);

  const memoryQuery = `(namespace:container_memory_usage_bytes:sum{namespace=~".*"}) + on(namespace) group_left(label_source) (0*kube_namespace_labels{namespace=~".*", label_dana_hns_io_aggragator_${snsObj.metadata.name}="true"})`;
  const cpuQuery = `(namespace:container_cpu_usage:sum{namespace=~".*"}) + on(namespace) group_left(label_source) (0*kube_namespace_labels{namespace=~".*", label_dana_hns_io_aggragator_${snsObj.metadata.name}="true"})`;
  const sumMemoryQuery = `(pod:container_memory_usage_bytes:sum{namespace=~".*"}) + on(namespace) group_left(label_source) (0*kube_namespace_labels{namespace=~".*", label_dana_hns_io_aggragator_${snsObj.metadata.name}="true"})`;
  const sumCpuQuery = `(pod:container_cpu_usage:sum{namespace=~".*"}) + on(namespace) group_left(label_source) (0*kube_namespace_labels{namespace=~".*", label_dana_hns_io_aggragator_${snsObj.metadata.name}="true"})`;
  const cpuPopover = React.useCallback(
    React.memo<TopConsumerPopoverProp>(({ current }) => (
      <ConsumerPopover
        title="CPU"
        current={current}
        consumers={[
          {
            query: sumCpuQuery, // getTopConsumerQueries(projectName)[ProjectQueries.PODS_BY_CPU],
            model: PodModel,
            metric: 'pod',
          },
        ]}
        humanize={humanizeCpuCores}
        // namespace={projectName}
        position={PopoverPosition.top}
      />
    )),
    [projectName],
  );

  const memPopover = React.useCallback(
    React.memo<TopConsumerPopoverProp>(({ current }) => (
      <ConsumerPopover
        title="Memory"
        current={current}
        consumers={[
          {
            query: sumMemoryQuery, // getTopConsumerQueries(projectName)[ProjectQueries.PODS_BY_MEMORY],
            model: PodModel,
            metric: 'pod',
          },
        ]}
        humanize={humanizeBinaryBytes}
        // namespace={projectName}
        position={PopoverPosition.top}
      />
    )),
    [projectName],
  );

  return (
    <Card data-test-id="utilization-card">
      <CardHeader>
        <CardTitle>Utilization</CardTitle>
      </CardHeader>
      <UtilizationBody>
        <PrometheusUtilizationItem
          title="CPU"
          humanizeValue={humanizeCpuCores}
          utilizationQuery={cpuQuery}
          TopConsumerPopover={cpuPopover}
        />
        <PrometheusUtilizationItem
          title="Memory"
          humanizeValue={humanizeBinaryBytes}
          utilizationQuery={memoryQuery}
          byteDataType={ByteDataTypes.BinaryBytes}
          TopConsumerPopover={memPopover}
          // namespace={projectName}
        />
      </UtilizationBody>
    </Card>
  );
};