## React JS Frontend with Node JS Backend using MongoDB

## View The Full React JS Tutorial Series Here:
## https://www.youtube.com/playlist?list=PL7lXhMmy4JB5X38OT1JzXLmgP2hUM-v5f


Make sure to set up your MongoDB with the table: react_db

Make sure to update the /backend/.env file with your MongoDB DB_URI

```javascript
cd backend
npm start

cd frontend
npm start
```

## Run with Docker

Build and start both services with:

```bash
docker compose up --build
```

The backend will be available on port 4000 and the frontend on port 3000.

## DevOps Roadmap

This project can be turned into a full CI/CD and observability pipeline in phases.

### Phase 1: Containerization

- Create production Dockerfiles for frontend and backend
- Add Docker Compose for local development with MongoDB
- Standardize environment variables and secrets handling
- Verify the app runs end to end in containers

### Phase 2: CI with Jenkins

- Connect the repository to Jenkins
- Run install, lint, and test stages on every push
- Run backend Jest tests in Jenkins, just like the frontend test stage
- Add build stages for frontend and backend images
- Publish Docker images to a real registry such as Docker Hub or GHCR
- Optionally trigger Render deploy hooks after a successful image build

### Jenkins Wiring Required

To use the full pipeline, configure these Jenkins values:

- `docker-registry-creds` for registry push credentials
- `sonar-token` for SonarQube analysis
- `SONAR_HOST_URL` as a Jenkins environment variable
- `ENABLE_IMAGE_PUSH=true` to publish images
- `RENDER_DEPLOY_HOOK_BACKEND` and `RENDER_DEPLOY_HOOK_FRONTEND` if you want Render deploys

### Important Deployment Note

Render works well for app services and deploy hooks, but Prometheus, Grafana, and SonarQube are usually better hosted on Kubernetes or a VM with persistent storage. If you want a production-grade stack, keep the application pipeline in Jenkins and deploy the monitoring stack separately.

### Phase 3: Code Quality with SonarQube

- Add SonarQube analysis to the pipeline
- Enforce quality gates for bugs, vulnerabilities, and coverage
- Fail the pipeline if the quality gate does not pass

### Phase 4: Security Scanning

- Scan Docker images with Trivy
- Scan dependencies for known vulnerabilities
- Block promotion to staging or production on critical findings

### Phase 5: Kubernetes Deployment

- Create Kubernetes manifests or Helm charts
- Deploy frontend, backend, and MongoDB to the cluster
- Add Ingress for external traffic
- Separate staging and production namespaces

### App Load Balancing

The repository now includes a starter app stack under `k8s/staging`.

It exposes the backend and frontend through Kubernetes `LoadBalancer` services and runs two replicas for each service so traffic can be balanced across pods.

Deploy it with:

```bash
kubectl apply -k k8s/staging
```

The image names are currently set to `docker.io/medhedi19/react-backend:latest` and `docker.io/medhedi19/react-frontend:latest`, so enable the Jenkins image push stage before expecting the cluster deploy to pull them from Docker Hub.

### Phase 6: Monitoring and Logging

- Install Prometheus and Grafana
- Expose application and cluster metrics
- Add centralized logging with Fluent Bit, Elasticsearch, and Kibana
- Create dashboards and alerts for key services

### Monitoring Manifests

The repository now includes a starter Kubernetes monitoring stack under `k8s/monitoring`.

Deploy it with:

```bash
kubectl apply -k k8s/monitoring
```

That stack includes:

- Prometheus
- Grafana
- SonarQube
- PostgreSQL for SonarQube

Update the scrape targets in `k8s/monitoring/prometheus-configmap.yaml` so they match the Kubernetes services for your backend and frontend once those app manifests are added.

### Phase 7: GitOps and Release Automation

- Add ArgoCD for GitOps deployment
- Promote images from staging to production using versioned tags
- Document rollback and release procedures

## Suggested Delivery Order

1. Docker and Docker Compose
2. Jenkins pipeline
3. SonarQube quality gate
4. Trivy security scan
5. Kubernetes manifests
6. Prometheus and Grafana
7. Logging stack
8. ArgoCD GitOps

## Recommended Branch Strategy

- `main` for production-ready code
- `develop` for integration work
- Feature branches for each pipeline milestone

## First Milestone

The best first step is to finish the container setup, then add a Jenkins pipeline that:

- checks out code
- installs dependencies
- runs tests and linting
- builds Docker images
- scans images
- deploys to a staging namespace
