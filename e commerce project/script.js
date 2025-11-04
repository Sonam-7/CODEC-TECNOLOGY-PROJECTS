//  8 products
const starterProducts = [
  { id:1, title:"Smartphone X Pro", price:19999, img:"images/img_1.jpg", category:"Electronics" },
  { id:2, title:"Wireless Headphones", price:3499, img:"images/img_2.jpg", category:"Electronics" },
  { id:3, title:"Classic Leather Shoes", price:2599, img:"images/img_3.jpg", category:"Fashion" },
  { id:4, title:"Denim Jacket", price:2299, img:"images/img_4.jpg", category:"Fashion" },
  { id:5, title:"Organic Nuts Pack", price:599, img:"images/img_5.jpg", category:"Grocery" },
  { id:6, title:"Snack Combo Box", price:399, img:"images/img_6.jpg", category:"Grocery" },
  { id:7, title:"Matte Lipstick", price:499, img:"images/img_7.jpg", category:"Beauty" },
  { id:8, title:"Perfume - Ocean Mist", price:899, img:"images/img_8.jpg", category:"Beauty" },
];

// LocalStorage keys
const KEY_PRODUCTS = 'ms_products';
const KEY_CART = 'ms_cart';
const KEY_ORDERS = 'ms_orders';

// Utilities 
function getProducts(){ return JSON.parse(localStorage.getItem(KEY_PRODUCTS) || '[]'); }
function saveProducts(arr){ localStorage.setItem(KEY_PRODUCTS, JSON.stringify(arr)); }
function getCart(){ return JSON.parse(localStorage.getItem(KEY_CART) || '[]'); }
function saveCart(arr){ localStorage.setItem(KEY_CART, JSON.stringify(arr)); updateNavCart(); }
function getOrders(){ return JSON.parse(localStorage.getItem(KEY_ORDERS) || '[]'); }
function saveOrders(arr){ localStorage.setItem(KEY_ORDERS, JSON.stringify(arr)); }

//  Init 
(function init(){
  // Auto clear old data if old product count != 8
  const existing = getProducts();
  if(!existing.length || existing.length !== 8){
    localStorage.removeItem(KEY_PRODUCTS);
    saveProducts(starterProducts);
  }
  if(!localStorage.getItem(KEY_CART)) saveCart([]);
})();

//  Navbar Cart Count 
function updateNavCart(){
  const count = getCart().reduce((s,i)=> s + (i.qty || 1), 0);
  $('#navCartCount, #navCartCount2').text(count);
}

//  Product Grid (Home Page) 
function buildCategoryOptions(){
  const cats = Array.from(new Set(getProducts().map(p=>p.category).filter(Boolean)));
  const sel = $('#categoryFilter');
  sel.empty().append('<option value="">All Categories</option>');
  cats.forEach(c=> sel.append(`<option>${c}</option>`));
}

function renderProductGrid(filterText='', category=''){
  const products = getProducts();
  const filtered = products.filter(p=>{
    const matchText = !filterText || p.title.toLowerCase().includes(filterText.toLowerCase());
    const matchCat = !category || p.category === category;
    return matchText && matchCat;
  });

  const container = $('#productGrid');
  container.empty();

  if(filtered.length === 0){
    container.html('<div class="alert alert-info">No products found.</div>');
    return;
  }

  filtered.forEach(p=>{
    const card = $(`
      <div class="card">
        <img src="${p.img}" alt="${p.title}" class="w-100 mb-2" onerror="this.src='images/img_1.jpg'">
        <div class="title">${p.title}</div>
        <div class="muted">${p.category || ''}</div>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <div class="h6 mb-0">₹ ${p.price}</div>
          <div>
            <button class="btn btn-sm btn-outline-secondary me-2 viewBtn" data-id="${p.id}">View</button>
            <button class="btn btn-sm btn-primary addBtn" data-id="${p.id}">Add</button>
          </div>
        </div>
      </div>
    `);
    container.append(card);
  });
}

//Cart Logic 
function addToCart(id){
  const prod = getProducts().find(p=>p.id===id);
  if(!prod) return alert('Product not found');
  const cart = getCart();
  const existing = cart.find(i=>i.id===id);
  if(existing) existing.qty++;
  else cart.push({...prod, qty:1});
  saveCart(cart);
  showToast('Added to cart');
}

function renderCartPage(){
  const cart = getCart();
  const area = $('#cartArea');
  area.empty();

  if(cart.length === 0){
    area.html('<div class="alert alert-info">Your cart is empty. <a href="index.html">Shop now</a></div>');
    $('#cartTotal').text(0);
    return;
  }

  cart.forEach(item=>{
    const el = $(`
      <div class="cart-item">
        <img src="${item.img}">
        <div style="flex:1">
          <div class="fw-semibold">${item.title}</div>
          <div class="small text-muted">₹ ${item.price}</div>
        </div>
        <div class="text-end">
          <input class="form-control form-control-sm mb-2 qtyInp" style="width:80px" type="number" min="1" value="${item.qty}">
          <div><strong>₹ ${(item.price * item.qty).toFixed(0)}</strong></div>
          <button class="btn btn-sm btn-danger mt-2 removeBtn" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `);
    area.append(el);
  });
  calculateCartTotal();
}

function calculateCartTotal(){
  const total = getCart().reduce((s,i)=> s + i.price * i.qty, 0);
  $('#cartTotal').text(total.toFixed(0));
}

//  Checkout 
function placeOrder(payload){
  const cart = getCart();
  if(!cart.length) return alert('Cart empty');
  const orders = getOrders();
  const orderId = 'ORD' + Date.now();
  const total = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  orders.push({ orderId, items:cart, total, date:new Date().toISOString(), info:payload });
  saveOrders(orders);
  saveCart([]);
  showToast('Order placed! ' + orderId);
}

//  Toast (popup msg) 
function showToast(msg){
  const t = $(`<div class="position-fixed top-0 end-0 p-3" style="z-index:9999">
    <div class="toast show text-bg-primary border-0"><div class="toast-body">${msg}</div></div></div>`);
  $('body').append(t);
  setTimeout(()=> t.fadeOut(400, ()=> t.remove()), 1200);
}

//  Admin Page 
function renderAdminList(){
  const products = getProducts();
  const list = $('#adminProductsList');
  list.empty();
  if(products.length === 0) return list.html('<div class="alert alert-info">No products</div>');
  products.forEach(p=>{
    list.append(`
      <div class="card p-2 mb-2 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <img src="${p.img}" style="width:72px;height:56px;object-fit:cover;border-radius:8px">
          <div class="ms-3">
            <div class="fw-semibold">${p.title}</div>
            <div class="small text-muted">₹ ${p.price} • ${p.category}</div>
          </div>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-primary editBtn" data-id="${p.id}">Edit</button>
          <button class="btn btn-sm btn-danger deleteBtn" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `);
  });
}

function addAdminProduct({title, price, category, file, imageUrl}){
  const products = getProducts();
  const id = products.length ? Math.max(...products.map(p=>p.id)) + 1 : 1;

  const pushProduct = imgSrc => {
    products.push({ id, title, price:+price, category, img:imgSrc });
    saveProducts(products);
    renderAdminList();
    buildCategoryOptions();
    showToast('Product added');
  };

  if(file){
    const reader = new FileReader();
    reader.onload = e => pushProduct(e.target.result);
    reader.readAsDataURL(file);
  } else if(imageUrl) pushProduct(imageUrl);
  else pushProduct('images/img_1.jpg');
}

function deleteProduct(id){
  if(!confirm('Delete this product?')) return;
  const updated = getProducts().filter(p=>p.id!==id);
  saveProducts(updated);
  renderAdminList();
  buildCategoryOptions();
}

function editProduct(id){
  const products = getProducts();
  const p = products.find(x=>x.id===id); if(!p) return;
  const newTitle = prompt('Title', p.title);
  const newPrice = prompt('Price', p.price);
  if(newTitle!==null) p.title = newTitle;
  if(newPrice!==null) p.price = +newPrice;
  saveProducts(products);
  renderAdminList();
  buildCategoryOptions();
  showToast('Updated');
}

//  DOM Ready 
$(function(){
  updateNavCart();
  buildCategoryOptions();
  renderProductGrid();

  $('#searchBox').on('input',()=>renderProductGrid($('#searchBox').val(),$('#categoryFilter').val()));
  $('#categoryFilter').on('change',()=>renderProductGrid($('#searchBox').val(),$('#categoryFilter').val()));
  $(document).on('click','.addBtn',function(){ addToCart(+$(this).data('id')); });
  $(document).on('click','.viewBtn',function(){
    const p = getProducts().find(x=>x.id===+$(this).data('id'));
    alert(`${p.title}\nCategory: ${p.category}\nPrice: ₹${p.price}`);
  });

  $('#viewCartBtn').click(()=>window.location.href='cart.html');

  const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
  $('#openCheckoutDemo').click(()=>checkoutModal.show());
  $('#checkoutForm').on('submit',function(e){
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(this).entries());
    placeOrder(fd);
    checkoutModal.hide();
    renderCartPage();
    updateNavCart();
  });

  if($('#cartArea').length){
    renderCartPage();
    $('#clearCartBtn').click(()=>{ if(confirm('Clear cart?')){ saveCart([]); renderCartPage(); updateNavCart(); }});
    $('#checkoutBtn').click(()=>window.location.href='index.html');

    $(document).on('input','.qtyInp',function(){
      const id = +$(this).closest('.cart-item').find('.removeBtn').data('id');
      const val = Math.max(1, +$(this).val());
      const cart = getCart(); const item = cart.find(x=>x.id===id);
      if(item) item.qty = val;
      saveCart(cart); renderCartPage();
    });

    $(document).on('click','.removeBtn',function(){
      const id = +$(this).data('id');
      const updated = getCart().filter(x=>x.id!==id);
      saveCart(updated); renderCartPage(); updateNavCart();
    });
  }

  if($('#adminAddForm').length){
    renderAdminList();
    $('#adminAddForm').on('submit',function(e){
      e.preventDefault();
      const title=$('#adminTitle').val().trim();
      const price=$('#adminPrice').val();
      const category=$('#adminCategory').val().trim();
      const file=$('#adminImageFile').prop('files')[0];
      const imageUrl=$('#adminImageUrl').val().trim();
      if(!title||!price)return alert('Title and price required');
      addAdminProduct({title,price,category,file,imageUrl});
      $(this).trigger('reset');
    });
    $(document).on('click','.deleteBtn',function(){deleteProduct(+$(this).data('id'));});
    $(document).on('click','.editBtn',function(){editProduct(+$(this).data('id'));});
  }

  updateNavCart();
});
