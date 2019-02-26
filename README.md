# Storing private healthcare data off chain and Medical data management using Blockchain 

Electronic Medical Records and Data craves the need for innovation. The way patient health records are stored and secured today do not showcase our technological advancement in this area in the past decade, and hospitals continue to use age-old data management systems for patient data. This is partly due to strict regulations around privacy and security of medical data, which has stifled the use of latest technology to make Medical data management more transparent and useful for both patients as well as doctors.

This code pattern showcases the Medical data management platform from the point of view of 4 stakeholders -
* The Solution Admin is the admin of a conglomerate of hospitals, and has the highest of access levels in the hierarchy. They have the ability to onboard a new organization (hospital) to the conglomerate and assign/de-assign hospital admins on their dashboard.
* The Organization (hospital) Admin is the admin of a particular hospital which is part of the conglomerate/solution. They have the abiltity to onboard new users with the role of either Patient or Doctor, or remove a user.
* The Doctor is a user in the Organization with the appropriate role and has the ability to upload documents for their patients and download/view documents of their patients to which they have been granted access.
* The Patient is a user in the Organization with the appropriate role and has the ability to upload documents on their own, view them, and also manage access to their documents on their dashboard.

This code pattern is for developers who want to integrate with the Blockchain Solution Manager, Blockchain Document Store and the Blockchain Platform. When you have completed it, you will understand how to:

* Create a VueJS web app that has multiple dashboards on a Single Page Application.
* Create a NodeJS server that is deployed to Kubernetes on IBM Cloud.
* Store and retrieve data from a Redis datastore for persitent storage through a NodeJS server.
* Use JWT tokens for user management.

# Architecture flow

![Architecture flow](docs/doc-images/arch-flow.png?raw=true)

1. User sends the investment portfolio to the Investment Portfolio service.
2. User selects multiple news feeds for the application to monitor.
3. Application sends the portfolio name and selected news feeds to the server.
4. Server pulls the user's portfolio from the investment portfolio service.
5. Server then spawns a process for each feed to monitor them in parallel.
6. Each process spawns two threads:
   * One that starts and stops recording the clip once the process identifies an appropriate clip for the user based on the portfolio
   * The other sends the clip extracted through an error detect sequence to fix any encoding issues with the clip
7. Processes continuously send the clips to be stored in a repository.
8. User gets the clips on the client side through a socket connection to the server.

# Included components

+ [IBM Blockchain Platform](https://console.bluemix.net/docs/services/blockchain/howto/ibp-v2-deploy-iks.html#ibp-v2-deploy-iks) gives you total control of your blockchain network with a user interface that can simplify and accelerate your journey to deploy and manage blockchain components on the IBM Cloud Kubernetes Service.
+ [IBM Cloud Kubernetes Service](https://www.ibm.com/cloud/container-service) creates a cluster of compute hosts and deploys highly available containers. A Kubernetes cluster lets you securely manage the resources that you need to quickly deploy, update, and scale applications.
+ IBM Blockchain Solution Manager
+ IBM Blockchain Document Store

## Featured technologies

* [Nodejs](https://www.nodejs.org/) is an open-source, cross-platform JavaScript run-time environment that executes JavaScript code server-side.
* [Vuejs](https://vuejs.org/) is a progressive framework for building user interfaces.
* [Redis](https://redis.io/) is an open source (BSD licensed), in-memory data structure store, used as a database, cache and message broker.
* [Bootstrap](https://getbootstrap.com/) is a free and open-source front-end Web framework. It contains HTML and CSS-based design templates for typography, forms, buttons, navigation and other interface components, as well as optional JavaScript extensions.
* [JQuery](https://jquery.com) is a cross-platform JavaScript library designed to simplify the client-side scripting of HTML.
* [Docker](https://www.docker.com/) is a computer program that performs operating-system-level virtualization, also known as Containerization.

# Running the application

## Manually deploy to local machine
1. [Set up your machine](#1-set-up-your-machine)
2. [Clone the repository](#2-clone-the-repository)
3. [Run the application in a Docker container](#3-run-with-docker)

### 1. Set up your machine
- [Docker](https://www.docker.com/): Go to the Docker website and download the installer. After installation, run Docker.

### 2. Clone the repository

```
git clone https://github.com/IBM/Medical-Blockchain.git
```

### 3. Run with Docker

```
$ bash docker-run.sh
```

You can view the Docker logs of your store:
```
$ docker logs medrec
```

Access the running app in a browser at <http://0.0.0.0:8080/>.

# License

This code pattern is licensed under the Apache Software License, Version 2.  Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](http://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](http://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)
