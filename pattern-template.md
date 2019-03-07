# Short title

Storing private healthcare data off-chain and medical data management using Blockchain

# Long title

Store patient medical records data off-chain on a blockchain platform which allows for data and user hierarchy management

# Author

* Ashutosh Nath Agarwal <ashutosh.nath.agarwal@ibm.com>

# URLs

### Github repo

* https://github.com/IBM/Medical-Blockchain

# Summary

This code pattern was built using Blockchain Solution Manager and Blockchain Document Store connected with the IBM Blockchain Platform. The application showcases using these services in the healthcare industry to manage user access and patient medical records data, and creates a well-defined hierarchical structure of all the stakeholders. The pattern showcases the flow of the application from the point of view of a Solution Admin, Hospital Admin, Doctor and Patient.

# Technologies

* [Nodejs](https://www.nodejs.org/) is an open-source, cross-platform JavaScript run-time environment that executes JavaScript code server-side.
* [Vuejs](https://vuejs.org/) is a progressive framework for building user interfaces.
* [Redis](https://redis.io/) is an open source (BSD licensed), in-memory data structure store, used as a database, cache and message broker.
* [Bootstrap](https://getbootstrap.com/) is a free and open-source front-end Web framework. It contains HTML and CSS-based design templates for typography, forms, buttons, navigation and other interface components, as well as optional JavaScript extensions.
* [Docker](https://www.docker.com/) is a computer program that performs operating-system-level virtualization, also known as Containerization.

# Description

Electronic Medical Records and Data craves the need for innovation. The way patient health records are stored and secured today do not showcase our technological advancement in this area in the past decade, and hospitals continue to use age-old data management systems for patient data. This is partly due to strict regulations around privacy and security of medical data, which has stifled the use of latest technology to make Medical data management more transparent and useful for both patients as well as doctors.

This code pattern showcases a medical data/access management platform built using blockchain. The application shows the platform from the point of view of 4 stakeholders -
* The Solution Admin is the admin of a conglomerate of hospitals, and has the highest of access levels in the hierarchy. They have the ability to onboard a new organization (hospital) to the conglomerate and assign/de-assign hospital admins on their dashboard.
* The Organization (hospital) Admin is the admin of a particular hospital which is part of the conglomerate/solution. They have the abiltity to onboard new users with the role of either Patient or Doctor, or remove a user.
* The Doctor is a user in the Organization with the appropriate role and has the ability to upload documents for their patients and download/view documents of their patients to which they have been granted access.
* The Patient is a user in the Organization with the appropriate role and has the ability to upload documents on their own, view them, view the document access logs and also manage access to their documents on their dashboard.

This code pattern is for developers who want to integrate with the Blockchain Solution Manager, Blockchain Document Store and the IBM Blockchain Platform. When you have completed it, you will understand how to:

* Connect the Blockchain Solution Manager and Blockchain Document Store with the IBM Blockchain Platform.
* Create a VueJS web app that has multiple dashboards on a Single Page Application, which can communicate in realtime with each other.
* Create a NodeJS server that is deployed to Kubernetes on IBM Cloud, and connected with a Redis database deployed on the IBM Cloud.
* Store and retrieve data from a Redis datastore for persitent storage through a NodeJS server.
* Make REST calls to an external service.
* Use JWT tokens for user management.

# Flow

![Architecture flow](https://github.com/IBM/Medical-Blockchain/blob/master/docs/doc-images/arch-flow.png?raw=true)

### Login flow
1. All the stakeholders of the application (Solution Admin, Hospital Admin, Doctor and Patient) begin the user flow by logging into their respective dashboards.
2. Clicking the login button leads to the login portal of the Blockchain Solution Manager, hosted on the IBM cloud.
3. The login portal uses OpenAPI Connect and allows the user the login through any onboarded IDP (in our example, we have onboarded IBMID ad GoogleID). Successful authentication leads to the JWT credentials for the user.

### Admin dashboard
4. The Solution Admin flow begins at the Admin Component, and requires the user to authenticate themselves through the Login Flow described above.
5. After successful authentication, the user can access the solution admin dashboard. They are able to view the solution, and add/remove hospitals from the solution using the Admin API's.
6. All the Admin API's connect with the Blockchain Solution Manager through REST to process the user queries.
7. The Blockchain Solution Manager connects with the IBM Blockchain Platform and updates the ledger appropriately.

### Organization dashboard
8. The Hospital Admin flow begins at the Organization Component, and requires the user to authenticate themselves through the Login Flow described above.
9. After successful authentication, the user can access the hospital admin dashboard. They are able to add/remove any user in their respective hospital with the onboarded roles (Patient/Doctor in our case) using the Organization API's.
10. All the Organization API's connect with the Blockchain Solution Manager through REST to process the user queries.
11. The Blockchain Solution Manager connects with the IBM Blockchain Platform and updates the ledger appropriately.

### Doctor dashboard
12. The Doctor flow begins at the Doctor Component, and requires the user to authenticate themselves through the Login Flow described above.
13. After successful authentication, the user can access the doctor dashboard. They are able to upload a medical record for a patient who is part of their hostpital and download any medical record associated with a patient to which they have access to, using the Doctor API's. The ACL's for all the patient documents is application level and is maintained through the Document ACL flow described below.
14. All the Doctor API's connect with the Blockchain Document Store through REST to process the user queries.
15. The Blockchain Document Store connects with the IBM Blockchain Platform and updates the ledger appropriately.

### Patient dashboard
16. The Patient flow begins at the Patient Component, and requires the user to authenticate themselves through the Login Flow described above.
17. After successful authentication, the user can access the patient dashboard. They are able to upload a medical record for themselves, download any of their medical records, view the access logs of their documents, and view/manage permissions to their documents, using the Patient API's. The ACL's for all the documents is application level and is maintained through the Document ACL flow described below.
18. All the Patient API's connect with the Blockchain Document Store through REST to process the user queries.
19. The Blockchain Document Store connects with the IBM Blockchain Platform and updates the ledger appropriately.

### Document access control list (ACL) flow
20. The Doctor and Patient Component are connected with the Redis API's that invoke methods to manage the document level access control across hospitals.
21. The Redis API's talk to a NodeJS server deployed in a Docker container in a Kubernetes cluster on the IBM Cloud.
22. The server talks to two Redis databases which hold the access-per-document and access-per-user permissions.

# Components and services

+ [IBM Blockchain Platform](https://console.bluemix.net/docs/services/blockchain/howto/ibp-v2-deploy-iks.html#ibp-v2-deploy-iks) gives you total control of your blockchain network with a user interface that can simplify and accelerate your journey to deploy and manage blockchain components on the IBM Cloud Kubernetes Service.
+ [IBM Blockchain Solution Manager:]() The Blockchain Document Store service includes the IBM Blockchain Solution Manager component, which enables organizations to easily manage blockchain networks, solutions, services, and users.
+ [IBM Blockchain Document Store]() is a comprehensive document management service for IBM Blockchain Platform business networks.
+ [IBM Cloud Kubernetes Service](https://www.ibm.com/cloud/container-service) creates a cluster of compute hosts and deploys highly available containers. A Kubernetes cluster lets you securely manage the resources that you need to quickly deploy, update, and scale applications.
+ [IBM Cloud Databases for Redis Service:](https://console.bluemix.net/catalog/services/databases-for-redis) Redis is an open source, in-memory data structure store, used as a database, cache and message broker. It supports data structures such as strings, hashes, lists, sets, sorted sets with range queries, bitmaps, hyperloglogs and geospatial indexes with radius queries.
