# API Routes - Propostei

Base URL local:

txt http://localhost:3000 

All protected routes require authentication using Bearer Token.

txt Authorization: Bearer <token> 

---

# Auth

## Register

txt POST /auth/register 

Creates a new user account.

### Body

json {   "name": "Felipe Netto",   "email": "felipe@email.com",   "password": "123456" } 

---

## Login

txt POST /auth/login 

Authenticates the user and returns an access token.

### Body

json {   "email": "felipe@email.com",   "password": "123456" } 

---

# Companies

Companies represent the user's business/workspace inside Propostei.

Users access companies through CompanyMember.

Roles:

txt OWNER ADMIN MEMBER 

---

## Create company

txt POST /companies 

Creates a company for the authenticated user.

The authenticated user becomes the company OWNER.

A FREE and ACTIVE subscription is created automatically.

### Body

json {   "name": "Netto Elétrica",   "document": "12345678000199",   "phone": "17999999999",   "email": "contato@nettoeletrica.com",   "address": "Rua Exemplo, 123",   "logoUrl": "https://example.com/logo.png" } 

### Rules

txt - Authenticated user required - Free users can create only one free company - document is optional - document cannot be duplicated globally 

---

## List companies

txt GET /companies 

Returns all companies where the authenticated user is a member.

### Rules

txt - Authenticated user required - Only returns companies where the user is a member 

---

## Get company by id

txt GET /companies/:id 

Returns one company by id.

### Rules

txt - Authenticated user required - User must be a member of the company 

---

## Update company

txt PATCH /companies/:id 

Updates company registration data.

### Body

json {   "name": "Netto Elétrica Atualizada",   "document": "12345678000199",   "phone": "17999999999",   "email": "novo@email.com",   "address": "Rua Nova, 456",   "logoUrl": "https://example.com/new-logo.png" } 

### Rules

txt - Authenticated user required - Only OWNER or ADMIN can update company data - Does not update subscription - Does not update members - Does not update roles - document cannot belong to another company 

---

# Clients

Clients belong to companies.

A client does not belong directly to a user.

---

## Create client

txt POST /companies/:companyId/clients 

Creates a client inside a company.

### Body

json {   "name": "João da Silva",   "document": "12345678900",   "phone": "17999999999",   "email": "joao@email.com",   "address": "Rua Cliente, 100",   "notes": "Cliente interessado em serviços elétricos residenciais." } 

### Rules

txt - Authenticated user required - User must be able to manage the company - OWNER and ADMIN can create clients - Client belongs to the company from the route param - Client document is not globally unique - Different companies may have clients with the same document 

---

## List clients

txt GET /companies/:companyId/clients 

Returns all clients from a company.

### Rules

txt - Authenticated user required - User must be a member of the company - Only returns clients from the selected company 

---

## Get client by id

txt GET /companies/:companyId/clients/:clientId 

Returns one client from a company.

### Rules

txt - Authenticated user required - User must be a member of the company - Client must belong to the selected company 

---

## Update client

txt PATCH /companies/:companyId/clients/:clientId 

Updates client data.

### Body

json {   "name": "João da Silva Atualizado",   "document": "12345678900",   "phone": "17888888888",   "email": "joao.novo@email.com",   "address": "Rua Atualizada, 200",   "notes": "Cliente atualizado." } 

### Rules

txt - Authenticated user required - User must be able to manage the company - Client must belong to the selected company - Does not allow changing companyId 

---

# Quotes

Quotes represent commercial proposals/budgets.

A quote belongs to:

txt Company Client 

A quote has many quote items.

Quote items represent products/services inside the proposal.

---

## Quote status

txt DRAFT SENT VIEWED APPROVED REJECTED CANCELED EXPIRED 

---

## Create quote

txt POST /companies/:companyId/quotes 

Creates a quote with items.

### Body

json {   "clientId": "client-uuid",   "title": "Instalação elétrica residencial",   "description": "Serviços para reforma da cozinha",   "discount": 50,   "validUntil": "2026-07-10T00:00:00.000Z",   "items": [     {       "description": "Instalação de tomada",       "quantity": 2,       "unitPrice": 150     },     {       "description": "Mão de obra",       "quantity": 1,       "unitPrice": 300     }   ] } 

### Calculation example

txt Item 1: 2 * 150 = 300 Item 2: 1 * 300 = 300  subtotal = 600 discount = 50 total = 550 

### Rules

txt - Authenticated user required - User must be able to manage the company - Client must belong to the selected company - Items array must have at least one item - Backend calculates subtotal - Backend calculates total - Frontend must not send subtotal - Frontend must not send total - Discount cannot be greater than subtotal - Quote and QuoteItems are created in a transaction 

---

## List quotes

txt GET /companies/:companyId/quotes 

Returns all quotes from a company.

### Rules

txt - Authenticated user required - User must be a member of the company - Only returns quotes from the selected company - Includes basic client information - Does not need to include quote items - Ordered by createdAt desc 

---

## Get quote by id

txt GET /companies/:companyId/quotes/:quoteId 

Returns one quote with client and items.

### Rules

txt - Authenticated user required - User must be a member of the company - Quote must belong to the selected company - Includes client information - Includes quote items 

---

## Update quote

txt PATCH /companies/:companyId/quotes/:quoteId 

Updates quote data.

### Body example

json {   "title": "Instalação elétrica residencial atualizada",   "description": "Descrição atualizada",   "discount": 100,   "validUntil": "2026-08-10T00:00:00.000Z",   "status": "SENT",   "items": [     {       "description": "Instalação de tomada",       "quantity": 3,       "unitPrice": 150     },     {       "description": "Mão de obra",       "quantity": 1,       "unitPrice": 400     }   ] } 

### Rules

txt - Authenticated user required - User must be able to manage the company - Quote must belong to the selected company - Does not allow changing companyId - Does not allow changing clientId for now - If items are provided, old items are replaced - If items are provided, subtotal and total are recalculated - If only discount changes, total is recalculated using existing subtotal - Discount cannot be greater than subtotal - If status becomes APPROVED, approvedAt is set - If status becomes REJECTED, rejectedAt is set - Does not create work orders yet 

---

## Send quote

txt PATCH /companies/:companyId/quotes/:quoteId/send

Sets the quote status to SENT.

### Rules

txt - Authenticated user required - User must be able to manage the company - Quote must belong to the selected company - Does not send email - Does not send WhatsApp message - Does not create public link yet

---

## Approve quote

txt PATCH /companies/:companyId/quotes/:quoteId/approve

Sets the quote status to APPROVED and fills approvedAt with the current date.

### Rules

txt - Authenticated user required - User must be able to manage the company - Quote must belong to the selected company - Sets approvedAt - Does not create work orders yet

---

## Reject quote

txt PATCH /companies/:companyId/quotes/:quoteId/reject

Sets the quote status to REJECTED and fills rejectedAt with the current date.

### Rules

txt - Authenticated user required - User must be able to manage the company - Quote must belong to the selected company - Sets rejectedAt

---

## Cancel quote

txt PATCH /companies/:companyId/quotes/:quoteId/cancel

Sets the quote status to CANCELED.

### Rules

txt - Authenticated user required - User must be able to manage the company - Quote must belong to the selected company - Does not set approvedAt - Does not set rejectedAt

---

# Current backend flow

txt User ↓ Company ↓ Client ↓ Quote ↓ QuoteItem 

---

# Not implemented yet

txt DELETE routes PDF generation Public quote links WhatsApp sending Public client approval/rejection Work orders Payments Team member management Subscription checkout