# Relay

Relay is a Base-first token-distribution operations desk concept for creators and treasury operators. It focuses on the operational gap between announcing an allocation and knowing who can claim, how much remains, and whether a distribution has actually settled. Open **Docs & FAQ** in the app for the product guide, asset-eligibility notes, agent safety policy, and intended Empire Builder workflow.

## Run locally

```sh
npm install
npm run dev
```

## Preview scope

- Overview of allocation, claims, campaign status, and sample activity.
- Campaign search, network and status filters, campaign details, and CSV export.
- Recipient eligibility preview for Base campaigns.
- Create a campaign draft and persist it in the current browser's local storage.
- Base-only campaign setup and an in-app guide to the intended Empire Builder leaderboard and treasury integration.
- Responsive layout for desktop and mobile.

All dashboard activity, contract checks, wallet addresses, allocations, and network signals are sample data. Creating a campaign only saves a local draft. The app does not connect a wallet, call Empire Builder, read Base, deploy contracts, store a real recipient list, or send transactions. Do not use it to make distribution or eligibility decisions.

## Empire Builder integration boundary

The docs page follows Empire Builder's published Base flow: select an Empire leaderboard; request a signed distribution preview; have the SmartVault owner review and execute the returned batch on Base; and store the distribution only after its transaction receipts are mined. The integration is not implemented in this preview. Empire Builder documents production endpoints, including live mainnet writes, and does not document a sandbox.

Before enabling real campaigns, add server-side API-key handling, an independently verified Empire ID-to-SmartVault mapping, recipient and asset checks, transaction preview and simulation, owner-controlled signing, explicit approvals, and receipt reconciliation. Tokenized-stock distributions also require issuer permission and eligibility review; Relay does not provide legal or regulatory authorization.