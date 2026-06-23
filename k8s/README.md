### All k8s command to run on cluster
### **MUST BE RAN SEQUENTIALLY**

Just copy paste the entire block.

```bash
# apply db secrets and configs first
kubectl apply -f ./db/db-postgres-secret.yaml

# mount a volume for db storage
kubectl apply -f ./db/db-pvc.yaml

# create db and setup networking
kubectl apply -f ./db/db-statefulset.yaml
kubectl apply -f ./db/db-service.yaml

# setup configs for api
kubectl apply -f ./api/api-configmap.yaml

# start the api
kubectl apply -f ./api/api-deployment.yaml

# expose api to cluster
kubectl apply -f ./api/api-service.yaml

# setup HPA
kubectl apply -f ./api/api-hpa.yaml

# setup frontend UI
kubectl apply -f ./ui/ui-deployment.yaml
kubectl apply -f ./ui/ui-service.yaml

# setup ingress routing
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# run this after all pods are running successfully
kubectl apply -f ./ingress.yaml
```