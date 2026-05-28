import React from 'react';
import { Award, AlertTriangle, TrendingUp, BarChart2, Calendar, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function PriceCard({ data, searchedVehicle }) {
  if (!data) {
    return (
      <Card className="glass-card border-dashed p-12 h-full flex flex-col items-center justify-center text-center bg-card shadow-sm rounded-2xl">
        <TrendingUp size={40} className="text-zinc-400 mb-4 animate-pulse-slow" />
        <h3 className="text-base font-extrabold text-foreground mb-1.5 tracking-tight">
          Esperando Cotización
        </h3>
        <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed font-semibold">
          Completa el formulario de la izquierda con los datos de tu auto para estimar su valor real de mercado.
        </p>
      </Card>
    );
  }

  const {
    make,
    model,
    year,
    mileage_km,
    estimated_price_clp,
    median_price_clp,
    average_price_clp,
    sample_size,
    confidence,
    price_range_clp
  } = data;

  if (!estimated_price_clp || sample_size === 0) {
    return (
      <Card className="glass-card p-8 h-full flex flex-col items-center justify-center text-center bg-card shadow-lg rounded-2xl">
        <AlertTriangle size={40} className="text-amber-500 mb-3 animate-pulse-slow" />
        <h3 className="text-base font-extrabold text-foreground mb-2 tracking-tight">
          Muestra de Mercado Insuficiente
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-[340px] mb-4 font-semibold">
          No se registran suficientes publicaciones en el catálogo de <strong>{make} {model} ({year})</strong> con kilometraje cercano a <strong>{new Intl.NumberFormat("es-CL").format(mileage_km)} km</strong> para calcular una estimación confiable.
        </p>
        
        <div className="bg-zinc-50 border border-border p-5 rounded-xl text-xs text-muted-foreground text-left w-full max-w-[340px] shadow-inner">
          <strong className="text-foreground block mb-2 font-extrabold">💡 Recomendaciones:</strong>
          <ul className="list-disc pl-5 flex flex-col gap-1.5 font-semibold">
            <li>Intenta consultar años más recientes (ej. <strong>2022 - 2026</strong>) que tienen mayor cobertura.</li>
            <li>Prueba con un rango de kilometraje diferente.</li>
            <li>Explora la pestaña de <strong>Explorador de Cobertura</strong> para ver los años y tramos disponibles para <strong>{make}</strong>.</li>
          </ul>
        </div>
      </Card>
    );
  }

  const lowPrice = price_range_clp?.low || estimated_price_clp * 0.85;
  const highPrice = price_range_clp?.high || estimated_price_clp * 1.15;

  // Formatters
  const formatCLP = (val) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatMileage = (val) => {
    return new Intl.NumberFormat("es-CL").format(val) + " km";
  };

  // Calculate percentage position of estimated price in the range
  const rangeSpan = highPrice - lowPrice;
  const estimateOffset = estimated_price_clp - lowPrice;
  const rangePercentage = rangeSpan > 0 ? Math.min(Math.max((estimateOffset / rangeSpan) * 100, 0), 100) : 50;

  // Confidence indicators mapping
  const confidenceConfig = {
    high: { label: 'Confianza Alta', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm', icon: Award },
    medium: { label: 'Confianza Media', class: 'bg-sky-50 text-sky-700 border border-sky-200/60 shadow-sm', icon: Award },
    low: { label: 'Confianza Baja', class: 'bg-amber-50 text-amber-700 border border-amber-200/60 shadow-sm', icon: AlertTriangle }
  };

  const currentConf = confidenceConfig[confidence?.toLowerCase()] || confidenceConfig.medium;
  const ConfIcon = currentConf.icon;

  return (
    <Card className="glass-card p-8 h-full flex flex-col gap-6 shadow-lg">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest leading-none">
            Estimación de Valor
          </span>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight mt-1.5">
            {make} {model}
          </h2>
          <div className="flex gap-3 mt-2 text-xs text-zinc-600 font-extrabold">
            <span className="flex items-center gap-1 bg-zinc-50 px-2.5 py-1 rounded-lg border border-border/60">
              <Calendar size={13} className="text-zinc-400" /> {year}
            </span>
            <span className="flex items-center gap-1 bg-zinc-50 px-2.5 py-1 rounded-lg border border-border/60">
              <Gauge size={13} className="text-zinc-400" /> {formatMileage(mileage_km)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentConf.class}`}>
            <ConfIcon size={11} />
            {currentConf.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold">
            Muestra: <strong className="text-foreground">{sample_size} autos</strong>
          </span>
        </div>
      </div>

      {/* Main Estimated Price Card with soft ambient radial gradient and inner shadow */}
      <div className="bg-zinc-50 border border-border/60 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden">
        {/* Ambient mesh-glow circle inside price container */}
        <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-zinc-200/40 blur-2xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-zinc-100/60 blur-2xl pointer-events-none"></div>

        <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-extrabold mb-1.5 relative z-10">
          Precio Estimado de Mercado
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-none my-1 bg-gradient-to-b from-zinc-800 to-black bg-clip-text text-transparent relative z-10">
          {formatCLP(estimated_price_clp)}
        </h1>
        <p className="text-[10px] text-muted-foreground mt-2.5 font-semibold relative z-10">
          Calculado con ventana de kilometraje de ±{new Intl.NumberFormat("es-CL").format(data.mileage_window_km || 20000)} km
        </p>
      </div>

      {/* Warning if Confidence is Low */}
      {confidence?.toLowerCase() === 'low' && (
        <Alert className="bg-amber-50/50 border border-amber-200/80 text-amber-950 p-4 rounded-xl flex gap-3 shadow-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500" />
          <div>
            <AlertTitle className="text-xs font-extrabold block mb-0.5 text-amber-900 leading-none">Advertencia de Muestra Reducida</AlertTitle>
            <AlertDescription className="text-[11px] leading-relaxed text-amber-800 font-semibold font-semibold">
              La confianza de esta estimación es **Baja** debido a que se basa en solo {sample_size} publicaciones. Te sugerimos tomar este valor con cautela.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Price Range Meter */}
      <div className="flex flex-col gap-3.5">
        <div className="flex justify-between text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest leading-none">
          <span>Rango de Mercado Mín/Máx</span>
        </div>
        <div className="relative h-2.5 bg-zinc-100 rounded-full border border-border/60 mb-3 shadow-inner">
          {/* Slider line indicating lower/higher range */}
          <div className="absolute left-0 right-0 h-full bg-zinc-900 rounded-full"></div>
          
          {/* Custom attractive tactile bullet/indicator for estimated price */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-foreground border-3 border-background rounded-full shadow-md z-10 transition-all duration-500 ease-out cursor-pointer"
            style={{ left: `${rangePercentage}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-3 text-xs text-center font-semibold">
          <div className="text-left">
            <span className="text-[9px] text-zinc-400 block mb-0.5 font-bold uppercase tracking-wide">Mínimo</span>
            <strong className="text-zinc-700 font-bold">{formatCLP(lowPrice)}</strong>
          </div>
          <div>
            <span className="text-[9px] text-zinc-400 block mb-0.5 font-bold uppercase tracking-wide">Estimado</span>
            <strong className="text-zinc-950 font-extrabold">{formatCLP(estimated_price_clp)}</strong>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-zinc-400 block mb-0.5 font-bold uppercase tracking-wide">Máximo</span>
            <strong className="text-zinc-700 font-bold">{formatCLP(highPrice)}</strong>
          </div>
        </div>
      </div>

      {/* Median and Average stats - beautifully curved cards */}
      <div className="grid grid-cols-2 gap-4 border-t border-border/80 pt-5 mt-auto">
        <div className="bg-zinc-50 border border-border/80 rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:bg-zinc-100/50 shadow-sm">
          <BarChart2 size={16} className="text-zinc-500 shrink-0" strokeWidth={2.5} />
          <div>
            <span className="text-[9px] text-zinc-400 block leading-tight font-extrabold uppercase tracking-wider">Mediana</span>
            <strong className="text-base font-extrabold text-foreground">{formatCLP(median_price_clp)}</strong>
          </div>
        </div>

        <div className="bg-zinc-50 border border-border/80 rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:bg-zinc-100/50 shadow-sm">
          <TrendingUp size={16} className="text-zinc-500 shrink-0" strokeWidth={2.5} />
          <div>
            <span className="text-[9px] text-zinc-400 block leading-tight font-extrabold uppercase tracking-wider">Promedio</span>
            <strong className="text-base font-extrabold text-foreground">{formatCLP(average_price_clp)}</strong>
          </div>
        </div>
      </div>

    </Card>
  );
}
