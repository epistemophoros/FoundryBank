# GM Manager UI - Complete Control Panel

## Overview

The **GM Manager Dialog** provides a comprehensive, clean UI for Dungeon Masters to manage all aspects of the FoundryBank system from one central location.

## Access

**GM Only** - Only Game Masters can access this interface.

### How to Open

1. **Settings Menu**: Button appears in FoundryBank module settings
2. **API Call**: `game.foundrybank.openGMManagerDialog()` (for macros/modules)

## Interface Tabs

### 1. Economies Tab

**View & Manage:**
- All economies (kingdoms, factions, regions, etc.)
- Economy details (name, type, description)
- Growth rate and interest rate
- Currencies for each economy

**Actions:**
- ✅ **Create Economy**: Create new economies
- ✅ **Edit Economy**: Modify existing economies
- ✅ **Add Currency**: Create currencies for economies
- ✅ **View Currencies**: See all currencies per economy

**Information Displayed:**
- Economy name and type
- Description
- Growth rate (%)
- Base interest rate (%)
- List of currencies (symbols and names)

---

### 2. Banks Tab

**View & Manage:**
- All banks in the system
- Bank details (name, economy, location, description)

**Actions:**
- ✅ **Create Bank**: Create new banks
- ✅ **Edit Bank**: Modify existing banks
- ✅ **View Bank Details**: See economy, location, etc.

**Information Displayed:**
- Bank name
- Description
- Economy it belongs to
- Location (if set)

---

### 3. Properties Tab

**View & Manage:**
- All properties (real estate, businesses, land, etc.)
- Property details (value, owner, status, location)

**Actions:**
- ✅ **Create Property**: Create new properties for sale
- ✅ **Edit Property**: Modify existing properties
- ✅ **Update Property Value**: Change current market value
- ✅ **View Ownership**: See who owns each property

**Information Displayed:**
- Property name and type
- Description
- Purchase price vs current value
- Owner (if owned)
- Location
- Status (available, owned, rented, etc.)
- Income/expenses (if set)

---

### 4. Stocks Tab

**View & Manage:**
- All stocks in the market
- Stock prices and details

**Actions:**
- ✅ **Create Stock**: Create new tradeable stocks
- ✅ **Update Stock Prices**: Manually trigger price updates
- ✅ **View Stock Details**: See symbol, name, price, volatility

**Information Displayed:**
- Stock symbol and company name
- Current price
- Base price
- Volatility percentage

---

### 5. Economy Tab

**View & Manage:**
- Global economic growth
- Exchange rates

**Actions:**
- ✅ **Update Growth Rate**: Set economic growth (-100% to +100%)
- ✅ **Set Exchange Rates**: Configure currency exchange rates

**Information Displayed:**
- Current economic growth rate
- Impact on interest rates and stock prices

---

## Creation Dialogs

### Create Economy Dialog
- Economy name
- Description
- Type (kingdom, faction, region, city, custom)
- Growth rate (-100% to +100%)
- Base interest rate (0% to 100%)

### Create Currency Dialog
- Symbol (e.g., AXT, GC)
- Name (e.g., Aexorian Token)
- Plural name (e.g., Aexorian Tokens)
- Exchange rate to gold pieces
- Set as base currency (checkbox)

### Create Bank Dialog
- Bank name
- Economy (dropdown)
- Description
- Location (optional)

### Create Property Dialog
- Property name
- Description
- Type (real_estate, business, land, ship, vehicle, equipment, custom)
- Economy (dropdown)
- Bank (optional dropdown)
- Currency (dropdown - filtered by economy)
- Purchase price
- Location (optional)
- Monthly income (optional)
- Monthly expenses (optional)

### Create Stock Dialog
- Stock symbol (e.g., ELDR)
- Company name
- Currency (dropdown)
- Initial price
- Volatility (0% to 100%)

### Update Growth Dialog
- Growth rate slider/input (-100% to +100%)
- Shows current growth rate
- Updates affect all financial systems

### Exchange Rate Dialog
- From currency (dropdown)
- To currency (dropdown)
- Exchange rate (1 from = ? to)
- Automatically sets reverse rate

---

## Features

### ✅ Centralized Management
- All systems in one place
- Easy navigation with tabs
- Clean, organized interface

### ✅ Quick Actions
- Create buttons on each tab
- Edit buttons for existing items
- Update buttons for values

### ✅ Real-Time Updates
- Changes reflect immediately
- Refresh button to reload data
- Live data display

### ✅ Comprehensive View
- See all economies, banks, properties, stocks
- View relationships (banks to economies, etc.)
- Track ownership and status

### ✅ GM-Only Access
- Only Game Masters can open
- Secure access control
- No player access

---

## Usage Workflow

### Example: Setting Up Aexorian Kingdom

1. **Open GM Manager** (from settings or API)

2. **Create Economy** (Economies tab)
   - Name: "Aexorian Kingdom"
   - Type: "kingdom"
   - Growth: 15%
   - Interest: 3%

3. **Create Currency** (Economies tab → Add Currency)
   - Symbol: "AXT"
   - Name: "Aexorian Token"
   - Exchange: 100 (1 AXT = 100 gp)

4. **Create Bank** (Banks tab)
   - Name: "Aexorian Royal Bank"
   - Economy: "Aexorian Kingdom"
   - Location: "Capital City"

5. **Create Property** (Properties tab)
   - Name: "Grand Estate"
   - Economy: "Aexorian Kingdom"
   - Bank: "Aexorian Royal Bank"
   - Currency: "AXT"
   - Price: 1000 AXT

6. **Done!** Players can now:
   - Open accounts at Aexorian Royal Bank
   - Deposit/withdraw AXT
   - Purchase the Grand Estate

---

## UI Design

- **Tabbed Interface**: Easy navigation
- **Card Layout**: Clean item display
- **Action Buttons**: Quick access to common tasks
- **Form Dialogs**: Step-by-step creation
- **Status Indicators**: Visual status (available, owned, etc.)
- **Responsive**: Works on different screen sizes

---

## Keyboard Shortcuts

- **Refresh**: F5 or refresh button
- **Close**: ESC or X button
- **Tab Navigation**: Click tabs or use arrow keys

---

## Summary

The GM Manager provides **complete control** over:
- ✅ Economies and currencies
- ✅ Banks and accounts
- ✅ Properties and assets
- ✅ Stocks and investments
- ✅ Economic growth
- ✅ Exchange rates

All from **one clean, organized interface** accessible only to Game Masters!

