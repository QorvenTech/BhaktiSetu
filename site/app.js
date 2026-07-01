import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { addDoc, collection, doc, getFirestore, initializeFirestore, setDoc } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBKLoZ1QkuM2TGzwsaOp-GVQ5CKlCS3lu8',
  authDomain: 'bhaktisetu-e0e1a.firebaseapp.com',
  projectId: 'bhaktisetu-e0e1a',
  storageBucket: 'bhaktisetu-e0e1a.firebasestorage.app',
  messagingSenderId: '415010856816',
  appId: '1:415010856816:web:replace-with-web-app-id',
};

const app = initializeApp(firebaseConfig);
let db;
try {
  db = initializeFirestore(app, {}, 'default');
} catch (error) {
  db = getFirestore(app, 'default');
}

const pujas = [
  { id: 'mahakal-abhishek', name: 'Mahakal Abhishek', temple: 'Shri Mahakaleshwar Temple, Ujjain', price: 1101, category: 'shiva', tag: 'Most Popular', image: 'https://images.unsplash.com/photo-1609947017136-9daf32a5eb16?auto=format&fit=crop&w=1200&q=86', description: 'Rudrabhishek sankalp for peace, health, protection, and spiritual strength.' },
  { id: 'maha-rudrabhishek', name: 'Maha Rudrabhishek', temple: 'Kashi Vishwanath Temple, Varanasi', price: 2501, category: 'shiva', tag: 'Jyotirlinga', image: 'https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&w=1200&q=86', description: 'Vedic chanting and sacred abhishek with experienced pandit coordination.' },
  { id: 'kaal-sarp-dosh', name: 'Kaal Sarp Dosh Nivaran', temple: 'Trimbakeshwar Temple, Nashik', price: 2301, category: 'dosha', tag: 'Dosh Nivaran', image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=86', description: 'Special sankalp for obstacles, dosha nivaran, and family peace.' },
  { id: 'satyanarayan-katha', name: 'Satyanarayan Katha', temple: 'Satyanarayan Temple, Prayagraj', price: 751, category: 'grah', tag: 'Family Puja', image: 'https://images.unsplash.com/photo-1577083753695-e010191bacb5?auto=format&fit=crop&w=1200&q=86', description: 'Auspicious katha and prasad offering for prosperity and gratitude.' },
  { id: 'grah-shanti-puja', name: 'Grah Shanti Puja', temple: 'Navagraha Shani Temple, Ujjain', price: 1451, category: 'grah', tag: 'Navagraha', image: 'https://images.unsplash.com/photo-1624461084896-cc7d24a163fc?auto=format&fit=crop&w=1200&q=86', description: 'Navagraha shanti sankalp for balance, stability, and smoother life events.' },
  { id: 'mangal-dosh-puja', name: 'Mangal Dosh Puja', temple: 'Kuja Mangal Temple, Ujjain', price: 1351, category: 'dosha', tag: 'Marriage Support', image: 'https://images.unsplash.com/photo-1618759287629-ca56d8af2d10?auto=format&fit=crop&w=1200&q=86', description: 'Puja support for Mangal dosh, marriage harmony, and family blessings.' },
];

let selectedPuja = pujas[0];
let activeFilter = 'all';

const $ = (id) => document.getElementById(id);

function getVisiblePujas() {
  const value = $('search').value.trim().toLowerCase();
  return pujas.filter((puja) => {
    const matchesFilter = activeFilter === 'all' || puja.category === activeFilter;
    const matchesSearch = `${puja.name} ${puja.temple} ${puja.category} ${puja.description}`.toLowerCase().includes(value);
    return matchesFilter && matchesSearch;
  });
}

function renderPujas(items = getVisiblePujas()) {
  $('pujaGrid').innerHTML = items.length ? items.map((puja) => `
    <article class="card">
      <img src="${puja.image}" alt="${puja.name}">
      <div class="cardBody">
        <div class="tagRow"><span>${puja.tag}</span><strong>Rs ${puja.price.toLocaleString('en-IN')}</strong></div>
        <h3>${puja.name}</h3>
        <p class="muted">${puja.temple}</p>
        <p>${puja.description}</p>
        <button class="cardBtn" data-book="${puja.id}">Book</button>
      </div>
    </article>
  `).join('') : '<p class="muted">No pujas found. Try another search.</p>';

  document.querySelectorAll('[data-book]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedPuja = pujas.find((puja) => puja.id === button.dataset.book) || pujas[0];
      updateSelectedPuja();
      location.hash = '#book';
    });
  });
}

function updateSelectedPuja() {
  $('selectedPujaTitle').textContent = selectedPuja.name;
  $('selectedPujaTemple').textContent = selectedPuja.temple;
  $('selectedPujaPrice').textContent = `Rs ${selectedPuja.price.toLocaleString('en-IN')}`;
  $('selectedPujaImage').src = selectedPuja.image;
}

async function submitBooking(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get('name') || '').trim();
  const gotra = String(form.get('gotra') || '').trim();
  if (!name) {
    $('bookingMessage').textContent = 'Please enter devotee name.';
    return;
  }
  const orderId = `WEB${Date.now().toString().slice(-8)}`;
  try {
    await setDoc(doc(db, 'bookings', orderId), {
      orderId,
      channel: 'website',
      pujaId: selectedPuja.id,
      pujaName: selectedPuja.name,
      temple: selectedPuja.temple,
      amount: selectedPuja.price,
      userName: name,
      userPhone: String(form.get('phone') || '').trim(),
      userEmail: String(form.get('email') || '').trim(),
      date: String(form.get('date') || ''),
      devotee: { name, gotra, phone: String(form.get('phone') || '').trim(), purpose: String(form.get('purpose') || '').trim() },
      status: 'Website Request',
      paymentStatus: 'test_mode_not_collected',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'bookingOpsShares', orderId), { devoteeName: name, gotra });
    await addDoc(collection(db, 'adminNotifications'), {
      audience: 'admin',
      orderId,
      title: 'New website booking request',
      message: `${selectedPuja.name} requested by ${name}. Payment is not collected on website yet.`,
      unread: true,
      createdAt: new Date().toISOString(),
    });
    event.currentTarget.reset();
    $('bookingMessage').textContent = `Request saved. Reference: ${orderId}`;
  } catch (error) {
    $('bookingMessage').textContent = error.message || 'Could not save request.';
  }
}

$('search').addEventListener('input', () => renderPujas());
$('bookingForm').addEventListener('submit', submitBooking);
document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    renderPujas();
  });
});

renderPujas();
updateSelectedPuja();
