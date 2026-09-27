import React, { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpenText,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CirclePlus,
  Command,
  Download,
  ExternalLink,
  FileCheck2,
  Flame,
  Gift,
  LayoutDashboard,
  LockKeyhole,
  MoreHorizontal,
  Search,
  Settings2,
  ShieldCheck,
  UsersRound,
  Wallet,
  X,
} from 'lucide-react';

const seedCampaigns = [
  { id: 'DRP-024', name: 'Genesis community', ticker: 'GEN', chain: 'Base', allocation: 820000, claimed: 639600, recipients: 2486, claimedPeople: 1940, status: 'Live', start: 'Aug 12, 2026', color: 'mint', icon: 'G' },
  { id: 'DRP-023', name: 'Summer builders', ticker: 'BUILD', chain: 'Base', allocation: 245000, claimed: 181300, recipients: 812, claimedPeople: 601, status: 'Live', start: 'Aug 04, 2026', color: 'orange', icon: 'B' },
  { id: 'DRP-022', name: 'Genesis wallet rewards', ticker: 'GENX', chain: 'Base', allocation: 500000, claimed: 0, recipients: 1620, claimedPeople: 0, status: 'Scheduled', start: 'Sep 30, 2026', color: 'blue', icon: 'G' },
  { id: 'DRP-021', name: 'Protocol contributors', ticker: 'GEN', chain: 'Base', allocation: 120000, claimed: 0, recipients: 94, claimedPeople: 0, status: 'Draft', start: 'Not scheduled', color: 'plum', icon: 'P' },
];

const initialEvents = [
  { type: 'claim', title: 'Claim processed', detail: '0x71c…8e23 claimed 240 GEN', time: '2 min ago', amount: '240 GEN', color: 'mint', chain: 'Base' },
  { type: 'fund', title: 'Distribution funded', detail: 'Genesis community · Base', time: '18 min ago', amount: '+12,400 GEN', color: 'blue', chain: 'Base' },
  { type: 'verify', title: 'Eligibility updated', detail: 'Summer builders · 32 recipients', time: '1 hr ago', amount: '32 added', color: 'orange', chain: 'Base' },
  { type: 'claim', title: 'Claim processed', detail: '0x29b…1190 claimed 185 BUILD', time: '3 hr ago', amount: '185 BUILD', color: 'mint', chain: 'Base' },
  { type: 'verify', title: 'Campaign scheduled', detail: 'Genesis wallet rewards · 1,620 recipients', time: 'Yesterday', amount: 'Sep 30', color: 'orange', chain: 'Base' },
];

const sampleRecipients = [
  { address: '0x71c...8e23', campaign: 'Genesis community', chain: 'Base', allocation: '1,200 GEN', claimed: '240 GEN', status: 'Claimed', updated: '2 min ago' },
  { address: '0x29b...1190', campaign: 'Summer builders', chain: 'Base', allocation: '850 BUILD', claimed: '185 BUILD', status: 'Claimed', updated: '3 hr ago' },
  { address: '0x4a2...80dd', campaign: 'Genesis community', chain: 'Base', allocation: '600 GEN', claimed: '0 GEN', status: 'Claimable', updated: 'Sep 26, 2026' },
  { address: '0xe18...0f54', campaign: 'Genesis community', chain: 'Base', allocation: '2,400 GEN', claimed: '2,400 GEN', status: 'Claimed', updated: 'Sep 25, 2026' },
  { address: '0xc71...21ab', campaign: 'Genesis wallet rewards', chain: 'Base', allocation: '500 GENX', claimed: '0 GENX', status: 'Scheduled', updated: 'Sep 24, 2026' },
  { address: '0x8d0...45ce', campaign: 'Summer builders', chain: 'Base', allocation: '0 BUILD', claimed: '0 BUILD', status: 'Excluded', updated: 'Sep 21, 2026' },
];

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Distributions', icon: Gift, count: '04' },
  { label: 'Recipients', icon: UsersRound },
  { label: 'Activity log', icon: FileCheck2 },
  { label: 'Docs & FAQ', icon: BookOpenText },
];

const numberFormat = new Intl.NumberFormat('en-US');
const compactFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

function readSaved() {
  try {
    const saved = localStorage.getItem('relay-campaigns-v1');
    return saved ? [...JSON.parse(saved), ...seedCampaigns] : seedCampaigns;
  } catch {
    return seedCampaigns;
  }
}

function App() {
  const [campaigns, setCampaigns] = useState(readSaved);
  const [activeNav, setActiveNav] = useState('Overview');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [recipientFilter, setRecipientFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [toast, setToast] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('relay-campaigns-v1', JSON.stringify(campaigns.filter((item) => item.isLocal)));
  }, [campaigns]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const totalAllocated = campaigns.reduce((sum, item) => sum + item.allocation, 0);
  const totalClaimed = campaigns.reduce((sum, item) => sum + item.claimed, 0);
  const liveCampaigns = campaigns.filter((item) => item.status === 'Live').length;
  const visibleCampaigns = campaigns.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesQuery = `${item.name} ${item.ticker} ${item.id}`.toLowerCase().includes(query.toLowerCase());
    return item.chain === 'Base' && matchesStatus && matchesQuery;
  });
  const visibleRecipients = sampleRecipients.filter((recipient) => {
    const matchesStatus = recipientFilter === 'All' || recipient.status === recipientFilter;
    const matchesQuery = `${recipient.address} ${recipient.campaign}`.toLowerCase().includes(query.toLowerCase());
    return recipient.chain === 'Base' && matchesStatus && matchesQuery;
  });

  function createCampaign(data) {
    const campaign = {
      id: `DRP-${String(Date.now()).slice(-3)}`,
      ...data,
      claimed: 0,
      recipients: 0,
      claimedPeople: 0,
      status: 'Draft',
      start: 'Not scheduled',
      color: 'mint',
      icon: data.ticker.slice(0, 1).toUpperCase(),
      isLocal: true,
    };
    setCampaigns((current) => [campaign, ...current]);
    setShowCreate(false);
    setToast('Draft created. No funds have moved.');
  }

  function simulateAction(campaign) {
    setSelectedCampaign(null);
    setToast(`${campaign.name} is a preview. Connect a distribution contract to take action.`);
  }

  const navContent = (
    <>
      <div className="workspace-label">WORKSPACE</div>
      <div className="workspace-switcher">
        <div className="workspace-mark">F</div>
        <div className="workspace-copy"><strong>Fused Protocol</strong><span>Operations team</span></div>
        <ChevronDown size={15} />
      </div>
      <div className="nav-label">OPERATIONS</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navItems.map(({ label, icon: Icon, count }) => (
          <button className={`nav-item ${activeNav === label ? 'active' : ''}`} key={label} onClick={() => { setActiveNav(label); setMobileMenuOpen(false); }}>
            <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{count && <span className="nav-count">{label === 'Distributions' ? String(campaigns.length).padStart(2, '0') : count}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="network-status"><span className="preview-dot" /><div><strong>Preview workspace</strong><span>No live chain connection</span></div></div>
        <button className="nav-item" onClick={() => setToast('Settings are not available in this preview.')}><Settings2 size={17} /><span>Settings</span></button>
        <button className="nav-item" onClick={() => setToast('Support links will be available when a workspace is connected.')}><CircleHelp size={17} /><span>Help & support</span><ArrowUpRight className="nav-external" size={13} /></button>
        <div className="profile-row"><div className="avatar">AK</div><div className="profile-copy"><strong>Alex Kim</strong><span>Admin</span></div><MoreHorizontal size={18} /></div>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">{navContent}</aside>
      {mobileMenuOpen && <div className="mobile-sidebar">{navContent}</div>}
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button icon-button" title="Open navigation" onClick={() => setMobileMenuOpen((open) => !open)}><Command size={18} /></button>
          <div className="breadcrumb"><span>Fused Protocol</span><ChevronRight size={14} /><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <span className="network-static"><span className="chain-dot" />Base <small>MAINNET</small></span>
            <span className="topbar-divider" />
            <button className="icon-button notification-button" title="Notifications" onClick={() => setToast('You’re all caught up.')}><Bell size={18} /><span /></button>
            <button className="wallet-button" onClick={() => setToast('Wallet connection is not enabled in this preview.')}><Wallet size={16} /><span>Connect wallet</span></button>
          </div>
        </header>

        <div className="page-content">
          {activeNav !== 'Docs & FAQ' && <div className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" />{activeNav === 'Empire Builder' ? 'EMPIRE BUILDER · BASE' : 'TOKEN OPERATIONS'} {activeNav !== 'Empire Builder' && <span className="demo-label">SAMPLE DATA</span>}</div><h1>{activeNav === 'Overview' ? 'Distribution, without the blind spots.' : activeNav === 'Recipients' ? 'Know who gets what.' : activeNav === 'Activity log' ? 'Every change, in context.' : activeNav === 'Empire Builder' ? 'Leaderboards & treasury' : 'Token distributions'}</h1><p className="heading-subtitle">{activeNav === 'Recipients' ? 'Review wallet eligibility and allocations on Base.' : activeNav === 'Activity log' ? 'A chronological record of distribution events on Base.' : activeNav === 'Empire Builder' ? 'Read Empire identity and leaderboard metadata. Payouts are not enabled.' : 'Track every allocation from funding to final claim.'}</p></div>
            {activeNav !== 'Empire Builder' && <button className="primary-button" onClick={() => setShowCreate(true)}><CirclePlus size={17} />Create distribution</button>}
          </div>}

          {activeNav === 'Docs & FAQ' ? <DocumentationPage onNavigate={setActiveNav} /> : <>
          {activeNav === 'Overview' && <>
          <section className="stats-row" aria-label="Distribution summary">
            <StatCard label="Total distributed" value={`${compactFormat.format(totalAllocated)} `} suffix="TOKENS" change="Across all campaigns" icon={<ArrowDownRight size={16} />} tone="green" />
            <StatCard label="Claimed by recipients" value={`${compactFormat.format(totalClaimed)} `} suffix="TOKENS" change={`${totalAllocated ? Math.round(totalClaimed / totalAllocated * 100) : 0}% of total allocation`} icon={<ArrowDownLeft size={16} />} tone="blue" />
            <StatCard label="Active distributions" value={String(liveCampaigns).padStart(2, '0')} suffix="LIVE" change="On Base mainnet" icon={<Flame size={16} />} tone="orange" />
            <StatCard label="Unclaimed allocation" value={`${compactFormat.format(totalAllocated - totalClaimed)} `} suffix="TOKENS" change="Available to eligible wallets" icon={<LockKeyhole size={16} />} tone="plum" />
          </section>

          <section className="overview-grid">
            <div className="claim-panel">
              <div className="panel-head"><div><div className="panel-overline">CLAIM VELOCITY <span className="period-chip">LAST 30 DAYS <ChevronDown size={12} /></span></div><h2>Momentum is holding.</h2><p>Claims are tracking steadily across Base campaigns.</p></div><button className="icon-button panel-menu" aria-label="More claim chart options"><MoreHorizontal size={19} /></button></div>
              <ClaimChart />
              <div className="chart-axis"><span>Aug 28</span><span>Sep 04</span><span>Sep 11</span><span>Sep 18</span><span>Sep 25</span></div>
              <div className="chart-legend"><span><i className="legend-dot mint-dot" />Tokens claimed</span><span><i className="legend-dot gray-dot" />Eligible allocation</span><strong><span className="up-tick">+18.6%</span> vs. prior period</strong></div>
            </div>
            <div className="integrity-panel">
              <div className="panel-overline">SAMPLE DISTRIBUTION CHECKS</div>
              <div className="integrity-icon"><ShieldCheck size={20} /></div>
              <h2>Looking good.</h2>
              <p>Example health signals. These checks have not been run against live contracts.</p>
              <div className="integrity-checks"><div><span><Check size={13} /></span>Contract funding <strong>Verified</strong></div><div><span><Check size={13} /></span>Claim conditions <strong>Passing</strong></div><div><span className="warning-check"><ArrowUpRight size={12} /></span>Recipient overlap <strong className="low-risk">Low risk</strong></div></div>
              <button className="text-link" onClick={() => setActiveNav('Activity log')}>View audit trail <ArrowUpRight size={14} /></button>
              <span className="integrity-stamp">LAST CHECKED 4 MIN AGO</span>
            </div>
          </section>
          </>}

          {(activeNav === 'Overview' || activeNav === 'Distributions') && <section className="campaign-section">
            <div className="section-heading"><div><div className="section-kicker">YOUR DISTRIBUTIONS <span className="count-pill">{String(campaigns.length).padStart(2, '0')}</span></div><h2>Campaigns</h2></div><button className="secondary-button export-button" onClick={() => downloadCsv(visibleCampaigns)}><Download size={15} />Export CSV</button></div>
            <div className="table-controls"><div className="filter-tabs" role="tablist" aria-label="Filter by status">{['All', 'Live', 'Scheduled', 'Draft'].map((status) => <button role="tab" aria-selected={statusFilter === status} className={statusFilter === status ? 'selected' : ''} key={status} onClick={() => setStatusFilter(status)}>{status}<span>{status === 'All' ? campaigns.length : campaigns.filter((item) => item.status === status).length}</span></button>)}</div><div className="table-tools"><label className="search-field"><Search size={15} /><input aria-label="Search campaigns" placeholder="Search campaigns" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label></div></div>
            <div className="table-scroll"><table><thead><tr><th>CAMPAIGN</th><th>NETWORK</th><th>CLAIMED</th><th>RECIPIENTS</th><th>START DATE</th><th>STATUS</th><th aria-label="Campaign actions" /></tr></thead><tbody>
              {visibleCampaigns.map((campaign) => <tr key={campaign.id} onClick={() => setSelectedCampaign(campaign)} tabIndex="0" onKeyDown={(event) => { if (event.key === 'Enter') setSelectedCampaign(campaign); }}>
                <td><div className="campaign-cell"><div className={`token-mark ${campaign.color}`}>{campaign.icon}</div><div className="campaign-copy"><strong>{campaign.name}</strong><span>{campaign.id} <i /> {numberFormat.format(campaign.allocation)} {campaign.ticker}</span></div></div></td>
                <td><div className="network-cell"><span className="chain-dot" />Base</div></td>
                <td><div className="claim-cell"><strong>{numberFormat.format(campaign.claimed)} <small>{campaign.ticker}</small></strong><div className="progress-track"><span style={{ width: `${campaign.allocation ? campaign.claimed / campaign.allocation * 100 : 0}%` }} /></div></div></td>
                <td><span className="recipient-value">{numberFormat.format(campaign.claimedPeople)} <span>/ {numberFormat.format(campaign.recipients)}</span></span></td>
                <td><span className="date-value">{campaign.start}</span></td>
                <td><StatusBadge status={campaign.status} /></td>
                <td><button className="row-menu" title={`Open ${campaign.name}`} onClick={(event) => { event.stopPropagation(); setSelectedCampaign(campaign); }}><MoreHorizontal size={17} /></button></td>
              </tr>)}
            </tbody></table>{visibleCampaigns.length === 0 && <div className="empty-state"><Search size={20} /><strong>No distributions found</strong><span>Try another search or network filter.</span></div>}</div>
            <div className="table-footer"><span>Showing <strong>{visibleCampaigns.length ? 1 : 0}–{visibleCampaigns.length}</strong> of <strong>{campaigns.length}</strong> campaigns</span><div className="pagination"><button disabled aria-label="Previous page"><ChevronRight className="chevron-back" size={15} /></button><button className="current-page">1</button><button disabled aria-label="Next page"><ChevronRight size={15} /></button></div></div>
          </section>}

          {activeNav === 'Recipients' && <section className="campaign-section recipient-section">
            <div className="section-heading"><div><div className="section-kicker">ELIGIBILITY ROSTER <span className="count-pill">{visibleRecipients.length}</span></div><h2>Recipients</h2></div><span className="roster-note">Preview subset · wallet addresses are abbreviated</span></div>
            <div className="table-controls"><div className="filter-tabs recipient-tabs" role="tablist" aria-label="Filter recipients">{['All', 'Claimed', 'Claimable', 'Scheduled', 'Excluded'].map((status) => <button role="tab" aria-selected={recipientFilter === status} className={recipientFilter === status ? 'selected' : ''} key={status} onClick={() => setRecipientFilter(status)}>{status}</button>)}</div><label className="search-field"><Search size={15} /><input aria-label="Search recipient wallets" placeholder="Search wallets or campaigns" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
            <div className="table-scroll"><table className="recipient-table"><thead><tr><th>WALLET</th><th>CAMPAIGN</th><th>NETWORK</th><th>ALLOCATION</th><th>CLAIMED</th><th>ELIGIBILITY</th><th>UPDATED</th></tr></thead><tbody>
              {visibleRecipients.map((recipient) => <tr key={recipient.address}><td><span className="wallet-address">{recipient.address}</span></td><td><span className="recipient-campaign">{recipient.campaign}</span></td><td><div className="network-cell"><span className="chain-dot" />Base</div></td><td>{recipient.allocation}</td><td>{recipient.claimed}</td><td><StatusBadge status={recipient.status} /></td><td><span className="date-value">{recipient.updated}</span></td></tr>)}
            </tbody></table>{visibleRecipients.length === 0 && <div className="empty-state"><Search size={20} /><strong>No recipients found</strong><span>Try another search or eligibility filter.</span></div>}</div>
            <div className="table-footer"><span>Showing <strong>{visibleRecipients.length}</strong> sample recipients</span><span>Live eligibility requires a connected recipient list.</span></div>
          </section>}

          {(activeNav === 'Overview' || activeNav === 'Activity log') && <section className="activity-section"><div className="section-heading activity-heading"><div><div className="section-kicker">SAMPLE ACTIVITY FEED <span className="sample-feed-mark">PREVIEW</span></div><h2>{activeNav === 'Overview' ? 'Recent activity' : 'Activity log'}</h2></div>{activeNav === 'Overview' && <button className="text-link" onClick={() => setActiveNav('Activity log')}>Full activity log <ArrowUpRight size={14} /></button>}</div><div className="activity-list">{initialEvents.filter((event) => event.chain === 'Base').slice(0, activeNav === 'Overview' ? 3 : undefined).map((event, index) => <div className="activity-row" key={`${event.title}-${event.time}`}><div className={`activity-icon ${event.color}`}>{event.type === 'claim' ? <ArrowDownLeft size={16} /> : event.type === 'fund' ? <Wallet size={15} /> : <UsersRound size={15} />}</div><div className="activity-description"><strong>{event.title}</strong><span>{event.detail}</span></div><span className="activity-network"><i className="chain-dot" />Base</span><span className="activity-amount">{event.amount}</span><span className="activity-time">{event.time}</span>{index === 0 && <ExternalLink className="activity-external" size={14} />}</div>)}</div></section>}
          <footer className="page-footer"><span>Relay preview <i /> Distribution data is sample data for product exploration.</span><span>Drafts are saved to this browser <ArrowUpRight size={12} /></span></footer>
          </>}
        </div>
      </main>
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={createCampaign} />}
      {selectedCampaign && <CampaignModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} onAction={simulateAction} />}
      {toast && <div role="status" className="toast"><span><Check size={15} /></span>{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={14} /></button></div>}
    </div>
  );
}

export function DocumentationPage({ onNavigate }) {
  const sections = [
    ['why-relay', 'Why Relay'],
    ['campaign-flow', 'Campaign flow'],
    ['empire-builder', 'Empire Builder'],
    ['asset-eligibility', 'Assets & eligibility'],
    ['agent-access', 'AI agent access'],
    ['frequently-asked', 'FAQ'],
  ];
  const faqs = [
    ['Is Relay live on Base today?', 'Campaign creation, recipients, claims, and activity are still preview data. The Empire Builder page can read public Empire and leaderboard metadata through the local GET-only proxy, but Relay does not read Base RPC data, connect a wallet, deploy contracts, or send transactions.'],
    ['What does “Base first” mean?', 'Relay is being scoped for Base mainnet (chain ID 8453). The preview has no network switch. Base support does not imply that a campaign is deployed, funded, or claimable on-chain.'],
    ['Can a creator run a campaign for a tokenized stock?', 'Potentially, if the issuer’s actual token contract supports the intended transfer and claim pattern and the issuer permits it. Tokenized securities can be restricted by jurisdiction, identity, transfer-agent rules, and investor eligibility. Relay cannot make an asset eligible or provide legal authorization. Confirm the issuer’s requirements with qualified counsel before planning a distribution.'],
    ['How would Empire Builder power leaderboards?', 'Empire Builder documents GET /api/leaderboards?tokenAddress=<empire_id> for reading an Empire’s boards, plus creation and refresh routes for types including CSV, token holders, stakers, NFTs, and external APIs. Its site restricts browser CORS to its own origin, so Relay needs a same-origin server proxy; write routes also need a server-side API key and the required signature. This preview has no proxy and makes no Empire API calls.'],
    ['How does a treasury payout work?', 'The documented owner-operated integration path is: choose an Empire leaderboard; request a signed POST /api/distribute-prepare; have the vault owner review and submit the returned executeBatch calls on Base; wait for successful mined receipts; then POST /api/store-distribution with the receipt-backed transaction hashes and correct Empire and vault identifiers. This preview stops before every write or signature.'],
    ['Can a co-signer or AI agent broadcast a payout?', 'Not through the Empire Builder prepare flow documented for agents: its signer must be the SmartVault owner, and direct executeBatch calls from co-signers can revert. A future Relay agent should prepare and explain a transaction, not hold an unrestricted key. Any execution should follow the vault’s supported authorization path, strict policy limits, and explicit approval.'],
    ['Does Relay custody tokens or recipient data?', 'No. The preview stores newly created drafts in browser local storage only. It has no wallet, treasury, recipient import, backend, or custody service. Never enter real recipient or securities-holder data here.'],
    ['Does Empire Builder have a testnet sandbox?', 'The linked Empire Builder skill documents production endpoints and Base mainnet writes, not a testnet or sandbox. Relay therefore keeps the integration informational until a reviewed, owner-authorized flow and a safe testing strategy are in place.'],
  ];
  /*
  return <div className="docs-page">
    <header className="docs-hero">
      <div className="docs-hero-copy"><div className="eyebrow"><span className="eyebrow-line" />RELAY FIELD GUIDE <span className="demo-label">BASE FIRST</span></div><h1>Make every distribution explainable.</h1><p>One clear path from campaign rules to a verified payout: who qualifies, what they receive, where the treasury sent it, and what actually settled.</p><div className="docs-hero-meta"><span><span className="chain-dot" />BASE MAINNET · 8453 TARGET</span><span className="docs-preview-mark"><i /> PRODUCT PREVIEW</span></div></div>
      <div className="docs-hero-note"><ShieldCheck size={20} /><strong>Designed for accountability.</strong><span>Approvals, asset restrictions, recipient eligibility, and receipt-backed records belong in the workflow, not in a footnote.</span><button className="text-link" onClick={() => onNavigate('Distributions')}>Explore the preview <ArrowUpRight size={14} /></button></div>
    </header>

    <div className="docs-layout">
      <nav className="docs-toc" aria-label="On this page"><span>ON THIS PAGE</span>{sections.map(([id, label], index) => <a key={id} href={`#${id}`}><i>{String(index + 1).padStart(2, '0')}</i>{label}</a>)}<div className="docs-toc-note">This guide describes the intended product and integration. Preview data is not live.</div></nav>

      <article className="docs-article">
        <section className="docs-section" id="why-relay"><div className="docs-kicker">01 / THE PROBLEM</div><h2>Distribution breaks between the promise and the proof.</h2><p className="docs-lead">Campaigns still get coordinated across spreadsheets, wallet lists, leaderboard tools, treasury screens, and block explorers. Each handoff creates another chance for an allocation to be wrong or a payout to go unaccounted for.</p><div className="docs-problem-list"><div><span>01</span><div><strong>Eligibility lives in too many places</strong><p>Creators need a reviewable source for who qualifies and why, instead of copying opaque lists between tools.</p></div></div><div><span>02</span><div><strong>Allocation math is easy to lose</strong><p>Token selection, distribution rules, available balances, and per-recipient amounts should be reviewed together before authorization.</p></div></div><div><span>03</span><div><strong>A submitted transaction is not a settled distribution</strong><p>Recipients and operators need to reconcile the mined transaction receipts against the campaign and treasury that authorized them.</p></div></div></div><div className="docs-callout"><CircleHelp size={17} /><p><strong>Relay’s goal</strong> is to make that chain of evidence legible before, during, and after a campaign. The current app is a preview, not yet the source of that evidence.</p></div></section>

        <section className="docs-section" id="campaign-flow"><div className="docs-kicker">02 / CAMPAIGN FLOW</div><h2>One reviewable campaign lifecycle.</h2><p>Creators should be able to understand every step before tokens move.</p><div className="docs-steps"><div><b>01</b><span className="docs-step-line" /><strong>Define</strong><p>Choose an asset on Base, campaign purpose, dates, recipient source, and distribution method.</p></div><div><b>02</b><span className="docs-step-line" /><strong>Validate</strong><p>Check addresses, eligibility, duplicate wallets, total allocation, token decimals, and treasury balance.</p></div><div><b>03</b><span className="docs-step-line" /><strong>Review</strong><p>Preview the exact recipient and token amounts, restrictions, fees, and transactions. Require the proper wallet authority to approve.</p></div><div><b>04</b><span className="docs-step-line" /><strong>Reconcile</strong><p>Wait for successful Base receipts, record transaction hashes, and compare confirmed results with the original plan.</p></div></div><div className="docs-inline-note"><LockKeyhole size={15} /><span>A draft is not a funded campaign. Relay does not send a transaction in this preview.</span></div></section>
        {/*
        <section className="docs-section" id="empire-builder">
          <div className="docs-kicker">03 / LEADERBOARDS & TREASURY</div>
          <div className="docs-section-title"><h2>Leaderboards in. Receipt-backed payouts out.</h2><span className="docs-planned-badge">PAYOUTS GATED</span></div>
          <p>Relay reads public Empire identity and leaderboard metadata through a local GET-only proxy. Empire Builder blocks browser-origin API requests, so a production deployment also needs a same-origin server proxy. This page never sends write requests or asks for wallet signatures.</p>
          <div className="empire-path">
            <div><span className="empire-step">A · SOURCE</span><strong>Select a leaderboard</strong><p>Choose the Empire ID, then use <code>GET /api/leaderboards?tokenAddress=&lt;empire_id&gt;</code> to resolve its default or custom board. Supported sources include CSV, token holders, stakers, NFTs, and external APIs.</p></div>
            <ChevronRight size={16} />
            <div><span className="empire-step">B · PREPARE</span><strong>Preview recipients</strong><p><code>POST /api/distribute-prepare</code> requires a server API key and signed message. Its signer must be the SmartVault <code>owner()</code>; a co-signer is not sufficient for this route.</p></div>
            <ChevronRight size={16} />
            <div><span className="empire-step">C · AUTHORIZE</span><strong>Owner executes</strong><p>Review the exact chain, vault, calldata, tokens, and recipients before the owner submits <code>executeBatch</code> on Base. The owner pays gas on this integration path.</p></div>
            <ChevronRight size={16} />
            <div><span className="empire-step">D · RECONCILE</span><strong>Store mined receipts</strong><p>After successful receipts, <code>POST /api/store-distribution</code> records transaction hashes with the Empire ID and SmartVault address. Those two identifiers are not interchangeable.</p></div>
          </div>
          <div className="docs-warning"><LockKeyhole size={16} /><p><strong>Mainnet boundary:</strong> Empire Builder documents production endpoints and Base mainnet writes, with no testnet sandbox. Relay keeps preparation and execution disabled until server credentials, owner authorization, transaction review, and a deliberate production rollout are in place.</p></div>
          <a className="docs-external-link" href="https://www.empirebuilder.world/skill/SKILL.md" target="_blank" rel="noreferrer">Read the Empire Builder integration skill <ExternalLink size={14} /></a>
        </section>
        {/*
      </article>
    ['why-relay', 'Why Relay'],
    ['campaign-flow', 'Campaign flow'],
    ['empire-builder', 'Empire Builder'],
    ['asset-eligibility', 'Assets & eligibility'],
    ['agent-access', 'AI agent access'],
    ['frequently-asked', 'FAQ'],
  ];
  const faqs = [
    ['Is Relay live on Base today?', 'No. This app is a product preview with sample campaigns, recipients, and activity. It does not read Base, connect a wallet, call Empire Builder, deploy contracts, or send transactions.'],
    ['What does “Base first” mean?', 'Relay is being scoped for Base mainnet (chain ID 8453). The preview has no network switch. Base support does not imply that a campaign is deployed, funded, or claimable on-chain.'],
    ['Can a creator run a campaign for a tokenized stock?', 'Potentially, if the issuer’s actual token contract supports the intended transfer and claim pattern and the issuer permits it. Tokenized securities can be restricted by jurisdiction, identity, transfer-agent rules, and investor eligibility. Relay cannot make an asset eligible or provide legal authorization. Confirm the issuer’s requirements with qualified counsel before planning a distribution.'],
    ['How would Empire Builder power leaderboards?', 'Empire Builder documents GET /api/leaderboards?tokenAddress=<empire_id> for reading an Empire’s boards, plus creation and refresh routes for types including CSV, token holders, stakers, NFTs, and external APIs. Its site restricts browser CORS to its own origin, so Relay needs a same-origin server proxy; write routes also need a server-side API key and the required signature. This preview has no proxy and makes no Empire API calls.'],
    ['How does a treasury payout work?', 'The documented owner-operated integration path is: choose an Empire leaderboard; request a signed POST /api/distribute-prepare; have the vault owner review and submit the returned executeBatch calls on Base; wait for successful mined receipts; then POST /api/store-distribution with the receipt-backed transaction hashes and correct Empire and vault identifiers. This preview stops before every write or signature.'],
    ['Can a co-signer or AI agent broadcast a payout?', 'Not through the Empire Builder prepare flow documented for agents: its signer must be the SmartVault owner, and direct executeBatch calls from co-signers can revert. A future Relay agent should prepare and explain a transaction, not hold an unrestricted key. Any execution should follow the vault’s supported authorization path, strict policy limits, and explicit approval.'],
    ['Does Relay custody tokens or recipient data?', 'No. The preview stores newly created drafts in browser local storage only. It has no wallet, treasury, recipient import, backend, or custody service. Never enter real recipient or securities-holder data here.'],
    ['Does Empire Builder have a testnet sandbox?', 'The linked Empire Builder skill documents production endpoints and Base mainnet writes, not a testnet or sandbox. Relay therefore keeps the integration informational until a reviewed, owner-authorized flow and a safe testing strategy are in place.'],
  ];

  */
  return <div className="docs-page">
    <header className="docs-hero">
      <div className="docs-hero-copy"><div className="eyebrow"><span className="eyebrow-line" />RELAY FIELD GUIDE <span className="demo-label">BASE FIRST</span></div><h1>Make every distribution explainable.</h1><p>One clear path from campaign rules to a verified payout: who qualifies, what they receive, where the treasury sent it, and what actually settled.</p><div className="docs-hero-meta"><span><span className="chain-dot" />BASE MAINNET · 8453 TARGET</span><span className="docs-preview-mark"><i /> PRODUCT PREVIEW</span></div></div>
      <div className="docs-hero-note"><ShieldCheck size={20} /><strong>Designed for accountability.</strong><span>Approvals, asset restrictions, recipient eligibility, and receipt-backed records belong in the workflow, not in a footnote.</span><button className="text-link" onClick={() => onNavigate('Distributions')}>Explore the preview <ArrowUpRight size={14} /></button></div>
    </header>

    <div className="docs-layout">
      <nav className="docs-toc" aria-label="On this page"><span>ON THIS PAGE</span>{sections.map(([id, label], index) => <a key={id} href={`#${id}`}><i>{String(index + 1).padStart(2, '0')}</i>{label}</a>)}<div className="docs-toc-note">This guide describes the intended product and integration. Preview data is not live.</div></nav>

      <article className="docs-article">
        <section className="docs-section" id="why-relay"><div className="docs-kicker">01 / THE PROBLEM</div><h2>Distribution breaks between the promise and the proof.</h2><p className="docs-lead">Campaigns still get coordinated across spreadsheets, wallet lists, leaderboard tools, treasury screens, and block explorers. Each handoff creates another chance for an allocation to be wrong or a payout to go unaccounted for.</p><div className="docs-problem-list"><div><span>01</span><div><strong>Eligibility lives in too many places</strong><p>Creators need a reviewable source for who qualifies and why, instead of copying opaque lists between tools.</p></div></div><div><span>02</span><div><strong>Allocation math is easy to lose</strong><p>Token selection, distribution rules, available balances, and per-recipient amounts should be reviewed together before authorization.</p></div></div><div><span>03</span><div><strong>A submitted transaction is not a settled distribution</strong><p>Recipients and operators need to reconcile the mined transaction receipts against the campaign and treasury that authorized them.</p></div></div></div><div className="docs-callout"><CircleHelp size={17} /><p><strong>Relay’s goal</strong> is to make that chain of evidence legible before, during, and after a campaign. The current app is a preview, not yet the source of that evidence.</p></div></section>

        <section className="docs-section" id="campaign-flow"><div className="docs-kicker">02 / CAMPAIGN FLOW</div><h2>One reviewable campaign lifecycle.</h2><p>Creators should be able to understand every step before tokens move.</p><div className="docs-steps"><div><b>01</b><span className="docs-step-line" /><strong>Define</strong><p>Choose an asset on Base, campaign purpose, dates, recipient source, and distribution method.</p></div><div><b>02</b><span className="docs-step-line" /><strong>Validate</strong><p>Check addresses, eligibility, duplicate wallets, total allocation, token decimals, and treasury balance.</p></div><div><b>03</b><span className="docs-step-line" /><strong>Review</strong><p>Preview the exact recipient and token amounts, restrictions, fees, and transactions. Require the proper wallet authority to approve.</p></div><div><b>04</b><span className="docs-step-line" /><strong>Reconcile</strong><p>Wait for successful Base receipts, record transaction hashes, and compare confirmed results with the original plan.</p></div></div><div className="docs-inline-note"><LockKeyhole size={15} /><span>A draft is not a funded campaign. Relay does not send a transaction in this preview.</span></div></section>

        <section className="docs-section" id="empire-builder"><div className="docs-kicker">03 / LEADERBOARDS & TREASURY</div><div className="docs-section-title"><h2>Built around Empire Builder’s documented flow.</h2><span className="docs-planned-badge">INTEGRATION PLANNED</span></div><p>Empire Builder provides Empire identities, SmartVault treasuries, leaderboard routes, and a prepare-to-execute-to-store distribution workflow. Relay is scoped to the Base path first; this preview does not yet connect to its APIs or wallets.</p><div className="empire-path"><div><span className="empire-step">A · SOURCE</span><strong>Choose a leaderboard</strong><p>Read <code>GET /api/leaderboards?tokenAddress=&lt;empire_id&gt;</code> to select the default <code>main</code> board or a custom board. Empire Builder documents CSV, token-holder, staker, NFT, and external/API leaderboard types.</p></div><ChevronRight size={16} /><div><span className="empire-step">B · PREPARE</span><strong>Preview the payout</strong><p>Call <code>POST /api/distribute-prepare</code> with its required API key and signed message. The prepared signer must be the SmartVault <code>owner()</code>, not simply any connected or co-signing wallet.</p></div><ChevronRight size={16} /><div><span className="empire-step">C · AUTHORIZE</span><strong>Execute on Base</strong><p>The owner reviews the exact recipients, amounts, chain ID, vault address, and calldata, then signs <code>executeBatch</code> on Base. The skill states the operator pays gas on this integration path.</p></div><ChevronRight size={16} /><div><span className="empire-step">D · RECONCILE</span><strong>Store mined receipts</strong><p>Only after successful mined receipts, call <code>POST /api/store-distribution</code> with transaction hashes, chain ID, Empire ID, vault address, and leaderboard attribution.</p></div></div><div className="docs-warning"><LockKeyhole size={16} /><p><strong>Mainnet boundary:</strong> the Empire Builder skill documents production endpoints and Base mainnet writes, with no testnet sandbox. Relay must not prepare, sign, broadcast, or store payouts until its server-side credentials, Empire-to-vault mapping, transaction review, and owner authorization are deliberately configured.</p></div><div className="docs-identity"><div><span>EMPIRE ID</span><strong><code>baseToken</code> / <code>tokenAddress</code></strong><p>Identifies the Empire or base token.</p></div><ChevronRight size={17} /><div><span>TREASURY</span><strong><code>empireAddress</code></strong><p>Identifies the SmartVault contract.</p></div><span className="docs-identity-warning">Do not interchange them.</span></div><a className="docs-external-link" href="https://www.empirebuilder.world/skill/SKILL.md" target="_blank" rel="noreferrer">Read the Empire Builder integration skill <ExternalLink size={14} /></a></section>

        <section className="docs-section" id="asset-eligibility"><div className="docs-kicker">04 / TOKENS & TOKENIZED STOCKS</div><h2>Campaigns can involve different assets. Rules travel with the asset.</h2><p>Relay’s intended campaign model covers token rewards and, where legally and technically permitted, tokenized stocks. A ticker symbol does not tell you whether a token is transferable or who may receive it.</p><div className="asset-guidance"><div><span className="asset-type-token">ERC-20</span><strong>Token campaigns</strong><p>Confirm the token contract, decimals, treasury balance, transfer behavior, and campaign supply before calculating awards.</p></div><div><span className="asset-type-stock">ISSUER-RESTRICTED</span><strong>Tokenized-stock campaigns</strong><p>Verify Base deployment, issuer permission, transfer restrictions, jurisdiction, identity checks, and recipient eligibility with the issuer and qualified counsel. Some assets cannot be airdropped or transferred to arbitrary wallets.</p></div></div><div className="docs-callout docs-asset-callout"><ShieldCheck size={17} /><p><strong>No implied approval.</strong> Relay does not issue securities, determine investor status, provide legal advice, or override an issuer’s transfer rules. Tokenized-stock campaigns are not enabled in this preview.</p></div></section>

        <section className="docs-section" id="agent-access"><div className="docs-kicker">05 / AI AGENT ACCESS</div><h2>Let agents prepare the work, not own the treasury.</h2><p>An assistant can reduce coordination toil. It should not turn conversational intent into an unrestricted mainnet transaction.</p><div className="agent-policy"><div><strong><Check size={15} />Good early agent tasks</strong><ul><li>Validate a proposed CSV and flag duplicate addresses.</li><li>Recalculate totals and identify allocation or balance mismatches.</li><li>Summarize leaderboard changes and draft a distribution for review.</li><li>Explain a prepared transaction and reconcile mined receipts.</li></ul></div><div><strong><LockKeyhole size={15} />Actions that need hard gates</strong><ul><li>Restrict chain, contract, token, recipient source, and spend limits.</li><li>Require an owner-controlled signer and explicit human approval for payouts.</li><li>Never expose API keys, raw signing keys, or unrestricted treasury methods to a model.</li><li>Maintain an auditable record and a clear pause or revoke mechanism.</li></ul></div></div><p className="docs-smallprint">These are product requirements, not capabilities implemented by the current preview.</p></section>

        <section className="docs-section faq-section" id="frequently-asked"><div className="docs-kicker">06 / QUESTIONS</div><h2>Frequently asked questions.</h2><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={16} /></summary><p>{answer}</p></details>)}</div></section>

        <div className="docs-endnote"><span>READY TO EXPLORE?</span><p>See how the product preview organizes a distribution before any real assets or recipients are connected.</p><button className="primary-button" onClick={() => onNavigate('Distributions')}>View campaigns <ArrowUpRight size={15} /></button></div>
      </article>
    </div>
    <footer className="docs-footer"><span>Relay product guide <i /> Base-first scope <i /> No live chain integration in this preview</span><a href="https://www.empirebuilder.world/skill/SKILL.md" target="_blank" rel="noreferrer">Empire Builder skill <ExternalLink size={12} /></a></footer>
  </div>;
}

function StatCard({ label, value, suffix, change, icon, tone }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><div className="stat-value">{value}<small>{suffix}</small></div><div className="stat-change">{change}</div></div>;
}

function ClaimChart() {
  return <div className="chart-area"><div className="chart-y-axis"><span>100k</span><span>75k</span><span>50k</span><span>25k</span><span>0</span></div><svg className="chart-svg" viewBox="0 0 700 170" preserveAspectRatio="none" role="img" aria-label="Claims grew steadily over the last 30 days">
    <defs><linearGradient id="claimFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b9e986" stopOpacity=".38" /><stop offset="100%" stopColor="#b9e986" stopOpacity="0" /></linearGradient></defs>
    {[10, 48, 86, 124, 162].map((y) => <line key={y} x1="0" x2="700" y1={y} y2={y} stroke="#e9ebe5" strokeWidth="1" strokeDasharray="3 5" />)}
    <path d="M0 148 C30 146, 44 140, 70 140 S112 132, 140 133 S177 121, 210 125 S245 115, 280 113 S322 104, 350 106 S392 94, 420 95 S463 84, 490 87 S534 69, 560 72 S602 59, 630 62 S672 38, 700 34 L700 170 L0 170Z" fill="url(#claimFill)" />
    <path d="M0 148 C30 146, 44 140, 70 140 S112 132, 140 133 S177 121, 210 125 S245 115, 280 113 S322 104, 350 106 S392 94, 420 95 S463 84, 490 87 S534 69, 560 72 S602 59, 630 62 S672 38, 700 34" fill="none" stroke="#548e43" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    <circle cx="700" cy="34" r="4" fill="#f6f7f2" stroke="#548e43" strokeWidth="2" vectorEffect="non-scaling-stroke" />
  </svg></div>;
}

function StatusBadge({ status }) {
  const className = status.toLowerCase();
  return <span className={`status-badge ${className}`}><i />{status}</span>;
}

function CreateModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [allocation, setAllocation] = useState('');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const amount = Number(allocation);
    if (!name.trim() || !ticker.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError('Add a campaign name, token symbol, and allocation greater than zero.');
      return;
    }
    onCreate({ name: name.trim(), ticker: ticker.trim().toUpperCase(), allocation: amount, chain: 'Base' });
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><div className="modal-header"><div><span className="modal-overline">NEW DISTRIBUTION</span><h2 id="create-title">Start with the essentials.</h2><p>Set up your campaign details. You can add recipients and claim rules later.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><form onSubmit={submit}><label>Campaign name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Community rewards" maxLength={48} /></label><div className="form-row"><label>Token symbol<input value={ticker} onChange={(event) => setTicker(event.target.value)} placeholder="e.g. FUSE" maxLength={10} /></label><label>Allocation<input type="number" min="1" step="any" value={allocation} onChange={(event) => setAllocation(event.target.value)} placeholder="250,000" /></label></div><label>Network<span className="network-fixed"><span className="chain-dot" />Base mainnet <small>8453</small></span></label><div className="draft-notice"><ShieldCheck size={17} /><span><strong>Draft only</strong>Your campaign is saved in this browser. No wallet is connected and no transaction will be sent.</span></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button"><CirclePlus size={16} />Create draft</button></div></form></section></div>;
}

function CampaignModal({ campaign, onClose, onAction }) {
  const percent = campaign.allocation ? Math.round(campaign.claimed / campaign.allocation * 100) : 0;
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <div className="detail-top">
          <div className={`token-mark ${campaign.color}`}>{campaign.icon}</div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="detail-title-row">
          <div><span className="modal-overline">{campaign.id} <i /> Base mainnet</span><h2 id="detail-title">{campaign.name}</h2></div>
          <StatusBadge status={campaign.status} />
        </div>
        <div className="detail-allocation">
          <span>Claimed allocation</span>
          <strong>{numberFormat.format(campaign.claimed)} <small>{campaign.ticker}</small></strong>
          <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
          <div className="detail-progress-labels"><span>{percent}% claimed</span><span>{numberFormat.format(campaign.allocation)} {campaign.ticker} total</span></div>
        </div>
        <div className="detail-facts">
          <div><span>Recipients claimed</span><strong>{numberFormat.format(campaign.claimedPeople)} <small>of {numberFormat.format(campaign.recipients)}</small></strong></div>
          <div><span>Start date</span><strong>{campaign.start}</strong></div>
          <div><span>Network</span><strong><span className="chain-dot" />Base</strong></div>
          <div><span>Contract status</span><strong className="verified-text"><Check size={14} />{campaign.status === 'Draft' ? 'Not deployed' : 'Sample data'}</strong></div>
        </div>
        <div className="detail-callout"><LockKeyhole size={16} /><span>This is a product preview. Live contract verification and claim actions are not connected.</span></div>
        <button className="primary-button detail-action" onClick={() => onAction(campaign)}>{campaign.status === 'Draft' ? 'Review launch requirements' : 'View on explorer'}<ArrowUpRight size={15} /></button>
      </section>
    </div>
  );
}

function downloadCsv(campaigns) {
  const rows = [['Campaign', 'ID', 'Network', 'Token', 'Allocation', 'Claimed', 'Recipients', 'Status'], ...campaigns.map((item) => [item.name, item.id, item.chain, item.ticker, item.allocation, item.claimed, item.recipients, item.status])];
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  link.download = 'relay-distributions.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

export default App;