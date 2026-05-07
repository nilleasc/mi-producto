import React, { useState } from 'react';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useSalesStore } from '../../stores/salesStore';
import { useUsersStore } from '../../stores/usersStore';

export const AdminDashboard: React.FC = () => {
  const { products } = useInventoryStore();
  const { sales } = useSalesStore();
  const { cashiers } = useUsersStore();
  const [activeTab, setActiveTab] = useState<'inventory' | 'reports' | 'users'>('inventory');

  const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(val);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = sales.length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex border-b border-gray-200 bg-white px-8">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`py-4 px-6 font-bold text-sm ${activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Inventario de Productos
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`py-4 px-6 font-bold text-sm ${activeTab === 'reports' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Reportes de Ventas
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`py-4 px-6 font-bold text-sm ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Gestión de Cajeros
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-black text-gray-900">Catálogo de Productos</h3>
              <button 
                onClick={() => {
                  const name = prompt('Nombre del nuevo producto:');
                  if (!name) return;
                  const priceStr = prompt('Precio en COP:');
                  if (!priceStr) return;
                  const newProduct = {
                    id: Math.random().toString(36).substr(2, 9),
                    sku: `SKU${Math.floor(Math.random() * 1000)}` as any,
                    name,
                    price: { amount: parseInt(priceStr) || 0, currency: 'COP' } as any,
                    stock: 10,
                    categoryId: 'c1',
                    variants: [],
                    isActive: true,
                    imageUrl: null,
                    unitOfMeasure: 'UND'
                  };
                  useInventoryStore.getState().addProduct(newProduct);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-sm"
              >
                + Nuevo Producto
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">SKU</th>
                  <th className="p-4 font-bold">Nombre</th>
                  <th className="p-4 font-bold">Categoría</th>
                  <th className="p-4 font-bold">Precio (COP)</th>
                  <th className="p-4 font-bold">Stock</th>
                  <th className="p-4 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-600">{String(product.sku)}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">{product.name}</td>
                    <td className="p-4 text-xs font-bold text-blue-600 uppercase tracking-widest">{(product as any).categoryId}</td>
                    <td className="p-4 text-sm font-medium text-gray-700">{formatCOP((product.price as any).amount)}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {product.stock} unds
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => {
                          const newPrice = prompt('Nuevo precio en COP para ' + product.name + ':', String((product.price as any).amount));
                          if (newPrice !== null) {
                            useInventoryStore.getState().updateProduct({
                              ...product,
                              price: { amount: parseInt(newPrice) || 0, currency: 'COP' } as any
                            });
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 font-bold text-sm mr-4"
                      >
                        Editar Precio
                      </button>
                      <button 
                        onClick={() => {
                          const newStock = prompt('Nuevo stock para ' + product.name + ':', String(product.stock));
                          if (newStock !== null) {
                            useInventoryStore.getState().updateProduct({
                              ...product,
                              stock: parseInt(newStock) || 0
                            });
                          }
                        }}
                        className="text-amber-600 hover:text-amber-800 font-bold text-sm mr-4"
                      >
                        Editar Stock
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('¿Seguro que deseas eliminar ' + product.name + '?')) {
                            useInventoryStore.getState().deleteProduct(product.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 font-bold text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-widest block mb-2">Ingresos Totales</span>
                <span className="text-4xl font-black text-blue-600">{formatCOP(totalRevenue)}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-widest block mb-2">Ventas Realizadas</span>
                <span className="text-4xl font-black text-gray-900">{totalSales}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xl font-black text-gray-900">Historial de Ventas</h3>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Fecha</th>
                    <th className="p-4 font-bold">ID Venta</th>
                    <th className="p-4 font-bold">Cajero</th>
                    <th className="p-4 font-bold">Cliente</th>
                    <th className="p-4 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No hay ventas registradas aún.</td>
                    </tr>
                  ) : (
                    sales.map(sale => (
                      <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm font-medium text-gray-600">{new Date(sale.date).toLocaleString('es-CO')}</td>
                        <td className="p-4 text-sm font-mono text-gray-500">#{sale.id}</td>
                        <td className="p-4 text-sm font-bold text-gray-900">{sale.sellerId}</td>
                        <td className="p-4 text-sm text-gray-700">{sale.buyerId}</td>
                        <td className="p-4 text-sm font-black text-gray-900 text-right">{formatCOP(sale.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-black text-gray-900">Gestión de Cajeros</h3>
              <button 
                onClick={() => {
                  const cedula = prompt('Cédula del nuevo cajero:');
                  if (!cedula) return;
                  const name = prompt('Nombre del cajero:');
                  if (!name) return;
                  
                  useUsersStore.getState().addCashier({
                    id: Math.random().toString(36).substr(2, 9),
                    cedula,
                    name,
                    isActive: true
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-sm"
              >
                + Nuevo Cajero
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Cédula</th>
                  <th className="p-4 font-bold">Nombre</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cashiers.map(cashier => (
                  <tr key={cashier.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-600">{cashier.cedula}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">{cashier.name}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${cashier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {cashier.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => useUsersStore.getState().toggleStatus(cashier.id)}
                        className={`font-bold text-sm mr-4 ${cashier.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                      >
                        {cashier.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`¿Seguro que deseas eliminar al cajero ${cashier.name}?`)) {
                            useUsersStore.getState().deleteCashier(cashier.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 font-bold text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
