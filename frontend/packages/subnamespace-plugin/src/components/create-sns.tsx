import * as React from 'react';
import { Helmet } from 'react-helmet';
import { match } from 'react-router';
import { Link } from 'react-router-dom';
import * as models from '../models';
import { Dropdown } from '@console/internal/components/utils/dropdown';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
import * as classNames from 'classnames';
import {
  FirehoseResource,
  ButtonBar,
  history,
  resourcePathFromModel,
  resourceObjPath,
} from '@console/internal/components/utils/index';

import { RadioGroup } from '@console/internal/components/radio';
import {
  k8sCreate,
  K8sResourceKind,
  referenceFor,
  referenceForModel,
} from '@console/internal/module/k8s';

import { commonReducer, defaultState } from './state';
import { SubnamespaceModel } from '../models';
import { ActionGroup, Button } from '@patternfly/react-core';

export const dropdownUnitsMemory = {
  Mi: 'MiB',
  Gi: 'GiB',
  Ti: 'TiB',
};
export const dropdownUnitsStorage = {
  Mi: 'MiB',
  Gi: 'GiB',
  Ti: 'TiB',
};
const Section = ({ label, children }) => (
  <div>
    <div className="co-form-section__label">{label}</div>
    <div className="co-form-subsection">{children}</div>
  </div>
);
const snsKinds = [
  { value: 'subnamespace', title: 'Subnamaspace', subTitle: '(Create namespace with quota)' },
  {
    value: 'resource pool',
    title: 'Resource Pool',
    subTitle: '(Create namespace which shares its quota resources )',
  },
];

export const CreateSNSPage: React.FC<CreateSNSPageProps> = (props) => {
  let fatherResourcePool;
  const [state, dispatch] = React.useReducer(commonReducer, defaultState);
  const namespace = props?.match?.params?.ns;
  const snsResource: FirehoseResource = {
    kind: referenceForModel(models.SubnamespaceModel),
    namespaced: false,
    isList: false,
    prop: 'subnamespace',
    name: namespace,
  };
  const [snsdata, loaded] = useK8sWatchResource<K8sResourceKind>(snsResource);
  if (loaded) {
    fatherResourcePool = false;
    if (snsdata.metadata?.labels['dana.hns.io/resourcepool'] === 'true') {
      fatherResourcePool = true;
    }
  }
  // eslint-disable-next-line block-scoped-var
  const fillQuota = state.snsType === 'subnamespace' || !fatherResourcePool;

  React.useEffect(() => {
    let obj: K8sResourceKind = {};
    if (state.snsType === 'subnamespace') {
      obj = {
        apiVersion: `${SubnamespaceModel.apiGroup}/${SubnamespaceModel.apiVersion}`,
        kind: `${SubnamespaceModel.kind}`,
        metadata: {
          name: state.name,
          namespace,
          labels: {
            'dana.hns.io/resourcepool': 'false',
          },
        },
        spec: {
          resourcequota: {
            hard: {
              cpu: state.cpu,
              memory: `${state.memoryValue}${state.memoryUnit}`,
              'basic.storageclass.storage.k8s.io/requests.storage': `${state.storageValue}${state.storageUnit}`,
              pods: state.pods,
              'requests.nvidia.com/gpu': state.gpu,
            },
          },
        },
      };
    }
    if (state.snsType === 'resource pool') {
      obj = {
        apiVersion: `${SubnamespaceModel.apiGroup}/${SubnamespaceModel.apiVersion}`,
        kind: `${SubnamespaceModel.kind}`,
        metadata: {
          name: state.name,
          namespace,
          labels: {
            'dana.hns.io/resourcepool': 'true',
          },
        },
      };
      // eslint-disable-next-line block-scoped-var
      if (fatherResourcePool) {
        obj.spec = {};
      } else {
        obj.spec = {
          resourcequota: {
            hard: {
              cpu: state.cpu,
              memory: `${state.memoryValue}${state.memoryUnit}`,
              'basic.storageclass.storage.k8s.io/requests.storage': `${state.storageValue}${state.storageUnit}`,
              pods: state.pods,
              'requests.nvidia.com/gpu': state.gpu,
            },
          },
        };
      }
    }
    dispatch({ type: 'setPayload', payload: obj });
  }, [
    namespace,
    state.snsType,
    state.name,
    state.pods,
    state.gpu,
    state.memoryUnit,
    state.memoryValue,
    state.storageUnit,
    state.storageValue,
    state.cpu,
    fatherResourcePool,
  ]);

  const save = (e: React.FormEvent<EventTarget>) => {
    e.preventDefault();
    dispatch({ type: 'setProgress' });
    k8sCreate(SubnamespaceModel, state.payload)
      .then((resource) => {
        dispatch({ type: 'unsetProgress' });
        history.push(resourceObjPath(resource, referenceFor(resource)));
      })
      .catch((err) => {
        dispatch({ type: 'setError', message: err.message });
        dispatch({ type: 'unsetProgress' });
      });
  };

  return (
    <div className="co-m-pane__body co-m-pane__form">
      <Helmet>
        <title>Create Subnamespace</title>
      </Helmet>
      <h1 className="co-m-pane__heading co-m-pane__heading--baseline">
        <div className="co-m-pane__name">Create Subnamespace</div>
        <div className="co-m-pane__heading-link">
          <Link to={`${resourcePathFromModel(SubnamespaceModel, null, namespace)}/~new`} replace>
            Edit YAML
          </Link>
        </div>
      </h1>
      <form className="co-m-pane__body-group" onSubmit={save}>
        <Section label="Subnamespace Name">
          <div className="form-group">
            <input
              className="pf-c-form-control"
              type="text"
              onChange={(e) => dispatch({ type: 'setName', name: e.currentTarget.value })}
              placeholder="my-subnamespace"
              aria-describedby="sns-name-help"
              id="sns-name"
              name="snsName"
              required
            />
            <p className="help-block" id="pvc-name-help">
              A unique name for the subnamespace
            </p>
          </div>
        </Section>

        <div className="co-form-section__separator" />

        <Section label="Subnamespace Type">
          <div className="form-group">
            <RadioGroup
              currentValue={state.snsType}
              items={snsKinds}
              onChange={(e) => dispatch({ type: 'setSnsType', snsType: e.currentTarget.value })}
            />
          </div>
        </Section>

        <div className="co-form-section__separator" />

        {fillQuota && (
          <Section label="Subnamespace Quota">
            <div className="form-group">
              <label className="control-label co-required" htmlFor="request-cpu-input">
                CPU
              </label>
              <div className="form-group">
                <div className="pf-c-input-group">
                  <input
                    className={classNames('pf-c-form-control')}
                    type="number"
                    onChange={(e) => dispatch({ type: 'setCpu', cpu: e.currentTarget.value })}
                    name="cpu"
                    aria-describedby="cpu-help"
                    id="cpu"
                    defaultValue="0"
                  />
                </div>
              </div>

              <label className="control-label co-required" htmlFor="request-memory-input">
                Memory
              </label>
              <div className="form-group">
                <div className="pf-c-input-group">
                  <input
                    className={classNames('pf-c-form-control')}
                    type="number"
                    name="requestMemory"
                    defaultValue="0"
                    onChange={(e) =>
                      dispatch({ type: 'setMemoryValue', memoryValue: e.currentTarget.value })
                    }
                    id="memoryValue"
                  />
                  <Dropdown
                    className="btn-group"
                    title={dropdownUnitsMemory.Gi}
                    name="memoryUnit"
                    items={dropdownUnitsMemory}
                    onChange={(unit) => dispatch({ type: 'setMemoryUnit', memoryUnit: unit })}
                  />
                </div>
              </div>

              <label className="control-label co-required" htmlFor="request-memory-input">
                Storage
              </label>
              <div className="form-group">
                <div className="pf-c-input-group">
                  <input
                    className={classNames('pf-c-form-control')}
                    type="number"
                    name="requestStorage"
                    defaultValue="0"
                    onChange={(e) =>
                      dispatch({ type: 'setStorageValue', storageValue: e.currentTarget.value })
                    }
                    id="storageValue"
                  />
                  <Dropdown
                    className="btn-group"
                    title={dropdownUnitsStorage.Gi}
                    name="storageUnit"
                    items={dropdownUnitsStorage}
                    onChange={(unit) => dispatch({ type: 'setStorageUnit', storageUnit: unit })}
                  />
                </div>
              </div>

              <label className="control-label co-required" htmlFor="request-cpu-input">
                GPU
              </label>
              <div className="form-group">
                <div className="pf-c-input-group">
                  <input
                    className={classNames('pf-c-form-control')}
                    type="number"
                    onChange={(e) => dispatch({ type: 'setGpu', gpu: e.currentTarget.value })}
                    name="gpu"
                    aria-describedby="gpu-help"
                    id="gpu"
                    defaultValue="0"
                  />
                </div>
              </div>

              <label className="control-label co-required" htmlFor="request-cpu-input">
                Pods
              </label>
              <div className="form-group">
                <div className="pf-c-input-group">
                  <input
                    className={classNames('pf-c-form-control')}
                    type="number"
                    onChange={(e) => dispatch({ type: 'setPods', pods: e.currentTarget.value })}
                    name="pods"
                    aria-describedby="pods-help"
                    id="pods"
                    defaultValue="0"
                  />
                </div>
              </div>
            </div>
          </Section>
        )}

        <ButtonBar errorMessage={state.error} inProgress={state.progress}>
          <ActionGroup className="pf-c-form">
            <Button type="submit" variant="primary">
              Create
            </Button>
            <Button onClick={history.goBack} type="button" variant="secondary">
              Cancel
            </Button>
          </ActionGroup>
        </ButtonBar>
      </form>
    </div>
  );
};

type CreateSNSPageProps = {
  match: match<{ ns?: string }>;
};
