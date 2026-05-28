import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar({ onOpenSettings }) {
  const [healthStatus, setHealthStatus] = useState('checking'); // checking, ok, error
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api-precioautos.nucolab.cl';

  const checkHealth = async () => {
    setHealthStatus('checking');
    try {
      const res = await fetch(`${apiBaseUrl}/health`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          setHealthStatus('ok');
        } else {
          setHealthStatus('error');
        }
      } else {
        setHealthStatus('error');
      }
    } catch (err) {
      setHealthStatus('error');
    }
  };

  useEffect(() => {
    checkHealth();
    // Periodically verify every 30s
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  return (
    <header className="flex items-center justify-between py-6 border-b border-border/70 mb-8 w-full bg-transparent">
      <div className="flex items-center gap-3">
        <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
          <Sparkles size={18} className="text-primary-foreground" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight leading-none m-0">
            PRECIOS<span className="font-light text-foreground/70">AUTOS</span>
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            Valuador de Mercado MVP
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Connection status badge */}
        {healthStatus === 'checking' && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200 animate-pulse-slow">
            <Activity size={12} className="animate-spin-slow" />
            Conectando...
          </span>
        )}
        {healthStatus === 'ok' && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-zinc-50 border border-zinc-900 shadow-sm">
            <Activity size={12} />
            API Activa
          </span>
        )}
        {healthStatus === 'error' && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
            <ShieldAlert size={12} />
            Sin Conexión
          </span>
        )}

        {/* Configurations Quick Info */}
        <Button 
          onClick={onOpenSettings}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 cursor-pointer border-border hover:bg-zinc-100 rounded-md text-xs font-semibold h-8.5 transition-all duration-200 shadow-sm"
          title="Ver configuraciones actuales (.env)"
        >
          <Sliders size={14} className="text-foreground" />
          <span>Configuración</span>
        </Button>
      </div>
    </header>
  );
}
