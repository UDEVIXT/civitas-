import React, { useState, useCallback, useEffect, useRef } from "react";
import { Map, MapControls, MapMarker, MarkerContent } from "@/components/ui/map";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { FieldError as CustomFieldError } from '@/components/ui/field-error';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Locate, MapPin } from "lucide-react";
import MapLibreGL from "maplibre-gl";

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

interface LocationPickerProps {
  address?: string;
  isAddressLoading?: boolean;
  error?: string;
  onMapClick: (lng: number, lat: number) => void;
  onLocationSelect?: (coords: { longitude: number; latitude: number }) => void;
  selectedCoords?: { longitude: number; latitude: number };
}

export function LocationPicker({ 
  address, 
  isAddressLoading, 
  error, 
  onMapClick, 
  onLocationSelect,
  selectedCoords 
}: LocationPickerProps) {
  const [manualAddress, setManualAddress] = useState("");
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(selectedCoords || null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const mapRef = useRef<MapLibreGL.Map | null>(null);

  const handleLocationSelect = useCallback((coords: { longitude: number; latitude: number }) => {
    setCurrentCoords(coords);
    onLocationSelect?.(coords);
  }, [onLocationSelect]);

  useEffect(() => {
    if (selectedCoords) {
      setCurrentCoords(selectedCoords);
    }
  }, [selectedCoords]);

  // Move map when currentCoords change
  useEffect(() => {
    if (currentCoords && mapRef.current) {
      // Small delay to ensure map is fully loaded
      setTimeout(() => {
        if (mapRef.current && !mapRef.current.isMoving()) {
          mapRef.current.flyTo({
            center: [currentCoords.longitude, currentCoords.latitude],
            zoom: 14,
            duration: 1000
          });
        }
      }, 100);
    }
  }, [currentCoords]);

  useEffect(() => {
    if (manualAddress.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [manualAddress]);

  const handleAddressSearch = async (suggestion?: AddressSuggestion) => {
    const coords = suggestion ? {
      longitude: parseFloat(suggestion.lon),
      latitude: parseFloat(suggestion.lat)
    } : null;

    if (coords && suggestion) {
      handleLocationSelect(coords);
      setManualAddress(suggestion.display_name);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (manualAddress.trim()) {
      setIsSearchingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          const coords = {
            longitude: parseFloat(result.lon),
            latitude: parseFloat(result.lat)
          };
          handleLocationSelect(coords);
          setManualAddress(result.display_name);
        }
      } catch (error) {
        console.error("Error searching address:", error);
      } finally {
        setIsSearchingAddress(false);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    handleAddressSearch(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddressSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          handleAddressSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events to fire
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <Field>
      <FieldLabel>Ubicación de tu reporte</FieldLabel>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const coords = {
                    longitude: pos.coords.longitude,
                    latitude: pos.coords.latitude
                  };
                  handleLocationSelect(coords);
                },
                (error) => {
                  console.error("Error getting location:", error);
                }
              );
            }
          }}
          className="flex items-center gap-2 w-full cursor-pointer"
        >
          <Locate className="size-4" />
          Usar ubicación actual
        </Button>
      </div>

      <div className="relative mb-3">
        <div className="flex gap-2">
          <Input
            placeholder="Ingresar dirección manualmente"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAddressSearch()}
            disabled={isSearchingAddress || !manualAddress.trim()}
            className="flex items-center gap-2"
          >
            <Search className="size-4" />
            {isSearchingAddress ? "Buscando..." : "Buscar"}
          </Button>
        </div>
        
        {/* Autocomplete suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id}
                className={`px-3 py-2 cursor-pointer flex items-start gap-2 hover:bg-muted transition-colors ${
                  index === selectedSuggestionIndex ? 'bg-muted' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{suggestion.display_name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <Card className="h-52 p-0 overflow-hidden relative">
        <Map
          ref={mapRef}
          center={currentCoords ? [currentCoords.longitude, currentCoords.latitude] : [-0.1276, 51.5074]}
          zoom={currentCoords ? 14 : 11}
          onClick={onMapClick}
        >
          <MapControls showLocate={true} onLocate={handleLocationSelect} />
          {currentCoords && (
            <MapMarker longitude={currentCoords.longitude} latitude={currentCoords.latitude}>
              <MarkerContent />
            </MapMarker>
          )}
        </Map>
      </Card>
      
      <p className={`text-sm ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
        {isAddressLoading ? "Cargando dirección..." : "Ubicación seleccionada: " + (address || "Sin dirección")}
      </p>
      <CustomFieldError className="text-xs mt-0" error={error} />
    </Field>
  );
}
