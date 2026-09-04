'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { shiprocketService, CourierOption, RateCalculationResult } from '@/services/shiprocketService';
import {
  Calculator,
  Truck,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  DollarSign,
  ArrowLeft,
  Package,
  Layers,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

function RateCalculatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderIdParam = searchParams.get('order_id');
  const orderNumberParam = searchParams.get('order_number');

  // Form State
  const [shipmentType, setShipmentType] = useState<'Domestic' | 'International'>('Domestic');
  const [pickupPincode, setPickupPincode] = useState('570019');
  const [deliveryPincode, setDeliveryPincode] = useState(searchParams.get('delivery_pincode') || '560041');
  const [actualWeight, setActualWeight] = useState(parseFloat(searchParams.get('weight') || '1.0'));
  const [length, setLength] = useState(parseFloat(searchParams.get('length') || '15'));
  const [breadth, setBreadth] = useState(parseFloat(searchParams.get('breadth') || '10'));
  const [height, setHeight] = useState(parseFloat(searchParams.get('height') || '5'));
  const [paymentType, setPaymentType] = useState<'Prepaid' | 'COD'>(searchParams.get('cod') === '1' ? 'COD' : 'Prepaid');
  const [shipmentValue, setShipmentValue] = useState(parseFloat(searchParams.get('value') || '2000'));
  const [isDangerous, setIsDangerous] = useState(false);

  // Results & UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RateCalculationResult | null>(null);
  const [sortBy, setSortBy] = useState<'cheapest' | 'fastest' | 'recommended'>('cheapest');

  const [selectedCourier, setSelectedCourier] = useState<CourierOption | null>(null);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Volumetric & Chargeable Weight Calculations
  const volumetricWeight = useMemo(() => {
    if (length > 0 && breadth > 0 && height > 0) {
      return parseFloat(((length * breadth * height) / 5000).toFixed(2));
    }
    return 0;
  }, [length, breadth, height]);

  const chargeableWeight = useMemo(() => {
    return Math.max(actualWeight || 0, volumetricWeight || 0);
  }, [actualWeight, volumetricWeight]);

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanPin = deliveryPincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setError('Please enter a valid 6-digit Indian delivery PIN code.');
      return;
    }

    if (actualWeight <= 0) {
      setError('Actual weight must be greater than 0 KG.');
      return;
    }

    setIsLoading(true);
    setSelectedCourier(null);

    try {
      const res = await shiprocketService.calculateRates({
        pickup_postcode: pickupPincode,
        delivery_postcode: cleanPin,
        weight: chargeableWeight,
        declared_value: shipmentValue,
        cod: paymentType === 'COD',
        length: length > 0 ? length : undefined,
        breadth: breadth > 0 ? breadth : undefined,
        height: height > 0 ? height : undefined,
        is_dangerous: isDangerous,
      });

      if (res.success && res.data) {
        setResults(res.data);
      } else {
        setError(res.message || 'Failed to fetch courier rates from Shiprocket.');
        setResults(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to Shiprocket API.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDeliveryPincode('560041');
    setPickupPincode('570019');
    setActualWeight(1.0);
    setLength(15);
    setBreadth(10);
    setHeight(5);
    setPaymentType('Prepaid');
    setShipmentValue(2000);
    setIsDangerous(false);
    setResults(null);
    setError(null);
    setSelectedCourier(null);
  };

  // Sort Couriers based on selected criteria
  const sortedCouriers = useMemo(() => {
    if (!results?.available_couriers) return [];
    const list = [...results.available_couriers];

    if (sortBy === 'cheapest') {
      return list.sort((a, b) => a.total_shipping_charge - b.total_shipping_charge);
    } else if (sortBy === 'fastest') {
      return list.sort((a, b) => {
        const daysA = parseInt(a.estimated_days) || 99;
        const daysB = parseInt(b.estimated_days) || 99;
        return daysA - daysB;
      });
    } else if (sortBy === 'recommended') {
      return list.sort((a, b) => b.recommendation_score - a.recommendation_score);
    }
    return list;
  }, [results, sortBy]);

  const cheapestCourierId = useMemo(() => {
    if (!results?.available_couriers || results.available_couriers.length === 0) return null;
    const sorted = [...results.available_couriers].sort((a, b) => a.total_shipping_charge - b.total_shipping_charge);
    return sorted[0].courier_company_id;
  }, [results]);

  const fastestCourierId = useMemo(() => {
    if (!results?.available_couriers || results.available_couriers.length === 0) return null;
    const sorted = [...results.available_couriers].sort((a, b) => (parseInt(a.estimated_days) || 99) - (parseInt(b.estimated_days) || 99));
    return sorted[0].courier_company_id;
  }, [results]);

  const handleCreateShipmentForOrder = async (courier: CourierOption) => {
    if (!orderIdParam) return;
    setIsCreatingShipment(true);
    try {
      const res = await shiprocketService.createShipment(parseInt(orderIdParam), {
        courier_id: courier.courier_company_id,
        courier_name: courier.courier_name,
        pickup_location: 'Primary',
        weight: chargeableWeight,
        length,
        breadth,
        height,
      });

      if (res.success) {
        setToastMessage(`Shipment created with ${courier.courier_name}! Redirecting to order...`);
        setTimeout(() => {
          router.push(`/dashboard/orders/${orderIdParam}`);
        }, 1500);
      } else {
        alert(res.message || 'Failed to create shipment.');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating shipment.');
    } finally {
      setIsCreatingShipment(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {orderIdParam && (
            <Link href={`/dashboard/orders/${orderIdParam}`}>
              <Button variant="outline" size="sm" className="!p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Calculator className="w-6 h-6 text-black" />
              <span>Shiprocket Rate Calculator</span>
            </h1>
            <p className="text-xs text-neutral-500">
              {orderNumberParam
                ? `Calculating rates for Order #${orderNumberParam}`
                : 'Compare live courier partner shipping rates, ETAs, and volumetric charges'}
            </p>
          </div>
        </div>

        <Link href="/dashboard/shipping">
          <Button variant="outline" size="sm" leftIcon={<Truck className="w-4 h-4" />}>
            Shipping Settings
          </Button>
        </Link>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Shipment Parameters" subtitle="Configure weight, dimensions, and destinations">
            <form onSubmit={handleCalculate} className="space-y-4 text-xs">
              
              {/* Shipment Type Selector */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 block">Shipment Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShipmentType('Domestic')}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                      shipmentType === 'Domestic'
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    Domestic (India)
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-2 px-3 rounded-xl font-bold border bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed text-center"
                    title="International Shipping Coming Soon"
                  >
                    International (Soon)
                  </button>
                </div>
              </div>

              {/* Pickup & Delivery Pincodes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Pickup PIN Code</label>
                  <input
                    type="text"
                    required
                    value={pickupPincode}
                    onChange={(e) => setPickupPincode(e.target.value)}
                    placeholder="570019"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Delivery PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value)}
                    placeholder="560041"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono font-bold"
                  />
                </div>
              </div>

              {/* Actual Weight Input */}
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Actual Package Weight (KG) *</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={actualWeight}
                    onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono font-bold pr-12"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-neutral-400">KG</span>
                </div>
              </div>

              {/* Dimensions (L x B x H) */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 block">Package Dimensions (CM) - Optional</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Length</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={length || ''}
                      onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                      placeholder="15"
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Breadth</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={breadth || ''}
                      onChange={(e) => setBreadth(parseFloat(e.target.value) || 0)}
                      placeholder="10"
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Height</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={height || ''}
                      onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                      placeholder="5"
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Weight Breakdown Summary Card */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Actual Weight:</span>
                  <span className="font-mono font-bold text-neutral-900">{actualWeight} KG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Volumetric Weight ((L×B×H)/5000):</span>
                  <span className="font-mono font-bold text-neutral-900">{volumetricWeight} KG</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-200 text-xs font-bold text-black">
                  <span>Chargeable/Applicable Weight:</span>
                  <span className="font-mono text-emerald-700 font-black">{chargeableWeight} KG</span>
                </div>
              </div>

              {/* Payment Mode & Shipment Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Payment Mode</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-bold bg-white focus:outline-none focus:border-black"
                  >
                    <option value="Prepaid">Prepaid</option>
                    <option value="COD">COD (Cash On Delivery)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Shipment Value (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={shipmentValue}
                    onChange={(e) => setShipmentValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono font-bold focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Dangerous Goods Toggle */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="dangerous"
                  checked={isDangerous}
                  onChange={(e) => setIsDangerous(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                />
                <label htmlFor="dangerous" className="text-xs font-bold text-neutral-700 cursor-pointer">
                  Contains Dangerous / Flammable Goods
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset
                </Button>
                <Button type="submit" isLoading={isLoading} className="flex-[2]" leftIcon={<Calculator className="w-4 h-4" />}>
                  Calculate Rates
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Results Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!results && !isLoading && (
            <Card>
              <div className="py-16 text-center text-neutral-400 space-y-3">
                <Truck className="w-12 h-12 mx-auto text-neutral-300 stroke-[1.5]" />
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-sm font-bold text-neutral-700">Ready to Calculate Shipping Rates</h3>
                  <p className="text-xs text-neutral-400">
                    Enter the delivery PIN code and package dimensions to compare live courier partner options.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {isLoading && (
            <Card>
              <div className="py-16 text-center text-neutral-600 space-y-3">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold">Querying Shiprocket API for courier partner rates...</p>
              </div>
            </Card>
          )}

          {results && !isLoading && (
            <div className="space-y-4">
              
              {/* Destination & Order Snapshot Card */}
              <Card title="Rate Calculation Results" subtitle="Verified via official Shiprocket API">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-[#FDFBF7] rounded-xl border border-[#EFE6D8] text-xs">
                  
                  {/* Route Summary */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-neutral-900 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-[#B38548]" />
                      <span>Route Summary</span>
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      From: <span className="font-bold text-neutral-900">{results.pickup_location.pincode} ({results.pickup_location.city})</span>
                    </p>
                    <p className="text-[11px] text-neutral-600">
                      To: <span className="font-bold text-neutral-900">{results.delivery_location.pincode} ({results.delivery_location.city})</span>
                    </p>
                  </div>

                  {/* Charge Snapshot */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-neutral-900 font-bold">
                      <Package className="w-3.5 h-3.5 text-[#B38548]" />
                      <span>Package Parameters</span>
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      Chargeable Weight: <span className="font-bold font-mono text-neutral-900">{results.shipment_details.applicable_weight_kg} KG</span>
                    </p>
                    <p className="text-[11px] text-neutral-600">
                      Value: <span className="font-bold text-neutral-900">₹{results.shipment_details.declared_value_inr}</span> ({results.shipment_details.payment_mode})
                    </p>
                  </div>

                </div>
              </Card>

              {/* Sorting Tabs & Courier Comparison Table */}
              <Card title="Available Courier Partners" subtitle={`${sortedCouriers.length} courier options serviceable`}>
                
                {/* Sort Tabs */}
                <div className="flex border-b border-neutral-100 bg-neutral-50 p-1 gap-1 text-xs mb-4 rounded-xl">
                  <button
                    onClick={() => setSortBy('cheapest')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      sortBy === 'cheapest'
                        ? 'bg-white text-black shadow-2xs border border-neutral-200'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cheapest</span>
                  </button>

                  <button
                    onClick={() => setSortBy('fastest')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      sortBy === 'fastest'
                        ? 'bg-white text-black shadow-2xs border border-neutral-200'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Fastest Delivery</span>
                  </button>

                  <button
                    onClick={() => setSortBy('recommended')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      sortBy === 'recommended'
                        ? 'bg-white text-black shadow-2xs border border-neutral-200'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Recommended</span>
                  </button>
                </div>

                {/* Couriers Table */}
                {sortedCouriers.length === 0 ? (
                  <div className="py-10 text-center text-xs text-neutral-400">
                    No serviceable couriers found for PIN {results.delivery_location.pincode}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Courier Partner</th>
                          <th className="py-2.5 px-3">Estimated Delivery</th>
                          <th className="py-2.5 px-3">Charge Weight</th>
                          <th className="py-2.5 px-3">Rate (INR)</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-medium">
                        {sortedCouriers.map((c) => {
                          const isCheapest = c.courier_company_id === cheapestCourierId;
                          const isFastest = c.courier_company_id === fastestCourierId;
                          const isSelected = selectedCourier?.courier_company_id === c.courier_company_id;

                          return (
                            <tr
                              key={c.courier_company_id}
                              className={`hover:bg-neutral-50 transition-colors ${
                                isSelected ? 'bg-amber-50/40' : ''
                              }`}
                            >
                              <td className="py-3 px-3">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-neutral-900">{c.courier_name}</span>
                                    <Badge variant="info">
                                      {c.courier_type}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {isCheapest && (
                                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                                        CHEAPEST
                                      </span>
                                    )}
                                    {isFastest && (
                                      <span className="bg-blue-100 text-blue-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                                        FASTEST
                                      </span>
                                    )}
                                    <span className="text-[10px] text-neutral-400">★ {c.courier_rating}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <p className="font-bold text-neutral-800">{c.estimated_days}</p>
                              </td>

                              <td className="py-3 px-3 font-mono font-bold text-neutral-700">
                                {c.chargeable_weight} KG
                              </td>

                              <td className="py-3 px-3">
                                <p className="font-black text-sm text-neutral-900">
                                  ₹{c.total_shipping_charge.toFixed(2)}
                                </p>
                                {c.cod_charge > 0 && (
                                  <p className="text-[10px] text-neutral-400">Includes ₹{c.cod_charge} COD Fee</p>
                                )}
                              </td>

                              <td className="py-3 px-3 text-right">
                                {orderIdParam ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleCreateShipmentForOrder(c)}
                                    isLoading={isCreatingShipment}
                                    className="!py-1.5 !px-3 text-xs"
                                  >
                                    Select & Ship
                                  </Button>
                                ) : (
                                  <button
                                    onClick={() => setSelectedCourier(c)}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                      isSelected
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
                                    }`}
                                  >
                                    {isSelected ? 'Selected' : 'Select Partner'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function RateCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-neutral-400">Loading Shipping Rate Calculator...</div>
      }
    >
      <RateCalculatorContent />
    </Suspense>
  );
}
