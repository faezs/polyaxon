import * as _ from 'lodash';
import * as React from 'react';

import * as codeRefActions from '../../actions/codeReference';
import * as actions from '../../actions/experiment';
import {
  getExperimentUrl,
  getGroupUrl,
  getProjectUrl,
  getUserUrl,
  splitUniqueName,
} from '../../constants/utils';
import CodeReference from '../../containers/codeReference';
import EntityBuild from '../../containers/entityBuild';
import ExperimentJobs from '../../containers/experimentJobs';
import Logs from '../../containers/logs';
import Metrics from '../../containers/metrics';
import Statuses from '../../containers/statuses';
import { ActionInterface } from '../../interfaces/actions';
import { BookmarkInterface } from '../../interfaces/bookmarks';
import { ExperimentModel } from '../../models/experiment';
import { getBookmark } from '../../utils/bookmarks';
import Breadcrumb from '../breadcrumb';
import { EmptyList } from '../empty/emptyList';
import ExperimentInstructions from '../instructions/experimentInstructions';
import LinkedTab from '../linkedTab';
import RunEnv from '../runEnv';
import YamlText from '../yamlText';
import ExperimentOverview from './experimentOverview';

export interface Props {
  experiment: ExperimentModel;
  onDelete: () => actions.ExperimentAction;
  onUpdate: (updateDict: { [key: string]: any }) => actions.ExperimentAction;
  onStop: () => actions.ExperimentAction;
  fetchData: () => actions.ExperimentAction;
  bookmark: () => actions.ExperimentAction;
  unbookmark: () => actions.ExperimentAction;
  fetchCodeReference: () => codeRefActions.CodeReferenceAction;
}

export default class ExperimentDetail extends React.Component<Props, {}> {
  public componentDidMount() {
    this.props.fetchData();
  }

  public render() {
    const experiment = this.props.experiment;
    if (_.isNil(experiment)) {
      return EmptyList(false, 'experiment', 'experiment');
    }

    const action: ActionInterface = {
      last_status: this.props.experiment.last_status,
      onDelete: this.props.onDelete,
      onStop: this.props.onStop

    };
    const bookmark: BookmarkInterface = getBookmark(
      this.props.experiment.bookmarked, this.props.bookmark, this.props.unbookmark);
    const values = splitUniqueName(experiment.project);
    const experimentUrl = getExperimentUrl(values[0], values[1], this.props.experiment.id);
    let group = null;
    if (!_.isNil(experiment.experiment_group)) {
      group = parseInt(splitUniqueName(experiment.experiment_group)[2], 10);
    }
    const projectUrl = getProjectUrl(values[0], values[1]);
    let breadcrumbLinks: Array<{ name: string; value?: string | undefined }>;
    breadcrumbLinks = [
      {name: values[0], value: getUserUrl(values[0])},
      {name: values[1], value: projectUrl}];
    if (group) {
      const groupUrl = getGroupUrl(values[0], values[1], group);
      breadcrumbLinks.push(
        {name: `Group ${group}`, value: groupUrl},
        {name: 'Experiments', value: `${groupUrl}#experiments`});
    } else {
      breadcrumbLinks.push({name: 'Experiments', value: `${projectUrl}#experiments`});
    }
    breadcrumbLinks.push({name: `Experiment ${experiment.id}`});

    return (
      <div className="row">
        <div className="col-md-12">
          <div className="entity-details">
            <Breadcrumb
              icon="fa-cube"
              links={breadcrumbLinks}
              bookmark={bookmark}
              actions={action}
            />
            <LinkedTab
              baseUrl={experimentUrl}
              tabs={[
                {
                  title: 'Overview',
                  component: <ExperimentOverview
                    experiment={experiment}
                    onUpdate={this.props.onUpdate}
                  />,
                  relUrl: ''
                }, {
                  title: 'Logs',
                  component: <Logs
                    fetchData={() => null}
                    logs={''}
                    user={experiment.user}
                    project={experiment.project}
                    resource="experiments"
                    id={experiment.id}
                  />,
                  relUrl: 'logs'
                }, {
                  title: 'Jobs',
                  component: <ExperimentJobs
                    fetchData={() => null}
                    user={experiment.user}
                    experiment={experiment}
                  />,
                  relUrl: 'jobs'
                }, {
                  title: 'CodeRef',
                  component: <CodeReference
                    fetchData={this.props.fetchCodeReference}
                    codeReferenceId={experiment.code_reference}
                  />,
                  relUrl: 'codeRef'
                }, {
                  title: 'RunEnv',
                  component: <RunEnv
                    runEnv={experiment.run_env}
                  />,
                  relUrl: 'build'
                }, {
                  title: 'Build',
                  component: <EntityBuild buildName={experiment.build_job}/>,
                  relUrl: 'build'
                }, {
                  title: 'Statuses',
                  component: <Statuses
                    project={experiment.project}
                    resource="experiments"
                    id={experiment.id}
                  />,
                  relUrl: 'statuses'
                }, {
                  title: 'Metrics',
                  component: <Metrics
                    project={experiment.project}
                    resource="experiments"
                    id={experiment.id}
                    experiment={experiment}
                    chartTypes={['line', 'bar']}
                  />,
                  relUrl: 'metrics'
                }, {
                  title: 'Config',
                  component: <YamlText title="Config" config={experiment.config}/>,
                  relUrl: 'config'
                }, {
                  title: 'Instructions',
                  component: <ExperimentInstructions id={experiment.id}/>,
                  relUrl: 'instructions'
                }
              ]}
            />
          </div>
        </div>
      </div>
    );
  }
}
