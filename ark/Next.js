const initialProducts = [
  { id: "rm21-1", title: "Real Madrid Home 2021 - Replica", category: "Football Kits", price: 3500, img: "https://picsum.photos/seed/rm1/600/600", seller: "Official Store", description: "Replica kit — breathable fabric." },
  { id: "bar20-1", title: "FC Barcelona Away 2020 - Replica", category: "Football Kits", price: 4200, img: "https://picsum.photos/seed/bar1/600/600", seller: "SportsHub", description: "Comfort fit with official badge." },
  { id: "ron-99", title: "Cristiano Ronaldo Classic", category: "Football Kits", price: 3000, img: "https://picsum.photos/seed/ron/600/600", seller: "FanStore", description: "All-time classic Ronaldo kit." },
  { id: "messi-10", title: "Lionel Messi Legacy", category: "Football Kits", price: 3200, img: "https://picsum.photos/seed/messi/600/600", seller: "FanStore", description: "Commemorative Messi kit." },
  { id: "tshirt-basic", title: "Casual T-Shirt", category: "Clothing", price: 1200, img: "https://picsum.photos/seed/t1/600/600", seller: "Trendy", description: "100% cotton tee." },
  { id: "jeans-blue", title: "Slim Jeans", category: "Clothing", price: 2800, img: "https://picsum.photos/seed/j1/600/600", seller: "Denim", description: "Stretch denim slim fit." },
  { id: "watch-01", title: "Sport Watch", category: "Watches", price: 4500, img: "https://picsum.photos/seed/w1/600/600", seller: "WatchCo", description: "Water-resistant. Lightweight." },
  { id: "sneaker-01", title: "Urban Sneakers", category: "Shoes", price: 3900, img: "https://picsum.photos/seed/s1/600/600", seller: "ShoePoint", description: "Comfortable everyday sneakers." }
];

const saveLocal = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const loadLocal = (k, fallback) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fallback; } catch { return fallback; } };

// ---------- App ----------
export default function App() {
  const [products, setProducts] = useState(loadLocal("products", initialProducts));
  const [cart, setCart] = useState(loadLocal("cart", []));
  const [user, setUser] = useState(loadLocal("user", null));
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alerts, setAlerts] = useState(loadLocal("alerts", [])); // users opted in for product alerts
  const [isSellerMode, setIsSellerMode] = useState(false);
  const [geoOK, setGeoOK] = useState(true); // assume true; integrate with IP geolocation API server-side

  useEffect(() => saveLocal("products", products), [products]);
  useEffect(() => saveLocal("cart", cart), [cart]);
  useEffect(() => saveLocal("user", user), [user]);
  useEffect(() => saveLocal("alerts", alerts), [alerts]);

  useEffect(() => {
    // GEO-RESTRICTION: In production, call an IP geolocation endpoint from your server
    // For demo, we allow all. Example integration (server-side): https://ipapi.co/json
    // If country !== 'PK' then setGeoOK(false)
    setGeoOK(true);
  }, []);

  function addToCart(product, qty = 1) {
    setCart(prev => {
      const found = prev.find(i => i.id === product.id);
      if (found) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
    setShowCart(true);
  }

  function removeFromCart(pid) {
    setCart(prev => prev.filter(i => i.id !== pid));
  }

  function updateQty(pid, qty) {
    setCart(prev => prev.map(i => i.id === pid ? { ...i, qty } : i));
  }

  function placeOrder(orderDetails) {
    // In production: POST /api/orders with payment verification
    // For demo we'll store orders in localStorage under user.orders
    const orders = loadLocal("orders", []);
    const newOrder = { id: `ORD-${Date.now()}`, items: cart, total: cart.reduce((s,i)=>s+i.price*i.qty,0), details: orderDetails, date: new Date().toISOString() };
    saveLocal("orders", [newOrder, ...orders]);
    setCart([]);
    // Email automation: call backend to send confirmation email to buyer
    // e.g., POST /api/send-email {to: user.email, subject: 'Order Confirmation', body: ...}

    return newOrder;
  }

  function registerSellerProfile(profile) {
    // In production: submit to server for review
    const sellers = loadLocal("sellers", []);
    saveLocal("sellers", [...sellers, profile]);
    alert("Seller profile submitted (demo). In production, admin review will follow.");
  }

  function addProduct(newProduct) {
    // enforce price range
    if (newProduct.price < 1000 || newProduct.price > 5000) {
      alert("Price must be between PKR 1,000 and PKR 5,000.");
      return false;
    }
    setProducts(prev => [ { ...newProduct, id: `${newProduct.title}-${Date.now()}` }, ...prev ]);

    // Notify product-alert subscribers (demo): call backend to send emails
    const subs = loadLocal("product_alert_subs", []);
    if (subs.length) {
      // Demo: record simulated notifications
      setAlerts(prev => [ { id: `alert-${Date.now()}`, count: subs.length, message: `New product: ${newProduct.title}`, date: new Date().toISOString() }, ...prev ]);
      // In production: POST /api/notify-subscribers {product: newProduct}
    }
    return true;
  }

  if (!geoOK) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-bold">Service available in Pakistan only</h2>
          <p className="mt-4">We're sorry — this store is currently restricted to users in Pakistan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <Header user={user} onNavigate={setPage} cartCount={cart.reduce((s,i)=>s+i.qty,0)} onToggleCart={()=>setShowCart(v=>!v)} onSearch={setQuery} setUser={setUser} isSellerMode={isSellerMode} setIsSellerMode={setIsSellerMode} />

      <main className="max-w-7xl mx-auto p-4">
        {page === 'home' && (
          <Home products={products} query={query} addToCart={addToCart} setPage={setPage} setShowAddModal={setShowAddModal} user={user} />
        )}
        {page === 'about' && <AboutPage />}
        {page === 'contact' && <ContactPage owner={{phone: '03423296320', emails: ['njv@njv.edu.pk','abdulrazzaque786.soo@gmail.com'], address: 'MA Jinnah Road, Saddar, Karachi, Pakistan'}} />}
        {page === 'orders' && <OrdersPage />}
        {page === 'manage' && <SellerDashboard products={products} addProduct={addProduct} alerts={alerts} />}

        <div className="mt-8" />
      </main>

      <Footer onNavigate={setPage} />

      {showCart && <CartDrawer cart={cart} removeFromCart={removeFromCart} updateQty={updateQty} onClose={()=>setShowCart(false)} onCheckout={(details)=>{ const o = placeOrder(details); alert('Order placed: '+o.id); }} />}

      {showAddModal && <AddProductModal onClose={()=>setShowAddModal(false)} onAdd={(p)=>{ if (addProduct(p)) setShowAddModal(false); }} seller={user?.name || 'Guest Seller'} />}

      <AuthModal onLogin={(u)=>setUser(u)} />

      {/* Floating seller CTA */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-lg" onClick={()=>{ setPage('manage'); setIsSellerMode(true); }}>
          Become a Seller
        </button>
      </div>
    </div>
  );
}

// ---------- Components ----------
function Header({ user, onNavigate, cartCount, onToggleCart, onSearch, setUser, isSellerMode, setIsSellerMode }){
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-indigo-600 cursor-pointer" onClick={()=>onNavigate('home')}>PK-Shop</div>
          <nav className="hidden md:flex gap-3 text-sm">
            <button className="hover:underline" onClick={()=>onNavigate('home')}>Home</button>
            <button className="hover:underline" onClick={()=>onNavigate('about')}>About Us</button>
            <button className="hover:underline" onClick={()=>onNavigate('contact')}>Contact</button>
            <button className="hover:underline" onClick={()=>onNavigate('orders')}>My Orders</button>
          </nav>
        </div>

        <div className="flex-1 mx-4 max-w-2xl">
          <input onChange={(e)=>onSearch(e.target.value)} placeholder="Search T-shirts, kits, watches..." className="w-full border rounded p-3" />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs">Seller Mode
            <input type="checkbox" checked={isSellerMode} onChange={(e)=>setIsSellerMode(e.target.checked)} className="ml-2" />
          </label>

          <button className="relative" onClick={onToggleCart} aria-label="Cart">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4" /></svg>
            {cartCount>0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2">{cartCount}</span>}
          </button>

          {user ? (
            <div className="text-sm">
              <div className="font-medium">{user.name}</div>
              <button className="text-xs text-gray-500" onClick={()=>{ setUser(null); }}>Sign out</button>
            </div>
          ) : (
            <div className="text-sm">
              <button className="bg-indigo-600 text-white px-3 py-2 rounded" onClick={()=>document.dispatchEvent(new Event('open-auth'))}>Sign in</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Home({ products, query, addToCart, setPage, setShowAddModal, user }){
  const categories = [...new Set(products.map(p=>p.category))];
  const filtered = products.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <Hero onSell={()=>setShowAddModal(true)} />

      <section className="mt-8">
        <h3 className="text-xl font-semibold">Featured Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {categories.map(c => (
            <div key={c} className="rounded-lg overflow-hidden shadow hover:scale-105 transform transition p-4 bg-white">
              <div className="h-32 bg-cover bg-center rounded" style={{backgroundImage:`url(https://picsum.photos/seed/${c}/400/200)`}}></div>
              <div className="mt-2 font-medium">{c}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Products</h3>
          <div className="text-sm text-gray-600">Showing {filtered.length} items</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onAdd={()=>addToCart(p)} onView={()=>{ setPage('product'); }} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Hero({ onSell }){
  return (
    <div className="rounded-lg p-6 bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-lg flex flex-col md:flex-row items-center gap-6">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-extrabold">Affordable fashion & authentic kits — shipped across Pakistan</h1>
        <p className="mt-3 max-w-xl">Curated selection of clothing, football kits, watches and shoes — all priced PKR 1,000 to PKR 5,000. Sellers welcome.</p>
        <div className="mt-4 flex gap-3">
          <button className="bg-white text-indigo-600 px-4 py-3 rounded-lg font-semibold">Shop Now</button>
          <button className="bg-transparent border border-white px-4 py-3 rounded-lg" onClick={onSell}>Start Selling</button>
        </div>
      </div>
      <div className="w-56 h-56 bg-white rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
        <img src="https://picsum.photos/seed/hero/400/400" alt="hero" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd }){
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img src={product.img} alt={product.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="font-semibold">{product.title}</div>
        <div className="text-sm text-gray-500">{product.seller}</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-bold">PKR {product.price.toLocaleString()}</div>
          <button onClick={onAdd} className="bg-indigo-600 text-white px-3 py-2 rounded">Add</button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onClose, removeFromCart, updateQty, onCheckout }){
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black bg-opacity-30" onClick={onClose}></div>
      <div className="w-full md:w-96 bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Cart</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        <div className="mt-4 space-y-4">
          {cart.length===0 && <div className="text-gray-500">Cart is empty.</div>}
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <img src={item.img} alt="" className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-gray-500">PKR {item.price.toLocaleString()}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={()=>updateQty(item.id, Math.max(1, item.qty-1))} className="px-2 py-1 border rounded">-</button>
                  <div className="px-3">{item.qty}</div>
                  <button onClick={()=>updateQty(item.id, item.qty+1)} className="px-2 py-1 border rounded">+</button>
                </div>
              </div>
              <div>
                <button onClick={()=>removeFromCart(item.id)} className="text-sm text-red-500">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between text-lg font-bold">Total <span>PKR {total.toLocaleString()}</span></div>
          <CheckoutForm onSubmit={(details)=>onCheckout(details)} />
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({ onSubmit }){
  const [method, setMethod] = useState('easypaisa');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  function submit(e){
    e.preventDefault();
    // In production: initiate payment via backend then redirect to payment provider
    // For demo we call onSubmit with details
    onSubmit({ name, phone, email, method });
  }

  return (
    <form onSubmit={submit} className="mt-3">
      <div className="space-y-2">
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full border p-2 rounded" />
        <input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile (e.g., 03XXXXXXXXX)" className="w-full border p-2 rounded" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (optional)" className="w-full border p-2 rounded" />

        <div className="mt-2">
          <label className="mr-3"><input type="radio" checked={method==='easypaisa'} onChange={()=>setMethod('easypaisa')} /> EasyPaisa</label>
          <label className="ml-3"><input type="radio" checked={method==='jazzcash'} onChange={()=>setMethod('jazzcash')} /> JazzCash</label>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded mt-3">Proceed to Pay</button>
        <div className="text-xs text-gray-500 mt-2">(Demo) Payment integrations require server-side implementation for EasyPaisa & JazzCash APIs.</div>
      </div>
    </form>
  );
}

function AddProductModal({ onClose, seller, onAdd }){
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Clothing');
  const [price, setPrice] = useState(1200);
  const [img, setImg] = useState('https://picsum.photos/seed/new/600/600');
  const [desc, setDesc] = useState('');

  function submit(e){
    e.preventDefault();
    const p = { title, category, price: Number(price), img, description: desc, seller };
    if(onAdd(p)){
      // success
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-6 z-10 w-full max-w-xl shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add New Product</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Product title" className="w-full border p-2 rounded" />
          <div className="flex gap-2">
            <select value={category} onChange={e=>setCategory(e.target.value)} className="flex-1 border p-2 rounded">
              <option>Clothing</option>
              <option>Football Kits</option>
              <option>Watches</option>
              <option>Shoes</option>
            </select>
            <input value={price} onChange={e=>setPrice(e.target.value)} type="number" className="w-36 border p-2 rounded" placeholder="Price PKR" />
          </div>
          <input value={img} onChange={e=>setImg(e.target.value)} placeholder="Image URL" className="w-full border p-2 rounded" />
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="w-full border p-2 rounded" />

          <div className="flex gap-2">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">Add Product</button>
            <button type="button" className="px-4 py-2 border rounded" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AuthModal({ onLogin }){
  useEffect(()=>{
    function open(){
      const evt = new Event('auth-open');
      window.dispatchEvent(evt);
    }
    document.addEventListener('open-auth', open);
    return ()=>document.removeEventListener('open-auth', open);
  },[]);

  const [open, setOpen] = useState(false);
  useEffect(()=>{
    function h(){ setOpen(true); }
    window.addEventListener('auth-open', h);
    return ()=>window.removeEventListener('auth-open', h);
  },[]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function submit(e){
    e.preventDefault();
    const u = { name, email, id: `USER-${Date.now()}` };
    onLogin(u);
    setOpen(false);
  }

  if(!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={()=>setOpen(false)}></div>
      <div className="bg-white p-6 rounded shadow z-10 w-full max-w-md">
        <h3 className="text-lg font-semibold">Sign in / Sign up</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" className="w-full border p-2 rounded" />
          <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" />
          <div className="flex gap-2">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">Continue</button>
            <button type="button" className="px-4 py-2 border rounded" onClick={()=>setOpen(false)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Footer({ onNavigate }){
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h4 className="font-bold">PK-Shop</h4>
          <p className="text-sm text-gray-600">Affordable fashion & football kits, delivered across Pakistan.</p>
        </div>
        <div className="flex gap-6">
          <div>
            <div className="font-medium">Support</div>
            <div className="text-sm text-gray-600">03423296320</div>
            <div className="text-sm text-gray-600">njv@njv.edu.pk</div>
          </div>
          <div>
            <div className="font-medium">Company</div>
            <button className="text-sm text-gray-600" onClick={()=>onNavigate('about')}>About Us</button>
            <button className="text-sm text-gray-600 block" onClick={()=>onNavigate('contact')}>Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactPage({ owner }){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  function submit(e){ e.preventDefault(); alert('Message submitted (demo).'); }
  return (
    <div className="bg-white rounded p-6 shadow">
      <h3 className="text-xl font-semibold">Contact Us</h3>
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div>
          <p className="font-medium">Address</p>
          <p>{owner.address}</p>
          <p className="mt-3 font-medium">Phone</p>
          <p>{owner.phone}</p>
          <p className="mt-3 font-medium">Email</p>
          <p>{owner.emails.join(', ')}</p>

          <div className="mt-6">
            <iframe title="map" src={`https://www.google.com/maps?q=${encodeURIComponent(owner.address)}&output=embed`} className="w-full h-64 border-0 rounded" />
          </div>
        </div>
        <div>
          <form onSubmit={submit} className="space-y-3">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full border p-2 rounded" />
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" />
            <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message" className="w-full border p-2 rounded" />
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AboutPage(){
  return (
    <div className="bg-white rounded p-6 shadow">
      <h3 className="text-xl font-semibold">About Us</h3>
      <p className="mt-3">We sell affordable fashion and authentic football kits across Pakistan. Mission: make style and fandom accessible to everyone, priced fairly between PKR 1,000 and 5,000.</p>
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded border">Fast Delivery across Pakistan</div>
        <div className="p-4 rounded border">Secure Payments (EasyPaisa / JazzCash)</div>
        <div className="p-4 rounded border">Open Seller Marketplace (Optional toggle)</div>
      </div>
    </div>
  );
}

function OrdersPage(){
  const orders = loadLocal('orders', []);
  return (
    <div className="bg-white rounded p-6 shadow">
      <h3 className="text-xl font-semibold">My Orders</h3>
      <div className="mt-4 space-y-4">
        {orders.length===0 && <div className="text-gray-600">No orders yet.</div>}
        {orders.map(o => (
          <div key={o.id} className="border rounded p-3">
            <div className="font-semibold">{o.id} <span className="text-sm text-gray-500">{new Date(o.date).toLocaleString()}</span></div>
            <div className="text-sm">Total: PKR {o.total.toLocaleString()}</div>
            <div className="mt-2">
              {o.items.map(i=> <div key={i.id} className="text-sm">{i.qty} × {i.title}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SellerDashboard({ products, addProduct, alerts }){
  const myProducts = products; // demo: no seller filter
  return (
    <div className="bg-white rounded p-6 shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Seller Dashboard</h3>
        <div>
          <button className="px-3 py-2 border rounded" onClick={()=>document.dispatchEvent(new Event('open-add'))}>Add Product</button>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-medium">My Products</h4>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProducts.map(p => (
            <div key={p.id} className="border rounded p-3">
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-gray-500">PKR {p.price}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <h4 className="font-medium">Product Alerts</h4>
        <div className="mt-2 space-y-2">
          {alerts.length===0 && <div className="text-gray-500">No alerts yet.</div>}
          {alerts.map(a => (
            <div key={a.id} className="text-sm border rounded p-2">{a.message} — {new Date(a.date).toLocaleString()} (notified {a.count} subscribers)</div>
          ))}
        </div>
      </div>
    </div>
  );
}
