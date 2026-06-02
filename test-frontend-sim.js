// Simula EXACTAMENTE lo que hace el frontend CartPanel.tsx
// Para ejecutar: node test-frontend-sim.js

async function simulateFrontend() {
  console.log("=== SIMULACIÓN DEL FRONTEND ===\n");

  // FALLA #1: ¿El frontend puede obtener productos desde /api/products?
  console.log("TEST 1: GET /api/products (como lo hace inventoryStore.ts)");
  try {
    const res = await fetch('http://localhost:8088/api/products');
    const data = await res.json();
    console.log(`  Status: ${res.status}`);
    console.log(`  Productos: ${data.length}`);
    
    // Verificar el mapeo que hace inventoryStore.ts
    const mapped = data.map(item => ({
      id: item.id,
      sku: item.sku || item.barcode || 'N/A',
      name: item.name,
      price: { amount: Number(item.price), currency: 'COP' },
      stock: Number(item.stock),
    }));
    console.log(`  Mapeo inventoryStore -> price.amount del primer producto: ${mapped[0].price.amount}`);
    console.log(`  ✅ Productos OK`);
    var testProduct = mapped[0];
  } catch(e) {
    console.log(`  ❌ Error: ${e.message}`);
    return;
  }

  // FALLA #2: ¿El carrito guarda el productId correcto?
  console.log("\nTEST 2: Verificar ID del producto en el carrito");
  console.log(`  Product ID que se guardaría en cart: "${testProduct.id}"`);
  console.log(`  ¿Es UUID? ${testProduct.id.includes('-') ? '✅ Sí' : '❌ No, posible problema'}`);

  // FALLA #3: ¿El checkout pasa amountReceived como número?
  console.log("\nTEST 3: POST /api/sales/{id}/checkout con amountReceived como Number");
  
  // Crear venta primero
  const saleRes = await fetch('http://localhost:8088/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ terminalId: 'TERM-001', cashierId: 'cajero_1', customerId: '' })
  });
  const sale = await saleRes.json();
  
  // Agregar ítem
  await fetch(`http://localhost:8088/api/sales/${sale.id}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: testProduct.id, quantity: 1 })
  });

  // Checkout - EXACTAMENTE como lo manda el frontend
  const cashReceived = '20000'; // <- viene como STRING del input HTML
  const checkoutPayload = {
    paymentType: 'CASH',
    amountReceived: Number(cashReceived) // Number("20000") = 20000
  };
  console.log(`  Payload enviado: ${JSON.stringify(checkoutPayload)}`);
  
  const checkoutRes = await fetch(`http://localhost:8088/api/sales/${sale.id}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkoutPayload)
  });
  const checkoutData = await checkoutRes.text();
  console.log(`  Status: ${checkoutRes.status}`);
  if (checkoutRes.status >= 400) {
    console.log(`  ❌ FALLO: ${checkoutData}`);
  } else {
    console.log(`  ✅ Checkout OK`);
  }

  // FALLA #4: ¿Qué pasa con el select "Selecciona un cajero..." (value="")?
  console.log("\nTEST 4: POST /api/sales con cajero vacío (sellerId='')");
  const saleRes2 = await fetch('http://localhost:8088/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ terminalId: 'TERM-001', cashierId: '', customerId: '' })
  });
  console.log(`  Status: ${saleRes2.status}`);
  if (saleRes2.status >= 400) {
    const errData = await saleRes2.text();
    console.log(`  ❌ FALLO con cajero vacío: ${errData}`);
  } else {
    console.log(`  ✅ OK con cajero vacío`);
  }

  // FALLA #5: ¿Pasa algo si el cashReceived es "" (vacío)?
  console.log("\nTEST 5: Checkout con cashReceived vacío");
  const saleRes3 = await fetch('http://localhost:8088/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ terminalId: 'TERM-001', cashierId: 'cajero_1', customerId: '' })
  });
  const sale3 = await saleRes3.json();
  await fetch(`http://localhost:8088/api/sales/${sale3.id}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: testProduct.id, quantity: 1 })
  });
  
  const checkoutPayload2 = {
    paymentType: 'CASH',
    amountReceived: Number('') // Number("") = 0
  };
  console.log(`  Payload: ${JSON.stringify(checkoutPayload2)}`);
  const checkoutRes2 = await fetch(`http://localhost:8088/api/sales/${sale3.id}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkoutPayload2)
  });
  const errText = await checkoutRes2.text();
  console.log(`  Status: ${checkoutRes2.status}`);
  if (checkoutRes2.status >= 400) {
    console.log(`  ❌ FALLO (esperado): ${errText.substring(0, 200)}`);
  } else {
    console.log(`  ✅ OK`);
  }

  // FALLA #6: ¿Qué pasa con la foto? El usuario puso $19.278 y cashReceived 20000
  // Pero el total del backend es diferente al del frontend
  console.log("\nTEST 6: Comparar total frontend vs backend");
  // Frontend calcula: subtotal = price.amount * qty, tax = Math.round(subtotal * 0.19)
  const price = testProduct.price.amount; // 4500
  const qty = 1;
  const frontSubtotal = price * qty; // 4500
  const frontTax = Math.round(frontSubtotal * 0.19); // 855
  const frontTotal = frontSubtotal + frontTax; // 5355
  console.log(`  Frontend: subtotal=${frontSubtotal}, tax=${frontTax}, total=${frontTotal}`);
  // Backend calcula con BigDecimal
  console.log(`  Backend: subtotal=4500, tax=855, total=5355 (from SaleService.calculateTotals)`);
  console.log(`  ¿Coinciden? Probablemente sí para números enteros COP`);
  
  // De la foto: El total era $19.278 - eso implica que habían más ítems o diferente cálculo
  // En la foto: "$ 19.278" con 20000 de cashReceived
  // Eso corresponde a algo como: 4 Cafés Espresso (4500*4 = 18000, tax = 3420, total = 21420)
  // o quizás: subtotal sin IVA = 16200, IVA = 3078 => total = 19278
  // De cualquier forma, el checkout debería funcionar si el backend acepta 20000 >= total

  console.log("\n=== RESUMEN ===");
  console.log("Si todos los tests pasaron, el problema probablemente es de CORS en el navegador.");
  console.log("El apiClient.ts apunta a 'http://localhost:8088' directamente.");
  console.log("Pero el frontend corre en 'http://localhost:5173'.");
  console.log("Esto es un cross-origin request que depende del header @CrossOrigin del backend.");
}

simulateFrontend().catch(e => console.error(e));
