# Drug Dispensary API Documentation
## Introduction

Welcome to the Drug Dispensary API! This API provides functionality for managing patients, drugs, and prescriptions within a drug dispensary system. It supports user authentication, drug management, and retrieval of patient and drug information.

## Base URL
The base URL for all API endpoints is `http://localhost:3030/.`

## Authentication
To access certain endpoints, user authentication is required. The API uses JSON Web Tokens (JWT) for authentication. Include the generated token in the Authorization header of your requests.

## Example

plaintext
Authorization: Bearer YOUR_GENERATED_TOKEN

# Endpoints
## 1. User Authentication

### 1.1 Authenticate User
Endpoint: POST /auth
Description: Authenticates a user (patient or admin) based on provided SSN and password.
Request Body:
SSN (string): Social Security Number of the user.
password (string): User password.
Response:
If successful, returns a JWT token and user type.
Example Response:


```json
{
  "accessToken": "YOUR_GENERATED_TOKEN",
  "userType": "user"
}
```
Authentication: Not required.

## 2. User Management
### 2.1 Create User
Endpoint: POST /addUser
Description: Registers a new patient.
Request Body:
SSN (string): Social Security Number of the patient.
fname (string): First name of the patient.
lname (string): Last name of the patient.
dob (string): Date of birth of the patient.
phone (string): Phone number of the patient.
email (string): Email address of the patient.
address (string): Address of the patient.
gender (string): Gender of the patient.
password (string): Password for the patient account.
Response:
If successful, redirects to the login page.
Authentication: Not required.

## 3. Profile Management
### 3.1 Get User Profile
Endpoint: GET /profile
Description: Retrieves the profile information of the authenticated user.
Response:
Returns user profile information.
Example Response:

```json
{
  "SSN": "123456789",
  "Fname": "John",
  "Lname": "Doe",
  "phone": "123-456-7890",
  "dob": "1990-01-01",
  "email": "john.doe@example.com",
  "password": "hashed_password",
  "address": "123 Main St, City",
  "gender": "Male"
}```
Authentication: Required.

### 3.2 Get User Profile by SSN

Endpoint: GET /getProfile/:SSN
Description: Retrieves the profile information of a user by SSN.
Response:
Returns user profile information.
Example Response:

```json
{
  "SSN": "123456789",
  "Fname": "John",
  "Lname": "Doe",
  "phone": "123-456-7890",
  "dob": "1990-01-01",
  "email": "john.doe@example.com",
  "address": "123 Main St, City",
  "gender": "Male"
}```

Authentication: Required.