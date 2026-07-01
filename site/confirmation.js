import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import { db } from './firebaseClient.js';

const $ = (id) => document.getElementById(id);
const safeText = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

function render(booking) {
  $('confirmMessage').textContent = `Order ${booking.orderId || booking.id} is confirmed.`;
  $('confirmationPanel').innerHTML = `
    <span class="badge">${safeText(booking.status || 'Confirmed')}</span>
    <div class="confirmGrid">
      <div class="confirmItem"><span>Order ID</span><strong>${safeText(booking.orderId || booking.id)}</strong></div>
      <div class="confirmItem"><span>Payment ID</span><strong>${safeText(booking.razorpayPaymentId || booking.paymentId || 'Test payment')}</strong></div>
      <div class="confirmItem"><span>Puja</span><strong>${safeText(booking.pujaName || '')}</strong></div>
      <div class="confirmItem"><span>Temple</span><strong>${safeText(booking.temple || '')}</strong></div>
      <div class="confirmItem"><span>Date</span><strong>${safeText(booking.date || 'To be scheduled')}</strong></div>
      <div class="confirmItem"><span>Devotee</span><strong>${safeText(booking.userName || booking.devotee?.name || '')}</strong></div>
      <div class="confirmItem"><span>Gotra</span><strong>${safeText(booking.devotee?.gotra || 'Not provided')}</strong></div>
      <div class="confirmItem"><span>Amount Paid</span><strong>Rs ${Number(booking.amount || 0).toLocaleString('en-IN')}</strong></div>
    </div>
    <h3>What Happens Next</h3>
    <div class="nextSteps">
      <div><strong>1. Puja performed</strong><p class="muted">Team coordinates the ritual with pandit support.</p></div>
      <div><strong>2. Video sent</strong><p class="muted">Confirmation/video update is shared when available.</p></div>
      <div><strong>3. Prasad dispatched</strong><p class="muted">Delivery details are updated after dispatch.</p></div>
      <div><strong>4. Certificate emailed</strong><p class="muted">Certificate/report is emailed after completion.</p></div>
    </div>
    <div class="actions"><a class="primary" href="./bookings.html">View My Bookings</a><a class="secondary" href="./">Book Another Puja</a></div>
  `;
}

async function load() {
  const orderId = new URLSearchParams(location.search).get('orderId');
  let booking = null;
  if (orderId) {
    const snap = await getDoc(doc(db, 'bookings', orderId));
    if (snap.exists()) booking = { id: snap.id, ...snap.data() };
  }
  if (!booking) {
    try { booking = JSON.parse(sessionStorage.getItem('lastConfirmedBooking') || 'null'); } catch (error) { booking = null; }
  }
  if (!booking) {
    $('confirmMessage').textContent = 'Booking details were not found. Please check My Bookings.';
    $('confirmationPanel').innerHTML = '<a class="primary" href="./bookings.html">Open My Bookings</a>';
    return;
  }
  render(booking);
}

load().catch((error) => {
  $('confirmMessage').textContent = error.message || 'Could not load confirmation.';
  $('confirmMessage').classList.add('error');
});
