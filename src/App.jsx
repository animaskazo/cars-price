import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ValuationForm from './components/ValuationForm';
import PriceCard from './components/PriceCard';
import SegmentsExplorer from './components/SegmentsExplorer';
import TrendsChart from './components/TrendsChart';
import { Sliders, Key, Network, RefreshCw, AlertTriangle, Layers, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function App() {
  const [activeTab, setActiveTab] = useState('calculate'); // calculate, segments, history
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_API_KEY || '');
  const [apiBaseUrl, setApiBaseUrl] = useState(import.meta.env.VITE_API_BASE_URL || '/api');
  
  // App states
  const [loading, setLoading] = useState(false);
  const [valuationData, setValuationData] = useState(null);
  const [searchedVehicle, setSearchedVehicle] = useState(null);
  
  // Errors states
  const [apiError, setApiError] = useState('');
  const [catalogError, setCatalogError] = useState(false);
  
  // Modal / Settings state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTestResult, setSettingsTestResult] = useState(''); // testing, success, error, unauthorized

  // Key validation flag
  const isKeyPlaceholder = !apiKey || apiKey === 'tu_api_key_aqui' || apiKey.trim() === '';

  // Auto-validate connection when key is loaded
  useEffect(() => {
    if (!isKeyPlaceholder) {
      testApiConnection();
    }
  }, [apiKey, apiBaseUrl]);

  const testApiConnection = async () => {
    setCatalogError(false);
    try {
      const res = await fetch(`${apiBaseUrl}/catalog`, {
        headers: { 'X-API-Key': apiKey }
      });
      if (res.ok) {
        setCatalogError(false);
      } else {
        setCatalogError(true);
      }
    } catch (err) {
      setCatalogError(true);
    }
  };

  // Callback from ValuationForm
  const handleCalculatePrice = async (vehicle) => {
    setLoading(true);
    setApiError('');
    setValuationData(null);
    setSearchedVehicle(vehicle);

    const { make, model, year, mileage_km } = vehicle;
    const url = `${apiBaseUrl}/market-price?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}&mileage_km=${mileage_km}`;

    try {
      const res = await fetch(url, {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setValuationData(data);
      } else {
        if (res.status === 401) {
          setApiError('401: API Key inválida o vencida. Por favor, edita tu archivo .env.');
        } else if (res.status === 422) {
          setApiError('422: Parámetros inválidos. Por favor valida el kilometraje y año ingresado.');
        } else if (res.status === 429) {
          setApiError('429: Límite de peticiones excedido (Rate Limit). Inténtalo más tarde.');
        } else if (res.status >= 500) {
          setApiError(`5xx: Error del servidor de base de datos (${res.status}). Intenta reintentar.`);
        } else {
          setApiError(`Error de API: Respuesta con código ${res.status}.`);
        }
      }
    } catch (err) {
      setApiError('Error de red: No se pudo conectar a la API. Verifica tu conexión de red o si el servidor local está arriba.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestInSettings = async () => {
    setSettingsTestResult('testing');
    try {
      const resHealth = await fetch(`${apiBaseUrl}/health`);
      const isHealthOk = resHealth.ok;
      
      const resCatalog = await fetch(`${apiBaseUrl}/catalog`, {
        headers: { 'X-API-Key': apiKey }
      });
      
      if (isHealthOk && resCatalog.ok) {
        setSettingsTestResult('success');
      } else if (resCatalog.status === 401) {
        setSettingsTestResult('unauthorized');
      } else {
        setSettingsTestResult('error');
      }
    } catch (err) {
      setSettingsTestResult('error');
    }
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-6 pb-12">
      {/* Top Navigation */}
      <Navbar onOpenSettings={() => {
        setShowSettingsModal(true);
        handleTestInSettings();
      }} />

      {/* Main Content Layout */}
      {isKeyPlaceholder ? (
        /* Onboarding Config view when API key is a placeholder */
        <Card className="border border-border max-w-[680px] mx-auto my-12 p-8 text-center bg-card shadow-lg rounded-2xl">
          <AlertTriangle size={40} className="text-zinc-500 mx-auto mb-4 animate-pulse-slow" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mb-3 tracking-tight">
            Configuración de Credenciales Requerida
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
            El MVP está listo para operar en React, pero requiere que configures tu <strong>API Key</strong> en el archivo de variables de entorno seguro <code>.env</code> para realizar peticiones.
          </p>

          <div className="bg-zinc-50 border border-border p-5 rounded-xl text-left font-mono text-xs text-foreground mb-6 shadow-inner">
            <p className="text-muted-foreground mb-2 font-medium"># 1. Abre el archivo .env en tu editor de código:</p>
            <p className="text-zinc-950 font-bold break-all">/Users/fer/.gemini/antigravity-ide/scratch/car-price-mvp/.env</p>
            <p className="text-muted-foreground my-3 font-medium"># 2. Reemplaza la línea del token con tu credencial real:</p>
            <p className="text-zinc-900">VITE_API_KEY=<span className="text-zinc-950 font-extrabold">[INGRESA_TU_API_KEY_REAL]</span></p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-zinc-800 font-bold rounded-xl py-4 px-6 text-xs h-10 shadow-md btn-hover-effect"
            >
              <RefreshCw size={14} />
              <span>Recargar Aplicación</span>
            </Button>
            
            <Button 
              onClick={() => setShowSettingsModal(true)}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer border-border hover:bg-zinc-50 font-bold rounded-xl py-4 px-6 text-xs h-10 transition-colors shadow-sm"
            >
              <Sliders size={14} className="text-foreground" />
              <span>Ver Diagnóstico</span>
            </Button>
          </div>
        </Card>
      ) : (
        /* Regular Application Panel */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigator - Beautiful glassmorphic rounded pill list */}
          <TabsList className="grid grid-cols-3 bg-zinc-100/60 backdrop-blur-md border border-border/80 h-12 p-1.5 rounded-full mb-8 w-full shadow-inner">
            <TabsTrigger 
              value="calculate" 
              className="cursor-pointer font-bold text-xs flex gap-1.5 justify-center items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-full py-2 transition-all duration-300"
            >
              <DollarSign size={14} />
              <span>Calculadora de Precios</span>
            </TabsTrigger>
            <TabsTrigger 
              value="segments" 
              className="cursor-pointer font-bold text-xs flex gap-1.5 justify-center items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-full py-2 transition-all duration-300"
            >
              <Layers size={14} />
              <span>Explorador de Cobertura</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="cursor-pointer font-bold text-xs flex gap-1.5 justify-center items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-full py-2 transition-all duration-300"
            >
              <TrendingUp size={14} />
              <span>Gráficos de Tendencias</span>
            </TabsTrigger>
          </TabsList>

          {/* Render Active Tab */}
          <TabsContent value="calculate" className="flex flex-col gap-6 outline-none">
            {apiError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-950 leading-normal shadow-sm">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <strong className="text-sm block mb-0.5 font-extrabold text-rose-900">Fallo en la Solicitud</strong>
                  <span className="text-xs text-rose-800 font-semibold">{apiError}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-7 items-start">
              <div>
                <ValuationForm 
                  onSubmit={handleCalculatePrice} 
                  loading={loading}
                  catalogError={catalogError}
                  onRetryCatalog={testApiConnection}
                />
              </div>
              <div>
                <PriceCard data={valuationData} searchedVehicle={searchedVehicle} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="segments" className="outline-none">
            <SegmentsExplorer catalogError={catalogError} />
          </TabsContent>

          <TabsContent value="history" className="outline-none">
            <TrendsChart initialVehicle={searchedVehicle} />
          </TabsContent>
        </Tabs>
      )}

      {/* Global Settings & Diagnostic Dialog Overlay */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="border border-border max-w-[500px] w-[95%] p-6 bg-card text-card-foreground rounded-2xl shadow-xl">
          <DialogHeader className="flex flex-row items-center gap-2 mb-4 p-0">
            <Sliders size={16} className="text-foreground" strokeWidth={2.5} />
            <DialogTitle className="text-base font-extrabold text-foreground tracking-tight">
              Parámetros de Integración
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="text-[9px] text-muted-foreground block mb-1 uppercase tracking-widest font-bold">
                Base URL de API
              </label>
              <div className="flex items-center gap-2 bg-zinc-50 px-3.5 py-2.5 rounded-xl border border-border font-mono text-xs text-foreground shadow-sm">
                <Network size={13} className="text-zinc-400" />
                <span>{apiBaseUrl}</span>
              </div>
            </div>

            <div>
              <label className="text-[9px] text-muted-foreground block mb-1 uppercase tracking-widest font-bold">
                Carga de API Key (.env)
              </label>
              <div className="flex items-center gap-2 bg-zinc-50 px-3.5 py-2.5 rounded-xl border border-border font-mono text-xs text-foreground overflow-hidden shadow-sm">
                <Key size={13} className="text-zinc-400" />
                <span className="text-ellipsis overflow-hidden whitespace-nowrap w-full font-medium">
                  {isKeyPlaceholder ? '❌ NO CONFIGURADO (Placeholder)' : `${apiKey.substring(0, 10)}... (Cargado seguro)`}
                </span>
              </div>
            </div>

            {/* API diagnostic results panel */}
            <div className="bg-zinc-50 border border-border rounded-xl p-5 mt-2 shadow-inner">
              <h4 className="text-xs font-extrabold mb-2 text-foreground tracking-tight">
                Resultados del Diagnóstico:
              </h4>
              
              {settingsTestResult === 'testing' && (
                <p className="text-xs text-zinc-500 flex items-center gap-2 animate-pulse-slow font-medium">
                  <RefreshCw size={12} className="animate-spin-slow" /> Validando firma de API y servicios de red...
                </p>
              )}
              {settingsTestResult === 'success' && (
                <p className="text-xs text-foreground flex items-center gap-2 font-bold">
                  🟢 Conexión exitosa. El catálogo y servidor responden correctamente.
                </p>
              )}
              {settingsTestResult === 'unauthorized' && (
                <p className="text-xs text-zinc-700 flex items-center gap-2 font-semibold">
                  🔴 Error 401 (No Autorizado): La API Key es incorrecta o expiró.
                </p>
              )}
              {settingsTestResult === 'error' && (
                <p className="text-xs text-zinc-700 flex items-center gap-2 font-semibold">
                  🔴 Error de Red: El servidor API no responde. Verifica tu archivo .env.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button 
              onClick={handleTestInSettings} 
              variant="outline"
              className="text-xs py-1 px-3.5 flex items-center gap-1.5 cursor-pointer border-border text-foreground hover:bg-zinc-50 rounded-xl h-9 font-bold shadow-sm"
              disabled={settingsTestResult === 'testing'}
            >
              <RefreshCw size={12} />
              <span>Re-Probar</span>
            </Button>
            <Button 
              onClick={() => setShowSettingsModal(false)} 
              className="text-xs py-1 px-4 cursor-pointer bg-primary text-primary-foreground font-bold rounded-xl h-9 hover:bg-zinc-800 shadow-md btn-hover-effect"
            >
              <span>Entendido</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Embedded footer */}
      <footer className="text-center mt-12 border-t border-border pt-4 text-[11px] text-muted-foreground flex flex-col gap-1 font-medium">
        <p>© 2026 PreciosAutos MVP. Construido en React & Vite para NucoLab.</p>
        <p>
          Para editar configuraciones, abre el archivo local <code className="text-[10px] bg-zinc-50 px-1 py-0.5 rounded border border-border font-mono">.env</code>.
        </p>
      </footer>
    </div>
  );
}
