import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, FlatList, SafeAreaView,
  StatusBar, ActivityIndicator, KeyboardAvoidingView,
  Platform, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gtctohhnxrobjrswihq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y3RvaGhueHJvYmZqcnN3aWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MDAxNDYsImV4cCI6MjA5MTI3NjE0Nn0.wmK9sHGcJT85rgLicVavD9XG0qzGokIcKscgwW7GF84';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

const C = {
  green: '#2D5016', greenLight: '#EAF3DE', greenAccent: '#C0DD97',
  bg: '#F5F5F5', card: '#FFFFFF', text: '#000000',
  textSecondary: '#6B6B6B', textMuted: '#8E8E93', border: '#E5E5EA',
  red: '#E24B4A', redLight: '#FCEBEB', redDark: '#A32D2D',
  orange: '#EF9F27', orangeLight: '#FAEEDA', orangeDark: '#854F0B',
  blue: '#185FA5', blueLight: '#E6F1FB',
};

const STATUS = {
  new_lead:     { label: 'New Lead',      bg: '#FCEBEB', text: '#A32D2D' },
  quoted:       { label: 'Quoted',        bg: '#FAEEDA', text: '#854F0B' },
  booked:       { label: 'Booked',        bg: '#E6F1FB', text: '#185FA5' },
  done:         { label: 'Done',          bg: '#EAF3DE', text: '#2D5016' },
  paid:         { label: 'Paid',          bg: '#EAF3DE', text: '#2D5016' },
  followup_due: { label: 'Follow-Up Due', bg: '#FAEEDA', text: '#854F0B' },
};

const JOB_STATUS = {
  scheduled: { label: 'Scheduled', bg: '#E6F1FB', text: '#185FA5' },
  en_route:  { label: 'En Route',  bg: '#E6F1FB', text: '#185FA5' },
  active:    { label: 'Active',    bg: '#EAF3DE', text: '#2D5016' },
  done:      { label: 'Done',      bg: '#EAF3DE', text: '#2D5016' },
  invoiced:  { label: 'Invoiced',  bg: '#FAEEDA', text: '#854F0B' },
  paid:      { label: 'Paid',      bg: '#EAF3DE', text: '#2D5016' },
};

const fmt = {
  date: (d) => { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); },
  time: (d) => { if (!d) return ''; return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); },
  currency: (n) => { if (!n && n !== 0) return '—'; return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); },
  initials: (name) => { if (!name) return '??'; return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); },
  phone: (p) => { if (!p) return ''; const d = p.replace(/\D/g, ''); if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`; return p; },
};

const AVATAR_COLORS = [
  { bg: '#EAF3DE', text: '#27500A' }, { bg: '#E6F1FB', text: '#0C447C' },
  { bg: '#FAEEDA', text: '#633806' }, { bg: '#FCEBEB', text: '#791F1F' },
];
const avatarColor = (name) => AVATAR_COLORS[(name || '').charCodeAt(0) % AVATAR_COLORS.length];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('home');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSession(data?.session ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.log('Session error:', err);
        if (mounted) setLoading(false);
      }
    };
    init();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setSession(session);
    });
    return () => {
      mounted = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: C.green, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 36, fontWeight: '700', color: '#fff', letterSpacing: -1 }}>JobTap</Text>
      <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />
    </View>
  );

  if (!session) return <AuthScreen />;

  const navigate = (s, params = {}) => {
    if (params.customer) setSelectedCustomer(params.customer);
    if (params.job) setSelectedJob(params.job);
    setScreen(s);
  };

  const screens = {
    home:            <HomeScreen navigate={navigate} session={session} />,
    customers:       <CustomerBookScreen navigate={navigate} session={session} />,
    customer_detail: <CustomerDetailScreen customer={selectedCustomer} navigate={navigate} session={session} />,
    new_customer:    <NewCustomerScreen navigate={navigate} session={session} />,
    new_job:         <NewJobScreen navigate={navigate} session={session} customer={selectedCustomer} />,
    jobs:            <JobsScreen navigate={navigate} session={session} />,
    settings:        <SettingsScreen navigate={navigate} session={session} />,
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.green} />
      {screens[screen] || screens.home}
      <BottomNav screen={screen} navigate={navigate} />
    </SafeAreaView>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: true });

  const submit = async () => {
    if (!email || !password) { setMsg({ text: 'Email and password required', isError: true }); return; }
    if (password.length < 6) { setMsg({ text: 'Password must be at least 6 characters', isError: true }); return; }
    setLoading(true); setMsg({ text: '', isError: true });
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        setMsg({ text: 'Account created! Check your email to confirm, then sign in.', isError: false });
        setMode('login');
      }
    } catch (e) {
      setMsg({ text: e.message || 'Something went wrong', isError: true });
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ backgroundColor: C.green, paddingTop: 80, paddingBottom: 40, alignItems: 'center' }}>
        <Text style={{ fontSize: 40, fontWeight: '700', color: '#fff', letterSpacing: -1 }}>JobTap</Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>Your business in your pocket.</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: '600', color: C.text, marginBottom: 16 }}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </Text>
        {msg.text ? (
          <Text style={{ fontSize: 13, marginBottom: 10, padding: 10, borderRadius: 8,
            color: msg.isError ? C.redDark : '#27500A',
            backgroundColor: msg.isError ? C.redLight : C.greenLight }}>
            {msg.text}
          </Text>
        ) : null}
        <TextInput style={s.authInput} placeholder="Email" placeholderTextColor={C.textMuted}
          value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={s.authInput} placeholder="Password (min 6 characters)" placeholderTextColor={C.textMuted}
          value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={{ backgroundColor: C.green, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 4, marginBottom: 16 }}
          onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMsg({ text: '', isError: true }); }}>
          <Text style={{ color: C.textSecondary, fontSize: 13, textAlign: 'center' }}>
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function HomeScreen({ navigate, session }) {
  const [stats, setStats] = useState({ jobs: 0, quotes: 0, alerts: 0, revenue: 0 });
  const [todayJobs, setTodayJobs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  const load = useCallback(async () => {
    try {
      const uid = session.user.id;
      const today = new Date().toISOString().split('T')[0];
      const [userRes, jobsRes, quotesRes, invoicesRes, customersRes] = await Promise.all([
        supabase.from('users').select('business_name').eq('id', uid).single(),
        supabase.from('jobs').select('*, customers(name, phone, address)').eq('user_id', uid)
          .gte('scheduled_at', today + 'T00:00:00').lte('scheduled_at', today + 'T23:59:59').order('scheduled_at'),
        supabase.from('quotes').select('id').eq('user_id', uid).eq('status', 'sent'),
        supabase.from('invoices').select('total').eq('user_id', uid).eq('status', 'paid')
          .gte('paid_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('customers').select('id, name, status, updated_at').eq('user_id', uid)
          .in('status', ['new_lead', 'followup_due']).order('updated_at', { ascending: false }).limit(5),
      ]);
      setUserName(userRes.data?.business_name || session.user.email?.split('@')[0] || 'there');
      setTodayJobs(jobsRes.data || []);
      const rev = (invoicesRes.data || []).reduce((sum, i) => sum + (i.total || 0), 0);
      setStats({ jobs: (jobsRes.data || []).length, quotes: (quotesRes.data || []).length, alerts: (customersRes.data || []).length, revenue: rev });
      setAlerts(customersRes.data || []);
    } catch (e) { console.log('home load error', e); }
    setLoading(false); setRefreshing(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const dayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={s.flex}>
      <View style={s.hdr}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <View>
            <Text style={s.hdrDay}>{dayStr}</Text>
            <Text style={s.hdrName}>{greeting}, {userName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigate('settings')} style={s.iconBtn}>
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <View style={s.statRow}>
          <View style={s.stat}><Text style={s.statN}>{stats.jobs}</Text><Text style={s.statL}>Jobs today</Text></View>
          <View style={s.stat}><Text style={s.statN}>{stats.quotes}</Text><Text style={s.statL}>Quotes out</Text></View>
          <View style={s.stat}><Text style={s.statN}>{stats.alerts}</Text><Text style={s.statL}>Need action</Text></View>
          <View style={s.stat}><Text style={[s.statN, { color: C.greenAccent }]}>{fmt.currency(stats.revenue)}</Text><Text style={s.statL}>This month</Text></View>
        </View>
      </View>
      <ScrollView style={s.flex} contentContainerStyle={{ padding: 14, paddingBottom: 90 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
        {alerts.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Text style={s.secLabel}>Needs attention</Text>
            <View style={[s.card, { borderLeftWidth: 3, borderLeftColor: C.red }]}>
              {alerts.map((a, i) => (
                <TouchableOpacity key={a.id} style={[s.row, i < alerts.length - 1 && s.rowBorder]}
                  onPress={() => navigate('customer_detail', { customer: a })}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: a.status === 'new_lead' ? C.red : C.orange }} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowTitle}>{a.name}</Text>
                    <Text style={s.rowSub}>{STATUS[a.status]?.label} · {fmt.date(a.updated_at)}</Text>
                  </View>
                  <Pill label={STATUS[a.status]?.label} bg={STATUS[a.status]?.bg} color={STATUS[a.status]?.text} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <Text style={s.secLabel}>Today's jobs</Text>
        {loading ? <ActivityIndicator color={C.green} style={{ marginVertical: 20 }} /> : todayJobs.length === 0 ? (
          <EmptyCard text="No jobs scheduled today" btnText="+ Add job" onPress={() => navigate('new_job')} />
        ) : (
          <View style={[s.card, { marginBottom: 14 }]}>
            {todayJobs.map((j, i) => (
              <TouchableOpacity key={j.id} style={[s.row, i < todayJobs.length - 1 && s.rowBorder]}
                onPress={() => navigate('customer_detail', { customer: { id: j.customer_id, name: j.customers?.name } })}>
                <Avatar name={j.customers?.name} size={32} />
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{j.customers?.name} · {j.service_type}</Text>
                  <Text style={s.rowSub}>{j.customers?.address} · {fmt.time(j.scheduled_at)}</Text>
                </View>
                <Pill label={JOB_STATUS[j.status]?.label} bg={JOB_STATUS[j.status]?.bg} color={JOB_STATUS[j.status]?.text} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={[s.card, { backgroundColor: C.green, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Month revenue</Text>
            <Text style={{ fontSize: 26, fontWeight: '700', color: '#fff', letterSpacing: -0.5 }}>{fmt.currency(stats.revenue)}</Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}
            onPress={() => navigate('customers')}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>View clients →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function CustomerBookScreen({ navigate, session }) {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const filters = ['all', 'new_lead', 'quoted', 'booked', 'paid', 'followup_due'];

  const load = useCallback(async () => {
    const { data } = await supabase.from('customers').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false });
    setCustomers(data || []); setFiltered(data || []); setLoading(false); setRefreshing(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    let res = customers;
    if (filter !== 'all') res = res.filter(c => c.status === filter);
    if (search) res = res.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));
    setFiltered(res);
  }, [search, filter, customers]);

  return (
    <View style={s.flex}>
      <View style={s.hdr}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <View>
            <Text style={s.hdrName}>Customers</Text>
            <Text style={s.hdrDay}>{customers.length} total · {customers.filter(c => ['new_lead','followup_due'].includes(c.status)).length} need action</Text>
          </View>
          <TouchableOpacity onPress={() => navigate('new_customer')} style={s.iconBtn}>
            <Text style={{ color: '#fff', fontSize: 22, lineHeight: 26 }}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8 }}>
          <TextInput style={{ fontSize: 13, color: '#fff' }} placeholder="Search customers..." placeholderTextColor="rgba(255,255,255,0.4)"
            value={search} onChangeText={setSearch} />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, backgroundColor: C.bg }}
        contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 8, gap: 6 }}>
        {filters.map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}
            style={[s.pill, filter === f && { backgroundColor: C.green, borderColor: C.green }]}>
            <Text style={[s.pillText, filter === f && { color: '#fff' }]}>{f === 'all' ? 'All' : STATUS[f]?.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading ? <ActivityIndicator color={C.green} style={{ marginTop: 40 }} /> : (
        <FlatList data={filtered} keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 90, gap: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<EmptyCard text={search || filter !== 'all' ? 'No matching customers' : 'No customers yet'} btnText="+ Add customer" onPress={() => navigate('new_customer')} />}
          renderItem={({ item }) => {
            const st = STATUS[item.status] || STATUS.new_lead;
            return (
              <TouchableOpacity style={s.card} onPress={() => navigate('customer_detail', { customer: item })}>
                <View style={[s.row, { padding: 12 }]}>
                  <Avatar name={item.name} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowTitle}>{item.name}</Text>
                    <Text style={s.rowSub}>{item.phone ? fmt.phone(item.phone) : item.address || '—'}</Text>
                  </View>
                  <Pill label={st.label} bg={st.bg} color={st.text} />
                  <Text style={{ color: C.textMuted, fontSize: 18, marginLeft: 4 }}>›</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

function CustomerDetailScreen({ customer: initCustomer, navigate, session }) {
  const [customer, setCustomer] = useState(initCustomer);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initCustomer?.id) { setLoading(false); return; }
    Promise.all([
      supabase.from('customers').select('*').eq('id', initCustomer.id).single(),
      supabase.from('jobs').select('*').eq('customer_id', initCustomer.id).order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').eq('customer_id', initCustomer.id).order('created_at', { ascending: false }),
    ]).then(([cRes, jRes, iRes]) => {
      if (cRes.data) setCustomer(cRes.data);
      setJobs(jRes.data || []); setInvoices(iRes.data || []); setLoading(false);
    });
  }, [initCustomer]);

  const st = STATUS[customer?.status] || STATUS.new_lead;
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);

  const updateStatus = async (newStatus) => {
    await supabase.from('customers').update({ status: newStatus }).eq('id', customer.id);
    setCustomer(c => ({ ...c, status: newStatus }));
  };

  return (
    <View style={s.flex}>
      <View style={[s.hdr, { paddingBottom: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <TouchableOpacity onPress={() => navigate('customers')} style={s.backBtn}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>Customer Detail</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Avatar name={customer?.name} size={44} light />
          <View style={{ flex: 1 }}>
            <Text style={s.hdrName}>{customer?.name}</Text>
            <Text style={s.hdrDay}>{customer?.address || 'No address'}</Text>
            <Pill label={st.label} bg="rgba(255,255,255,0.15)" color="#fff" style={{ marginTop: 5, alignSelf: 'flex-start' }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[{ icon: '📞', label: 'Call' }, { icon: '💬', label: 'Text' },
            { icon: '📄', label: 'New Job', action: () => navigate('new_job', { customer }) },
            { icon: '⭐', label: 'Review' }].map(btn => (
            <TouchableOpacity key={btn.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 10, padding: 8, alignItems: 'center', gap: 3 }}
              onPress={btn.action}>
              <Text style={{ fontSize: 16 }}>{btn.icon}</Text>
              <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: '500' }}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <ScrollView style={s.flex} contentContainerStyle={{ padding: 14, paddingBottom: 90 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {[{ n: jobs.length, l: 'Jobs' }, { n: fmt.currency(totalPaid), l: 'Total paid' },
            { n: invoices.filter(i => i.status !== 'paid').length, l: 'Unpaid' }].map((stat, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: C.card, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 0.5, borderColor: C.border }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.green }}>{stat.n}</Text>
              <Text style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{stat.l}</Text>
            </View>
          ))}
        </View>
        <Text style={s.secLabel}>Contact info</Text>
        <View style={[s.card, { marginBottom: 14 }]}>
          {[{ l: 'Phone', v: fmt.phone(customer?.phone) }, { l: 'Email', v: customer?.email },
            { l: 'Address', v: customer?.address }, { l: 'Lead source', v: customer?.lead_source },
            { l: 'Notes', v: customer?.notes }, { l: 'Since', v: fmt.date(customer?.created_at) }
          ].filter(r => r.v).map((r, i, arr) => (
            <View key={r.l} style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }, i < arr.length - 1 && s.rowBorder]}>
              <Text style={{ fontSize: 12, color: C.textSecondary }}>{r.l}</Text>
              <Text style={{ fontSize: 12, fontWeight: '500', color: C.text, flex: 1, textAlign: 'right' }}>{r.v}</Text>
            </View>
          ))}
        </View>
        <Text style={s.secLabel}>Update status</Text>
        <View style={[s.card, { marginBottom: 14 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 10, gap: 6 }}>
            {Object.entries(STATUS).map(([key, val]) => (
              <TouchableOpacity key={key} onPress={() => updateStatus(key)}
                style={[s.pill, { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: customer?.status === key ? C.green : val.bg, borderColor: customer?.status === key ? C.green : val.bg }]}>
                <Text style={{ color: customer?.status === key ? '#fff' : val.text, fontSize: 12, fontWeight: '600' }}>{val.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {jobs.length > 0 && (
          <>
            <Text style={s.secLabel}>Job history</Text>
            <View style={[s.card, { marginBottom: 14 }]}>
              {jobs.map((j, i) => (
                <View key={j.id} style={[s.row, i < jobs.length - 1 && s.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowTitle}>{j.service_type}</Text>
                    <Text style={s.rowSub}>{fmt.date(j.scheduled_at || j.created_at)}</Text>
                  </View>
                  <Pill label={JOB_STATUS[j.status]?.label} bg={JOB_STATUS[j.status]?.bg} color={JOB_STATUS[j.status]?.text} />
                </View>
              ))}
            </View>
          </>
        )}
        <TouchableOpacity style={s.greenBtn} onPress={() => navigate('new_job', { customer })}>
          <Text style={s.greenBtnText}>+ New Job / Quote</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function NewCustomerScreen({ navigate, session }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', lead_source: 'other', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setLoading(true); setError('');
    const { data, error } = await supabase.from('customers').insert({ ...form, user_id: session.user.id, status: 'new_lead' }).select().single();
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate('customer_detail', { customer: data });
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.hdr}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <TouchableOpacity onPress={() => navigate('customers')} style={s.backBtn}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>New Customer</Text>
        </View>
        <Text style={s.hdrName}>Add Customer</Text>
      </View>
      <ScrollView style={s.flex} contentContainerStyle={{ padding: 14, paddingBottom: 90 }}>
        {error ? <Text style={s.errorText}>{error}</Text> : null}
        <Text style={s.secLabel}>Client info</Text>
        <View style={[s.card, { marginBottom: 14 }]}>
          {[{ k: 'name', label: 'Full name *', placeholder: 'Marcus Webb', keyboard: 'default' },
            { k: 'phone', label: 'Phone', placeholder: '(904) 555-0183', keyboard: 'phone-pad' },
            { k: 'email', label: 'Email', placeholder: 'marcus@email.com', keyboard: 'email-address' },
            { k: 'address', label: 'Property address', placeholder: '142 Pintail Dr, Nocatee', keyboard: 'default' }
          ].map((f, i, arr) => (
            <View key={f.k} style={[{ padding: 10 }, i < arr.length - 1 && s.rowBorder]}>
              <Text style={s.formLabel}>{f.label}</Text>
              <TextInput style={{ fontSize: 13, color: C.text, paddingVertical: 2 }} placeholder={f.placeholder}
                placeholderTextColor={C.textMuted} value={form[f.k]} onChangeText={v => set(f.k, v)}
                keyboardType={f.keyboard} autoCapitalize={f.keyboard === 'default' ? 'words' : 'none'} />
            </View>
          ))}
        </View>
        <Text style={s.secLabel}>How did they find you?</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {['google', 'referral', 'facebook', 'nextdoor', 'yard_sign', 'other'].map(src => (
            <TouchableOpacity key={src} onPress={() => set('lead_source', src)}
              style={[s.pill, { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: form.lead_source === src ? C.green : C.greenLight, borderColor: form.lead_source === src ? C.green : C.border }]}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: form.lead_source === src ? '#fff' : C.green }}>{src.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.secLabel}>Notes</Text>
        <TextInput style={[s.card, { marginBottom: 20, padding: 12, minHeight: 80, textAlignVertical: 'top', fontSize: 13, color: C.text }]}
          placeholder="Gate code, referral details..." placeholderTextColor={C.textMuted} multiline value={form.notes} onChangeText={v => set('notes', v)} />
        <TouchableOpacity style={s.greenBtn} onPress={save} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.greenBtnText}>Save Customer</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function NewJobScreen({ navigate, session, customer: initCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(initCustomer || null);
  const [showPicker, setShowPicker] = useState(!initCustomer);
  const [form, setForm] = useState({ service_type: 'Paver Sealing', scheduled_date: '', scheduled_time: '', notes: '', sq_footage: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    supabase.from('customers').select('id, name, address, phone').eq('user_id', session.user.id).order('name')
      .then(({ data }) => setCustomers(data || []));
  }, [session]);

  const save = async () => {
    if (!selectedCustomer) { setError('Select a customer'); return; }
    setLoading(true); setError('');
    let scheduled_at = null;
    if (form.scheduled_date) scheduled_at = new Date(form.scheduled_date + (form.scheduled_time ? 'T' + form.scheduled_time : 'T08:00')).toISOString();
    const { error } = await supabase.from('jobs').insert({
      user_id: session.user.id, customer_id: selectedCustomer.id,
      service_type: form.service_type, scheduled_at, notes: form.notes,
      sq_footage: form.sq_footage ? parseFloat(form.sq_footage) : null, status: 'scheduled',
    });
    if (error) { setError(error.message); setLoading(false); return; }
    await supabase.from('customers').update({ status: 'booked' }).eq('id', selectedCustomer.id);
    setLoading(false);
    navigate('customer_detail', { customer: selectedCustomer });
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.hdr}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <TouchableOpacity onPress={() => navigate(initCustomer ? 'customer_detail' : 'home')} style={s.backBtn}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>New Job</Text>
        </View>
        <Text style={s.hdrName}>Schedule Job</Text>
        {selectedCustomer && <Text style={s.hdrDay}>{selectedCustomer.name}</Text>}
      </View>
      <ScrollView style={s.flex} contentContainerStyle={{ padding: 14, paddingBottom: 90 }}>
        {error ? <Text style={s.errorText}>{error}</Text> : null}
        {!initCustomer && (
          <>
            <Text style={s.secLabel}>Customer</Text>
            <TouchableOpacity style={[s.card, { marginBottom: 14, padding: 12, flexDirection: 'row', alignItems: 'center' }]} onPress={() => setShowPicker(true)}>
              <Text style={{ flex: 1, fontSize: 13, color: selectedCustomer ? C.text : C.textMuted }}>{selectedCustomer ? selectedCustomer.name : 'Tap to select customer...'}</Text>
              <Text style={{ color: C.textMuted }}>›</Text>
            </TouchableOpacity>
          </>
        )}
        <Text style={s.secLabel}>Service type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {['Paver Sealing', 'Driveway Seal', 'Pool Deck', 'Walkway Seal', 'Patio Seal', 'Other'].map(sv => (
            <TouchableOpacity key={sv} onPress={() => set('service_type', sv)}
              style={[s.pill, { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: form.service_type === sv ? C.green : C.greenLight, borderColor: form.service_type === sv ? C.green : C.border }]}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: form.service_type === sv ? '#fff' : C.green }}>{sv}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.secLabel}>Schedule</Text>
        <View style={[s.card, { marginBottom: 14 }]}>
          <View style={[{ padding: 10 }, s.rowBorder]}>
            <Text style={s.formLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput style={{ fontSize: 13, color: C.text }} placeholder="2026-04-15" placeholderTextColor={C.textMuted} value={form.scheduled_date} onChangeText={v => set('scheduled_date', v)} />
          </View>
          <View style={{ padding: 10 }}>
            <Text style={s.formLabel}>Time (HH:MM)</Text>
            <TextInput style={{ fontSize: 13, color: C.text }} placeholder="10:00" placeholderTextColor={C.textMuted} value={form.scheduled_time} onChangeText={v => set('scheduled_time', v)} />
          </View>
        </View>
        <Text style={s.secLabel}>Details</Text>
        <View style={[s.card, { marginBottom: 14 }]}>
          <View style={[{ padding: 10 }, s.rowBorder]}>
            <Text style={s.formLabel}>Sq footage</Text>
            <TextInput style={{ fontSize: 13, color: C.text }} placeholder="742" placeholderTextColor={C.textMuted} value={form.sq_footage} onChangeText={v => set('sq_footage', v)} keyboardType="numeric" />
          </View>
          <View style={{ padding: 10 }}>
            <Text style={s.formLabel}>Notes</Text>
            <TextInput style={{ fontSize: 13, color: C.text, minHeight: 50 }} placeholder="Gate code, instructions..." placeholderTextColor={C.textMuted} multiline value={form.notes} onChangeText={v => set('notes', v)} />
          </View>
        </View>
        <TouchableOpacity style={s.greenBtn} onPress={save} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.greenBtnText}>Save Job</Text>}
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={showPicker} animationType="slide">
        <SafeAreaView style={s.flex}>
          <View style={[s.hdr, { paddingBottom: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={s.hdrName}>Select Customer</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}><Text style={{ color: '#fff', fontSize: 18 }}>✕</Text></TouchableOpacity>
            </View>
          </View>
          <FlatList data={customers} keyExtractor={i => i.id} contentContainerStyle={{ padding: 14, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={[s.card, { padding: 12 }]} onPress={() => { setSelectedCustomer(item); setShowPicker(false); }}>
                <Text style={s.rowTitle}>{item.name}</Text>
                <Text style={s.rowSub}>{item.address || item.phone || ''}</Text>
              </TouchableOpacity>
            )} />
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function JobsScreen({ navigate, session }) {
  const [jobs, setJobs] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const days = useMemo(() => Array.from({ length: 5 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1 + i); return d;
  }), []);

  const load = useCallback(async (idx) => {
    const dayStr = days[idx ?? selectedDay].toISOString().split('T')[0];
    const { data } = await supabase.from('jobs').select('*, customers(name, phone, address)')
      .eq('user_id', session.user.id).gte('scheduled_at', dayStr + 'T00:00:00').lte('scheduled_at', dayStr + 'T23:59:59').order('scheduled_at');
    setJobs(data || []); setLoading(false); setRefreshing(false);
  }, [session, days, selectedDay]);

  useEffect(() => { load(selectedDay); }, [selectedDay]);

  const updateStatus = async (jobId, status) => {
    await supabase.from('jobs').update({ status }).eq('id', jobId);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <View style={s.flex}>
      <View style={s.hdr}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View>
            <Text style={s.hdrName}>Jobs</Text>
            <Text style={s.hdrDay}>{days[selectedDay].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
          </View>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigate('new_job')}>
            <Text style={{ color: '#fff', fontSize: 22, lineHeight: 26 }}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {days.map((d, i) => (
            <TouchableOpacity key={i} onPress={() => setSelectedDay(i)}
              style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 7, alignItems: 'center', gap: 2, borderWidth: 0.5, borderColor: C.border },
                selectedDay === i && { backgroundColor: C.green, borderColor: C.green }]}>
              <Text style={[{ fontSize: 8, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase' }, selectedDay === i && { color: 'rgba(255,255,255,0.65)' }]}>{dayNames[i]}</Text>
              <Text style={[{ fontSize: 14, fontWeight: '700', color: C.text }, selectedDay === i && { color: '#fff' }]}>{d.getDate()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {loading ? <ActivityIndicator color={C.green} style={{ marginTop: 40 }} /> : (
        <ScrollView style={s.flex} contentContainerStyle={{ padding: 14, paddingBottom: 90 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(selectedDay); }} />}>
          {jobs.length === 0 ? (
            <EmptyCard text="No jobs this day" btnText="+ Schedule job" onPress={() => navigate('new_job')} />
          ) : jobs.map(j => (
            <View key={j.id} style={[s.card, { marginBottom: 10, overflow: 'hidden' }]}>
              <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: C.border }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.green, minWidth: 52 }}>{fmt.time(j.scheduled_at)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{j.customers?.name}</Text>
                  <Text style={s.rowSub}>{j.customers?.address} · {j.service_type}</Text>
                </View>
                <Pill label={JOB_STATUS[j.status]?.label} bg={JOB_STATUS[j.status]?.bg} color={JOB_STATUS[j.status]?.text} />
              </View>
              <View style={{ flexDirection: 'row' }}>
                {[{ label: 'Navigate', color: C.textMuted }, { label: 'Call', color: C.textMuted },
                  { label: j.status === 'done' ? 'Invoice' : 'Start Job', color: C.green, action: () => j.status !== 'done' && updateStatus(j.id, 'active') }
                ].map((btn, i) => (
                  <TouchableOpacity key={btn.label} onPress={btn.action}
                    style={{ flex: 1, alignItems: 'center', paddingVertical: 9, borderRightWidth: i < 2 ? 0.5 : 0, borderRightColor: C.border }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: btn.color }}>{btn.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function SettingsScreen({ navigate, session }) {
  const [form, setForm] = useState({ business_name: '', phone: '', email: '', default_service_type: '', default_price_per_sqft: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    supabase.from('users').select('*').eq('id', session.user.id).single().then(({ data }) => {
      if (data) setForm({ business_name: data.business_name || '', phone: data.phone || '', email: data.email || session.user.email || '', default_service_type: data.default_service_type || '', default_price_per_sqft: data.default_price_per_sqft?.toString() || '' });
      setLoading(false);
    });
  }, [session]);

  const save = async () => {
    setSaving(true);
    await supabase.from('users').upsert({ id: session.user.id, ...form, default_price_per_sqft: form.default_price_per_sqft ? parseFloat(form.default_price_per_sqft) : null });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const signOut = () => Alert.alert('Sign out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: () => supabase.auth.signOut() },
  ]);

  return (
    <View style={s.flex}>
      <View style={s.hdr}>
        <Text style={s.hdrName}>Settings</Text>
        <Text style={s.hdrDay}>{session.user.email}</Text>
      </View>
      {loading ? <ActivityIndicator color={C.green} style={{ marginTop: 40 }} /> : (
        <ScrollView style={s.flex} contentContainerStyle={{ padding: 14, paddingBottom: 90 }}>
          <Text style={s.secLabel}>Business info</Text>
          <View style={[s.card, { marginBottom: 14 }]}>
            {[{ k: 'business_name', label: 'Business name', placeholder: "Mike's Paver Sealing" },
              { k: 'phone', label: 'Your phone', placeholder: '(904) 555-0100' },
              { k: 'email', label: 'Email', placeholder: 'mike@pavers.com' }].map((f, i, arr) => (
              <View key={f.k} style={[{ padding: 10 }, i < arr.length - 1 && s.rowBorder]}>
                <Text style={s.formLabel}>{f.label}</Text>
                <TextInput style={{ fontSize: 13, color: C.text }} placeholder={f.placeholder} placeholderTextColor={C.textMuted} value={form[f.k]} onChangeText={v => set(f.k, v)} />
              </View>
            ))}
          </View>
          <Text style={s.secLabel}>Quote defaults</Text>
          <View style={[s.card, { marginBottom: 20 }]}>
            {[{ k: 'default_service_type', label: 'Default service', placeholder: 'Paver Sealing' },
              { k: 'default_price_per_sqft', label: 'Price per sq ft', placeholder: '1.50' }].map((f, i, arr) => (
              <View key={f.k} style={[{ padding: 10 }, i < arr.length - 1 && s.rowBorder]}>
                <Text style={s.formLabel}>{f.label}</Text>
                <TextInput style={{ fontSize: 13, color: C.text }} placeholder={f.placeholder} placeholderTextColor={C.textMuted} value={form[f.k]} onChangeText={v => set(f.k, v)} keyboardType={f.k === 'default_price_per_sqft' ? 'numeric' : 'default'} />
              </View>
            ))}
          </View>
          <TouchableOpacity style={s.greenBtn} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.greenBtnText}>{saved ? '✓ Saved' : 'Save Changes'}</Text>}
          </TouchableOpacity>
          <View style={[s.card, { marginTop: 14 }]}>
            <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }, s.rowBorder]}>
              <Text style={{ fontSize: 12, color: C.textSecondary }}>Plan</Text>
              <Pill label="Core · $19.99/mo" bg={C.greenLight} color={C.green} />
            </View>
            <TouchableOpacity style={{ padding: 10 }} onPress={signOut}>
              <Text style={{ fontSize: 12, color: C.red }}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function BottomNav({ screen, navigate }) {
  const tabs = [
    { key: 'home', icon: '🏠', label: 'Home' },
    { key: 'customers', icon: '👥', label: 'Clients' },
    { key: 'new_job', icon: '+', label: 'New Job', fab: true },
    { key: 'jobs', icon: '📅', label: 'Jobs' },
    { key: 'settings', icon: '⚙️', label: 'More' },
  ];
  return (
    <View style={s.tabBar}>
      {tabs.map(t => (
        <TouchableOpacity key={t.key} style={s.tab} onPress={() => navigate(t.key)}>
          {t.fab ? (
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginTop: -18 }}>
              <Text style={{ color: '#fff', fontSize: 26, lineHeight: 30, fontWeight: '300' }}>+</Text>
            </View>
          ) : (
            <>
              <Text style={{ fontSize: 20 }}>{t.icon}</Text>
              <Text style={[{ fontSize: 9, color: C.textMuted }, screen === t.key && { color: C.green }]}>{t.label}</Text>
            </>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Avatar({ name, size = 32, light = false }) {
  const ac = avatarColor(name);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: light ? 'rgba(255,255,255,0.18)' : ac.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.35, fontWeight: '700', color: light ? '#fff' : ac.text }}>{fmt.initials(name)}</Text>
    </View>
  );
}

function Pill({ label, bg, color, style }) {
  return (
    <View style={[{ borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: bg }, style]}>
      <Text style={{ fontSize: 10, fontWeight: '700', color }}>{label}</Text>
    </View>
  );
}

function EmptyCard({ text, btnText, onPress }) {
  return (
    <View style={{ backgroundColor: C.card, borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 14 }}>
      <Text style={{ color: C.textMuted, fontSize: 14, marginBottom: 12 }}>{text}</Text>
      {btnText && onPress && (
        <TouchableOpacity style={{ backgroundColor: C.greenLight, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 }} onPress={onPress}>
          <Text style={{ color: C.green, fontSize: 13, fontWeight: '600' }}>{btnText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.green },
  flex: { flex: 1, backgroundColor: C.bg },
  hdr: { backgroundColor: C.green, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 },
  hdrName: { fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: -0.4 },
  hdrDay: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  statRow: { flexDirection: 'row', gap: 6 },
  stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 10, padding: 8, alignItems: 'center' },
  statN: { fontSize: 18, fontWeight: '700', color: '#fff', lineHeight: 22 },
  statL: { fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 2, textAlign: 'center' },
  card: { backgroundColor: C.card, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  rowTitle: { fontSize: 12, fontWeight: '600', color: C.text },
  rowSub: { fontSize: 10, color: C.textMuted, marginTop: 1 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: C.border },
  pill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: C.card, borderWidth: 0.5, borderColor: C.border },
  pillText: { fontSize: 11, fontWeight: '600', color: C.textMuted },
  authInput: { backgroundColor: C.card, borderRadius: 10, padding: 14, fontSize: 15, color: C.text, borderWidth: 0.5, borderColor: C.border, marginBottom: 12 },
  greenBtn: { backgroundColor: C.green, borderRadius: 12, padding: 15, alignItems: 'center' },
  greenBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  errorText: { color: C.redDark, fontSize: 13, marginBottom: 10, backgroundColor: C.redLight, padding: 10, borderRadius: 8 },
  tabBar: { flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 0.5, borderTopColor: C.border, paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 6 },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  secLabel: { fontSize: 9, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, marginTop: 2 },
  formLabel: { fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
});
