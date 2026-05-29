# DevOps Todo

## Foundation

- [x] Add Docker support for frontend and backend
- [x] Add Docker Compose for local full-stack runs
- [x] Make frontend API calls work behind the container proxy

## CI

- [x] Add Jenkinsfile to the repository
- [ ] Add lint stage for frontend and backend
- [ ] Add unit test stage for frontend and backend
- [ ] Add Docker build stage
- [ ] Push images to a registry

## Code Quality

- [ ] Add SonarQube scanning to the pipeline
- [ ] Define quality gate thresholds
- [ ] Publish coverage reports

## Security

- [ ] Add Trivy image scanning
- [ ] Add dependency vulnerability scanning
- [ ] Store secrets in a secure secret manager

## Kubernetes

- [ ] Create namespace structure for staging and production
- [ ] Create backend deployment and service manifests
- [ ] Create frontend deployment, service, and ingress
- [ ] Create MongoDB deployment or managed DB integration
- [ ] Add resource requests and limits

## Observability

- [ ] Install Prometheus
- [ ] Install Grafana
- [ ] Add dashboards for app and cluster health
- [ ] Add centralized logging with Fluent Bit, Elasticsearch, and Kibana

## GitOps and Release

- [ ] Add ArgoCD
- [ ] Add versioned image tags
- [ ] Add rollback procedure
- [ ] Document production release flow