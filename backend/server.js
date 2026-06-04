const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const FuelLog = require('./models/FuelLog');
const AdminUser = require('./models/AdminUser');
const Request = require('./models/Request');
const Manager = require('./models/Manager');
const TripRequest = require('./models/TripRequest');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://loza-fleet.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true,
}));
app.use(express.json());

connectDB();

async function seedOwner() {
  const exists = await AdminUser.findOne({ username: 'owner' });
  if (!exists) {
    await AdminUser.create({ username: 'owner', password: '@loza123' });
    console.log('✅ Owner account created');
  }
}
setTimeout(seedOwner, 2000);

app.get('/', (req, res) => res.send('🚛 Loza Fleet API is Online'));

// ══════════════════════════════════════════════════════════════════
// OWNER ROUTES
// ══════════════════════════════════════════════════════════════════

app.post('/api/owner/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  try {
    const owner = await AdminUser.findOne({ username: 'owner' });
    if (!owner || owner.password !== password)
      return res.status(401).json({ error: 'Wrong password' });
    res.json({ success: true, message: 'Welcome, Owner!' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/owner/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Both fields required' });
  try {
    const owner = await AdminUser.findOne({ username: 'owner' });
    if (!owner || owner.password !== currentPassword)
      return res.status(401).json({ error: 'Current password is wrong' });
    owner.password = newPassword;
    await owner.save();
    res.json({ success: true, message: 'Password updated!' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/owner/drivers', async (req, res) => {
  const { id, name, plate, pin, phone } = req.body;
  if (!id || !name || !plate || !pin)
    return res.status(400).json({ error: 'Missing fields' });
  try {
    let driver = await Driver.findOne({ id });
    if (driver) {
      driver.name = name; driver.plate = plate;
      driver.pin = pin; driver.phone = phone || driver.phone;
      await driver.save();
    } else {
      driver = await Driver.create({ id, name, plate, pin, phone });
    }
    res.json(driver);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/owner/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/owner/notifications', async (req, res) => {
  try {
    const count = await Request.countDocuments({ status: 'pending' });
    const latest = await Request.find({ status: 'pending' })
      .sort({ createdAt: -1 }).limit(5).lean();
    res.json({ count, latest });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/owner/requests/:id/approve', async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id, { status: 'approved' }, { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, request });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/owner/requests/:id/deny', async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id, { status: 'denied' }, { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, request });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/owner/requests/:id/deny-with-note', async (req, res) => {
  const { note } = req.body;
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'denied', ownerNote: note || '' },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, request });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ══════════════════════════════════════════════════════════════════
// MANAGER ROUTES
// ══════════════════════════════════════════════════════════════════

app.post('/api/manager/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Missing fields' });
  try {
    const manager = await Manager.findOne({ username });
    if (!manager || manager.password !== password)
      return res.status(401).json({ error: 'Wrong credentials' });
    res.json({ success: true, manager });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/owner/managers', async (req, res) => {
  const { name, username, password, permissions } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });
  try {
    let manager = await Manager.findOne({ username });
    if (manager) {
      manager.name = name || manager.name;
      manager.password = password;
      if (permissions) manager.permissions = { ...manager.permissions, ...permissions };
      await manager.save();
    } else {
      manager = await Manager.create({ name, username, password, permissions: permissions || {} });
    }
    res.json({ success: true, manager });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/owner/managers', async (req, res) => {
  try {
    const managers = await Manager.find().lean();
    res.json(managers);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/owner/managers/:id', async (req, res) => {
  try {
    await Manager.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ══════════════════════════════════════════════════════════════════
// DRIVER ROUTES
// ══════════════════════════════════════════════════════════════════

app.post('/api/drivers/login', async (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN required' });
  try {
    const driver = await Driver.findOne({ pin });
    if (!driver) return res.status(401).json({ error: 'Invalid PIN' });
    res.json(driver);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/drivers/request', async (req, res) => {
  const { driverId, type, amount, description, phone } = req.body;
  if (!driverId || !type || !amount)
    return res.status(400).json({ error: 'Missing fields' });
  try {
    const driver = await Driver.findOne({ id: driverId });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    const request = await Request.create({
      driverId, driverName: driver.name, plate: driver.plate,
      type, amount: Number(amount), description: description || '',
      phone: phone || driver.phone,
    });
    res.json({ success: true, request });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/drivers/:driverId/requests', async (req, res) => {
  try {
    const requests = await Request.find({ driverId: req.params.driverId })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/drivers/:driverId/history', async (req, res) => {
  try {
    const trips = await Trip.find({ driverId: req.params.driverId })
      .sort({ createdAt: -1 }).lean();
    const fuels = await FuelLog.find({ driverId: req.params.driverId })
      .sort({ createdAt: -1 }).lean();
    const history = [
      ...trips.map(t => ({ type: 'trip', amount: 800, date: t.createdAt })),
      ...fuels.map(f => ({ type: 'fuel', amount: f.amount, date: f.createdAt })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(history);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/drivers/:driverId/rate', async (req, res) => {
  const { rating, note } = req.body;
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating must be 1-5' });
  try {
    const driver = await Driver.findOneAndUpdate(
      { id: req.params.driverId },
      { rating: Number(rating), ratingNote: note || '' },
      { new: true }
    );
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json({ success: true, driver });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ══════════════════════════════════════════════════════════════════
// TRIP VERIFICATION ROUTES
// ══════════════════════════════════════════════════════════════════

app.post('/api/trips/request', async (req, res) => {
  const { driverId } = req.body;
  if (!driverId) return res.status(400).json({ error: 'driverId required' });
  try {
    const driver = await Driver.findOne({ id: driverId });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    const tripRequest = await TripRequest.create({
      driverId, driverName: driver.name, plate: driver.plate,
    });
    res.json({ success: true, tripRequest });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/trips/requests', async (req, res) => {
  try {
    const requests = await TripRequest.find()
      .sort({ createdAt: -1 }).limit(50).lean();
    res.json(requests);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/trips/requests/:id/approve', async (req, res) => {
  try {
    const tripRequest = await TripRequest.findByIdAndUpdate(
      req.params.id, { status: 'approved' }, { new: true }
    );
    if (!tripRequest) return res.status(404).json({ error: 'Not found' });
    const driver = await Driver.findOneAndUpdate(
      { id: tripRequest.driverId },
      { $inc: { trips: 1, profit: 800, bonus: 50 } },
      { new: true }
    );
    await Trip.create({ driverId: tripRequest.driverId });
    res.json({ success: true, tripRequest, driver });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/trips/requests/:id/deny', async (req, res) => {
  try {
    const tripRequest = await TripRequest.findByIdAndUpdate(
      req.params.id, { status: 'denied' }, { new: true }
    );
    if (!tripRequest) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, tripRequest });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/trips/requests/pending/count', async (req, res) => {
  try {
    const count = await TripRequest.countDocuments({ status: 'pending' });
    const latest = await TripRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 }).limit(5).lean();
    res.json({ count, latest });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ══════════════════════════════════════════════════════════════════
// CHARTS & STATS
// ══════════════════════════════════════════════════════════════════

app.get('/api/stats/charts', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const trips = await Trip.find({ createdAt: { $gte: sevenDaysAgo } }).lean();
    const fuels = await FuelLog.find({ createdAt: { $gte: sevenDaysAgo } }).lean();
    const drivers = await Driver.find().lean();
    const tripsByDay = {}, fuelByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      tripsByDay[key] = 0; fuelByDay[key] = 0;
    }
    trips.forEach(t => {
      const key = new Date(t.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (tripsByDay[key] !== undefined) tripsByDay[key]++;
    });
    fuels.forEach(f => {
      const key = new Date(f.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (fuelByDay[key] !== undefined) fuelByDay[key] += f.amount;
    });
    const dailyTrips = Object.entries(tripsByDay).map(([date, count]) => ({ date, count }));
    const dailyFuel = Object.entries(fuelByDay).map(([date, amount]) => ({ date, amount }));
    const profitPerDriver = drivers.map(d => ({
      name: d.name, profit: d.profit, fuel: d.fuel,
      net: d.profit - d.fuel, trips: d.trips,
    })).sort((a, b) => b.net - a.net).slice(0, 10);
    res.json({ dailyTrips, dailyFuel, profitPerDriver });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/stats/daily-trips', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayTrips = await TripRequest.find({
      status: 'approved',
      createdAt: { $gte: today, $lt: tomorrow }
    }).lean();
    const countMap = {};
    todayTrips.forEach(t => {
      countMap[t.driverId] = (countMap[t.driverId] || 0) + 1;
    });
    res.json(countMap);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/fleet', async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ profit: -1 });
    res.json(drivers);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/fleet/activity', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 }).limit(25).lean();
    const fuels = await FuelLog.find().sort({ createdAt: -1 }).limit(25).lean();
    const driverIds = [...new Set([...trips.map(t => t.driverId), ...fuels.map(f => f.driverId)])];
    const drivers = await Driver.find({ id: { $in: driverIds } }).lean();
    const driverMap = {};
    drivers.forEach(d => { driverMap[d.id] = d; });
    const activity = [
      ...trips.map(t => ({ type: 'trip', logged_at: t.createdAt, driver: driverMap[t.driverId]?.name || 'Unknown', plate: driverMap[t.driverId]?.plate || '---', amount: 800 })),
      ...fuels.map(f => ({ type: 'fuel', logged_at: f.createdAt, driver: driverMap[f.driverId]?.name || 'Unknown', plate: driverMap[f.driverId]?.plate || '---', amount: f.amount })),
    ].sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at)).slice(0, 50);
    res.json(activity);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.listen(PORT, () => {
  console.log(`🚛 Loza Fleet API running on http://localhost:${PORT}`);
});