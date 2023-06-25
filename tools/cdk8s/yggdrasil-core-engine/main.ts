import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import {
  IntOrString,
  KubeDeployment,
  KubeNamespace,
  KubeRoleBinding,
  KubeServiceAccount,
  Quantity,
} from './imports/k8s';
import { Helper } from './utils/helper';

import path = require('path');
require('dotenv').config({
  path: Helper.isProd
    ? path.resolve(__dirname, './env', '.env')
    : path.resolve(__dirname, './env', `.env.${process.env.NODE_ENV}`),
});

export class MyChart extends Chart {
  appContainerName = process.env.CONTAINERNAME ?? 'yggdrasil-core-engine';

  serviceLabel = {
    app: `${this.appContainerName}-services-${process.env.NODE_ENV}`,
  };

  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);

    // apply namespace
    new KubeNamespace(this, 'namespace', {
      metadata: {
        name: props.namespace,
      },
    });

    this.setupApp();

    // setup cronjob service account
    new KubeServiceAccount(this, 'service-account', {
      metadata: {
        name: this.labels.service,
        namespace: this.namespace,
      },
    });

    // setup cronjob service account role binding
    new KubeRoleBinding(this, 'role-binding', {
      metadata: {
        name: this.labels.service,
        namespace: this.namespace,
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: 'cluster-admin',
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          name: this.labels.service,
          namespace: this.namespace,
        },
      ],
    });
  }

  private setupApp() {
    new KubeDeployment(this, 'deployment', {
      metadata: {
        name: this.labels.app,
        namespace: this.namespace,
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: this.labels,
        },
        template: {
          metadata: {
            labels: this.labels,
            name: this.labels.app,
          },
          spec: {
            nodeSelector: Helper.isProd
              ? {
                  'cloud.google.com/gke-spot': 'true',
                }
              : undefined,
            terminationGracePeriodSeconds: Helper.isProd ? 25 : undefined,
            imagePullSecrets: [
              {
                name: process.env.IMAGE_PULL_SECRETS ?? 'registry-credentials',
              },
            ],
            containers: [
              {
                name: this.appContainerName,
                image: `${process.env.IMAGE_PATH}${
                  process.env.CI_COMMIT_SHA ?? 'latest'
                }`,
                imagePullPolicy:
                  process.env.IMAGE_PULL_POLICY ?? 'IfNotPresent',
                resources: {
                  limits: {
                    cpu: Quantity.fromString(Helper.isProd ? '0.25' : '0.25'),
                    memory: Quantity.fromString(
                      Helper.isProd ? '512Mi' : '512Mi'
                    ),
                  },
                },
                env: [
                  {
                    name: 'NODE_ENV',
                    value: `${process.env.SERVICE_TAGS ?? 'development'}`,
                  },
                  {
                    name: 'SERVICE_TAGS',
                    value: `${process.env.SERVICE_TAGS ?? 'development'}`,
                  },
                ],
                livenessProbe: {
                  httpGet: {
                    path: '/',
                    port: IntOrString.fromNumber(3000),
                  },
                  initialDelaySeconds: 10,
                },
              },
            ],
          },
        },
      },
    });
  }
}

const app = new App();
const appContainerName = process.env.CONTAINERNAME ?? 'yggdrasil-core-engine';
new MyChart(app, appContainerName, {
  namespace: `${appContainerName}-${process.env.NODE_ENV}`,
  labels: {
    app: `${appContainerName}-deployment-${process.env.NODE_ENV}`,
    service: `${appContainerName}-services-${process.env.NODE_ENV}`,
  },
});
app.synth();
