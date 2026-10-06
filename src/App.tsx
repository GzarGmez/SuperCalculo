import React, { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://supercalculo-backend.onrender.com/api';

interface Usuario {
  id: number;
  nombre: string;
  presupuesto_maximo: number | string;
}

interface CatalogoItem {
  id: number;
  nombre: string;
  categoria: string;
  icono: string;
}

interface ItemCarrito {
  id: number;
  usuario_id: number;
  nombre: string;
  categoria: string;
  icono: string;
  precio_mxn: number | string;
  cantidad: number;
  unidad: string;
}

interface HistorialCompra {
  id: number;
  fecha: string;
  total: number | string;
  items: ItemCarrito[];
}

const emojiOptions = [
  '🥦', '🍎', '🥑', '🍌', '🍊', '🍋', '🍇', '🍓', '🫐', '🍉', 
  '🍑', '🍍', '🍅', '🥕', '🌽', '🥔', '🧅', '🧄', '🥒', '🍄',
  '🥛', '🧀', '🧈', '🍞', '🥖', '🥐', '🥚', '🥞', '🥣', '🌾', 
  '🥩', '🍗', '🍖', '🥓', '🌭', '🍔', '🐟', '🦐', '🦑',
  '🥤', '🧃', '☕', '🍵', '🧋', '🍺', '🍷', '🍿', '🍫', '🍪', '🍩', '🍬', '🍦',
  '🧼', '🧹', '🧻', '🧴', '🧽', '📦', '🛒', '🪥', '🧂', '🫒'
];

const autoDetectIcon = (nombre: string, categoria: string): string => {
  const n = nombre.toLowerCase().trim();
  if (n.includes('aguacate')) return '🥑';
  if (n.includes('ajo')) return '🧄';
  if (n.includes('cebolla')) return '🧅';
  if (n.includes('tomate') || n.includes('jitomate')) return '🍅';
  if (n.includes('limon') || n.includes('limón')) return '🍋';
  if (n.includes('manzana')) return '🍎';
  if (n.includes('papa')) return '🥔';
  if (n.includes('platano') || n.includes('plátano') || n.includes('banana')) return '🍌';
  if (n.includes('sandia') || n.includes('sandía')) return '🍉';
  if (n.includes('zanahoria')) return '🥕';
  if (n.includes('pera')) return '🍐';
  if (n.includes('uva')) return '🍇';
  if (n.includes('fresa')) return '🍓';
  if (n.includes('naranja')) return '🍊';
  if (n.includes('leche')) return '🥛';
  if (n.includes('huevo')) return '🥚';
  if (n.includes('queso')) return '🧀';
  if (n.includes('mantequilla')) return '🧈';
  if (n.includes('carne') || n.includes('res') || n.includes('bistec')) return '🥩';
  if (n.includes('pollo')) return '🍗';
  if (n.includes('pescado') || n.includes('atun') || n.includes('atún')) return '🐟';
  if (n.includes('pan')) return '🍞';
  if (n.includes('arroz') || n.includes('frijol')) return '🌾';
  if (n.includes('agua') || n.includes('refresco') || n.includes('jugo') || n.includes('cerveza')) return '🥤';
  if (n.includes('jabon') || n.includes('jabón') || n.includes('detergente') || n.includes('limpia')) return '🧼';

  switch (categoria) {
    case 'Frutas y Verduras': return '🥦';
    case 'Lácteos y Huevo': return '🥛';
    case 'Despensa': return '📦';
    case 'Carnes': return '🥩';
    case 'Limpieza': return '🧹';
    case 'Bebidas': return '🥤';
    default: return '🛒';
  }
};

const BudgetDonutChart = ({ gasto, presupuesto }: { gasto: number; presupuesto: number }) => {
  const pct = presupuesto > 0 ? Math.min(100, Math.round((gasto / presupuesto) * 100)) : 0;
  const pctReal = presupuesto > 0 ? ((gasto / presupuesto) * 100).toFixed(1) : "0";
  const restante = presupuesto - gasto;
  const isOver = gasto > presupuesto;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, pct) / 100) * circumference;
  const color = isOver ? '#ef4444' : pct > 85 ? '#f59e0b' : '#38bdf8';

  return (
    <div className="donut-container glass-panel">
      <div className="donut-svg-wrapper">
        <svg viewBox="0 0 100 100" className="donut-svg">
          <circle cx="50" cy="50" r={radius} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="9" fill="transparent" />
          <circle
            cx="50" cy="50" r={radius} stroke={color} strokeWidth="9"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div className="donut-center-text">
          <span style={{ color: color, fontWeight: 800, fontSize: '18px' }}>{pct}%</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>gastado</span>
        </div>
      </div>
      <div className="donut-legend">
        <div className="legend-item">
          <span className="legend-label">Gastado ({pctReal}%):</span>
          <strong style={{ color: isOver ? '#ef4444' : '#38bdf8', fontSize: '15px' }}>${gasto.toFixed(2)} MXN</strong>
        </div>
        <div className="legend-item">
          <span className="legend-label">Restante:</span>
          <strong style={{ color: restante < 0 ? '#ef4444' : '#10b981', fontSize: '15px' }}>
            ${restante < 0 ? '0.00' : restante.toFixed(2)} MXN
          </strong>
        </div>
        {isOver && (
          <div className="legend-warning">⚠️ Excedido por ${(gasto - presupuesto).toFixed(2)} MXN</div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioActivo, setUsuarioActivo] = useState<Usuario | null>(null);
  const [catalogo, setCatalogo] = useState<CatalogoItem[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [historial, setHistorial] = useState<HistorialCompra[]>([]);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [modalEditBudget, setModalEditBudget] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalAddProduct, setModalAddProduct] = useState<CatalogoItem | null>(null);
  
  const [historialAEliminar, setHistorialAEliminar] = useState<number | null>(null);
  const [modalNuevoProducto, setModalNuevoProducto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Despensa');
  const [nuevoIcono, setNuevoIcono] = useState('🛒');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');

  const [tempPrecio, setTempPrecio] = useState('');
  const [tempCant, setTempCant] = useState(1);
  const [tempUnidad, setTempUnidad] = useState('pzas');
  const [tempPresupuesto, setTempPresupuesto] = useState('');

  const categories = ['Todas', 'Frutas y Verduras', 'Lácteos y Huevo', 'Despensa', 'Carnes', 'Limpieza', 'Bebidas'];

  useEffect(() => {
    fetchCatalogo();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (usuarioActivo) {
      fetchCarrito(usuarioActivo.id);
      fetchHistorial(usuarioActivo.id);
    } else {
      setCarrito([]);
      setHistorial([]);
    }
  }, [usuarioActivo]);

  const fetchCatalogo = async () => {
    try {
      const res = await fetch(`${API_BASE}/catalogo`);
      setCatalogo(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchUsuarios = async (currentActiveId?: number) => {
    try {
      const res = await fetch(`${API_BASE}/usuarios`);
      const data: Usuario[] = await res.json();
      setUsuarios(data);
      if (data.length > 0) {
        setUsuarioActivo(data.find(u => u.id === currentActiveId) || data[0]);
      } else {
        setUsuarioActivo(null);
        setModalUsuario(true);
      }
    } catch (e) { console.error(e); }
  };

  const fetchCarrito = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/lista/${userId}`);
      setCarrito(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchHistorial = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/historial/${userId}`);
      setHistorial(await res.json());
    } catch (e) { console.error(e); }
  };

  const crearUsuario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch(`${API_BASE}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: data.get('nombre'), presupuesto_maximo: Number(data.get('presupuesto')) })
      });
      const user = await res.json();
      await fetchUsuarios(user.id);
      setModalUsuario(false);
    } catch (e) { console.error(e); }
  };

  const actualizarPresupuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioActivo || !tempPresupuesto) return;
    try {
      await fetch(`${API_BASE}/usuarios/${usuarioActivo.id}/presupuesto`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_maximo: Number(tempPresupuesto) })
      });
      await fetchUsuarios(usuarioActivo.id);
      setModalEditBudget(false);
      setTempPresupuesto('');
    } catch (e) { console.error(e); }
  };

  const eliminarCuenta = async () => {
    if (!usuarioActivo) return;
    try {
      const res = await fetch(`${API_BASE}/usuarios/${usuarioActivo.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error}`);
        return;
      }
      setModalDelete(false);
      setIsProfileMenuOpen(false);
      await fetchUsuarios();
    } catch (e) { console.error(e); alert('Error de conexión.'); }
  };

  const crearProductoCatalogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    const catFinal = nuevaCategoria === 'Todas' ? 'Despensa' : nuevaCategoria;
    const iconoFinal = nuevoIcono.trim() || autoDetectIcon(nuevoNombre, catFinal);

    try {
      const res = await fetch(`${API_BASE}/catalogo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre.trim(),
          categoria: catFinal,
          icono: iconoFinal
        })
      });
      if (res.ok) {
        await fetchCatalogo();
        setModalNuevoProducto(false);
        setNuevoNombre('');
      } else {
        alert('Error al agregar el producto al catálogo.');
      }
    } catch (e) { console.error(e); }
  };

  const agregarAlCarrito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAddProduct || !tempPrecio || !usuarioActivo) return;
    try {
      await fetch(`${API_BASE}/lista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioActivo.id, nombre: modalAddProduct.nombre, categoria: modalAddProduct.categoria,
          icono: modalAddProduct.icono, precio_mxn: parseFloat(tempPrecio), cantidad: tempCant, unidad: tempUnidad
        })
      });
      await fetchCarrito(usuarioActivo.id);
      setModalAddProduct(null); setTempPrecio(''); setTempCant(1);
    } catch (e) { console.error(e); }
  };

  const eliminarDelCarrito = async (id: number) => {
    try {
      await fetch(`${API_BASE}/lista/${id}`, { method: 'DELETE' });
      if (usuarioActivo) fetchCarrito(usuarioActivo.id);
    } catch (e) { console.error(e); }
  };

  const eliminarDelHistorial = async (historialId: number) => {
    try {
      await fetch(`${API_BASE}/historial/${historialId}`, { method: 'DELETE' });
      if (usuarioActivo) fetchHistorial(usuarioActivo.id);
    } catch (e) { console.error(e); }
  };

  const finalizarCompra = async () => {
    if (!usuarioActivo || carrito.length === 0) return;
    try {
      const res = await fetch(`${API_BASE}/compras/finalizar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioActivo.id, total: Number(totalGasto.toFixed(2)) })
      });
      if (!res.ok) { alert(`Error al procesar compra`); return; }
      await fetchCarrito(usuarioActivo.id);
      await fetchHistorial(usuarioActivo.id);
      setIsCartOpen(false); setModalSuccess(true);
      setTimeout(() => setModalSuccess(false), 3500);
    } catch (e) { alert('Error de red al comprar.'); }
  };

  const totalGasto = carrito.reduce((acc, item) => acc + (Number(item.precio_mxn) * Number(item.cantidad)), 0);
  const presupuestoMax = usuarioActivo ? Number(usuarioActivo.presupuesto_maximo) : 0;
  const itemsEnCarrito = carrito.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);

  const sugerencias = searchQuery
    ? catalogo.filter(p => p.nombre.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const productosFiltrados = catalogo.filter(p => {
    return (categoriaActiva === 'Todas' || p.categoria === categoriaActiva) && p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="app-container">
      <style>{`
        * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
        html, body, #root { width: 100%; min-height: 100vh; margin: 0; padding: 0; background-color: #0b0f19; color: #f1f5f9; }
        
        .app-container { 
          width: 100%; 
          min-height: 100vh; 
          background: radial-gradient(circle at 50% 0%, #1e293b 0%, #0b0f19 80%); 
          padding: 24px 32px 120px; 
        }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popModal { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes dropdownFade { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes successPop { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        
        .animated-entry { animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .glass-panel { background: rgba(19, 27, 46, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }

        .header-layout { width: 100%; max-width: 1400px; margin: 0 auto 28px; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 10; }
        .profile-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 10px 16px; border-radius: 14px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.25s; }
        .profile-btn:hover, .profile-btn.active { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .dropdown-menu { position: absolute; top: calc(100% + 8px); right: 0; width: 260px; background: #131b2e; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 8px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8); animation: dropdownFade 0.2s ease-out forwards; z-index: 50; }
        .dropdown-item { width: 100%; text-align: left; background: transparent; border: none; color: #cbd5e1; padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px; }
        .dropdown-item:hover { background: rgba(255,255,255,0.08); color: #f8fafc; }
        .dropdown-item.danger:hover { background: rgba(239, 68, 68, 0.15); color: #f87171; }

        .dashboard-top { width: 100%; max-width: 1400px; margin: 0 auto 32px; display: grid; grid-template-columns: 360px 1fr; gap: 20px; }
        .donut-container { display: flex; align-items: center; gap: 20px; padding: 22px 28px; width: 100%; }
        .donut-svg-wrapper { position: relative; width: 100px; height: 100px; flex-shrink: 0; }
        .donut-svg { transform: rotate(-90deg); width: 100%; height: 100%; }
        .donut-center-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .donut-legend { display: flex; flex-direction: column; gap: 10px; font-size: 0.95rem; width: 100%; }
        .legend-item { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .legend-label { color: #94a3b8; font-size: 13px; font-weight: 500; }
        .legend-warning { font-size: 0.82rem; color: #ef4444; font-weight: 700; background: rgba(239, 68, 68, 0.12); padding: 6px 12px; border-radius: 8px; margin-top: 4px; text-align: center; }

        .metrics-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 100%; }
        .metric-card { display: flex; flex-direction: column; justify-content: center; padding: 22px 28px; text-align: left; }
        .metric-title { color: #94a3b8; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.6px; }
        .metric-value { font-size: clamp(1.6rem, 2.5vw, 2.2rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.5px; }

        @media (max-width: 1024px) {
          .dashboard-top { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .app-container { padding: 16px 16px 100px; }
          .metrics-container { grid-template-columns: 1fr 1fr; gap: 12px; }
          .metric-card.full-width-mobile { grid-column: span 2; }
          .donut-container { padding: 18px; flex-direction: column; text-align: center; }
        }

        .search-container { position: relative; width: 100%; max-width: 700px; margin: 0 auto 28px; }
        .search-input { width: 100%; padding: 18px 20px 18px 52px; border-radius: 18px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(255, 255, 255, 0.1); color: white; font-size: 16px; transition: all 0.3s; }
        .search-input:focus { border-color: #38bdf8; outline: none; box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.2); }
        .suggestions-box { position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 20; background: #1e293b; border-radius: 14px; border: 1px solid rgba(255,255,255,0.15); overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.6); }
        .suggestion-item { padding: 14px 18px; cursor: pointer; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .suggestion-item:hover { background: rgba(56, 189, 248, 0.12); }

        .categories-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 12px; margin: 0 auto 28px; max-width: 1400px; scrollbar-width: none; }
        .category-pill { padding: 10px 20px; border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; white-space: nowrap; transition: all 0.2s; }
        .category-pill.active { background: rgba(56, 189, 248, 0.18); color: #38bdf8; border-color: #38bdf8; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.2); }

        .catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 18px; width: 100%; max-width: 1400px; margin: 0 auto; }
        .catalog-square { aspect-ratio: 1; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); padding: 12px; }
        .catalog-square:hover { transform: translateY(-6px) scale(1.03); background: rgba(30, 41, 59, 0.95); border-color: rgba(56, 189, 248, 0.5); box-shadow: 0 12px 28px -8px rgba(56, 189, 248, 0.25); }

        .fab-cart { position: fixed; bottom: 32px; right: 32px; z-index: 40; background: linear-gradient(135deg, #2563eb 0%, #0284c7 100%); color: white; border: none; border-radius: 30px; padding: 16px 28px; font-size: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 12px; box-shadow: 0 12px 30px rgba(37, 99, 235, 0.45); transition: all 0.3s; }
        .fab-cart:hover { transform: scale(1.05) translateY(-4px); box-shadow: 0 16px 40px rgba(37, 99, 235, 0.6); }

        .drawer-overlay { position: fixed; inset: 0; background: rgba(4, 9, 20, 0.8); backdrop-filter: blur(6px); z-index: 1000; }
        .drawer-content { position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 440px; background: #0f172a; border-left: 1px solid rgba(255,255,255,0.12); z-index: 1001; display: flex; flex-direction: column; animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; box-shadow: -15px 0 40px rgba(0,0,0,0.5); }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(4, 9, 20, 0.85); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1050; padding: 20px; }
        .modal-body { background: #131b2e; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 32px; width: 100%; max-width: 480px; animation: popModal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9); max-height: 90vh; overflow-y: auto; }

        .success-box { text-align: center; color: white; animation: successPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .input-custom { background: #0d1527; border: 1px solid rgba(255, 255, 255, 0.15); color: #f8fafc; padding: 14px; border-radius: 12px; width: 100%; outline: none; font-size: 15px; }
        .input-custom:focus { border-color: #38bdf8; }
        .btn-primary { background: linear-gradient(135deg, #2563eb 0%, #0284c7 100%); color: white; border: none; padding: 14px 22px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; width: 100%; transition: 0.2s; }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .btn-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 16px 20px; border-radius: 14px; font-weight: 800; font-size: 16px; cursor: pointer; width: 100%; transition: 0.2s; }
        .btn-success:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .btn-danger { background: #ef4444; color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; width: 100%; transition: 0.2s; }
      `}</style>

      {/* HEADER PRINCIPAL */}
      <header className="header-layout">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img 
            src="/logo.png" 
            alt="SuperCalculo Logo" 
            style={{ height: 46, width: 'auto', objectFit: 'contain' }} 
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
          />
          <h1 style={{ 
            margin: 0, 
            fontSize: 26, 
            fontWeight: 800,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SuperCalculo
          </h1>
        </div>

        {usuarioActivo && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button className={`profile-btn ${isProfileMenuOpen ? 'active' : ''}`} onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
              <span style={{ fontSize: 22 }}>👤</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>{usuarioActivo.nombre}</div>
              </div>
              <span style={{ color: '#64748b', fontSize: 12 }}>▼</span>
            </button>
            {isProfileMenuOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => { setModalEditBudget(true); setIsProfileMenuOpen(false); }}>✏️ Editar Presupuesto</button>
                <button className="dropdown-item" onClick={() => { setModalHistorial(true); setIsProfileMenuOpen(false); }}>📜 Ver Historial de Compras</button>
                <button className="dropdown-item" onClick={() => { setModalUsuario(true); setIsProfileMenuOpen(false); }}>👥 Cambiar / Agregar Perfil</button>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                <button className="dropdown-item danger" onClick={() => { setModalDelete(true); setIsProfileMenuOpen(false); }}>⚠️ Eliminar cuenta</button>
              </div>
            )}
          </div>
        )}
      </header>

      {usuarioActivo && (
        <div className="dashboard-top animated-entry">
          <BudgetDonutChart gasto={totalGasto} presupuesto={presupuestoMax} />
          
          <div className="metrics-container">
            <div className="metric-card glass-panel">
              <span className="metric-title">Gasto Total 📊</span>
              <span className="metric-value" style={{ color: totalGasto > presupuestoMax ? '#ef4444' : '#38bdf8' }}>
                ${totalGasto.toFixed(2)} MXN
              </span>
            </div>
            <div className="metric-card glass-panel">
              <span className="metric-title">En Carrito ✅</span>
              <span className="metric-value" style={{ color: '#f8fafc' }}>
                {Number.isInteger(itemsEnCarrito) ? itemsEnCarrito : itemsEnCarrito.toFixed(1)} {itemsEnCarrito === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <div className="metric-card glass-panel full-width-mobile">
              <span className="metric-title">Presupuesto 🎯</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                ${presupuestoMax.toFixed(2)} MXN
              </span>
            </div>
          </div>
        </div>
      )}

      {/* BUSCADOR Y CATÁLOGO */}
      <main>
        <div className="search-container animated-entry" style={{ animationDelay: '0.08s' }}>
          <span style={{ position: 'absolute', left: 18, top: 18, fontSize: 18 }}>🔍</span>
          <input 
            type="text" placeholder="Buscar productos en el catálogo..." className="search-input"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
          {sugerencias.length > 0 && (
            <div className="suggestions-box">
              {sugerencias.map(prod => (
                <div key={prod.id} className="suggestion-item" onClick={() => { setModalAddProduct(prod); setSearchQuery(''); }}>
                  <span style={{ fontSize: 26 }}>{prod.icono}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{prod.nombre}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{prod.categoria}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="categories-row animated-entry" style={{ animationDelay: '0.15s' }}>
          {categories.map(cat => (
            <button key={cat} className={`category-pill ${categoriaActiva === cat ? 'active' : ''}`} onClick={() => setCategoriaActiva(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="catalog-grid animated-entry" style={{ animationDelay: '0.2s' }}>
          {productosFiltrados.map((prod) => (
            <div key={prod.id} className="catalog-square" onClick={() => setModalAddProduct(prod)}>
              <span style={{ fontSize: 40, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>{prod.icono}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', textAlign: 'center', lineHeight: 1.2 }}>{prod.nombre}</span>
            </div>
          ))}

          <div 
            className="catalog-square" 
            onClick={() => {
              const catDefault = categoriaActiva === 'Todas' ? 'Despensa' : categoriaActiva;
              setNuevaCategoria(catDefault);
              setNuevoNombre('');
              setNuevoIcono(autoDetectIcon('', catDefault));
              setModalNuevoProducto(true);
            }}
            style={{ border: '2px dashed rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.05)' }}
          >
            <span style={{ fontSize: 36, color: '#38bdf8' }}>➕</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', textAlign: 'center' }}>
              Nuevo producto
            </span>
          </div>
        </div>
      </main>

      {/* CARRITO Y MODALES */}
      {carrito.length > 0 && (
        <button className="fab-cart" onClick={() => setIsCartOpen(true)}>
          🛒 Carrito <span style={{ background: '#ef4444', borderRadius: '20px', padding: '2px 10px', fontSize: 13 }}>{carrito.length}</span>
        </button>
      )}

      {isCartOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setIsCartOpen(false)} />
          <div className="drawer-content">
            <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>🛒 Tu Carrito</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 24, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {carrito.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 14 }}>
                  <div style={{ fontSize: 32 }}>{item.icono}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{item.nombre}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>{item.cantidad} {item.unidad} x ${Number(item.precio_mxn).toFixed(2)}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: 16 }}>${(Number(item.precio_mxn) * item.cantidad).toFixed(2)}</div>
                  <button onClick={() => eliminarDelCarrito(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18 }}>🗑️</button>
                </div>
              ))}
            </div>
            <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.1)', background: '#090d16' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 18, fontWeight: 700 }}>
                <span>Total Calculado:</span>
                <span style={{ color: totalGasto > presupuestoMax ? '#ef4444' : '#38bdf8' }}>${totalGasto.toFixed(2)} MXN</span>
              </div>
              {totalGasto > presupuestoMax && (
                <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>⚠️ Has superado tu presupuesto máximo</div>
              )}
              <button className="btn-success" onClick={finalizarCompra}>✨ Finalizar Compra</button>
            </div>
          </div>
        </>
      )}

      {/* MODAL CREAR NUEVO PRODUCTO PARA EL CATÁLOGO */}
      {modalNuevoProducto && (
        <div className="modal-overlay" onClick={() => setModalNuevoProducto(false)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span>➕</span> Agregar Producto al Catálogo
            </h3>
            <form onSubmit={crearProductoCatalogo} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>Nombre del Producto:</label>
                <input
                  type="text"
                  required
                  className="input-custom"
                  placeholder="Ej. Palta, Yogurt, Galletas..."
                  value={nuevoNombre}
                  onChange={e => {
                    const val = e.target.value;
                    setNuevoNombre(val);
                    setNuevoIcono(autoDetectIcon(val, nuevaCategoria));
                  }}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>Categoría:</label>
                <select
                  className="input-custom"
                  value={nuevaCategoria}
                  onChange={e => {
                    const cat = e.target.value;
                    setNuevaCategoria(cat);
                    setNuevoIcono(autoDetectIcon(nuevoNombre, cat));
                  }}
                >
                  {categories.filter(c => c !== 'Todas').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>Ícono / Emoji:</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <input
                    type="text"
                    className="input-custom"
                    value={nuevoIcono}
                    onChange={e => setNuevoIcono(e.target.value)}
                    placeholder="🛒"
                    style={{ textAlign: 'center', fontSize: 22, width: 64 }}
                  />
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Elige una sugerencia o escribe otro:</span>
                </div>
                
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxHeight: 110, overflowY: 'auto', padding: 4 }}>
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNuevoIcono(emoji)}
                      style={{
                        background: nuevoIcono === emoji ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.05)',
                        border: nuevoIcono === emoji ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        padding: '6px 10px',
                        fontSize: 18,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="input-custom" onClick={() => setModalNuevoProducto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalAddProduct && (
        <div className="modal-overlay" onClick={() => setModalAddProduct(null)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 12 }}>{modalAddProduct.icono}</div>
            <h3 style={{ textAlign: 'center', margin: '0 0 24px' }}>Agregar {modalAddProduct.nombre}</h3>
            <form onSubmit={agregarAlCarrito} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>Precio (MXN):</label>
                <input type="number" step="0.01" required className="input-custom" value={tempPrecio} onChange={e => setTempPrecio(e.target.value)} placeholder="0.00" autoFocus />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>Cantidad:</label>
                  <input type="number" step="0.01" required className="input-custom" value={tempCant} onChange={e => setTempCant(Number(e.target.value))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>Unidad:</label>
                  <select className="input-custom" value={tempUnidad} onChange={e => setTempUnidad(e.target.value)}>
                    <option value="pzas">Pzas</option>
                    <option value="kg">Kg</option>
                    <option value="litros">Litros</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>+ Agregar al Carrito</button>
            </form>
          </div>
        </div>
      )}

      {modalUsuario && (
        <div className="modal-overlay">
          <div className="modal-body">
            <h2 style={{ margin: '0 0 24px', textAlign: 'center' }}>👋 Bienvenido a SuperCalculo</h2>
            {usuarios.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: '#94a3b8' }}>Selecciona tu perfil:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {usuarios.map(u => (
                    <button key={u.id} className="dropdown-item" style={{ background: 'rgba(255,255,255,0.05)' }} onClick={() => { setUsuarioActivo(u); setModalUsuario(false); }}>
                      👤 {u.nombre} - Presupuesto: ${Number(u.presupuesto_maximo).toFixed(2)}
                    </button>
                  ))}
                </div>
                <div style={{ textAlign: 'center', margin: '16px 0', color: '#64748b', fontSize: 12 }}>O crea uno nuevo</div>
              </div>
            )}
            <form onSubmit={crearUsuario} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>Nombre del nuevo perfil:</label>
                <input type="text" name="nombre" required className="input-custom" placeholder="Ej. Juan Pérez" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>Presupuesto Máximo (MXN):</label>
                <input type="number" step="0.01" name="presupuesto" required className="input-custom" placeholder="1000.00" />
              </div>
              <button type="submit" className="btn-primary">Crear y Entrar</button>
            </form>
          </div>
        </div>
      )}

      {modalEditBudget && (
        <div className="modal-overlay" onClick={() => setModalEditBudget(false)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 24px', textAlign: 'center' }}>✏️ Modificar Presupuesto</h3>
            <form onSubmit={actualizarPresupuesto} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>Nuevo Presupuesto (MXN):</label>
                <input type="number" step="0.01" required className="input-custom" value={tempPresupuesto} onChange={e => setTempPresupuesto(e.target.value)} placeholder="Ej. 1500.00" autoFocus />
              </div>
              <button type="submit" className="btn-primary">Actualizar</button>
            </form>
          </div>
        </div>
      )}

      {modalDelete && (
        <div className="modal-overlay" onClick={() => setModalDelete(false)}>
          <div className="modal-body" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ margin: '0 0 16px' }}>¿Eliminar cuenta?</h3>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>Esta acción borrará todo tu historial y carrito permanentemente.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="input-custom" onClick={() => setModalDelete(false)}>Cancelar</button>
              <button className="btn-danger" onClick={eliminarCuenta}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {modalHistorial && (
        <div className="modal-overlay" onClick={() => setModalHistorial(false)}>
          <div className="modal-body" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 26 }}>📜</span> Historial de Compras</h2>
              <button onClick={() => setModalHistorial(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '60vh', overflowY: 'auto' }}>
              {historial.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.4 }}>📭</div>
                  <h3 style={{ color: '#f8fafc', margin: '0 0 8px', fontSize: 18 }}>Nada por aquí todavía</h3>
                  <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Tus recibos aparecerán aquí.</p>
                </div>
              ) : (
                historial.map(compra => (
                  <div key={compra.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12, marginBottom: 12, alignItems: 'center' }}>
                      <div style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>
                        📅 {new Date(compra.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: 16 }}>Total: ${Number(compra.total).toFixed(2)}</div>
                        <button
                          onClick={() => setHistorialAEliminar(compra.id)}
                          title="Borrar registro del historial"
                          style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#f87171', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14 }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {compra.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#cbd5e1' }}>
                          <span>{item.icono} {item.nombre} <span style={{ color: '#64748b' }}>({item.cantidad} {item.unidad})</span></span>
                          <span style={{ fontWeight: 600 }}>${(Number(item.precio_mxn) * item.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {historialAEliminar !== null && (
        <div className="modal-overlay" onClick={() => setHistorialAEliminar(null)} style={{ zIndex: 1100 }}>
          <div className="modal-body" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: '0 0 12px' }}>¿Eliminar registro?</h3>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
              Esta compra se borrará permanentemente del historial.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="input-custom" onClick={() => setHistorialAEliminar(null)}>Cancelar</button>
              <button
                className="btn-danger"
                onClick={async () => {
                  await eliminarDelHistorial(historialAEliminar);
                  setHistorialAEliminar(null);
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalSuccess && (
        <div className="modal-overlay">
          <div className="success-box">
            <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
            <h2 style={{ margin: '0 0 8px' }}>¡Compra Exitosa!</h2>
            <p style={{ color: '#94a3b8', margin: 0 }}>Se ha guardado en tu historial.</p>
          </div>
        </div>
      )}
    </div>
  );
}