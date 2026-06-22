# Kubernetes DevOps Assignment Problem Statement

## Overview
You are required to design, containerize, and deploy a multi-tier architecture on Kubernetes involving one microservice and one database.  
The system should simulate a simple real-world setup where the service tier fetches data from the database tier via an exposed API.  
Build and push application docker images to Docker hub.  
**Any Tech Stack** can be used for microservice or application. 

---

## Application Requirements

### Service API Tier
- Expose an API or application endpoint.
- On API/Application invocation, fetches data from the database tier.
- Can use any standard language/framework of your choice (Node.js, Java, Python, .NET, etc.).
- Should use best practices for connecting to the database (e.g., connection pooling, config 
separation).
- Support rolling updates.
- Be externally accessible.
- Demonstrate self-healing.
- Demonstrate HPA on Service API.

### Database Tier
- Must include one table with 5–10 records.
- Should support data persistence.
- Be accessible only within the cluster.
- Automatically recover after pod deletion.

---

## Kubernetes Requirements

| Feature | Service API Tier | Database Tier |
|--------|------------------|---------------|
| Exposed outside the cluster | Yes | No |
| Number of pods | 4 (scalable) | 1 |
| Rolling updates support | Yes | No |
| Persistent storage | No | Yes |
| Configurable via ConfigMap | Yes | Optional |
| Secrets usage | Yes | Yes |

---

## Additional Requirements
- The database configuration used by the service API must be configurable outside the pod definition files and application code using Kubernetes `ConfigMap`.
- The database connection password must not be clearly visible in Kubernetes YAML files; use Kubernetes `Secret`.
- Database data must not be lost if the database pod is re-deployed.
- Pod IPs must not be used for communication between tiers.
- The service API tier must be exposed externally using `Ingress`.

---

## FinOps Requirements
- Define CPU and memory requests and limits for the service/API tier.
- Identify at least three opportunities to optimize Kubernetes costs.
- Implement resource optimization using observed metrics.

---

## Expected Outcome
The final solution should demonstrate a complete Kubernetes deployment where:
- the API is reachable from outside the cluster,
- the database is private and persistent,
- configuration is externalized securely, and
- the application is scalable and operationally reliable.