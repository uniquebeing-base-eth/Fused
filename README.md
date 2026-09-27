# Relay

Relay is a token-distribution operations desk concept for teams coordinating community rewards across EVM networks such as Base and Robinhood Chain. It focuses on the operational gap between announcing an allocation and knowing who can claim, how much remains, and whether a distribution has actually settled.

## Run locally

```sh
npm install
npm run dev
```

## Preview scope

- Overview of allocation, claims, campaign status, and sample activity.
- Campaign search, network and status filters, campaign details, and CSV export.
- Recipient eligibility preview across Base and Robinhood Chain.
- Create a campaign draft and persist it in the current browser's local storage.
- Responsive layout for desktop and mobile.

All dashboard activity, contract checks, wallet addresses, allocations, and network signals are sample data. Creating a campaign only saves a local draft. The app does not connect a wallet, read a chain, deploy contracts, store a real recipient list, or send transactions. Do not use it to make distribution or eligibility decisions.

## Before handling real distributions

Integrate and test chain-specific configuration and read-only RPC access; connect wallet signing only for explicit, user-reviewed transactions; validate uploaded recipient addresses, amounts, and duplicate allocations; publish claim rules and an independently reviewed distribution contract; and source funding, claim, and eligibility status from verifiable chain events. Test on the intended networks before production. No network support or contract is deployed by this preview.