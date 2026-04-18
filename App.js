import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar, Alert, FlatList,
  Modal, ActivityIndicator, Platform, Dimensions, Keyboard, Image, Linking
} from 'react-native';

// ─── MOCK USER (auth bypassed) ───────────────────────────────────────────────
const MOCK_USER = { id: 'test-user-123', email: 'demo@jobtap.app' };

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#0F1F0F',
  card: '#fff',
  primary: '#1E5C15',
  darkCard: '#162E10',
  moneyGreen: '#5aad5a',
  subtext: '#888',
  green: '#2D6A22',
  greenDark: '#1E4A17',
  greenLight: '#E8F5E3',
  cream: '#F5F1E6',
  grey: '#2C2C2C',
  greyMid: '#6B6B6B',
  greyLight: '#F5F5F5',
  border: '#E0E0E0',
  white: '#FFFFFF',
  red: '#D32F2F',
  orange: '#E65100',
  blue: '#1565C0',
  gold: '#F9A825',
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
let MOCK_CUSTOMERS = [
  { id: '1', name: 'Mike Reynolds', street: '142 Palmetto Ct', city: 'Nocatee', state: 'FL', zip: '32081', address: '142 Palmetto Ct, Nocatee, FL 32081', phone: '(904) 555-0182', email: 'mike@example.com', status: 'active', jobs: 3, lastJob: '2026-04-08' },
  { id: '2', name: 'Sarah Chen', street: '88 Harbour View Dr', city: 'Fleming Island', state: 'FL', zip: '32003', address: '88 Harbour View Dr, Fleming Island, FL 32003', phone: '(904) 555-0247', email: 'schen@example.com', status: 'vip', jobs: 6, lastJob: '2026-04-01' },
  { id: '3', name: 'Dave & Lisa Torres', street: '310 Creekside Blvd', city: 'St. Johns', state: 'FL', zip: '32259', address: '310 Creekside Blvd, St. Johns, FL 32259', phone: '(904) 555-0391', email: 'dtorres@example.com', status: 'due', jobs: 1, lastJob: '2025-10-12' },
  { id: '4', name: 'Brenda Walsh', street: '57 Oak Hollow Ln', city: 'Orange Park', state: 'FL', zip: '32065', address: '57 Oak Hollow Ln, Orange Park, FL 32065', phone: '(904) 555-0554', email: 'bwalsh@example.com', status: 'lead', jobs: 0, lastJob: null },
];

let MOCK_JOBS = [
  { id: 'j1', customerId: '1', customerName: 'Mike Reynolds', service: 'Paver Sealing', sqft: 800, status: 'paid', date: '2026-04-08', amount: 1200 },
  { id: 'j4', customerId: '1', customerName: 'Mike Reynolds', service: 'Pressure Wash + Seal', sqft: 800, status: 'paid', date: '2026-01-15', amount: 1120 },
  { id: 'j6', customerId: '1', customerName: 'Mike Reynolds', service: 'Joint Sand Stabilizer', sqft: 800, status: 'paid', date: '2025-09-03', amount: 340 },
  { id: 'j2', customerId: '2', customerName: 'Sarah Chen', service: 'Paver Sealing + Clean', sqft: 1400, status: 'pending', date: '2026-04-10', amount: 2100 },
  { id: 'j3', customerId: '3', customerName: 'Dave & Lisa Torres', service: 'Driveway Seal', sqft: 600, status: 'paid', date: '2026-04-08', amount: 900 },
  { id: 'j5', customerId: '2', customerName: 'Sarah Chen', service: 'Paver Sealing', sqft: 1200, status: 'overdue', date: '2026-03-01', amount: 1800 },
  { id: 'j7', customerId: '4', customerName: 'Brenda Walsh', service: 'Paver Sealing', sqft: 950, status: 'scheduled', date: '2026-04-14', amount: 1425 },
];

const SERVICE_ITEMS = [
  { id: 's1', label: 'Paver Sealing', icon: '🧱', defaultPrice: '1.50', unit: '/sq ft' },
  { id: 's2', label: 'Pressure Washing', icon: '💧', defaultPrice: '0.35', unit: '/sq ft' },
  { id: 's3', label: 'Soft Wash', icon: '🫧', defaultPrice: '0.45', unit: '/sq ft' },
  { id: 's4', label: 'Roof Wash', icon: '🏠', defaultPrice: '350', unit: 'flat' },
  { id: 's6', label: 'Gutter Cleaning', icon: '🌿', defaultPrice: '150', unit: 'flat' },
  { id: 's7', label: '', icon: '✏️', defaultPrice: '', unit: '/sq ft', custom: true },
  { id: 's8', label: '', icon: '✏️', defaultPrice: '', unit: '/sq ft', custom: true },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtCurrency = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
const fmtDateShort = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  const mon = dt.toLocaleDateString('en-US', { month: 'short' });
  const day = dt.getDate();
  const yr = String(dt.getFullYear()).slice(2);
  return `${mon} ${day}/${yr}`;
};

const statusColor = (s) => ({
  paid: '#22C55E', completed: '#22C55E', active: '#22C55E',
  pending: '#F97316', scheduled: '#3B82F6',
  due: '#EF4444', overdue: '#EF4444',
  lead: '#8B5CF6', vip: '#F59E0B', followup: '#F97316',
}[s] || C.greyMid);

const statusLabel = (s) => ({
  paid: 'Paid', completed: 'Paid', active: 'Active',
  pending: 'Pending', scheduled: 'Scheduled',
  due: 'Overdue', overdue: 'Overdue',
  lead: 'New Lead', vip: '⭐ VIP', followup: 'Follow-up',
}[s] || s);

// ─── MEASURE MATH HELPERS ─────────────────────────────────────────────────────
function toRad(v) { return (v * Math.PI) / 180; }

function polygonAreaSqMeters(coords) {
  if (!coords || coords.length < 3) return 0;
  const R = 6378137;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    area += toRad(p2.longitude - p1.longitude) *
      (2 + Math.sin(toRad(p1.latitude)) + Math.sin(toRad(p2.latitude)));
  }
  return Math.abs((area * R * R) / 2);
}

function sqMetersToSqFt(m2) { return m2 * 10.7639; }
function fmtSqFt(n) { return `${Math.round(n).toLocaleString()} sq ft`; }
function areaTypeToService(type) {
  return { Driveway: 'Paver Sealing', 'Pool Deck': 'Pool Deck Sealing', Patio: 'Patio Sealing', Walkway: 'Walkway Sealing' }[type] || 'Paver Sealing';
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Header = ({ title, subtitle, onBack, action }) => (
  <View style={styles.header}>
    <View style={styles.headerRow}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
      ) : <View style={{ width: 36 }} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
      </View>
      {action ? action : <View style={{ width: 36 }} />}
    </View>
  </View>
);

const BottomNav = ({ active, navigate, onCreate }) => {
  const tabs = [
    { key: 'Home', icon: '🏠', label: 'Home' },
    { key: 'Customers', icon: '👥', label: 'Clients' },
    { key: 'NewJob', icon: '＋', label: 'New', fab: true },
    { key: 'Jobs', icon: '📋', label: 'Jobs' },
    { key: 'Schedule', icon: '📅', label: 'Schedule' },
  ];
  return (
    <View style={styles.tabBar}>
      {tabs.map(t => (
        <TouchableOpacity
          key={t.key}
          style={styles.tab}
          onPress={() => {
            if (t.fab) {
              if (onCreate) onCreate();
              else navigate('NewJob');
              return;
            }
            navigate(t.key);
          }}
        >
          {t.fab ? (
            <View style={styles.fabBtn}><Text style={{ color: C.white, fontSize: 28, lineHeight: 32 }}>+</Text></View>
          ) : (
            <Text style={[styles.tabIcon, active === t.key && { opacity: 1 }]}>{t.icon}</Text>
          )}
          <Text style={[styles.tabLabel, active === t.key && { color: C.grey, fontWeight: '600' }]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const Card = ({ children, style }) => <View style={[styles.card, style]}>{children}</View>;

// ─── BUSINESS CONFIG ──────────────────────────────────────────────────────────
let BIZ_CONFIG = {
  name: 'HydroSeal Pavers',
  phone: '(904) 555-0100',
  email: 'info@hydrosealpavers.com',
  logo: null,
  defaultRate: '1.50',
  warranty: '2-year warranty on all sealing work.',
  gbpLink: '',
  instagramHandle: '',
  facebookPage: '',
  referralEnabled: true,
  careProgram: true,
  holidayCampaigns: true,
  missedCallAutoText: true,
};

// ─── CREATE SHEET ────────────────────────────────────────────────────────────
const CreateSheet = ({ visible, onClose, navigate }) => {
  const ACTIONS = [
    { key: 'NewLead',      icon: '🎯', label: 'New Lead',        highlight: true  },
    { key: 'NewCustomer',  icon: '👤', label: 'Add Client',      highlight: false },
    { key: 'QuoteBuilder', icon: '🧾', label: 'New Quote',       highlight: false },
    { key: 'BlockTime',    icon: '🚫', label: 'Block Off Time',  highlight: false },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.quickSheet}>
          <Text style={styles.quickSheetTitle}>Quick Create</Text>
          <View style={styles.quickSheetDivider} />

          <View style={{ gap: 10 }}>
            {ACTIONS.map(a => (
              <TouchableOpacity
                key={a.key}
                style={[styles.quickRow, a.highlight && styles.quickRowHighlight]}
                onPress={() => {
                  onClose();
                  if (a.key === 'BlockTime') navigate('Schedule');
                  else navigate(a.key);
                }}
              >
                <Text style={styles.quickRowIcon}>{a.icon}</Text>
                <Text style={[styles.quickRowLabel, a.highlight && { color: C.green, fontWeight: '700' }]}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.quickSheetDivider, { marginTop: 16 }]} />
          <TouchableOpacity onPress={onClose} style={styles.quickCancel}>
            <Text style={styles.quickCancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
const HomeScreen = ({ navigate, params }) => {
  const now = new Date();
  const [showMenu, setShowMenu] = useState(params?.openMenu || false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const paidJobsMonth = MOCK_JOBS.filter(j => j.status === 'paid' && new Date(j.date) >= startOfMonth);
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
  const activeQuotes = MOCK_JOBS.filter(j => j.status === 'pending' && new Date(j.date) >= thirtyDaysAgo);
  const activeLeads = MOCK_CUSTOMERS.filter(c => c.status === 'lead');
  const todayJobs = MOCK_JOBS.filter(j => ['scheduled', 'active', 'pending'].includes(j.status));
  const dow = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const LEADS = [
    { id: 'l1', name: 'Sandra Ortiz', phone: '(904) 555-0199', time: '8:14 AM', source: 'Website form' },
    { id: 'l2', name: 'Carlos Mendez', phone: '(904) 555-0312', time: 'Yesterday', source: 'Facebook' },
  ];

  const MENU_ITEMS = [
    { icon: '🏢', label: 'Business Setup', screen: 'BusinessSetup', desc: 'Name, logo, contact, rates' },
    { icon: '📱', label: 'Social Setup', screen: 'SocialSetup', desc: 'GBP, Instagram, Facebook links' },
    { icon: '🎄', label: 'Holiday Campaigns', screen: 'HolidayCampaigns', desc: 'Seasonal outreach templates' },
    { icon: '🏷️', label: 'Specials & Sales', screen: 'Specials', desc: 'Promotions & discount offers' },
    { icon: '🤝', label: 'Referral Program', screen: 'ReferralTracking', desc: 'Referral rewards & tracking' },
    { icon: '📊', label: 'Revenue Report', screen: 'RevenueDashboard', desc: 'Monthly & YTD performance' },
    { icon: '📅', label: 'Follow-Up Schedule', screen: 'FollowUpScheduler', desc: 'Automate client touchpoints' },
    { icon: '🏘', label: 'Customers Due', screen: 'CustomersDue', desc: 'Rebook pipeline' },
    { icon: '🔔', label: 'Notifications', screen: 'NotificationSettings', desc: 'Alerts & reminders' },
    { icon: '🚪', label: 'Log Out', screen: null, desc: 'Sign out of JobTap', danger: true },
  ];

  return (
    <SafeAreaView style={[styles.screenGreen, { backgroundColor: '#C8D8EA' }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#C8D8EA' }}>
        <View style={styles.homeHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            {BIZ_CONFIG.logo
              ? <Image source={{ uri: BIZ_CONFIG.logo }} style={{ width: 90, height: 30, resizeMode: 'contain' }} />
              : <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 }}>JOBTAP</Text>
            }
            <Text style={styles.homeDate}>{dow}, {dateStr}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={styles.homeGreeting}>Hey, Greg 👋</Text>
            <TouchableOpacity onPress={() => setShowMenu(true)}>
              <Text style={{ fontSize: 28 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.homeKpiRow}>
            <TouchableOpacity style={styles.homeKpi} onPress={() => navigate('Jobs')}>
              <Text style={styles.homeKpiVal}>{paidJobsMonth.length}</Text>
              <Text style={styles.homeKpiLabel}>Jobs · Month</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.homeKpi, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' }]} onPress={() => navigate('Jobs')}>
              <Text style={[styles.homeKpiVal, { color: activeQuotes.length > 0 ? '#FCD34D' : C.white }]}>{activeQuotes.length}</Text>
              <Text style={styles.homeKpiLabel}>Quotes · 30d</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.homeKpi, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' }]} onPress={() => navigate('Leads')}>
              <Text style={[styles.homeKpiVal, { color: activeLeads.length > 0 ? '#FCD34D' : C.white }]}>{activeLeads.length}</Text>
              <Text style={styles.homeKpiLabel}>Leads · 7d</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 14 }}>
          {LEADS.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: '#000', fontSize: 14 }]}>URGENT ATTENTION</Text>
              {LEADS.map(lead => (
                <TouchableOpacity key={lead.id} style={[styles.attentionCard, { borderLeftColor: C.red }]} onPress={() => navigate('Leads')}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={[styles.attentionDot, { backgroundColor: C.red + '22' }]}>
                      <Text style={{ fontSize: 16 }}>📋</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.grey }}>{lead.name} — needs a call</Text>
                      <Text style={{ fontSize: 12, color: C.greyMid }}>{lead.time} · {lead.source} · {lead.phone}</Text>
                    </View>
                    <TouchableOpacity style={styles.callBackBtn}>
                      <Text style={{ color: C.white, fontSize: 15, fontWeight: '700' }}>Call</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          <Text style={[styles.sectionTitle, { color: '#000', fontSize: 14 }]}>TODAY'S JOBS</Text>
          {todayJobs.map(job => {
            const client = MOCK_CUSTOMERS.find(c => c.id === job.customerId);
            return (
              <TouchableOpacity key={job.id} onPress={() => navigate('ActiveJob', { job })} style={styles.jobCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#000' }}>{job.customerName}</Text>
                    <Text style={{ fontSize: 12, color: '#000', marginTop: 3 }}>{client?.street}</Text>
                    <Text style={{ fontSize: 12, color: '#000', marginTop: 1 }}>{client?.city}, {client?.state} {client?.zip}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#000' }}>{fmtCurrency(job.amount)}</Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`https://maps.google.com/maps?q=${encodeURIComponent(client?.address || job.customerName)}`)}
                      style={[styles.callBackBtn, { marginTop: 6 }]}
                    >
                      <Text style={{ color: C.white, fontSize: 15, fontWeight: '700' }}>Navigate →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={styles.revenueCard}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>MONTH REVENUE</Text>
              <Text style={{ color: C.white, fontSize: 32, fontWeight: '900', letterSpacing: -1, marginTop: 2 }}>$11,340</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>April · {paidJobsMonth.length} jobs paid</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: C.white, fontSize: 12, fontWeight: '700' }}>↑18% vs last mo</Text>
              </View>
              <TouchableOpacity onPress={() => navigate('RevenueDashboard')} style={{ backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                <Text style={{ color: '#4338CA', fontSize: 12, fontWeight: '700' }}>View Report</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      <BottomNav active="Home" navigate={navigate} onCreate={() => setShowCreateSheet(true)} />
      <CreateSheet visible={showCreateSheet} onClose={() => setShowCreateSheet(false)} navigate={navigate} />

      <Modal visible={showMenu} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={[styles.modalSheet, { maxHeight: '88%' }]}>
            <View style={styles.modalHandle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: C.green, justifyContent: 'center', alignItems: 'center' }}>
                {BIZ_CONFIG.logo
                  ? <Image source={{ uri: BIZ_CONFIG.logo }} style={{ width: 48, height: 48, borderRadius: 12 }} />
                  : <Text style={{ color: C.white, fontSize: 20, fontWeight: '900' }}>{BIZ_CONFIG.name.charAt(0)}</Text>
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: C.grey }}>{BIZ_CONFIG.name}</Text>
                <Text style={{ fontSize: 12, color: C.greyMid }}>JobTap v1.0 · jobtap.app</Text>
              </View>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <Text style={{ fontSize: 20, color: C.greyMid }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {MENU_ITEMS.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.menuRow, item.danger && { borderTopWidth: 1, borderTopColor: C.border, marginTop: 8, paddingTop: 16 }]}
                  onPress={() => {
                    setShowMenu(false);
                    if (item.screen) navigate(item.screen);
                    else Alert.alert('Log Out', 'Sign out of JobTap?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Log Out', style: 'destructive', onPress: () => {} },
                    ]);
                  }}
                >
                  <View style={[styles.menuIcon, item.danger && { backgroundColor: '#FEE2E2' }]}>
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: item.danger ? C.red : C.grey }}>{item.label}</Text>
                    <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 1 }}>{item.desc}</Text>
                  </View>
                  <Text style={{ color: C.greyMid, fontSize: 18 }}>›</Text>
                </TouchableOpacity>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// ─── CUSTOMERS SCREEN ─────────────────────────────────────────────────────────
const CustomersScreen = ({ navigate, customers = MOCK_CUSTOMERS }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const PIPELINE = ['All', 'New Lead', 'Quoted', 'Booked', 'Follow-up', 'Due', 'Done'];
  const filterMap = { 'All': null, 'New Lead': 'lead', 'Quoted': 'quoted', 'Booked': 'active', 'Follow-up': 'followup', 'Due': 'due', 'Done': 'vip' };

  const lastAction = (c) => {
    if (c.status === 'lead') return 'New inquiry · just now';
    if (c.status === 'due') return `Last job ${fmtDate(c.lastJob)} · follow-up overdue`;
    if (c.status === 'vip') return `Last job ${fmtDate(c.lastJob)} · ⭐ VIP`;
    return `Last job ${fmtDate(c.lastJob)}`;
  };

  const pipelineStage = (c) => {
    if (c.status === 'lead') return 'New Lead';
    if (c.status === 'due') return 'Due';
    if (c.status === 'vip') return 'Done';
    if (c.status === 'active') return 'Booked';
    return 'Active';
  };

  const visible = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase());
    const mapped = filterMap[filter];
    const matchFilter = !mapped || c.status === mapped;
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 18 }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 26, letterSpacing: -0.5 }]}>Customers</Text>
            <Text style={styles.headerSub}>{customers.length} total · {customers.filter(c => c.status === "lead").length} new leads</Text>
          </View>
          <TouchableOpacity onPress={() => navigate('NewCustomer')} style={styles.headerActionBtn}>
            <Text style={{ color: C.white, fontSize: 22 }}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.headerSearch, { backgroundColor: 'rgba(232,245,227,0.25)', marginTop: 14 }]}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginRight: 6 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, fontSize: 14, color: C.white }}
            placeholder="Search customers..."
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={{ backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 10, gap: 8 }}>
          {PIPELINE.map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, filter === f && { color: C.white }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={visible}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 14 }}
        style={{ backgroundColor: C.greyLight }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigate('CustomerDetail', { customer: item })} style={styles.clientRow}>
            <View style={[styles.avatar, { backgroundColor: statusColor(item.status) + '22' }]}>
              <Text style={[styles.avatarText, { color: statusColor(item.status) }]}>{item.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{item.name}</Text>
              <Text style={styles.clientAddr}>{lastAction(item)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={[styles.statusPill, { backgroundColor: statusColor(item.status) }]}>
                <Text style={{ color: C.white, fontSize: 10, fontWeight: '700' }}>{pipelineStage(item)}</Text>
              </View>
              <Text style={styles.clientJobs}>{item.jobs} jobs</Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
      <BottomNav active="Customers" navigate={navigate} />
    </SafeAreaView>
  );
};

// ─── CUSTOMER DETAIL ──────────────────────────────────────────────────────────
const CustomerDetailScreen = ({ navigate, params }) => {
  const customer = params?.customer || MOCK_CUSTOMERS[0];
  const custJobs = MOCK_JOBS.filter(j => j.customerId === customer.id);
  const totalRevenue = custJobs.reduce((s, j) => s + j.amount, 0);
  const initials = customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const [showJobsModal, setShowJobsModal] = useState(false);

  const TIMELINE = [
    ...custJobs.map(j => ({ type: 'job', date: j.date, label: j.service, amount: j.amount, status: j.status, job: j })),
    { type: 'review', date: '2026-04-11', label: 'Google review requested', amount: null, status: 'sent' },
    { type: 'followup', date: '2026-05-10', label: '30-day follow-up scheduled', amount: null, status: 'pending' },
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const ACTIONS = [
    { icon: '📞', label: 'Call', onPress: () => {} },
    { icon: '💬', label: 'Text', onPress: () => {} },
    { icon: '✉️', label: 'Email', onPress: () => {} },
    { icon: '📝', label: 'New Quote', onPress: () => navigate('QuoteBuilder', { customer }) },
    { icon: '⭐', label: 'Review', onPress: () => navigate('ReviewRequest', { customer }) },
  ];

  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigate('Customers')} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.detailHeaderLabel}>Customer Detail</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.detailHero}>
        <View style={styles.detailAvatar}>
          <Text style={styles.detailAvatarText}>{initials}</Text>
        </View>
        <Text style={styles.detailName}>{customer.name}</Text>
        <Text style={styles.detailAddr}>{customer.address}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
          <View style={[styles.statusPill, { backgroundColor: statusColor(customer.status) }]}>
            <Text style={{ color: C.white, fontSize: 11, fontWeight: '700' }}>{statusLabel(customer.status)}</Text>
          </View>
          {customer.jobs > 2 && (
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
              <Text style={{ color: C.white, fontSize: 11, fontWeight: '600' }}>Referred by Mike S.</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.detailActions}>
        {ACTIONS.map(a => (
          <TouchableOpacity key={a.label} style={styles.detailActionBtn} onPress={a.onPress}>
            <Text style={{ fontSize: 20 }}>{a.icon}</Text>
            <Text style={styles.detailActionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 14 }}>
          <View style={styles.kpiRow}>
            <TouchableOpacity style={[styles.kpiCard, styles.card]} onPress={() => setShowJobsModal(true)}>
              <Text style={[styles.kpiVal, { color: C.green }]}>{custJobs.length}</Text>
              <Text style={styles.kpiLabel}>Jobs done</Text>
              <Text style={{ fontSize: 9, color: C.green, fontWeight: '600', marginTop: 1 }}>tap to view</Text>
            </TouchableOpacity>
            <Card style={styles.kpiCard}>
              <Text style={styles.kpiVal}>{fmtCurrency(totalRevenue)}</Text>
              <Text style={styles.kpiLabel}>Total paid</Text>
            </Card>
            <Card style={styles.kpiCard}>
              <Text style={[styles.kpiVal, { fontSize: 13 }]}>{customer.lastJob ? fmtDateShort(customer.lastJob) : '—'}</Text>
              <Text style={styles.kpiLabel}>Last job</Text>
            </Card>
          </View>

          <Text style={styles.sectionTitle}>JOB & CONTACT HISTORY</Text>
          {TIMELINE.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => item.type === 'job' ? navigate('ActiveJob', { job: item.job }) : null}
              style={styles.timelineRow}
            >
              <View style={[styles.timelineDot, {
                backgroundColor: item.type === 'job' ? statusColor(item.status) : item.type === 'review' ? C.gold : C.greyLight,
                borderColor: item.type === 'job' ? statusColor(item.status) : item.type === 'review' ? C.gold : C.border,
              }]} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.grey }}>{item.label}</Text>
                <Text style={{ fontSize: 11, color: C.greyMid, marginTop: 1 }}>{fmtDate(item.date)}</Text>
              </View>
              {item.amount ? (
                <Text style={{ fontSize: 14, fontWeight: '800', color: C.green }}>{fmtCurrency(item.amount)}</Text>
              ) : (
                <View style={{ backgroundColor: item.status === 'pending' ? C.greyLight : C.greenLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: item.status === 'pending' ? C.greyMid : C.green }}>
                    {item.status === 'pending' ? 'PENDING' : 'SENT'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.detailFab} onPress={() => navigate('QuoteBuilder', { customer })}>
        <Text style={{ color: C.white, fontSize: 30, fontWeight: '300', textAlign: 'center', lineHeight: 56 }}>+</Text>
      </TouchableOpacity>

      <Modal visible={showJobsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '80%' }]}>
            <View style={styles.modalHandle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.modalTitle}>Jobs — {customer.name}</Text>
              <TouchableOpacity onPress={() => setShowJobsModal(false)}>
                <Text style={{ fontSize: 22, color: C.greyMid }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <Text style={{ fontSize: 13, color: C.greyMid }}>{custJobs.length} jobs total</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: C.green }}>{fmtCurrency(totalRevenue)} total</Text>
            </View>
            <FlatList
              data={[...custJobs].sort((a, b) => new Date(b.date) - new Date(a.date))}
              keyExtractor={i => i.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                  onPress={() => { setShowJobsModal(false); navigate('ActiveJob', { job: item }); }}
                >
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: statusColor(item.status) }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.grey }}>{item.service}</Text>
                    <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 2 }}>{fmtDate(item.date)} · {item.sqft} sq ft</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: C.green }}>{fmtCurrency(item.amount)}</Text>
                    <View style={[styles.statusPill, { backgroundColor: statusColor(item.status), marginTop: 4 }]}>
                      <Text style={{ color: C.white, fontSize: 10, fontWeight: '700' }}>{statusLabel(item.status)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── NEW CUSTOMER ─────────────────────────────────────────────────────────────
const NewCustomerScreen = ({ navigate, addCustomer }) => {
  const [form, setForm] = useState({ name: '', street: '', city: '', state: 'FL', zip: '', phone: '', email: '' });
  const [source, setSource] = useState('');
  const [saving, setSaving] = useState(false);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const SOURCES = [
    { key: 'google', label: 'Google', icon: '🔍' },
    { key: 'facebook', label: 'Facebook', icon: '👥' },
    { key: 'referral', label: 'Referral', icon: '🤝' },
    { key: 'nextdoor', label: 'Nextdoor', icon: '🏘' },
    { key: 'doorknock', label: 'Door Knock', icon: '🚪' },
    { key: 'yardsign', label: 'Yard Sign', icon: '🪧' },
    { key: 'other', label: 'Other', icon: '💬' },
  ];

  const handleSave = () => {
    Keyboard.dismiss();
    if (!form.name) { Alert.alert('Name is required'); return; }
    setSaving(true);
    addCustomer && addCustomer({ ...form, source });
    setTimeout(() => {
      setSaving(false);
      Alert.alert('✅ Client Added!', `${form.name} is saved.`, [
        { text: 'Build Quote', onPress: () => navigate('QuoteBuilder') },
        { text: 'Schedule Apt', onPress: () => navigate('Schedule') },
      ]);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 18 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home')} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 22 }]}>New Client</Text>
            <Text style={styles.headerSub}>Saved to your client list</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: C.greyLight }}
        contentContainerStyle={{ padding: 14 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>CONTACT INFO</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { key: 'name', label: 'Full Name', placeholder: 'Jane Smith', keyboard: 'default', icon: '👤' },
            { key: 'phone', label: 'Phone', placeholder: '(904) 555-0000', keyboard: 'phone-pad', icon: '📞' },
            { key: 'email', label: 'Email', placeholder: 'jane@example.com', keyboard: 'email-address', icon: '✉️' },
          ].map((f, i) => (
            <View key={f.key}>
              {i > 0 && <View style={styles.qbDivider} />}
              <View style={styles.qbRow}>
                <View style={styles.qbRowIcon}><Text style={{ fontSize: 15 }}>{f.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.qbRowLabel}>{f.label}</Text>
                  <TextInput
                    style={styles.qbRowValue}
                    placeholder={f.placeholder}
                    placeholderTextColor={C.greyMid}
                    keyboardType={f.keyboard}
                    autoCapitalize={f.key === 'email' || f.key === 'phone' ? 'none' : 'words'}
                    value={form[f.key]}
                    onChangeText={v => { if (f.key === 'phone') upd('phone', formatPhone(v)); else upd(f.key, v); }}
                  />
                </View>
              </View>
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>PROPERTY ADDRESS</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={styles.qbRow}>
            <View style={styles.qbRowIcon}><Text style={{ fontSize: 15 }}>📍</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.qbRowLabel}>Street</Text>
              <TextInput style={styles.qbRowValue} placeholder="142 Palmetto Ct" placeholderTextColor={C.greyMid} value={form.street} onChangeText={v => upd('street', v)} />
            </View>
          </View>
          <View style={styles.qbDivider} />
          <View style={[styles.qbRow, { gap: 8 }]}>
            <View style={styles.qbRowIcon}><Text style={{ fontSize: 15 }}>🏙</Text></View>
            <View style={{ flex: 2 }}>
              <Text style={styles.qbRowLabel}>City</Text>
              <TextInput style={styles.qbRowValue} placeholder="Nocatee" placeholderTextColor={C.greyMid} value={form.city} onChangeText={v => upd('city', v)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.qbRowLabel}>State</Text>
              <TextInput style={styles.qbRowValue} placeholder="FL" placeholderTextColor={C.greyMid} autoCapitalize="characters" maxLength={2} value={form.state} onChangeText={v => upd('state', v)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.qbRowLabel}>Zip</Text>
              <TextInput style={styles.qbRowValue} placeholder="32081" placeholderTextColor={C.greyMid} keyboardType="numeric" maxLength={5} value={form.zip} onChangeText={v => upd('zip', v)} />
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>HOW DID THEY FIND YOU?</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {SOURCES.map(s => (
            <TouchableOpacity key={s.key} onPress={() => setSource(s.key)} style={[styles.sourceChip, source === s.key && { backgroundColor: C.green, borderColor: C.green }]}>
              <Text style={{ fontSize: 16 }}>{s.icon}</Text>
              <Text style={[styles.sourceChipText, source === s.key && { color: C.white }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.greenBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={C.white} /> : <Text style={styles.greenBtnText}>Add Client →</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── QUOTE BUILDER ────────────────────────────────────────────────────────────
const QuoteBuilderScreen = ({ navigate, params, customers = MOCK_CUSTOMERS }) => {
  const customer = params?.customer || null;
  const [selectedCustomer, setSelectedCustomer] = useState(customer);
  const [showCustomerPicker, setShowCustomerPicker] = useState(!customer);
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('both');
  const [sent, setSent] = useState(false);
  const [showQuotePreview, setShowQuotePreview] = useState(false);

  const [services, setServices] = useState(
    SERVICE_ITEMS.map(s => ({ ...s, selected: s.id === 's1', price: s.defaultPrice, sqft: '', open: s.id === 's1' }))
  );

  // ── Measure prefill — auto-fills sqft when returning from measure tool ──────
  useEffect(() => {
    if (params?.measuredSqft && params?.measuredService) {
      setServices(prev => prev.map(s =>
        s.label === params.measuredService ||
        (params.measuredSurface === 'Driveway' && s.label === 'Paver Sealing')
          ? { ...s, selected: true, sqft: String(params.measuredSqft), open: false }
          : s
      ));
    }
  }, [params?.measuredSqft, params?.measuredService]);

  const toggleService = (id) => setServices(prev => prev.map(s =>
    s.id === id ? { ...s, selected: !s.selected, open: !s.selected } : s
  ));
  const updatePrice = (id, val) => setServices(prev => prev.map(s => s.id === id ? { ...s, price: val } : s));
  const updateSqft = (id, val) => setServices(prev => prev.map(s => s.id === id ? { ...s, sqft: val } : s));
  const updateLabel = (id, val) => setServices(prev => prev.map(s => s.id === id ? { ...s, label: val } : s));
  const updateUnit = (id, val) => setServices(prev => prev.map(s => s.id === id ? { ...s, unit: val, sqft: '', price: '' } : s));
  const handleSqftDone = (id) => setServices(prev => prev.map(s => {
    if (s.id !== id) return s;
    const ready = s.price && (s.unit === 'flat' || s.sqft);
    return { ...s, open: !ready };
  }));

  const selected = services.filter(s => s.selected);
  const total = selected.reduce((sum, s) => {
    const p = parseFloat(s.price) || 0;
    if (s.unit === 'flat') return sum + p;
    return sum + (p * (parseFloat(s.sqft) || 0));
  }, 0);

  const [expiry] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  const deliveryLabel = { text: 'Send via Text', email: 'Send via Email', both: 'Send Quote — Text + Email', draft: 'Save as Draft' };
  const deliverySub = { text: 'Delivered by text instantly', email: 'Delivered by email instantly', both: 'Delivered instantly by text + email', draft: 'Saved — send later' };

  const handleSend = () => {
    if (!selectedCustomer) { Alert.alert('Select a client first'); return; }
    if (selected.length === 0) { Alert.alert('Select at least one service'); return; }
    setSent(true);
    const newJob = {
      id: `q${Date.now()}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      address: selectedCustomer.address,
      service: selected.map(s => s.label).join(' + '),
      sqft: parseInt(selected.find(s => s.sqft)?.sqft || 0),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      amount: total,
    };
    MOCK_JOBS = [newJob, ...MOCK_JOBS];
    setTimeout(() => {
      setSent(false);
      Alert.alert('✅ Quote Sent!', `${fmtCurrency(total)} quote sent to ${selectedCustomer.name}`);
      navigate('Home');
    }, 900);
  };

  if (sent) return (
    <SafeAreaView style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator color={C.green} size="large" />
      <Text style={{ color: C.green, marginTop: 12, fontSize: 16 }}>Sending quote...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home')} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600' }]}>Quote Builder</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={{ color: C.white, fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginTop: 6 }}>
          {selectedCustomer ? selectedCustomer.name : 'New Quote'}
        </Text>
        {selectedCustomer && (
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{selectedCustomer.address}</Text>
        )}
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {!selectedCustomer ? (
          <TouchableOpacity style={[styles.greenBtn, { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.green, marginBottom: 16 }]} onPress={() => setShowCustomerPicker(true)}>
            <Text style={[styles.greenBtnText, { color: C.green }]}>+ Select Client</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setShowCustomerPicker(true)} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
            <Text style={{ color: C.green, fontSize: 13, fontWeight: '600' }}>Change client →</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>JOB DETAILS</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={[styles.qbRow, { flexDirection: 'column', alignItems: 'stretch', gap: 0 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <View style={styles.qbRowIcon}><Text style={{ fontSize: 16 }}>🗂</Text></View>
              <Text style={[styles.qbRowLabel, { marginBottom: 0, fontSize: 12 }]}>Service type — tap to select</Text>
            </View>
            {services.map(s => {
              const lineTotal = s.unit === 'flat'
                ? parseFloat(s.price) || 0
                : (parseFloat(s.price) || 0) * (parseFloat(s.sqft) || 0);
              const isFilled = s.selected && s.price && (s.unit === 'flat' || s.sqft);

              return (
                <View key={s.id}>
                  <TouchableOpacity onPress={() => toggleService(s.id)} style={[styles.serviceSelectRow, s.selected && { backgroundColor: C.greenLight }]}>
                    <View style={[styles.checkbox, s.selected && { backgroundColor: C.green, borderColor: C.green }]}>
                      {s.selected && <Text style={{ color: C.white, fontSize: 10, fontWeight: '900' }}>✓</Text>}
                    </View>
                    <Text style={{ fontSize: 18, marginHorizontal: 8 }}>{s.icon}</Text>
                    {s.custom ? (
                      <TextInput
                        style={{ flex: 1, fontSize: 14, color: C.grey, fontWeight: '500', paddingVertical: 0 }}
                        placeholder="Custom service name..."
                        placeholderTextColor={C.greyMid}
                        value={s.label}
                        onChangeText={v => updateLabel(s.id, v)}
                        onFocus={() => setServices(prev => prev.map(sv => sv.id === s.id ? { ...sv, selected: true, open: true } : sv))}
                      />
                    ) : (
                      <Text style={{ flex: 1, fontSize: 14, color: s.selected ? C.grey : C.greyMid, fontWeight: s.selected ? '700' : '400' }}>{s.label}</Text>
                    )}
                    {isFilled && !s.open && (
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 12, color: C.greyMid }}>{s.unit === 'flat' ? 'flat' : `${s.sqft} sq ft`}</Text>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: C.green }}>{fmtCurrency(lineTotal)}</Text>
                      </View>
                    )}
                    {s.selected && <Text style={{ color: C.greyMid, fontSize: 14, marginLeft: 6 }}>{s.open ? '▲' : '▼'}</Text>}
                  </TouchableOpacity>

                  {s.selected && s.open && (
                    <View style={styles.accordionBody}>
                      <TouchableOpacity onPress={() => updateUnit(s.id, s.unit === 'flat' ? '/sq ft' : 'flat')} style={styles.flatToggleRow}>
                        <View style={[styles.flatToggleBox, s.unit === 'flat' && { backgroundColor: C.green, borderColor: C.green }]}>
                          {s.unit === 'flat' && <Text style={{ color: C.white, fontSize: 10, fontWeight: '900' }}>✓</Text>}
                        </View>
                        <Text style={{ fontSize: 13, color: C.grey, fontWeight: '600' }}>Flat rate job</Text>
                        <Text style={{ fontSize: 11, color: C.greyMid, marginLeft: 6 }}>{s.unit === 'flat' ? '(one price total)' : '(price × sq ft)'}</Text>
                      </TouchableOpacity>

                      <View style={[styles.accordionRow, { marginTop: 8 }]}>
                        <Text style={styles.accordionLabel}>{s.unit === 'flat' ? 'Total price' : 'Price / sq ft'}</Text>
                        <View style={styles.accordionInput}>
                          <Text style={{ color: C.greyMid, fontSize: 13 }}>$</Text>
                          <TextInput
                            key={`price-${s.id}-${s.unit}`}
                            style={styles.accordionInputField}
                            value={s.price}
                            onChangeText={v => updatePrice(s.id, v)}
                            keyboardType="decimal-pad"
                            placeholder={s.unit === 'flat' ? '0.00' : (s.defaultPrice || '0')}
                            placeholderTextColor={C.greyMid}
                          />
                        </View>
                      </View>

                      {s.unit !== 'flat' && (
                        <View style={[styles.accordionRow, { marginTop: 8 }]}>
                          <Text style={styles.accordionLabel}>Square footage</Text>
                          <View style={styles.accordionInput}>
                            <TextInput
                              key={`sqft-${s.id}-${s.unit}`}
                              style={styles.accordionInputField}
                              value={s.sqft}
                              onChangeText={v => updateSqft(s.id, v)}
                              onEndEditing={() => handleSqftDone(s.id)}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor={C.greyMid}
                              returnKeyType="done"
                            />
                            <Text style={{ color: C.greyMid, fontSize: 12 }}>sq ft</Text>
                          </View>
                        </View>
                      )}

                      {lineTotal > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border }}>
                          <Text style={{ fontSize: 12, color: C.greyMid }}>{s.unit === 'flat' ? 'Flat rate' : `${s.sqft} sq ft × $${s.price}`}</Text>
                          <Text style={{ fontSize: 18, fontWeight: '900', color: C.green }}>{fmtCurrency(lineTotal)}</Text>
                        </View>
                      )}

                      <TouchableOpacity style={[styles.greenBtn, { marginTop: 12, marginBottom: 0, paddingVertical: 10 }]} onPress={() => handleSqftDone(s.id)}>
                        <Text style={[styles.greenBtnText, { fontSize: 14 }]}>Done ✓</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.qbDivider} />
          <View style={styles.qbRow}>
            <View style={styles.qbRowIcon}><Text style={{ fontSize: 16 }}>📋</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.qbRowLabel}>Notes</Text>
              <TextInput style={[styles.qbRowValue, { minHeight: 40 }]} placeholder="Add job notes..." placeholderTextColor={C.greyMid} multiline value={notes} onChangeText={setNotes} />
            </View>
          </View>

          <View style={styles.qbDivider} />
          <View style={styles.qbRow}>
            <View style={styles.qbRowIcon}><Text style={{ fontSize: 16 }}>📅</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.qbRowLabel}>Quote expires</Text>
              <Text style={styles.qbRowValue}>{expiry}</Text>
            </View>
          </View>
        </Card>

        <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.greenLight }}>
          <View>
            <Text style={{ fontSize: 11, color: C.greyMid, fontWeight: '600' }}>{selected.length} service{selected.length !== 1 ? 's' : ''} selected</Text>
            <Text style={{ fontSize: 15, color: C.grey, fontWeight: '600', marginTop: 2 }}>Total Quote</Text>
          </View>
          <Text style={{ fontSize: 30, fontWeight: '900', color: C.green, letterSpacing: -1 }}>{fmtCurrency(total)}</Text>
        </Card>

        {/* ── TAP TO MEASURE — wired to MeasureEntry ── */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#EA580C', flexDirection: 'row', alignItems: 'center', gap: 12 }]}
          onPress={() => navigate('MeasureEntry', { customer: selectedCustomer })}
        >
          <Text style={{ fontSize: 28 }}>📏</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.white, fontSize: 14, fontWeight: '800' }}>Tap to Measure This Job</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>Satellite trace or camera tap · sq ft auto-fills</Text>
          </View>
          <Text style={{ color: C.white, fontSize: 18 }}>→</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>SEND METHOD</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {[{ key: 'text', label: 'Text' }, { key: 'email', label: 'Email' }, { key: 'both', label: 'Both' }, { key: 'draft', label: 'Draft' }].map(m => (
            <TouchableOpacity key={m.key} onPress={() => setDeliveryMethod(m.key)} style={[styles.deliveryBtn, deliveryMethod === m.key && styles.deliveryBtnActive]}>
              <Text style={[styles.deliveryBtnText, deliveryMethod === m.key && { color: C.green, fontWeight: '700' }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.greenBtn, { flexDirection: 'row', justifyContent: 'center', gap: 8 }]} onPress={() => {
          if (!selectedCustomer) { Alert.alert('Select a client first'); return; }
          if (selected.length === 0) { Alert.alert('Select at least one service'); return; }
          setShowQuotePreview(true);
        }}>
          <Text style={styles.greenBtnText}>👁 Review Quote</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: 'center', color: C.greyMid, fontSize: 11, marginTop: -6, marginBottom: 10 }}>Preview before sending</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showCustomerPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Client</Text>
            <FlatList
              data={customers}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.clientRow} onPress={() => { setSelectedCustomer(item); setShowCustomerPicker(false); }}>
                  <View style={[styles.avatar, { backgroundColor: statusColor(item.status) + '22' }]}>
                    <Text style={[styles.avatarText, { color: statusColor(item.status) }]}>{item.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{item.name}</Text>
                    <Text style={styles.clientAddr}>{item.address}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.greenBtn, { backgroundColor: C.greyLight }]} onPress={() => setShowCustomerPicker(false)}>
              <Text style={[styles.greenBtnText, { color: C.grey }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showQuotePreview} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: C.greyLight }}>
          <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', paddingBottom: 14 }]}>
            <TouchableOpacity onPress={() => setShowQuotePreview(false)} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center', fontSize: 16 }]}>Quote Preview</Text>
            <View style={{ width: 36 }} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
            <View style={styles.quoteDoc}>
              <View style={styles.quoteDocHeader}>
                <View>
                  <Text style={styles.quoteLogoText}>JOBTAP</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, letterSpacing: 0.5 }}>TAP YOUR WAY TO MONEY</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: C.white, fontSize: 18, fontWeight: '900' }}>QUOTE</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>#{`Q${Date.now().toString().slice(-5)}`}</Text>
                </View>
              </View>
              <View style={styles.quoteFromTo}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quoteSmLabel}>FROM</Text>
                  <Text style={styles.quoteFromName}>HydroSeal Pavers</Text>
                  <Text style={styles.quoteFromDetail}>info@hydrosealpavers.com</Text>
                  <Text style={styles.quoteFromDetail}>(904) 555-0100</Text>
                  <Text style={styles.quoteFromDetail}>Northeast Florida</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.quoteSmLabel}>TO</Text>
                  <Text style={styles.quoteFromName}>{selectedCustomer?.name}</Text>
                  <Text style={styles.quoteFromDetail}>{selectedCustomer?.phone}</Text>
                  <Text style={styles.quoteFromDetail}>{selectedCustomer?.email}</Text>
                  <Text style={styles.quoteFromDetail}>{selectedCustomer?.address}</Text>
                </View>
              </View>
              <View style={[styles.quoteFromTo, { backgroundColor: C.greyLight, borderRadius: 10, padding: 12, marginHorizontal: 0 }]}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={styles.quoteSmLabel}>DATE</Text>
                  <Text style={styles.quoteMeta}>{fmtDate(new Date().toISOString())}</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.border }}>
                  <Text style={styles.quoteSmLabel}>EXPIRES</Text>
                  <Text style={styles.quoteMeta}>{expiry}</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={styles.quoteSmLabel}>AREA</Text>
                  <Text style={styles.quoteMeta}>{selected.length} service{selected.length !== 1 ? 's' : ''}</Text>
                </View>
              </View>
              <View style={{ marginTop: 16 }}>
                <View style={styles.quoteLineHeader}>
                  <Text style={[styles.quoteSmLabel, { flex: 1 }]}>SERVICE</Text>
                  <Text style={[styles.quoteSmLabel, { width: 60, textAlign: 'right' }]}>RATE</Text>
                  <Text style={[styles.quoteSmLabel, { width: 70, textAlign: 'right' }]}>AMOUNT</Text>
                </View>
                {selected.map((s, i) => {
                  const p = parseFloat(s.price) || 0;
                  const area = parseFloat(s.sqft) || 0;
                  const amt = s.unit === 'flat' ? p : p * area;
                  return (
                    <View key={s.id} style={[styles.quoteLineRow, i % 2 === 0 && { backgroundColor: '#FAFAFA' }]}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 14 }}>{s.icon}</Text>
                        <View>
                          <Text style={{ fontSize: 13, color: C.grey, fontWeight: '500' }}>{s.label}</Text>
                          {s.unit !== 'flat' && area > 0 && <Text style={{ fontSize: 10, color: C.greyMid }}>{area} sq ft</Text>}
                        </View>
                      </View>
                      <Text style={{ width: 60, fontSize: 12, color: C.greyMid, textAlign: 'right' }}>${s.price}{s.unit}</Text>
                      <Text style={{ width: 70, fontSize: 13, color: C.grey, fontWeight: '700', textAlign: 'right' }}>{fmtCurrency(amt)}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.quoteTotalRow}>
                <Text style={{ fontSize: 15, color: C.grey, fontWeight: '600' }}>Total</Text>
                <Text style={{ fontSize: 28, fontWeight: '900', color: C.green, letterSpacing: -1 }}>{fmtCurrency(total)}</Text>
              </View>
              {notes ? (
                <View style={{ marginTop: 12, padding: 12, backgroundColor: C.greyLight, borderRadius: 10 }}>
                  <Text style={styles.quoteSmLabel}>NOTES</Text>
                  <Text style={{ fontSize: 13, color: C.grey, marginTop: 4, lineHeight: 18 }}>{notes}</Text>
                </View>
              ) : null}
              <View style={styles.quoteFooter}>
                <Text style={{ fontSize: 11, color: C.greyMid, textAlign: 'center', lineHeight: 16 }}>
                  ✅ Trident Master Certified · HOA-Approved Sealer{'\n'}
                  2-Year Warranty · Licensed & Insured · Northeast Florida
                </Text>
                <Text style={{ fontSize: 10, color: C.border, textAlign: 'center', marginTop: 8 }}>Powered by JobTap · jobtap.app</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>SEND METHOD</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {[{ key: 'text', label: 'Text' }, { key: 'email', label: 'Email' }, { key: 'both', label: 'Both' }, { key: 'draft', label: 'Draft' }].map(m => (
                <TouchableOpacity key={m.key} onPress={() => setDeliveryMethod(m.key)} style={[styles.deliveryBtn, deliveryMethod === m.key && styles.deliveryBtnActive]}>
                  <Text style={[styles.deliveryBtnText, deliveryMethod === m.key && { color: C.green, fontWeight: '700' }]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.greenBtn, sent && { opacity: 0.6 }]} onPress={handleSend} disabled={sent}>
              {sent
                ? <ActivityIndicator color={C.white} />
                : <>
                    <Text style={styles.greenBtnText}>{deliveryLabel[deliveryMethod]}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 }}>{deliverySub[deliveryMethod]}</Text>
                  </>
              }
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// ─── SHARED PHOTO PICKER ──────────────────────────────────────────────────────
const pickPhoto = async (fromCamera, onAdd) => {
  try {
    const ImagePicker = require('expo-image-picker');
    let perm;
    if (fromCamera) {
      perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== 'granted') { Alert.alert('Camera needed', 'Allow camera access in Settings.'); return; }
    } else {
      perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') { Alert.alert('Photos needed', 'Allow photo library access in Settings.'); return; }
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsMultipleSelection: true, selectionLimit: 6 });
    if (!result.canceled && result.assets?.length > 0) {
      result.assets.forEach(a => onAdd(a.uri));
    }
  } catch {
    Alert.alert('Photo picker', 'Opens your camera/photos on a real device.', [
      { text: 'Simulate photo', onPress: () => onAdd('mock_' + Date.now()) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }
};

// ─── ACTIVE JOB ───────────────────────────────────────────────────────────────
const ActiveJobScreen = ({ navigate, params }) => {
  const job = params?.job || MOCK_JOBS[1];
  const jobClient = MOCK_CUSTOMERS.find(c => c.id === job.customerId);
  const onSite = params?.onSite === true;
  const [arrived, setArrived] = useState(onSite);
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [photosTaken, setPhotosTaken] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerMins, setTimerMins] = useState(60);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    let arrivalTimeout = null;
    if (!onSite) {
      arrivalTimeout = setTimeout(() => setArrived(true), 800);
    }
    return () => {
      if (arrivalTimeout) clearTimeout(arrivalTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [onSite]);

  const startTimers = () => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    countdownRef.current = setInterval(() => setTimerMins(m => Math.max(0, m - 1)), 60000);
  };

  const addBefore = (uri) => setBeforePhotos(prev => [...prev, uri]);

  const handleDoneWithPhotos = () => {
    if (beforePhotos.length === 0) { Alert.alert('No photos', 'Take at least one before photo.'); return; }
    setPhotosTaken(true);
    startTimers();
  };

  const fmtTime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const timerPct = Math.max(0, timerMins / 60);

  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home')} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { flex: 1 }]}>Active Job</Text>
          <View style={{ backgroundColor: '#22C55E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: C.white, fontSize: 11, fontWeight: '700' }}>● In Progress</Text>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: C.green, paddingHorizontal: 18, paddingBottom: 20, paddingTop: 6 }}>
          <Text style={{ color: C.white, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 }}>{job.customerName}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>{jobClient?.street} · {job.service}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {[{ label: 'Quote', val: fmtCurrency(job.amount) }, { label: 'Started', val: photosTaken ? fmtTime(elapsed) : '—' }, { label: 'Sq ft', val: job.sqft || '—' }].map(k => (
              <View key={k.label} style={styles.jobStatChip}>
                <Text style={styles.jobStatLabel}>{k.label}</Text>
                <Text style={styles.jobStatVal}>{k.val}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ padding: 14, gap: 12 }}>
          {arrived && !photosTaken && (
            <View style={[styles.card, { backgroundColor: C.greenDark, borderWidth: 0 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18 }}>📍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.white, fontSize: 14, fontWeight: '800' }}>You've arrived — take before photos</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 1 }}>GPS detected · Job site confirmed</Text>
                </View>
              </View>
              {beforePhotos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  {beforePhotos.map((uri, i) => (
                    <View key={i} style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                      {uri.startsWith('mock') ? <Text style={{ fontSize: 24 }}>🖼</Text> : <Image source={{ uri }} style={{ width: 56, height: 56 }} />}
                    </View>
                  ))}
                </ScrollView>
              )}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => pickPhoto(true, addBefore)} style={{ flex: 1, backgroundColor: C.white, paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
                  <Text style={{ color: C.greenDark, fontSize: 13, fontWeight: '800' }}>📷 Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => pickPhoto(false, addBefore)} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
                  <Text style={{ color: C.white, fontSize: 13, fontWeight: '700' }}>🖼 Photos</Text>
                </TouchableOpacity>
                {beforePhotos.length > 0 && (
                  <TouchableOpacity onPress={handleDoneWithPhotos} style={{ flex: 1, backgroundColor: '#22C55E', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ color: C.white, fontSize: 13, fontWeight: '800' }}>Done ✓</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          {photosTaken && (
            <View style={[styles.card, { backgroundColor: C.greenDark, borderWidth: 0 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 20 }}>📷</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.white, fontSize: 14, fontWeight: '700' }}>Before photos · {beforePhotos.length} saved</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Job clock started · {fmtTime(elapsed)}</Text>
                </View>
                <TouchableOpacity onPress={() => setPhotosTaken(false)} style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                  <Text style={{ color: C.white, fontSize: 12, fontWeight: '700' }}>Retake</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {photosTaken && (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18 }}>🕐</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.grey }}>After photo reminder</Text>
                  <Text style={{ fontSize: 12, color: C.greyMid }}>Fires automatically in {timerMins}m</Text>
                  <View style={{ height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: 8 }}>
                    <View style={{ height: 4, backgroundColor: '#F97316', borderRadius: 2, width: `${(1 - timerPct) * 100}%` }} />
                  </View>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#F97316' }}>{timerMins}m</Text>
              </View>
            </View>
          )}
          <Text style={styles.sectionTitle}>JOB ACTIONS</Text>
          <TouchableOpacity style={[styles.greenBtn, { paddingVertical: 18 }]} onPress={() => navigate('JobComplete', { job, beforePhotos })}>
            <Text style={[styles.greenBtnText, { fontSize: 17 }]}>Mark Job Done</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Triggers after photo flow + Invoice</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
      <BottomNav active="Jobs" navigate={navigate} />
    </SafeAreaView>
  );
};


// ─── JOBS SCREEN ──────────────────────────────────────────────────────────────
const JobsScreen = ({ navigate }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState({});
  const now = new Date();
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
  const activeJobs = MOCK_JOBS.filter(j => ['scheduled', 'active', 'overdue'].includes(j.status) && (j.customerName.toLowerCase().includes(search.toLowerCase()) || j.service.toLowerCase().includes(search.toLowerCase())));
  const paidJobs = MOCK_JOBS.filter(j => j.status === 'paid');
  const totalPaid = paidJobs.reduce((s, j) => s + j.amount, 0);
  const outstandingQuotes = MOCK_JOBS.filter(j => j.status === 'pending' && new Date(j.date) >= thirtyDaysAgo).sort((a, b) => new Date(a.date) - new Date(b.date));
  const quoteAge = (dateStr) => {
    const days = Math.floor((now - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (days === 0) return { label: 'Today', color: C.green };
    if (days <= 3) return { label: `${days}d old`, color: C.green };
    if (days <= 7) return { label: `${days}d old`, color: C.orange };
    return { label: `${days}d old`, color: C.red };
  };
  const toggleSelect = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  const anySelected = Object.values(selected).some(Boolean);

  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 18 }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 26, letterSpacing: -0.5 }]}>Jobs</Text>
            <Text style={styles.headerSub}>{MOCK_JOBS.length} total · {fmtCurrency(totalPaid)} collected</Text>
          </View>
          <TouchableOpacity onPress={() => navigate('QuoteBuilder')} style={styles.headerActionBtn}>
            <Text style={{ color: C.white, fontSize: 22 }}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.headerSearch, { backgroundColor: 'rgba(232,245,227,0.25)', marginTop: 14 }]}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginRight: 6 }}>🔍</Text>
          <TextInput style={{ flex: 1, fontSize: 14, color: C.white }} placeholder="Search jobs..." placeholderTextColor="rgba(255,255,255,0.55)" value={search} onChangeText={setSearch} />
        </View>
      </View>
      <ScrollView style={{ backgroundColor: C.greyLight }} showsVerticalScrollIndicator={false}>
        {activeJobs.length > 0 && (
          <View style={{ padding: 14 }}>
            <Text style={styles.sectionTitle}>SCHEDULED</Text>
            {activeJobs.map(item => {
              const initials = item.customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <TouchableOpacity key={item.id} style={styles.clientRow} onPress={() => navigate('ActiveJob', { job: item })}>
                  <View style={[styles.avatar, { backgroundColor: statusColor(item.status) + '22' }]}>
                    <Text style={[styles.avatarText, { color: statusColor(item.status), fontSize: 14 }]}>{initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{item.customerName}</Text>
                    <Text style={styles.clientAddr}>{item.service} · {fmtDate(item.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: C.green }}>{fmtCurrency(item.amount)}</Text>
                    <View style={[styles.statusPill, { backgroundColor: statusColor(item.status) }]}>
                      <Text style={{ color: C.white, fontSize: 10, fontWeight: '700' }}>{statusLabel(item.status)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ marginHorizontal: 14, marginBottom: 14, backgroundColor: '#14532D', borderRadius: 14, padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>PAID · {paidJobs.length} JOBS</Text>
              <Text style={{ color: '#4ADE80', fontSize: 26, fontWeight: '900', letterSpacing: -1, marginTop: 2 }}>{fmtCurrency(totalPaid)}</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(74,222,128,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
              <Text style={{ color: '#4ADE80', fontSize: 12, fontWeight: '700' }}>✓ Collected</Text>
            </View>
          </View>
          {paidJobs.slice(0, 3).map(j => (
            <View key={j.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{j.customerName}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#4ADE80' }}>{fmtCurrency(j.amount)}</Text>
            </View>
          ))}
          {paidJobs.length > 3 && <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 6, textAlign: 'center' }}>+{paidJobs.length - 3} more</Text>}
        </View>
        <View style={{ paddingHorizontal: 14, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>OUTSTANDING QUOTES {outstandingQuotes.length > 0 ? `· ${outstandingQuotes.length}` : ''}</Text>
            {anySelected && (
              <TouchableOpacity onPress={() => Alert.alert('Resend Quotes?', `Resend ${Object.values(selected).filter(Boolean).length} quote(s)?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Resend', onPress: () => { setSelected({}); Alert.alert('✅ Quotes resent!'); } }])} style={{ backgroundColor: C.green, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 }}>
                <Text style={{ color: C.white, fontSize: 12, fontWeight: '700' }}>📤 Resend ({Object.values(selected).filter(Boolean).length})</Text>
              </TouchableOpacity>
            )}
          </View>
          {outstandingQuotes.length === 0 ? (
            <View style={{ backgroundColor: C.white, borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1.5, borderColor: C.border }}>
              <Text style={{ color: C.greyMid, fontSize: 14 }}>No outstanding quotes 🎉</Text>
            </View>
          ) : (
            outstandingQuotes.map(item => {
              const age = quoteAge(item.date);
              const isChecked = selected[item.id];
              return (
                <View key={item.id} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: age.color, padding: 12, marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={() => toggleSelect(item.id)} style={[styles.checkbox, isChecked && { backgroundColor: C.green, borderColor: C.green }]}>
                      {isChecked && <Text style={{ color: C.white, fontSize: 10, fontWeight: '900' }}>✓</Text>}
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.grey }}>{item.customerName}</Text>
                      <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 1 }}>{item.service}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: C.green }}>{fmtCurrency(item.amount)}</Text>
                      <View style={{ backgroundColor: age.color + '22', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: age.color }}>{age.label}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <TouchableOpacity style={[styles.greenBtn, { flex: 1, marginBottom: 0, paddingVertical: 8 }]} onPress={() => Alert.alert('Quote resent!', `Sent to ${item.customerName}`)}>
                      <Text style={[styles.greenBtnText, { fontSize: 13 }]}>📤 Resend</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.greenBtn, { flex: 1, marginBottom: 0, paddingVertical: 8, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.green }]} onPress={() => navigate('ActiveJob', { job: item })}>
                      <Text style={[styles.greenBtnText, { fontSize: 13, color: C.green }]}>View Quote</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
      <BottomNav active="Jobs" navigate={navigate} />
    </SafeAreaView>
  );
};


// ─── JOB COMPLETE ─────────────────────────────────────────────────────────────
const JobCompleteScreen = ({ navigate, params }) => {
  const job = params?.job || MOCK_JOBS[0];
  const beforePhotos = params?.beforePhotos || [];
  const customer = MOCK_CUSTOMERS.find(c => c.id === job.customerId) || MOCK_CUSTOMERS[0];
  const [cardTemplate, setCardTemplate] = useState('split');
  const [afterPhotos, setAfterPhotos] = useState([]);
  const addAfter = (uri) => setAfterPhotos(prev => [...prev, uri]);
  const PhotoBox = ({ uri, size = 56 }) => (
    <View style={{ width: size, height: size, borderRadius: 8, backgroundColor: '#2D3748', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
      {uri && !uri.startsWith('mock') ? <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" /> : <Text style={{ fontSize: size * 0.4 }}>🖼</Text>}
    </View>
  );
  const beforeUri = beforePhotos[0];
  const afterUri = afterPhotos[0];
  const SplitCard = () => (
    <View style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: C.white, borderWidth: 1, borderColor: C.border }}>
      <View style={{ flexDirection: 'row', height: 160 }}>
        <View style={{ flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'flex-end', padding: 8 }}>
          {beforeUri && !beforeUri.startsWith('mock') ? <Image source={{ uri: beforeUri }} style={{ ...StyleSheet.absoluteFillObject }} resizeMode="cover" /> : <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#2D3748', justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 32 }}>📷</Text></View>}
          <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' }}><Text style={{ color: C.white, fontSize: 10, fontWeight: '800' }}>BEFORE</Text></View>
        </View>
        <View style={{ flex: 1, backgroundColor: C.green, justifyContent: 'flex-end', padding: 8 }}>
          {afterUri && !afterUri.startsWith('mock') ? <Image source={{ uri: afterUri }} style={{ ...StyleSheet.absoluteFillObject }} resizeMode="cover" /> : <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: C.greenDark, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 32 }}>📷</Text></View>}
          <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' }}><Text style={{ color: C.white, fontSize: 10, fontWeight: '800' }}>AFTER</Text></View>
        </View>
      </View>
      <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '800', color: C.grey }}>{customer.name}</Text>
          <Text style={{ fontSize: 11, color: C.greyMid }}>{job.service} · HydroSeal Pavers</Text>
        </View>
        <View style={{ backgroundColor: C.greenLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: C.green }}>✓ DONE</Text>
        </View>
      </View>
    </View>
  );
  const CollageCard = () => (
    <View style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: C.white, borderWidth: 1, borderColor: C.border }}>
      <View style={{ height: 160, flexDirection: 'row', gap: 2 }}>
        <View style={{ flex: 2, backgroundColor: '#2D3748', justifyContent: 'flex-end', padding: 8 }}>
          {beforeUri && !beforeUri.startsWith('mock') ? <Image source={{ uri: beforeUri }} style={{ ...StyleSheet.absoluteFillObject }} resizeMode="cover" /> : <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 28 }}>📷</Text></View>}
          <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' }}><Text style={{ color: C.white, fontSize: 9, fontWeight: '800' }}>BEFORE</Text></View>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          {[afterPhotos[0], afterPhotos[1]].map((uri, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: C.green, justifyContent: 'flex-end', padding: 4 }}>
              {uri && !uri.startsWith('mock') ? <Image source={{ uri }} style={{ ...StyleSheet.absoluteFillObject }} resizeMode="cover" /> : <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: i === 0 ? C.green : C.greenDark, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 20 }}>📷</Text></View>}
              {i === 0 && <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, alignSelf: 'flex-start' }}><Text style={{ color: C.white, fontSize: 8, fontWeight: '800' }}>AFTER</Text></View>}
            </View>
          ))}
        </View>
      </View>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: C.grey }}>{customer.name} · {job.service}</Text>
        <Text style={{ fontSize: 11, color: C.greyMid }}>HydroSeal Pavers · {fmtDate(job.date)}</Text>
      </View>
    </View>
  );
  const StoryCard = () => (
    <View style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: C.greenDark, borderWidth: 1, borderColor: C.border }}>
      <View style={{ height: 100, backgroundColor: '#2D3748' }}>
        {beforeUri && !beforeUri.startsWith('mock') ? <Image source={{ uri: beforeUri }} style={{ width: '100%', height: 100 }} resizeMode="cover" /> : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 32 }}>📷</Text></View>}
        <View style={{ position: 'absolute', bottom: 6, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}><Text style={{ color: C.white, fontSize: 10, fontWeight: '800' }}>BEFORE</Text></View>
      </View>
      <View style={{ height: 2, backgroundColor: C.white }} />
      <View style={{ height: 100, backgroundColor: C.green }}>
        {afterUri && !afterUri.startsWith('mock') ? <Image source={{ uri: afterUri }} style={{ width: '100%', height: 100 }} resizeMode="cover" /> : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 32 }}>📷</Text></View>}
        <View style={{ position: 'absolute', bottom: 6, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}><Text style={{ color: C.white, fontSize: 10, fontWeight: '800' }}>AFTER</Text></View>
      </View>
      <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: C.white }}>{customer.name}</Text>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>HydroSeal Pavers</Text>
      </View>
    </View>
  );
  const CardPreview = () => { if (cardTemplate === 'split') return <SplitCard />; if (cardTemplate === 'collage') return <CollageCard />; return <StoryCard />; };

  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('ActiveJob', { job })} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Job Complete</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={{ color: C.white, fontSize: 20, fontWeight: '900', marginTop: 6 }}>{customer.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{job.service} · {fmtDate(job.date)}</Text>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 14, gap: 12 }}>
          <Text style={styles.sectionTitle}>AFTER PHOTOS</Text>
          <View style={[styles.card, { backgroundColor: C.greenDark, borderWidth: 0 }]}>
            {afterPhotos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {afterPhotos.map((uri, i) => (<View key={i} style={{ marginRight: 8 }}><PhotoBox uri={uri} size={64} /></View>))}
              </ScrollView>
            )}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => pickPhoto(true, addAfter)} style={{ flex: 1, backgroundColor: C.white, paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}><Text style={{ color: C.greenDark, fontSize: 13, fontWeight: '800' }}>📷 Camera</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => pickPhoto(false, addAfter)} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}><Text style={{ color: C.white, fontSize: 13, fontWeight: '700' }}>🖼 Photos</Text></TouchableOpacity>
              {afterPhotos.length > 0 && <TouchableOpacity onPress={() => setAfterPhotos([])} style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}><Text style={{ color: C.white, fontSize: 12, fontWeight: '700' }}>Retake</Text></TouchableOpacity>}
            </View>
          </View>
          <Text style={styles.sectionTitle}>CARD TEMPLATE</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[{ key: 'split', label: 'Split' }, { key: 'collage', label: 'Collage' }, { key: 'story', label: 'Story' }].map(t => (
              <TouchableOpacity key={t.key} onPress={() => setCardTemplate(t.key)} style={[styles.templateCard, cardTemplate === t.key && { borderColor: C.green, borderWidth: 2.5 }]}>
                <View style={{ flex: 1, overflow: 'hidden', borderRadius: 6, marginBottom: 4 }}>
                  {t.key === 'split' && <View style={{ flex: 1, flexDirection: 'row', gap: 1 }}><View style={{ flex: 1, backgroundColor: '#2D3748' }} /><View style={{ flex: 1, backgroundColor: C.green }} /></View>}
                  {t.key === 'collage' && <View style={{ flex: 1, flexDirection: 'row', gap: 1 }}><View style={{ flex: 2, backgroundColor: '#2D3748' }} /><View style={{ flex: 1, gap: 1 }}><View style={{ flex: 1, backgroundColor: C.green }} /><View style={{ flex: 1, backgroundColor: C.greenDark }} /></View></View>}
                  {t.key === 'story' && <View style={{ flex: 1, gap: 1 }}><View style={{ flex: 1, backgroundColor: '#2D3748' }} /><View style={{ flex: 1, backgroundColor: C.green }} /></View>}
                </View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: cardTemplate === t.key ? C.green : C.greyMid, textAlign: 'center' }}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>PREVIEW</Text>
          <CardPreview />
          <TouchableOpacity style={[styles.greenBtn, { paddingVertical: 18, marginTop: 4 }]} onPress={() => navigate('Invoice', { job, customer })}>
            <Text style={[styles.greenBtnText, { fontSize: 17 }]}>Send Card + Create Invoice</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Shares {cardTemplate} card · opens invoice next</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
      <BottomNav active="Jobs" navigate={navigate} />
    </SafeAreaView>
  );
};

// ─── INVOICE ──────────────────────────────────────────────────────────────────
const InvoiceScreen = ({ navigate, params }) => {
  const job = params?.job || MOCK_JOBS[2];
  const customer = MOCK_CUSTOMERS.find(c => c.id === job.customerId) || MOCK_CUSTOMERS[0];
  const [sending, setSending] = useState(false);
  const [payMethod, setPayMethod] = useState('card');
  const lineItems = [{ label: 'Paver Sealing', qty: job.sqft, unit: 'sq ft', rate: 1.50, total: job.sqft * 1.50 }];
  const total = lineItems.reduce((s, i) => s + i.total, 0);
  const handleSend = () => {
    setSending(true);
    const idx = MOCK_JOBS.findIndex(j => j.id === job.id);
    if (idx !== -1) MOCK_JOBS[idx] = { ...MOCK_JOBS[idx], status: 'paid' };
    setTimeout(() => { setSending(false); navigate('YouGotPaid', { job, customer, total }); }, 1200);
  };
  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Invoice" subtitle={`#INV-${job.id.toUpperCase()}`} onBack={() => navigate('ActiveJob', { job })} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.cardLabel}>BILL TO</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.grey }}>{customer.name}</Text>
              <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 2 }}>{customer.address}</Text>
              <Text style={{ fontSize: 12, color: C.greyMid }}>{customer.phone}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardLabel}>DATE</Text>
              <Text style={{ fontSize: 13, color: C.grey, fontWeight: '600' }}>{fmtDate(new Date().toISOString())}</Text>
              <Text style={[styles.cardLabel, { marginTop: 8 }]}>DUE</Text>
              <Text style={{ fontSize: 13, color: C.orange, fontWeight: '600' }}>Upon Receipt</Text>
            </View>
          </View>
        </Card>
        <Text style={styles.sectionTitle}>Services</Text>
        <Card>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <Text style={[styles.cardLabel, { flex: 1 }]}>DESCRIPTION</Text>
            <Text style={[styles.cardLabel, { width: 60, textAlign: 'right' }]}>QTY</Text>
            <Text style={[styles.cardLabel, { width: 55, textAlign: 'right' }]}>RATE</Text>
            <Text style={[styles.cardLabel, { width: 65, textAlign: 'right' }]}>TOTAL</Text>
          </View>
          {lineItems.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.border }}>
              <Text style={{ flex: 1, fontSize: 13, color: C.grey }}>{item.label}</Text>
              <Text style={{ width: 60, fontSize: 13, color: C.greyMid, textAlign: 'right' }}>{item.qty}</Text>
              <Text style={{ width: 55, fontSize: 13, color: C.greyMid, textAlign: 'right' }}>${item.rate}</Text>
              <Text style={{ width: 65, fontSize: 13, color: C.grey, fontWeight: '700', textAlign: 'right' }}>{fmtCurrency(item.total)}</Text>
            </View>
          ))}
          <View style={{ borderTopWidth: 2, borderTopColor: C.green, marginTop: 8, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.grey }}>Total Due</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.green }}>{fmtCurrency(total)}</Text>
          </View>
          <Text style={{ fontSize: 11, color: C.greyMid, marginTop: 4 }}>Florida: No sales tax on services</Text>
        </Card>
        <Text style={styles.sectionTitle}>Collect Payment Via</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {[{ key: 'card', label: '💳 Card', sub: 'Square' }, { key: 'cash', label: '💵 Cash', sub: 'Mark paid' }, { key: 'venmo', label: '📱 Venmo', sub: 'Send link' }, { key: 'check', label: '📝 Check', sub: 'Record' }].map(m => (
            <TouchableOpacity key={m.key} onPress={() => setPayMethod(m.key)} style={[styles.payMethodBtn, payMethod === m.key && { borderColor: C.green, backgroundColor: C.greenLight }]}>
              <Text style={{ fontSize: 16 }}>{m.label.split(' ')[0]}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: payMethod === m.key ? C.green : C.grey }}>{m.label.split(' ')[1]}</Text>
              <Text style={{ fontSize: 10, color: C.greyMid }}>{m.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Card style={{ backgroundColor: C.greenLight }}>
          <Text style={styles.cardLabel}>2-YEAR WARRANTY</Text>
          <Text style={{ fontSize: 13, color: C.grey }}>Trident Master Certified sealer. HOA-approved product. Warranty covers seal integrity under normal use.</Text>
        </Card>
        <TouchableOpacity style={[styles.greenBtn, sending && { opacity: 0.7 }]} onPress={handleSend} disabled={sending}>
          {sending ? <ActivityIndicator color={C.white} /> : <Text style={styles.greenBtnText}>📤 Send Invoice & Collect Payment</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.greenBtn, { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border }]}>
          <Text style={[styles.greenBtnText, { color: C.grey }]}>🖨 Preview PDF</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── YOU GOT PAID ─────────────────────────────────────────────────────────────
const YouGotPaidScreen = ({ navigate, params }) => {
  const job = params?.job || MOCK_JOBS[2];
  const customer = params?.customer || MOCK_CUSTOMERS[0];
  const total = params?.total || job.amount;
  const payDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const payTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    <SafeAreaView style={[styles.screenGreen, { backgroundColor: C.green }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 52, marginBottom: 16 }}>
          {['#FCD34D','#FCD34D','#22C55E','#22C55E','#FCD34D','#22C55E','#FCD34D'].map((col, i) => (
            <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: col, opacity: 0.9 }} />
          ))}
        </View>
        <View style={{ alignItems: 'center', paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 40, marginBottom: 4 }}>💰🎉</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 }}>YOU GOT PAID</Text>
          <Text style={{ fontSize: 52, fontWeight: '900', color: C.white, letterSpacing: -2, marginTop: 6 }}>{fmtCurrency(total)}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 6, textAlign: 'center' }}>{customer.name} · {job.service} · {fmtDate(job.date)}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' }} />
            <Text style={{ color: C.white, fontSize: 13, fontWeight: '600' }}>Follow-up schedule set · running in background</Text>
          </View>
        </View>
        <View style={{ backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: 28, padding: 20 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>PAYMENT CONFIRMED</Text>
          {[{ label: 'Amount', val: fmtCurrency(total), bold: true, color: C.green }, { label: 'Method', val: 'Square · Card' }, { label: 'Date', val: `${payDate} · ${payTime}` }].map((row, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: C.border }}>
              <Text style={{ fontSize: 14, color: C.greyMid }}>{row.label}</Text>
              <Text style={{ fontSize: 14, fontWeight: row.bold ? '800' : '600', color: row.color || C.grey }}>{row.val}</Text>
            </View>
          ))}
          <TouchableOpacity style={[styles.greenBtn, { marginTop: 20 }]} onPress={() => navigate('ReviewRequest', { job, customer })}>
            <Text style={styles.greenBtnText}>Back to Home</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>Schedule running silently in background</Text>
          </TouchableOpacity>
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


// ─── REVIEW REQUEST ───────────────────────────────────────────────────────────
const ReviewRequestScreen = ({ navigate, params }) => {
  const job = params?.job || MOCK_JOBS[2];
  const customer = params?.customer || MOCK_CUSTOMERS[0];
  const firstName = customer.name.split(' ')[0];
  const autoDate = (() => { const d = new Date(job.date); d.setDate(d.getDate() + 3); return fmtDate(d.toISOString()); })();
  const [channels, setChannels] = useState({ google: true, facebook: false, text: true });
  const [message, setMessage] = useState(`Hey ${firstName} — we really enjoyed working on your driveway. Would you mind leaving us a quick Google review? It means a lot to a small business like ours. Tap the link below — takes 30 seconds. 🙏`);
  const [editing, setEditing] = useState(false);
  const [sent, setSent] = useState(false);
  const toggleChannel = (k) => setChannels(prev => ({ ...prev, [k]: !prev[k] }));
  const CHANNELS = [{ key: 'google', label: 'Google', icon: '🔍' }, { key: 'facebook', label: 'Facebook', icon: '👥' }, { key: 'text', label: 'Text', icon: '📱' }];
  const channelSummary = Object.entries(channels).filter(([,v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(' + ');
  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      Alert.alert('✅ Review request sent!', `${customer.name} will receive it via ${channelSummary}.`, [{ text: 'Done', onPress: () => navigate('Home') }]);
      setSent(false);
    }, 800);
  };
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('YouGotPaid', { job, customer })} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <Text style={[styles.headerTitle, { flex: 1 }]}>Review Request</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: C.white, fontSize: 11, fontWeight: '700' }}>● Auto Day 3</Text>
          </View>
        </View>
        <Text style={{ color: C.white, fontSize: 20, fontWeight: '900', marginTop: 8 }}>{customer.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{job.service} · Paid {fmtDate(job.date)}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <Text style={{ color: C.white, fontSize: 11, fontWeight: '600' }}>Sends {autoDate}</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <Text style={{ color: C.white, fontSize: 11, fontWeight: '600' }}>Via {channelSummary}</Text>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ padding: 14 }}>
          <Text style={styles.sectionTitle}>SEND TO</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            {CHANNELS.map(ch => (
              <TouchableOpacity key={ch.key} onPress={() => toggleChannel(ch.key)} style={[styles.channelCard, channels[ch.key] && { borderColor: C.green, backgroundColor: C.greenLight }]}>
                <Text style={{ fontSize: 24, marginBottom: 4 }}>{ch.icon}</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: channels[ch.key] ? C.green : C.grey }}>{ch.label}</Text>
                <View style={[styles.channelCheck, channels[ch.key] && { backgroundColor: C.green, borderColor: C.green }]}>
                  {channels[ch.key] && <Text style={{ color: C.white, fontSize: 9, fontWeight: '900' }}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>MESSAGE</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 11, color: C.greyMid }}>Preset · Google review</Text>
              <TouchableOpacity onPress={() => setEditing(!editing)}><Text style={{ fontSize: 12, color: C.green, fontWeight: '700' }}>Edit</Text></TouchableOpacity>
            </View>
          </View>
          <TextInput style={[styles.input, { height: 130, textAlignVertical: 'top', lineHeight: 20, fontSize: 13, color: C.grey }]} multiline value={message} onChangeText={setMessage} editable={editing} />
          <TouchableOpacity style={[styles.greenBtn, { paddingVertical: 18, marginTop: 8 }, sent && { opacity: 0.6 }]} onPress={handleSend} disabled={sent}>
            {sent ? <ActivityIndicator color={C.white} /> : <>
              <Text style={[styles.greenBtnText, { fontSize: 17 }]}>Send Review Request Now</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>Or auto-fires {autoDate} · Day 3 from paid date</Text>
            </>}
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
      <BottomNav active="Home" navigate={navigate} />
    </SafeAreaView>
  );
};

// ─── FOLLOW-UP SCHEDULER ──────────────────────────────────────────────────────
const FollowUpSchedulerScreen = ({ navigate, params }) => {
  const customer = params?.customer || MOCK_CUSTOMERS[0];
  const jobDate = params?.jobDate || '2026-04-08';
  const [autoSet, setAutoSet] = useState(true);
  const [steps, setSteps] = useState([
    { id: 's1', day: 0, label: 'Thank you text', status: 'done', date: '2026-04-08', enabled: true },
    { id: 's2', day: 1, label: 'Before/after card', status: 'done', date: '2026-04-09', enabled: true },
    { id: 's3', day: 3, label: 'Google review request', status: 'next', date: '2026-04-11', enabled: true },
    { id: 's4', day: 30, label: 'Check-in text', status: 'queued', date: '2026-05-08', enabled: true },
    { id: 's5', day: 60, label: 'Neighbor campaign', status: 'queued', date: '2026-06-07', enabled: true },
    { id: 's6', day: 90, label: 'Rebook reminder', status: 'queued', date: '2026-07-07', enabled: true },
    { id: 's7', day: 365, label: 'Annual maintenance', status: 'queued', date: '2027-04-08', enabled: false },
  ]);
  const toggle = (id) => setSteps(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  const sent = steps.filter(s => s.status === 'done').length;
  const nextStep = steps.find(s => s.status === 'next');
  const scColor = (s) => ({ done: C.green, next: C.orange, queued: C.greyMid }[s] || C.greyMid);
  const scLabel = (s) => ({ done: 'Done', next: 'Next', queued: 'Queued' }[s] || s);
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home', { openMenu: true })} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <View style={{ flex: 1 }}><Text style={[styles.headerTitle, { fontSize: 20 }]}>Follow-Up Schedule</Text></View>
          <TouchableOpacity onPress={() => setAutoSet(v => !v)} style={{ backgroundColor: autoSet ? '#22C55E' : 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
            <Text style={{ color: C.white, fontSize: 12, fontWeight: '700' }}>{autoSet ? 'Auto-set' : 'Manual'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: C.white, fontSize: 22, fontWeight: '900', marginTop: 8 }}>{customer.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>Schedule started {fmtDate(jobDate)}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}><Text style={{ color: C.white, fontSize: 12, fontWeight: '600' }}>{steps.length} touchpoints</Text></View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}><Text style={{ color: C.white, fontSize: 12, fontWeight: '600' }}>{sent} sent</Text></View>
          {nextStep && <View style={{ backgroundColor: 'rgba(249,115,22,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}><Text style={{ color: '#FED7AA', fontSize: 12, fontWeight: '600' }}>Next {fmtDate(nextStep.date)}</Text></View>}
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 14 }}>
          <Text style={styles.sectionTitle}>FULL TIMELINE</Text>
          {steps.map((step, i) => (
            <View key={step.id} style={{ flexDirection: 'row', gap: 12, marginBottom: 4 }}>
              <View style={{ alignItems: 'center', width: 20 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: step.status === 'queued' && !step.enabled ? C.border : scColor(step.status), marginTop: 14, borderWidth: step.status === 'queued' ? 2 : 0, borderColor: scColor(step.status) }} />
                {i < steps.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: C.border, marginTop: 4 }} />}
              </View>
              <View style={[styles.card, { flex: 1, marginBottom: 8 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: C.greyMid, fontWeight: '600' }}>Day {step.day}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: step.enabled ? C.grey : C.greyMid, marginTop: 2 }}>{step.label}</Text>
                    <Text style={{ fontSize: 11, color: C.greyMid, marginTop: 2 }}>{fmtDate(step.date)} · {step.status === 'done' ? 'Sent' : step.status === 'next' ? 'Scheduled' : 'Queued'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ backgroundColor: scColor(step.status) + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: scColor(step.status) }}>{scLabel(step.status)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggle(step.id)}>
                      <View style={[{ width: 40, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center' }, step.enabled ? { backgroundColor: C.green } : { backgroundColor: C.greyMid }]}>
                        <View style={[{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.white }, step.enabled ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity style={[styles.greenBtn, { marginTop: 8 }]} onPress={() => Alert.alert('✅ Schedule saved!')}>
            <Text style={styles.greenBtnText}>Save Schedule</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>All changes apply immediately</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};


// ─── CUSTOMERS DUE ────────────────────────────────────────────────────────────
const CustomersDueScreen = ({ navigate }) => {
  const [done, setDone] = useState([]);
  const markDone = (id) => setDone(p => [...p, id]);
  const OVERDUE = [{ id: 'd1', name: 'Rita Lowe', service: 'Pool Deck', lastJob: 'Jan 8', days: 90 }, { id: 'd2', name: 'Bob Harmon', service: 'Paver Sealing', lastJob: 'Dec 12', days: 30 }];
  const DUE_NOW = [{ id: 'd3', name: 'Paul Hendricks', service: 'Walkway Seal', lastJob: 'Mar 14', days: 0 }];
  const DUE_7D = [{ id: 'd4', name: 'Carol Lange', service: 'Driveway Seal', lastJob: 'Mar 22', days: -5 }];
  const overdue = OVERDUE.filter(c => !done.includes(c.id));
  const dueNow = DUE_NOW.filter(c => !done.includes(c.id));
  const due7d = DUE_7D.filter(c => !done.includes(c.id));
  const ActionRow = ({ id }) => (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
      {['Text', 'Email', 'Both'].map(a => (<TouchableOpacity key={a} style={{ flex: 1, backgroundColor: C.greenLight, paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}><Text style={{ fontSize: 12, fontWeight: '700', color: C.green }}>{a}</Text></TouchableOpacity>))}
      <TouchableOpacity onPress={() => markDone(id)} style={{ flex: 1, backgroundColor: C.greyLight, paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}><Text style={{ fontSize: 12, fontWeight: '700', color: C.greyMid }}>Done</Text></TouchableOpacity>
    </View>
  );
  const CC = ({ c, badgeColor, badgeText }) => (
    <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: badgeColor, marginBottom: 10 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={[styles.avatar, { backgroundColor: badgeColor + '22' }]}><Text style={[styles.avatarText, { color: badgeColor }]}>{c.name.split(' ').map(n => n[0]).join('').slice(0,2)}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: C.grey }}>{c.name}</Text>
          <Text style={{ fontSize: 12, color: C.greyMid }}>{c.service} · Last job {c.lastJob}</Text>
        </View>
        <View style={{ backgroundColor: badgeColor + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}><Text style={{ fontSize: 11, fontWeight: '800', color: badgeColor }}>{badgeText}</Text></View>
      </View>
      <ActionRow id={c.id} />
    </View>
  );
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 18 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home', { openMenu: true })} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 24 }]}>Customers Due</Text>
            <Text style={styles.headerSub}>{overdue.length + dueNow.length + due7d.length} need attention</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {[{ label: 'Overdue', count: overdue.length, color: C.red }, { label: 'Due Now', count: dueNow.length, color: C.orange }, { label: 'Due in 7d', count: due7d.length, color: C.blue }].map(pill => (
            <View key={pill.label} style={{ flex: 1, backgroundColor: pill.color, borderRadius: 12, padding: 10, alignItems: 'center' }}>
              <Text style={{ color: C.white, fontSize: 22, fontWeight: '900' }}>{pill.count}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', marginTop: 2 }}>{pill.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 14 }}>
          {overdue.length > 0 && <>{<Text style={[styles.sectionTitle, { color: C.red }]}>OVERDUE · {overdue.length}</Text>}{overdue.map(c => <CC key={c.id} c={c} badgeColor={C.red} badgeText={`${c.days}d over`} />)}</>}
          {dueNow.length > 0 && <>{<Text style={[styles.sectionTitle, { color: C.orange }]}>DUE NOW · {dueNow.length}</Text>}{dueNow.map(c => <CC key={c.id} c={c} badgeColor={C.orange} badgeText="Due today" />)}</>}
          {due7d.length > 0 && <>{<Text style={[styles.sectionTitle, { color: C.blue }]}>DUE IN 7 DAYS · {due7d.length}</Text>}{due7d.map(c => <CC key={c.id} c={c} badgeColor={C.blue} badgeText="Due soon" />)}</>}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── REVENUE DASHBOARD ────────────────────────────────────────────────────────
const RevenueDashboardScreen = ({ navigate }) => {
  const [period, setPeriod] = useState('Month');
  const WEEKS = [{ label: 'W1', val: 1200 }, { label: 'W2', val: 2800 }, { label: 'W3', val: 4200 }, { label: 'W4', val: 3140 }];
  const maxW = Math.max(...WEEKS.map(w => w.val));
  const thisMonth = 11340;
  const unpaidJobs = MOCK_JOBS.filter(j => j.status === 'overdue' || j.status === 'pending');
  const unpaidTotal = unpaidJobs.reduce((s, j) => s + j.amount, 0);
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 14 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home', { openMenu: true })} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <View style={{ flex: 1 }}><Text style={[styles.headerTitle, { fontSize: 24 }]}>Revenue</Text></View>
          <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 2 }}>
            {['Day', 'Week', 'Month'].map(p => (
              <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={[{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }, period === p && { backgroundColor: C.white }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: period === p ? C.green : 'rgba(255,255,255,0.7)' }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' }}>This month</Text>
          <Text style={{ color: C.white, fontSize: 48, fontWeight: '900', letterSpacing: -2 }}>{fmtCurrency(thisMonth)}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>+18% vs last month · $9,610</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[{ label: 'Today', val: '$480' }, { label: 'This week', val: '$4,200' }, { label: 'Jobs paid', val: '8' }, { label: 'Unpaid', val: fmtCurrency(unpaidTotal), red: true }].map(k => (
            <View key={k.label} style={{ flex: 1, backgroundColor: k.red ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 8, alignItems: 'center' }}>
              <Text style={{ color: k.red ? '#FCA5A5' : C.white, fontSize: 13, fontWeight: '800' }}>{k.val}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, marginTop: 2 }}>{k.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 14 }}>
          <Text style={styles.sectionTitle}>THIS MONTH — WEEK BY WEEK</Text>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 8, justifyContent: 'space-between' }}>
              {WEEKS.map((w, i) => {
                const h = Math.max(10, (w.val / maxW) * 80);
                return (
                  <View key={w.label} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <View style={{ width: '100%', height: h, backgroundColor: i === 2 ? C.green : C.greenLight, borderRadius: 6 }} />
                    <Text style={{ fontSize: 10, color: i === 2 ? C.green : C.greyMid, fontWeight: i === 2 ? '700' : '400' }}>{w.label}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>UNPAID INVOICES</Text>
            <Text style={{ fontSize: 12, color: C.red, fontWeight: '700' }}>{fmtCurrency(unpaidTotal)} outstanding</Text>
          </View>
          {unpaidJobs.length === 0 ? <Card><Text style={{ color: C.greyMid, textAlign: 'center' }}>All invoices paid 🎉</Text></Card> : unpaidJobs.map(j => {
            const days = Math.floor((new Date() - new Date(j.date)) / 86400000);
            return (
              <View key={j.id} style={[styles.card, { marginBottom: 10 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.avatar, { backgroundColor: C.red + '22' }]}><Text style={[styles.avatarText, { color: C.red }]}>{j.customerName.split(' ').map(n=>n[0]).join('').slice(0,2)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.grey }}>{j.customerName}</Text>
                    <Text style={{ fontSize: 12, color: C.greyMid }}>{j.service} · {fmtDate(j.date)} · {days}d overdue</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: C.red }}>{fmtCurrency(j.amount)}</Text>
                </View>
                <TouchableOpacity style={[styles.greenBtn, { marginTop: 10, marginBottom: 0, paddingVertical: 8 }]} onPress={() => Alert.alert('Invoice resent!')}>
                  <Text style={[styles.greenBtnText, { fontSize: 13 }]}>📤 Resend Invoice</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};


// ─── NEW LEAD ─────────────────────────────────────────────────────────────────
const NewLeadScreen = ({ navigate }) => {
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [autoReply, setAutoReply] = useState(true);
  const [saved, setSaved] = useState(false);
  const [source, setSource] = useState('');
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const SOURCES = ['Google', 'Facebook', 'Nextdoor', 'Referral', 'Door Knock', 'Yard Sign', 'Other'];
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      Alert.alert('✅ Lead Saved!', `${form.name || 'New lead'} added.${autoReply ? '\n\nAuto-reply sent via text.' : ''}`, [{ text: 'Build Quote', onPress: () => navigate('QuoteBuilder') }, { text: 'Done', onPress: () => navigate('Home') }]);
      setSaved(false);
    }, 700);
  };
  return (
    <SafeAreaView style={styles.screen}>
      <Header title="New Lead" subtitle="Capture & auto-reply" onBack={() => navigate('Home')} />
      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setAutoReply(v => !v)} style={[styles.alertBanner, { borderLeftColor: autoReply ? C.green : C.border, backgroundColor: autoReply ? C.greenLight : C.greyLight }]}>
          <Text style={{ flex: 1, fontSize: 13, color: autoReply ? C.green : C.greyMid, fontWeight: '600' }}>{autoReply ? '✅ Auto-reply ON — text sends on save' : '○ Auto-reply OFF'}</Text>
          <Text style={{ fontSize: 12, color: C.greyMid }}>Tap to toggle</Text>
        </TouchableOpacity>
        {autoReply && (
          <Card style={{ backgroundColor: '#F0F4FF', borderLeftWidth: 3, borderLeftColor: C.blue, marginBottom: 10 }}>
            <Text style={styles.cardLabel}>AUTO-REPLY TEXT</Text>
            <Text style={{ fontSize: 13, color: C.grey, lineHeight: 18 }}>"Hi {form.name ? form.name.split(' ')[0] : '[Name]'}! Thanks for reaching out to HydroSeal. We'll get back to you within the hour with pricing. 🙏"</Text>
          </Card>
        )}
        {[{ key: 'name', label: 'Full Name', placeholder: 'Jane Smith', keyboard: 'default' }, { key: 'phone', label: 'Phone', placeholder: '(904) 555-0000', keyboard: 'phone-pad' }, { key: 'address', label: 'Property Address', placeholder: '123 Main St, Nocatee', keyboard: 'default' }].map(f => (
          <View key={f.key} style={{ marginBottom: 12 }}>
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <TextInput style={styles.input} placeholder={f.placeholder} placeholderTextColor={C.greyMid} keyboardType={f.keyboard} value={form[f.key]} onChangeText={v => upd(f.key, v)} />
          </View>
        ))}
        <Text style={styles.fieldLabel}>Lead Source</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {SOURCES.map(s => (<TouchableOpacity key={s} onPress={() => setSource(s)} style={[styles.filterChip, source === s && styles.filterChipActive, { marginBottom: 0 }]}><Text style={[styles.filterChipText, source === s && { color: C.white }]}>{s}</Text></TouchableOpacity>))}
        </ScrollView>
        <Text style={styles.fieldLabel}>Notes</Text>
        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top', marginBottom: 16 }]} placeholder="Paver type, size estimate, HOA restrictions..." placeholderTextColor={C.greyMid} multiline value={form.notes} onChangeText={v => upd('notes', v)} />
        <TouchableOpacity style={[styles.greenBtn, saved && { opacity: 0.6 }]} onPress={handleSave} disabled={saved}>
          {saved ? <ActivityIndicator color={C.white} /> : <Text style={styles.greenBtnText}>💾 Save Lead{autoReply ? ' & Send Auto-Reply' : ''}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.greenBtn, { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.green }]} onPress={() => navigate('QuoteBuilder')}>
          <Text style={[styles.greenBtnText, { color: C.green }]}>📝 Skip to Quote Builder</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── SPECIALS ─────────────────────────────────────────────────────────────────
const SpecialsScreen = ({ navigate }) => {
  const [sent, setSent] = useState([]);
  const CAMPAIGNS = [
    { id: 'c1', icon: '🌞', title: 'Summer Prep Special', tag: 'Seasonal', desc: 'Pre-summer sealing before the rain season. 10% off jobs booked by May 31.', target: 'All active clients', count: 24, color: C.orange, msg: "Hey [Name]! Summer rain season is coming fast. Book your paver sealing now and save 10%. Reply 'BOOK' and we'll get you scheduled. 🌞" },
    { id: 'c2', icon: '🏘', title: 'Neighbor Referral Blast', tag: 'Referral', desc: 'Send to clients who got work done 60+ days ago.', target: '60-day+ clients', count: 8, color: C.blue, msg: "Hi [Name]! Love how your pavers turned out? Send them our way — you'll both get $50 off. 🙏" },
    { id: 'c3', icon: '🎄', title: 'Holiday Curb Appeal', tag: 'Holiday', desc: 'December campaign — clean pavers before holiday gatherings.', target: 'All clients', count: 24, color: C.red, msg: "Hi [Name]! Hosting this holiday season? Let us make your pavers shine. Book December and save $75. 🎄" },
    { id: 'c4', icon: '📅', title: 'Annual Maintenance', tag: 'Anniversary', desc: 'Auto-sends on 1-year job anniversary.', target: 'Year-1 clients', count: 6, color: C.gold, msg: "Hi [Name]! It's been one year since we sealed your pavers. Time for a maintenance check! 📅" },
    { id: 'c5', icon: '❄️', title: 'Off-Season Rate', tag: 'Promo', desc: 'Jan–Feb discounted slots.', target: 'Leads + past clients', count: 18, color: C.greyMid, msg: "Hi [Name]! January is our best time for paver work. We're offering 10% off for Jan/Feb jobs. 🙏" },
  ];
  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Campaigns" subtitle="Specials & outreach" />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Card style={{ backgroundColor: C.green, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View><Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600' }}>TOTAL REACH</Text><Text style={{ color: C.white, fontSize: 30, fontWeight: '900', letterSpacing: -1 }}>24 clients</Text></View>
          <Text style={{ fontSize: 36 }}>📣</Text>
        </Card>
        <Text style={styles.sectionTitle}>Ready to Send</Text>
        {CAMPAIGNS.map(camp => {
          const isSent = sent.includes(camp.id);
          return (
            <View key={camp.id} style={[styles.followUpCard, isSent && { opacity: 0.5 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <View style={[styles.followUpIconLg, { backgroundColor: camp.color + '22' }]}><Text style={{ fontSize: 22 }}>{camp.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: C.grey }}>{camp.title}</Text>
                    <View style={{ backgroundColor: camp.color + '22', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 }}><Text style={{ fontSize: 10, color: camp.color, fontWeight: '700' }}>{camp.tag}</Text></View>
                  </View>
                  <Text style={{ fontSize: 12, color: C.greyMid, lineHeight: 16 }}>{camp.desc}</Text>
                  <Text style={{ fontSize: 12, color: C.green, fontWeight: '600', marginTop: 3 }}>→ {camp.target} · {camp.count} recipients</Text>
                </View>
              </View>
              <Card style={{ backgroundColor: '#F8F8F8', marginBottom: 10, padding: 10 }}><Text style={{ fontSize: 12, color: C.grey, lineHeight: 17 }}>{camp.msg}</Text></Card>
              {!isSent ? (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={[styles.greenBtn, { flex: 1, marginBottom: 0 }]} onPress={() => Alert.alert(`Send "${camp.title}"?`, `This will text ${camp.count} clients.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Send', onPress: () => setSent(s => [...s, camp.id]) }])}>
                    <Text style={[styles.greenBtnText, { fontSize: 14 }]}>📤 Send Campaign</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.greenBtn, { backgroundColor: C.greyLight, borderWidth: 1, borderColor: C.border, flex: 0, paddingHorizontal: 14, marginBottom: 0 }]}>
                    <Text style={[styles.greenBtnText, { color: C.grey, fontSize: 14 }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              ) : <Text style={{ color: C.green, fontWeight: '700', fontSize: 13 }}>✅ Sent to {camp.count} clients</Text>}
            </View>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
      <BottomNav active="Settings" navigate={navigate} />
    </SafeAreaView>
  );
};

// ─── REFERRAL TRACKING ────────────────────────────────────────────────────────
const ReferralTrackingScreen = ({ navigate }) => {
  const [neighborCampaign, setNeighborCampaign] = useState(true);
  const CHAINS = [
    { id: 'r1', referrer: 'Mike Thornton', referred: 'James Duval', service: 'Paver Sealing · $1,550', status: 'rewarded', ri: 'MT', ji: 'JD' },
    { id: 'r2', referrer: 'James Duval', referred: 'Carol Lange', service: 'Pool Deck · Quote sent', status: 'pending', ri: 'JD', ji: 'CL' },
    { id: 'r3', referrer: 'Paul Hendricks', referred: 'Dan Marsh', service: 'Walkway Seal · $400', status: 'rewarded', ri: 'PH', ji: 'DM' },
  ];
  const sCol = (s) => ({ rewarded: C.green, pending: C.orange }[s] || C.greyMid);
  const sLbl = (s) => ({ rewarded: 'Reward sent', pending: 'Pending' }[s] || s);
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 14 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home', { openMenu: true })} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <View style={{ flex: 1 }}><Text style={[styles.headerTitle, { fontSize: 24 }]}>Referrals</Text><Text style={styles.headerSub}>April 2026 · all time</Text></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
          {[{ val: 11, label: 'total refs' }, { val: 8, label: 'jobs closed' }, { val: '$400', label: 'rewards sent' }, { val: '$12.4k', label: 'rev from refs' }].map(k => (
            <View key={k.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 8, alignItems: 'center' }}>
              <Text style={{ color: C.white, fontSize: 16, fontWeight: '900' }}>{k.val}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 2, textAlign: 'center' }}>{k.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 14 }}>
          <Text style={styles.sectionTitle}>RECENT REFERRALS</Text>
          {CHAINS.map(c => (
            <View key={c.id} style={[styles.card, { marginBottom: 10 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <View style={[styles.avatar, { backgroundColor: C.greenLight, width: 32, height: 32 }]}><Text style={[styles.avatarText, { color: C.green, fontSize: 11 }]}>{c.ri}</Text></View>
                <Text style={{ fontSize: 16, color: C.greyMid }}>→</Text>
                <View style={[styles.avatar, { backgroundColor: C.greenLight, width: 32, height: 32 }]}><Text style={[styles.avatarText, { color: C.green, fontSize: 11 }]}>{c.ji}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: C.grey }}>{c.referrer} → {c.referred}</Text>
                  <Text style={{ fontSize: 12, color: C.greyMid }}>{c.service}</Text>
                </View>
                <View style={{ backgroundColor: sCol(c.status) + '22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}><Text style={{ fontSize: 11, fontWeight: '700', color: sCol(c.status) }}>{sLbl(c.status)}</Text></View>
              </View>
            </View>
          ))}
          <View style={[styles.card, { backgroundColor: C.greenDark, borderWidth: 0 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.white, fontSize: 14, fontWeight: '700' }}>Neighbor campaign</Text>
                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>"Know any neighbors who could use the same?"</Text>
              </View>
              <TouchableOpacity onPress={() => setNeighborCampaign(v => !v)}>
                <View style={[{ width: 44, height: 26, borderRadius: 13, padding: 2, justifyContent: 'center' }, neighborCampaign ? { backgroundColor: '#22C55E' } : { backgroundColor: C.greyMid }]}>
                  <View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.white }, neighborCampaign ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={[styles.greenBtn, { marginTop: 12 }]} onPress={() => Alert.alert('Invite sent!')}>
            <Text style={styles.greenBtnText}>📲 Invite a Client to Refer</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── MISSED CALL AUTO-TEXT ────────────────────────────────────────────────────
const MissedCallAutoTextScreen = ({ navigate }) => {
  const [active, setActive] = useState(true);
  const [toggles, setToggles] = useState({ afterRings: true, afterVoicemail: true, workHours: true, oncePerNumber: true });
  const [message, setMessage] = useState("Hey! Sorry I missed your call — I'm out on a job. I'll call you back within the hour. Want a free estimate? Reply YES and I'll text you a link. — HydroSeal Pavers 🌿");
  const [editMsg, setEditMsg] = useState(false);
  const tog = (k) => setToggles(t => ({ ...t, [k]: !t[k] }));
  const RULES = [
    { key: 'afterRings', label: 'Auto-text after 3 rings', desc: 'Fires if call goes unanswered', icon: '📞' },
    { key: 'afterVoicemail', label: 'Auto-text after voicemail', desc: 'Fires when voicemail ends', icon: '✉️' },
    { key: 'workHours', label: 'Work hours only', desc: '7 AM – 7 PM · Mon–Sat', icon: '🕐' },
    { key: 'oncePerNumber', label: 'Once per number', desc: "Don't double-text repeat callers", icon: '🔁' },
  ];
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Settings')} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <Text style={[styles.headerTitle, { flex: 1 }]}>Missed Call Auto-Text</Text>
          <View style={{ backgroundColor: active ? '#22C55E' : 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: C.white, fontSize: 11, fontWeight: '700' }}>{active ? 'Add-on · On' : 'Add-on · Off'}</Text>
          </View>
        </View>
        <Text style={{ color: C.white, fontSize: 28, fontWeight: '900', marginTop: 10 }}>Missed Call</Text>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Auto-text fires when you miss a call</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 14 }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600' }}>Add-on · billed monthly</Text>
            <Text style={{ color: C.white, fontSize: 28, fontWeight: '900', marginTop: 2 }}>$14/month</Text>
          </View>
          <TouchableOpacity onPress={() => setActive(v => !v)} style={{ backgroundColor: active ? 'rgba(255,255,255,0.2)' : C.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}>
            <Text style={{ color: active ? C.white : C.green, fontSize: 14, fontWeight: '800' }}>{active ? 'Deactivate' : 'Activate'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 14 }}>
          <Text style={styles.sectionTitle}>AUTO-TEXT RULES</Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {RULES.map((r, i) => (
              <View key={r.key}>
                {i > 0 && <View style={styles.qbDivider} />}
                <TouchableOpacity style={[styles.qbRow, { justifyContent: 'space-between' }]} onPress={() => tog(r.key)}>
                  <View style={[styles.settingsIcon, { backgroundColor: C.greenLight }]}><Text style={{ fontSize: 16 }}>{r.icon}</Text></View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.grey }}>{r.label}</Text>
                    <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 1 }}>{r.desc}</Text>
                  </View>
                  <View style={[{ width: 44, height: 26, borderRadius: 13, padding: 2, justifyContent: 'center' }, toggles[r.key] ? { backgroundColor: C.green } : { backgroundColor: C.greyMid }]}>
                    <View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.white }, toggles[r.key] ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]} />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>AUTO-REPLY MESSAGE</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 11, color: C.greyMid }}>Active preset</Text>
              <TouchableOpacity onPress={() => setEditMsg(v => !v)}><Text style={{ fontSize: 12, color: C.green, fontWeight: '700' }}>Edit</Text></TouchableOpacity>
            </View>
          </View>
          <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top', lineHeight: 19, fontSize: 13 }]} multiline value={message} onChangeText={setMessage} editable={editMsg} />
          <TouchableOpacity style={[styles.greenBtn, { marginTop: 12 }]} onPress={() => Alert.alert('✅ Settings saved!')}>
            <Text style={styles.greenBtnText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};


// ─── SCHEDULE SCREEN ──────────────────────────────────────────────────────────
const ScheduleScreen = ({ navigate }) => {
  const today = new Date();
  const [viewMode, setViewMode] = useState('5');
  const [selectedDate, setSelectedDate] = useState(today);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [eventType, setEventType] = useState('job');
  const [eventForm, setEventForm] = useState({ title: '', time: '', notes: '' });

  function fmtDateKey(d) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
  function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function getDaysInMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
  function getFirstDayOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1).getDay(); }
  function isToday(d) { return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); }
  function isSameDay(a, b) { return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear(); }

  const [events, setEvents] = useState({
    [fmtDateKey(today)]: [
      { id: 'e1', type: 'job', title: 'Mike Reynolds — Paver Sealing', time: '9:00 AM', color: '#22C55E' },
      { id: 'e2', type: 'apt', title: 'Sandra Ortiz — Quote Walkthrough', time: '2:00 PM', color: '#3B82F6' },
    ],
    [fmtDateKey(addDays(today, 1))]: [{ id: 'e3', type: 'job', title: 'Sarah Chen — Pressure Wash', time: '8:30 AM', color: '#22C55E' }],
    [fmtDateKey(addDays(today, 3))]: [
      { id: 'e4', type: 'apt', title: 'Dave Torres — Estimate', time: '11:00 AM', color: '#3B82F6' },
      { id: 'e5', type: 'followup', title: 'Brenda Walsh — Follow-up call', time: '3:00 PM', color: '#F97316' },
    ],
    [fmtDateKey(addDays(today, 5))]: [{ id: 'e6', type: 'job', title: 'Marcus Webb — Driveway Seal', time: '10:00 AM', color: '#22C55E' }],
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayEventsFor = (d) => events[fmtDateKey(d)] || [];
  const selectedEvents = dayEventsFor(selectedDate);

  const addEvent = () => {
    const key = fmtDateKey(selectedDate);
    const newEvent = { id: Date.now().toString(), type: eventType, title: eventForm.title || `New ${eventType}`, time: eventForm.time || '9:00 AM', notes: eventForm.notes, color: { job: '#22C55E', apt: '#3B82F6', followup: '#F97316', block: '#6B6B6B' }[eventType] };
    setEvents(prev => ({ ...prev, [key]: [...(prev[key] || []), newEvent] }));
    setEventForm({ title: '', time: '', notes: '' });
    setShowEventModal(false);
  };

  const typeLabel = { job: '🔨 Job', apt: '📋 Appointment', followup: '📞 Follow-up', block: '🚫 Block Off' };

  const renderMonthGrid = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d));
    return (
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          {dayNames.map(d => <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: C.greyMid }}>{d}</Text>)}
        </View>
        {Array.from({ length: Math.ceil(cells.length / 7) }, (_, wi) => (
          <View key={wi} style={{ flexDirection: 'row', marginBottom: 4 }}>
            {cells.slice(wi * 7, wi * 7 + 7).map((day, di) => {
              if (!day) return <View key={di} style={{ flex: 1 }} />;
              const hasEvents = dayEventsFor(day).length > 0;
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDay = isToday(day);
              return (
                <TouchableOpacity key={di} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }} onPress={() => { setSelectedDate(day); setShowDayModal(true); }}>
                  <View style={[{ width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }, isSelected && { backgroundColor: C.green }, isTodayDay && !isSelected && { borderWidth: 1.5, borderColor: C.green }]}>
                    <Text style={{ fontSize: 13, fontWeight: isSelected || isTodayDay ? '800' : '400', color: isSelected ? C.white : isTodayDay ? C.green : C.grey }}>{day.getDate()}</Text>
                  </View>
                  {hasEvents && <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>{dayEventsFor(day).slice(0, 3).map((e, ei) => <View key={ei} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: e.color }} />)}</View>}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderDayGrid = (includeWeekend) => {
    const startOfWeek = new Date(today);
    const dow = today.getDay();
    startOfWeek.setDate(today.getDate() + (dow === 0 ? -6 : 1 - dow));
    const days = Array.from({ length: includeWeekend ? 7 : 5 }, (_, i) => addDays(startOfWeek, i));
    return (
      <View>
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border }}>
          {days.map((d, i) => {
            const isTodayDay = isToday(d);
            const isSelected = isSameDay(d, selectedDate);
            return (
              <TouchableOpacity key={i} onPress={() => setSelectedDate(d)} style={[{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRightWidth: i < days.length - 1 ? 1 : 0, borderRightColor: C.border }, isSelected && { backgroundColor: C.greenLight }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: isTodayDay ? C.green : C.greyMid, marginBottom: 4 }}>{dayNames[d.getDay()]}</Text>
                <View style={[{ width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }, isSelected && { backgroundColor: C.green }, isTodayDay && !isSelected && { borderWidth: 2, borderColor: C.green }]}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isSelected ? C.white : isTodayDay ? C.green : C.grey }}>{d.getDate()}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 2, marginTop: 5, height: 6 }}>
                  {dayEventsFor(d).slice(0, 3).map((e, ei) => <View key={ei} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: e.color }} />)}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View>
          {['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM'].map((time, ti) => {
            const slotEvents = selectedEvents.filter(e => { const hr = parseInt(e.time); const isPM = e.time?.includes('PM') && hr !== 12; return (isPM ? hr + 12 : hr) === ti + 8; });
            return (
              <TouchableOpacity key={ti} onPress={() => { setEventForm(f => ({ ...f, time })); setShowEventModal(true); }} style={{ flexDirection: 'row', minHeight: 48, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }} activeOpacity={0.6}>
                <Text style={{ width: 44, fontSize: 10, color: C.greyMid, textAlign: 'right', paddingRight: 8, paddingTop: 6 }}>{time}</Text>
                <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: C.border, paddingLeft: 8, paddingTop: 4 }}>
                  {slotEvents.map(e => (
                    <View key={e.id} style={{ backgroundColor: e.color + '22', borderLeftWidth: 3, borderLeftColor: e.color, borderRadius: 6, padding: 6, marginBottom: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: e.color }}>{e.title}</Text>
                      <Text style={{ fontSize: 10, color: C.greyMid }}>{e.time}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 14 }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 26, letterSpacing: -0.5 }]}>Schedule</Text>
            <Text style={styles.headerSub}>{monthNames[today.getMonth()]} {today.getFullYear()}</Text>
          </View>
          <TouchableOpacity onPress={() => { setSelectedDate(new Date()); setShowEventModal(true); }} style={styles.headerActionBtn}>
            <Text style={{ color: C.white, fontSize: 22 }}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 3, marginTop: 12, gap: 2 }}>
          {[['5', 'M – F'], ['7', 'S – S'], ['month', 'Month']].map(([key, label]) => (
            <TouchableOpacity key={key} onPress={() => setViewMode(key)} style={[{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' }, viewMode === key && { backgroundColor: C.white }]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: viewMode === key ? C.green : 'rgba(255,255,255,0.75)' }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.white }} showsVerticalScrollIndicator={false}>
        {viewMode === 'month' ? (
          <View style={{ backgroundColor: C.white }}>
            {renderMonthGrid()}
            <View style={{ padding: 14, backgroundColor: C.greyLight }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{isToday(selectedDate) ? 'TODAY' : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}</Text>
                <TouchableOpacity onPress={() => setShowEventModal(true)}><Text style={{ color: C.green, fontSize: 13, fontWeight: '700' }}>+ Add</Text></TouchableOpacity>
              </View>
              {selectedEvents.length === 0 ? (
                <TouchableOpacity onPress={() => setShowEventModal(true)} style={{ backgroundColor: C.white, borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1.5, borderColor: C.border }}>
                  <Text style={{ color: C.greyMid, fontSize: 14, fontWeight: '600' }}>Nothing scheduled · Tap to add</Text>
                </TouchableOpacity>
              ) : selectedEvents.map(event => (
                <View key={event.id} style={[styles.eventCard, { borderLeftColor: event.color }]}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.grey }}>{event.title}</Text>
                  <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 2 }}>{event.time}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : renderDayGrid(viewMode === '7')}
        <View style={{ height: 24 }} />
      </ScrollView>
      <BottomNav active="Schedule" navigate={navigate} />

      <Modal visible={showEventModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '85%' }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add to {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>TYPE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {Object.entries(typeLabel).map(([key, label]) => (
                <TouchableOpacity key={key} onPress={() => setEventType(key)} style={[{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white }, eventType === key && { borderColor: C.green, backgroundColor: C.greenLight }]}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: eventType === key ? C.green : C.grey }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Title / Client</Text>
            <TextInput style={[styles.input, { marginBottom: 10 }]} placeholder="Client name or event" placeholderTextColor={C.greyMid} value={eventForm.title} onChangeText={v => setEventForm(f => ({ ...f, title: v }))} />
            <Text style={styles.fieldLabel}>Time</Text>
            <TextInput style={[styles.input, { marginBottom: 10 }]} placeholder="9:00 AM" placeholderTextColor={C.greyMid} value={eventForm.time} onChangeText={v => setEventForm(f => ({ ...f, time: v }))} />
            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput style={[styles.input, { marginBottom: 16, height: 60, textAlignVertical: 'top' }]} placeholder="Access info, scope, reminders..." placeholderTextColor={C.greyMid} multiline value={eventForm.notes} onChangeText={v => setEventForm(f => ({ ...f, notes: v }))} />
            <TouchableOpacity style={styles.greenBtn} onPress={addEvent}><Text style={styles.greenBtnText}>Add to Schedule</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.greenBtn, { backgroundColor: C.greyLight, marginTop: 0 }]} onPress={() => setShowEventModal(false)}><Text style={[styles.greenBtnText, { color: C.grey }]}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showDayModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '70%' }]}>
            <View style={styles.modalHandle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.modalTitle}>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
              <TouchableOpacity onPress={() => setShowDayModal(false)}><Text style={{ fontSize: 20, color: C.greyMid }}>✕</Text></TouchableOpacity>
            </View>
            {dayEventsFor(selectedDate).length === 0 ? <Text style={{ color: C.greyMid, textAlign: 'center', padding: 20 }}>Nothing scheduled</Text> : dayEventsFor(selectedDate).map(event => (
              <View key={event.id} style={[styles.eventCard, { borderLeftColor: event.color }]}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.grey }}>{event.title}</Text>
                <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 2 }}>{event.time}</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.greenBtn, { marginTop: 12 }]} onPress={() => { setShowDayModal(false); setShowEventModal(true); }}><Text style={styles.greenBtnText}>+ Add to This Day</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── LEADS SCREEN ─────────────────────────────────────────────────────────────
const LeadsScreen = ({ navigate }) => {
  const LEADS = [
    { id: 'l1', name: 'Sandra Ortiz', phone: '(904) 555-0199', address: '22 Pinecrest Ln, Nocatee', time: 'Today 8:14 AM', source: 'Website form', notes: 'Interested in full driveway + patio seal', status: 'hot' },
    { id: 'l2', name: 'Carlos Mendez', phone: '(904) 555-0312', address: '88 Riverbend Dr, St Johns', time: 'Yesterday 3:45 PM', source: 'Facebook', notes: 'Saw our ad — wants estimate for backyard pavers', status: 'warm' },
    { id: 'l3', name: 'Tanya Brooks', phone: '(904) 555-0441', address: '14 Osprey Ct, Fleming Island', time: '2 days ago', source: 'Nextdoor', notes: 'Neighbor referral from Sarah Chen', status: 'warm' },
  ];
  const statusCol = (s) => ({ hot: C.red, warm: C.orange, cold: C.blue }[s] || C.greyMid);
  const statusLbl = (s) => ({ hot: '🔥 Hot', warm: '🌤 Warm', cold: '❄️ Cold' }[s] || s);
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 18 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home', { openMenu: true })} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 24 }]}>Leads</Text>
            <Text style={styles.headerSub}>{LEADS.length} need a call</Text>
          </View>
          <TouchableOpacity onPress={() => navigate('NewCustomer')} style={styles.headerActionBtn}><Text style={{ color: C.white, fontSize: 22 }}>+</Text></TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={LEADS}
        keyExtractor={i => i.id}
        style={{ backgroundColor: C.greyLight }}
        contentContainerStyle={{ padding: 14 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: statusCol(item.status) }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.grey }}>{item.name}</Text>
              <View style={{ backgroundColor: statusCol(item.status) + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: statusCol(item.status) }}>{statusLbl(item.status)}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: C.greyMid, marginBottom: 2 }}>{item.address}</Text>
            <Text style={{ fontSize: 12, color: C.greyMid, marginBottom: 6 }}>{item.time} · {item.source}</Text>
            {item.notes ? <Text style={{ fontSize: 13, color: C.grey, fontStyle: 'italic', marginBottom: 10 }}>"{item.notes}"</Text> : null}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[styles.greenBtn, { flex: 1, marginBottom: 0, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', gap: 6 }]}>
                <Text style={styles.greenBtnText}>📞 Call {item.name.split(' ')[0]}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.greenBtn, { flex: 1, marginBottom: 0, paddingVertical: 10, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.green }]} onPress={() => navigate('QuoteBuilder')}>
                <Text style={[styles.greenBtnText, { color: C.green, fontSize: 14 }]}>📝 Quote</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <BottomNav active="Home" navigate={navigate} />
    </SafeAreaView>
  );
};


// ─── BUSINESS SETUP ───────────────────────────────────────────────────────────
const BusinessSetupScreen = ({ navigate }) => {
  const [biz, setBiz] = useState({ ...BIZ_CONFIG });
  const [saved, setSaved] = useState(false);
  const upd = (k, v) => setBiz(b => ({ ...b, [k]: v }));
  const handleLogoUpload = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') { Alert.alert('Photos needed', 'Allow photo access in Settings.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.9, allowsEditing: true, aspect: [4, 1] });
      if (!result.canceled && result.assets?.[0]) upd('logo', result.assets[0].uri);
    } catch {
      Alert.alert('Logo upload', 'Opens your photo library on a real device.', [
        { text: 'Simulate', onPress: () => upd('logo', 'mock_logo') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };
  const handleSave = () => { Object.assign(BIZ_CONFIG, biz); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 14 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home', { openMenu: true })} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 22 }]}>Business Setup</Text>
            <Text style={styles.headerSub}>Name, logo, contact, rates</Text>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} contentContainerStyle={{ padding: 14 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>LOGO</Text>
        <TouchableOpacity onPress={handleLogoUpload} style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
          <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: C.greenLight, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            {biz.logo && !biz.logo.startsWith('mock') ? <Image source={{ uri: biz.logo }} style={{ width: 64, height: 64 }} resizeMode="contain" /> : <Text style={{ fontSize: 28 }}>{biz.logo ? '✅' : '🏢'}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.grey }}>{biz.logo ? 'Logo uploaded' : 'Upload your logo'}</Text>
            <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 2 }}>Shows on quotes, invoices & cards</Text>
          </View>
          <Text style={{ color: C.green, fontSize: 13, fontWeight: '600' }}>{biz.logo ? 'Change' : 'Upload'}</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>BUSINESS INFO</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { key: 'name', label: 'Business Name', placeholder: 'HydroSeal Pavers', icon: '🏢' },
            { key: 'phone', label: 'Phone', placeholder: '(904) 555-0100', icon: '📞', keyboard: 'phone-pad' },
            { key: 'email', label: 'Email', placeholder: 'info@yourco.com', icon: '✉️', keyboard: 'email-address' },
            { key: 'defaultRate', label: 'Default Rate ($/sq ft)', placeholder: '1.50', icon: '💲', keyboard: 'decimal-pad' },
          ].map((f, i) => (
            <View key={f.key}>
              {i > 0 && <View style={styles.qbDivider} />}
              <View style={styles.qbRow}>
                <View style={styles.qbRowIcon}><Text style={{ fontSize: 15 }}>{f.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.qbRowLabel}>{f.label}</Text>
                  <TextInput style={styles.qbRowValue} value={biz[f.key]} onChangeText={v => upd(f.key, v)} placeholder={f.placeholder} placeholderTextColor={C.greyMid} keyboardType={f.keyboard || 'default'} />
                </View>
              </View>
            </View>
          ))}
        </Card>
        <Text style={styles.sectionTitle}>WARRANTY TEXT</Text>
        <TextInput style={[styles.input, { height: 72, textAlignVertical: 'top', marginBottom: 12 }]} multiline value={biz.warranty} onChangeText={v => upd('warranty', v)} placeholder="e.g. 2-year warranty..." placeholderTextColor={C.greyMid} />
        <Text style={styles.sectionTitle}>ADD-ONS</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { key: 'referralEnabled', label: 'Referral Program', price: 'Free', desc: 'Client earns rewards for referrals' },
            { key: 'careProgram', label: 'Care Program', price: '$9/mo', desc: 'Annual maintenance subscription' },
            { key: 'holidayCampaigns', label: 'Holiday Campaigns', price: '$5/mo', desc: 'Auto seasonal outreach' },
            { key: 'missedCallAutoText', label: 'Missed Call Auto-Text', price: '$14/mo', desc: 'Auto-text fires when you miss a call' },
          ].map((t, i) => (
            <View key={t.key}>
              {i > 0 && <View style={styles.qbDivider} />}
              <TouchableOpacity style={[styles.qbRow, { justifyContent: 'space-between', alignItems: 'center' }]} onPress={() => t.key === 'missedCallAutoText' ? navigate('MissedCallAutoText') : upd(t.key, !biz[t.key])}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.grey }}>{t.label}</Text>
                    <View style={{ backgroundColor: biz[t.key] ? C.greenLight : C.greyLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: biz[t.key] ? C.green : C.greyMid }}>{t.price}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 2 }}>{t.desc}</Text>
                </View>
                {t.key === 'missedCallAutoText' ? <Text style={{ color: C.greyMid, fontSize: 18 }}>›</Text> : (
                  <View style={[{ width: 44, height: 26, borderRadius: 13, padding: 2, justifyContent: 'center' }, biz[t.key] ? { backgroundColor: C.green } : { backgroundColor: C.greyMid }]}>
                    <View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.white }, biz[t.key] ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </Card>
        <TouchableOpacity style={[styles.greenBtn, { marginTop: 16 }]} onPress={handleSave}>
          <Text style={styles.greenBtnText}>{saved ? '✅ Saved!' : 'Save Changes'}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── SOCIAL SETUP ─────────────────────────────────────────────────────────────
const SocialSetupScreen = ({ navigate }) => {
  const [social, setSocial] = useState({ gbpLink: BIZ_CONFIG.gbpLink || '', instagramHandle: BIZ_CONFIG.instagramHandle || '', facebookPage: BIZ_CONFIG.facebookPage || '', nextdoorProfile: '', googleReviewDefault: true, facebookReviewDefault: false, autoReviewDay: '3' });
  const upd = (k, v) => setSocial(s => ({ ...s, [k]: v }));
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 14 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home', { openMenu: true })} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 22 }]}>Social Setup</Text>
            <Text style={styles.headerSub}>Links for reviews & campaigns</Text>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} contentContainerStyle={{ padding: 14 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>PROFILE LINKS</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { key: 'gbpLink', label: 'Google Business Profile', placeholder: 'https://g.page/yourpage', icon: '🔍' },
            { key: 'facebookPage', label: 'Facebook Page', placeholder: 'https://facebook.com/yourpage', icon: '👥' },
            { key: 'instagramHandle', label: 'Instagram Handle', placeholder: '@yourhandle', icon: '📸' },
            { key: 'nextdoorProfile', label: 'Nextdoor Profile', placeholder: 'https://nextdoor.com/...', icon: '🏘' },
          ].map((f, i) => (
            <View key={f.key}>
              {i > 0 && <View style={styles.qbDivider} />}
              <View style={styles.qbRow}>
                <View style={styles.qbRowIcon}><Text style={{ fontSize: 15 }}>{f.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.qbRowLabel}>{f.label}</Text>
                  <TextInput style={[styles.qbRowValue, { fontSize: 13 }]} value={social[f.key]} onChangeText={v => upd(f.key, v)} placeholder={f.placeholder} placeholderTextColor={C.greyMid} autoCapitalize="none" keyboardType="url" />
                </View>
              </View>
            </View>
          ))}
        </Card>
        <Text style={styles.sectionTitle}>REVIEW REQUEST DEFAULTS</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {[{ key: 'googleReviewDefault', label: 'Default: Send to Google', desc: 'Pre-checked on review request screen' }, { key: 'facebookReviewDefault', label: 'Default: Send to Facebook', desc: 'Pre-checked on review request screen' }].map((t, i) => (
            <View key={t.key}>
              {i > 0 && <View style={styles.qbDivider} />}
              <TouchableOpacity style={[styles.qbRow, { justifyContent: 'space-between' }]} onPress={() => upd(t.key, !social[t.key])}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.grey }}>{t.label}</Text>
                  <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 2 }}>{t.desc}</Text>
                </View>
                <View style={[{ width: 44, height: 26, borderRadius: 13, padding: 2, justifyContent: 'center' }, social[t.key] ? { backgroundColor: C.green } : { backgroundColor: C.greyMid }]}>
                  <View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.white }, social[t.key] ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]} />
                </View>
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.qbDivider} />
          <View style={styles.qbRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.grey }}>Auto-fire review request</Text>
              <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 2 }}>Days after payment to send automatically</Text>
            </View>
            <View style={[styles.accordionInput, { minWidth: 70 }]}>
              <TextInput style={[styles.accordionInputField, { minWidth: 30 }]} value={social.autoReviewDay} onChangeText={v => upd('autoReviewDay', v)} keyboardType="numeric" />
              <Text style={{ color: C.greyMid, fontSize: 12 }}>days</Text>
            </View>
          </View>
        </Card>
        <TouchableOpacity style={[styles.greenBtn, { marginTop: 16 }]} onPress={() => { Object.assign(BIZ_CONFIG, { gbpLink: social.gbpLink, instagramHandle: social.instagramHandle, facebookPage: social.facebookPage }); Alert.alert('✅ Saved!'); }}>
          <Text style={styles.greenBtnText}>Save Social Setup</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── HOLIDAY CAMPAIGNS ────────────────────────────────────────────────────────
const HolidayCampaignsScreen = ({ navigate }) => {
  const [campaigns, setCampaigns] = useState([
    { id: 'hc1', name: 'Spring Kickoff', month: 'March', enabled: true, msg: 'Spring is here! Get your pavers sealed before the summer rush. Book now and save 10%.' },
    { id: 'hc2', name: 'Summer Prep', month: 'May', enabled: true, msg: 'Summer rain is coming. Is your sealant ready? Book before June and save.' },
    { id: 'hc3', name: 'Holiday Curb Appeal', month: 'November', enabled: true, msg: 'Hosting this holiday season? Let us make your pavers shine before guests arrive.' },
    { id: 'hc4', name: 'New Year Special', month: 'January', enabled: false, msg: 'Start the new year fresh. Book a January seal job and save $75.' },
    { id: 'hc5', name: 'Back to School', month: 'August', enabled: false, msg: 'Summer winding down? Perfect time for a paver seal before fall.' },
  ]);
  const toggle = (id) => setCampaigns(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 14 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home', { openMenu: true })} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 22 }]}>Holiday Campaigns</Text>
            <Text style={styles.headerSub}>Auto-send seasonal outreach</Text>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} contentContainerStyle={{ padding: 14 }} showsVerticalScrollIndicator={false}>
        <Card style={{ backgroundColor: C.greenLight, marginBottom: 14 }}>
          <Text style={{ fontSize: 13, color: C.green, fontWeight: '600', lineHeight: 18 }}>📅 Enabled campaigns auto-send to all active clients on the 1st of that month. Toggle on/off anytime.</Text>
        </Card>
        {campaigns.map(c => (
          <View key={c.id} style={[styles.card, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: C.grey }}>{c.name}</Text>
                <Text style={{ fontSize: 12, color: C.greyMid }}>Sends in {c.month}</Text>
              </View>
              <TouchableOpacity onPress={() => toggle(c.id)}>
                <View style={[{ width: 44, height: 26, borderRadius: 13, padding: 2, justifyContent: 'center' }, c.enabled ? { backgroundColor: C.green } : { backgroundColor: C.greyMid }]}>
                  <View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.white }, c.enabled ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]} />
                </View>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: C.grey, fontStyle: 'italic', lineHeight: 17 }}>"{c.msg}"</Text>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── NOTIFICATION SETTINGS ────────────────────────────────────────────────────
const NotificationSettingsScreen = ({ navigate }) => {
  const [notifs, setNotifs] = useState({ newLead: true, missedCall: true, jobReminder: true, followUpDue: true, quoteExpiring: true, reviewReceived: true, paymentReceived: true });
  const toggle = (k) => setNotifs(n => ({ ...n, [k]: !n[k] }));
  const NOTIF_ITEMS = [
    { key: 'newLead', label: 'New Lead', desc: 'Form submission or missed call' },
    { key: 'missedCall', label: 'Missed Call', desc: 'When a call goes unanswered' },
    { key: 'jobReminder', label: 'Job Reminder', desc: '1 hour before scheduled job' },
    { key: 'followUpDue', label: 'Follow-Up Due', desc: 'When a client touchpoint fires' },
    { key: 'quoteExpiring', label: 'Quote Expiring', desc: '3 days before 30-day expiry' },
    { key: 'reviewReceived', label: 'Review Received', desc: 'New Google or Facebook review' },
    { key: 'paymentReceived', label: 'Payment Received', desc: 'Invoice paid confirmation' },
  ];
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={[styles.header, { paddingBottom: 14 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('Home', { openMenu: true })} style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 22 }]}>Notifications</Text>
            <Text style={styles.headerSub}>Alerts & reminders</Text>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} contentContainerStyle={{ padding: 14 }} showsVerticalScrollIndicator={false}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {NOTIF_ITEMS.map((item, i) => (
            <View key={item.key}>
              {i > 0 && <View style={styles.qbDivider} />}
              <TouchableOpacity style={[styles.qbRow, { justifyContent: 'space-between' }]} onPress={() => toggle(item.key)}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.grey }}>{item.label}</Text>
                  <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 2 }}>{item.desc}</Text>
                </View>
                <View style={[{ width: 44, height: 26, borderRadius: 13, padding: 2, justifyContent: 'center' }, notifs[item.key] ? { backgroundColor: C.green } : { backgroundColor: C.greyMid }]}>
                  <View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.white }, notifs[item.key] ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]} />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </Card>
        <TouchableOpacity style={[styles.greenBtn, { marginTop: 16 }]} onPress={() => Alert.alert('✅ Notification preferences saved!')}>
          <Text style={styles.greenBtnText}>Save Preferences</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};


// ─── MEASURE ENTRY SCREEN ─────────────────────────────────────────────────────
const MeasureEntryScreen = ({ navigate, params }) => {
  const customer = params?.customer;
  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('QuoteBuilder', { customer })} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 20 }]}>Tap to Measure</Text>
            <Text style={styles.headerSub}>Choose your measurement method</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: C.greyLight }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {customer && (
          <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }]}>
            <Text style={{ fontSize: 24 }}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.grey }}>{customer.name}</Text>
              <Text style={{ fontSize: 12, color: C.greyMid }}>{customer.address}</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>SELECT METHOD</Text>

        {/* Satellite Trace */}
        <TouchableOpacity
          style={[styles.card, { borderWidth: 2, borderColor: C.green, marginBottom: 14 }]}
          onPress={() => navigate('MeasureSatellite', { customer })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: C.greenLight, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 28 }}>🛰</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: C.grey }}>Satellite Trace</Text>
              <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 2 }}>Tap corners on satellite map · most accurate</Text>
            </View>
            <View style={{ backgroundColor: C.green, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
              <Text style={{ color: C.white, fontSize: 12, fontWeight: '700' }}>Best</Text>
            </View>
          </View>
          <View style={{ backgroundColor: C.greenLight, borderRadius: 10, padding: 12 }}>
            {['Works anywhere with internet', 'Drag flags to fine-tune corners', 'Auto-calculates sq ft from GPS coords', 'Prefills Quote Builder instantly'].map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: i < 3 ? 6 : 0 }}>
                <Text style={{ color: C.green, fontSize: 12, fontWeight: '700' }}>✓</Text>
                <Text style={{ fontSize: 12, color: C.grey }}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={{ backgroundColor: C.green, borderRadius: 10, padding: 14, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ color: C.white, fontSize: 15, fontWeight: '800' }}>Open Satellite Map →</Text>
          </View>
        </TouchableOpacity>

        {/* Camera Tap Mode */}
        <TouchableOpacity
          style={[styles.card, { borderWidth: 2, borderColor: C.orange + '88', marginBottom: 14 }]}
          onPress={() => navigate('MeasureCamera', { customer })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 28 }}>📷</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: C.grey }}>Camera Tap Mode</Text>
              <Text style={{ fontSize: 12, color: C.greyMid, marginTop: 2 }}>Point camera at surface · tap corners</Text>
            </View>
            <View style={{ backgroundColor: C.orange, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
              <Text style={{ color: C.white, fontSize: 12, fontWeight: '700' }}>On-site</Text>
            </View>
          </View>
          <View style={{ backgroundColor: '#FFF3E0', borderRadius: 10, padding: 12 }}>
            {['Works on-site without internet', 'Tap corners in live camera view', 'Enter one known reference length', 'Calculates area via pixel ratio'].map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: i < 3 ? 6 : 0 }}>
                <Text style={{ color: C.orange, fontSize: 12, fontWeight: '700' }}>✓</Text>
                <Text style={{ fontSize: 12, color: C.grey }}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={{ backgroundColor: C.orange, borderRadius: 10, padding: 14, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ color: C.white, fontSize: 15, fontWeight: '800' }}>Open Camera →</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── MEASURE SATELLITE SCREEN ─────────────────────────────────────────────────
// NOTE: requires react-native-maps (bundled in Expo Go on Android — no install needed)
// import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
// For Snack preview: renders a placeholder when MapView unavailable
const MeasureSatelliteScreen = ({ navigate, params }) => {
  const customer = params?.customer;
  const AREA_TYPES = ['Driveway', 'Pool Deck', 'Patio', 'Walkway'];
  const [areaType, setAreaType] = useState('Driveway');
  const [flags, setFlags] = useState([]);
  const [sqft, setSqft] = useState(null);
  const [notes, setNotes] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  // Default center: Nocatee, FL
  const DEFAULT_REGION = { latitude: 30.1087, longitude: -81.4255, latitudeDelta: 0.002, longitudeDelta: 0.002 };

  const handleMapPress = (e) => {
    if (flags.length >= 12) return;
    const coord = e.nativeEvent.coordinate;
    setFlags(prev => [...prev, coord]);
    setSqft(null);
  };

  const calcArea = () => {
    if (flags.length < 3) { Alert.alert('Need at least 3 points', 'Tap the map to place corner flags.'); return; }
    const m2 = polygonAreaSqMeters(flags);
    const ft2 = Math.round(sqMetersToSqFt(m2));
    setSqft(ft2);
  };

  const handleSaveToQuote = () => {
    if (!sqft) { Alert.alert('Calculate area first', 'Tap "Finish Area" to calculate sq ft.'); return; }
    navigate('QuoteBuilder', {
      customer,
      measuredSurface: areaType,
      measuredSqft: sqft,
      measuredFlags: flags,
      measuredNotes: notes,
      measuredService: areaTypeToService(areaType),
    });
  };

  let MapView, Marker, Polygon;
  let mapAvailable = false;
  try {
    const rn_maps = require('react-native-maps');
    MapView = rn_maps.default;
    Marker = rn_maps.Marker;
    Polygon = rn_maps.Polygon;
    mapAvailable = true;
  } catch {}

  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('MeasureEntry', { customer })} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 18 }]}>Satellite Trace</Text>
            <Text style={styles.headerSub}>{flags.length} flags placed{sqft ? ` · ${fmtSqFt(sqft)}` : ''}</Text>
          </View>
          {flags.length > 0 && (
            <TouchableOpacity onPress={() => { setFlags([]); setSqft(null); }} style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
              <Text style={{ color: C.white, fontSize: 12, fontWeight: '700' }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Area type chips */}
      <View style={{ backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', gap: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
        {AREA_TYPES.map(t => (
          <TouchableOpacity key={t} onPress={() => setAreaType(t)} style={[styles.filterChip, areaType === t && styles.filterChipActive, { marginRight: 0 }]}>
            <Text style={[styles.filterChipText, areaType === t && { color: C.white }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map area */}
      <View style={{ flex: 1, position: 'relative' }}>
        {mapAvailable ? (
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            mapType="satellite"
            initialRegion={DEFAULT_REGION}
            onPress={handleMapPress}
            onMapReady={() => setMapReady(true)}
          >
            {flags.map((coord, i) => (
              <Marker
                key={i}
                coordinate={coord}
                draggable
                onDragEnd={(e) => {
                  const newCoords = [...flags];
                  newCoords[i] = e.nativeEvent.coordinate;
                  setFlags(newCoords);
                  setSqft(null);
                }}
                pinColor={i === 0 ? 'lime' : 'orange'}
              />
            ))}
            {flags.length >= 3 && (
              <Polygon
                coordinates={flags}
                fillColor="rgba(45,106,34,0.25)"
                strokeColor="#2D6A22"
                strokeWidth={2}
              />
            )}
          </MapView>
        ) : (
          /* Fallback when react-native-maps not available (web Snack) */
          <View style={{ flex: 1, backgroundColor: '#1a2a1a', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🛰</Text>
            <Text style={{ color: C.white, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>Satellite Map</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              React Native Maps renders here on a physical device or Android Expo Go.{'\n\n'}
              Tap the simulate button below to test the flow.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: C.green, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 }}
              onPress={() => { setFlags([{ latitude: 30.109, longitude: -81.426 }, { latitude: 30.109, longitude: -81.425 }, { latitude: 30.1085, longitude: -81.425 }, { latitude: 30.1085, longitude: -81.426 }]); setSqft(850); }}
            >
              <Text style={{ color: C.white, fontSize: 14, fontWeight: '800' }}>Simulate 850 sq ft Driveway</Text>
            </TouchableOpacity>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 12, textAlign: 'center' }}>
              Install: npx expo install react-native-maps
            </Text>
          </View>
        )}

        {/* Instruction overlay */}
        {mapAvailable && flags.length === 0 && (
          <View style={{ position: 'absolute', top: 12, left: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 20 }}>👆</Text>
            <Text style={{ color: C.white, fontSize: 13, fontWeight: '600', flex: 1 }}>Tap corners of the {areaType.toLowerCase()} to place flags</Text>
          </View>
        )}

        {/* Undo button */}
        {flags.length > 0 && (
          <TouchableOpacity
            onPress={() => { setFlags(prev => prev.slice(0, -1)); setSqft(null); }}
            style={{ position: 'absolute', top: 12, right: 16, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
          >
            <Text style={{ color: C.white, fontSize: 13, fontWeight: '700' }}>↩ Undo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom controls */}
      <View style={{ backgroundColor: C.white, padding: 14, gap: 10, borderTopWidth: 1, borderTopColor: C.border }}>
        {sqft && (
          <View style={{ backgroundColor: C.greenLight, borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 11, color: C.greyMid, fontWeight: '700' }}>MEASURED AREA</Text>
              <Text style={{ fontSize: 28, fontWeight: '900', color: C.green, letterSpacing: -1 }}>{fmtSqFt(sqft)}</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.greyMid }}>{areaType}</Text>
          </View>
        )}
        <TextInput
          style={[styles.input, { marginBottom: 0 }]}
          placeholder="Notes (surface condition, HOA notes...)"
          placeholderTextColor={C.greyMid}
          value={notes}
          onChangeText={setNotes}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {!sqft ? (
            <TouchableOpacity style={[styles.greenBtn, { flex: 1, marginBottom: 0 }]} onPress={calcArea}>
              <Text style={styles.greenBtnText}>Finish Area →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.greenBtn, { flex: 1, marginBottom: 0 }]} onPress={handleSaveToQuote}>
              <Text style={styles.greenBtnText}>Save to Quote →</Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 }}>{fmtSqFt(sqft)} · {areaType}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── MEASURE CAMERA SCREEN ────────────────────────────────────────────────────
// NOTE: requires expo-camera + react-native-svg
// npx expo install expo-camera react-native-svg
const MeasureCameraScreen = ({ navigate, params }) => {
  const customer = params?.customer;
  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
  const AREA_TYPES = ['Driveway', 'Pool Deck', 'Patio', 'Walkway'];
  const [areaType, setAreaType] = useState('Driveway');
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [refWidth, setRefWidth] = useState('');
  const [showRefModal, setShowRefModal] = useState(false);
  const [sqft, setSqft] = useState(null);
  const [notes, setNotes] = useState('');
  const [permission, setPermission] = useState(null);
  const [permLoading, setPermLoading] = useState(true);

  const MAX_POINTS = 8;
  const NUDGE = 6;

  useEffect(() => {
    (async () => {
      try {
        const { CameraView, useCameraPermissions } = require('expo-camera');
        const [perm, requestPerm] = useCameraPermissions ? [null, null] : [null, null];
        // Check permission via Camera API
        const Camera = require('expo-camera');
        const { status } = await Camera.Camera.requestCameraPermissionsAsync();
        setPermission(status === 'granted');
      } catch {
        setPermission(null); // camera not available
      }
      setPermLoading(false);
    })();
  }, []);

  const handleTap = (e) => {
    if (points.length >= MAX_POINTS) return;
    const { locationX, locationY } = e.nativeEvent;
    setPoints(prev => [...prev, { x: locationX, y: locationY }]);
    setSelectedPoint(points.length);
    setSqft(null);
  };

  const nudge = (dx, dy) => {
    if (selectedPoint === null) return;
    setPoints(prev => prev.map((p, i) => i === selectedPoint ? { x: p.x + dx, y: p.y + dy } : p));
    setSqft(null);
  };

  const calcPixelArea = () => {
    if (points.length < 3) { Alert.alert('Need 3+ points', 'Tap corners on the camera view.'); return; }
    if (!refWidth || parseFloat(refWidth) <= 0) { setShowRefModal(true); return; }
    // Shoelace formula for pixel area
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    const pixelArea = Math.abs(area) / 2;
    // Reference: first two points form known-length edge
    if (points.length >= 2) {
      const dx = points[1].x - points[0].x;
      const dy = points[1].y - points[0].y;
      const refPixels = Math.sqrt(dx * dx + dy * dy);
      const refFt = parseFloat(refWidth);
      const scale = refFt / refPixels; // ft per pixel
      const ft2 = Math.round(pixelArea * scale * scale);
      setSqft(ft2);
    }
  };

  const handleSaveToQuote = () => {
    if (!sqft) { Alert.alert('Calculate area first'); return; }
    navigate('QuoteBuilder', {
      customer,
      measuredSurface: areaType,
      measuredSqft: sqft,
      measuredNotes: notes,
      measuredService: areaTypeToService(areaType),
    });
  };

  // Build SVG polygon path
  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const lineSegs = points.length >= 2 ? points.map((p, i) => {
    const next = points[(i + 1) % points.length];
    return { x1: p.x, y1: p.y, x2: next.x, y2: next.y };
  }) : [];

  let CameraViewComp = null;
  let SvgComp = null, PolygonSvg = null, CircleSvg = null, LineSvg = null;
  let cameraAvail = false;
  try {
    const cam = require('expo-camera');
    CameraViewComp = cam.CameraView || cam.Camera;
    cameraAvail = true;
  } catch {}
  try {
    const svg = require('react-native-svg');
    SvgComp = svg.default || svg.Svg;
    PolygonSvg = svg.Polygon;
    CircleSvg = svg.Circle;
    LineSvg = svg.Line;
  } catch {}

  if (permLoading) return (
    <SafeAreaView style={[styles.screenGreen, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator color={C.white} size="large" />
      <Text style={{ color: C.white, marginTop: 12 }}>Checking camera access...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.screenGreen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigate('MeasureEntry', { customer })} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontSize: 18 }]}>Camera Tap Mode</Text>
            <Text style={styles.headerSub}>{points.length}/{MAX_POINTS} points{sqft ? ` · ${fmtSqFt(sqft)}` : ''}</Text>
          </View>
          {points.length > 0 && (
            <TouchableOpacity onPress={() => { setPoints([]); setSqft(null); setSelectedPoint(null); }} style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
              <Text style={{ color: C.white, fontSize: 12, fontWeight: '700' }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Area type */}
      <View style={{ backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', gap: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
        {AREA_TYPES.map(t => (
          <TouchableOpacity key={t} onPress={() => setAreaType(t)} style={[styles.filterChip, areaType === t && styles.filterChipActive, { marginRight: 0 }]}>
            <Text style={[styles.filterChipText, areaType === t && { color: C.white }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Camera + SVG overlay */}
      <View style={{ flex: 1, position: 'relative', backgroundColor: '#111' }}>
        {cameraAvail && permission && CameraViewComp ? (
          <CameraViewComp style={{ flex: 1 }} facing="back" />
        ) : (
          <View style={{ flex: 1, backgroundColor: '#1a2a1a', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📷</Text>
            <Text style={{ color: C.white, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>Camera View</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center', paddingHorizontal: 32, lineHeight: 18 }}>
              {!cameraAvail ? 'Install: npx expo install expo-camera react-native-svg' : 'Camera permission required — tap the tap area below to simulate'}
            </Text>
          </View>
        )}

        {/* Tap capture area + SVG overlay */}
        <TouchableOpacity
          style={{ ...StyleSheet.absoluteFillObject }}
          onPress={handleTap}
          activeOpacity={1}
        >
          {SvgComp && points.length >= 2 && (
            <SvgComp style={{ ...StyleSheet.absoluteFillObject }}>
              {/* Polygon fill */}
              {points.length >= 3 && PolygonSvg && (
                <PolygonSvg points={polyPoints} fill="rgba(45,106,34,0.25)" stroke="#2D6A22" strokeWidth="2" />
              )}
              {/* Lines */}
              {LineSvg && lineSegs.slice(0, points.length - 1).map((seg, i) => (
                <LineSvg key={i} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} stroke={i === 0 ? '#FCD34D' : '#2D6A22'} strokeWidth="2" strokeDasharray={i === 0 ? '6,4' : undefined} />
              ))}
              {/* Points */}
              {CircleSvg && points.map((p, i) => (
                <CircleSvg key={i} cx={p.x} cy={p.y} r={i === selectedPoint ? 12 : 8}
                  fill={i === 0 ? '#FCD34D' : i === 1 ? '#FFA726' : '#2D6A22'}
                  stroke="white" strokeWidth="2"
                  onPress={() => setSelectedPoint(i)}
                />
              ))}
            </SvgComp>
          )}
        </TouchableOpacity>

        {/* Instruction overlay */}
        {points.length === 0 && (
          <View style={{ position: 'absolute', top: 12, left: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: C.white, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>👆 Tap corners of the {areaType.toLowerCase()} · First 2 points = reference edge</Text>
          </View>
        )}

        {/* Reference edge label */}
        {points.length === 2 && (
          <View style={{ position: 'absolute', top: 12, left: 16, right: 16, backgroundColor: 'rgba(252,211,77,0.9)', borderRadius: 12, padding: 10 }}>
            <Text style={{ color: '#1a1a00', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>📏 Yellow edge = reference. You'll enter this length in feet to calculate area.</Text>
          </View>
        )}

        {/* Nudge pad */}
        {selectedPoint !== null && (
          <View style={{ position: 'absolute', bottom: 8, right: 16 }}>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <TouchableOpacity style={styles.nudgeBtn} onPress={() => nudge(0, -NUDGE)}><Text style={styles.nudgeBtnText}>↑</Text></TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity style={styles.nudgeBtn} onPress={() => nudge(-NUDGE, 0)}><Text style={styles.nudgeBtnText}>←</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.nudgeBtn, { backgroundColor: C.border }]} onPress={() => setSelectedPoint(null)}><Text style={{ fontSize: 12, color: C.greyMid }}>✕</Text></TouchableOpacity>
                <TouchableOpacity style={styles.nudgeBtn} onPress={() => nudge(NUDGE, 0)}><Text style={styles.nudgeBtnText}>→</Text></TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.nudgeBtn} onPress={() => nudge(0, NUDGE)}><Text style={styles.nudgeBtnText}>↓</Text></TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Bottom controls */}
      <ScrollView style={{ maxHeight: 220, backgroundColor: C.white }} contentContainerStyle={{ padding: 14, gap: 10 }} keyboardShouldPersistTaps="handled">
        {sqft && (
          <View style={{ backgroundColor: C.greenLight, borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 11, color: C.greyMid, fontWeight: '700' }}>CALCULATED AREA</Text>
              <Text style={{ fontSize: 28, fontWeight: '900', color: C.green, letterSpacing: -1 }}>{fmtSqFt(sqft)}</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.greyMid }}>{areaType}</Text>
          </View>
        )}
        <TextInput
          style={[styles.input, { marginBottom: 0 }]}
          placeholder="Notes (condition, access notes...)"
          placeholderTextColor={C.greyMid}
          value={notes}
          onChangeText={setNotes}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {points.length > 0 && (
            <TouchableOpacity style={[styles.greenBtn, { flex: 0, marginBottom: 0, paddingHorizontal: 14 }]} onPress={() => { setPoints(prev => prev.slice(0, -1)); setSqft(null); }}>
              <Text style={[styles.greenBtnText, { fontSize: 14 }]}>↩</Text>
            </TouchableOpacity>
          )}
          {!sqft ? (
            <TouchableOpacity style={[styles.greenBtn, { flex: 1, marginBottom: 0 }]} onPress={() => points.length >= 2 ? setShowRefModal(true) : Alert.alert('Need 2+ points', 'Tap at least 2 corners first.')}>
              <Text style={styles.greenBtnText}>Finish Area →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.greenBtn, { flex: 1, marginBottom: 0 }]} onPress={handleSaveToQuote}>
              <Text style={styles.greenBtnText}>Save to Quote →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Reference width modal */}
      <Modal visible={showRefModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Reference Edge Length</Text>
            <Text style={{ fontSize: 13, color: C.greyMid, marginBottom: 14, lineHeight: 19 }}>
              The yellow dashed line between your first two points is the reference edge.{'\n'}
              How long is it in feet? (e.g. "20" for a 20-foot driveway edge)
            </Text>
            <Text style={styles.fieldLabel}>Known length (feet)</Text>
            <TextInput
              style={[styles.input, { marginBottom: 16, fontSize: 22, fontWeight: '700', color: C.green, textAlign: 'center' }]}
              placeholder="20"
              placeholderTextColor={C.greyMid}
              keyboardType="decimal-pad"
              value={refWidth}
              onChangeText={setRefWidth}
              autoFocus
            />
            <TouchableOpacity style={styles.greenBtn} onPress={() => { setShowRefModal(false); calcPixelArea(); }}>
              <Text style={styles.greenBtnText}>Calculate Area</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.greenBtn, { backgroundColor: C.greyLight, marginTop: 0 }]} onPress={() => setShowRefModal(false)}>
              <Text style={[styles.greenBtnText, { color: C.grey }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


// ─── ROUTER ───────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState({});
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);

  const navigate = (s, p = {}) => { setScreen(s); setParams(p); };

  const addCustomer = (c) => {
    const newC = {
      id: Date.now().toString(),
      name: c.name,
      address: `${c.street}, ${c.city}, ${c.state} ${c.zip}`.trim(),
      phone: c.phone, email: c.email,
      status: 'lead', jobs: 0, lastJob: null, source: c.source,
    };
    setCustomers(prev => [newC, ...prev]);
    MOCK_CUSTOMERS = [newC, ...MOCK_CUSTOMERS];
  };

  const greenHeaderScreens = [
    'Home','Customers','CustomerDetail','YouGotPaid','Jobs','Schedule','Leads',
    'JobComplete','ReviewRequest','BusinessSetup','SocialSetup','HolidayCampaigns',
    'NotificationSettings','MeasureEntry','MeasureSatellite','MeasureCamera',
  ];
  const barStyle = greenHeaderScreens.includes(screen) ? 'light-content' : 'dark-content';
  const barBg = greenHeaderScreens.includes(screen) ? C.green : C.white;

  const screenMap = {
    Home: <HomeScreen navigate={navigate} params={params} />,
    Customers: <CustomersScreen navigate={navigate} customers={customers} />,
    CustomerDetail: <CustomerDetailScreen navigate={navigate} params={params} />,
    NewCustomer: <NewCustomerScreen navigate={navigate} addCustomer={addCustomer} />,
    QuoteBuilder: <QuoteBuilderScreen navigate={navigate} params={params} customers={customers} />,
    ActiveJob: <ActiveJobScreen navigate={navigate} params={params} />,
    JobComplete: <JobCompleteScreen navigate={navigate} params={params} />,
    Invoice: <InvoiceScreen navigate={navigate} params={params} />,
    YouGotPaid: <YouGotPaidScreen navigate={navigate} params={params} />,
    ReviewRequest: <ReviewRequestScreen navigate={navigate} params={params} />,
    FollowUpScheduler: <FollowUpSchedulerScreen navigate={navigate} />,
    CustomersDue: <CustomersDueScreen navigate={navigate} />,
    RevenueDashboard: <RevenueDashboardScreen navigate={navigate} />,
    NewLead: <NewLeadScreen navigate={navigate} />,
    Specials: <SpecialsScreen navigate={navigate} />,
    ReferralTracking: <ReferralTrackingScreen navigate={navigate} />,
    Jobs: <JobsScreen navigate={navigate} />,
    NewJob: <NewCustomerScreen navigate={navigate} addCustomer={addCustomer} />,
    Schedule: <ScheduleScreen navigate={navigate} />,
    Leads: <LeadsScreen navigate={navigate} />,
    BusinessSetup: <BusinessSetupScreen navigate={navigate} />,
    SocialSetup: <SocialSetupScreen navigate={navigate} />,
    HolidayCampaigns: <HolidayCampaignsScreen navigate={navigate} />,
    NotificationSettings: <NotificationSettingsScreen navigate={navigate} />,
    MissedCallAutoText: <MissedCallAutoTextScreen navigate={navigate} />,
    // ── MEASURE SCREENS ──
    MeasureEntry: <MeasureEntryScreen navigate={navigate} params={params} />,
    MeasureSatellite: <MeasureSatelliteScreen navigate={navigate} params={params} />,
    MeasureCamera: <MeasureCameraScreen navigate={navigate} params={params} />,
  };

  return (
    <>
      <StatusBar barStyle={barStyle} translucent={false} backgroundColor={barBg} />
      {screenMap[screen] || screenMap['Home']}
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.greyLight },
  screenGreen: { flex: 1, backgroundColor: C.green },
  header: { backgroundColor: C.green, paddingTop: Platform.OS === 'android' ? 12 : 0, paddingBottom: 14, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.white, letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: C.white, fontSize: 26, lineHeight: 30, marginLeft: -2 },
  headerActionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, paddingHorizontal: 14, paddingTop: 10 },
  card: { backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  kpiCard: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  kpiVal: { fontSize: 20, fontWeight: '800', color: C.green, letterSpacing: -0.5 },
  kpiLabel: { fontSize: 10, color: C.greyMid, marginTop: 2, textAlign: 'center' },
  alertBanner: { backgroundColor: '#FFF8E1', borderRadius: 12, padding: 12, marginBottom: 14, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: C.gold },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: C.greyMid, letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: Platform.OS === 'ios' ? 14 : 4, paddingTop: 4 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabIcon: { fontSize: 24, opacity: 0.55 },
  tabLabel: { fontSize: 11, color: C.greyMid },
  fabBtn: { width: 53, height: 53, borderRadius: 27, backgroundColor: '#34C759', justifyContent: 'center', alignItems: 'center', marginTop: -20, shadowColor: '#34C759', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: C.white, marginRight: 8, borderWidth: 1, borderColor: C.border },
  filterChipActive: { backgroundColor: C.green, borderColor: C.green },
  filterChipText: { fontSize: 13, color: C.grey, fontWeight: '500' },
  clientRow: { backgroundColor: C.white, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700' },
  clientName: { fontSize: 14, fontWeight: '700', color: C.grey },
  clientAddr: { fontSize: 12, color: C.greyMid, marginTop: 1 },
  clientJobs: { fontSize: 11, color: C.greyMid, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  cardLabel: { fontSize: 10, fontWeight: '700', color: C.greyMid, letterSpacing: 0.5, marginBottom: 6 },
  greenBtn: { backgroundColor: C.green, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10 },
  greenBtnText: { color: C.white, fontSize: 16, fontWeight: '700' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.greyMid, marginBottom: 4 },
  input: { backgroundColor: C.white, borderRadius: 10, padding: 12, fontSize: 15, color: C.grey, borderWidth: 1, borderColor: C.border, marginBottom: 0 },
  qbRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  qbRowIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.greenLight, justifyContent: 'center', alignItems: 'center' },
  qbRowLabel: { fontSize: 11, color: C.greyMid, fontWeight: '600', marginBottom: 2 },
  qbRowValue: { fontSize: 15, color: C.grey, fontWeight: '600' },
  qbDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },
  deliveryBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
  deliveryBtnActive: { borderColor: C.green, backgroundColor: C.greenLight },
  deliveryBtnText: { fontSize: 13, color: C.greyMid, fontWeight: '500' },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  serviceSelectRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  accordionBody: { backgroundColor: '#F0F7EE', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.green + '33' },
  accordionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  accordionLabel: { fontSize: 13, color: C.greyMid, fontWeight: '500' },
  accordionInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1.5, borderColor: C.green, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, gap: 4, minWidth: 110 },
  accordionInputField: { fontSize: 16, fontWeight: '700', color: C.green, minWidth: 60, textAlign: 'right' },
  flatToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, marginBottom: 4 },
  flatToggleBox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  quoteDoc: { backgroundColor: C.white, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  quoteDocHeader: { backgroundColor: C.green, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  quoteLogoText: { color: C.white, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  quoteFromTo: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  quoteSmLabel: { fontSize: 9, fontWeight: '800', color: C.greyMid, letterSpacing: 1, marginBottom: 4 },
  quoteFromName: { fontSize: 14, fontWeight: '800', color: C.grey, marginBottom: 2 },
  quoteFromDetail: { fontSize: 11, color: C.greyMid, lineHeight: 16 },
  quoteMeta: { fontSize: 13, fontWeight: '700', color: C.grey, marginTop: 2 },
  quoteLineHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  quoteLineRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  quoteTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 2, borderTopColor: C.green, marginTop: 4 },
  quoteFooter: { padding: 16, borderTopWidth: 1, borderTopColor: C.border, marginTop: 8 },
  sourceChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border },
  sourceChipText: { fontSize: 13, color: C.grey, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '75%' },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 16 },
  quickSheet: {
    backgroundColor: C.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  quickSheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.grey,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  quickSheetDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: -20,
    marginBottom: 16,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    backgroundColor: C.cream,
  },
  quickRowHighlight: {
    backgroundColor: '#E8F0D8',
    borderColor: 'rgba(45,106,34,0.3)',
  },
  quickRowIcon: {
    fontSize: 20,
    width: 26,
    textAlign: 'center',
  },
  quickRowLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: C.grey,
  },
  quickCancel: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickCancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: C.grey,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.grey, marginBottom: 12 },
  homeHeader: { backgroundColor: '#4A5568', paddingTop: Platform.OS === 'android' ? 16 : 8, paddingBottom: 20, paddingHorizontal: 18 },
  homeDate: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '500', marginBottom: 2 },
  homeGreeting: { fontSize: 26, fontWeight: '900', color: C.white, letterSpacing: -0.5, marginBottom: 16 },
  homeKpiRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(147,197,253,0.22)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.3)',
  },
  homeKpi: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  homeKpiVal: {
    fontSize: 22,
    fontWeight: '900',
    color: C.white,
    letterSpacing: -0.5,
  },
  homeKpiLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 3,
    fontWeight: '600',
    textTransform: 'lowercase',
    letterSpacing: 0.2,
  },
  attentionCard: { backgroundColor: C.cream, borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  attentionDot: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  callBackBtn: { backgroundColor: '#34C759', paddingHorizontal: 10, paddingVertical: 9, borderRadius: 16 },
  jobCard: { backgroundColor: C.cream, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  revenueCard: { backgroundColor: '#1D6FD8', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  scheduleCard: { backgroundColor: '#0F766E', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  eventCard: { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 8, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  jobStatChip: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 10, alignItems: 'center' },
  jobStatLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 0.5, marginBottom: 3 },
  jobStatVal: { fontSize: 14, fontWeight: '800', color: C.white },
  templateCard: { flex: 1, height: 90, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, padding: 8, overflow: 'hidden' },
  channelCard: { flex: 1, backgroundColor: C.white, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  channelCheck: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.border, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.greenLight, justifyContent: 'center', alignItems: 'center' },
  headerSearch: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  detailHeader: { backgroundColor: C.green, flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'android' ? 16 : 8, paddingHorizontal: 16, paddingBottom: 0 },
  detailHeaderLabel: { flex: 1, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  detailHero: { backgroundColor: C.green, alignItems: 'center', paddingBottom: 20, paddingTop: 10 },
  detailAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  detailAvatarText: { fontSize: 26, fontWeight: '800', color: C.white },
  detailName: { fontSize: 22, fontWeight: '900', color: C.white, letterSpacing: -0.3 },
  detailAddr: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  detailActions: { backgroundColor: C.white, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border },
  detailActionBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 4 },
  detailActionLabel: { fontSize: 10, color: C.greyMid, fontWeight: '600' },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  timelineDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  detailFab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: C.green, justifyContent: 'center', alignItems: 'center', shadowColor: C.green, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6, padding: 0 },
  payMethodBtn: { flex: 1, backgroundColor: C.white, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: C.border, gap: 2 },
  followUpCard: { backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  followUpIconLg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  // Settings styles
  settingsIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: C.greenLight, justifyContent: 'center', alignItems: 'center' },
  settingsLabel: { fontSize: 14, fontWeight: '600', color: C.grey },
  settingsSub: { fontSize: 12, color: C.greyMid, marginTop: 1 },
  settingsChevron: { color: C.greyMid, fontSize: 20 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  // Measure / Camera nudge pad
  nudgeBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: C.greenLight, borderWidth: 1, borderColor: C.green, alignItems: 'center', justifyContent: 'center' },
  nudgeBtnText: { color: C.green, fontSize: 22, fontWeight: '800' },
});
