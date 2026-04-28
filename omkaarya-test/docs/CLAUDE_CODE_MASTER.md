# Master Guidelines for Claude Code

Read and follow these instructions for this project forever:

1. Before every task read:
   - docs/DESIGN_SYSTEM.md
   - docs/REQUIREMENTS.md
   - prisma/schema.prisma

2. Every dropdown must connect to its API source — never hardcode lists

3. Every module must be responsive — mobile 375px, tablet 768px, desktop 1280px

4. Every transaction (sale, purchase, void) must:
   - Auto-update stock
   - Log to ActivityLog
   - Check permissions first
   - Use soft delete only

5. Every form dropdown connections:
   - Users → from /api/core/users
   - Departments → from /api/core/departments  
   - Products → from /api/inventory/products/search
   - Parties → from /api/finance/parties
   - Gold Rate → from /api/inventory/gold-rate/latest
   - Shelves → from /api/inventory/shelves
   - Bank Accounts → from /api/finance/bank-accounts
   - Kadan option → only show if customer.kadanApproved=true

6. Build in this order:
   Phase 1 → Shared components
   Phase 2 → Core module (Roles, Departments, Users, Settings)
   Phase 3 → Inventory (Products, Stock, Price Change, Purchases)
   Phase 4 → Sales (POS, Gold Exchange, Kadan Virpanai, Void)
   Phase 5 → Finance, Manufacturing, Pawning, Stock Transfer
   Phase 6 → Reports, Logs
   Phase 7 → Real database + Auth
