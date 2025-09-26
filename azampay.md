Okay now lets proceed with the Phase 5: Payment Integration & Order Fulfillment
This phase connects the e-commerce store to the payment gateway and implements the order routing logic.
Backend Integration with AzamPay:
Develop a service in NestJS to communicate with the AzamPay API.
Create an endpoint to initiate a payment. This endpoint will receive the order total, generate a payment request to AzamPay, and return a payment URL to the frontend.
Create a webhook endpoint. This is a URL that AzamPay will call to notify your system about the status of a transaction (e.g., "SUCCESS" or "FAILURE"). This is the most reliable way to confirm payment.


Order Processing Logic:
When the webhook confirms a successful payment, update the order status in your database to PAID.
Trigger the automatic order routing logic:
Identify which shop holds the inventory for the ordered items.
Change the order's status to PROCESSING and assign it to the correct shop_id.
(Future enhancement) Implement a notification system (e.g., email or in-app alert) to inform the shop about the new order.




Frontend Checkout Completion:
In the Next.js app, redirect the customer to the AzamPay payment URL during checkout.
Create a "Thank You" page for successful orders and a "Payment Failed" page, to which AzamPay will redirect the user after the transaction.

 We shall be using the azampay API with the docunmentation below.  here are the credentials: 
 Azam Pay API
App name: Boat-Rental 
client ID: 8e88f652-e74e-4a15-9118-11c713179cce

Client secret key: ATzY89wnUlWEcAsSu/etJFJoQIBo9Ca33JsyW8noQfrBu/squHSWqCQaQyt3js5bVp5JHNx3ozZ4i2XtDf3hraMHTRBc3dKRuXhdQPyodSA1rSnnvZfBgjJ33OqsblJ3FWnXxAbjl4NBuoKlOOoVuyYI5NxTkI2R1A4HgLURihMcEBbjzNn5v5X3N7nQGPF5kk3cMohifba/Xi9eIgVPElFpwU00lbKY7+m65XiDfm03x+jvkWgZfEXQFq9qEpsP2AoYe4oj/Y61AqqG118Ly3Mf1x9tOpcb8XomP02vJa/BAA23ijhUK+Vx860AifR/zpgVGU9ByfjLQJ6/JpVe4QE+MQapFhWlctoRJb0TVKFIJwocbsbxOxRtV31zYPF06MV0J1IU6WNalKcERctIw9zIazP46ta2XOGMLbzgJAUPaVLUzRkhvoB9eecjF+kcEJJeh1o4TwJ7QdBdscFpYOFfGxOrHQBY7hX7oUmT3luiD+sAOqW+YUPNzqZIZLMls7eC88PMaRkFR85wUymGivbnjl/mHbSAsHRmoHxOVzSMjaC7mXphGJsQOi7aJogf7fRzXOGDUWfMYXQTAc6YlOnhtmxrDFAlWsziVssaiZkw60eBF6OQ+kJGUPGZptt8cgzmxP2OTLg1DbMXrMCGovuC1/KX1U/SMFBNwJlMuKw=

Token: 6f2b26e2-aef8-4db9-ad95-48522644baac

Callback url: https://sandbox.azampay.co.tz/api/v1/Checkout/Callback

# Azampay API Integration Documentation

## Overview
This document outlines the integration of Azampay payment gateway with the Multi-shop Inventory Management System. Azampay provides secure payment processing for businesses in East Africa, supporting various payment methods including mobile money and bank transfers.

## Base URLs
- **Sandbox Authenticator**: https://authenticator-sandbox.azampay.co.tz
- **Sandbox Checkout**: https://sandbox.azampay.co.tz

## Authentication
Azampay uses Bearer Token authentication with JWT tokens.

### Token Generation
Endpoint: `POST /AppRegistration/GenerateToken`

#### Request Body
```json
{
  "appName": "string",
  "clientId": "string",
  "clientSecret": "string"
}
```

#### Response
```json
{
  "data": {
    "accessToken": {},
    "expire": {}
  },
  "message": "Token generated successfully",
  "success": true,
  "statusCode": 200
}
```

## Payment Methods

### 1. Mobile Network Operator (MNO) Checkout
Endpoint: `POST /azampay/mno/checkout`

#### Request Body
```json
{
  "accountNumber": "string",
  "additionalProperties": {
    "property1": null,
    "property2": null
  },
  "amount": 0,
  "currency": "string",
  "externalId": "string",
  "provider": "Airtel" // Enum: "Airtel" "Tigo" "Halopesa" "Azampesa" "Mpesa"
}
```

#### Response
```json
{
  "transactionId": "string",
  "message": "string",
  "success": true
}
```

### 2. Bank Checkout
Endpoint: `POST /azampay/bank/checkout`

#### Request Body
```json
{
  "additionalProperties": {
    "property1": null,
    "property2": null
  },
  "amount": 0,
  "currencyCode": "string",
  "merchantAccountNumber": "string",
  "merchantMobileNumber": "string",
  "merchantName": "string",
  "otp": "string",
  "provider": "CRDB", // Enum: "CRDB" "NMB"
  "referenceId": "string"
}
```

#### Response
```json
{
  "transactionId": "string",
  "message": "string",
  "success": true
}
```

## Callback Endpoint
Endpoint: `POST /api/v1/Checkout/Callback`

This endpoint must be available in your application to receive transaction completion status.

#### Request Body
```json
{
  "additionalProperties": {
    "property1": null,
    "property2": null
  },
  "msisdn": "string",
  "amount": "string",
  "message": "string",
  "utilityref": "string",
  "operator": "Airtel", // Enum: "Airtel" "Tigo" "Halopesa" "Azampesa" "Mpesa"
  "reference": "string",
  "transactionstatus": "string", // success or failure
  "submerchantAcc": "string",
  "fspReferenceId": "string"
}
```

## Disbursement API

### Disburse Funds
Endpoint: `POST /api/v1/azampay/disburse`

#### Request Body
```json
{
  "source": {
    "countryCode": "string",
    "fullName": "string",
    "bankName": "tigo",
    "accountNumber": "string",
    "currency": "string"
  },
  "destination": {
    "countryCode": "string",
    "fullName": "string",
    "bankName": "tigo",
    "accountNumber": "string",
    "currency": "string"
  },
  "transferDetails": {
    "type": "string",
    "amount": 0,
    "dateInEpoch": 0
  },
  "externalReferenceId": "string",
  "additionalProperties": {
    "property1": null,
    "property2": null
  },
  "checksum": "string",
  "remarks": "string"
}
```

#### Response
```json
{
  "pgReferenceId": "b42aeas4hl3d4f58bhfk4007782cb452",
  "message": "Your transaction is in process",
  "success": true,
  "statusCode": 200
}
```

## Transaction Status
Endpoint: `GET /api/v1/azampay/transactionstatus`

#### Query Parameters
- bankName: string (The name of the mobile network operator)
- pgReferenceId: string (Transaction ID)

#### Response
```json
{
  "pgReferenceId": "b42aeas4hl3d4f58bhfk4007782cb452",
  "message": "Your transaction is in process",
  "success": true,
  "statusCode": 200
}
```

## Name Lookup
Endpoint: `POST /api/v1/azampay/namelookup`

#### Request Body
```json
{
  "bankName": "string",
  "accountNumber": "string",
  "checksum": "string"
}
```

#### Response
```json
{
  "fname": "string",
  "lname": "string",
  "name": "string",
  "message": "string",
  "status": true,
  "statusCode": 200,
  "accountNumber": "string",
  "bankName": "string"
}
```

## Checksum Calculation
Calculate checksum using the following method:
1. Base64(RSA(SHA512(string)))
2. For RSA Encryption, use PKCS1 Padding
3. Contact Azampay team to obtain the necessary public key for encryption

## Supported Payment Providers

### Mobile Money Providers
- Airtel
- Tigo
- Halopesa
- Azampesa
- Mpesa

### Bank Providers
- CRDB
- NMB

## Implementation Considerations

### 1. Security
- Store API credentials securely in environment variables
- Use HTTPS for all API communications
- Validate all callback responses
- Implement proper error handling

### 2. Transaction Management
- Generate unique external IDs for each transaction
- Store transaction references in your database
- Implement retry logic for failed transactions
- Set up proper logging for transaction tracking

### 3. Callback Handling
- Implement idempotent callback processing
- Validate callback authenticity
- Update transaction status in your system
- Notify users of transaction completion

### 4. Error Handling
- Handle different HTTP status codes appropriately
- Implement timeout handling
- Log errors for debugging purposes
- Provide user-friendly error messages

## Testing in Sandbox
Before going live, thoroughly test all payment flows in the sandbox environment:
1. Token generation
2. MNO checkout with different providers
3. Bank checkout with different banks
4. Callback processing
5. Transaction status checking
6. Error scenarios

## Production Deployment
1. Obtain production credentials from Azampay after KYC approval
2. Update API endpoints to production URLs
3. Test with small transactions before going live
4. Monitor transactions closely after deployment

Provide details on how we are going to implenet this