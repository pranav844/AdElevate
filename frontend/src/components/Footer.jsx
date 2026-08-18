import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-navy text-slate-400 py-12 border-t border-slate-800" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-coral flex items-center justify-center font-bold text-white text-lg">
                A
              </div>
              <span className="font-extrabold text-lg text-white">
                AdEle<span className="text-coral">vate</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's trusted business promotion and advertisement platform. Connecting verified vendors with local customers.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#featured" className="hover:text-white transition">Browse Ads</a></li>
              <li><a href="#categories" className="hover:text-white transition">Top Categories</a></li>
              <li><a href="#plans" className="hover:text-white transition">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Support & Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Contact Support</h4>
            <p className="text-sm">Email: support@adelevate.in</p>
            <p className="text-sm mt-1">Phone: +91 98765 43210</p>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © 2026 AdElevate Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
