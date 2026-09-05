'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderService, DetailedOrder } from '@/services/orderService';
import { shiprocketService } from '@/services/shiprocketService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Truck, Ban, CheckCircle2, MapPin, User as UserIcon, Clock, PackageCheck, CreditCard, ShieldCheck, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params?.id);

  const { showToast } = useToast();

  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [carrier, setCarrier] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  const [isCancellingShipment, setIsCancellingShipment] = useState(false);

  const handleCancelShipment = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this shipment parcel in your Shiprocket account?')) return;

    setIsCancellingShipment(true);
    try {
      const res = await shiprocketService.cancelShipment(order.id);
      if (res.success) {
        showToast('Shiprocket shipment & parcel cancelled successfully!', 'success');
        fetchOrderDetails();
      } else {
        showToast(res.message || 'Failed to cancel shipment in Shiprocket.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error cancelling shipment.', 'error');
    } finally {
      setIsCancellingShipment(false);
    }
  };

  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrder(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.message || 'Order not found.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  const handleStatusTransition = async (nextStatus: string) => {
    setIsTransitioning(true);
    try {
      const res = await orderService.updateStatus(orderId, nextStatus);
      if (res.success && res.data) {
        showToast(`Order status updated to ${nextStatus}.`, 'success');
        setOrder(res.data);
      } else {
        showToast(res.message || 'Unable to update order status.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating order status.', 'error');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason) {
      showToast('Please provide a reason for cancellation.', 'error');
      return;
    }
    setIsCancelling(true);
    try {
      const res = await orderService.cancelOrder(orderId, cancelReason);
      if (res.success && res.data) {
        showToast('Order cancelled and reserved stock released.', 'success');
        setCancelModalOpen(false);
        setOrder(res.data);
      } else {
        showToast(res.message || 'Unable to cancel order.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error cancelling order.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrier || !trackingNumber) {
      showToast('Carrier name and tracking number are required.', 'error');
      return;
    }
    setIsSavingTracking(true);
    try {
      const res = await orderService.updateTracking(orderId, carrier, trackingNumber, trackingUrl);
      if (res.success && res.data) {
        showToast('Tracking details updated successfully.', 'success');
        setTrackingModalOpen(false);
        setOrder(res.data);
      } else {
        showToast(res.message || 'Unable to update tracking.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating tracking.', 'error');
    } finally {
      setIsSavingTracking(false);
    }
  };

  const getValidNextStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING':
        return ['CONFIRMED'];
      case 'CONFIRMED':
        return ['PROCESSING'];
      case 'PROCESSING':
        return ['PACKED'];
      case 'PACKED':
        return ['SHIPPED'];
      case 'SHIPPED':
        return ['OUT_FOR_DELIVERY'];
      case 'OUT_FOR_DELIVERY':
        return ['DELIVERED'];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return <ErrorState message={error || 'Order not found.'} onRetry={fetchOrderDetails} />;
  }

  const validNextActions = getValidNextStatuses(order.order_status);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm" className="!p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 font-mono tracking-tight">
                {order.order_number}
              </h1>
              <Badge variant={order.order_status === 'DELIVERED' ? 'success' : 'info'}>
                {order.order_status}
              </Badge>
              <Badge variant={order.payment_status === 'PAID' ? 'success' : 'warning'}>
                {order.payment_status}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {validNextActions.map((next) => (
            <Button
              key={next}
              onClick={() => handleStatusTransition(next)}
              isLoading={isTransitioning}
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Mark as {next}
            </Button>
          ))}

          <Link
            href={`/dashboard/shipping/rate-calculator?order_id=${order.id}&order_number=${order.order_number}&delivery_pincode=${order.shipping_address_snapshot?.pincode || '560041'}&value=${order.total_amount}&cod=${order.payment_status === 'PAID' ? '0' : '1'}`}
          >
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Calculator className="w-4 h-4 text-blue-600" />}
            >
              Calculate Shipping Rates
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setTrackingModalOpen(true)}
            leftIcon={<Truck className="w-4 h-4" />}
          >
            Update Tracking
          </Button>

          {order.order_status !== 'CANCELLED' && order.order_status !== 'DELIVERED' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              leftIcon={<Ban className="w-4 h-4" />}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Financial Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <Card title="Ordered Items Snapshot" subtitle="Historical purchase record">
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-neutral-900">{item.product_name_snapshot}</p>
                    <p className="text-[11px] text-neutral-500">
                      SKU: <span className="font-mono">{item.sku_snapshot}</span> | Size:{' '}
                      <span className="font-bold text-neutral-800">{item.size_snapshot}</span> | Color:{' '}
                      <span className="font-bold text-neutral-800">{item.color_snapshot}</span>
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      ₹{item.unit_price.toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-neutral-900 text-sm">
                    ₹{item.total_amount.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="mt-4 pt-4 border-t border-neutral-200 space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{order.shipping_amount > 0 ? `₹${order.shipping_amount}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span>₹{order.tax_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-black text-neutral-900">
                <span>Total Amount Paid</span>
                <span>₹{order.total_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Card>

          {/* Razorpay Payment Gateway Details Card */}
          <Card title="Razorpay Payment Gateway Details" subtitle="Server-verified transaction record">
            <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#EFE6D8] space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#F5EDE0] pb-2.5">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-[#B38548]" />
                  <span className="font-bold text-neutral-900">Razorpay Live Standard Checkout</span>
                </div>
                <Badge variant={order.payment_status === 'PAID' ? 'success' : 'warning'}>
                  {order.payment_status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Razorpay Order ID</span>
                  <span className="font-mono font-bold text-neutral-900 text-xs">
                    {order.latest_payment?.provider_payment_order_id || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Razorpay Payment ID</span>
                  <span className="font-mono font-bold text-neutral-900 text-xs">
                    {order.latest_payment?.provider_payment_id || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Paid Amount</span>
                  <span className="font-black text-neutral-900 text-xs">
                    ₹{order.total_amount.toLocaleString('en-IN')} (100% Tax Inclusive)
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Payment Timestamp</span>
                  <span className="font-bold text-neutral-800 text-xs">
                    {order.latest_payment?.paid_at
                      ? new Date(order.latest_payment.paid_at).toLocaleString()
                      : new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tracking Info Card (if present) */}
          {(order.carrier || (order as any).shiprocket_shipment_id || (order as any).awb_code) && (
            <Card title="Shiprocket & Logistics Information" subtitle="Dispatch courier tracking & shipment IDs">
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-neutral-200">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Courier Partner</span>
                    <span className="font-bold text-neutral-900">{(order as any).courier_name || order.carrier || 'Shiprocket Partner'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Shipment Status</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                      {(order as any).shipment_status || order.order_status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-neutral-700">
                  {(order as any).shiprocket_order_id && (
                    <p>Shiprocket Order ID: <span className="font-mono font-bold text-neutral-900">{(order as any).shiprocket_order_id}</span></p>
                  )}
                  {(order as any).shiprocket_shipment_id && (
                    <p>Shiprocket Shipment ID: <span className="font-mono font-bold text-neutral-900">{(order as any).shiprocket_shipment_id}</span></p>
                  )}
                  <p>Tracking AWB #: <span className="font-mono font-bold text-neutral-900">{(order as any).awb_code || order.tracking_number || 'Pending'}</span></p>
                </div>

                <div className="pt-2.5 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2">
                  {(order.tracking_url || (order as any).awb_code) && (
                    <a
                      href={order.tracking_url || `https://shiprocket.co/tracking/${(order as any).awb_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-black font-bold underline hover:text-neutral-700 text-xs"
                    >
                      <span>Track Shipment on Shiprocket</span>
                      <Truck className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {order.order_status !== 'CANCELLED' && (
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={isCancellingShipment}
                      onClick={handleCancelShipment}
                      className="!py-1 !px-2.5 text-xs"
                    >
                      Cancel Shiprocket Parcel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Order Status History Timeline */}
          <Card title="Order Status Audit Timeline" subtitle="Historical state transition logs">
            <div className="space-y-3 pt-1">
              {order.status_history && order.status_history.length > 0 ? (
                order.status_history.map((h) => (
                  <div key={h.id} className="flex items-start space-x-3 text-xs border-l-2 border-neutral-200 pl-3">
                    <Clock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-neutral-900">
                        {h.previous_status ? `${h.previous_status} → ` : ''}
                        <span className="text-black uppercase">{h.new_status}</span>
                      </p>
                      <p className="text-[11px] text-neutral-500">{h.comment}</p>
                      <p className="text-[10px] text-neutral-400">
                        {new Date(h.created_at).toLocaleString()} {h.changer ? `by ${h.changer.name}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-400">No status history recorded yet.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Customer & Address Snapshots */}
        <div className="space-y-6">
          {/* Customer Profile */}
          <Card title="Customer Profile" subtitle="Account details">
            <div className="flex items-center space-x-3 text-xs">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-700">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-neutral-900">{order.user?.name || order.shipping_address_snapshot?.name}</p>
                <p className="text-neutral-500">{order.user?.email}</p>
                <p className="text-neutral-500">{order.user?.phone || order.shipping_address_snapshot?.phone}</p>
              </div>
            </div>
          </Card>

          {/* Shipping Address Snapshot */}
          <Card title="Shipping Address Snapshot" subtitle="Historical delivery address">
            <div className="flex items-start space-x-2.5 text-xs text-neutral-700">
              <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900">{order.shipping_address_snapshot?.name}</p>
                <p>{order.shipping_address_snapshot?.address}</p>
                <p>
                  {order.shipping_address_snapshot?.city}, {order.shipping_address_snapshot?.state} -{' '}
                  {order.shipping_address_snapshot?.pincode}
                </p>
                <p className="font-semibold text-neutral-500 mt-1">
                  Phone: {order.shipping_address_snapshot?.phone}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Shipping Tracking Modal */}
      <Modal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        title="Update Shipping Tracking"
      >
        <form onSubmit={handleSaveTracking} className="space-y-4">
          <Input
            label="Logistics Carrier Name"
            placeholder="e.g. Delhivery, BlueDart, Bluedart, Xpressbees"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            required
          />

          <Input
            label="Tracking AWB Number"
            placeholder="e.g. AWB9876543210"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
          />

          <Input
            label="Tracking URL (Optional)"
            placeholder="https://track.delhivery.com/..."
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
          />

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setTrackingModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSavingTracking} size="sm">
              Save Tracking
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order & Release Inventory"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-600">
            Cancelling order <span className="font-mono font-bold text-neutral-900">{order.order_number}</span> will automatically release reserved stock back into available inventory.
          </p>

          <Input
            label="Reason for Cancellation"
            placeholder="e.g. Customer requested cancellation before dispatch"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          />

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button variant="danger" size="sm" onClick={handleCancelConfirm} isLoading={isCancelling}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
