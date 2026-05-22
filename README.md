# JECRConnect - College Alumni Portal (Backend)

This repository contains the backend application for the JECRConnect college alumni portal, designed specifically as a containerized workload for our internal on-premise infrastructure. It serves as the central API data provider for the frontend application, managing events, job postings, mentorship programs, and user data.

## Features & API Architecture

The backend provides a RESTful API under the `/api/v1` prefix. It handles requests from the frontend and interfaces with the underlying database.

### Core Endpoints

* **Authentication (`/auth`)**
    * `POST /auth/login`: Authenticate users.
    * `POST /auth/register`: Register new users to the network.
* **Events (`/events`)**
    * `GET /events`: Retrieve a list of all campus/alumni events.
    * `GET /events/:id`: Retrieve details for a specific event.
    * `POST /events`: Create and publish a new event.
* **Jobs (`/jobs`)**
    * `GET /jobs`: Retrieve all job and referral postings.
    * `GET /jobs/:id`: Retrieve details for a specific job.
    * `POST /jobs`: Post a new job opportunity.
* **Mentorship (`/mentorship`)**
    * `GET /mentorship`: Retrieve all approved alumni mentors.
    * `GET /mentorship/:id`: Retrieve a specific mentor's profile.
    * `POST /mentorship`: Create a new mentor profile.
    * `GET /mentorship/me/profile`: Retrieve the current logged-in user's mentor profile.
    * `PUT /mentorship/:id`: Update an existing mentor profile.
    * `DELETE /mentorship/:id`: Delete a mentor profile.
    * `PATCH /mentorship/:id/status`: Update mentor status (e.g., admin approval).

## Security & Authentication

The backend API is secured using Bearer tokens (JWT) provided by our internal Keycloak identity provider. Protected endpoints require a valid access token in the `Authorization` header.

## On-Premise Deployment

This backend workload is actively deployed alongside the frontend within our internal infrastructure.

**Target Environment:**
* **Cluster:** Rancher-managed RKE2 
* **Infrastructure:** Bare-metal ProLiant servers

**Deployment Steps:**
Apply the Kubernetes manifests to deploy the backend services and expose them internally.

```bash
kubectl apply -f backend.yml