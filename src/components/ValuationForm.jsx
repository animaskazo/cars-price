import React, { useEffect, useState } from 'react';
import { Search, Info, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ValuationForm({ onSubmit, loading, catalogError, onRetryCatalog, isKeyPlaceholder }) {
  const [catalog, setCatalog] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  
  // Form State
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [displayMileage, setDisplayMileage] = useState('');
  const [rawMileage, setRawMileage] = useState('');
  
  const [validationError, setValidationError] = useState('');

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  const apiKey = import.meta.env.VITE_API_KEY || '';

  // Generate years from current year down to 1990
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

  // Fetch catalog on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      if (isKeyPlaceholder) {
        return;
      }
      try {
        const headers = {};
        if (apiKey && apiKey !== 'tu_api_key_aqui' && apiKey.trim() !== '') {
          headers['X-API-Key'] = apiKey;
        }
        const res = await fetch(`${apiBaseUrl}/catalog`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.items) {
            setCatalog(data.items);
            // Extract unique makes
            const uniqueMakes = [...new Set(data.items.map(item => item.make))].sort();
            setMakes(uniqueMakes);
          }
        }
      } catch (err) {
        console.error("Error fetching catalog in form", err);
      }
    };

    fetchCatalog();
  }, [apiBaseUrl, apiKey, catalogError]);

  // Effect to handle catalog updates
  useEffect(() => {
    if (catalog.length > 0) {
      const uniqueMakes = [...new Set(catalog.map(item => item.make))].sort();
      setMakes(uniqueMakes);
    }
  }, [catalog]);

  // Filter models when make changes
  const handleMakeChange = (e) => {
    const make = e.target.value;
    setSelectedMake(make);
    setSelectedModel(''); // Reset model selection
    
    if (make) {
      const filteredModels = catalog
        .filter(item => item.make === make)
        .map(item => item.model);
      // Remove duplicates just in case and sort
      setModels([...new Set(filteredModels)].sort());
    } else {
      setModels([]);
    }
  };

  // Format Mileage
  const handleMileageChange = (e) => {
    const val = e.target.value;
    // Strip non-digits
    const numericValue = val.replace(/\D/g, '');
    setRawMileage(numericValue);

    if (numericValue) {
      const formatted = new Intl.NumberFormat('es-CL').format(numericValue);
      setDisplayMileage(formatted);
    } else {
      setDisplayMileage('');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedMake) {
      setValidationError('Por favor selecciona una marca.');
      return;
    }
    if (!selectedModel) {
      setValidationError('Por favor selecciona un modelo.');
      return;
    }
    if (!selectedYear) {
      setValidationError('Por favor selecciona el año.');
      return;
    }
    if (!rawMileage) {
      setValidationError('Por favor ingresa el kilometraje.');
      return;
    }

    onSubmit({
      make: selectedMake,
      model: selectedModel,
      year: parseInt(selectedYear, 10),
      mileage_km: parseInt(rawMileage, 10)
    });
  };

  return (    <Card className="glass-card p-8 h-full shadow-lg">
      <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-extrabold text-foreground tracking-tight">
          Valuador de Vehículo
        </CardTitle>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-zinc-900 text-zinc-50 border border-zinc-900 shadow-sm uppercase tracking-wider">CLP</span>
      </CardHeader>
      
      <CardContent className="p-0">
        {catalogError ? (
          <div className="text-center py-6 bg-rose-50/20 rounded-2xl border border-rose-200/80 border-dashed">
            <AlertCircle size={28} className="text-rose-500 mx-auto mb-3 animate-pulse" />
            <p className="text-xs text-rose-950 mb-4 font-semibold">
              No se pudo cargar el catálogo de vehículos.
            </p>
            <Button 
              type="button" 
              onClick={onRetryCatalog} 
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl shadow-sm border-rose-200 hover:bg-rose-50 hover:text-rose-700 font-bold px-4 py-2 bg-background transition-colors"
            >
              <RefreshCw size={12} /> Reintentar Carga
            </Button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
            
            {/* Make (Marca) Select */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="make" className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">Marca</Label>
              <select
                id="make"
                value={selectedMake}
                onChange={handleMakeChange}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-xs text-foreground outline-none cursor-pointer transition-all duration-300 shadow-sm"
                disabled={makes.length === 0}
              >
                <option value="" className="bg-background">-- Selecciona Marca --</option>
                {makes.map(make => (
                  <option key={make} value={make} className="bg-background">{make}</option>
                ))}
              </select>
            </div>

            {/* Model (Modelo) Select */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="model" className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">Modelo</Label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-xs text-foreground outline-none cursor-pointer transition-all duration-300 shadow-sm"
                disabled={!selectedMake || models.length === 0}
              >
                <option value="" className="bg-background">-- Selecciona Modelo --</option>
                {models.map(model => (
                  <option key={model} value={model} className="bg-background">{model}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Year Select */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="year" className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">Año</Label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-xs text-foreground outline-none cursor-pointer transition-all duration-300 shadow-sm"
                >
                  <option value="" className="bg-background">Año</option>
                  {years.map(yr => (
                    <option key={yr} value={yr} className="bg-background">{yr}</option>
                  ))}
                </select>
              </div>

              {/* Mileage (Kilometraje) Input */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="mileage" className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">Kilometraje</Label>
                <div className="relative">
                  <Input
                    id="mileage"
                    type="text"
                    value={displayMileage}
                    onChange={handleMileageChange}
                    placeholder="ej. 50.000"
                    className="bg-background pr-9 border-border rounded-xl h-11 text-xs shadow-sm transition-all duration-300 px-4"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none font-bold">
                    km
                  </span>
                </div>
              </div>
            </div>

            {validationError && (
              <div className="flex items-start gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-950 text-xs leading-normal font-semibold shadow-sm">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-500" />
                <span>{validationError}</span>
              </div>
            )}

            <Button
              type="submit"
              className="mt-3 py-6 text-sm font-extrabold bg-gradient-to-b from-zinc-900 to-black hover:from-zinc-800 hover:to-zinc-950 text-primary-foreground cursor-pointer rounded-xl shadow-lg transition-all duration-350 ease-out hover:-translate-y-0.5 active:translate-y-0 hover:shadow-xl h-12 flex gap-2 justify-center items-center"
              disabled={loading || makes.length === 0}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Calculando...</span>
                </>
              ) : (
                <>
                  <Search size={14} />
                  <span>Calcular Precio</span>
                </>
              )}
            </Button>

            <div className="flex items-start gap-2 mt-1 bg-zinc-50/50 p-3 rounded-xl border border-border/50">
              <Info size={14} className="text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                Los precios se calculan de manera referencial en base a publicaciones observadas en portales locales chilenos.
              </p>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
