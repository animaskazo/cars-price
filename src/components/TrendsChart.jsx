import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp, AlertCircle, RefreshCw, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TrendsChart({ initialVehicle }) {
  const [catalog, setCatalog] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  
  // Selector states
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  const apiKey = import.meta.env.VITE_API_KEY || '';

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1995 + 1 }, (_, i) => currentYear - i);

  // Load catalog on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      if (!apiKey || apiKey === 'tu_api_key_aqui') return;
      try {
        const res = await fetch(`${apiBaseUrl}/catalog`, {
          headers: { 'X-API-Key': apiKey }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.items) {
            setCatalog(data.items);
            const uniqueMakes = [...new Set(data.items.map(item => item.make))].sort();
            setMakes(uniqueMakes);
            
            // Set defaults from initial searched vehicle if available
            if (initialVehicle) {
              setSelectedMake(initialVehicle.make);
              setSelectedYear(initialVehicle.year.toString());
              
              // Load models for this make
              const filteredModels = data.items
                .filter(item => item.make === initialVehicle.make)
                .map(item => item.model);
              setModels([...new Set(filteredModels)].sort());
              setSelectedModel(initialVehicle.model);
              
              // Auto-trigger fetch
              fetchTrend(initialVehicle.make, initialVehicle.model, initialVehicle.year.toString());
            } else if (uniqueMakes.length > 0) {
              setSelectedMake(uniqueMakes[0]);
              // Populate models for the default make
              const filteredModels = data.items
                .filter(item => item.make === uniqueMakes[0])
                .map(item => item.model);
              setModels([...new Set(filteredModels)].sort());
              if (filteredModels.length > 0) setSelectedModel(filteredModels[0]);
              setSelectedYear(currentYear.toString());
            }
          }
        }
      } catch (err) {
        console.error("Error loading catalog for chart", err);
      }
    };
    fetchCatalog();
  }, [apiBaseUrl, apiKey]);

  // Synchronize dropdowns when brand changes
  const handleMakeChange = (e) => {
    const make = e.target.value;
    setSelectedMake(make);
    setSelectedModel('');
    if (make) {
      const filteredModels = catalog
        .filter(item => item.make === make)
        .map(item => item.model);
      setModels([...new Set(filteredModels)].sort());
    } else {
      setModels([]);
    }
  };

  const fetchTrend = async (makeVal, modelVal, yearVal) => {
    const make = makeVal || selectedMake;
    const model = modelVal || selectedModel;
    const year = yearVal || selectedYear;

    if (!make || !model || !year) {
      setError('Por favor completa todos los filtros.');
      return;
    }

    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${apiBaseUrl}/market-price/monthly-average?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&model_year=${year}`, {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const list = data.items || data || [];
        
        if (list.length === 0) {
          setChartData(null);
          return;
        }

        // Sort data chronologically by period_month
        const sortedList = [...list].sort((a, b) => a.period_month.localeCompare(b.period_month));

        // Format periods, e.g. "2024-03" -> "Mar 2024"
        const monthNames = {
          '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
          '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
        };
        const labels = sortedList.map(item => {
          const parts = item.period_month.split('-');
          if (parts.length === 2) {
            return `${monthNames[parts[1]] || parts[1]} ${parts[0]}`;
          }
          return item.period_month;
        });

        const averages = sortedList.map(item => item.average_price_clp);
        const medians = sortedList.map(item => item.median_price_clp);
        const sampleSizes = sortedList.map(item => item.sample_size);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Precio Promedio (CLP)',
              data: averages,
              borderColor: '#09090b', // Pure solid black line
              backgroundColor: 'rgba(9, 9, 11, 0.02)',
              borderWidth: 2.5,
              pointBackgroundColor: '#09090b',
              pointBorderColor: '#ffffff',
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#ffffff',
              pointHoverBorderColor: '#09090b',
              pointHoverBorderWidth: 2,
              tension: 0.4, // Beautiful organic fluid curve
              fill: true,
              samples: sampleSizes
            },
            {
              label: 'Precio Mediana (CLP)',
              data: medians,
              borderColor: '#71717a', // Slate/gray dashed line
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderDash: [4, 4],
              pointBackgroundColor: '#71717a',
              pointBorderColor: '#ffffff',
              pointHoverRadius: 5,
              pointHoverBackgroundColor: '#ffffff',
              pointHoverBorderColor: '#71717a',
              pointHoverBorderWidth: 1.5,
              tension: 0.4, // Beautiful organic fluid curve
              fill: false,
              samples: sampleSizes
            }
          ]
        });

      } else if (res.status === 401) {
        setError('Error 401: API Key inválida o vencida.');
      } else {
        setError(`Error del servidor (Código ${res.status}). No se pudieron obtener tendencias.`);
      }
    } catch (err) {
      setError('Error de conexión a la red. Valida el estado de la API.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetchTrend();
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#09090b',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#09090b',
        titleFont: {
          family: "'Outfit', sans-serif",
          weight: 'bold',
          size: 13
        },
        bodyColor: '#27272a',
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        borderColor: '#e4e4e7',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(context.parsed.y);
            }
            return label;
          },
          afterBody: function(context) {
            const index = context[0].dataIndex;
            const samples = context[0].dataset.samples[index];
            return `Muestra Observada: ${samples} autos`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#f4f4f5',
          borderColor: '#e4e4e7'
        },
        ticks: {
          color: '#71717a',
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#f4f4f5',
          borderColor: '#e4e4e7'
        },
        ticks: {
          color: '#71717a',
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          callback: function(value) {
            return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0, notation: 'compact' }).format(value);
          }
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Selector Filters */}
      <Card className="glass-card p-7 shadow-sm">
        <CardHeader className="p-0 mb-5 flex flex-row items-center gap-2">
          <TrendingUp size={16} className="text-zinc-800" strokeWidth={2.5} />
          <CardTitle className="text-base font-extrabold text-foreground tracking-tight">
            Análisis de Tendencias Históricas
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1fr_1fr_120px_auto] gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trend-make" className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">Marca</Label>
              <select
                id="trend-make"
                value={selectedMake}
                onChange={handleMakeChange}
                className="flex h-10 w-full rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs text-foreground outline-none cursor-pointer transition-all duration-300 shadow-sm"
                disabled={makes.length === 0}
              >
                <option value="">-- Marca --</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trend-model" className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">Modelo</Label>
              <select
                id="trend-model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs text-foreground outline-none cursor-pointer transition-all duration-300 shadow-sm"
                disabled={!selectedMake || models.length === 0}
              >
                <option value="">-- Modelo --</option>
                {models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trend-year" className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">Año</Label>
              <select
                id="trend-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs text-foreground outline-none cursor-pointer transition-all duration-300 shadow-sm"
              >
                {years.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <Button 
              type="submit" 
              className="h-10 px-5 text-xs font-bold bg-primary text-primary-foreground hover:bg-zinc-800 cursor-pointer rounded-xl shadow-md transition-all duration-150 btn-hover-effect flex items-center gap-1.5"
              disabled={loading || makes.length === 0}
            >
              {loading ? <RefreshCw size={13} className="animate-spin" /> : <TrendingUp size={13} />}
              <span>Graficar</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Render Chart Panel */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-950 text-xs leading-normal shadow-sm">
          <AlertCircle size={16} className="shrink-0 text-rose-500" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {loading && (
        <Card className="glass-card p-12 text-center shadow-sm">
          <RefreshCw size={28} className="text-zinc-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground font-semibold">Obteniendo serie histórica mensual...</p>
        </Card>
      )}

      {!loading && searched && !chartData && !error && (
        <Card className="glass-card border-dashed p-10 text-center shadow-sm">
          <AlertCircle size={28} className="text-zinc-400 mx-auto mb-3" />
          <p className="text-sm font-extrabold text-foreground mb-1">Sin Datos Históricos</p>
          <p className="text-xs text-muted-foreground font-semibold">
            No encontramos registros de meses anteriores para <strong>{selectedMake} {selectedModel} ({selectedYear})</strong>.
          </p>
        </Card>
      )}

      {!loading && searched && chartData && (
        <Card className="glass-card p-7 shadow-sm">
          <CardHeader className="p-0 mb-5 flex flex-wrap justify-between items-center gap-2">
            <div>
              <CardTitle className="text-base font-extrabold text-foreground tracking-tight">
                Serie Mensual Observada
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
                Fluctuación del valor de mercado para el <strong>{selectedMake} {selectedModel} ({selectedYear})</strong>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-zinc-50 border border-zinc-900 shadow-sm">
              <CalendarDays size={11} />
              Historial Activo
            </span>
          </CardHeader>

          <CardContent className="p-0">
            <div className="relative w-full h-[380px]">
              <Line data={chartData} options={options} />
            </div>

            <div className="mt-5 p-4 bg-zinc-50 border border-border/85 rounded-xl text-xs text-muted-foreground leading-relaxed font-semibold shadow-inner">
              💡 <strong>Interpretación:</strong> La línea sólida representa el precio promedio observado, mientras que la línea punteada marca el precio mediana. Pasa el cursor por encima de los puntos para observar el tamaño de muestra de cada período mensual.
            </div>
          </CardContent>
        </Card>
      )}

      {!searched && (
        <Card className="glass-card p-12 text-center flex flex-col items-center shadow-sm">
          <TrendingUp size={36} className="text-zinc-400 mb-3" />
          <h3 className="text-base font-extrabold text-foreground mb-1.5 tracking-tight">
            Análisis de Depreciación Histórica
          </h3>
          <p className="text-xs text-muted-foreground max-w-[440px] leading-relaxed font-semibold">
            Selecciona arriba el auto que deseas estudiar para graficar la variación de precios mes a mes. Esto te permitirá analizar la depreciación histórica y proyectar precios a futuro basándote en la serie observada.
          </p>
        </Card>
      )}

    </div>
  );
}
