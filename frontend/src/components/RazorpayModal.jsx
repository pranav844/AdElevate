import React, { useState } from 'react';
import { initiateRazorpayPayment, verifyRazorpayPayment } from '../services/api';

export default function RazorpayModal({ ad, onClose, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [paymentDone, setPaymentDone] = useState(false);

  // Helper to determine Subscription Plan price (instead of product minPrice)
  const getSubscriptionPrice = () => {
    if (ad.planPrice) return ad.planPrice;
    switch (ad.planType?.toUpperCase()) {
      case 'SILVER':
        return 349;
      case 'GOLD':
        return 699;
      case 'PLATINUM':
        return 1099;
      default:
        return 699;
    }
  };

  const payableAmount = getSubscriptionPrice();

  const handleStartPayment = async () => {
    setLoading(true);
    setStatusMessage('Initiating order with Payment Microservice (Port 8081)...');

    try {
      // 1. Call Payment Microservice to create Razorpay Order
      const orderResponse = await initiateRazorpayPayment({
        adId: ad.adId,
        vendorId: ad.vendorId || 1,
        amount: payableAmount,
      });

      setStatusMessage('Opening Razorpay Sandbox Checkout...');

      // 2. Configure Razorpay SDK Options
      const options = {
        key: orderResponse.razorpayKey || 'rzp_test_TICbc9mn32FEtQ',
        amount: orderResponse.amount * 100, // Amount in paise
        currency: 'INR',
        name: 'AdElevate Platform',
        description: `Subscription Payment for Ad #${ad.adId} - ${ad.title}`,
        order_id: orderResponse.orderId,
        handler: async function (response) {
          // 3. Callback on Payment Success in Razorpay Popup
          setStatusMessage('Payment received! Verifying signature with backend...');
          
          try {
            const verifyResult = await verifyRazorpayPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              adId: ad.adId,
            });

            setPaymentDone(true);
            setStatusMessage('Payment verified successfully! Ad moved to PENDING_APPROVAL 🎉');
            if (onPaymentSuccess) onPaymentSuccess();
          } catch (err) {
            console.error('Verification error:', err);
            setStatusMessage('Verification Warning: Check Payment Service backend console.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: 'Business Vendor',
          email: 'vendor@test.com',
          contact: '9876543210',
        },
        theme: {
          color: '#FF6F61', // Theme Coral
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setStatusMessage('Payment checkout cancelled.');
          },
        },
      };

      // 4. Open Razorpay Window
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error('Razorpay SDK script not loaded. Check index.html!');
      }

    } catch (err) {
      console.error('Payment Error:', err);
      setStatusMessage(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
        >
          ✕
        </button>

        {!paymentDone ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center text-2xl font-bold mb-4">
              💳
            </div>

            <h3 className="text-xl font-extrabold text-navy mb-1">
              Complete Ad Payment
            </h3>
            <p className="text-slate-500 text-xs mb-6">
              Pay via Razorpay Sandbox to activate your advertisement on AdElevate.
            </p>

            {/* Ad Summary Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-6 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Ad ID:</span>
                <span className="font-bold text-navy">#{ad.adId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Title:</span>
                <span className="font-bold text-navy line-clamp-1">{ad.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Type:</span>
                <span className="font-bold text-purple-700">{ad.planType || 'GOLD'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-navy">Total Payable:</span>
                <span className="font-extrabold text-coral">₹{payableAmount}</span>
              </div>
            </div>

            {/* Status Info Message */}
            {statusMessage && (
              <div className="mb-4 text-xs font-medium p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                {statusMessage}
              </div>
            )}

            {/* Start Payment Button */}
            <button
              onClick={handleStartPayment}
              disabled={loading}
              className="w-full py-3.5 bg-coral hover:bg-red-500 text-white font-bold text-sm rounded-xl transition shadow-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay with Razorpay 🚀'}
            </button>
          </div>
        ) : (
          /* Payment Success Celebration State */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
              ✓
            </div>
            <h3 className="text-2xl font-extrabold text-navy mb-2">Payment Successful!</h3>
            <p className="text-slate-600 text-xs mb-6">
              Your payment has been verified. Ad status is now updated to <strong className="text-blue-600">PENDING_APPROVAL</strong>.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-navy text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
            >
              Done & Return to Feed
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
