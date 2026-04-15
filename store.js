// ============================================================
//  VG MENTORSHIP — store.js  (Client-side DB — localStorage)
//  Handles: Auth · Courses · Ebook · Orders · Admin · Leads
// ============================================================

const DB_KEY   = 'vgm_db';
const SALT     = 'vgm2026';

const PRODUCTS = {
  course_ds: {
    id: 'course_ds',
    type: 'course',
    title: 'Python + Data Science',
    subtitle: '3 Months · 2 Sessions/Week',
    price: 999,
    icon: '🐍',
    modules: [
      { id: 'm1', title: 'Python Basics', lessons: ['Variables & Data Types', 'Control Flow', 'Functions', 'File Handling'] },
      { id: 'm2', title: 'Data Analysis with Pandas', lessons: ['DataFrames', 'Cleaning Data', 'GroupBy & Aggregation', 'Merging'] },
      { id: 'm3', title: 'NumPy & Matplotlib', lessons: ['Array Operations', 'Broadcasting', 'Line Charts', 'Heatmaps'] },
      { id: 'm4', title: 'SQL Fundamentals', lessons: ['SELECT & WHERE', 'JOINs', 'Subqueries', 'CTEs'] },
      { id: 'm5', title: 'Power BI Dashboard', lessons: ['Connecting Sources', 'DAX Basics', 'KPI Cards', 'Publishing'] },
      { id: 'm6', title: 'Capstone Project', lessons: ['Dataset Selection', 'EDA', 'Dashboard Build', 'Presentation'] }
    ]
  },
  course_ml: {
    id: 'course_ml',
    type: 'course',
    title: 'Machine Learning + AI',
    subtitle: '6 Months · 3 Sessions/Week',
    price: 1999,
    icon: '🤖',
    modules: [
      { id: 'm1', title: 'Python + DS Foundation', lessons: ['Python Deep Dive', 'Advanced Pandas', 'Statistics for ML', 'EDA Mastery'] },
      { id: 'm2', title: 'Scikit-learn ML', lessons: ['Linear Regression', 'Logistic Regression', 'KNN & SVM', 'Model Evaluation'] },
      { id: 'm3', title: 'Advanced ML', lessons: ['Random Forest', 'XGBoost', 'Feature Engineering', 'SHAP Explanations'] },
      { id: 'm4', title: 'Deep Learning', lessons: ['Neural Networks', 'TensorFlow Keras', 'CNNs', 'Transfer Learning'] },
      { id: 'm5', title: 'GenAI & LLMs', lessons: ['Prompt Engineering', 'LangChain Basics', 'RAG Pipeline', 'OpenAI API'] },
      { id: 'm6', title: 'Production Deployment', lessons: ['Flask API', 'Docker Basics', 'Cloud Deploy', 'End-to-End Project'] }
    ]
  },
  ebook_ds: {
    id: 'ebook_ds',
    type: 'ebook',
    title: 'Data Science Roadmap E-Book',
    subtitle: '6-Month IIT-Level Guide · 150+ Pages',
    price: 1999,
    icon: '📘',
    downloadUrl: '#ebook-placeholder'
  }
};

// ─── DB Helpers ───────────────────────────────────────────
function loadDB() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || initDB(); }
  catch { return initDB(); }
}
function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function initDB() {
  const db = { users: {}, orders: [], leads: [], sessions: {} };
  saveDB(db);
  return db;
}
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (Math.imul(31, h) + str.charCodeAt(i)) | 0; }
  return Math.abs(h).toString(16);
}

// ─── Auth ─────────────────────────────────────────────────
const VGAuth = {
  register(name, email, phone, password) {
    const db = loadDB();
    const id = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (db.users[id]) return { ok: false, msg: 'Email already registered!' };
    db.users[id] = {
      id, name, email, phone,
      password: hash(password + SALT),
      enrollments: [],
      orders: [],
      createdAt: new Date().toISOString()
    };
    saveDB(db);
    this.setSession(id);
    return { ok: true, user: db.users[id] };
  },
  login(email, password) {
    const db = loadDB();
    const id = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const user = db.users[id];
    if (!user) return { ok: false, msg: 'Email not found. Please register!' };
    if (user.password !== hash(password + SALT)) return { ok: false, msg: 'Wrong password!' };
    this.setSession(id);
    return { ok: true, user };
  },
  setSession(uid) {
    const db = loadDB();
    const token = hash(uid + Date.now());
    db.sessions[token] = { uid, at: Date.now() };
    saveDB(db);
    sessionStorage.setItem('vgm_token', token);
    sessionStorage.setItem('vgm_uid', uid);
  },
  getUser() {
    const uid = sessionStorage.getItem('vgm_uid');
    if (!uid) return null;
    const db = loadDB();
    return db.users[uid] || null;
  },
  logout() {
    sessionStorage.removeItem('vgm_token');
    sessionStorage.removeItem('vgm_uid');
  },
  isLoggedIn() { return !!this.getUser(); }
};

// ─── Orders & Payments ────────────────────────────────────
const VGOrders = {
  create(productId, txnId) {
    const user = VGAuth.getUser();
    if (!user) return { ok: false, msg: 'Not logged in' };
    const db = loadDB();
    const product = PRODUCTS[productId];
    if (!product) return { ok: false, msg: 'Product not found' };
    const orderId = 'ORD' + Date.now();
    const order = {
      id: orderId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      productId,
      productTitle: product.title,
      amount: product.price,
      txnId: txnId || 'PENDING',
      status: 'pending',
      createdAt: new Date().toISOString(),
      verifiedAt: null
    };
    db.orders.push(order);
    db.users[user.id].orders.push(orderId);
    saveDB(db);
    return { ok: true, order };
  },
  getMyOrders() {
    const user = VGAuth.getUser();
    if (!user) return [];
    const db = loadDB();
    return db.orders.filter(o => o.userId === user.id);
  },
  isEnrolled(productId) {
    const user = VGAuth.getUser();
    if (!user) return false;
    const db = loadDB();
    const u = db.users[user.id];
    return u.enrollments.includes(productId);
  },
  // Admin: approve payment → enroll user
  approve(orderId) {
    const db = loadDB();
    const order = db.orders.find(o => o.id === orderId);
    if (!order) return false;
    order.status = 'paid';
    order.verifiedAt = new Date().toISOString();
    const user = db.users[order.userId];
    if (user && !user.enrollments.includes(order.productId)) {
      user.enrollments.push(order.productId);
    }
    saveDB(db);
    return true;
  },
  reject(orderId) {
    const db = loadDB();
    const order = db.orders.find(o => o.id === orderId);
    if (!order) return false;
    order.status = 'rejected';
    saveDB(db);
    return true;
  },
  getAll() { return loadDB().orders; }
};

// ─── Progress Tracking ───────────────────────────────────
const VGProgress = {
  getKey(productId) {
    const uid = sessionStorage.getItem('vgm_uid');
    return `vgm_progress_${uid}_${productId}`;
  },
  get(productId) {
    try { return JSON.parse(localStorage.getItem(this.getKey(productId))) || {}; }
    catch { return {}; }
  },
  complete(productId, moduleId, lessonIdx) {
    const p = this.get(productId);
    if (!p[moduleId]) p[moduleId] = [];
    if (!p[moduleId].includes(lessonIdx)) p[moduleId].push(lessonIdx);
    localStorage.setItem(this.getKey(productId), JSON.stringify(p));
  },
  pct(productId) {
    const product = PRODUCTS[productId];
    if (!product || !product.modules) return 0;
    const p = this.get(productId);
    let total = 0, done = 0;
    product.modules.forEach(m => {
      total += m.lessons.length;
      done += (p[m.id] || []).length;
    });
    return total ? Math.round((done / total) * 100) : 0;
  }
};

// ─── Leads ───────────────────────────────────────────────
const VGLeads = {
  save(data) {
    const db = loadDB();
    db.leads.push({ ...data, id: 'L' + Date.now(), at: new Date().toISOString() });
    saveDB(db);
  },
  getAll() { return loadDB().leads; }
};

// ─── Admin ───────────────────────────────────────────────
const VGAdmin = {
  PASS: 'VGAdmin@2026',
  isAuth() { return sessionStorage.getItem('vgm_admin') === '1'; },
  login(pass) {
    if (pass === this.PASS) { sessionStorage.setItem('vgm_admin', '1'); return true; }
    return false;
  },
  logout() { sessionStorage.removeItem('vgm_admin'); },
  getStats() {
    const db = loadDB();
    const orders = db.orders;
    return {
      students: Object.keys(db.users).length,
      totalOrders: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      paid: orders.filter(o => o.status === 'paid').length,
      revenue: orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.amount, 0),
      leads: db.leads.length
    };
  },
  getUsers() { return Object.values(loadDB().users); },
  broadcast(msg) {
    const db = loadDB();
    const key = `vgm_broadcast_${Date.now()}`;
    db._broadcast = { msg, at: new Date().toISOString() };
    saveDB(db);
    return true;
  }
};

// Export all
window.VGAuth = VGAuth;
window.VGOrders = VGOrders;
window.VGProgress = VGProgress;
window.VGLeads = VGLeads;
window.VGAdmin = VGAdmin;
window.PRODUCTS = PRODUCTS;

console.log('🔥 VG Mentorship Store loaded!');
