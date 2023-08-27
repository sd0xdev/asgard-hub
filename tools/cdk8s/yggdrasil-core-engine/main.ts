import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import {
  IntOrString,
  KubeDeployment,
  KubeNamespace,
  KubeRoleBinding,
  KubeService,
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

const env = [
  {
    name: 'NODE_ENV',
    value: `${process.env.SERVICE_TAGS ?? 'development'}`,
  },
  {
    name: 'PACKAGE_NAME',
    value: `${process.env.PACKAGE_NAME ?? 'Yggdrasil Core Engine'}`,
  },
  {
    name: 'SERVICE_NAME',
    value: `${process.env.SERVICE_NAME ?? 'yggdrasil-core-engine'}`,
  },
  {
    name: 'LOGGER_LEVEL',
    value: `${process.env.LOGGER_LEVEL ?? 'info'}`,
  },
  {
    name: 'A_AZURE_OPENAI_ENABLE',
    value: `${process.env.A_AZURE_OPENAI_ENABLE ?? 'true'}`,
  },
  {
    name: 'A_AZURE_OPENAI_DEPLOYMENT_NAME',
    value: `${process.env.A_AZURE_OPENAI_DEPLOYMENT_NAME ?? 'gpt-3_5'}`,
  },
  {
    name: 'A_AZURE_OPENAI_MODEL_NAME',
    value: `${process.env.A_AZURE_OPENAI_MODEL_NAME ?? 'gpt-35-turbo'}`,
  },
  {
    name: 'A_AZURE_OPENAI_API_VERSION',
    value: `${process.env.A_AZURE_OPENAI_API_VERSION ?? '2023-07-01-preview'}`,
  },
];

const secretRef = [
  {
    name: 'CORE_ENGINE_API_KEY',
    valueFrom: {
      secretKeyRef: {
        name: 'yggdrasil-core-engine',
        key: 'core-engine-api-key',
      },
    },
  },
  {
    name: 'OPENAI_API_KEY',
    valueFrom: {
      secretKeyRef: {
        name: 'yggdrasil-core-engine',
        key: 'openai-api-key',
      },
    },
  },
  {
    name: 'CHATGPT_ORG',
    valueFrom: {
      secretKeyRef: {
        name: 'yggdrasil-core-engine',
        key: 'chatgpt-org',
      },
    },
  },
  {
    name: 'A_AZURE_OPENAI_API_KEY',
    valueFrom: {
      secretKeyRef: {
        name: 'yggdrasil-core-engine',
        key: 'a-azure-openai-api-key',
      },
    },
  },
  {
    name: 'A_AZURE_OPENAI_ENDPOINT',
    valueFrom: {
      secretKeyRef: {
        name: 'yggdrasil-core-engine',
        key: 'a-azure-openai-endpoint',
      },
    },
  },
  {
    name: 'A_AZURE_OPENAI_INSTANCE_NAME',
    valueFrom: {
      secretKeyRef: {
        name: 'yggdrasil-core-engine',
        key: 'a-azure-openai-instance-name',
      },
    },
  },
  {
    name: 'RPC_API_KEY',
    valueFrom: {
      secretKeyRef: {
        name: 'yggdrasil-core-engine',
        key: 'rpc-api-key',
      },
    },
  },
  {
    name: 'MONGO_DB_URI',
    valueFrom: {
      secretKeyRef: {
        name: 'yggdrasil-core-engine',
        key: 'mongo-db-uri',
      },
    },
  },
];

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
    this.setupService();

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
                  ...env,
                  ...secretRef,
                ],
                livenessProbe: {
                  httpGet: {
                    path: '/api/health',
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

  private setupService() {
    new KubeService(this, 'service', {
      metadata: {
        name: this.labels.service,
        namespace: this.namespace,
      },
      spec: {
        type: 'ClusterIP',
        selector: {
          app: this.labels.app,
        },
        ports: [
          {
            port: 80,
            targetPort: IntOrString.fromNumber(
              Number(process.env.APP_CLUSTER_PORT ?? 3001)
            ),
            name: 'http',
          },
          {
            port: Number(process.env.APP_CLUSTER_GRPC_PORT ?? 5000),
            targetPort: IntOrString.fromNumber(
              Number(process.env.APP_CLUSTER_GRPC_PORT ?? 5000)
            ),
            name: 'grpc',
          },
          {
            port: Number(process.env.APP_CLUSTER_GRPC2_PORT ?? 5001),
            targetPort: IntOrString.fromNumber(
              Number(process.env.APP_CLUSTER_GRPC2_PORT ?? 5001)
            ),
            name: 'grpc2',
          },
        ],
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
