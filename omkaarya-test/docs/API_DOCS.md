# API Documentation
## Omkaarya — Temple Management SaaS Platform

| Field | Details |
|-------|---------|
| **Document version** | 2.0 |
| **Date** | 22 April 2026 |
| **Base URL** | `http://localhost:3001/api` (development) |
| **Content-Type** | `application/json` |

---

## 1. Feature Management APIs

### 1.1 List All Features
```
GET /api/features
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `moduleKey` | string | Filter by module (e.g. `pooja`) |
| `active` | boolean | Filter by active status |

**Response** `200 OK`:
```json
[
  {
    "id": 1,
    "name": "Devotee Management",
    "key": "devotee_management",
    "moduleKey": "devotee",
    "description": "Full devotee database...",
    "hasLimit": false,
    "limitType": null,
    "isActive": true,
    "isVisibleInPlanConfig": true,
    "createdAt": "2026-01-01T00:00:00Z"
  }
]
```

---

### 1.2 Create Feature
```
POST /api/features
```

**Request Body:**
```json
{
  "name": "Archana Ticket Printing",
  "key": "archana_ticket_printing",
  "moduleKey": "pooja",
  "description": "Print archana tickets with devotee name and birth star",
  "hasLimit": true,
  "limitType": "boolean",
  "isVisibleInPlanConfig": true
}
```

**Response** `201 Created`:
```json
{
  "id": 15,
  "name": "Archana Ticket Printing",
  "key": "archana_ticket_printing",
  ...
}
```

**Error** `400 Bad Request`:
```json
{ "error": "Feature key already exists" }
```

---

### 1.3 Update Feature
```
PUT /api/features/[id]
```

**Request Body:**
```json
{
  "name": "Archana Ticket Printing (Updated)",
  "description": "Updated description",
  "hasLimit": false,
  "isVisibleInPlanConfig": true
}
```

> **Note:** `key` and `moduleKey` cannot be changed after creation.

**Response** `200 OK`: Updated feature object.

---

### 1.4 Toggle Feature Active State
```
PATCH /api/features/[id]
```

No body required. Toggles `isActive` between `true` and `false`.

**Response** `200 OK`:
```json
{ "id": 5, "isActive": false, ... }
```

---

## 2. Plan Feature Configuration APIs

### 2.1 Get Features for a Plan
```
GET /api/plan-features?planId=sankalpa
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `planId` | string | Yes | Plan ID: `prarambha`, `sankalpa`, `aaradhana` |

**Response** `200 OK`:
```json
[
  {
    "featureId": 1,
    "featureName": "Devotee Management",
    "featureKey": "devotee_management",
    "moduleKey": "devotee",
    "isEnabled": true,
    "limitValue": null,
    "limitType": null
  },
  {
    "featureId": 8,
    "featureName": "Inventory Management",
    "featureKey": "inventory_management",
    "moduleKey": "inventory",
    "isEnabled": true,
    "limitValue": 500,
    "limitType": "number"
  }
]
```

---

### 2.2 Save Plan Feature Configuration
```
POST /api/plan-features
```

**Request Body:**
```json
{
  "planId": "sankalpa",
  "features": [
    { "featureId": 1, "isEnabled": true, "limitValue": null },
    { "featureId": 8, "isEnabled": true, "limitValue": 500 },
    { "featureId": 14, "isEnabled": false, "limitValue": null }
  ]
}
```

**Response** `200 OK`:
```json
{ "saved": 3, "planId": "sankalpa" }
```

---

## 3. Tenant Feature Access API

### 3.1 Get Tenant's Effective Features
```
GET /api/tenant-features?tenantId=42
```

Returns the merged feature set for a tenant based on their active subscription plan.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `tenantId` | number | Yes | Temple ID |

**Response** `200 OK`:
```json
{
  "planId": "sankalpa",
  "features": {
    "devotee_management": { "enabled": true, "limit": null },
    "pooja_booking_online": { "enabled": true, "limit": null },
    "inventory_management": { "enabled": true, "limit": 500 },
    "advanced_analytics": { "enabled": false, "limit": null }
  }
}
```

**Fallback behavior:** If no plan_features configuration exists for the tenant's plan, **all features default to enabled** for backward compatibility.

---

## 4. Temple Management APIs (Planned / Existing)

### 4.1 List Temples
```
GET /api/temples
```

### 4.2 Get Temple
```
GET /api/temples/[id]
```

### 4.3 Create Temple
```
POST /api/temples
```

### 4.4 Update Temple
```
PUT /api/temples/[id]
```

---

## 5. Finance APIs (Planned / Existing)

### 5.1 List Transactions
```
GET /api/temples/[templeId]/transactions?type=income&from=2026-01-01&to=2026-04-22
```

### 5.2 Create Transaction
```
POST /api/temples/[templeId]/transactions
```

### 5.3 Finance Summary
```
GET /api/temples/[templeId]/finance/summary?period=monthly
```

---

## 6. Inventory APIs (Planned / Existing)

### 6.1 List Products
```
GET /api/temples/[templeId]/products?category=Pooja+Items
```

### 6.2 Create Product
```
POST /api/temples/[templeId]/products
```

### 6.3 Update Product
```
PUT /api/temples/[templeId]/products/[productId]
```

---

## 7. Error Response Format

All API errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_KEY` | 409 | Unique constraint violation |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `FEATURE_GATED` | 403 | Feature not available on tenant's plan |
| `LIMIT_REACHED` | 429 | Feature usage limit reached |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 8. Authentication (Planned)

```
Authorization: Bearer <session-token>
```

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Session token from login |
| `X-Tenant-ID` | For temple APIs | Temple ID for tenant-scoped requests |

---

## 9. Rate Limiting (Planned)

| Endpoint Group | Limit |
|----------------|-------|
| Read (GET) | 100 req/min |
| Write (POST/PUT/PATCH) | 30 req/min |
| File Upload | 10 req/min |
