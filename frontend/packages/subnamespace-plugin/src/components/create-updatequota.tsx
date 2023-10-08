import * as React from 'react';
import { Helmet } from 'react-helmet';
import { match } from 'react-router';
// import { Link } from 'react-router-dom';
import { Dropdown } from '@console/internal/components/utils/dropdown';
import * as classNames from 'classnames';
import {
  ButtonBar,
  NsDropdown,
  history,
  // resourcePathFromModel,
  resourceObjPath,
} from '@console/internal/components/utils';
// import { RadioGroup } from '@console/internal/components/radio';

import { k8sCreate, K8sResourceKind, referenceFor } from '@console/internal/module/k8s';

import { commonReducer, defaultState } from './updatequota-state';
import { UpdatequotaModel } from '../models';
import { ActionGroup, Button } from '@patternfly/react-core';

const Section = ({ label, children }) => (
  <div>
    <div className="co-form-section__label">{label}</div>
    <div className="co-form-subsection">{children}</div>
  </div>
);

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
// const operationsKinds = [
//   { value: 'add', title: 'Add Quota', subTitle: '(Propagate quota from namespace father to current namespace)' },
//   { value: 'reclaim', title: 'Reclaim Quota', subTitle: '(Reclaim quota from current namespace to namespace father)' },
// ];

export const CreateUpdateQuotaPage: React.FC<CreateUpdateQuotaPageProps> = (props) => {
  const [state, dispatch] = React.useReducer(commonReducer, defaultState);
  const namespace = props?.match?.params?.ns;
  // const name = props?.match?.params?.name;

  React.useEffect(() => {
    const obj: K8sResourceKind = {
      apiVersion: `${UpdatequotaModel.apiGroup}/${UpdatequotaModel.apiVersion}`,
      kind: `${UpdatequotaModel.kind}`,
      metadata: {
        name: `${Date.now()}`,
        namespace: state.sourcens,
        annotations: {
          'dana.hns.io/description': state.description,
        },
      },
      spec: {
        sourcens: state.sourcens,
        destns: state.destns,
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
    dispatch({ type: 'setPayload', payload: obj });
  }, [
    namespace,
    state.operand,
    state.destns,
    state.sourcens,
    state.pods,
    state.gpu,
    state.memoryUnit,
    state.memoryValue,
    state.storageUnit,
    state.storageValue,
    state.cpu,
    state.description,
  ]);

  const save = (e: React.FormEvent<EventTarget>) => {
    e.preventDefault();
    // if (
    //   !state.operand || !state.sourcens //|| !state.childns
    // ) {
    //   dispatch({ type: "setError", message: 'Please complete all fields.'});
    //   return;
    // }
    dispatch({ type: 'setProgress' });
    k8sCreate(UpdatequotaModel, state.payload)
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
        <title>Update Quota</title>
      </Helmet>
      <h1 className="co-m-pane__heading co-m-pane__heading--baseline">
        <div className="co-m-pane__name">Update Quota</div>
        {/* <div className="co-m-pane__heading-link">
          <Link
            to={`${resourcePathFromModel(SubnamespaceModel, null, namespace)}/~new`}
            replace
          >
            Edit YAML
          </Link>
        </div> */}
      </h1>
      <form className="co-m-pane__body-group" onSubmit={save}>
        {/* <Section label="Operand">
            <div className="form-group">
              <RadioGroup
                currentValue={state.operand}
                items={operationsKinds}
                onChange={(e) => dispatch({type: 'setOperand', operand: e.currentTarget.value})}
              />
            </div>
          </Section>

        <div className="co-form-section__separator" /> */}

        <Section label="Namespace">
          <div className="form-group">
            <label htmlFor="ns-dropdown" className="co-required">
              From Namespace
            </label>
            <NsDropdown
              selectedKey={state.sourcens}
              onChange={(value) => dispatch({ type: 'setSourcens', sourcens: value })}
              id="ns-dropdown"
            />
          </div>
          <div className="form-group">
            <label htmlFor="ns-dropdown" className="co-required">
              To Namespace
            </label>
            <NsDropdown
              selectedKey={state.destns}
              onChange={(value) => dispatch({ type: 'setDestns', destns: value })}
              id="ns-dropdown"
            />
          </div>
        </Section>

        <Section label="Description">
          <div className="form-group">
            <input
              className="pf-c-form-control"
              type="text"
              onChange={(e) => {
                dispatch({ type: 'setDescription', description: e.currentTarget.value });
              }}
              aria-describedby="uq-description-help"
              id="uq-description"
              name="uqDescription"
            />
            <p className="help-block" id="pvc-name-help">
              A description for the transaction
            </p>
          </div>
        </Section>

        <div className="co-form-section__separator" />
        <Section label="Quota">
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
        </Section>

        <div className="co-form-section__separator" />
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

type CreateUpdateQuotaPageProps = {
  match: match<{ ns?: string; name: string }>;
};
