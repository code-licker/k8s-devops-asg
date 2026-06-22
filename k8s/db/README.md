### Run these commands sequentially 

```sh
# apply secrets and configs first
kubectl apply -f ./db-acr-secret.yaml
kubectl apply -f ./db-postgres-secret.yaml

# mount a volume for db storage
kubectl apply -f ./db-pvc.yaml

# create db and setup networking
kubectl apply -f ./db-statefulset.yaml
kubectl apply -f ./db-service.yaml
```