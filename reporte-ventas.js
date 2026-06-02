async function reporteVentas() {
  try {
    const res = await fetch('http://localhost:8088/api/sales');
    const sales = await res.json();
    
    if (sales.length === 0) {
      console.log("\n=========================================");
      console.log("   NO HAY VENTAS REGISTRADAS TODAVÍA");
      console.log("=========================================\n");
      return;
    }

    console.log("\n=========================================");
    console.log("        REPORTE DE VENTAS (TERMINAL)     ");
    console.log("=========================================\n");

    sales.forEach((sale, index) => {
      console.log(`\n=========================================`);
      console.log(` 🧾 TICKET DE VENTA #${index + 1}`);
      console.log(`=========================================`);
      console.log(` ID:      ${sale.id}`);
      console.log(` ESTADO:  ${sale.status === 'COMPLETED' ? '✅ COMPLETADA' : '❌ PENDIENTE/CANCELADA'}`);
      console.log(` CAJERO:  ${sale.cashierId || 'No asignado'}`);
      console.log(`-----------------------------------------`);
      
      if (sale.items && sale.items.length > 0) {
        console.log(` PRODUCTOS:`);
        sale.items.forEach(item => {
          // Asegurar alineación
          const name = item.productName.padEnd(20, ' ');
          const qty = `${item.quantity}x`.padStart(4, ' ');
          const price = `$${item.unitPrice}`;
          console.log(`  ${qty} ${name} ${price}`);
        });
      }
      
      console.log(`-----------------------------------------`);
      console.log(` SUBTOTAL:      $${sale.subTotal || 0}`);
      console.log(` IVA (19%):     $${sale.taxAmount || 0}`);
      console.log(` TOTAL:         $${sale.total || 0}`);
      console.log(`-----------------------------------------`);
      console.log(` MÉTODO PAGO:   ${sale.paymentMethod || 'EFECTIVO'}`);
      console.log(` EFECTIVO REC.: $${sale.cashReceived || 0}`);
      console.log(` CAMBIO:        $${sale.changeAmount || 0}`);
      console.log(`=========================================\n`);
    });
    
    const totalGeneral = sales.reduce((sum, s) => sum + s.total, 0);
    console.log(`\n💰 TOTAL RECAUDADO EN EL DÍA: $${totalGeneral}\n`);

  } catch(error) {
    console.error("❌ Error conectando al servidor backend. Asegúrate de que npm run dev esté activo.", error.message);
  }
}

reporteVentas();
