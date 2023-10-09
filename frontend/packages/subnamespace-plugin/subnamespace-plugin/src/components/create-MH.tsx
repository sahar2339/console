import * as React from 'react';
import { Helmet } from 'react-helmet';
import { match } from 'react-router';
// import { Link } from 'react-router-dom';
import {
  ButtonBar,
  NsDropdown,
  history,
  // resourcePathFromModel,
  resourceObjPath,
} from '@console/internal/components/utils';
// import { RadioGroup } from '@console/internal/components/radio';

import { k8sCreate, K8sResourceKind, referenceFor } from '@console/internal/module/k8s';

import { commonReducer, defaultState } from './migrationhierarchy-state';
import { MigrationHierarchyModel } from '../models';
import { ActionGroup, Button } from '@patternfly/react-core';

const Section = ({ label, children }) => (
  <div>
    <div className="co-form-section__label">{label}</div>
    <div className="co-form-subsection">{children}</div>
  </div>
);


export const CreateMigrationHierarchyPage: React.FC<CreateMigrationHierarchyPageProps> = (props) => {
  const [state, dispatch] = React.useReducer(commonReducer, defaultState);

  React.useEffect(() => {
    const obj: K8sResourceKind = {
      apiVersion: `${MigrationHierarchyModel.apiGroup}/${MigrationHierarchyModel.apiVersion}`,
      kind: `${MigrationHierarchyModel.kind}`,
      metadata: {
        name: `${state.currentns}to${state.tons}`,
      },
      spec: {
        currentns: state.currentns,
        tons: state.tons,
      },
    };
    dispatch({ type: 'setPayload', payload: obj });
  }, [
    state.currentns,
    state.tons
  ]);

  const save = (e: React.FormEvent<EventTarget>) => {
    e.preventDefault();

    dispatch({ type: 'setProgress' });
    k8sCreate(MigrationHierarchyModel, state.payload)
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
        <title>Migration Hierarchy</title>
      </Helmet>
      <h1 className="co-m-pane__heading co-m-pane__heading--baseline">
        <div className="co-m-pane__name">Migration Hierarchy</div>
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
              Namespace to move
            </label>
            <NsDropdown
              selectedKey={state.currentns}
              onChange={(value) => dispatch({ type: 'setCurrentns', currentns: value })}
              id="ns-dropdown"
            />
          </div>
          <div className="form-group">
            <label htmlFor="ns-dropdown" className="co-required">
              To Namespace
            </label>
            <NsDropdown
              selectedKey={state.tons}
              onChange={(value) => dispatch({ type: 'setTons', tons: value })}
              id="ns-dropdown"
            />
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

type CreateMigrationHierarchyPageProps = {
  match: match<{name: string }>;
};
