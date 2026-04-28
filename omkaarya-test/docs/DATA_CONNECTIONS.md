# System-Wide Data Binding & Connections

To ensure a single source of truth across all modules, every dropdown and selector must fetch from these dedicated API endpoints. 

**Never hardcode lists** (except for static enumerations like country, currency, etc.).

## Core Module
- **Users**: `/api/core/users`
- **Departments**: `/api/core/departments`

## Inventory Module
- **Products**: `/api/inventory/products/search`
- **Gold Rate**: `/api/inventory/gold-rate/latest`
- **Shelves**: `/api/inventory/shelves`

## Finance Module
- **Parties**: `/api/finance/parties`
- **Bank Accounts**: `/api/finance/bank-accounts`

## Sales Rules
- **Kadan Option**: Only show if `customer.kadanApproved=true`

*Note: For the Omkaarya Temple Management system, these will be adapted to handle Temples, Poojas, Donations, Devotees, etc., while maintaining the exact same SSOT architectural principles.*
