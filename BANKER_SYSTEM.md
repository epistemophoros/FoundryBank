# Banker NPC System

## Overview

The Banker System allows you to register NPCs as bankers. When players interact with these NPCs, the bank menu opens automatically, creating an immersive banking experience.

## Features

✅ **NPC Registration**: Register any NPC as a banker for a specific bank  
✅ **Click Interaction**: Players click on banker NPC tokens to open bank  
✅ **Token HUD Button**: Special button appears in token HUD for bankers  
✅ **Actor Sheet Button**: Button appears on banker's actor sheet  
✅ **Banker Management**: GM can register/remove bankers from GM Manager  
✅ **Banker Details**: Add title and description to bankers  

## How to Set Up a Banker

### Method 1: GM Manager UI

1. **Open GM Manager** (from FoundryBank settings)
2. **Go to "Bankers" tab**
3. **Click "Register Banker"**
4. **Fill in the form:**
   - Select NPC actor
   - Select bank
   - (Optional) Add title (e.g., "Head Teller")
   - (Optional) Add description
5. **Click "Register"**

### Method 2: API

```javascript
const bankerSystem = game.foundrybank.getBankerSystem();

// Register an NPC as a banker
bankerSystem.registerBanker(
  actorId,        // NPC actor ID
  bankId,         // Bank ID
  'Head Teller',  // Optional title
  'Friendly banker who helps customers' // Optional description
);
```

## How Players Interact

### Method 1: Click on Token
- **Left-click or Right-click** on banker NPC token
- Bank dialog opens automatically
- Shows greeting: "Welcome to [Bank Name]! How may [Banker Name] assist you today?"

### Method 2: Token HUD Button
- **Hover over banker token**
- Special button appears in token HUD (💰 icon)
- Click button to open bank

### Method 3: Actor Sheet
- **Open banker's actor sheet**
- Button appears: "Open [Bank Name]"
- Click to open bank for player's character

## Example Workflow

### Setting Up Aexorian Royal Bank Teller

1. **Create NPC**: Create an NPC actor named "Marcus the Teller"
2. **Register as Banker**:
   - Open GM Manager → Bankers tab
   - Click "Register Banker"
   - Select "Marcus the Teller"
   - Select "Aexorian Royal Bank"
   - Title: "Head Teller"
   - Description: "A friendly and helpful banker"
3. **Place Token**: Place Marcus token on the map
4. **Players Interact**: Players click on Marcus → Bank opens!

## Banker Information

Each banker stores:
- **Actor ID**: The NPC actor
- **Bank ID**: Which bank they work for
- **Name**: Banker's name (from actor)
- **Title**: Optional title (e.g., "Head Teller", "Loan Officer")
- **Description**: Optional description
- **Active Status**: Enable/disable banker

## Bank Dialog Behavior

When a player interacts with a banker:
1. System detects banker NPC
2. Gets the bank associated with the banker
3. Opens bank dialog for **player's character** (not the banker)
4. Shows greeting notification
5. Player can now use all banking features

## Multiple Bankers

- **Multiple bankers per bank**: You can have several bankers for one bank
- **Different banks**: Each banker can work for different banks
- **Banker locations**: Place bankers at different locations (different bank branches)

## Removing Bankers

### From GM Manager:
1. Go to Bankers tab
2. Find the banker
3. Click "Remove Banker"
4. Confirm removal

### Via API:
```javascript
bankerSystem.unregisterBanker(actorId);
```

## Visual Indicators

- **Token HUD**: Special button appears for banker tokens
- **Actor Sheet**: Button appears on banker's sheet
- **No visual change to token**: Token looks normal (no special marker)

## Use Cases

### 1. Bank Branch
- Place banker NPC at bank location
- Players interact to access that bank
- Multiple bankers = multiple tellers

### 2. Traveling Banker
- Banker NPC travels with party
- Players can access bank on the road
- Useful for long campaigns

### 3. Different Bankers for Different Services
- Loan Officer NPC for loans
- Teller NPC for deposits/withdrawals
- Investment Advisor NPC for stocks
- (All can link to same bank or different banks)

### 4. Roleplay Integration
- Banker has personality (description)
- Greeting message uses banker name
- Immersive banking experience

## API Reference

### BankerSystem Methods

```javascript
// Register banker
registerBanker(actorId, bankId, title?, description?)

// Unregister banker
unregisterBanker(actorId)

// Get banker
getBanker(actorId)

// Check if banker
isBanker(actorId)

// Get all bankers
getAllBankers()

// Get bankers for bank
getBankBankers(bankId)

// Get bank ID for banker
getBankerBankId(actorId)

// Update banker
updateBanker(actorId, updates)
```

## Hooks

- `foundrybank.bankerRegistered` - Fired when banker is registered
- `foundrybank.bankerUnregistered` - Fired when banker is removed
- `foundrybank.bankerUpdated` - Fired when banker is updated

## Summary

✅ **Register NPCs as bankers**  
✅ **Players click bankers to open bank**  
✅ **Special buttons in token HUD and actor sheet**  
✅ **Manage from GM Manager UI**  
✅ **Immersive banking experience**  
✅ **Multiple bankers per bank**  
✅ **Banker titles and descriptions**  

The banker system makes banking feel natural and immersive - players interact with actual NPCs instead of just opening a menu!

