// Test completo del flujo de venta REST (3 pasos)
async function testFullFlow() {
  console.log("=== TEST COMPLETO DEL FLUJO DE VENTA ===\n");

  // 0. Obtener productos
  console.log("PASO 0: Obtener productos...");
  try {
    const prodRes = await fetch('http://localhost:8088/api/products');
    const products = await prodRes.json();
    console.log(`  ✅ ${products.length} productos encontrados`);
    console.log(`  Primer producto ID: ${products[0].id}, Nombre: ${products[0].name}, Precio: ${products[0].price}`);
    var productId = products[0].id;
  } catch(e) {
    console.log(`  ❌ Error: ${e.message}`);
    return;
  }

  // 1. Crear venta
  console.log("\nPASO 1: POST /api/sales (Crear venta)...");
  try {
    const res = await fetch('http://localhost:8088/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ terminalId: 'TERM-001', cashierId: 'cajero_1', customerId: '' })
    });
    const data = await res.text();
    console.log(`  Status: ${res.status}`);
    console.log(`  Body: ${data.substring(0, 300)}`);
    if (res.status >= 400) {
      console.log("  ❌ FALLO al crear venta");
      return;
    }
    var sale = JSON.parse(data);
    var saleId = sale.id;
    console.log(`  ✅ Sale ID: ${saleId}`);
  } catch(e) {
    console.log(`  ❌ Error: ${e.message}`);
    return;
  }

  // 2. Agregar ítem
  console.log(`\nPASO 2: POST /api/sales/${saleId}/items (Agregar producto)...`);
  try {
    const res = await fetch(`http://localhost:8088/api/sales/${saleId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: productId, quantity: 2 })
    });
    const data = await res.text();
    console.log(`  Status: ${res.status}`);
    console.log(`  Body: ${data.substring(0, 300)}`);
    if (res.status >= 400) {
      console.log("  ❌ FALLO al agregar ítem");
      return;
    }
    var saleWithItems = JSON.parse(data);
    console.log(`  ✅ Total calculado por backend: ${saleWithItems.total}`);
  } catch(e) {
    console.log(`  ❌ Error: ${e.message}`);
    return;
  }

  // 3. Checkout
  console.log(`\nPASO 3: POST /api/sales/${saleId}/checkout (Pagar)...`);
  try {
    const res = await fetch(`http://localhost:8088/api/sales/${saleId}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentType: 'CASH', amountReceived: 20000 })
    });
    const data = await res.text();
    console.log(`  Status: ${res.status}`);
    console.log(`  Body: ${data.substring(0, 500)}`);
    if (res.status >= 400) {
      console.log("  ❌ FALLO en checkout");
    } else {
      console.log("  ✅ VENTA COMPLETADA EXITOSAMENTE");
    }
  } catch(e) {
    console.log(`  ❌ Error: ${e.message}`);
  }
}

testFullFlow();
