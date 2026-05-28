import React, { useState, useEffect } from 'react';
import { Filter, Calendar, Search, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SegmentsExplorer({ catalogError, isKeyPlaceholder }) {
  const [makes, setMakes] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [sinceYear, setSinceYear] = useState('2022');
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  const apiKey = import.meta.env.VITE_API_KEY || '';

  // Get distinct makes from catalog
  useEffect(() => {
    const fetchMakes = async () => {
      if (isKeyPlaceholder) return;
      try {
        const headers = {};
        if (apiKey && apiKey !== 'tu_api_key_aqui' && apiKey.trim() !== '') {
          headers['X-API-Key'] = apiKey;
        }
        const res = await fetch(`${apiBaseUrl}/catalog`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.items) {
            const uniqueMakes = [...new Set(data.items.map(item => item.make))].sort();
            setMakes(uniqueMakes);
            if (uniqueMakes.length > 0) {
              setSelectedMake(uniqueMakes[0]); // Default to first make
            }
          }
        }
      } catch (err) {
        console.error("Error fetching makes for segments", err);
      }
    };
    fetchMakes();
  }, [apiBaseUrl, apiKey, isKeyPlaceholder]);

  const handleFetchSegments = async (e) => {
    e.preventDefault();
    if (!selectedMake) {
      setError('Por favor selecciona una marca.');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const headers = {};
      if (apiKey && apiKey !== 'tu_api_key_aqui' && apiKey.trim() !== '') {
        headers['X-API-Key'] = apiKey;
      }
      const res = await fetch(`${apiBaseUrl}/segments?make=${encodeURIComponent(selectedMake)}&since_year=${sinceYear}`, { headers });

      if (res.ok) {
        const data = await res.json();
        const items = data.items || data || [];
        setSegments(items);
      } else if (res.status === 401) {
        setError('Error 401: API Key inválida o ausente.');
      } else if (res.status === 422) {
        setError('Error 422: Parámetros inválidos. Valida el año ingresado.');
      } else {
        setError(`Error del servidor (Código ${res.status}). Inténtalo más tarde.`);
      }
    } catch (err) {
      setError('Error de conexión a la red. Revisa si el servidor está levantado.');
    } finally {
      setLoading(false);
    }
  };

  const formatCLP = (val) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper for sample badges (Black and White theme)
  const getSampleBadge = (sampleSize) => {
    if (sampleSize >= 15) {
      return { text: 'Óptima', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60', desc: 'Estadísticas robustas' };
    } else if (sampleSize >= 5) {
      return { text: 'Media', class: 'bg-sky-50 text-sky-700 border border-sky-200/60', desc: 'Datos referenciales' };
    } else {
      return { text: 'Baja', class: 'bg-amber-50 text-amber-700 border border-amber-200/60', desc: 'Muestra insuficiente' };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Search Bar parameters */}
      <Card className="glass-card p-7 shadow-sm">
        <CardHeader className="p-0 mb-5 flex flex-row items-center gap-2">
          <Layers size={16} className="text-zinc-800" strokeWidth={2.5} />
          <CardTitle className="text-base font-extrabold text-foreground tracking-tight">
            Explorador de Cobertura de Segmentos
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <form onSubmit={handleFetchSegments} className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="segment-make" className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">Marca de Autos</Label>
              <select
                id="segment-make"
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs text-foreground outline-none cursor-pointer transition-all duration-300 shadow-sm"
                disabled={makes.length === 0}
              >
                <option value="">-- Selecciona Marca --</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="since-year" className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">Desde el Año</Label>
              <select
                id="since-year"
                value={sinceYear}
                onChange={(e) => setSinceYear(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs text-foreground outline-none cursor-pointer transition-all duration-300 shadow-sm"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2020">2020</option>
                <option value="2018">2018</option>
                <option value="2015">2015</option>
                <option value="2010">2010</option>
              </select>
            </div>

            <Button 
              type="submit" 
              className="h-10 px-5 text-xs font-bold bg-primary text-primary-foreground hover:bg-zinc-800 cursor-pointer rounded-xl shadow-md transition-all duration-150 btn-hover-effect flex items-center gap-1.5"
              disabled={loading || makes.length === 0}
            >
              {loading ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
              <span>Consultar Cobertura</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results rendering */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-950 text-xs leading-normal shadow-sm">
          <AlertCircle size={16} className="shrink-0 text-rose-500" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {loading && (
        <Card className="glass-card p-12 text-center shadow-sm">
          <RefreshCw size={28} className="text-zinc-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground font-semibold">Obteniendo tramos de precios y segmentos...</p>
        </Card>
      )}

      {!loading && searched && segments.length === 0 && !error && (
        <Card className="glass-card border-dashed p-12 text-center shadow-sm">
          <AlertCircle size={28} className="text-zinc-400 mx-auto mb-3" />
          <p className="text-sm font-extrabold text-foreground mb-1">Sin Datos Disponibles</p>
          <p className="text-xs text-muted-foreground font-semibold">
            No se encontraron segmentos registrados en la base de datos para <strong>{selectedMake}</strong> desde el año {sinceYear}.
          </p>
        </Card>
      )}

      {!loading && searched && segments.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">
              Resultados: Cobertura de <strong className="text-foreground">{segments.length}</strong> tramos encontrados
            </span>
            <div className="flex gap-3.5 text-[10px] font-bold text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-sm"></span> Muestra &gt;= 15</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-sky-400 shadow-sm"></span> Muestra 5 - 14</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-400 shadow-sm"></span> Muestra &lt; 5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {segments.map((seg, idx) => {
              const badge = getSampleBadge(seg.sample_size);
              const isLowSample = seg.sample_size < 5;

              return (
                <Card 
                  key={idx} 
                  className="glass-card p-5 flex flex-col gap-3 transition-all duration-300 shadow-sm hover:border-zinc-400"
                  style={{ 
                    opacity: isLowSample ? 0.8 : 1
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground leading-tight tracking-tight">{seg.model || 'Modelo'}</h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-0.5"><Calendar size={11} className="text-zinc-400" /> {seg.year}</span>
                        <span className="text-zinc-300">•</span>
                        <span>{seg.mileage_bucket || '0-49.999'} km</span>
                      </div>
                    </div>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-sm ${badge.class}`}
                      title={badge.desc}
                    >
                      {badge.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3 rounded-xl border border-border/80 shadow-inner">
                    <div>
                      <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wider">Promedio</span>
                      <strong className="text-xs font-bold text-foreground">
                        {formatCLP(seg.average_price_clp || seg.estimated_price_clp || 0)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wider">Mediana</span>
                      <strong className="text-xs font-bold text-foreground">
                        {formatCLP(seg.median_price_clp || seg.estimated_price_clp || 0)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold mt-1">
                    <span>Registros: <strong className="text-foreground">{seg.sample_size} autos</strong></span>
                    {isLowSample && (
                      <span className="text-zinc-500 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        <AlertCircle size={10} /> Referencial
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {!searched && (
        <Card className="glass-card p-12 text-center flex flex-col items-center shadow-sm">
          <Filter size={36} className="text-zinc-400 mb-3" />
          <h3 className="text-base font-extrabold text-foreground mb-1.5 tracking-tight">
            Exploración de Cobertura Completa
          </h3>
          <p className="text-xs text-muted-foreground max-w-[440px] leading-relaxed font-semibold">
            Usa el selector superior para ver todas las combinaciones reales de modelos, años y kilometrajes con datos activos. Esto te ayudará a ver qué autos tienen suficientes datos para una estimación óptima.
          </p>
        </Card>
      )}

    </div>
  );
}
