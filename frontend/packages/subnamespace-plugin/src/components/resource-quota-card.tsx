import * as React from 'react';
import * as _ from 'lodash';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import ResourceQuotaBody from '@console/shared/src/components/dashboard/resource-quota-card/ResourceQuotaBody';
import InfoCircleIcon from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { Tooltip , Label} from '@patternfly/react-core';
import { convertToBaseValue } from '@console/internal/components/utils';
import { GaugeChart } from '@console/internal/components/graphs/gauge';
import { useTranslation } from 'react-i18next';


import {
  getQuotaResourceTypes,
  hasComputeResources,
  ResourceUsageRow,
} from '../../../../public/components/resource-quota';
import { FirehoseResult } from '@console/internal/components/utils';
import { ClusterResourceQuotaModel } from '@console/internal/models';
import {
  withDashboardResources,
  DashboardItemProps,
} from '@console/internal/components/dashboard/with-dashboard-resources';
import { SnsDashboardContext } from './dashboards/sns-dashboard-context';
import { referenceForModel } from '@console/internal/module/k8s';

const getResourceQuota = (quotaname: string) => ({
  kind: referenceForModel(ClusterResourceQuotaModel),
  namespaced: false,
  name: quotaname,
  isList: false,
  prop: 'clusterResourceQuota',
});
const gaugeChartThresholds = [{ value: 90 }, { value: 101 }];


const isClusterQuota = (quota) => !quota.metadata.namespace;


const getResourceUsage = (quota, resourceType) => {
    const isCluster = isClusterQuota(quota);
    const statusPath = isCluster ? ['status', 'total', 'hard'] : ['status', 'hard'];
    const specPath = isCluster ? ['spec', 'quota', 'hard'] : ['spec', 'hard'];
    const usedPath = isCluster ? ['status', 'total', 'used'] : ['status', 'used'];
    const max =
      _.get(quota, [...statusPath, resourceType]) || _.get(quota, [...specPath, resourceType]);
    const used = _.get(quota, [...usedPath, resourceType]);
    const percent = !max || !used ? 0 : (convertToBaseValue(used) / convertToBaseValue(max)) * 100;
    return {
      used,
      max,
      percent,
    };
  };

  const NoQuotaGuage = ({ title, className }) => {
    const { t } = useTranslation();
    return (
      <GaugeChart
      data={{
        x: `$0%`,
        y: 0,
      }}
        error={t('public~No quota')}
        thresholds={[{ value: 100 }]}
        title={title}
        className={className}
      />
    );
  };
const QuotaGaugeCharts = ({ quota, resourceTypes, chartClassName = null }) => {
    const resourceTypesSet = new Set(resourceTypes);
    const cpuRequestUsagePercent = getResourceUsage(
      quota,
      resourceTypesSet.has('requests.cpu') ? 'requests.cpu' : 'cpu',
    ).percent;
    const cpuLimitUsagePercent = getResourceUsage(quota, 'limits.cpu').percent;
    const memoryRequestUsagePercent = getResourceUsage(
      quota,
      resourceTypesSet.has('requests.memory') ? 'requests.memory' : 'memory',
    ).percent;
    const memoryLimitUsagePercent = getResourceUsage(quota, 'limits.memory').percent;
    const { t } = useTranslation();
    return (
      <div className="co-resource-quota-chart-row">
        {resourceTypesSet.has('requests.cpu') || resourceTypesSet.has('cpu') ? (
          <div className="co-resource-quota-gauge-chart">
            <GaugeChart
              data={{
                x: `${cpuRequestUsagePercent}%`,
                y: cpuRequestUsagePercent,
              }}
              thresholds={gaugeChartThresholds}
              title={t('public~CPU request')}
              className={chartClassName}
            />
          </div>
        ) : (
          <div className="co-resource-quota-gauge-chart">
            <NoQuotaGuage className={chartClassName} title={t('public~CPU request')} />
          </div>
        )}
        {resourceTypesSet.has('limits.cpu') ? (
          <div className="co-resource-quota-gauge-chart">
            <GaugeChart
              data={{ x: `${cpuLimitUsagePercent}%`, y: cpuLimitUsagePercent }}
              thresholds={gaugeChartThresholds}
              title={t('public~CPU limit')}
              className={chartClassName}
            />
          </div>
        ) : (
          <div className="co-resource-quota-gauge-chart">
            <NoQuotaGuage title={t('public~CPU limit')} className={chartClassName} />
          </div>
        )}
        {resourceTypesSet.has('requests.memory') || resourceTypesSet.has('memory') ? (
          <div className="co-resource-quota-gauge-chart">
            <GaugeChart
              data={{
                x: `${memoryRequestUsagePercent}%`,
                y: memoryRequestUsagePercent,
              }}
              thresholds={gaugeChartThresholds}
              title={t('public~Memory request')}
              className={chartClassName}
            />
          </div>
        ) : (
          <div className="co-resource-quota-gauge-chart">
            <NoQuotaGuage title={t('public~Memory request')} className={chartClassName} />
          </div>
        )}
        {resourceTypesSet.has('limits.memory') ? (
          <div className="co-resource-quota-gauge-chart">
            <GaugeChart
              data={{ x: `${memoryLimitUsagePercent}%`, y: memoryLimitUsagePercent }}
              thresholds={gaugeChartThresholds}
              title={t('public~Memory limit')}
              className={chartClassName}
            />
          </div>
        ) : (
          <div className="co-resource-quota-gauge-chart">
            <NoQuotaGuage title={t('public~Memory limit')} className={chartClassName} />
          </div>
        )}
      </div>
    );
  };
  


export const ResourceQuotaCard = withDashboardResources(
  ({ watchK8sResource, stopWatchK8sResource, resources }: DashboardItemProps) => {
    const { obj } = React.useContext(SnsDashboardContext);
    React.useEffect(() => {
      const clusterResourceQuota = getResourceQuota(obj.metadata?.annotations?.["dana.hns.io/crq-pointer"]);
      watchK8sResource(clusterResourceQuota);
      return () => stopWatchK8sResource(clusterResourceQuota);
    }, [obj.metadata.name, watchK8sResource, stopWatchK8sResource]);
    // console.log(resources.clusterResourceQuota)
    const quotas = resources.clusterResourceQuota
      ? (_.get(resources.clusterResourceQuota, 'data') as FirehoseResult['data'])
      : [];
    const loaded = _.get(resources.clusterResourceQuota, 'loaded');
    const error = _.get(resources.clusterResourceQuota, 'loadError');
    const resourceTypes = getQuotaResourceTypes(quotas);
    const showChartRow = hasComputeResources(resourceTypes);
    return (
      <Card data-test-id="resource-quotas-card">
        <CardHeader>
          <CardTitle>Cluster Resource Quotas</CardTitle>
        </CardHeader>
        <CardBody>
          <ResourceQuotaBody error={!!error} isLoading={!loaded}>
            {showChartRow && <QuotaGaugeCharts quota={quotas} resourceTypes={resourceTypes} />}
          </ResourceQuotaBody>
          <div className="co-m-table-grid co-m-table-grid--bordered">
            <div className="row co-m-table-grid__head">
              <div className="col-sm-4 col-xs-6">Resource Type</div>
              <div className="col-sm-2 hidden-xs">Capacity</div>
              <div className="col-sm-3 col-xs-3">Requested <Tooltip 
              content={"This column represents the sum of resources that is requested by active workloads inside the hierarchy, including the namespace itself. "}
             // isVisible={true}
               trigger="mouseenter">
          <Label
          icon={<InfoCircleIcon />}
          variant="outline"
          className="tooltip_used">
        </Label>
              </Tooltip></div>
              <div className="col-sm-3 col-xs-3">Max <Tooltip 
              content={"This column represents the total resources capacity of the hierarchy, including the namespace itself."}
             // isVisible={true}
               trigger="mouseenter">
          <Label
          icon={<InfoCircleIcon />}
          variant="outline"
          className="ml-1">
        </Label>
              </Tooltip></div>
            </div>
            <div className="co-m-table-grid__body">
              {resourceTypes.map((type) => (
                <ResourceUsageRow key={type} quota={quotas} resourceType={type} />
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  },
);