const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const FuelLog = require('./models/FuelLog');
const AdminUser = require('./models/AdminUser');
const Request = require('./models/Request');
const TripRequest = require('./models/TripRequest');
const Manager = require('./models/Manager');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

// Seed owner
async function seedOwner() {
  const exists = await AdminUser.findOne({ username: 'owner' });
  if (!exists) {
    await AdminUser.create({ username: 'owner', password: '@loza123' });
    console.log('✅ Owner account created');
  }
}
setTimeout(seedOwner, 2000);

app.get('/', (req, res) => res.send('🚛 Loza Fleet API is Online'));

// ══════════════════════════════════════════════════════════════
// OWNER ROUTES
// ══════════════════════════════════════════════════════════════

app.post('/api/owner/login', async (req, res) => {
  const { password } = req.body;
  try {
    const owner = await AdminUser.findOne({ username: 'owner' });
    if (!owner || owner.password !== password)
      return res.status(401).json({ error: 'Wrong password' });
    res.json({ success: true });
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

app.post('/api/owner/requests/:id/approve', async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id, { status: 'approved' }, { new: true }
    );
    res.json({ success: true, request });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/owner/requests/:id/deny', async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id, { status: 'denied' }, { new: true }
    );
    res.json({ success: true, request });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/owner/requests/:id/note', async (req, res) => {
  const { note } = req.body;
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id, { ownerNote: note }, { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ success: true, request });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Manager routes
app.post('/api/manager/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Missing fields' });
  try {
    const manager = await Manager.findOne({ username });
    if (!manager || manager.password !== password)
      return res.status(401).json({ error: 'Wrong username or password' });
    res.json({ success: true, manager });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/owner/managers', async (req, res) => {
  const { name, username, password, permissions } = req.body;
  if (!name || !username || !password)
    return res.status(400).json({ error: 'Missing fields' });
  try {
    let manager = await Manager.findOne({ username });
    if (manager) {
      manager.name = name; manager.password = password;
      if (permissions) manager.permissions = permissions;
      await manager.save();
    } else {
      manager = await Manager.create({ name, username, password, permissions });
    }
    res.json(manager);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/owner/managers', async (req, res) => {
  try {
    const managers = await Manager.find().sort({ createdAt: -1 });
    res.json(managers);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/owner/managers/:id', async (req, res) => {
  try {
    await Manager.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ══════════════════════════════════════════════════════════════
// TRIP REQUESTS
// ══════════════════════════════════════════════════════════════

app.get('/api/owner/trip-requests', async (req, res) => {
  try {
    const trips = await TripRequest.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/owner/trip-requests/:id/approve', async (req, res) => {
  try {
    const tripReq = await TripRequest.findByIdAndUpdate(
      req.params.id, { status: 'approved' }, { new: true }
    );
    if (!tripReq) return res.status(404).json({ error: 'Not found' });
    await Driver.findOneAndUpdate(
      { id: tripReq.driverId },
      { $inc: { trips: 1, profit: 800, bonus: 50 } }
    );
    await Trip.create({ driverId: tripReq.driverId });
    res.json({ success: true, tripReq });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/owner/trip-requests/:id/deny', async (req, res) => {
  try {
    const tripReq = await TripRequest.findByIdAndUpdate(
      req.params.id, { status: 'denied' }, { new: true }
    );
    res.json({ success: true, tripReq });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ══════════════════════════════════════════════════════════════
// DRIVER ROUTES
// ══════════════════════════════════════════════════════════════

app.post('/api/drivers/login', async (req, res) => {
  const { pin } = req.body;
  try {
    const driver = await Driver.findOne({ pin });
    if (!driver) return res.status(401).json({ error: 'Invalid PIN' });
    res.json(driver);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/trips/request', async (req, res) => {
  const { driverId, note } = req.body;
  if (!driverId) return res.status(400).json({ error: 'driverId required' });
  try {
    const driver = await Driver.findOne({ id: driverId });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    const tripReq = await TripRequest.create({
      driverId, driverName: driver.name, plate: driver.plate, note: note || '',
    });
    res.json({ success: true, tripReq });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/drivers/:driverId/trip-requests', async (req, res) => {
  try {
    const trips = await TripRequest.find({ driverId: req.params.driverId })
      .sort({ createdAt: -1 });
    res.json(trips);
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
      type, amount: Number(amount),
      description: description || '', phone: phone || driver.phone,
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

app.post('/api/fuel', async (req, res) => {
  const { driverId, amount } = req.body;
  if (!driverId || !amount) return res.status(400).json({ error: 'Missing fields' });
  try {
    const driver = await Driver.findOneAndUpdate(
      { id: driverId },
      { $inc: { fuel: Number(amount) } },
      { new: true }
    );
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    await FuelLog.create({ driverId, amount: Number(amount) });
    res.json({ success: true, fuel: driver.fuel });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ══════════════════════════════════════════════════════════════
// FLEET
// ══════════════════════════════════════════════════════════════

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
      ...trips.map(t => ({
        type: 'trip', logged_at: t.createdAt,
        driver: driverMap[t.driverId]?.name || 'Unknown',
        plate: driverMap[t.driverId]?.plate || '---', amount: 800
      })),
      ...fuels.map(f => ({
        type: 'fuel', logged_at: f.createdAt,
        driver: driverMap[f.driverId]?.name || 'Unknown',
        plate: driverMap[f.driverId]?.plate || '---', amount: f.amount
      })),
    ].sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at)).slice(0, 50);
    res.json(activity);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ══════════════════════════════════════════════════════════════
// EXPORT ROUTES
// ══════════════════════════════════════════════════════════════

app.get('/api/export/excel', async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ profit: -1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Fleet Report');

    sheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'License ID', key: 'id', width: 15 },
      { header: 'Plate', key: 'plate', width: 15 },
      { header: 'Trips', key: 'trips', width: 10 },
      { header: 'Fuel (ETB)', key: 'fuel', width: 15 },
      { header: 'Bonus', key: 'bonus', width: 15 },
      { header: 'Profit', key: 'profit', width: 15 },
      { header: 'Net Profit', key: 'net', width: 15 },
    ];

    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      cell.alignment = { horizontal: 'center' };
    });

    drivers.forEach(d => {
      const net = Number(d.profit) - Number(d.fuel);
      sheet.addRow({
        name: d.name, id: d.id, plate: d.plate,
        trips: d.trips, fuel: Number(d.fuel),
        bonus: Number(d.bonus), profit: Number(d.profit), net,
      });
    });

    const totalRow = sheet.addRow({
      name: 'TOTAL',
      trips: drivers.reduce((s, d) => s + Number(d.trips), 0),
      fuel: drivers.reduce((s, d) => s + Number(d.fuel), 0),
      bonus: drivers.reduce((s, d) => s + Number(d.bonus), 0),
      profit: drivers.reduce((s, d) => s + Number(d.profit), 0),
      net: drivers.reduce((s, d) => s + Number(d.profit) - Number(d.fuel), 0),
    });
    totalRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=loza-fleet-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
});

app.get('/api/export/pdf', async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ profit: -1 });
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=loza-fleet-report.pdf');
    doc.pipe(res);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('LOZA CONSTRUCTION PLC', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Fleet Management Report', { align: 'center' });
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // Summary
    const totalTrips = drivers.reduce((s, d) => s + Number(d.trips), 0);
    const totalFuel = drivers.reduce((s, d) => s + Number(d.fuel), 0);
    const totalBonus = drivers.reduce((s, d) => s + Number(d.bonus), 0);
    const totalProfit = drivers.reduce((s, d) => s + Number(d.profit) - Number(d.fuel), 0);

    doc.fontSize(11).font('Helvetica-Bold').text('FLEET SUMMARY', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total Drivers: ${drivers.length}`);
    doc.text(`Total Trips:   ${totalTrips.toLocaleString()}`);
    doc.text(`Total Fuel:    ${totalFuel.toLocaleString()} ETB`);
    doc.text(`Total Bonus:   ${totalBonus.toLocaleString()} ETB`);
    doc.text(`Net Profit:    ${totalProfit.toLocaleString()} ETB`);
    doc.moveDown(1.5);

    // Table header
    doc.fontSize(11).font('Helvetica-Bold').text('DRIVER BREAKDOWN', { underline: true });
    doc.moveDown(0.5);

    const colX = [40, 160, 240, 300, 370, 440, 510];
    const headers = ['Name', 'Plate', 'Trips', 'Fuel', 'Bonus', 'Profit', 'Net'];

    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((h, i) => {
      doc.text(h, colX[i], doc.y, { width: 80, continued: i < headers.length - 1 });
    });
    doc.moveDown(0.3);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);

    doc.fontSize(9).font('Helvetica');
    drivers.forEach((d, idx) => {
      const net = Number(d.profit) - Number(d.fuel);
      const y = doc.y;
      const values = [
        d.name.substring(0, 16),
        d.plate,
        d.trips.toString(),
        Number(d.fuel).toLocaleString(),
        Number(d.bonus).toLocaleString(),
        Number(d.profit).toLocaleString(),
        net.toLocaleString(),
      ];
      values.forEach((v, i) => {
        doc.text(v, colX[i], y, { width: 80, continued: i < values.length - 1 });
      });
      doc.moveDown(0.5);
      if (idx < drivers.length - 1) {
        doc.moveTo(40, doc.y - 3).lineTo(555, doc.y - 3).strokeColor('#cccccc').stroke();
        doc.strokeColor('#000000');
      }
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚛 Loza Fleet API running on http://localhost:${PORT}`);
});